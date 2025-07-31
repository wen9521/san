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

// 打印实际接收的 Origin，便于调试
error_log('Incoming Origin: ' . ($request_origin ?: 'empty'));

// 加上 Vary 头，避免缓存误用
header('Vary: Origin');

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
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => 'Forbidden: Origin not allowed.',
        'your_origin' => $request_origin
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

header("Access-Control-Allow-Origin: {$request_origin}");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-App-Secret");

// 对 OPTIONS 请求明确返回 200
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- 您的API业务逻辑从这里开始 ---

// 牌面定义
$suits = ['H', 'D', 'C', 'S']; // 红桃, 方块, 梅花, 黑桃
$ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

// 创建一副牌
$deck = [];
foreach ($suits as $suit) {
    foreach ($ranks as $rank) {
        $deck[] = $rank . $suit;
    }
}

// 洗牌
shuffle($deck);

// 发牌给四家
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

// 设置响应头为JSON
header('Content-Type: application/json');

// 返回发牌结果
echo json_encode($hands);
