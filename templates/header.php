<?php
// This is the username of the logged-in user, default to 'guest' if not set
$username = $_SESSION['username'] ?? 'guest';
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- The $title variable will be set by each page (dashboard.php, leaderboard.php) -->
    <title><?php echo $title ?? 'Arcadia'; ?> - Web Game Portal</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Font: Poppins -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
        
    <!-- RECTIFIED: This is the correct UMD version of Lucide that creates the global 'lucide' object -->
    <script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.min.js"></script>
    
    <!-- Main Stylesheet -->
    <link rel="stylesheet" href="css/style.css">
</head>

<body class="bg-gray-900 text-white font-poppins antialiased">

    <!-- Main Navigation Bar -->
    <header class="bg-gray-800/50 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
        <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                <!-- Logo -->
                <div class="flex-shrink-0 flex items-center">
                    <a href="dashboard.php" class="text-3xl font-bold text-white">
                        <span class="text-blue-400">Arcadia</span>
                    </a>
                </div>

                <!-- RECTIFIED: Main Menu and User Info are now grouped together on the right -->
                <div class="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                    <!-- Nav Links -->
                    <a href="dashboard.php"
                        class="nav-link <?php echo ($active_page == 'dashboard') ? 'active' : ''; ?>">Games</a>
                    <a href="leaderboard.php"
                        class="nav-link <?php echo ($active_page == 'leaderboard') ? 'active' : ''; ?>">Leaderboard</a>

                    <!-- User Info & Logout -->
                    <!-- Added sm:ml-8 for a visual gap matching the space-x-8 -->
                    <span class="text-gray-300 sm:ml-8">Welcome, <span
                            class="font-semibold text-indigo-300"><?php echo htmlspecialchars($username); ?></span></span>
                    <!-- Added sm:ml-4 for spacing from the welcome text -->
                    <button id="logout-btn"
                        class="sm:ml-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                        Logout
                    </button>
                </div>
                
                <!-- Mobile Menu Button (if needed in future) -->
                <div class="-mr-2 flex items-center sm:hidden">
                    <!-- Mobile menu button can be added here -->
                </div>
            </div>
        </nav>
    </header>

    <!-- Logout Confirmation Modal -->
    <div id="logout-modal" class="modal-overlay hidden">
        <div class="modal-content">
            <h2 class="text-2xl font-bold mb-4">Confirm Logout</h2>
            <p class="text-lg mb-6">Are you sure you want to log out of Arcadia?</p>
            <div class="flex justify-center gap-4">
                <button id="cancel-logout-btn" class="btn-secondary">Cancel</button>
                <button id="confirm-logout-btn" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors">Logout</button>
            </div>
        </div>
    </div>

    <!-- Main Content Area (starts here, ends in footer.php) -->
    <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">


