<?php
// --- 响应头设置 ---

// 允许来自你的前端域名的跨域请求
header("Access-Control-Allow-Origin: https://gewe.dpdns.org"); 

// 允许的HTTP方法
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// 允许前端发送的请求头
header("Access-Control-Allow-Headers: Content-Type, Authorization");
// 响应类型为JSON
header("Content-Type: application/json; charset=UTF-8");

// 处理CORS预检请求 (OPTIONS method)
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
    '8' => '8', '9' => '9', '10', 'jack' => 'J', 'queen' => 'Q', 'king' => 'K'
];

// 创建一副标准的52张扑克牌
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

// 【重要修改】: 添加大小王的代码已被移除。
// 现在牌组中只有52张牌，符合十三张游戏规则。

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