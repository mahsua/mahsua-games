document.addEventListener('DOMContentLoaded', () => {
    const modeSelectionScreen = document.getElementById('mode-selection');
    const gameContainer = document.getElementById('game-container');
    const playWithAiBtn = document.getElementById('play-with-ai-btn');
    const playWithFriendBtn = document.getElementById('play-with-friend-btn');
    const board = document.getElementById('game-board');
    const cells = document.querySelectorAll('.cell');
    const statusMessage = document.getElementById('status-message');
    const playAgainBtn = document.getElementById('play-again-btn');

    let gameMode = '';
    let currentPlayer = 'X';
    let gameBoard = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const handleResultValidation = () => {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            const a = gameBoard[winCondition[0]];
            const b = gameBoard[winCondition[1]];
            const c = gameBoard[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            if (gameMode === 'ai') {
                if (currentPlayer === 'O') {
                    statusMessage.textContent = "AI has won!";
                } else {
                    statusMessage.textContent = "You Win!";
                }
            } else {
                statusMessage.textContent = `${currentPlayer} has won!`;
            }
            gameActive = false;
            return true;
        }

        if (!gameBoard.includes('')) {
            statusMessage.textContent = `It's a draw!`;
            gameActive = false;
            return true;
        }

        return false;
    };

    const handlePlayerChange = () => {
        if (gameActive) {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusMessage.textContent = `It's ${currentPlayer}'s turn`;
            if (gameMode === 'ai' && currentPlayer === 'O') {
                setTimeout(handleAiTurn, 500);
            }
        }
    };

    const handleCellClick = (event) => {
        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
            return;
        }

        gameBoard[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());

        const gameEnded = handleResultValidation();
        if (!gameEnded) {
            handlePlayerChange();
        }
    };

    const handleAiTurn = () => {
        if (!gameActive) return;

        const bestMove = findBestMove(gameBoard);

        if (bestMove !== null) {
            gameBoard[bestMove] = 'O';
            cells[bestMove].textContent = 'O';
            cells[bestMove].classList.add('o');
            const gameEnded = handleResultValidation();
            if (!gameEnded) {
                handlePlayerChange();
            }
        }
    };

    const findBestMove = (board) => {
        let bestScore = -Infinity;
        let move = null;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, false);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    };

    const minimax = (board, isMaximizingPlayer) => {
        const scores = {
            'X': -1,
            'O': 1,
            'draw': 0
        };

        const checkWinner = (currentBoard) => {
            for (let i = 0; i < winningConditions.length; i++) {
                const winCondition = winningConditions[i];
                const a = currentBoard[winCondition[0]];
                const b = currentBoard[winCondition[1]];
                const c = currentBoard[winCondition[2]];
                if (a === '' || b === '' || c === '') {
                    continue;
                }
                if (a === b && b === c) {
                    return a;
                }
            }
            if (!currentBoard.includes('')) {
                return 'draw';
            }
            return null;
        };

        const result = checkWinner(board);
        if (result !== null) {
            return scores[result];
        }

        if (isMaximizingPlayer) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = minimax(board, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const resetGame = () => {
        gameActive = true;
        currentPlayer = 'X';
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        statusMessage.textContent = `It's ${currentPlayer}'s turn`;
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
        if (gameMode === 'ai' && currentPlayer === 'O') {
            setTimeout(handleAiTurn, 500);
        }
    };

    const startGame = () => {
        modeSelectionScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        statusMessage.textContent = `It's X's turn`;
    };

    playWithAiBtn.addEventListener('click', () => {
        gameMode = 'ai';
        startGame();
    });

    playWithFriendBtn.addEventListener('click', () => {
        gameMode = 'friend';
        startGame();
    });

    board.addEventListener('click', handleCellClick);
    playAgainBtn.addEventListener('click', resetGame);
});
