<?php
// index.php - The main entry point of the application.

// Start the session to check for user login status.
session_start();

// Check if the user is already logged in (i.e., if a 'user_id' is set in the session).
if (isset($_SESSION['user_id'])) {
    // If logged in, redirect to the main game dashboard.
    header('Location: dashboard.php');
    exit();
} else {
    // If not logged in, redirect to the login page.
    header('Location: login.html');
    exit();
}
?>
