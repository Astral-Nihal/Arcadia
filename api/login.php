<?php
// login.php - Handles user authentication and session creation.

// Start a session at the very beginning.
session_start();

require 'db_connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit();
}

$username = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    exit();
}

// --- Fetch User and Verify Password ---
// Use a prepared statement to find the user by username.
$stmt = $conn->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // Verify the submitted password against the stored hash.
    if (password_verify($password, $user['password_hash'])) {
        // Password is correct. Store user data in the session.
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        
        echo json_encode(['success' => true]);
    } else {
        // Password is incorrect.
        echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    }
} else {
    // User not found.
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
}

$stmt->close();
$conn->close();
?>
