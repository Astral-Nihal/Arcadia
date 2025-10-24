<?php
// db_connect.php - Establishes the connection to the MySQL database.

// --- Database Configuration ---
// Replace these with your actual database credentials.
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root'); // Default XAMPP username
define('DB_PASSWORD', '');     // Default XAMPP password
define('DB_NAME', 'arcadia');

// --- Create Connection ---
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// --- Check Connection ---
if ($conn->connect_error) {
    // If connection fails, stop the script and display an error.
    // In a production environment, you would log this error instead of displaying it.
    die("Connection failed: " . $conn->connect_error);
}

// Set the character set to utf8mb4 for full Unicode support.
$conn->set_charset("utf8mb4");

// This file will be included by other PHP scripts that need to access the database.
?>
