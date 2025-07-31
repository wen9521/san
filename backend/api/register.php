<?php
/**
 * 完整的 CORS 安全示例 + 用户注册接口 (最终修复版)
 */

// 1. 环境与白名单配置
$allowed_origins = [
    'https://9525.ip-ddns.com',
    'https://gewe.dpdns.org',
    'capacitor://localhost',
    'http://localhost',
    'https://localhost',
    'https://wen9521.github.io'
];

// 2. 日志记录
$request_origin = $_SERVER['HTTP_ORIGIN'] ?? 'not_set';
file_put_contents('/tmp/origin.log', date('c') . " | {$request_origin} | " . ($_SERVER['REQUEST_METHOD'] ?? 'NO_METHOD') . " " . ($_SERVER['REQUEST_URI'] ?? 'NO_URI') . " | " . ($_SERVER['HTTP_USER_AGENT'] ?? 'NO_UA') . "
", FILE_APPEND);

// 3. CORS 验证与头设置【最终修复方案】
if (in_array($request_origin, $allowed_origins, true)) {
    // 强制替换任何服务器软件可能已设置的同名头
    header("Access-Control-Allow-Origin: {$request_origin}", true);
    header('Access-Control-Allow-Credentials: true', true);
    header('Access-Control-Allow-Methods: POST, OPTIONS', true);
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-App-Secret', true);
    header('Access-Control-Max-Age: 86400', true);
    header('Vary: Origin', true);

    // 对 OPTIONS 预检请求直接返回 200
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
} else {
    // 如果来源不被允许，返回 403
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Forbidden: Origin not allowed.', 'your_origin' => $request_origin], JSON_UNESCAPED_UNICODE);
    exit;
}

// 4. 只允许 POST 方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => '仅允许 POST 请求'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 5. 引入数据库连接
require_once __DIR__ . '/../db_connect.php';

// 6. 解析并验证输入
header('Content-Type: application/json; charset=utf-8');
$input    = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '用户名和密码不能为空'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => '密码长度不能少于6位'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // 7. 检查用户名是否已存在
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => '用户名已存在'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 8. 哈希密码
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // 9. 插入新用户
    $initial_points = 1000;
    $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, points) VALUES (?, ?, ?)');
    $stmt->execute([$username, $password_hash, $initial_points]);
    $user_id = $pdo->lastInsertId();

    // 10. 返回结果
    echo json_encode([
        'success' => true,
        'message' => '注册成功',
        'data'    => ['id' => (int) $user_id, 'username' => $username, 'points' => $initial_points]
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => '数据库错误: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
