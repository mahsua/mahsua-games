document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const resetButton = document.getElementById('reset-button');
    const winModal = document.getElementById('win-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalActionButton = document.getElementById('modal-action-button');

    const CELL_SIZE = 60;
    const PADDING = 10;
    const GRID_WIDTH = 6;
    const GRID_HEIGHT = 6;

    let isDragging = false;
    let currentBlock = null;
    let initialMousePos = { x: 0, y: 0 };
    let initialBlockPos = { x: 0, y: 0 };
    let grid = [];
    let keyBlock = null;
    let currentLevel = 0;
    const levels = [
        // Level 1
        {
            key: { x: 0, y: 2, width: 2, height: 1, type: 'h' },
            obstacles: [
                { x: 2, y: 0, width: 1, height: 2, type: 'v' },
                { x: 3, y: 0, width: 2, height: 1, type: 'h' },
                { x: 2, y: 2, width: 1, height: 2, type: 'v' },
                { x: 5, y: 1, width: 1, height: 2, type: 'v' },
                { x: 4, y: 2, width: 2, height: 1, type: 'h' },
                { x: 0, y: 3, width: 2, height: 1, type: 'h' },
                { x: 3, y: 3, width: 1, height: 2, type: 'v' },
                { x: 2, y: 4, width: 2, height: 1, type: 'h' },
                { x: 4, y: 4, width: 2, height: 1, type: 'h' },
                { x: 0, y: 5, width: 2, height: 1, type: 'h' },
            ]
        },
        // Level 2
        {
            key: { x: 0, y: 2, width: 2, height: 1, type: 'h' },
            obstacles: [
                { x: 0, y: 0, width: 2, height: 1, type: 'h' },
                { x: 2, y: 0, width: 1, height: 2, type: 'v' },
                { x: 3, y: 0, width: 2, height: 1, type: 'h' },
                { x: 4, y: 1, width: 1, height: 2, type: 'v' },
                { x: 5, y: 0, width: 1, height: 2, type: 'v' },
                { x: 1, y: 1, width: 1, height: 2, type: 'v' },
                { x: 2, y: 3, width: 1, height: 2, type: 'v' },
                { x: 3, y: 3, width: 2, height: 1, type: 'h' },
                { x: 5, y: 3, width: 1, height: 2, type: 'v' },
                { x: 0, y: 4, width: 2, height: 1, type: 'h' },
                { x: 0, y: 5, width: 2, height: 1, type: 'h' },
            ]
        },
        // Level 3 (Increased Difficulty)
        {
            key: { x: 0, y: 2, width: 2, height: 1, type: 'h' },
            obstacles: [
                { x: 2, y: 0, width: 1, height: 2, type: 'v' },
                { x: 3, y: 0, width: 1, height: 3, type: 'v' },
                { x: 4, y: 0, width: 1, height: 2, type: 'v' },
                { x: 0, y: 1, width: 2, height: 1, type: 'h' },
                { x: 2, y: 2, width: 1, height: 2, type: 'v' },
                { x: 5, y: 1, width: 1, height: 2, type: 'v' },
                { x: 0, y: 3, width: 2, height: 1, type: 'h' },
                { x: 4, y: 3, width: 2, height: 1, type: 'h' },
                { x: 0, y: 4, width: 1, height: 2, type: 'v' },
                { x: 1, y: 4, width: 2, height: 1, type: 'h' },
                { x: 3, y: 4, width: 2, height: 1, type: 'h' },
                { x: 2, y: 5, width: 2, height: 1, type: 'h' },
                { x: 5, y: 5, width: 1, height: 1, type: 'h' },
            ]
        }
    ];

    function initializeGame(levelData) {
        gameContainer.innerHTML = `<div class="exit-marker"></div>`;
        gameContainer.style.width = `${GRID_WIDTH * CELL_SIZE + PADDING * 2}px`;
        gameContainer.style.height = `${GRID_HEIGHT * CELL_SIZE + PADDING * 2}px`;
        winModal.style.display = 'none';
        grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));

        const allBlocks = [levelData.key, ...levelData.obstacles];

        allBlocks.forEach((blockData, index) => {
            const blockElement = document.createElement('div');
            blockElement.classList.add('block');
            if (index === 0) {
                blockElement.classList.add('key-block');
                keyBlock = blockElement;
                blockElement.innerHTML = `
                    <svg class="key-icon" viewBox="0 0 24 24">
                        <path d="M14.5,10.5C14.5,11.88 15.62,13 17,13C18.38,13 19.5,11.88 19.5,10.5C19.5,9.12 18.38,8 17,8C15.62,8 14.5,9.12 14.5,10.5M21,15H20V16H18V15H17V14H15V15H14V17H13V18H12V16H11V15H9.5C9.22,15 9,14.78 9,14.5V14H6.5V13H5.5V12H4.5V11H3.5V10H2.5V9H2V8H3.5V7H4.5V6H5.5V5H6.5V4H9V5H10V6H11V7H12V8H13V9H14V10H15V11H17V12H18V13H20V14H21V15Z" />
                    </svg>
                `;
            } else {
                blockElement.classList.add('obstacle-block');
            }
            blockElement.style.width = `${blockData.width * CELL_SIZE}px`;
            blockElement.style.height = `${blockData.height * CELL_SIZE}px`;
            blockElement.style.left = `${blockData.x * CELL_SIZE + PADDING}px`;
            blockElement.style.top = `${blockData.y * CELL_SIZE + PADDING}px`;
            blockElement.dataset.x = blockData.x;
            blockElement.dataset.y = blockData.y;
            blockElement.dataset.width = blockData.width;
            blockElement.dataset.height = blockData.height;
            blockElement.dataset.type = blockData.type;
            gameContainer.appendChild(blockElement);

            for (let i = blockData.y; i < blockData.y + blockData.height; i++) {
                for (let j = blockData.x; j < blockData.x + blockData.width; j++) {
                    if (i >= 0 && i < GRID_HEIGHT && j >= 0 && j < GRID_WIDTH) {
                        grid[i][j] = blockElement;
                    }
                }
            }
        });

        attachEventListeners();
    }

    function attachEventListeners() {
        gameContainer.addEventListener('mousedown', startDrag);
        gameContainer.addEventListener('touchstart', startDrag);
        gameContainer.addEventListener('mousemove', drag);
        gameContainer.addEventListener('touchmove', drag);
        gameContainer.addEventListener('mouseup', endDrag);
        gameContainer.addEventListener('touchend', endDrag);
    }

    function startDrag(e) {
        const target = e.target.closest('.block');
        if (target) {
            isDragging = true;
            currentBlock = target;
            currentBlock.classList.add('is-dragging');
            e.preventDefault();

            const event = e.touches ? e.touches[0] : e;
            initialMousePos.x = event.clientX;
            initialMousePos.y = event.clientY;
            initialBlockPos.x = parseInt(currentBlock.style.left);
            initialBlockPos.y = parseInt(currentBlock.style.top);
        }
    }

    function drag(e) {
        if (!isDragging || !currentBlock) return;
        e.preventDefault();
        const event = e.touches ? e.touches[0] : e;
        const dx = event.clientX - initialMousePos.x;
        const dy = event.clientY - initialMousePos.y;

        if (currentBlock.dataset.type === 'h') {
            currentBlock.style.left = `${initialBlockPos.x + dx}px`;
        } else if (currentBlock.dataset.type === 'v') {
            currentBlock.style.top = `${initialBlockPos.y + dy}px`;
        }
    }

    function endDrag(e) {
        if (!isDragging || !currentBlock) return;
        isDragging = false;
        currentBlock.classList.remove('is-dragging');

        const event = e.changedTouches ? e.changedTouches[0] : e;
        const finalPos = {
            x: parseInt(currentBlock.style.left) - PADDING,
            y: parseInt(currentBlock.style.top) - PADDING
        };

        const blockData = {
            x: parseInt(currentBlock.dataset.x),
            y: parseInt(currentBlock.dataset.y),
            width: parseInt(currentBlock.dataset.width),
            height: parseInt(currentBlock.dataset.height),
            type: currentBlock.dataset.type
        };

        let newX, newY;
        if (blockData.type === 'h') {
            newX = Math.round(finalPos.x / CELL_SIZE);
            newY = blockData.y;
        } else {
            newX = blockData.x;
            newY = Math.round(finalPos.y / CELL_SIZE);
        }

        if (isValidMove(blockData, newX, newY, currentBlock)) {
            updateGrid(currentBlock, blockData, newX, newY);
            currentBlock.dataset.x = newX;
            currentBlock.dataset.y = newY;
            currentBlock.style.left = `${newX * CELL_SIZE + PADDING}px`;
            currentBlock.style.top = `${newY * CELL_SIZE + PADDING}px`;
            checkWinCondition();
        } else {
            currentBlock.style.left = `${blockData.x * CELL_SIZE + PADDING}px`;
            currentBlock.style.top = `${blockData.y * CELL_SIZE + PADDING}px`;
        }
        currentBlock = null;
    }

    function isValidMove(blockData, newX, newY, blockElement) {
        if (newX < 0 || newY < 0 || newX + blockData.width > GRID_WIDTH || newY + blockData.height > GRID_HEIGHT) {
            return false;
        }

        for (let i = newY; i < newY + blockData.height; i++) {
            for (let j = newX; j < newX + blockData.width; j++) {
                if (grid[i] && grid[i][j] && grid[i][j] !== blockElement) {
                    if (blockElement.classList.contains('key-block') && newX + blockData.width >= GRID_WIDTH) {
                        return true;
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    function updateGrid(blockElement, oldData, newX, newY) {
        for (let i = oldData.y; i < oldData.y + oldData.height; i++) {
            for (let j = oldData.x; j < oldData.x + oldData.width; j++) {
                 if (i >= 0 && i < GRID_HEIGHT && j >= 0 && j < GRID_WIDTH) {
                   grid[i][j] = null;
                }
            }
        }
        for (let i = newY; i < newY + oldData.height; i++) {
            for (let j = newX; j < newX + oldData.width; j++) {
                if (i >= 0 && i < GRID_HEIGHT && j >= 0 && j < GRID_WIDTH) {
                    grid[i][j] = blockElement;
                }
            }
        }
    }

    function checkWinCondition() {
        const keyBlockX = parseInt(keyBlock.dataset.x);
        const keyBlockWidth = parseInt(keyBlock.dataset.width);

        if (keyBlockX + keyBlockWidth >= GRID_WIDTH) {
            if (currentLevel < levels.length - 1) {
                modalTitle.textContent = "You did it!";
                modalText.textContent = "You have freed the key.";
                modalActionButton.textContent = "Next Level";
                modalActionButton.onclick = () => {
                    currentLevel++;
                    initializeGame(levels[currentLevel]);
                };
            } else {
                modalTitle.textContent = "Congratulations!";
                modalText.textContent = "You have completed all levels!";
                modalActionButton.textContent = "Play Again";
                modalActionButton.onclick = () => {
                    currentLevel = 0;
                    initializeGame(levels[currentLevel]);
                };
            }
            winModal.style.display = 'flex';
            gameContainer.removeEventListener('mousedown', startDrag);
            gameContainer.removeEventListener('touchstart', startDrag);
        }
    }

    resetButton.addEventListener('click', () => {
        initializeGame(levels[currentLevel]);
    });

    initializeGame(levels[currentLevel]);
});
