<?php
// --- 新的、更健壮的安全与CORS设置 ---

// 【第1步】: 定义信任的来源和我们的秘密暗号
$allowed_web_origins = [
    'https://gewe.dpdns.org',
    // 'http://localhost:5173'
];
$app_secret_header = 'X-App-Secret';
$app_secret_value = 'Xla2M666amiV9QehKwOTDJb8uvkozemr';

$is_request_allowed = false;
$request_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$server_secret_key = 'HTTP_' . strtoupper(str_replace('-', '_', $app_secret_header));
$request_secret = isset($_SERVER[$server_secret_key]) ? $_SERVER[$server_secret_key] : '';

// 【第2步】: 安全校验逻辑
if (in_array($request_origin, $allowed_web_origins)) {
    $is_request_allowed = true;
} elseif ($request_secret === $app_secret_value) {
    $is_request_allowed = true;
    if (empty($request_origin)) {
        $request_origin = 'capacitor://localhost';
    }
}

// 【第3步】: 根据校验结果设置响应头
if (!$is_request_allowed) {
    header("HTTP/1.1 403 Forbidden");
    exit('Forbidden: Invalid origin or missing/incorrect secret.');
}

header("Access-Control-Allow-Origin: " . $request_origin);
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, " . $app_secret_header);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// --- 你的API业务逻辑从这里开始 ---
header("Content-Type: application/json; charset=UTF-8");

function send_response($success, $message, $data = null) {
    http_response_code($success ? 201 : 400);
    $response = ["success" => $success, "message" => $message];
    if ($data) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    send_response(false, "无效的请求格式");
}

$phone = $input['phone'] ?? '';
$password = $input['password'] ?? '';

// 【核心修正】: 将 'd' 修改为 'd'，以正确匹配数字
if (!preg_match('/^1d{10}$/', $phone)) {
    send_response(false, "手机号格式不正确，请输入11位数字");
}
if (strlen($password) < 6) {
    send_response(false, "密码至少需要6位");
}

// 数据库操作
try {
    // 确保db目录存在
    if (!is_dir(__DIR__ . '/../db')) {
        mkdir(__DIR__ . '/../db', 0755, true);
    }
    $db = new SQLite3(__DIR__ . '/../db/user.db');
    $db->exec('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, phone TEXT UNIQUE, password TEXT, points INTEGER DEFAULT 0)');
    
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE phone = :phone");
    $stmt->bindValue(':phone', $phone, SQLITE3_TEXT);
    $result = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
    if ($result['count'] > 0) {
        send_response(false, "该手机号已被注册");
    }

    do {
        $id = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE id = :id");
        $stmt->bindValue(':id', $id, SQLITE3_TEXT);
        $idExists = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
    } while ($idExists['count'] > 0);

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $initial_points = 1000;
    
    $stmt = $db->prepare("INSERT INTO users (id, phone, password, points) VALUES (:id, :phone, :password, :points)");
    $stmt->bindValue(':id', $id, SQLITE3_TEXT);
    $stmt->bindValue(':phone', $phone, SQLITE3_TEXT);
    $stmt->bindValue(':password', $hash, SQLITE3_TEXT);
    $stmt->bindValue(':points', $initial_points, SQLITE3_INTEGER);
    
    if ($stmt->execute()) {
        $newUser = [ "id" => $id, "phone" => $phone, "points" => $initial_points ];
        send_response(true, "注册成功", $newUser);
    } else {
        send_response(false, "注册失败，请稍后再试");
    }

} catch (Exception $e) {
    // 在生产环境中，最好不要直接暴露 $e->getMessage()
    error_log("Database Error: " . $e->getMessage()); // 记录详细错误到服务器日志
    send_response(false, "服务器内部错误");
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?>