<?php
/**
 * 完整的 CORS + 安全更新用户积分接口示例
 */

// 1. 环境与白名单配置
$devMode = false; // 生产环境设为 false
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
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

// 10. 解析输入
header('Content-Type: application/json; charset=utf-8');
$input = json_decode(file_get_contents('php://input'), true);
$userId       = $input['userId']       ?? null;
$pointsChange = $input['pointsChange'] ?? null;

// 11. 基本验证
if ($userId === null || $pointsChange === null) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => '缺少 userId 或 pointsChange 参数'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (! is_numeric($userId) || ! is_numeric($pointsChange)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'userId 和 pointsChange 必须是数字'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId       = (int) $userId;
$pointsChange = (int) $pointsChange;

try {
    // 12. 开启事务
    $pdo->beginTransaction();

    // 13. 锁定行并读当前积分
    $stmt = $pdo->prepare(
        'SELECT points FROM users WHERE id = ? FOR UPDATE'
    );
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (! $row) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => '用户不存在'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $currentPoints = (int) $row['points'];
    $newPoints     = $currentPoints + $pointsChange;

    // 14. 可选：不允许负分
    if ($newPoints < 0) {
        $pdo->rollBack();
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => '积分不足，无法扣减'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 15. 更新积分
    $stmt = $pdo->prepare(
        'UPDATE users SET points = ? WHERE id = ?'
    );
    $stmt->execute([$newPoints, $userId]);

    // 16. 提交事务
    $pdo->commit();

    // 17. 返回结果
    echo json_encode([
        'success'   => true,
        'message'   => '积分更新成功',
        'newPoints' => $newPoints
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => '数据库操作失败: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
