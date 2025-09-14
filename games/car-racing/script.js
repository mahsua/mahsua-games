class CarRacingGame {
    constructor() {
        this.gameContainer = document.querySelector('.game-container');
        this.road = document.querySelector('.road');
        this.playerCar = document.querySelector('.player-car');
        this.scoreElement = document.getElementById('score');
        this.speedElement = document.getElementById('speed');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverScreen = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.mouseArea = document.getElementById('mouseArea');
        this.soundToggle = document.getElementById('soundToggle');
        
        this.playerPosition = 50; // Percentage from left
        this.score = 0;
        this.speed = 60;
        this.highScore = parseInt(localStorage.getItem('carRaceHighScore')) || 0;
        this.gameRunning = false;
        this.enemyCars = [];
        this.roadLines = [];
        this.soundEnabled = true;
        this.mouseX = 0;
        
        this.keys = {
            left: false,
            right: false
        };
        
        // Sound effects using Web Audio API
        this.audioContext = null;
        this.sounds = {};
        
        this.init();
    }
    
    init() {
        this.initAudio();
        this.createRoadLines();
        this.setupControls();
        this.updateHighScoreDisplay();
        this.startGame();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.log('Audio not supported');
            this.soundEnabled = false;
        }
    }
    
    createSounds() {
        // Engine sound (continuous)
        this.engineOscillator = null;
        this.engineGain = null;
        
        // Create sound effects
        this.sounds = {
            crash: () => this.createCrashSound(),
            score: () => this.createScoreSound()
        };
    }
    
    playEngineSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        if (this.engineOscillator) return; // Already playing
        
        this.engineOscillator = this.audioContext.createOscillator();
        this.engineGain = this.audioContext.createGain();
        
        this.engineOscillator.connect(this.engineGain);
        this.engineGain.connect(this.audioContext.destination);
        
        this.engineOscillator.type = 'sawtooth';
        this.engineOscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        this.engineGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        this.engineOscillator.start();
    }
    
    stopEngineSound() {
        if (this.engineOscillator) {
            this.engineOscillator.stop();
            this.engineOscillator = null;
            this.engineGain = null;
        }
    }
    
    updateEngineSound() {
        if (this.engineOscillator && this.soundEnabled) {
            const frequency = 80 + (this.speed - 60) * 2;
            this.engineOscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        }
    }
    
    createCrashSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
    
    createScoreSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    createRoadLines() {
        // Create animated road lines
        for (let i = 0; i < 15; i++) {
            const line = document.createElement('div');
            line.className = 'road-lines';
            line.style.top = (i * 80 - 40) + 'px';
            line.style.animationDelay = (i * 0.1) + 's';
            this.road.appendChild(line);
            this.roadLines.push(line);
        }
    }
    
    setupControls() {
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        
        // Touch and mouse controls for buttons
        const addButtonEvents = (btn, direction) => {
            const startControl = () => {
                this.keys[direction] = true;
                btn.classList.add('pressed');
            };
            const stopControl = () => {
                this.keys[direction] = false;
                btn.classList.remove('pressed');
            };
            
            // Mouse events
            btn.addEventListener('mousedown', startControl);
            btn.addEventListener('mouseup', stopControl);
            btn.addEventListener('mouseleave', stopControl);
            
            // Touch events
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                startControl();
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                stopControl();
            });
            btn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                stopControl();
            });
        };
        
        addButtonEvents(leftBtn, 'left');
        addButtonEvents(rightBtn, 'right');
        
        // Mouse movement control
        this.mouseArea.addEventListener('mousemove', (e) => {
            const rect = this.gameContainer.getBoundingClientRect();
            this.mouseX = ((e.clientX - rect.left) / rect.width) * 100;
        });
        
        // Touch movement control
        this.mouseArea.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.gameContainer.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouseX = ((touch.clientX - rect.left) / rect.width) * 100;
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = true;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = false;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = false;
            }
        });
        
        // Sound toggle
        this.soundToggle.addEventListener('click', () => {
            this.soundEnabled = !this.soundEnabled;
            this.soundToggle.textContent = this.soundEnabled ? '🔊 ON' : '🔇 OFF';
            if (!this.soundEnabled) {
                this.stopEngineSound();
            } else if (this.gameRunning) {
                this.playEngineSound();
            }
        });
    }
    
    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }
    
    startGame() {
        this.gameRunning = true;
        this.playEngineSound();
        this.gameLoop();
        this.spawnEnemyCars();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.updatePlayer();
        this.updateEnemyCars();
        this.updateScore();
        this.checkCollisions();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updatePlayer() {
        // Mouse/touch control
        if (this.mouseX > 0) {
            const targetPosition = Math.max(15, Math.min(85, this.mouseX));
            const diff = targetPosition - this.playerPosition;
            this.playerPosition += diff * 0.1; // Smooth movement
        }
        
        // Button/keyboard control
        if (this.keys.left && this.playerPosition > 15) {
            this.playerPosition -= 2;
        }
        if (this.keys.right && this.playerPosition < 85) {
            this.playerPosition += 2;
        }
        
        this.playerCar.style.left = this.playerPosition + '%';
    }
    
    spawnEnemyCars() {
        if (!this.gameRunning) return;
        
        const enemyCar = document.createElement('div');
        enemyCar.className = 'enemy-car';
        enemyCar.innerHTML = `
            <div class="car-body">
                <div class="car-window"></div>
                <div class="car-wheel wheel-front-left"></div>
                <div class="car-wheel wheel-front-right"></div>
                <div class="car-wheel wheel-back-left"></div>
                <div class="car-wheel wheel-back-right"></div>
            </div>
        `;
        
        const lanes = [25, 50, 75]; // Three lanes
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        enemyCar.style.left = randomLane + '%';
        enemyCar.style.transform = 'translateX(-50%)';
        
        this.gameContainer.appendChild(enemyCar);
        this.enemyCars.push({
            element: enemyCar,
            position: randomLane,
            top: -60
        });
        
        // Spawn next car
        const spawnDelay = Math.max(800 - (this.speed * 5), 300);
        setTimeout(() => this.spawnEnemyCars(), spawnDelay);
    }
    
    updateEnemyCars() {
        this.enemyCars.forEach((car, index) => {
            car.top += this.speed / 10;
            car.element.style.top = car.top + 'px';
            
            // Remove cars that are off screen
            if (car.top > 600) {
                car.element.remove();
                this.enemyCars.splice(index, 1);
                this.score += 10;
                this.sounds.score();
            }
        });
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('carRaceHighScore', this.highScore);
        }
        
        // Increase speed gradually
        this.speed = Math.min(60 + (this.score / 50), 120);
        this.speedElement.textContent = Math.round(this.speed);
        
        // Update engine sound
        this.updateEngineSound();
        
        // Update road line animation speed
        const animationDuration = Math.max(0.5 - (this.speed - 60) / 200, 0.1);
        this.roadLines.forEach(line => {
            line.style.animationDuration = animationDuration + 's';
        });
    }
    
    checkCollisions() {
        // Get actual player car position and size
        const gameRect = this.gameContainer.getBoundingClientRect();
        const playerRect = this.playerCar.getBoundingClientRect();
        
        // Convert to game container relative coordinates
        const playerGameRect = {
            left: ((playerRect.left - gameRect.left) / gameRect.width) * 100,
            right: ((playerRect.right - gameRect.left) / gameRect.width) * 100,
            top: ((playerRect.top - gameRect.top) / gameRect.height) * 100,
            bottom: ((playerRect.bottom - gameRect.top) / gameRect.height) * 100
        };
        
        this.enemyCars.forEach(car => {
            // Calculate enemy car position more accurately
            const carTop = (car.top / 600) * 100;
            const carBottom = ((car.top + 60) / 600) * 100;
            const carLeft = car.position - 5;
            const carRight = car.position + 5;
            
            // Add small buffer to make collision feel more fair
            const buffer = 1;
            
            // Check if cars actually overlap with buffer
            if (playerGameRect.left + buffer < carRight &&
                playerGameRect.right - buffer > carLeft &&
                playerGameRect.top + buffer < carBottom &&
                playerGameRect.bottom - buffer > carTop) {
                this.gameOver();
            }
        });
    }
    
    gameOver() {
        this.gameRunning = false;
        this.stopEngineSound();
        this.sounds.crash();
        this.finalScoreElement.textContent = this.score;
        this.gameOverScreen.style.display = 'flex';
    }
    
    restart() {
        // Reset game state
        this.playerPosition = 50;
        this.score = 0;
        this.speed = 60;
        this.mouseX = 0;
        this.keys = { left: false, right: false };
        
        // Clear enemy cars
        this.enemyCars.forEach(car => car.element.remove());
        this.enemyCars = [];
        
        // Reset UI
        this.playerCar.style.left = '50%';
        this.scoreElement.textContent = '0';
        this.speedElement.textContent = '60';
        this.gameOverScreen.style.display = 'none';
        
        // Restart game
        this.startGame();
    }
}

// Initialize game
let game = new CarRacingGame();

function restartGame() {
    game.restart();
}