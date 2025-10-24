document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const timeDisplay = document.getElementById('time-display');
    const scoreDisplay = document.getElementById('score-display');
    const hintText = document.getElementById('hint-text');
    const wordDisplay = document.getElementById('scrambled-word-display');
    const guessForm = document.getElementById('guess-form');
    const guessInput = document.getElementById('guess-input');
    const refreshButton = document.getElementById('refresh-button');
    const endGameButton = document.getElementById('end-game-button');
    const endGameModal = document.getElementById('end-game-modal');
    const finalScoreDisplay = document.getElementById('final-score-display');
    const playAgainButton = document.getElementById('play-again-button');
    const correctGuessModal = document.getElementById('correct-guess-modal');

    // --- Game State ---
    let score = 0;
    let timer;
    let timerId;
    let currentWord = '';
    let wordPool = [];
    let isPlaying = false;
    let isTransitioning = false;

    const WORDS = ["javascript", "developer", "arcadia", "challenge", "interface", "project", "coding", "algorithm", "variable", "function", "database", "framework", "component", "styling"];
    const TIME_LIMIT = 30;
    const COOLDOWN_TIME = 3;
    const SUCCESS_MODAL_DURATION = 2000;

    // --- Game Logic ---
    function startGame() {
        score = 0;
        isPlaying = true;
        isTransitioning = false;
        updateScore(0);
        endGameModal.classList.add('hidden');
        correctGuessModal.classList.add('hidden');
        shuffleWordPool();
        newWord();
    }

    function shuffleWordPool() {
        wordPool = [...WORDS].sort(() => Math.random() - 0.5);
    }

    function newWord() {
        if (!isPlaying) return;

        if (wordPool.length === 0) {
            shuffleWordPool();
        }
        currentWord = wordPool.pop();

        let scrambled = scrambleWord(currentWord);
        wordDisplay.textContent = scrambled;
        guessInput.value = '';
        guessInput.disabled = false;
        guessInput.focus();
        hintText.textContent = `The word has ${currentWord.length} letters.`;
        resetTimer();
    }

    function scrambleWord(word) {
        let arr = word.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        const scrambled = arr.join('');
        return scrambled === word ? scrambleWord(word) : scrambled;
    }

    function checkGuess(e) {
        e.preventDefault();
        if (!isPlaying || isTransitioning) return;

        const playerGuess = guessInput.value.toLowerCase().trim();
        if (playerGuess === currentWord) {
            // RECTIFIED: Standardized scoring to a fixed 10 points
            const points = 10;
            updateScore(score + points);
            wordDisplay.classList.remove('shake');

            correctGuessModal.classList.remove('hidden');
            setTimeout(() => {
                correctGuessModal.classList.add('hidden');
                hintText.textContent = `Correct! +${points} points.`;
                startCooldown(newWord);
            }, SUCCESS_MODAL_DURATION);

        } else {
            hintText.textContent = "Wrong, try again!";
            wordDisplay.classList.add('shake');
            setTimeout(() => wordDisplay.classList.remove('shake'), 500);
        }
        guessInput.value = '';
    }

    // --- Cooldown Logic ---
    function startCooldown(callback) {
        isTransitioning = true;
        guessInput.disabled = true;
        clearInterval(timerId);

        let countdown = COOLDOWN_TIME;
        hintText.textContent += ` Next word in ${countdown}...`;

        const cooldownInterval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(cooldownInterval);
                isTransitioning = false;
                callback();
            }
        }, 1000);
    }

    // --- Timer ---
    function resetTimer() {
        clearInterval(timerId);
        timer = TIME_LIMIT;
        timeDisplay.textContent = `${timer}s`;
        timerId = setInterval(() => {
            timer--;
            timeDisplay.textContent = `${timer}s`;
            if (timer <= 0) {
                clearInterval(timerId);
                hintText.textContent = `Time's up! The word was "${currentWord}".`;
                startCooldown(newWord);
            }
        }, 1000);
    }

    function updateScore(newScore) {
        score = newScore;
        scoreDisplay.textContent = score;
    }

    // --- End Game ---
    function endGame() {
        if (!isPlaying) return;
        isPlaying = false;
        isTransitioning = true;
        clearInterval(timerId);
        savePlayerScore('UnscrambleWords', score);
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
    guessForm.addEventListener('submit', checkGuess);

    refreshButton.addEventListener('click', () => {
        if (isTransitioning || !isPlaying) return;
        hintText.textContent = `Skipped! The word was "${currentWord}".`;
        startCooldown(newWord);
    });

    endGameButton.addEventListener('click', endGame);
    playAgainButton.addEventListener('click', startGame);

    // --- Initial Start ---
    startGame();
});

