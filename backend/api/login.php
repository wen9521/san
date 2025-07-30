<?php
// --- 新的、更健壮的安全与CORS设置 ---

// 【第1步】: 定义信任的来源和我们的秘密暗号
$allowed_web_origins = [
    'https://gewe.dpdns.org',
    // 'http://localhost:5173' // 如果有本地开发环境，可以取消此行注释
];
$app_secret_header = 'X-App-Secret';
// 已更新为更复杂的密钥
$app_secret_value = 'Xla2M666amiV9QehKwOTDJb8uvkozemr'; 

$is_request_allowed = false;
$request_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
// PHP会自动将请求头中的'-'转换为'_'并加上'HTTP_'前缀
$server_secret_key = 'HTTP_' . strtoupper(str_replace('-', '_', $app_secret_header));
$request_secret = isset($_SERVER[$server_secret_key]) ? $_SERVER[$server_secret_key] : '';


// 【第2步】: 安全校验逻辑
// 规则：要么是来自我们白名单里的Web网站，要么是能提供正确“暗号”的App
if (in_array($request_origin, $allowed_web_origins)) {
    // 这是来自我们信任的网站的请求
    $is_request_allowed = true;
} elseif ($request_secret === $app_secret_value) {
    // 这不是来自我们信任的网站，但它知道“暗号”，我们认为是来自我们自己的App
    $is_request_allowed = true;
    // 对于来自App的请求，其Origin可能是 'capacitor://localhost'
    // 如果Origin为空，我们默认设置为App的来源以确保CORS头部正确
    if (empty($request_origin)) {
        $request_origin = 'capacitor://localhost'; 
    }
}


// 【第3步】: 根据校验结果设置响应头
if (!$is_request_allowed) {
    // 如果请求既不来自白名单网站，也不知道暗号，则直接拒绝
    header("HTTP/1.1 403 Forbidden");
    exit('Forbidden: Invalid origin or missing/incorrect secret.');
}

// 请求合法，我们为其设置CORS响应头
header("Access-Control-Allow-Origin: " . $request_origin);
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// 【重要】: 必须允许我们自定义的暗号请求头
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, " . $app_secret_header);

// 处理CORS预检请求
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// --- 你的API业务逻辑从这里开始 ---
header("Content-Type: application/json; charset=UTF-8");

// 响应函数
function send_response($success, $message, $data = null) {
    http_response_code($success ? 200 : 400);
    $response = ["success" => $success, "message" => $message];
    if ($data) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit;
}

// 接收和校验输入
$input = json_decode(file_get_contents("php://input"), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    send_response(false, "无效的请求格式");
}

$phone = $input['phone'] ?? '';
$password = $input['password'] ?? '';

if (empty($phone) || empty($password)) {
    send_response(false, "手机号和密码不能为空");
}

// 数据库操作
try {
    $db = new SQLite3(__DIR__ . '/../db/user.db');
    // 确保用户表存在
    $db->exec('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, phone TEXT UNIQUE, password TEXT, points INTEGER DEFAULT 0)');

    $stmt = $db->prepare("SELECT id, phone, password, points FROM users WHERE phone = :phone");
    $stmt->bindValue(':phone', $phone, SQLITE3_TEXT);
    
    $result = $stmt->execute();
    $user = $result->fetchArray(SQLITE3_ASSOC);

    if (!$user) {
        send_response(false, "用户不存在");
    }

    if (password_verify($password, $user['password'])) {
        unset($user['password']); // 不返回密码哈希
        send_response(true, "登录成功", $user);
    } else {
        send_response(false, "密码错误");
    }

} catch (Exception $e) {
    // 在生产环境中应记录错误日志，而不是直接暴露错误信息
    send_response(false, "服务器内部错误: " . $e->getMessage());
} finally {
    if (isset($db)) {
        $db->close();
    }
}
