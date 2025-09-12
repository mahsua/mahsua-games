window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('nextCanvas');
    const nextCtx = nextCanvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('finalScore');
    const restartButton = document.getElementById('restartBtn');
    const messageBox = document.getElementById('messageBox');

    const boardWidth = 10;
    const boardHeight = 20;
    const blockSize = 30;
    let board = [];
    let currentPiece;
    let nextPiece;
    let score = 0;
    let gameInterval;
    let isPaused = false;

    // Tetrimino shapes
    const shapes = [
        // I
        [[1, 1, 1, 1]],
        // J
        [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
        // L
        [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
        // O
        [[1, 1], [1, 1]],
        // S
        [[0, 1, 1], [1, 1, 0]],
        // T
        [[1, 1, 1], [0, 1, 0]],
        // Z
        [[1, 1, 0], [0, 1, 1]],
    ];

    // Tetrimino colors
    const colors = [
        '#4a90e2', // I
        '#d04343', // J
        '#e8a832', // L
        '#f5d042', // O
        '#99cc33', // S
        '#8e44ad', // T
        '#f368e0', // Z
    ];

    // Function to create a new piece
    function createPiece() {
        const shapeIndex = Math.floor(Math.random() * shapes.length);
        const shape = shapes[shapeIndex];
        const color = colors[shapeIndex];
        return {
            shape,
            color,
            x: Math.floor(boardWidth / 2) - Math.floor(shape[0].length / 2),
            y: 0,
        };
    }

    // Function to draw a block
    function drawBlock(x, y, color, context) {
        context.fillStyle = color;
        context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        context.strokeStyle = '#2c3e50';
        context.lineWidth = 2;
        context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }

    // Function to draw the board
    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < boardHeight; y++) {
            for (let x = 0; x < boardWidth; x++) {
                if (board[y][x]) {
                    drawBlock(x, y, board[y][x], ctx);
                }
            }
        }
    }
    
    // Function to draw the current piece
    function drawPiece() {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(currentPiece.x + x, currentPiece.y + y, currentPiece.color, ctx);
                }
            });
        });
    }

    // Function to draw the next piece
    function drawNextPiece() {
        nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        nextCtx.fillStyle = '#f4f6f8';
        nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        
        const pieceSize = nextPiece.shape.length;
        const offsetX = (nextCanvas.width - pieceSize * blockSize) / 2 / blockSize;
        const offsetY = (nextCanvas.height - nextPiece.shape.length * blockSize) / 2 / blockSize;

        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(x + offsetX, y + offsetY, nextPiece.color, nextCtx);
                }
            });
        });
    }

    // Check for collision
    function checkCollision(piece, dx, dy) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + dx;
                    const newY = piece.y + y + dy;
                    if (newX < 0 || newX >= boardWidth || newY >= boardHeight || (board[newY] && board[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Merge piece with board
    function mergePiece() {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
                }
            });
        });
    }
    
    // Rotate piece
    function rotatePiece() {
        const newShape = currentPiece.shape[0].map((_, index) => currentPiece.shape.map(row => row[index]).reverse());
        const oldShape = currentPiece.shape;
        currentPiece.shape = newShape;
        if (checkCollision(currentPiece, 0, 0)) {
            currentPiece.shape = oldShape; // Revert if collision
        }
    }

    // Clear lines
    function clearLines() {
        let linesCleared = 0;
        for (let y = boardHeight - 1; y >= 0; y--) {
            if (board[y].every(cell => cell !== null)) {
                board.splice(y, 1);
                board.unshift(Array(boardWidth).fill(null));
                linesCleared++;
                y++;
            }
        }
        if (linesCleared > 0) {
            score += linesCleared * 100;
            scoreElement.innerText = score;
        }
    }

    // Update game state
    function update() {
        if (isPaused) return;

        if (!checkCollision(currentPiece, 0, 1)) {
            currentPiece.y++;
        } else {
            mergePiece();
            clearLines();
            currentPiece = nextPiece;
            nextPiece = createPiece();
            drawNextPiece();
            if (checkCollision(currentPiece, 0, 0)) {
                gameOver();
            }
        }

        drawBoard();
        drawPiece();
    }

    // Game over
    function gameOver() {
        clearInterval(gameInterval);
        messageBox.style.display = 'block';
        document.getElementById('messageTitle').innerText = 'Game Over';
        document.getElementById('messageText').innerText = 'Score: ' + score;
        restartButton.style.display = 'block';
    }

    // Start a new game
    function startGame() {
        board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(null));
        score = 0;
        scoreElement.innerText = score;
        currentPiece = createPiece();
        nextPiece = createPiece();
        drawNextPiece();
        isPaused = false;
        messageBox.style.display = 'none';
        gameInterval = setInterval(update, 500);
    }

    // Event Listeners
    restartButton.addEventListener('click', () => {
        startGame();
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (isPaused) return;
        switch (e.key) {
            case 'ArrowLeft':
                if (!checkCollision(currentPiece, -1, 0)) currentPiece.x--;
                break;
            case 'ArrowRight':
                if (!checkCollision(currentPiece, 1, 0)) currentPiece.x++;
                break;
            case 'ArrowDown':
                if (!checkCollision(currentPiece, 0, 1)) currentPiece.y++;
                break;
            case 'ArrowUp':
                rotatePiece();
                break;
            case ' ': // Hard drop
                while (!checkCollision(currentPiece, 0, 1)) {
                    currentPiece.y++;
                }
                break;
        }
        drawBoard();
        drawPiece();
    });
    
    // Touch controls
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    canvas.addEventListener('touchend', (e) => {
        if (isPaused) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        if (absDeltaX > absDeltaY) {
            // Horizontal swipe
            if (deltaX > 0) {
                if (!checkCollision(currentPiece, 1, 0)) currentPiece.x++;
            } else {
                if (!checkCollision(currentPiece, -1, 0)) currentPiece.x--;
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                    while (!checkCollision(currentPiece, 0, 1)) {
                    currentPiece.y++;
                }
            } else {
                rotatePiece();
            }
        }
        drawBoard();
        drawPiece();
    });
    
    // Start the game automatically on page load
    startGame();
};