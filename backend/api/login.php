<?php
/**
 * 完整的 CORS 与登录接口示例
 */

// 1. 环境与白名单配置
$devMode = false; // 上线环境请务必设为 false
$allowed_origins = [
    'https://9525.ip-ddns.com',
    'https://gewe.dpdns.org',
    'capacitor://localhost',
    'http://localhost',
    'https://wen9521.github.io'
];

// 2. 获取请求 Origin
$request_origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// 3. 可选：调试日志（仅开发模式启用）
if ($devMode) {
    error_log('Incoming Origin: ' . ($request_origin ?: 'empty'));
}

// 4. 校验来源
$is_allowed = in_array($request_origin, $allowed_origins, true);

// 安卓/IOS等的
if ($request_origin === 'null' || $request_origin === '') {
    $is_allowed = true;
}
// file:// 前缀匹配
if (!$is_allowed && strpos($request_origin, 'file://') === 0) {
    $is_allowed     = true;
    $request_origin = 'file://';
}

// null/empty Origin 仅在开发模式放行
if ($devMode && (empty($request_origin) || $request_origin === 'null')) {
    $is_allowed     = true;
    $request_origin = 'capacitor://localhost';
}

// 5. 设置 Vary 头，防止缓存误用
header('Vary: Origin');

// 6. 如果不在白名单内，直接返回 403
if (!$is_allowed) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error'       => 'Forbidden: Origin not allowed.',
        'your_origin' => $request_origin
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 7. 输出 CORS 相关响应头
header("Access-Control-Allow-Origin: {$request_origin}");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-App-Secret');
header('Access-Control-Max-Age: 86400');

// 8. 对 OPTIONS 预检请求直接返回 200
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- API 业务逻辑：用户登录 ---

// 9. 引入数据库连接（请确保 db_connect.php 已配置好 PDO 连接 $pdo）
require_once __DIR__ . '/../db_connect.php';

// 10. 读取并解析 JSON POST 数据
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// 11. 验证输入
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if ($username === '' || $password === '') {
    echo json_encode([
        'success' => false,
        'message' => '用户名和密码不能为空'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // 12. 查询用户
    $stmt = $pdo->prepare('SELECT id, username, password_hash, points FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 13. 校验密码
    if ($user && password_verify($password, $user['password_hash'])) {
        // 登录成功（字段改为data）
        echo json_encode([
            'success' => true,
            'message' => '登录成功',
            'data'    => [
                'id'       => $user['id'],
                'username' => $user['username'],
                'points'   => $user['points']
            ]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        // 登录失败
        echo json_encode([
            'success' => false,
            'message' => '用户名或密码错误'
        ], JSON_UNESCAPED_UNICODE);
    }

} catch (PDOException $e) {
    // 数据库异常
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => '数据库错误: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}