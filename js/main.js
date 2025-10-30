// main.js - Handles dynamic content for the dashboard and leaderboard.

// A list of all available games.
const games = [
    { id: '2048', title: '2048', icon: 'hash', url: 'games/2048/index.html' },
    { id: 'tictactoe', title: 'Tic-Tac-Toe', icon: 'x', url: 'games/tictactoe/index.html' },
    { id: 'rockpaperscissors', title: 'Rock Paper Scissors', icon: 'scissors', url: 'games/rockpaperscissors/index.html' },
    { id: 'wordle', title: 'Wordle', icon: 'spell-check', url: 'games/wordle/index.html' },
    { id: 'unscramblewords', title: 'Unscramble Words', icon: 'shuffle', url: 'games/unscramblewords/index.html' },
    { id: 'mathriddles', title: 'Math Riddles', icon: 'brain-circuit', url: 'games/mathriddles/index.html' },
    { id: 'sudoku', title: 'Sudoku', icon: 'grid-3x3', url: 'games/sudoku/index.html' },
    { id: 'flappybird', title: 'Flappy Bird', icon: 'bird', url: 'games/flappybird/index.html' },
];

/**
 * RECTIFIED: This function robustly waits for the Lucide library to be ready 
 * before attempting to render any icons, fixing the hard-refresh bug.
 */
function safeCreateIcons() {
    // Check if Lucide is loaded and ready
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    } else {
        // If not ready, wait 50ms and try again.
        console.warn('Lucide icons not ready, retrying in 50ms...');
        setTimeout(safeCreateIcons, 50);
    }
}

/**
 * Sets up the event listeners for the logout confirmation modal.
 */
function setupLogoutModal() {
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

    if (logoutBtn && logoutModal && cancelLogoutBtn && confirmLogoutBtn) {
        // Show the modal when the main logout button is clicked
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Stop any default link behavior
            logoutModal.classList.remove('hidden');
        });

        // Hide the modal when "Cancel" is clicked
        cancelLogoutBtn.addEventListener('click', () => {
            logoutModal.classList.add('hidden');
        });

        // Perform the logout when "Logout" is clicked
        confirmLogoutBtn.addEventListener('click', () => {
            // We fetch the logout page to kill the session, 
            // then redirect to login.html
            fetch('api/logout.php')
                .then(() => {
                    window.location.href = 'login.html';
                })
                .catch(err => {
                    console.error('Logout failed:', err);
                    window.location.href = 'login.html'; // Redirect anyway
                });
        });
    }
}


// --- Main Execution ---

// RECTIFIED: We use 'window.onload' which waits for ALL content (scripts, images)
// to load, ensuring 'lucide' is available.
window.onload = () => {
    // Determine which page is currently active and run its specific logic.
    if (document.getElementById('game-grid')) {
        populateDashboard();
    }
    if (document.getElementById('leaderboard-body')) {
        setupLeaderboard();
    }

    // Universal logic for all pages
    setupLogoutModal();
};


/**
 * Populates the game grid on the dashboard page.
 */
function populateDashboard() {
    const gameGrid = document.getElementById('game-grid');
    if (!gameGrid) return;

    gameGrid.innerHTML = ''; // Clear the grid first
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card bg-gray-800 rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center aspect-square transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/20';
        card.innerHTML = `
            <i data-lucide="${game.icon}" class="w-16 h-16 text-indigo-400 mb-4"></i>
            <h3 class="text-xl font-semibold text-white">${game.title}</h3>
        `;
        card.onclick = () => {
            window.location.href = game.url;
        };
        gameGrid.appendChild(card);
    });

    // Call the safe icon renderer
    safeCreateIcons();
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
        option.value = game.id; // Use the game.id (e.g., 'tictactoe')
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

    // Use the correct game name for the API call (e.g., 'TicTacToe', '2048')
    // We find the game in our 'games' array to get the title, which is what we used for saving.
    // Or, we can standardize on the ID. Let's assume the API uses the ID.
    // **Correction**: Our save_score.php scripts use the *title* (e.g., 'Wordle', '2048').
    // Let's find the *title* from the *ID* to make the API call correct.

    // Find the full game object from the selected gameId
    const game = games.find(g => g.id === gameId);
    if (!game) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center p-8 text-red-400">Invalid game selected.</td></tr>';
        return;
    }
    // Use the *game.title* for the API, as that's what we saved in the DB
    const gameNameForAPI = game.title;


    tbody.innerHTML = '<tr><td colspan="3" class="text-center p-8 text-gray-500">Loading...</td></tr>';

    try {
        // Use the correct game name in the API request
        const response = await fetch(`api/get_scores.php?game=${gameNameForAPI}`);
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

            let rankClass = '';
            if (index === 0) rankClass = 'text-yellow-400';
            else if (index === 1) rankClass = 'text-gray-300';
            else if (index === 2) rankClass = 'text-yellow-600';

            row.innerHTML = `
                <td class="p-4 font-bold text-lg ${rankClass}">${index + 1}</td>
                <td class="p-4">${entry.username}</td>
                <td class="p-4 text-indigo-400 font-semibold">${parseInt(entry.score).toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center p-8 text-red-400">Failed to load leaderboard.</td></tr>';
    }
}

