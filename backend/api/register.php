<?php
/**
 * 完整的 CORS 安全示例 + 用户注册接口
 */

// 1. 环境与白名单配置
$devMode = false;  // 生产环境请设为 false
$allowed_origins = [
    'https://9525.ip-ddns.com',
    'https://gewe.dpdns.org',
    'capacitor://localhost',
    'http://localhost'
];

// 2. 获取并（可选）记录 Origin
$request_origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($devMode) {
    error_log('Incoming Origin: ' . ($request_origin ?: 'empty'));
}

// 3. 验证 Origin
$is_allowed = in_array($request_origin, $allowed_origins, true);

// 支持 file:// 前缀（旧版 WebView）
if (! $is_allowed && strpos($request_origin, 'file://') === 0) {
    $is_allowed     = true;
    $request_origin = 'file://';
}

// null/empty Origin 仅开发模式放行
if ($devMode && ($request_origin === 'null' || $request_origin === '')) {
    $is_allowed     = true;
    $request_origin = 'capacitor://localhost';
}

// 4. 防止缓存误用
header('Vary: Origin');

// 5. 若不被允许，返回 403
if (! $is_allowed) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error'       => 'Forbidden: Origin not allowed.',
        'your_origin' => $request_origin
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 6. 输出 CORS 头
header("Access-Control-Allow-Origin: {$request_origin}");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-App-Secret');
header('Access-Control-Max-Age: 86400');

// 7. 预检请求直接返回 200
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 8. 只允许 POST 方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => '仅允许 POST 请求'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 9. 引入数据库连接（确保 $pdo 已创建并启用异常模式）
require_once __DIR__ . '/../db_connect.php';

// 10. 解析并验证输入
header('Content-Type: application/json; charset=utf-8');
$input    = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => '用户名和密码不能为空'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 11. 密码强度校验 (已最终修复)
if (strlen($password) < 6
    || ! preg_match('/[A-Z]/', $password)
    || ! preg_match('/[a-z]/', $password)
    || ! preg_match('/\d/', $password)
) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => '密码需至少6位，包含大小写字母和数字'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // 12. 检查用户名是否已存在
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => '用户名已存在'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 13. 哈希密码
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // 14. 插入新用户，赠送初始积分
    $initial_points = 1000;
    $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, points) VALUES (?, ?, ?)');
    $stmt->execute([$username, $password_hash, $initial_points]);
    $user_id = $pdo->lastInsertId();

    // 15. 返回注册结果
    echo json_encode([
        'success' => true,
        'message' => '注册成功',
        'user'    => [
            'id'       => (int) $user_id,
            'username' => $username,
            'points'   => $initial_points
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => '数据库错误: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}