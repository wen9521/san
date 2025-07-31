<?php
/**
 * 完整的 CORS + 安全更新用户积分接口示例 (最终修复版)
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

// 6. 解析输入
header('Content-Type: application/json; charset=utf-8');
$input = json_decode(file_get_contents('php://input'), true);
$userId       = $input['userId'] ?? null;
$pointsChange = $input['pointsChange'] ?? null;

// 7. 基本验证
if ($userId === null || $pointsChange === null || !is_numeric($userId) || !is_numeric($pointsChange)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'userId 和 pointsChange 参数无效'], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId       = (int) $userId;
$pointsChange = (int) $pointsChange;

try {
    // 8. 数据库事务
    $pdo->beginTransaction();
    $stmt = $pdo->prepare('SELECT points FROM users WHERE id = ? FOR UPDATE');
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => '用户不存在'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $newPoints = (int) $row['points'] + $pointsChange;
    if ($newPoints < 0) {
        $pdo->rollBack();
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => '积分不足'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE users SET points = ? WHERE id = ?');
    $stmt->execute([$newPoints, $userId]);
    $pdo->commit();

    // 9. 返回结果
    echo json_encode(['success' => true, 'message' => '积分更新成功', 'newPoints' => $newPoints], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => '数据库操作失败: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
