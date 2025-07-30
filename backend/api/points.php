<?php
// --- 新的、更健壮的安全与CORS设置 ---

// 【第1步】: 定义信任的来源和我们的秘密暗号
$allowed_web_origins = [
    'https://gewe.dpdns.org',
];
$app_secret_header = 'X-App-Secret';
$app_secret_value = 'your-super-secret-key-12345';

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
header("Content-Type: application/json; charset=UTF-8");

function send_response($success, $message, $data = null) {
    http_response_code($success ? 200 : 400);
    $response = ["success" => $success, "message" => $message];
    if ($data) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit;
}

$db = null;
try {
    $db = new SQLite3(__DIR__ . '/../db/user.db');
    $action = $_GET['action'] ?? '';
    $data = json_decode(file_get_contents("php://input"), true);

    if ($action === 'search') {
        $phone = $data['phone'] ?? '';
        if (empty($phone)) {
            send_response(false, "未提供手机号");
        }
        $stmt = $db->prepare("SELECT id, phone FROM users WHERE phone = :phone");
        $stmt->bindValue(':phone', $phone, SQLITE3_TEXT);
        $result = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
        
        if ($result) {
            send_response(true, "查询成功", $result);
        } else {
            send_response(false, "未找到该手机号对应的用户");
        }
    } 
    
    elseif ($action === 'transfer') {
        $from_phone = $data['from'] ?? '';
        $to_phone = $data['to'] ?? '';
        $amount = filter_var($data['amount'] ?? 0, FILTER_VALIDATE_INT);

        if ($from_phone === $to_phone) {
            send_response(false, "不能给自己转账");
        }
        if ($amount === false || $amount <= 0) {
            send_response(false, "转账积分必须是大于0的整数");
        }

        // 使用事务确保操作的原子性
        $db->exec('BEGIN');

        // 验证转出方
        $stmt_from = $db->prepare("SELECT points FROM users WHERE phone = :phone");
        $stmt_from->bindValue(':phone', $from_phone, SQLITE3_TEXT);
        $from_user = $stmt_from->execute()->fetchArray(SQLITE3_ASSOC);
        
        if (!$from_user) {
            $db->exec('ROLLBACK');
            send_response(false, "转出方账户不存在");
        }
        if ($from_user['points'] < $amount) {
            $db->exec('ROLLBACK');
            send_response(false, "积分不足");
        }

        // 验证转入方
        $stmt_to = $db->prepare("SELECT id FROM users WHERE phone = :phone");
        $stmt_to->bindValue(':phone', $to_phone, SQLITE3_TEXT);
        $to_user = $stmt_to->execute()->fetchArray(SQLITE3_ASSOC);

        if (!$to_user) {
            $db->exec('ROLLBACK');
            send_response(false, "接收方账户不存在");
        }

        // 执行转账
        $update_from = $db->prepare("UPDATE users SET points = points - :amount WHERE phone = :phone");
        $update_from->bindValue(':amount', $amount, SQLITE3_INTEGER);
        $update_from->bindValue(':phone', $from_phone, SQLITE3_TEXT);
        $update_from->execute();

        $update_to = $db->prepare("UPDATE users SET points = points + :amount WHERE phone = :phone");
        $update_to->bindValue(':amount', $amount, SQLITE3_INTEGER);
        $update_to->bindValue(':phone', $to_phone, SQLITE3_TEXT);
        $update_to->execute();
        
        $db->exec('COMMIT');
        send_response(true, "积分赠送成功");
    } 
    
    else {
        send_response(false, "未知的操作请求");
    }

} catch (Exception $e) {
    if ($db) {
        $db->exec('ROLLBACK'); // 如果在事务中发生异常，则回滚
    }
    send_response(false, "服务器内部错误: " . $e->getMessage());
} finally {
    if ($db) {
        $db->close();
    }
}
