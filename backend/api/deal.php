<?php
// --- 新的、更健壮的安全与CORS设置 ---

// 【第1步】: 定义信任的来源和我们的秘密暗号
$allowed_web_origins = [
    'https://gewe.dpdns.org',
];
$app_secret_header = 'X-App-Secret';
// 已更新为更复杂的密钥
$app_secret_value = 'Xla2M666amiV9QehKwOTDJb8uvkozemr';

$is_request_allowed = false;
$request_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$server_secret_key = 'HTTP_' . strtoupper(str_replace('-', '_', $app_secret_header));
$request_secret = isset($_SERVER[$server_secret_key]) ? $_SERVER[$server_secret_key] : '';

// 【第2步】: 安全校验逻辑
if (in_array($request_origin, $allowed_web_origins)) {
    $is_request_allowed = true;
} elseif ($request_secret === $app_secret_value) {
    $is_request_allowed = true;
    if (empty($request_origin)) {
        $request_origin = 'capacitor://localhost'; 
    }
}

// 【第3步】: 根据校验结果设置响应头
if (!$is_request_allowed) {
    header("HTTP/1.1 403 Forbidden");
    exit('Forbidden: Invalid origin or missing/incorrect secret.');
}

header("Access-Control-Allow-Origin: " . $request_origin);
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, " . $app_secret_header);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// --- API业务逻辑从这里开始 ---
header('Content-Type: application/json; charset=UTF-8');

// 扑克牌的定义
$suits = ['spades', 'hearts', 'clubs', 'diamonds'];
$ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
$suit_names = [
    'spades' => '黑桃',
    'hearts' => '红桃',
    'clubs' => '梅花',
    'diamonds' => '方块'
];
$rank_names = [
    '2' => '2', '3' => '3', '4' => '4', '5' => '5', '6' => '6', '7' => '7', '8' => '8', 
    '9' => '9', '10' => '10', 'jack' => 'J', 'queen' => 'Q', 'king' => 'K', 'ace' => 'A'
];

// 创建一副完整的扑克牌
$deck = [];
foreach ($suits as $suit) {
    foreach ($ranks as $rank) {
        $deck[] = [
            'id' => $rank . '_of_' . $suit,
            'suit' => $suit,
            'rank' => $rank,
            'displayName' => $suit_names[$suit] . $rank_names[$rank]
        ];
    }
}

// 洗牌
shuffle($deck);

// 准备响应数据
$response = [
    'success' => true,
    'hand' => $deck,
    'dealt_at' => date('Y-m-d H:i:s')
];

// 以JSON格式返回数据
echo json_encode($response);
