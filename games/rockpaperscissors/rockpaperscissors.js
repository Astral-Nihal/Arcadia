document.addEventListener('DOMContentLoaded', () => {
    const playerScoreDisplay = document.getElementById('player-score');
    const computerScoreDisplay = document.getElementById('computer-score');
    const playerChoiceDisplay = document.getElementById('player-choice-display');
    const computerChoiceDisplay = document.getElementById('computer-choice-display');
    const resultText = document.getElementById('result-text');
    const choiceButtons = document.querySelectorAll('.choice-btn');

    // Modal elements
    const gameOverModal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalFinalScore = document.getElementById('modal-message');
    const playAgainButton = document.getElementById('play-again-button');

    let playerScore = 0;
    let computerScore = 0;
    const winningScore = 3;
    const choices = ['rock', 'paper', 'scissors'];
    const choiceEmojis = {
        rock: '✊',
        paper: '✋',
        scissors: '✌️'
    };

    function getComputerChoice() {
        const randomIndex = Math.floor(Math.random() * choices.length);
        return choices[randomIndex];
    }

    function playRound(playerSelection) {
        if (playerScore >= winningScore || computerScore >= winningScore) {
            return; // Game is over, don't play new rounds
        }

        const computerSelection = getComputerChoice();
        updateChoiceDisplays(playerSelection, computerSelection);

        // Determine winner
        if (playerSelection === computerSelection) {
            draw();
        } else if (
            (playerSelection === 'rock' && computerSelection === 'scissors') ||
            (playerSelection === 'paper' && computerSelection === 'rock') ||
            (playerSelection === 'scissors' && computerSelection === 'paper')
        ) {
            win(playerSelection, computerSelection);
        } else {
            lose(playerSelection, computerSelection);
        }

        checkGameOver();
    }

    function updateChoiceDisplays(player, computer) {
        playerChoiceDisplay.textContent = choiceEmojis[player];
        computerChoiceDisplay.textContent = choiceEmojis[computer];
    }

    function win(player, computer) {
        playerScore++;
        playerScoreDisplay.textContent = playerScore;
        resultText.textContent = `You Win! ${capitalize(player)} beats ${capitalize(computer)}.`;
        resultText.className = 'result-text win';
        playerChoiceDisplay.classList.add('winner');
        playerChoiceDisplay.classList.remove('loser');
        computerChoiceDisplay.classList.add('loser');
        computerChoiceDisplay.classList.remove('winner');
    }

    function lose(player, computer) {
        computerScore++;
        computerScoreDisplay.textContent = computerScore;
        resultText.textContent = `You Lose! ${capitalize(computer)} beats ${capitalize(player)}.`;
        resultText.className = 'result-text lose';
        playerChoiceDisplay.classList.add('loser');
        playerChoiceDisplay.classList.remove('winner');
        computerChoiceDisplay.classList.add('winner');
        computerChoiceDisplay.classList.remove('loser');
    }

    function draw() {
        resultText.textContent = "It's a Draw!";
        resultText.className = 'result-text draw';
        playerChoiceDisplay.classList.remove('winner', 'loser');
        computerChoiceDisplay.classList.remove('winner', 'loser');
    }

    function checkGameOver() {
        if (playerScore >= winningScore) {
            endGame(true);
        } else if (computerScore >= winningScore) {
            endGame(false);
        }
    }

    function endGame(playerWon) {
        modalTitle.textContent = playerWon ? 'Congratulations, You Won!' : 'Game Over, You Lost!';
        modalFinalScore.textContent = `Final Score: ${playerScore} - ${computerScore}`;

        // Delay showing the modal by 1 second
        setTimeout(() => {
            gameOverModal.classList.remove('hidden');

            // Save score if player won
            if (playerWon) {
                savePlayerScore('RockPaperScissors', playerScore);
            }
        }, 800); // 1000ms = 1 second
    }

    function resetGame() {
        playerScore = 0;
        computerScore = 0;
        playerScoreDisplay.textContent = '0';
        computerScoreDisplay.textContent = '0';
        resultText.textContent = 'Make your move!';
        resultText.className = 'result-text';
        playerChoiceDisplay.textContent = '?';
        computerChoiceDisplay.textContent = '?';
        playerChoiceDisplay.classList.remove('winner', 'loser');
        computerChoiceDisplay.classList.remove('winner', 'loser');
        gameOverModal.classList.add('hidden');
    }

    async function savePlayerScore(gameName, score) {
        if (score === 0) return;
        const formData = new FormData();
        formData.append('game_name', gameName);
        formData.append('score', score);

        try {
            const response = await fetch('../../api/save_score.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                console.log('Score saved successfully');
            } else {
                console.error('Failed to save score:', result.message);
            }
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    choiceButtons.forEach(button => {
        button.addEventListener('click', () => playRound(button.dataset.choice));
    });

    playAgainButton.addEventListener('click', resetGame);
});

