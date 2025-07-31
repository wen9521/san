<?php
/**
 * 完整的 CORS 安全示例 + 发牌接口
 */

// 开发模式开关，生产环境设为 false
$devMode = false;

// 信任的来源白名单
$allowed_origins = [
    'https://9525.ip-ddns.com',
    'https://gewe.dpdns.org',
    'capacitor://localhost',
    'http://localhost'
];

// 获取请求 Origin
$request_origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// 开发模式时打印调试日志
if ($devMode) {
    error_log('Incoming Origin: ' . ($request_origin ?: 'empty'));
}

// 初始标记为不允许
$is_allowed = false;

// 精确匹配白名单
if (in_array($request_origin, $allowed_origins, true)) {
    $is_allowed = true;
}

// file:// 前缀匹配（Cordova／旧版 WebView）
elseif (strpos($request_origin, 'file://') === 0) {
    $is_allowed     = true;
    $request_origin = 'file://';
}

// null 或空 Origin——仅开发模式放行
elseif ($devMode && ($request_origin === 'null' || $request_origin === '')) {
    $is_allowed     = true;
    $request_origin = 'capacitor://localhost';
}

// 防止缓存误用
header('Vary: Origin');

// 拒绝未授权的请求
if (! $is_allowed) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error'       => 'Forbidden: Origin not allowed.',
        'your_origin' => $request_origin
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 设置 CORS 响应头
header("Access-Control-Allow-Origin: {$request_origin}");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-App-Secret');
header('Access-Control-Max-Age: 86400');

// 对预检请求直接返回 200
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- 发牌逻辑开始 ---

// 定义花色和点数
$suits = ['H', 'D', 'C', 'S'];     // H: 红桃, D: 方块, C: 梅花, S: 黑桃
$ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

// 构造一副牌
$deck = [];
foreach ($suits as $suit) {
    foreach ($ranks as $rank) {
        $deck[] = $rank . $suit;
    }
}

// 打乱顺序
shuffle($deck);

// 发牌给四家，每人 13 张
$hands = [
    'player1' => [],
    'player2' => [],
    'player3' => [],
    'player4' => [],
];
for ($i = 0; $i < 13; $i++) {
    $hands['player1'][] = array_pop($deck);
    $hands['player2'][] = array_pop($deck);
    $hands['player3'][] = array_pop($deck);
    $hands['player4'][] = array_pop($deck);
}

// 输出 JSON
header('Content-Type: application/json; charset=utf-8');
echo json_encode($hands, JSON_UNESCAPED_UNICODE);
exit;