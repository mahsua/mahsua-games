// --- DOM Elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('scoreEl');
const modalEl = document.getElementById('modalEl');
const modalScoreEl = document.getElementById('modalScoreEl');
const startGameBtn = document.getElementById('startGameBtn');
const modalTitle = document.getElementById('modalTitle');
const modalSubtext = document.getElementById('modalSubtext');
const themeToggleBtn = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('theme-icon-sun');
const moonIcon = document.getElementById('theme-icon-moon');
const body = document.body;

// --- Theme Colors for Canvas ---
const themes = {
    dark: {
        playerColor: 'rgba(255, 82, 82, 1)',
        playerShadow: '#ff5252',
        wallColor: 'rgba(75, 222, 128, 1)',
        wallShadow: '#4bdea8',
    },
    light: {
        playerColor: 'rgba(239, 68, 68, 1)',
        playerShadow: '#ef4444',
        wallColor: 'rgba(34, 197, 94, 1)',
        wallShadow: '#22c55e',
    }
};
let currentThemeColors = themes.dark;


// --- Game Configuration ---
let player, walls, score, animationId, frames, wallSpawnRate;
let isGameOver = true;
let isGameRunning = false;

// --- Player Class ---
class Player {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.targetY = y;
    }

    draw() {
        ctx.fillStyle = currentThemeColors.playerColor;
        ctx.shadowColor = currentThemeColors.playerShadow;
        ctx.shadowBlur = 20;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.shadowBlur = 0;
    }

    update() {
        const dy = this.targetY - this.y;
        this.y += dy * 0.2;
        this.draw();
    }
}

// --- Wall Class ---
class Wall {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 3;
        this.passed = false;
    }

    draw() {
        ctx.fillStyle = currentThemeColors.wallColor;
        ctx.shadowColor = currentThemeColors.wallShadow;
        ctx.shadowBlur = 15;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    update() {
        this.x -= this.speed;
        this.draw();
    }
}

// --- Game Functions ---
function setCanvasDimensions() {
    const container = document.getElementById('game-container');
    const maxWidth = 900;
    const containerWidth = container.clientWidth;

    canvas.width = Math.min(containerWidth, maxWidth);
    canvas.height = canvas.width * (9 / 16);

    if (isGameRunning) {
        modalEl.style.display = 'none';
    }
}

function init() {
    setCanvasDimensions();
    const playerSize = canvas.width * 0.04;
    player = new Player(playerSize * 2, canvas.height / 2 - playerSize / 2, playerSize);
    player.targetY = player.y;

    walls = [];
    score = 0;
    frames = 0;
    wallSpawnRate = 100;
    isGameOver = false;
    isGameRunning = true;

    scoreEl.textContent = score;
    modalScoreEl.textContent = score;
}

function spawnWalls() {
    const minGap = player.size * 4;
    const maxGap = player.size * 5;
    const gap = Math.random() * (maxGap - minGap) + minGap;
    const wallWidth = canvas.width * 0.03;

    const gapY = Math.random() * (canvas.height - gap - 40) + 20;

    walls.push(new Wall(canvas.width, 0, wallWidth, gapY));
    walls.push(new Wall(canvas.width, gapY + gap, wallWidth, canvas.height - (gapY + gap)));
}

function animate() {
    if (isGameOver) {
        isGameRunning = false;
        modalEl.style.display = 'flex';
        modalScoreEl.textContent = score;
        modalTitle.textContent = "Game Over!";
        modalSubtext.textContent = "You can do better.";
        startGameBtn.textContent = "Try Again";
        return;
    }

    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    frames++;
    if (frames % wallSpawnRate === 0) {
        spawnWalls();
        if (wallSpawnRate > 60) wallSpawnRate--;
    }

    walls.forEach((wall) => {
        wall.update();
        if (player.x < wall.x + wall.width && player.x + player.size > wall.x && player.y < wall.y + wall.height && player.y + player.size > wall.y) {
            isGameOver = true;
        }
        if (!wall.passed && wall.x + wall.width < player.x) {
            wall.passed = true;
            score++;
            scoreEl.textContent = score;
        }
    });

    walls = walls.filter(wall => wall.x + wall.width > 0);

    player.update();
    if (player.y < 0) player.y = 0;
    if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;
    player.targetY = player.y;
}

// --- Theme Toggle Logic ---
function applyTheme(theme) {
    body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    currentThemeColors = themes[theme];
    if (theme === 'light') {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
    // Redraw canvas if game isn't running to reflect theme change
    if (!isGameRunning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

themeToggleBtn.addEventListener('click', () => {
    const newTheme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);


// --- Event Listeners ---
startGameBtn.addEventListener('click', () => {
    modalEl.style.display = 'none';
    init();
    animate();
});

window.addEventListener('resize', () => {
    if (!isGameRunning) {
        setCanvasDimensions();
    } else {
        isGameOver = true;
        modalEl.style.display = 'flex';
        modalTitle.textContent = "Game Paused";
        modalSubtext.textContent = "Window was resized. Please restart.";
        startGameBtn.textContent = "Restart Game";
    }
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    const moveSpeed = player.size * 0.8;
    switch(e.key) {
        case 'ArrowUp': case 'w': case 'W': player.y -= moveSpeed; break;
        case 'ArrowDown': case 's': case 'S': player.y += moveSpeed; break;
    }
});

// Touch controls
let isTouching = false;
function handleTouch(touch) {
    const canvasRect = canvas.getBoundingClientRect();
    player.targetY = touch.clientY - canvasRect.top - player.size / 2;
}
canvas.addEventListener('touchstart', (e) => {
    if (!isGameRunning) return;
    e.preventDefault();
    isTouching = true;
    handleTouch(e.touches[0]);
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
    if (!isGameRunning || !isTouching) return;
    e.preventDefault();
    handleTouch(e.touches[0]);
}, { passive: false });
canvas.addEventListener('touchend', () => { isTouching = false; });
canvas.addEventListener('touchcancel', () => { isTouching = false; });

// --- Initial Setup Call ---
setCanvasDimensions();
