<?php
// --- 响应头设置 ---

// 允许来自你的前端域名的跨域请求
header("Access-Control-Allow-Origin: https://gewe.dpdns.org"); 
// 在开发环境中，你可能需要允许来自本地服务器的请求，例如 http://localhost:5173
// header("Access-Control-Allow-Origin: http://localhost:5173"); 

// 允许的HTTP方法
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// 响应类型为JSON
header("Content-Type: application/json; charset=UTF-8");

// 处理OPTIONS预检请求
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}


// --- 卡牌逻辑 ---

// 定义花色和点数
$suits = ['spades', 'hearts', 'clubs', 'diamonds'];
$ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
// 英文到中文的映射，方便前端显示
$suit_map = [
    'spades' => '黑桃',
    'hearts' => '红桃',
    'clubs'  => '梅花',
    'diamonds' => '方块'
];
$rank_map = [
    'ace' => 'A', '2' => '2', '3' => '3', '4' => '4', '5' => '5', '6' => '6', '7' => '7',
    '8' => '8', '9' => '9', '10' => '10', 'jack' => 'J', 'queen' => 'Q', 'king' => 'K'
];

// 创建一副完整的扑克牌
$deck = [];
foreach ($suits as $suit) {
    foreach ($ranks as $rank) {
        $deck[] = [
            'id' => $rank . '_of_' . $suit, // 唯一ID，用于匹配图片文件名
            'suit' => $suit,
            'rank' => $rank,
            'displayName' => $suit_map[$suit] . $rank_map[$rank] // 用于显示的名称
        ];
    }
}

// 可选：添加大小王
// 注意：标准十三张不使用大小王，但根据你的要求添加
$deck[] = ['id' => 'red_joker', 'suit' => 'joker', 'rank' => 'red', 'displayName' => '大王'];
$deck[] = ['id' => 'black_joker', 'suit' => 'joker', 'rank' => 'black', 'displayName' => '小王'];


// 洗牌
shuffle($deck);

// 发13张牌
$hand = array_slice($deck, 0, 13);

// --- 输出结果 ---
// 以JSON格式返回手牌数据
echo json_encode([
    'success' => true,
    'hand' => $hand,
    'dealt_at' => date('Y-m-d H:i:s')
]);

?>
