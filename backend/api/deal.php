<?php
// --- 响应头设置 ---
header("Access-Control-Allow-Origin: https://gewe.dpdns.org"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// --- 卡牌逻辑 ---
$suits = ['spades', 'hearts', 'clubs', 'diamonds'];
$ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
$suit_map = ['spades' => '黑桃', 'hearts' => '红桃', 'clubs'  => '梅花', 'diamonds' => '方块'];
$rank_map = [
    'ace' => 'A', '2' => '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack' => 'J', 'queen' => 'Q', 'king' => 'K'
];

// 创建一副标准的52张扑克牌
$deck = [];
foreach ($suits as $suit) {
    foreach ($ranks as $rank) {
        $deck[] = [
            'id' => $rank . '_of_' . $suit,
            'suit' => $suit,
            'rank' => $rank,
            'displayName' => $suit_map[$suit] . $rank_map[$rank]
        ];
    }
}

// 洗牌
shuffle($deck);

// 【重要修改】: 直接返回整副洗好的52张牌
$hand = $deck;

// --- 输出结果 ---
echo json_encode([
    'success' => true,
    'hand' => $hand, // hand 字段现在包含52张牌
    'dealt_at' => date('Y-m-d H:i:s')
]);
?>