<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['phone']) || !isset($data['password'])) {
    echo json_encode(["success"=>false,"message"=>"缺少参数"]);
    exit;
}
$phone = $data['phone'];
$password = $data['password'];
$db = new SQLite3(__DIR__ . '/../db/user.db');
$row = $db->querySingle("SELECT * FROM users WHERE phone='$phone'", true);
if (!$row) {
    echo json_encode(["success"=>false,"message"=>"账号不存在"]);
    exit;
}
if (!password_verify($password, $row['password'])) {
    echo json_encode(["success"=>false,"message"=>"密码错误"]);
    exit;
}
echo json_encode(["success"=>true,"data"=>["id"=>$row['id'],"phone"=>$row['phone'],"points"=>$row['points']]]]);
