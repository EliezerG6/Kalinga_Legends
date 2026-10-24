<?php
header('Content-Type: application/json');
include 'db.php'; // Your database connection file

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['user_id']) || !isset($data['progress'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

$userId = $data['user_id'];
$progressJson = json_encode($data['progress']);
$score = isset($data['score']) ? intval($data['score']) : 0;

// Update user progress and fallback score in your database users/progress table[cite: 7]
$stmt = $pdo->prepare("UPDATE users SET progress = ?, total_score = ? WHERE id = ?");
$success = $stmt->execute([$progressJson, $score, $userId]);

if ($success) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Database update failed']);
}
