<?php
// login.php - Handles user login
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
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $progStmt = $pdo->prepare("SELECT * FROM user_progress WHERE user_id = ?");
        $progStmt->execute([$user['id']]);
        $progress = $progStmt->fetch();

        echo json_encode([
            'status' => 'success',
            'message' => 'Login successful.',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'progress' => [
                    'EASY' => json_decode($progress['easy_achievements'] ?? '[]'),
                    'MEDIUM' => json_decode($progress['medium_achievements'] ?? '[]'),
                    'HARD' => json_decode($progress['hard_achievements'] ?? '[]')
                ]
            ]
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid username or password.']);
    }
} catch (\Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Server error during login.']);
}
