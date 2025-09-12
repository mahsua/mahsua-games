window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('finalScore');
    const highScoreDisplayElement = document.getElementById('highScoreDisplay');
    const highScoreDisplayElement2 = document.getElementById('highScoreDisplay2');
    const restartBtn = document.getElementById('restartBtn');
    const messageBox = document.getElementById('messageBox');

    const gridSize = 20;
    let tileCount;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let snake = [];
    let food = {};
    let dx = 0;
    let dy = 0;
    let gameLoop;
    let isGameOver = false;
    let lastDirection = '';

    highScoreDisplayElement.innerText = highScore;
    highScoreDisplayElement2.innerText = highScore;

    // Load sound effects
    const biteSound = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

    // Resize canvas to be a perfect square and fit the container
    function resizeCanvas() {
        const containerWidth = canvas.parentNode.getBoundingClientRect().width;
        const size = Math.floor(containerWidth / gridSize) * gridSize;
        canvas.width = size;
        canvas.height = size;
        tileCount = canvas.width / gridSize;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Handle restart button click
    restartBtn.addEventListener('click', restartGame);

    // Handle keyboard controls
    document.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp':
                changeDirection('up');
                break;
            case 'ArrowDown':
                changeDirection('down');
                break;
            case 'ArrowLeft':
                changeDirection('left');
                break;
            case 'ArrowRight':
                changeDirection('right');
                break;
        }
    });

    // Handle mobile swipe gestures
    let touchStartX = 0;
    let touchStartY = 0;
    canvas.addEventListener('touchstart', e => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    });
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
    });
    canvas.addEventListener('touchend', e => {
        if (isGameOver) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        const minSwipeDistance = 20;

        if (isHorizontal && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                changeDirection('right');
            } else {
                changeDirection('left');
            }
        } else if (!isHorizontal && Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                changeDirection('down');
            } else {
                changeDirection('up');
            }
        }
    });

    function changeDirection(direction) {
        if (isGameOver) return;
        switch (direction) {
            case 'up':
                if (lastDirection !== 'down') { dx = 0; dy = -1; lastDirection = 'up'; }
                break;
            case 'down':
                if (lastDirection !== 'up') { dx = 0; dy = 1; lastDirection = 'down'; }
                break;
            case 'left':
                if (lastDirection !== 'right') { dx = -1; dy = 0; lastDirection = 'left'; }
                break;
            case 'right':
                if (lastDirection !== 'left') { dx = 1; dy = 0; lastDirection = 'right'; }
                break;
        }
    }

    function generateFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        for (let part of snake) {
            if (part.x === food.x && part.y === food.y) {
                generateFood();
                return;
            }
        }
    }

    function draw() {
        // Clear canvas with checkered pattern
        const lightGreen = '#a8e6cf';
        const darkGreen = '#dcedc1';
        for (let x = 0; x < tileCount; x++) {
            for (let y = 0; y < tileCount; y++) {
                ctx.fillStyle = (x + y) % 2 === 0 ? lightGreen : darkGreen;
                ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
            }
        }

        // Draw food (apple)
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6ab04c';
        ctx.fillRect(food.x * gridSize + gridSize * 0.4, food.y * gridSize, gridSize * 0.2, gridSize * 0.2);

        // Draw snake as a continuous line
        ctx.lineWidth = gridSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#3498db';
        ctx.beginPath();
        ctx.moveTo(snake[0].x * gridSize + gridSize / 2, snake[0].y * gridSize + gridSize / 2);
        for (let i = 1; i < snake.length; i++) {
            ctx.lineTo(snake[i].x * gridSize + gridSize / 2, snake[i].y * gridSize + gridSize / 2);
        }
        ctx.stroke();

        // Draw snake head with eyes and mouth
        drawHead(snake[0].x, snake[0].y);
    }

    function drawHead(x, y) {
        ctx.fillStyle = '#2980b9'; // A darker blue for the head
        ctx.beginPath();
        ctx.arc(x * gridSize + gridSize / 2, y * gridSize + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        let eye1X, eye1Y, eye2X, eye2Y;
        let pupil1X, pupil1Y, pupil2X, pupil2Y;

        // Position eyes and mouth based on direction
        if (dx === 1) { // Right
            eye1X = x * gridSize + gridSize / 2; eye1Y = y * gridSize + gridSize / 4;
            eye2X = x * gridSize + gridSize / 2; eye2Y = y * gridSize + 3 * gridSize / 4;
            pupil1X = eye1X + gridSize / 8; pupil1Y = eye1Y;
            pupil2X = eye2X + gridSize / 8; pupil2Y = eye2Y;
            
            // Mouth
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x * gridSize + gridSize / 2 - gridSize / 4, y * gridSize + gridSize / 2, gridSize / 4, Math.PI * 0.2, Math.PI * 1.8);
            ctx.stroke();
        } else if (dx === -1) { // Left
            eye1X = x * gridSize + gridSize / 2; eye1Y = y * gridSize + gridSize / 4;
            eye2X = x * gridSize + gridSize / 2; eye2Y = y * gridSize + 3 * gridSize / 4;
            pupil1X = eye1X - gridSize / 8; pupil1Y = eye1Y;
            pupil2X = eye2X - gridSize / 8; pupil2Y = eye2Y;

            // Mouth
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x * gridSize + gridSize / 2 + gridSize / 4, y * gridSize + gridSize / 2, gridSize / 4, Math.PI * 0.8, Math.PI * 2.2);
            ctx.stroke();
        } else if (dy === 1) { // Down
            eye1X = x * gridSize + gridSize / 4; eye1Y = y * gridSize + gridSize / 2;
            eye2X = x * gridSize + 3 * gridSize / 4; eye2Y = y * gridSize + gridSize / 2;
            pupil1X = eye1X; pupil1Y = eye1Y + gridSize / 8;
            pupil2X = eye2X; pupil2Y = eye2Y + gridSize / 8;

            // Mouth
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x * gridSize + gridSize / 2, y * gridSize + gridSize / 2 - gridSize / 4, gridSize / 4, 0, Math.PI);
            ctx.stroke();
        } else if (dy === -1) { // Up
            eye1X = x * gridSize + gridSize / 4; eye1Y = y * gridSize + gridSize / 2;
            eye2X = x * gridSize + 3 * gridSize / 4; eye2Y = y * gridSize + gridSize / 2;
            pupil1X = eye1X; pupil1Y = eye1Y - gridSize / 8;
            pupil2X = eye2X; pupil2Y = eye2Y - gridSize / 8;

            // Mouth
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x * gridSize + gridSize / 2, y * gridSize + gridSize / 2 + gridSize / 4, gridSize / 4, Math.PI, Math.PI * 2);
            ctx.stroke();
        }

        // Draw eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, gridSize / 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, gridSize / 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(pupil1X, pupil1Y, gridSize / 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pupil2X, pupil2Y, gridSize / 16, 0, Math.PI * 2);
        ctx.fill();
    }

    function update() {
        if (isGameOver) return;
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);

        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            endGame();
            return;
        }
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                endGame();
                return;
            }
        }

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.innerText = score;
            if (biteSound.readyState >= 3) {
                biteSound.play();
            }
            generateFood();
        } else {
            snake.pop();
        }
        draw();
    }

    function startGame() {
        isGameOver = false;
        score = 0;
        scoreElement.innerText = score;
        snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        dx = 1;
        dy = 0;
        lastDirection = 'right';
        generateFood();
        gameLoop = setInterval(update, 150);
        hideMessage();
    }

    function endGame() {
        isGameOver = true;
        clearInterval(gameLoop);
        finalScoreElement.innerText = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreDisplayElement.innerText = highScore;
            highScoreDisplayElement2.innerText = highScore;
        }
        showMessage();
    }

    function restartGame() {
        clearInterval(gameLoop);
        startGame();
    }

    function showMessage() {
        messageBox.style.display = 'block';
    }

    function hideMessage() {
        messageBox.style.display = 'none';
    }
    
    startGame();
};
