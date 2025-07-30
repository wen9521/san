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

// 只处理POST请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => '仅允许POST请求']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? null;
$pointsChange = $data['pointsChange'] ?? null;

if ($userId === null || $pointsChange === null) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => '缺少userId或pointsChange参数']);
    exit();
}

if (!is_numeric($userId) || !is_numeric($pointsChange)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'userId和pointsChange必须是数字']);
    exit();
}

try {
    // 开始事务
    $pdo->beginTransaction();

    // 1. 获取当前分数
    $stmt = $pdo->prepare("SELECT points FROM users WHERE id = ? FOR UPDATE");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        $pdo->rollBack();
        http_response_code(404); // Not Found
        echo json_encode(['success' => false, 'message' => '用户不存在']);
        exit();
    }

    $currentPoints = $user['points'];
    $newPoints = $currentPoints + $pointsChange;

    // 2. 更新分数
    $stmt = $pdo->prepare("UPDATE users SET points = ? WHERE id = ?");
    $stmt->execute([$newPoints, $userId]);

    // 提交事务
    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => '分数更新成功',
        'newPoints' => $newPoints
    ]);

} catch (PDOException $e) {
    // 如果发生错误，回滚事务
    $pdo->rollBack();
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => '数据库操作失败: ' . $e->getMessage()]);
}
