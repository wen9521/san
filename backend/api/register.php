<?php
// 允许所有来源的请求，用于调试
$origin = '*';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    http_response_code(200);
    exit;
}

header("Access-Control-Allow-Origin: " . $origin);
header("Content-Type: application/json; charset=UTF-8");

// ... (剩余代码保持不变)
// 响应函数
function send_response($success, $message, $data = null) {
    http_response_code($success ? 201 : 400); // 201 for created
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

if (!preg_match('/^1\d{10}$/', $phone)) {
    send_response(false, "手机号格式不正确，请输入11位数字");
}
if (strlen($password) < 6) {
    send_response(false, "密码至少需要6位");
}

// 数据库操作
try {
    $db = new SQLite3(__DIR__ . '/../db/user.db');
    // 确保用户表存在
    $db->exec('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, phone TEXT UNIQUE, password TEXT, points INTEGER DEFAULT 0)');
    
    // 检查手机号是否已存在
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE phone = :phone");
    $stmt->bindValue(':phone', $phone, SQLITE3_TEXT);
    $result = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
    if ($result['count'] > 0) {
        send_response(false, "该手机号已被注册");
    }

    // 生成唯一的4位数字ID
    do {
        $id = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE id = :id");
        $stmt->bindValue(':id', $id, SQLITE3_TEXT);
        $idExists = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
    } while ($idExists['count'] > 0);

    // 创建新用户
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $initial_points = 1000;
    
    $stmt = $db->prepare("INSERT INTO users (id, phone, password, points) VALUES (:id, :phone, :password, :points)");
    $stmt->bindValue(':id', $id, SQLITE3_TEXT);
    $stmt->bindValue(':phone', $phone, SQLITE3_TEXT);
    $stmt->bindValue(':password', $hash, SQLITE3_TEXT);
    $stmt->bindValue(':points', $initial_points, SQLITE3_INTEGER);
    
    if ($stmt->execute()) {
        $newUser = [
            "id" => $id,
            "phone" => $phone,
            "points" => $initial_points
        ];
        send_response(true, "注册成功", $newUser);
    } else {
        send_response(false, "注册失败，请稍后再试");
    }

} catch (Exception $e) {
    send_response(false, "服务器内部错误: " . $e->getMessage());
} finally {
    if (isset($db)) {
        $db->close();
    }
}
