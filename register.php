<?php
// register.php - Handles user registration
require_once 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if (empty($username) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Username and password are required.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Username already taken.']);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->execute([$username, $hashedPassword]);
    
    $userId = $pdo->lastInsertId();

    $stmt = $pdo->prepare("INSERT INTO user_progress (user_id, easy_achievements, medium_achievements, hard_achievements) VALUES (?, '[]', '[]', '[]')");
    $stmt->execute([$userId]);

    echo json_encode(['status' => 'success', 'message' => 'Registration successful.', 'user_id' => $userId, 'username' => $username]);
} catch (\Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Server error during registration.']);
}
