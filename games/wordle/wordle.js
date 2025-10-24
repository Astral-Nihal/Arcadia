document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const grid = document.getElementById('grid-container');
    const keyboard = document.getElementById('keyboard');
    const gameOverModal = document.getElementById('game-over-modal');
    const modalTitle = document.getElementById('modal-title');
    const correctWordDisplay = document.getElementById('correct-word-display');
    const playAgainButton = document.getElementById('play-again-button');
    const toastContainer = document.getElementById('toast-container');

    // --- Game Constants & State ---
    const WORD_LENGTH = 5;
    const GUESS_LIMIT = 6;
    let targetWord = '';
    let currentGuess = '';
    let guessCount = 0;
    let isGameOver = false;
    let isAnimating = false;
    let wordPool = [];
    const VALID_GUESSES = ["cigar", "rebut", "sissy", "humph", "awake", "blush", "focal", "evade", "naval", "serve", "heath", "dwarf", "model", "karma", "stink", "grade", "quiet", "bench", "abate", "feign", "major", "death", "fresh", "crust", "stool", "colon", "abase", "marry", "react", "batty", "pride", "floss", "helix", "croak", "staff", "paper", "unfed", "whelp", "trawl", "outdo", "adobe", "crazy", "sower", "repay", "digit", "crimp", "cluck", "using", "plant", "abuse", "thorp", "pleat", "visas", "strip", "ninth", "bough", "flown", "lusty", "stand", "tight", "booby", "trend", "viral", "drove", "stove", "shall", "wreck", "mangy", "loopy", "howdy", "bloat", "ready", "bland", "cinch", "spicy", "scour", "badly", "holly", "hound", "slosh", "steep", "brawl", "camel", "dumpy", "haste", "brash", "stave", "unlit", "trick", "shrug", "dopey", "gather", "swill", "civic", "judge", "touch", "vista", "scorn", "shalt", "sorry", "sweep", "slunk", "stomp", "scrub", "shirk", "forgo", "weedy", "quill", "crone", "stout", "stole", "lowly", "trove", "wider", "vodka", "dizzy", "shard", "silly", "yield", "stank", "stark", "belch", "piney", "slimy", "aloud", "crank", "scare", "razor", "quake", "brick", "giddy", "smack", "utter", "agora", "glean", "swoop", "whine", "scoff", "thick", "canny", "clone", "scold", "caulk", "prawn", "syrup", "goose", "covet", "prune", "smoky", "wiser", "chest", "tardy", "kiosk", "rhyme", "daddy", "arson", "sugar", "valet", "could", "chide"];
    const TARGET_WORDS = ["cigar", "rebut", "sissy", "humph", "awake", "blush", "focal", "evade", "naval", "serve", "heath", "dwarf", "model", "karma", "stink", "grade", "quiet", "bench", "abate", "feign", "major", "death", "fresh", "crust", "stool", "colon", "abase", "marry", "react", "batty", "pride", "floss", "helix", "croak", "staff", "paper", "unfed", "whelp", "trawl", "outdo", "adobe", "crazy", "sower", "repay", "digit", "crimp", "cluck", "using", "plant", "abuse", "thorp", "pleat", "visas", "strip", "ninth", "bough", "flown", "lusty", "stand", "tight", "booby", "trend", "viral", "drove", "stove", "shall", "wreck", "mangy", "loopy", "howdy", "bloat", "ready", "bland", "cinch", "spicy", "scour", "badly", "holly", "hound", "slosh", "steep", "brawl", "camel", "dumpy", "haste", "brash", "stave", "unlit", "trick", "shrug", "dopey", "gather", "swill", "civic", "judge", "touch", "vista", "scorn", "shalt", "sorry", "sweep", "slunk", "stomp", "scrub", "shirk", "forgo", "weedy", "quill", "crone", "stout", "stole", "lowly", "trove", "wider", "vodka", "dizzy", "shard", "silly", "yield", "stank", "stark", "belch", "piney", "slimy", "aloud", "crank", "scare", "razor", "quake", "brick", "giddy", "smack", "utter", "agora", "glean", "swoop", "whine", "scoff", "thick", "canny", "clone", "scold", "caulk", "prawn", "syrup", "goose", "covet", "prune", "smoky", "wiser", "chest", "tardy", "kiosk", "rhyme", "daddy", "arson", "sugar", "valet", "could", "chide"];

    // --- "Shuffled Deck" Logic ---
    function shuffleWordPool() { wordPool = [...TARGET_WORDS].sort(() => Math.random() - 0.5); }
    function getNextWord() {
        if (wordPool.length === 0) shuffleWordPool();
        return wordPool.pop();
    }

    // --- Game Initialization ---
    function startGame() {
        isGameOver = false;
        isAnimating = false;
        currentGuess = '';
        guessCount = 0;
        targetWord = getNextWord();
        console.log('Target Word:', targetWord); // For testing purposes

        grid.innerHTML = '';
        for (let i = 0; i < GUESS_LIMIT; i++) {
            const row = document.createElement('div');
            row.classList.add('row');
            for (let j = 0; j < WORD_LENGTH; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                row.appendChild(tile);
            }
            grid.appendChild(row);
        }

        const keys = ['QWERTYUIOP', 'ASDFGHJKL', 'ENTERZXCVBNMBACKSPACE'];
        keyboard.innerHTML = '';
        keys.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('keyboard-row');
            const keyChars = row === 'ENTERZXCVBNMBACKSPACE' ? ['ENTER', ...'ZXCVBNM', 'BACKSPACE'] : row.split('');
            for (const key of keyChars) {
                const keyBtn = document.createElement('button');
                keyBtn.classList.add('key');
                keyBtn.textContent = key;
                keyBtn.dataset.key = key;
                rowDiv.appendChild(keyBtn);
            }
            keyboard.appendChild(rowDiv);
        });

        gameOverModal.classList.add('hidden');
    }

    // --- Input Handling ---
    function processInput(key) {
        if (isGameOver || isAnimating) return;
        if (key === 'BACKSPACE') deleteLetter();
        else if (key === 'ENTER') submitGuess();
        else if (key.length === 1 && key.match(/^[A-Z]$/) && currentGuess.length < WORD_LENGTH) addLetter(key);
    }

    function addLetter(letter) {
        const currentRow = grid.children[guessCount];
        const tile = currentRow.children[currentGuess.length];
        tile.textContent = letter;
        tile.classList.add('filled');
        currentGuess += letter;
    }

    function deleteLetter() {
        if (currentGuess.length === 0) return;
        currentGuess = currentGuess.slice(0, -1);
        const currentRow = grid.children[guessCount];
        const tile = currentRow.children[currentGuess.length];
        tile.textContent = '';
        tile.classList.remove('filled');
    }

    // --- Guess Submission ---
    function submitGuess() {
        if (currentGuess.length !== WORD_LENGTH) {
            showAlert('Not enough letters');
            shakeCurrentRow();
            return;
        }
        if (!VALID_GUESSES.includes(currentGuess.toLowerCase())) {
            showAlert('Not in word list');
            shakeCurrentRow();
            return;
        }
        revealGuess();
    }

    // RECTIFIED: More robust toast notification logic
    function showAlert(message) {
        toastContainer.innerHTML = ''; // Clear previous toasts immediately

        const toast = document.createElement('div');
        toast.textContent = message;
        toast.classList.add('toast');
        toastContainer.appendChild(toast);

        // Short delay to allow element to be added to DOM before triggering animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Timeout to start fading out
        setTimeout(() => {
            toast.classList.remove('show');
            // Timeout to remove from DOM after fade out transition (300ms in CSS)
            setTimeout(() => {
                if (toast.parentElement) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 1500); // Visible duration
    }

    function shakeCurrentRow() {
        const currentRow = grid.children[guessCount];
        currentRow.classList.add('shake');
        currentRow.addEventListener('animationend', () => {
            currentRow.classList.remove('shake');
        }, { once: true });
    }

    function revealGuess() {
        isAnimating = true;
        const currentRow = grid.children[guessCount];
        const guessLetters = currentGuess.toLowerCase().split('');
        const tempTarget = targetWord.split('');

        // First pass for 'correct' letters
        guessLetters.forEach((letter, index) => {
            if (letter === tempTarget[index]) {
                currentRow.children[index].dataset.status = 'correct';
                tempTarget[index] = null;
            }
        });

        // Second pass for 'present' letters
        guessLetters.forEach((letter, index) => {
            if (currentRow.children[index].dataset.status) return;
            if (tempTarget.includes(letter)) {
                currentRow.children[index].dataset.status = 'present';
                tempTarget[tempTarget.indexOf(letter)] = null;
            } else {
                currentRow.children[index].dataset.status = 'absent';
            }
        });

        // Animate and apply colors
        Array.from(currentRow.children).forEach((tile, index) => {
            setTimeout(() => {
                tile.classList.add('flip-in');
                tile.addEventListener('transitionend', () => {
                    tile.classList.remove('flip-in');
                    tile.classList.add(tile.dataset.status);
                    tile.classList.add('flip-out');
                    updateKeyboard(tile.textContent, tile.dataset.status);

                    if (index === WORD_LENGTH - 1) {
                        isAnimating = false;
                        checkEndCondition();
                    }
                }, { once: true });
            }, index * 250); // Slower flip for better visual
        });
    }

    function updateKeyboard(letter, status) {
        const key = keyboard.querySelector(`[data-key="${letter.toUpperCase()}"]`);
        const currentStatus = key.dataset.status;

        // Don't downgrade a key's color
        if (currentStatus === 'correct') return;
        if (currentStatus === 'present' && status !== 'correct') return;

        key.dataset.status = status;
        key.classList.add(status);
    }

    function checkEndCondition() {
        if (currentGuess.toLowerCase() === targetWord) {
            endGame(true);
        } else if (guessCount === GUESS_LIMIT - 1) {
            endGame(false);
        } else {
            guessCount++;
            currentGuess = '';
        }
    }

    function endGame(isWin) {
        isGameOver = true;
        setTimeout(() => {
            modalTitle.textContent = isWin ? 'Congratulations!' : 'So Close!';
            correctWordDisplay.textContent = targetWord.toUpperCase();
            gameOverModal.classList.remove('hidden');
            if (isWin) {
                const score = (GUESS_LIMIT - guessCount) * 10;
                savePlayerScore('Wordle', score);
            }
        }, 1500); // Delay after last flip
    }

    async function savePlayerScore(gameName, playerScore) {
        if (playerScore <= 0) return;
        const formData = new FormData();
        formData.append('game_name', gameName);
        formData.append('score', playerScore);
        try {
            const response = await fetch('../../api/save_score.php', { method: 'POST', body: formData });
            const result = await response.json();
            if (!result.success) console.error('Failed to save score:', result.message);
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }

    // --- Event Listeners ---
    document.addEventListener('keydown', e => processInput(e.key.toUpperCase()));
    keyboard.addEventListener('click', e => {
        if (e.target.dataset.key) processInput(e.target.dataset.key);
    });
    playAgainButton.addEventListener('click', startGame);

    // --- Initial Start ---
    shuffleWordPool();
    startGame();
});

