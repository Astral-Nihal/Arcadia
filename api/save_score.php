<?php
session_start();
header('Content-Type: application/json');

// Include the database connection
require_once 'db_connect.php';

$response = ['success' => false, 'message' => 'An error occurred.'];

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'User is not logged in.';
    echo json_encode($response);
    exit();
}

// Check if required data is received
if (!isset($_POST['game_name']) || !isset($_POST['score'])) {
    $response['message'] = 'Game name or score not provided.';
    echo json_encode($response);
    exit();
}

$user_id = $_SESSION['user_id'];
$game_name = $_POST['game_name'];
$new_score_to_add = (int)$_POST['score'];

// --- RECTIFIED UPSERT LOGIC ---

// 1. Check if a score already exists for this user and game
$check_sql = "SELECT score FROM scores WHERE user_id = ? AND game_name = ?";
$stmt_check = $conn->prepare($check_sql);
if ($stmt_check === false) {
    $response['message'] = 'Prepare statement failed: ' . $conn->error;
    echo json_encode($response);
    exit();
}

$stmt_check->bind_param("is", $user_id, $game_name);
$stmt_check->execute();
$result = $stmt_check->get_result();

if ($result->num_rows > 0) {
    // 2. If it exists, UPDATE the score by adding the new points
    $row = $result->fetch_assoc();
    $current_score = (int)$row['score'];
    $total_new_score = $current_score + $new_score_to_add;

    // UPDATE using user_id and game_name instead of score_id
    $update_sql = "UPDATE scores SET score = ? WHERE user_id = ? AND game_name = ?";
    $stmt_update = $conn->prepare($update_sql);
    if ($stmt_update === false) {
        $response['message'] = 'Prepare statement failed: ' . $conn->error;
        echo json_encode($response);
        exit();
    }
    
    $stmt_update->bind_param("iis", $total_new_score, $user_id, $game_name);
    if ($stmt_update->execute()) {
        $response['success'] = true;
        $response['message'] = 'Score updated successfully!';
    } else {
        $response['message'] = 'Execute failed: ' . $stmt_update->error;
    }
    $stmt_update->close();

} else {
    // 3. If it does not exist, INSERT a new score record
    $insert_sql = "INSERT INTO scores (user_id, game_name, score) VALUES (?, ?, ?)";
    $stmt_insert = $conn->prepare($insert_sql);
    if ($stmt_insert === false) {
        $response['message'] = 'Prepare statement failed: ' . $conn->error;
        echo json_encode($response);
        exit();
    }
    
    $stmt_insert->bind_param("isi", $user_id, $game_name, $new_score_to_add);
    if ($stmt_insert->execute()) {
        $response['success'] = true;
        $response['message'] = 'Score saved successfully!';
    } else {
        $response['message'] = 'Execute failed: ' . $stmt_insert->error;
    }
    $stmt_insert->close();
}

$stmt_check->close();
$conn->close();

echo json_encode($response);
?>

