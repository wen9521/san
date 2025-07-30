<?php
// --- 最终的、由您提供的完美CORS与安全设置 ---

// 【第1步】: 定义信任的来源白名单
$allowed_origins = [
    'https://9525.ip-ddns.com',   // 您当前正在使用的域名
    'https://gewe.dpdns.org',    // 您的线上Web前端
    'capacitor://localhost',      // Capacitor App 的标准 Origin
    'http://localhost',           // 某些Capacitor/Cordova环境下的 Origin
    // 'http://localhost:5173'   // 如果您有本地Web开发环境
];

// 检查请求的来源
$request_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$is_request_allowed = false;

// 【第2步】: 安全校验逻辑
// 规则：请求的来源必须在我们定义的白名单中
if (in_array($request_origin, $allowed_origins)) {
    $is_request_allowed = true;
} 
// 对 'null' Origin 的特殊处理
elseif ($request_origin === 'null' || empty($request_origin)) {
    $is_request_allowed = true;
    // 当Origin是null时，我们不能在响应头里返回'null'，通常返回一个白名单里的值
    $request_origin = 'capacitor://localhost';
}

// 【第3步】: 根据校验结果设置响应头
if (!$is_request_allowed) {
    header("HTTP/1.1 403 Forbidden");
    // 返回更详细的错误，方便调试
    $error_details = [
        'error' => 'Forbidden: Origin not allowed.',
        'your_origin' => isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'Not specified'
    ];
    header('Content-Type: application/json');
    echo json_encode($error_details);
    exit();
}

// 请求合法，我们为其设置CORS响应头
header("Access-Control-Allow-Origin: " . $request_origin);
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-App-Secret"); // 把X-App-Secret加回来以防万一

// 处理CORS预检请求
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// --- 您的API业务逻辑从这里开始 ---

// 引入数据库连接
require_once '../db_connect.php';

// 获取POST数据
$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => '用户名和密码不能为空']);
    exit();
}

// 密码强度校验 (示例)
if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => '密码长度不能少于6位']);
    exit();
}


try {
    // 检查用户名是否已存在
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => '用户名已存在']);
        exit();
    }

    // 哈希密码
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // 插入新用户
    $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, points) VALUES (?, ?, ?)");
    // 新注册用户送1000分
    $initial_points = 1000;
    $stmt->execute([$username, $password_hash, $initial_points]);

    // 获取新用户的ID
    $user_id = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => '注册成功',
        'user' => [
            'id' => $user_id,
            'username' => $username,
            'points' => $initial_points
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => '数据库错误: ' . $e->getMessage()]);
}
