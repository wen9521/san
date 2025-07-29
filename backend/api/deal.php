<?php
// 【CORS 核心修正】: 允许来自任何源的请求。
// 对于生产环境，您可能希望将其限制为您的应用的特定域名。
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json; charset=UTF-8');

// 如果是OPTIONS预检请求，直接返回成功
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

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
