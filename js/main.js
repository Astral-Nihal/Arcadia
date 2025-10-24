// main.js - Handles dynamic content for the dashboard and leaderboard.

// A list of all available games.
const games = [
    { id: '2048', title: '2048', icon: 'blocks', url: 'games/2048/index.html' },
    { id: 'tictactoe', title: 'Tic-Tac-Toe', icon: 'x', url: 'games/tictactoe/index.html' },
    { id: 'rock-paper-scissors', title: 'Rock Paper Scissors', icon: 'scissors', url: 'games/rockpaperscissors/index.html' },
    { id: 'wordle', title: 'Wordle', icon: 'spell-check', url: 'games/wordle/index.html' },
    { id: 'unscramble-words', title: 'Unscramble Words', icon: 'shuffle', url: 'games/unscramblewords/index.html' },
    { id: 'math-riddles', title: 'Math Riddles', icon: 'brain-circuit', url: 'games/mathriddles/index.html' },
    { id: 'sudoku', title: 'Sudoku', icon: 'grid-3x3', url: 'games/sudoku/index.html' },
    { id: 'flappybird', title: 'Flappy Bird', icon: 'bird', url: 'games/flappybird/index.html' },
];

document.addEventListener('DOMContentLoaded', () => {
    // Determine which page is currently active and run its specific logic.
    if (document.getElementById('game-grid')) {
        populateDashboard();
    }
    if (document.getElementById('leaderboard-body')) {
        setupLeaderboard();
    }

    // Universal logic for all pages
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('api/logout.php');
            window.location.href = 'login.html';
        });
    }
});

/**
 * Populates the game grid on the dashboard page.
 */
function populateDashboard() {
    const gameGrid = document.getElementById('game-grid');
    if (!gameGrid) return;

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card bg-gray-800 rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center aspect-square';
        card.innerHTML = `
            <i data-lucide="${game.icon}" class="w-16 h-16 text-indigo-400 mb-4"></i>
            <h3 class="text-xl font-semibold text-white">${game.title}</h3>
        `;
        card.onclick = () => {
            // A '#' url means the game is not ready yet.
            if (game.url === '#') {
                alert(game.title + ' is coming soon!');
            } else {
                window.location.href = game.url;
            }
        };
        gameGrid.appendChild(card);
    });
    lucide.createIcons(); // Render the newly added icons.
}

/**
 * Sets up the leaderboard page, populating the dropdown and loading initial scores.
 */
function setupLeaderboard() {
    const select = document.getElementById('leaderboard-game-select');
    if (!select) return;

    // Populate the game selection dropdown.
    games.forEach(game => {
        const option = document.createElement('option');
        option.value = game.id;
        option.textContent = game.title;
        select.appendChild(option);
    });

    // Load scores for the initially selected game.
    loadLeaderboard(select.value);

    // Add an event listener to load scores when a different game is selected.
    select.addEventListener('change', (e) => loadLeaderboard(e.target.value));
}

/**
 * Fetches and displays the leaderboard for a specific game.
 * @param {string} gameId - The ID of the game (e.g., 'tictactoe').
 */
async function loadLeaderboard(gameId) {
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="3" class="text-center p-8 text-gray-500">Loading...</td></tr>';

    try {
        const response = await fetch(`api/get_scores.php?game=${gameId}`);
        const scores = await response.json();

        tbody.innerHTML = ''; // Clear loading message.

        if (scores.error) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center p-8 text-gray-500">${scores.error}</td></tr>`;
            return;
        }

        if (scores.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center p-8 text-gray-500">No scores recorded for this game yet.</td></tr>`;
            return;
        }

        // Populate the table with score data.
        scores.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-700 hover:bg-gray-700/50';
            row.innerHTML = `
                <td class="p-4 font-bold">${index + 1}</td>
                <td class="p-4">${entry.username}</td>
                <td class="p-4 text-indigo-400 font-semibold">${parseInt(entry.score).toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center p-8 text-red-400">Failed to load leaderboard.</td></tr>';
    }
}
