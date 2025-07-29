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
if (!preg_match('/^1d{10}$/', $phone)) {
    echo json_encode(["success"=>false,"message"=>"手机号格式错误"]);
    exit;
}
if (strlen($password) < 6) {
    echo json_encode(["success"=>false,"message"=>"密码至少6位"]);
    exit;
}

// 数据库
$db = new SQLite3(__DIR__ . '/../db/user.db');
$db->exec("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, phone TEXT UNIQUE, password TEXT, points INTEGER)");
$exists = $db->querySingle("SELECT count(*) FROM users WHERE phone='$phone'");
if ($exists) {
    echo json_encode(["success"=>false,"message"=>"手机号已注册"]);
    exit;
}

// 生成4位数字ID
do {
    $id = str_pad(strval(rand(0, 9999)), 4, '0', STR_PAD_LEFT);
    $c = $db->querySingle("SELECT count(*) FROM users WHERE id='$id'");
} while ($c > 0);

$hash = password_hash($password, PASSWORD_DEFAULT);
$db->exec("INSERT INTO users (id, phone, password, points) VALUES ('$id', '$phone', '$hash', 1000)");
echo json_encode(["success"=>true,"data"=>["id"=>$id,"phone"=>$phone,"points"=>1000]]);
