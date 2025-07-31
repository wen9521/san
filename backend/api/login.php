<?php
/**
 * 完整的 CORS 与登录接口示例 (最终修复版)
 */

// 1. 环境与白名单配置
$allowed_origins = [
    'https://9525.ip-ddns.com',
    'https://gewe.dpdns.org',
    'capacitor://localhost',
    'http://localhost',
    'https://localhost', // 明确支持 App 的 Origin
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
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS', true);
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-App-Secret', true);
    header('Access-Control-Max-Age: 86400', true);
    header('Vary: Origin', true); // Vary头对于CORS非常重要，确保其存在

    // 对 OPTIONS 预检请求直接返回 200
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
} else {
    // 如果来源不被允许，记录并返回403
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error'       => 'Forbidden: Origin not allowed.',
        'your_origin' => $request_origin
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// --- API 业务逻辑：用户登录 ---

// 4. 引入数据库连接
require_once __DIR__ . '/../db_connect.php';

// 5. 读取并解析 JSON POST 数据
header('Content-Type: application/json; charset=utf-8');
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// 6. 验证输入
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if ($username === '' || $password === '') {
    http_response_code(400); // Bad Request
    echo json_encode([
        'success' => false,
        'message' => '用户名和密码不能为空'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // 7. 查询用户
    $stmt = $pdo->prepare('SELECT id, username, password_hash, points FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 8. 校验密码
    if ($user && password_verify($password, $user['password_hash'])) {
        // 登录成功
        echo json_encode([
            'success' => true,
            'message' => '登录成功',
            'data'    => [
                'id'       => (int) $user['id'],
                'username' => $user['username'],
                'points'   => (int) $user['points']
            ]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        // 登录失败
        http_response_code(401); // Unauthorized
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
