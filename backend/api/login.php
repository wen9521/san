<?php
$origin = 'https://gewe.dpdns.org';

// 解决CORS预检请求问题
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    http_response_code(200);
    exit;
}

header("Access-Control-Allow-Origin: " . $origin);
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
