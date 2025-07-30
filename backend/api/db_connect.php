<?php
// db_connect.php

// 数据库连接信息
$db_host = 'localhost'; // 或者您的数据库主机
$db_name = 'thirteen_poker';
$db_user = 'root';
$db_pass = ''; // 您的数据库密码
$db_charset = 'utf8mb4';

// 数据源名称 (DSN)
$dsn = "mysql:host=$db_host;dbname=$db_name;charset=$db_charset";

// PDO 选项
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // 创建 PDO 实例
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    // 数据库连接失败
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => '数据库连接失败: ' . $e->getMessage()]);
    exit();
}
