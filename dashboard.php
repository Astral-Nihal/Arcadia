<?php
// dashboard.php - The main game selection screen for logged-in users.

session_start();
// Redirect to login page if the user is not logged in.
if (!isset($_SESSION['user_id']) || !isset($_SESSION['username'])) {
    header('Location: login.html');
    exit();
}

// Include the header template.
include 'templates/header.php';
?>

<!-- Dashboard / Game Selection -->
<main class="container mx-auto p-4 md:p-8">
    <h2 class="text-4xl font-bold text-center text-white mb-10">Choose Your Challenge</h2>
    <div id="game-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <!-- Game cards will be dynamically inserted here by js/main.js -->
    </div>
</main>

<?php
// Include the footer template.
include 'templates/footer.php';
?>
