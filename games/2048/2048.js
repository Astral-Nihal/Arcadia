document.addEventListener('DOMContentLoaded', () => {
    const gameBoardContainer = document.getElementById('game-board-container');
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const restartButton = document.getElementById('restart-button');
    const gameOverModal = document.getElementById('modal');
    const finalScoreDisplay = document.getElementById('modal-message');
    const playAgainButton = document.getElementById('play-again-button');

    const GRID_SIZE = 4;
    let board = [];
    let score = 0;
    let isLocked = false;

    function setupGame() {
        board = Array(GRID_SIZE * GRID_SIZE).fill(0);
        score = 0;
        updateScore(0);
        gameBoard.innerHTML = '';
        gameOverModal.classList.add('hidden'); // Fully hides the modal now

        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            gameBoard.appendChild(cell);
        }

        addRandomTile();
        addRandomTile();
        renderBoard();
    }

    function renderBoard(mergedTilesInfo = []) {
        // Animate merged tiles first
        mergedTilesInfo.forEach(info => {
            const tile = createTile(info.x, info.y, info.value, false);
            tile.classList.add('tile-merged');
            tile.addEventListener('animationend', () => tile.remove(), { once: true });
        });

        // Clear and redraw all current tiles
        const existingTiles = gameBoardContainer.querySelectorAll('.tile');
        existingTiles.forEach(tile => tile.remove());

        for (let i = 0; i < board.length; i++) {
            if (board[i] !== 0) {
                const y = Math.floor(i / GRID_SIZE);
                const x = i % GRID_SIZE;
                createTile(x, y, board[i], false);
            }
        }
    }

    function createTile(x, y, value, isNew) {
        const tile = document.createElement('div');
        const containerWidth = gameBoardContainer.offsetWidth;
        if (containerWidth === 0) return null;

        const cellGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-gap'));
        const cellSize = (containerWidth - (GRID_SIZE + 1) * cellGap) / GRID_SIZE;

        tile.classList.add('tile');
        if (isNew) {
            tile.classList.add('tile-new');
        }
        tile.dataset.value = value;
        tile.textContent = value;

        if (value > 512) tile.style.fontSize = '1.8rem';
        else if (value > 64) tile.style.fontSize = '2.2rem';
        else tile.style.fontSize = '2.5rem';

        tile.style.width = `${cellSize}px`;
        tile.style.height = `${cellSize}px`;
        tile.style.top = `${y * (cellSize + cellGap) + cellGap}px`;
        tile.style.left = `${x * (cellSize + cellGap) + cellGap}px`;

        gameBoardContainer.appendChild(tile);
        return tile;
    }

    function addRandomTile() {
        const emptyCells = board.map((val, index) => (val === 0 ? index : -1)).filter(val => val !== -1);
        if (emptyCells.length > 0) {
            const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const newValue = Math.random() > 0.9 ? 4 : 2;
            board[randomIndex] = newValue;
            const x = randomIndex % GRID_SIZE;
            const y = Math.floor(randomIndex / GRID_SIZE);
            createTile(x, y, newValue, true); // Create with "new" animation
        }
    }

    function updateScore(points) {
        score += points;
        scoreDisplay.textContent = score;
    }

    function handleKeyPress(e) {
        if (isLocked) return;
        let moved = false;
        switch (e.key) {
            case 'ArrowUp': moved = slideUp(); break;
            case 'ArrowDown': moved = slideDown(); break;
            case 'ArrowLeft': moved = slideLeft(); break;
            case 'ArrowRight': moved = slideRight(); break;
            default: return;
        }

        if (moved) {
            isLocked = true;
            setTimeout(() => {
                renderBoard();
                addRandomTile();
                if (isGameOver()) {
                    handleGameOver();
                }
                isLocked = false;
            }, 100);
        }
    }

    function slide(line) {
        const filtered = line.filter(cell => cell !== 0);
        const newLine = [];
        for (let i = 0; i < filtered.length; i++) {
            if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
                const mergedValue = filtered[i] * 2;
                newLine.push(mergedValue);
                updateScore(mergedValue);
                i++;
            } else {
                newLine.push(filtered[i]);
            }
        }
        while (newLine.length < GRID_SIZE) {
            newLine.push(0);
        }
        return newLine;
    }

    function slideLeft() {
        let moved = false;
        for (let i = 0; i < GRID_SIZE; i++) {
            const start = i * GRID_SIZE;
            const row = board.slice(start, start + GRID_SIZE);
            const newRow = slide(row);
            if (row.join(',') !== newRow.join(',')) {
                moved = true;
            }
            board.splice(start, GRID_SIZE, ...newRow);
        }
        return moved;
    }

    function slideRight() {
        let moved = false;
        for (let i = 0; i < GRID_SIZE; i++) {
            const start = i * GRID_SIZE;
            const row = board.slice(start, start + GRID_SIZE).reverse();
            const newRow = slide(row).reverse();
            if (board.slice(start, start + GRID_SIZE).join(',') !== newRow.join(',')) {
                moved = true;
            }
            board.splice(start, GRID_SIZE, ...newRow);
        }
        return moved;
    }

    function slideUp() {
        let moved = false;
        for (let i = 0; i < GRID_SIZE; i++) {
            const column = [board[i], board[i + GRID_SIZE], board[i + 2 * GRID_SIZE], board[i + 3 * GRID_SIZE]];
            const newColumn = slide(column);
            if (column.join(',') !== newColumn.join(',')) {
                moved = true;
            }
            for (let j = 0; j < GRID_SIZE; j++) {
                board[i + j * GRID_SIZE] = newColumn[j];
            }
        }
        return moved;
    }

    function slideDown() {
        let moved = false;
        for (let i = 0; i < GRID_SIZE; i++) {
            const column = [board[i], board[i + GRID_SIZE], board[i + 2 * GRID_SIZE], board[i + 3 * GRID_SIZE]].reverse();
            const newColumn = slide(column).reverse();
            if ([board[i], board[i + GRID_SIZE], board[i + 2 * GRID_SIZE], board[i + 3 * GRID_SIZE]].join(',') !== newColumn.join(',')) {
                moved = true;
            }
            for (let j = 0; j < GRID_SIZE; j++) {
                board[i + j * GRID_SIZE] = newColumn[j];
            }
        }
        return moved;
    }

    function isGameOver() {
        if (board.includes(0)) return false;
        for (let i = 0; i < board.length; i++) {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            if (x < GRID_SIZE - 1 && board[i] === board[i + 1]) return false;
            if (y < GRID_SIZE - 1 && board[i] === board[i + GRID_SIZE]) return false;
        }
        return true;
    }

    function handleGameOver() {
        finalScoreDisplay.textContent = `Your Score: ${score}`;
        gameOverModal.classList.remove('hidden');
        savePlayerScore('2048', score);
    }

    async function savePlayerScore(gameName, playerScore) {
        if (playerScore === 0) return;
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

    document.addEventListener('keydown', handleKeyPress);
    restartButton.addEventListener('click', setupGame);
    playAgainButton.addEventListener('click', setupGame);
    window.addEventListener('resize', () => renderBoard());

    setTimeout(setupGame, 0);
});

