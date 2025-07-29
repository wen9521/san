<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
$db = new SQLite3(__DIR__ . '/../db/user.db');
$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

// 查询手机号对应ID
if ($action === 'search') {
    $phone = $data['phone'] ?? '';
    $row = $db->querySingle("SELECT id, phone FROM users WHERE phone='$phone'", true);
    if ($row) {
        echo json_encode(["success"=>true,"data"=>$row]);
    } else {
        echo json_encode(["success"=>false,"message"=>"未找到该手机号"]);
    }
    exit;
}

// 积分转账
if ($action === 'transfer') {
    $from = $data['from'] ?? '';
    $to = $data['to'] ?? '';
    $amount = intval($data['amount'] ?? 0);
    if ($from === $to) {
        echo json_encode(["success"=>false,"message"=>"不能给自己转账"]);
        exit;
    }
    if ($amount <= 0) {
        echo json_encode(["success"=>false,"message"=>"积分必须大于0"]);
        exit;
    }
    $fromRow = $db->querySingle("SELECT * FROM users WHERE phone='$from'", true);
    $toRow = $db->querySingle("SELECT * FROM users WHERE phone='$to'", true);
    if (!$fromRow || !$toRow) {
        echo json_encode(["success"=>false,"message"=>"转账双方账号有误"]);
        exit;
    }
    if ($fromRow['points'] < $amount) {
        echo json_encode(["success"=>false,"message"=>"积分不足"]);
        exit;
    }
    $db->exec("UPDATE users SET points=points-$amount WHERE phone='$from'");
    $db->exec("UPDATE users SET points=points+$amount WHERE phone='$to'");
    echo json_encode(["success"=>true,"message"=>"积分赠送成功"]);
    exit;
}
echo json_encode(["success"=>false,"message"=>"未知操作"]);
