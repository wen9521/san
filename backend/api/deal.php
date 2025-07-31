<?php
/**
 * 完整的 CORS 安全示例 + 发牌接口 (最终修复版)
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
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS', true);
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

// --- 发牌逻辑开始 ---

// 4. 定义花色和点数
$suits = ['H', 'D', 'C', 'S'];
$ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

// 5. 构造一副牌
$deck = [];
foreach ($suits as $suit) {
    foreach ($ranks as $rank) {
        $deck[] = ['rank' => $rank, 'suit' => $suit];
    }
}
shuffle($deck);

// 6. 发牌给四家
$hands = ['player1' => [], 'player2' => [], 'player3' => [], 'player4' => []];
for ($i = 0; $i < 13; $i++) {
    foreach (array_keys($hands) as $player) {
        if (!empty($deck)) {
            $hands[$player][] = array_pop($deck);
        }
    }
}

// 7. 输出 JSON
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['success' => true, 'hands' => $hands], JSON_UNESCAPED_UNICODE);
exit;
