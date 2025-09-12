document.addEventListener('DOMContentLoaded', () => {
    const guessInput = document.getElementById('guess-input');
    const guessButton = document.getElementById('guess-button');
    const restartButton = document.getElementById('restart-button');
    const message = document.getElementById('message');
    const guessCountDisplay = document.getElementById('guess-count');

    let randomNumber;
    let guesses = 0;

    const startNewGame = () => {
        randomNumber = Math.floor(Math.random() * 100) + 1;
        guesses = 0;
        message.textContent = '';
        guessCountDisplay.textContent = '';
        guessInput.value = '';
        guessInput.disabled = false;
        guessButton.disabled = false;
        restartButton.style.display = 'none';
        guessInput.focus();
    };

    const checkGuess = () => {
        const userGuess = parseInt(guessInput.value);

        if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
            message.textContent = 'Please enter a valid number between 1 and 100.';
            message.style.color = '#e74c3c';
            return;
        }

        guesses++;

        if (userGuess === randomNumber) {
            message.textContent = `Congratulations! You guessed the number in ${guesses} attempts!`;
            message.style.color = '#2ecc71';
            guessInput.disabled = true;
            guessButton.disabled = true;
            restartButton.style.display = 'block';
        } else if (userGuess < randomNumber) {
            message.textContent = 'Too low! Try again.';
            message.style.color = '#3498db';
        } else {
            message.textContent = 'Too high! Try again.';
            message.style.color = '#e67e22';
        }

        guessCountDisplay.textContent = `Guesses: ${guesses}`;
    };

    guessButton.addEventListener('click', checkGuess);
    restartButton.addEventListener('click', startNewGame);

    guessInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            checkGuess();
        }
    });

    startNewGame();
});
