<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$response = [];

// Default to a specific game or handle error if not provided
$game_name = isset($_GET['game_name']) ? $_GET['game_name'] : '';

if (empty($game_name)) {
    echo json_encode([]); // Return empty array if no game is specified
    exit;
}

// SQL to get scores for a specific game, joining with users table to get usernames
// and ordering by the highest score first.
$sql = "SELECT u.username, s.score 
        FROM scores s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.game_name = ?
        ORDER BY s.score DESC, s.played_at DESC";

$stmt = $conn->prepare($sql);
if ($stmt === false) {
    // Handle error, maybe log it
    echo json_encode(['error' => 'Failed to prepare statement']);
    exit;
}

$stmt->bind_param("s", $game_name);
$stmt->execute();
$result = $stmt->get_result();

$scores = [];
while ($row = $result->fetch_assoc()) {
    $scores[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode($scores);
?>

