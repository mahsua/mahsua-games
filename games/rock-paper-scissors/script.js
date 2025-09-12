document.addEventListener('DOMContentLoaded', () => {
    const choices = ['rock', 'paper', 'scissors'];
    const choiceButtons = document.querySelectorAll('.choice-btn');
    const playerChoiceDisplay = document.getElementById('player-choice-display');
    const computerChoiceDisplay = document.getElementById('computer-choice-display');
    const resultDisplay = document.getElementById('result-display');
    const playerScoreDisplay = document.getElementById('player-score');
    const computerScoreDisplay = document.getElementById('computer-score');

    const popupOverlay = document.getElementById('popup-overlay');
    const popupResultMessage = document.getElementById('popup-result-message');
    const popupPlayerScore = document.getElementById('popup-player-score');
    const popupComputerScore = document.getElementById('popup-computer-score');
    const popupRestartBtn = document.getElementById('popup-restart-btn');

    let playerScore = 0;
    let computerScore = 0;

    const playRound = (playerChoice) => {
        const computerChoice = choices[Math.floor(Math.random() * 3)];
        
        playerChoiceDisplay.textContent = `You chose: ${getEmoji(playerChoice)} ${playerChoice}`;
        computerChoiceDisplay.textContent = `Computer chose: ${getEmoji(computerChoice)} ${computerChoice}`;

        let result = '';
        if (playerChoice === computerChoice) {
            result = 'It\'s a tie!';
            resultDisplay.style.color = '#555';
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            result = 'You win!';
            playerScore++;
            resultDisplay.style.color = '#2ecc71';
        } else {
            result = 'You lose!';
            computerScore++;
            resultDisplay.style.color = '#e74c3c';
        }

        resultDisplay.textContent = result;
        playerScoreDisplay.textContent = playerScore;
        computerScoreDisplay.textContent = computerScore;

        if (playerScore >= 5 || computerScore >= 5) {
            endGame();
        }
    };

    const endGame = () => {
        let finalMessage = '';
        if (playerScore > computerScore) {
            finalMessage = 'Congratulations, you won the game!';
            popupResultMessage.style.color = '#2ecc71';
        } else {
            finalMessage = 'The computer won the game. Better luck next time!';
            popupResultMessage.style.color = '#e74c3c';
        }
        
        popupResultMessage.textContent = finalMessage;
        popupPlayerScore.textContent = playerScore;
        popupComputerScore.textContent = computerScore;

        popupOverlay.style.display = 'flex';
        
        choiceButtons.forEach(button => button.disabled = true);
    };

    const getEmoji = (choice) => {
        switch(choice) {
            case 'rock':
                return '✊';
            case 'paper':
                return '✋';
            case 'scissors':
                return '✌️';
            default:
                return '';
        }
    };

    const restartGame = () => {
        playerScore = 0;
        computerScore = 0;
        playerScoreDisplay.textContent = '0';
        computerScoreDisplay.textContent = '0';
        resultDisplay.textContent = '';
        playerChoiceDisplay.textContent = 'You chose:';
        computerChoiceDisplay.textContent = 'Computer chose:';
        
        choiceButtons.forEach(button => button.disabled = false);
        popupOverlay.style.display = 'none';
    };

    choiceButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            playRound(event.currentTarget.id);
        });
    });

    popupRestartBtn.addEventListener('click', restartGame);
});
