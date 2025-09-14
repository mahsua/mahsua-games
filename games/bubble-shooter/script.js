class BubbleShooter {
    constructor() {
        this.gameArea = document.getElementById('game-area');
        this.shooter = document.getElementById('shooter');
        this.nextBubble = document.getElementById('next-bubble');
        this.trajectory = document.getElementById('trajectory');
        this.bubbles = [];
        this.currentBubble = null;
        this.nextBubbleColor = null;
        this.score = 0;
        this.level = 1;
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        this.isGameActive = true;
        this.bubbleSize = 40;
        this.bubbleSpacing = this.bubbleSize + 5;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateLevel();
        this.createShooterBubble();
        this.updateUI();
    }

    setupEventListeners() {
        this.gameArea.addEventListener('mousemove', (e) => this.updateTrajectory(e));
        this.gameArea.addEventListener('click', (e) => this.shoot(e));
        
        // Touch support
        this.gameArea.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.updateTrajectory(touch);
        });
        this.gameArea.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            this.shoot(touch);
        });
        
        // Swap functionality
        const swapButton = document.getElementById('swap-button');
        swapButton.addEventListener('click', () => this.swapBubbles());
        swapButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.swapBubbles();
        });
    }

    generateLevel() {
        this.bubbles = [];
        // Increase difficulty with each level
        const rows = Math.min(3 + Math.floor(this.level / 2), 10);
        const bubblesPerRow = Math.floor((this.gameArea.offsetWidth - 100) / this.bubbleSpacing);
        
        // Increase bubble density with level
        const bubbleDensity = Math.min(0.6 + (this.level * 0.05), 0.9);
        
        for (let row = 0; row < rows; row++) {
            const colsInRow = row % 2 === 0 ? bubblesPerRow : bubblesPerRow - 1;
            for (let col = 0; col < colsInRow; col++) {
                if (Math.random() < bubbleDensity) {
                    const x = col * this.bubbleSpacing + (row % 2) * (this.bubbleSpacing / 2) + 50;
                    const y = row * (this.bubbleSpacing * 0.866) + 50; // 0.866 for hexagonal spacing
                    
                    // More colors available as level increases
                    const availableColors = Math.min(3 + Math.floor(this.level / 3), this.colors.length);
                    
                    const bubble = this.createBubble(
                        x, y,
                        this.colors[Math.floor(Math.random() * availableColors)]
                    );
                    bubble.dataset.row = row;
                    bubble.dataset.col = col;
                    this.bubbles.push(bubble);
                }
            }
        }
        this.updateUI();
    }

    createBubble(x, y, color) {
        const bubble = document.createElement('div');
        bubble.className = `bubble ${color}`;
        bubble.style.left = x + 'px';
        bubble.style.top = y + 'px';
        bubble.dataset.color = color;
        bubble.dataset.x = x;
        bubble.dataset.y = y;
        this.gameArea.appendChild(bubble);
        return bubble;
    }

    createShooterBubble() {
        if (!this.nextBubbleColor) {
            this.nextBubbleColor = this.colors[Math.floor(Math.random() * Math.min(4 + this.level, this.colors.length))];
        }
        
        const currentColor = this.nextBubbleColor;
        this.nextBubbleColor = this.colors[Math.floor(Math.random() * Math.min(4 + this.level, this.colors.length))];
        
        this.shooter.className = `shooter bubble ${currentColor}`;
        this.shooter.dataset.color = currentColor;
        
        this.nextBubble.className = `next-bubble bubble ${this.nextBubbleColor}`;
        this.nextBubble.dataset.color = this.nextBubbleColor;
    }

    swapBubbles() {
        if (!this.isGameActive) return;
        
        const currentColor = this.shooter.dataset.color;
        const nextColor = this.nextBubble.dataset.color;
        
        this.shooter.className = `shooter bubble ${nextColor}`;
        this.shooter.dataset.color = nextColor;
        
        this.nextBubble.className = `next-bubble bubble ${currentColor}`;
        this.nextBubble.dataset.color = currentColor;
        
        this.nextBubbleColor = currentColor;
    }

    updateTrajectory(e) {
        if (!this.isGameActive) return;
        
        const rect = this.gameArea.getBoundingClientRect();
        const shooterRect = this.shooter.getBoundingClientRect();
        const shooterX = shooterRect.left + shooterRect.width / 2 - rect.left;
        const shooterY = shooterRect.top + shooterRect.height / 2 - rect.top;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const angle = Math.atan2(mouseY - shooterY, mouseX - shooterX);
        const length = 100;
        
        this.trajectory.style.left = (shooterX - 1) + 'px';
        this.trajectory.style.top = (shooterY - length) + 'px';
        this.trajectory.style.height = length + 'px';
        this.trajectory.style.transform = `rotate(${angle + Math.PI/2}rad)`;
        this.trajectory.style.transformOrigin = 'bottom center';
    }

    shoot(e) {
        if (!this.isGameActive) return;
        
        // Don't shoot if clicking on the swap button
        if (e.target && e.target.id === 'swap-button') return;
        
        const rect = this.gameArea.getBoundingClientRect();
        const shooterRect = this.shooter.getBoundingClientRect();
        const shooterX = shooterRect.left + shooterRect.width / 2 - rect.left;
        const shooterY = shooterRect.top + shooterRect.height / 2 - rect.top;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const angle = Math.atan2(mouseY - shooterY, mouseX - shooterX);
        const speed = 8;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const bubble = this.createBubble(shooterX - 20, shooterY - 20, this.shooter.dataset.color);
        this.animateBubble(bubble, vx, vy);
        this.createShooterBubble();
    }

    animateBubble(bubble, vx, vy) {
        let x = parseFloat(bubble.style.left);
        let y = parseFloat(bubble.style.top);
        
        const animate = () => {
            x += vx;
            y += vy;
            
            // Wall collision
            if (x <= 0 || x >= this.gameArea.offsetWidth - 40) {
                vx = -vx;
                x = Math.max(0, Math.min(x, this.gameArea.offsetWidth - 40));
            }
            
            // Check collision with existing bubbles
            const collision = this.checkCollision(x + 20, y + 20);
            if (collision || y <= 0) {
                this.placeBubble(bubble, x, y);
                return;
            }
            
            bubble.style.left = x + 'px';
            bubble.style.top = y + 'px';
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    checkCollision(x, y) {
        for (let bubble of this.bubbles) {
            const bx = parseFloat(bubble.dataset.x) + 20;
            const by = parseFloat(bubble.dataset.y) + 20;
            const distance = Math.sqrt((x - bx) ** 2 + (y - by) ** 2);
            if (distance < 35) {
                return bubble;
            }
        }
        return null;
    }

    placeBubble(bubble, x, y) {
        // Find the best grid position
        const bestPosition = this.findBestGridPosition(x, y);
        
        bubble.style.left = bestPosition.x + 'px';
        bubble.style.top = bestPosition.y + 'px';
        bubble.dataset.x = bestPosition.x;
        bubble.dataset.y = bestPosition.y;
        bubble.dataset.row = bestPosition.row;
        bubble.dataset.col = bestPosition.col;
        
        this.bubbles.push(bubble);
        
        // Check for matches
        const matches = this.findMatches(bubble);
        if (matches.length >= 3) {
            this.popBubbles(matches);
            this.score += matches.length * 10 * this.level;
            // Check for floating bubbles after popping
            setTimeout(() => this.dropFloatingBubbles(), 350);
        } else {
            // Always check for floating bubbles after placing any bubble
            this.checkFloatingBubbles();
        }
        
        this.updateUI();
        this.checkGameState();
    }

    findBestGridPosition(x, y) {
        const row = Math.round((y - 50) / (this.bubbleSpacing * 0.866));
        const isEvenRow = row % 2 === 0;
        const offsetX = isEvenRow ? 0 : this.bubbleSpacing / 2;
        const col = Math.round((x - 50 - offsetX) / this.bubbleSpacing);
        
        const gridX = col * this.bubbleSpacing + offsetX + 50;
        const gridY = row * (this.bubbleSpacing * 0.866) + 50;
        
        return { x: gridX, y: gridY, row: row, col: col };
    }

    findMatches(targetBubble) {
        const color = targetBubble.dataset.color;
        const visited = new Set();
        const matches = [];
        const stack = [targetBubble];
        
        while (stack.length > 0) {
            const bubble = stack.pop();
            if (visited.has(bubble)) continue;
            
            visited.add(bubble);
            matches.push(bubble);
            
            const neighbors = this.getNeighbors(bubble);
            for (let neighbor of neighbors) {
                if (!visited.has(neighbor) && neighbor.dataset.color === color) {
                    stack.push(neighbor);
                }
            }
        }
        
        return matches;
    }

    getNeighbors(bubble) {
        const row = parseInt(bubble.dataset.row);
        const col = parseInt(bubble.dataset.col);
        const neighbors = [];
        
        // Hexagonal grid neighbor offsets
        const evenRowOffsets = [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]];
        const oddRowOffsets = [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
        const offsets = row % 2 === 0 ? evenRowOffsets : oddRowOffsets;
        
        for (let [dr, dc] of offsets) {
            const neighborRow = row + dr;
            const neighborCol = col + dc;
            
            const neighbor = this.bubbles.find(b => 
                parseInt(b.dataset.row) === neighborRow && 
                parseInt(b.dataset.col) === neighborCol
            );
            
            if (neighbor) {
                neighbors.push(neighbor);
            }
        }
        
        return neighbors;
    }

    popBubbles(bubbles) {
        bubbles.forEach(bubble => {
            bubble.classList.add('popping');
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
                this.bubbles = this.bubbles.filter(b => b !== bubble);
                this.updateUI();
                // Check game state after each bubble is removed
                this.checkGameState();
            }, 300);
        });
    }

    dropFloatingBubbles() {
        const connected = new Set();
        const stack = [];
        
        // Find all bubbles in the top row (row 0)
        for (let bubble of this.bubbles) {
            if (parseInt(bubble.dataset.row) === 0) {
                stack.push(bubble);
            }
        }
        
        // Mark all connected bubbles
        while (stack.length > 0) {
            const bubble = stack.pop();
            if (connected.has(bubble)) continue;
            
            connected.add(bubble);
            const neighbors = this.getNeighbors(bubble);
            for (let neighbor of neighbors) {
                if (!connected.has(neighbor)) {
                    stack.push(neighbor);
                }
            }
        }
        
        // Drop unconnected bubbles
        const floating = this.bubbles.filter(b => !connected.has(b));
        floating.forEach(bubble => {
            bubble.classList.add('falling');
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
                this.bubbles = this.bubbles.filter(b => b !== bubble);
                this.updateUI();
                // Check game state after each floating bubble is removed
                this.checkGameState();
            }, 1000);
        });
        
        this.score += floating.length * 5 * this.level;
    }

    // Check for floating bubbles after any bubble placement
    checkFloatingBubbles() {
        this.dropFloatingBubbles();
    }

    checkGameState() {
        // Use setTimeout to check after DOM updates
        setTimeout(() => {
            // Check if level is complete
            if (this.bubbles.length === 0) {
                this.isGameActive = false;
                
                // Add bonus points for completing level
                this.score += 100 * this.level;
                document.getElementById('level-score').textContent = this.score;
                this.updateUI();
                
                // Show level complete message briefly, then auto-advance
                document.getElementById('level-complete').style.display = 'block';
                
                setTimeout(() => {
                    this.nextLevel();
                }, 2000); // Auto-advance after 2 seconds
                return;
            }
            
            // Check if bubbles reached the danger zone (bottom 20% of game area)
            const dangerZone = this.gameArea.offsetHeight * 0.8;
            for (let bubble of this.bubbles) {
                if (parseFloat(bubble.dataset.y) > dangerZone) {
                    this.gameOver();
                    return;
                }
            }
        }, 100);
    }

    gameOver() {
        this.isGameActive = false;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').style.display = 'block';
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('bubbles-left').textContent = this.bubbles.length;
        document.getElementById('current-level').textContent = this.level;
    }

    nextLevel() {
        this.level++;
        this.isGameActive = true;
        document.getElementById('level-complete').style.display = 'none';
        
        // Clear existing bubbles
        this.bubbles.forEach(bubble => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
        });
        
        this.generateLevel();
        this.createShooterBubble();
    }

    restart() {
        this.level = 1;
        this.score = 0;
        this.isGameActive = true;
        document.getElementById('game-over').style.display = 'none';
        
        // Clear existing bubbles
        this.bubbles.forEach(bubble => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
        });
        
        this.generateLevel();
        this.createShooterBubble();
    }
}

let game;

function startGame() {
    game = new BubbleShooter();
}

function restartGame() {
    game.restart();
}

function nextLevel() {
    game.nextLevel();
}

// Start the game when page loads
window.addEventListener('load', startGame);