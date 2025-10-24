document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const statusDisplay = document.getElementById('status-display');
    const restartButton = document.getElementById('restart-button');
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    const playAgainButton = document.getElementById('play-again-button');

    let board = ['', '', '', '', '', '', '', '', ''];
    const player_X = 'X'; // Human player
    const player_O = 'O'; // AI player
    let currentPlayer = player_X;
    let isGameActive = true;
    const winningScore = 10; // Score awarded for a win

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    /**
     * Handles a click on a cell by the human player.
     * @param {Event} clickedCellEvent - The click event.
     */
    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

        // Only allow clicks if the cell is empty, the game is active, and it's the human's turn
        if (board[clickedCellIndex] !== "" || !isGameActive || currentPlayer !== player_X) {
            return;
        }

        updateBoard(clickedCellIndex, player_X);
        handleResultValidation();
    }

    /**
     * Executes the AI's move after a short delay.
     */
    function handleAIMove() {
        if (!isGameActive) return;

        statusDisplay.textContent = "Computer is thinking...";
        gameBoard.style.pointerEvents = 'none'; // Disable clicks during AI's turn

        setTimeout(() => {
            const availableCells = board.map((cell, index) => cell === "" ? index : null).filter(val => val !== null);

            if (availableCells.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableCells.length);
                const aiMoveIndex = availableCells[randomIndex];
                updateBoard(aiMoveIndex, player_O);
                handleResultValidation();
            }

            if (isGameActive) {
                gameBoard.style.pointerEvents = 'auto'; // Re-enable clicks
            }
        }, 800);
    }

    /**
     * Updates the board state and the UI for a given move.
     * @param {number} index - The cell index to update.
     * @param {string} player - The player making the move ('X' or 'O').
     */
    function updateBoard(index, player) {
        board[index] = player;
        const cell = document.querySelector(`[data-cell-index='${index}']`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
    }

    /**
     * Switches the current player and triggers AI move if necessary.
     */
    function handlePlayerChange() {
        currentPlayer = currentPlayer === player_X ? player_O : player_X;

        if (isGameActive && currentPlayer === player_O) {
            handleAIMove();
        } else if (isGameActive) {
            statusDisplay.textContent = "Your turn";
        }
    }

    /**
     * Checks the board for a win or a draw after each move.
     */
    function handleResultValidation() {
        let roundWon = false;
        let winningCombo = [];

        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            let a = board[winCondition[0]];
            let b = board[winCondition[1]];
            let c = board[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                winningCombo = winCondition;
                break;
            }
        }

        if (roundWon) {
            const winner = currentPlayer;
            statusDisplay.textContent = winner === player_X ? "You have won!" : "Computer has won!";
            isGameActive = false;
            highlightWinningCells(winningCombo);

            if (winner === player_X) {
                savePlayerScore('tictactoe', winningScore);
            }
            showModal(winner === player_X ? "You win!" : "Computer wins!");
            return;
        }

        let roundDraw = !board.includes("");
        if (roundDraw) {
            statusDisplay.textContent = `Game ended in a draw!`;
            isGameActive = false;
            showModal("It's a draw!");
            return;
        }

        handlePlayerChange();
    }

    /**
     * Highlights the winning cells.
     * @param {number[]} combo - The array of winning cell indices.
     */
    function highlightWinningCells(combo) {
        combo.forEach(index => {
            document.querySelector(`[data-cell-index='${index}']`).classList.add('win');
        });
    }

    /**
     * Resets the game to its initial state.
     */
    function handleRestartGame() {
        isGameActive = true;
        currentPlayer = player_X;
        board = ['', '', '', '', '', '', '', '', ''];
        statusDisplay.textContent = "Your turn";
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'win');
        });
        modal.classList.add('hidden');
        gameBoard.style.pointerEvents = 'auto';
    }

    /**
     * Saves the player's score to the database.
     * @param {string} gameName - The name of the game.
     * @param {number} playerScore - The score to save.
     */
    async function savePlayerScore(gameName, playerScore) {
        const formData = new FormData();
        formData.append('game_name', gameName);
        formData.append('score', playerScore);

        try {
            const response = await fetch('../../api/save_score.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                console.log('Score saved successfully:', result.message);
            } else {
                console.error('Failed to save score:', result.message);
            }
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }

    /**
     * Shows the game over modal.
     * @param {string} message - The message to display in the modal.
     */
    function showModal(message) {
        modalMessage.textContent = message;
        setTimeout(() => {
            modal.classList.remove('hidden');
        }, 500); // Small delay to allow winning animation to be seen
    }

    /**
     * Initializes the game board and event listeners.
     */
    function initializeGame() {
        modal.classList.add('hidden');
        gameBoard.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-cell-index', i);
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
        statusDisplay.textContent = "Your turn";
        restartButton.addEventListener('click', handleRestartGame);
        playAgainButton.addEventListener('click', handleRestartGame);
    }

    initializeGame();
});

