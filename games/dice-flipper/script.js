let diceResults = [];
let isRolling = false;
let diceAudio = null;

// Initialize audio with your local sound file
function initializeAudio() {
    diceAudio = new Audio();
    // REPLACE THIS PATH with your actual sound file path:
    // Examples:
    // diceAudio.src = './sounds/dice-roll.wav';
    // diceAudio.src = './dice-sound.mp3';
    // diceAudio.src = 'C:/Users/YourName/Desktop/dice-sound.mp3';
    diceAudio.src = 'dice-sound.mp3'; // Put your sound file path here
    diceAudio.volume = 0.5; // Adjust volume (0.0 to 1.0)
    diceAudio.preload = 'auto';
}

// Play dice sound effect
function createDiceSound() {
    if (diceAudio) {
        // Reset audio to beginning and play
        diceAudio.currentTime = 0;
        diceAudio.play().catch(e => {
            console.log('Audio playback failed:', e);
            // Fallback to synthetic sound if file fails
            createSyntheticSound();
        });
    } else {
        // Fallback to synthetic sound if no audio file
        createSyntheticSound();
    }
}

// Fallback synthetic sound (original Web Audio API version)
function createSyntheticSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
        oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.type = 'square';
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
        console.log('Synthetic audio not supported');
    }
}

function createDiceFace(number) {
    const face = document.createElement('div');
    face.className = 'dice-face';
    
    // Create dot patterns for each number
    const dotPatterns = {
        1: [[50, 50]],
        2: [[25, 25], [75, 75]],
        3: [[25, 25], [50, 50], [75, 75]],
        4: [[25, 25], [75, 25], [25, 75], [75, 75]],
        5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
        6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]
    };
    
    const pattern = dotPatterns[number];
    pattern.forEach(([x, y]) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.left = `${x}%`;
        dot.style.top = `${y}%`;
        dot.style.transform = 'translate(-50%, -50%)';
        face.appendChild(dot);
    });
    
    return face;
}

function createDice() {
    const dice = document.createElement('div');
    dice.className = 'dice';
    
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    faces.forEach((faceClass, faceIndex) => {
        const face = createDiceFace(faceIndex + 1);
        face.classList.add(faceClass);
        dice.appendChild(face);
    });
    
    return dice;
}

function generateDice() {
    const diceArea = document.getElementById('diceArea');
    const diceCount = parseInt(document.getElementById('diceCount').value);
    
    diceArea.innerHTML = '';
    
    for (let i = 0; i < diceCount; i++) {
        const dice = createDice();
        diceArea.appendChild(dice);
    }
}



function rollDice() {
    if (isRolling) return;
    
    isRolling = true;
    const diceElements = document.querySelectorAll('.dice');
    const diceCount = diceElements.length;
    
    if (diceCount === 0) {
        generateDice();
        setTimeout(rollDice, 100);
        return;
    }
    
    // Generate results first
    diceResults = [];
    for (let i = 0; i < diceCount; i++) {
        diceResults.push(Math.floor(Math.random() * 6) + 1);
    }
    
    // Play sound effect
    try {
        createDiceSound();
    } catch (e) {
        console.log('Audio not supported');
    }
    
    // Add rolling animation
    diceElements.forEach(dice => {
        dice.classList.add('rolling');
    });
    
    // Apply final rotations after animation
    setTimeout(() => {
        diceElements.forEach((dice, index) => {
            const result = diceResults[index];
            
            // Remove rolling animation
            dice.classList.remove('rolling');
            
            // Set final rotation to show the correct face
            const rotations = {
                1: 'rotateX(0deg) rotateY(0deg)',      // front
                2: 'rotateX(0deg) rotateY(180deg)',    // back
                3: 'rotateX(0deg) rotateY(-90deg)',    // left
                4: 'rotateX(0deg) rotateY(90deg)',     // right
                5: 'rotateX(-90deg) rotateY(0deg)',    // top
                6: 'rotateX(90deg) rotateY(0deg)'      // bottom
            };
            
            dice.style.transform = rotations[result];
        });
        
        // Show results after animation
        setTimeout(() => {
            showResults();
            isRolling = false;
        }, 300);
    }, 1500);
}

function showResults() {
    const resultsDiv = document.getElementById('results');
    const individualResults = document.getElementById('individualResults');
    const totalResult = document.getElementById('totalResult');
    const averageResult = document.getElementById('averageResult');
    
    const total = diceResults.reduce((sum, result) => sum + result, 0);
    const average = (total / diceResults.length).toFixed(1);
    
    individualResults.textContent = diceResults.join(', ');
    totalResult.textContent = total;
    averageResult.textContent = average;
    
    resultsDiv.style.display = 'block';
}

function resetGame() {
    if (isRolling) return;
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'none';
    
    diceResults = [];
    generateDice();
}

// Initialize the game
document.getElementById('diceCount').addEventListener('change', function() {
    if (!isRolling) {
        generateDice();
    }
});

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const themeButton = document.querySelector('.theme-toggle');
    
    body.classList.toggle('dark-theme');
    
    if (body.classList.contains('dark-theme')) {
        themeButton.innerHTML = '☀️ Light';
        localStorage.setItem('theme', 'dark');
    } else {
        themeButton.innerHTML = '🌙 Dark';
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeButton = document.querySelector('.theme-toggle');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeButton.innerHTML = '☀️ Light';
    }
}

// Generate initial dice
generateDice();

// Load theme after page loads
loadTheme();

// Initialize audio after page loads
initializeAudio();