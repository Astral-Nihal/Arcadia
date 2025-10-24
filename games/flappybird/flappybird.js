document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const scoreDisplay = document.getElementById('score-display');
    const gameOverModal = document.getElementById('game-over-modal');
    const finalScoreElement = document.getElementById('final-score');
    const playAgainBtn = document.getElementById('play-again-btn');

    // --- Game Constants ---
    const BIRD_WIDTH = 40;
    const BIRD_HEIGHT = 30;
    const PIPE_WIDTH = 80;
    const PIPE_GAP = 200;
    const GRAVITY = 0.5;
    const FLAP_STRENGTH = 8;
    const PIPE_SPEED = 4;
    const PIPE_INTERVAL = 100; // In frames

    // --- Game State ---
    let birdY, birdVelocity, pipes, score, frameCount, gameState;

    // --- Game Initialization ---
    function init() {
        birdY = canvas.height / 2;
        birdVelocity = 0;
        pipes = [];
        score = 0;
        frameCount = 0;
        gameState = 'ready';

        scoreDisplay.textContent = score;
        startScreen.classList.remove('hidden');
        gameOverModal.classList.add('hidden');
        draw(); // Draw initial ready screen
    }

    // --- Main Game Loop ---
    function gameLoop() {
        if (gameState === 'playing') {
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }
    }

    // --- Update Game Logic ---
    function update() {
        // Bird physics
        birdVelocity += GRAVITY;
        birdY += birdVelocity;

        // Pipe generation
        frameCount++;
        if (frameCount % PIPE_INTERVAL === 0) {
            const pipeY = Math.random() * (canvas.height - PIPE_GAP - 150) + 75;
            pipes.push({ x: canvas.width, y: pipeY });
        }

        // Move pipes
        pipes.forEach(pipe => {
            pipe.x -= PIPE_SPEED;
        });

        // Remove off-screen pipes
        pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);

        // Score update
        pipes.forEach(pipe => {
            if (!pipe.passed && pipe.x < canvas.width / 2 - BIRD_WIDTH) {
                pipe.passed = true;
                score++;
                scoreDisplay.textContent = score;
            }
        });

        // Collision detection
        if (checkCollision()) {
            endGame();
        }
    }

    // --- RECTIFIED: Drawing with detailed bird and pipes ---
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- Draw Pipes ---
        const PIPE_HEAD_HEIGHT = 30;
        const PIPE_HEAD_WIDTH_ADJUST = 10;

        pipes.forEach(pipe => {
            const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
            pipeGradient.addColorStop(0, '#4ade80'); // Green-400
            pipeGradient.addColorStop(1, '#22c55e'); // Green-600
            ctx.fillStyle = pipeGradient;

            // Top pipe body
            ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.y);
            // Top pipe head
            ctx.fillRect(pipe.x - PIPE_HEAD_WIDTH_ADJUST / 2, pipe.y - PIPE_HEAD_HEIGHT, PIPE_WIDTH + PIPE_HEAD_WIDTH_ADJUST, PIPE_HEAD_HEIGHT);

            // Bottom pipe body
            ctx.fillRect(pipe.x, pipe.y + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.y - PIPE_GAP);
            // Bottom pipe head
            ctx.fillRect(pipe.x - PIPE_HEAD_WIDTH_ADJUST / 2, pipe.y + PIPE_GAP, PIPE_WIDTH + PIPE_HEAD_WIDTH_ADJUST, PIPE_HEAD_HEIGHT);
        });

        // --- Draw Bird ---
        ctx.save();
        // Translate context to the bird's center for rotation
        ctx.translate(canvas.width / 2, birdY + BIRD_HEIGHT / 2);
        // Rotate based on velocity
        const rotation = Math.PI / 6 * (birdVelocity / FLAP_STRENGTH); // Max 30-degree tilt
        ctx.rotate(rotation);

        // Draw bird's body (a simple yellow ellipse)
        ctx.fillStyle = '#facc15'; // Yellow-400
        ctx.beginPath();
        ctx.ellipse(0, 0, BIRD_WIDTH / 2, BIRD_HEIGHT / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw eye
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(BIRD_WIDTH / 4, -BIRD_HEIGHT / 8, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw beak
        ctx.fillStyle = '#fb923c'; // Orange-400
        ctx.beginPath();
        ctx.moveTo(BIRD_WIDTH / 2, 0);
        ctx.lineTo(BIRD_WIDTH / 2 + 8, -4);
        ctx.lineTo(BIRD_WIDTH / 2 + 8, 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore(); // Restore context to original state
    }

    // --- Collision Detection ---
    function checkCollision() {
        const birdLeft = canvas.width / 2 - BIRD_WIDTH / 2;
        const birdRight = birdLeft + BIRD_WIDTH;
        const birdTop = birdY;
        const birdBottom = birdY + BIRD_HEIGHT;

        // Ground and ceiling collision
        if (birdBottom > canvas.height || birdTop < 0) {
            return true;
        }

        // Pipe collision
        for (const pipe of pipes) {
            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + PIPE_WIDTH;
            const pipeTopY = pipe.y;
            const pipeBottomY = pipe.y + PIPE_GAP;

            if (birdRight > pipeLeft && birdLeft < pipeRight &&
                (birdTop < pipeTopY || birdBottom > pipeBottomY)) {
                return true;
            }
        }
        return false;
    }

    // --- Game Actions ---
    function flap() {
        if (gameState === 'playing') {
            birdVelocity = -FLAP_STRENGTH;
        }
    }

    function startGame() {
        gameState = 'playing';
        startScreen.classList.add('hidden');
        gameLoop();
    }

    function endGame() {
        gameState = 'over';
        finalScoreElement.textContent = score;
        savePlayerScore('FlappyBird', score);
        gameOverModal.classList.remove('hidden');
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
    startButton.addEventListener('click', startGame);
    playAgainBtn.addEventListener('click', init);
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (gameState === 'playing') {
                flap();
            }
        }
    });
    canvas.addEventListener('mousedown', () => {
        if (gameState === 'playing') {
            flap();
        }
    });
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState === 'playing') {
            flap();
        }
    });


    // --- Initial Load ---
    init();
});

