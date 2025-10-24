document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const grid = document.getElementById('sudoku-board');
    const numberPalette = document.getElementById('number-palette');
    const timerDisplay = document.getElementById('timer');
    const newGameButton = document.getElementById('new-game-btn');
    const submitButton = document.getElementById('submit-btn');
    const clearButton = document.getElementById('clear-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const finalTimeDisplay = document.getElementById('final-time');
    const finalScoreDisplay = document.getElementById('final-score');
    const playAgainButton = document.getElementById('play-again-btn');
    const toastContainer = document.getElementById('toast-container');

    // --- Game State ---
    let board = [];
    let solution = [];
    let selectedCell = null;
    let timerInterval;
    let seconds = 0;
    const N = 9; // Grid size
    const SRN = 3; // Square root of N

    // --- Game Initialization ---
    function startGame() {
        // Generate a new, valid puzzle
        generatePuzzle();
        // Render the board on the screen
        renderBoard();
        // Render the number palette
        renderPalette();
        // Reset and start the timer
        resetTimer();
        startTimer();
        // Hide the game over modal
        gameOverModal.classList.add('hidden');
    }

    // --- RECTIFIED: Robust Sudoku Board Generation ---

    function generatePuzzle() {
        // 1. Create a fully solved, valid Sudoku board
        let fullBoard = createFullBoard();
        solution = JSON.parse(JSON.stringify(fullBoard)); // Store the solution

        // 2. Remove numbers to create the puzzle
        board = removeNumbers(fullBoard, 40); // Remove 40 numbers (adjust for difficulty)
    }

    /**
     * Creates a complete, valid, and randomized Sudoku board using backtracking.
     */
    function createFullBoard() {
        let board = Array(N).fill(0).map(() => Array(N).fill(0));
        let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        /**
         * Fills the board using a backtracking algorithm.
         */
        function fill(row, col) {
            if (col === N) {
                col = 0;
                row++;
                if (row === N) return true; // Board is full
            }

            if (board[row][col] !== 0) {
                return fill(row, col + 1); // Cell already filled
            }

            shuffleArray(numbers); // Randomize number order

            for (const num of numbers) {
                if (isValid(board, row, col, num)) {
                    board[row][col] = num;
                    if (fill(row, col + 1)) {
                        return true;
                    }
                    board[row][col] = 0; // Backtrack
                }
            }
            return false; // No valid number found
        }

        fill(0, 0);
        return board;
    }

    /**
     * Checks if a number is valid to place at a given position.
     */
    function isValid(board, r, c, num) {
        // Check row
        for (let i = 0; i < N; i++) {
            if (board[r][i] === num) return false;
        }
        // Check column
        for (let i = 0; i < N; i++) {
            if (board[i][c] === num) return false;
        }
        // Check 3x3 subgrid
        const boxRowStart = r - (r % SRN);
        const boxColStart = c - (c % SRN);
        for (let i = 0; i < SRN; i++) {
            for (let j = 0; j < SRN; j++) {
                if (board[boxRowStart + i][boxColStart + j] === num) return false;
            }
        }
        return true; // Valid placement
    }

    /**
     * Randomly removes numbers from a full board to create a puzzle.
     */
    function removeNumbers(fullBoard, count) {
        let puzzle = JSON.parse(JSON.stringify(fullBoard));
        let removed = 0;
        while (removed < count) {
            const row = Math.floor(Math.random() * N);
            const col = Math.floor(Math.random() * N);
            if (puzzle[row][col] !== 0) {
                puzzle[row][col] = 0;
                removed++;
            }
        }
        return puzzle;
    }

    /**
     * Utility to shuffle an array (Fisher-Yates shuffle).
     */
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    // --- Rendering ---
    function renderBoard() {
        grid.innerHTML = '';
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const cell = document.createElement('div');
                cell.classList.add('sudoku-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                if (board[r][c] !== 0) {
                    cell.textContent = board[r][c];
                    cell.classList.add('given');
                } else {
                    cell.addEventListener('click', () => selectCell(cell));
                }
                // Add borders for 3x3 subgrids
                if ((r + 1) % SRN === 0 && r < N - 1) cell.classList.add('border-b-thick');
                if ((c + 1) % SRN === 0 && c < N - 1) cell.classList.add('border-r-thick');
                grid.appendChild(cell);
            }
        }
    }

    function renderPalette() {
        numberPalette.innerHTML = '';
        for (let i = 1; i <= N; i++) {
            const numButton = document.createElement('button');
            numButton.textContent = i;
            numButton.classList.add('palette-number', 'number');
            numButton.dataset.number = i;
            numberPalette.appendChild(numButton);
        }
        // Use an icon or text for the clear button
        const eraseButton = document.createElement('button');
        eraseButton.innerHTML = '&times;'; // Clear (X) icon
        eraseButton.classList.add('palette-number', 'erase-btn', 'number');
        eraseButton.dataset.number = 'clear';
        eraseButton.title = 'Clear cell (Backspace/Delete)';
        numberPalette.appendChild(eraseButton);
    }

    // --- Cell Interaction ---
    function selectCell(cell) {
        if (selectedCell) {
            selectedCell.classList.remove('selected');
        }
        selectedCell = cell;
        selectedCell.classList.add('selected');
    }

    function fillCell(number) {
        if (selectedCell && !selectedCell.classList.contains('given')) {
            selectedCell.textContent = number === 0 ? '' : number;
            selectedCell.classList.remove('error'); // Remove error on new input
        }
    }

    function clearBoard() {
        const userCells = grid.querySelectorAll('.sudoku-cell:not(.given)');
        userCells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('error');
        });
        showAlert("Board cleared!", 'success');
    }

    // --- Solution Checking ---
    function checkSolution() {
        let isCorrect = true;
        let isComplete = true;

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const cell = grid.querySelector(`[data-row='${r}'][data-col='${c}']`);
                if (!cell.classList.contains('given')) {
                    const cellValue = parseInt(cell.textContent) || 0;
                    if (cellValue === 0) {
                        isComplete = false;
                    } else if (cellValue !== solution[r][c]) {
                        isCorrect = false;
                        cell.classList.add('error');
                    } else {
                        cell.classList.remove('error');
                    }
                }
            }
        }

        if (isCorrect && isComplete) {
            clearInterval(timerInterval);
            const score = Math.max(10, 1800 - seconds); // Higher score for faster completion
            savePlayerScore('Sudoku', score);
            finalTimeDisplay.textContent = timerDisplay.textContent;
            finalScoreDisplay.textContent = score;
            gameOverModal.classList.remove('hidden');
        } else if (isComplete) {
            showAlert("Some cells are incorrect. They've been marked in red.", 'error');
        } else {
            showAlert("Puzzle not complete. Please fill all cells.");
        }
    }

    // --- Toast Notification System ---
    let toastTimeout;
    function showAlert(message, type = 'info') {
        clearTimeout(toastTimeout);
        toastContainer.innerHTML = ''; // Clear previous toast

        const toast = document.createElement('div');
        toast.textContent = message;
        toast.classList.add('toast');
        if (type === 'error') toast.classList.add('error');
        if (type === 'success') toast.classList.add('success');

        toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }

    // --- Keyboard Input & Navigation ---
    function handleKeyPress(e) {
        e.preventDefault();
        if (!selectedCell) return;

        if (e.key >= '1' && e.key <= '9') {
            fillCell(parseInt(e.key));
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            fillCell(0); // Clear the cell
        } else if (e.key.startsWith('Arrow')) {
            moveSelection(e.key);
        }
    }

    function moveSelection(key) {
        let row = parseInt(selectedCell.dataset.row);
        let col = parseInt(selectedCell.dataset.col);

        const move = () => {
            if (key === 'ArrowUp') row = (row - 1 + N) % N;
            else if (key === 'ArrowDown') row = (row + 1) % N;
            else if (key === 'ArrowLeft') col = (col - 1 + N) % N;
            else if (key === 'ArrowRight') col = (col + 1) % N;
        };

        // Find the next cell in the specified direction
        move();
        let nextCell = grid.querySelector(`[data-row='${row}'][data-col='${col}']`);

        // This makes navigation wrap around and select the next available cell
        selectCell(nextCell);
    }

    // --- Timer ---
    function startTimer() {
        clearInterval(timerInterval); // Ensure no multiple timers
        timerInterval = setInterval(() => {
            seconds++;
            const min = Math.floor(seconds / 60);
            const sec = seconds % 60;
            timerDisplay.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        seconds = 0;
        timerDisplay.textContent = '00:00';
    }

    // --- Score Saving ---
    async function savePlayerScore(gameName, playerScore) {
        if (playerScore <= 0) return;
        const formData = new FormData();
        formData.append('game_name', gameName);
        formData.append('score', playerScore);
        try {
            const response = await fetch('../../api/save_score.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (!result.success) {
                console.error('Failed to save score:', result.message);
            }
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }

    // --- Event Listeners ---
    numberPalette.addEventListener('click', (e) => {
        const target = e.target.closest('.number');
        if (target) {
            const number = target.dataset.number === 'clear' ? 0 : parseInt(target.dataset.number);
            fillCell(number);
        }
    });

    document.addEventListener('keydown', handleKeyPress);
    newGameButton.addEventListener('click', startGame);
    submitButton.addEventListener('click', checkSolution);
    clearButton.addEventListener('click', clearBoard);

    playAgainButton.addEventListener('click', startGame);

    function solveAndLog() {
        console.log("--- Sudoku Solution ---");
        // Using console.table provides a clean, grid-like view of the 2D array.
        console.table(solution);
        showAlert("Solution logged to console.");
    }

    // --- Toast, Keyboard, Timer, Score Saving ---
    function showAlert(message) {
        toastContainer.innerHTML = '';
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.classList.add('toast');
        if (message === "Board cleared!" || message === "Solution logged to console.") toast.classList.add('success');
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }

    // --- NEW: Event listener for the solver ---
    document.addEventListener('keydown', (e) => {
        // Trigger solver when the 's' key is pressed.
        if (e.key.toLowerCase() === 's' && e.target === document.body) {
            solveAndLog();
        }
    });

    // --- Initial Start ---
    startGame();
});

