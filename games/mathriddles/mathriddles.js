document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const difficultySelection = document.getElementById('difficulty-selection');
    const gameScreen = document.getElementById('game-screen');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const timeDisplay = document.getElementById('time-display');
    const scoreDisplay = document.getElementById('score-display');
    const hintText = document.getElementById('hint-text');
    const riddleDisplay = document.getElementById('riddle-display');
    const guessForm = document.getElementById('guess-form');
    const guessInput = document.getElementById('guess-input');
    const skipButton = document.getElementById('skip-button');
    const endGameButton = document.getElementById('end-game-button');
    const endGameModal = document.getElementById('end-game-modal');
    const finalScoreDisplay = document.getElementById('final-score-display');
    const playAgainButton = document.getElementById('play-again-button');
    const correctGuessModal = document.getElementById('correct-guess-modal');

    // --- Game State ---
    let score = 0;
    let timer;
    let timerId;
    let currentRiddle = {};
    let difficulty = 'easy';
    let isPlaying = false;
    let isTransitioning = false;

    const TIME_LIMIT = 30;
    const COOLDOWN_TIME = 3;
    const SUCCESS_MODAL_DURATION = 1500;

    // --- Riddle Generation with More Variety ---
    function generateRiddle(level) {
        let question, answer;
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        switch (level) {
            case 'medium':
                const typeMed = rand(1, 3);
                if (typeMed === 1) { // Multiplication
                    const num1 = rand(3, 12);
                    const num2 = rand(3, 12);
                    question = `${num1} × ${num2}`;
                    answer = num1 * num2;
                } else if (typeMed === 2) { // Clean Division
                    const divisor = rand(2, 10);
                    const quotient = rand(2, 10);
                    const dividend = divisor * quotient;
                    question = `${dividend} ÷ ${divisor}`;
                    answer = quotient;
                } else { // Two-step addition/subtraction
                    const num1 = rand(20, 50);
                    const num2 = rand(10, 30);
                    const num3 = rand(1, 10);
                    question = `(${num1} + ${num2}) - ${num3}`;
                    answer = (num1 + num2) - num3;
                }
                break;

            case 'hard':
                const typeHard = rand(1, 3);
                if (typeHard === 1) { // Order of Operations
                    const num1 = rand(2, 10);
                    const num2 = rand(3, 10);
                    const num3 = rand(2, 10);
                    question = `${num1} + ${num2} × ${num3}`;
                    answer = num1 + (num2 * num3);
                } else if (typeHard === 2) { // Simple Algebra
                    const num1 = rand(5, 25);
                    const num2 = rand(num1 + 5, 50); // Ensure answer is positive
                    question = `${num1} + ? = ${num2}`;
                    answer = num2 - num1;
                } else { // Three-step operation
                    const num1 = rand(10, 20);
                    const num2 = rand(2, 5);
                    const num3 = rand(5, 15);
                    question = `(${num1} × ${num2}) - ${num3}`;
                    answer = (num1 * num2) - num3;
                }
                break;

            case 'easy':
            default:
                const typeEasy = rand(1, 2);
                if (typeEasy === 1) { // Addition
                    const num1 = rand(5, 25);
                    const num2 = rand(5, 25);
                    question = `${num1} + ${num2}`;
                    answer = num1 + num2;
                } else { // Subtraction
                    const num1 = rand(15, 40);
                    const num2 = rand(1, 14);
                    question = `${num1} - ${num2}`;
                    answer = num1 - num2;
                }
                break;
        }
        return { question, answer };
    }


    // --- Game Flow ---
    function startGame(selectedDifficulty) {
        difficulty = selectedDifficulty;
        score = 0;
        isPlaying = true;
        isTransitioning = false;
        updateScore(0);

        difficultySelection.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        endGameModal.classList.add('hidden');
        correctGuessModal.classList.add('hidden');

        newRiddle();
    }

    function newRiddle() {
        if (!isPlaying) return;
        currentRiddle = generateRiddle(difficulty);
        riddleDisplay.textContent = currentRiddle.question;
        guessInput.value = '';
        guessInput.disabled = false;
        guessInput.focus();
        hintText.textContent = `Solve the riddle!`;
        resetTimer();
    }

    // --- Standardized Scoring ---
    function checkGuess(e) {
        e.preventDefault();
        if (!isPlaying || isTransitioning) return;

        const playerGuess = parseInt(guessInput.value, 10);
        if (!isNaN(playerGuess) && playerGuess === currentRiddle.answer) {
            let points = 0;
            if (difficulty === 'easy') points = 5;
            else if (difficulty === 'medium') points = 10;
            else if (difficulty === 'hard') points = 15;

            updateScore(score + points);

            correctGuessModal.classList.remove('hidden');
            setTimeout(() => {
                correctGuessModal.classList.add('hidden');
                hintText.textContent = `Correct! +${points} points.`;
                startCooldown(newRiddle);
            }, SUCCESS_MODAL_DURATION);

        } else {
            hintText.textContent = "Wrong answer, try again!";
            riddleDisplay.classList.add('shake');
            setTimeout(() => riddleDisplay.classList.remove('shake'), 500);
        }
        guessInput.value = '';
    }

    function startCooldown(callback) {
        isTransitioning = true;
        guessInput.disabled = true;
        clearInterval(timerId);

        let countdown = COOLDOWN_TIME;
        hintText.textContent += ` Next riddle in ${countdown}...`; // Append to current message

        const cooldownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                // The hint text is already set, so we just update the countdown part if needed, or leave it.
            } else {
                clearInterval(cooldownInterval);
                isTransitioning = false;
                callback();
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timerId);
        timer = TIME_LIMIT;
        timeDisplay.textContent = `${timer}s`;
        timerId = setInterval(() => {
            timer--;
            timeDisplay.textContent = `${timer}s`;
            if (timer <= 0) {
                clearInterval(timerId);
                // RECTIFIED: Shows answer when time runs out
                hintText.textContent = `Time's up! The answer was ${currentRiddle.answer}.`;
                startCooldown(newRiddle);
            }
        }, 1000);
    }

    function updateScore(newScore) {
        score = newScore;
        scoreDisplay.textContent = score;
    }

    function endGame() {
        if (!isPlaying) return;
        isPlaying = false;
        isTransitioning = true;
        clearInterval(timerId);
        savePlayerScore('MathRiddles', score);
        finalScoreDisplay.textContent = score;
        endGameModal.classList.remove('hidden');
    }

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
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            startGame(button.dataset.difficulty);
        });
    });

    guessForm.addEventListener('submit', checkGuess);

    // RECTIFIED: Shows answer on skip
    skipButton.addEventListener('click', () => {
        if (isTransitioning || !isPlaying) return;
        hintText.textContent = `Skipped! The answer was ${currentRiddle.answer}.`;
        startCooldown(newRiddle);
    });

    endGameButton.addEventListener('click', endGame);

    playAgainButton.addEventListener('click', () => {
        endGameModal.classList.add('hidden');
        gameScreen.classList.add('hidden');
        difficultySelection.classList.remove('hidden');
    });
});

