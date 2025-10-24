<?php
session_start();
// If the user is not logged in, redirect to the login page.
if (!isset($_SESSION['user_id'])) {
    header('Location: login.html');
    exit;
}
// Include the header template
include 'templates/header.php';
?>

<div class="container mx-auto p-4 md:p-8">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 id="leaderboard-title" class="text-3xl md:text-4xl font-bold text-white">Leaderboard</h1>
        <div class="game-selector">
            <label for="game-select" class="text-gray-400 mr-2">Select Game:</label>
            <select id="game-select" class="bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <!-- Options will be populated by JavaScript -->
            </select>
        </div>
    </div>
    <div class="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <table class="min-w-full text-white">
            <thead class="bg-gray-700">
                <tr>
                    <th class="py-3 px-6 text-center text-xs font-medium uppercase tracking-wider">Rank</th>
                    <th class="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">Player</th>
                    <th class="py-3 px-6 text-center text-xs font-medium uppercase tracking-wider">Score</th>
                </tr>
            </thead>
            <tbody id="leaderboard-body" class="divide-y divide-gray-700">
                <!-- Scores will be loaded here by JavaScript -->
            </tbody>
        </table>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const gameSelect = document.getElementById('game-select');
        const leaderboardBody = document.getElementById('leaderboard-body');
        const leaderboardTitle = document.getElementById('leaderboard-title');

        // This list controls which games appear in the dropdown.
        // The 'id' MUST match the game_name you save in the database.
        const games = [
            { name: 'Tic-Tac-Toe', id: 'TicTacToe' },
            { name: '2048', id: '2048' },
            { name: 'Rock Paper Scissors', id: 'RockPaperScissors' },
            { name: 'Wordle', id: 'Wordle' },
            { name: 'Unscramble Words', id: 'UnscrambleWords' },
            { name: 'Math Riddles', id: 'MathRiddles' },
            { name: 'Sudoku', id: 'Sudoku' },
            { name: 'Flappy Bird', id: 'FlappyBird' }
            // Add your other games here as you build them.
        ];

        // Populate the dropdown menu
        games.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            gameSelect.appendChild(option);
        });

        async function fetchScores(gameId) {
            const game = games.find(g => g.id === gameId);
            if (!game) return;

            leaderboardTitle.textContent = `${game.name} Leaderboard`;
            leaderboardBody.innerHTML = '<tr><td colspan="3" class="text-center py-4">Loading scores...</td></tr>';

            try {
                // Pass the selected game_name to the API
                const response = await fetch(`api/get_scores.php?game_name=${encodeURIComponent(gameId)}`);
                if (!response.ok) throw new Error('Network response failed');
                const scores = await response.json();

                leaderboardBody.innerHTML = ''; // Clear loading message

                if (scores.length === 0) {
                    leaderboardBody.innerHTML = '<tr><td colspan="3" class="text-center py-4">No scores recorded for this game yet.</td></tr>';
                } else {
                    scores.forEach((score, index) => {
                        const rank = index + 1;
                        const row = `
                            <tr class="hover:bg-gray-700/50">
                                <td class="py-4 px-6 text-center">${rank}</td>
                                <td class="py-4 px-6">${score.username}</td>
                                <td class="py-4 px-6 text-center font-semibold">${score.score}</td>
                            </tr>
                        `;
                        leaderboardBody.innerHTML += row;
                    });
                }
            } catch (error) {
                console.error('Failed to fetch scores:', error);
                leaderboardBody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-red-400">Could not load scores.</td></tr>';
            }
        }

        // Add event listener for when the user changes the selection
        gameSelect.addEventListener('change', (e) => {
            fetchScores(e.target.value);
        });

        // Fetch scores for the default selected game when the page loads
        if (gameSelect.value) {
            fetchScores(gameSelect.value);
        }
    });
</script>

<?php
// Include the footer template
include 'templates/footer.php';
?>

