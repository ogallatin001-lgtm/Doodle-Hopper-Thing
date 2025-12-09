// --- Game Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const messageScreen = document.getElementById('messageScreen');
const startButton = document.getElementById('startButton');

let gameRunning = false;
let score = 0;
let gameLoopId;
const keyState = {};

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const GRAVITY = 0.3; // Gravity pull

// --- Player Object ---
const player = {
    width: 40,
    height: 40,
    x: CANVAS_WIDTH / 2 - 20,
    y: CANVAS_HEIGHT - 60,
    dx: 0, // Horizontal velocity
    dy: 0, // Vertical velocity
    jumpVelocity: -10, // Initial jump force
    color: '#ff5555'
};

// --- Platform Object ---
const platformDefaults = {
    width: 60,
    height: 10,
    color: '#50fa7b',
    spawnMargin: 60 // Minimum vertical distance between platforms
};
let platforms = [];
let scoreOffset = 0; // Tracks how much the world has scrolled

// --- Core Functions ---

function drawPlayer() {
    // Draw a simple doodle character (square for simplicity)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw eyes/details for character
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + 8, player.y + 10, 8, 8);
    ctx.fillRect(player.x + 24, player.y + 10, 8, 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 10, player.y + 12, 4, 4);
    ctx.fillRect(player.x + 26, player.y + 12, 4, 4);
}

function drawPlatforms() {
    platforms.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
}

function handleInput() {
    const moveSpeed = 5;
    
    // Move Left (ArrowLeft or A)
    if (keyState['ArrowLeft'] || keyState['a']) {
        player.dx = -moveSpeed;
    } 
    // Move Right (ArrowRight or D)
    else if (keyState['ArrowRight'] || keyState['d']) {
        player.dx = moveSpeed;
    } else {
        player.dx = 0; // Stop movement when keys released
    }
}

function update() {
    // Apply horizontal movement
    player.x += player.dx;
    
    // Wrap player around edges
    if (player.x > CANVAS_WIDTH) {
        player.x = -player.width;
    } else if (player.x < -player.width) {
        player.x = CANVAS_WIDTH;
    }

    // Apply gravity and vertical movement
    player.dy += GRAVITY;
    player.y += player.dy;

    // --- Camera Scroll Logic ---
    // If player goes above the center of the screen, scroll the world down
    if (player.y < CANVAS_HEIGHT / 2 && player.dy < 0) {
        // Adjust score
        const scrollAmount = -player.dy; 
        scoreOffset += scrollAmount;
        score = Math.floor(scoreOffset / 10);
        scoreDisplay.textContent = `SCORE: ${score}`;
        
        // Move everything down
        platforms.forEach(p => {
            p.y += scrollAmount;
        });
        player.y += scrollAmount; // Keep player visually centered
    }

    // --- Platform Logic ---
    platforms.forEach(p => {
        // Check collision only when falling (dy > 0)
        if (player.dy > 0 && 
            player.x < p.x + p.width && 
            player.x + player.width > p.x && 
            player.y + player.height > p.y && 
            player.y + player.height < p.y + p.height
        ) {
            // Collision detected: JUMP!
            player.dy = player.jumpVelocity;
        }
    });

    // Remove platforms that fall off the screen
    platforms = platforms.filter(p => p.y < CANVAS_HEIGHT);
    
    // Spawn new platforms
    spawnPlatforms();

    // --- Game Over Check ---
    if (player.y > CANVAS_HEIGHT) {
        gameOver();
    }
}

function spawnPlatforms() {
    // Find the highest platform (platform with the lowest y-coordinate)
    let highestY = 0;
    if (platforms.length > 0) {
        highestY = platforms.reduce((minY, p) => Math.min(minY, p.y), CANVAS_HEIGHT);
    } else {
        // If no platforms, seed the first platform at the bottom
        platforms.push(createPlatform(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20));
        highestY = CANVAS_HEIGHT - 20;
    }

    // Spawn new platforms above the current highest platform
    while (highestY > 0) {
        // New platform height should be at least platformDefaults.spawnMargin above the previous highest
        highestY -= platformDefaults.spawnMargin + Math.random() * 20; 
        
        // Stop spawning if the new height is off screen
        if (highestY < -50) break;

        // Random horizontal position
        const newX = Math.random() * (CANVAS_WIDTH - platformDefaults.width);
        
        platforms.push(createPlatform(newX, highestY));
    }
}

function createPlatform(x, y) {
    return {
        x: x,
        y: y,
        width: platformDefaults.width,
        height: platformDefaults.height,
        color: platformDefaults.color
    };
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawPlatforms();
    drawPlayer();
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(gameLoopId);
    messageScreen.querySelector('h1').textContent = "GAME OVER!";
    messageScreen.querySelector('p').innerHTML = `You fell! Final Score: ${score}<br>Press START to try again.`;
    messageScreen.querySelector('#startButton').textContent = "PLAY AGAIN";
    messageScreen.style.display = 'flex';
}

function initGame() {
    score = 0;
    scoreOffset = 0;
    scoreDisplay.textContent = `SCORE: ${score}`;
    
    // Reset player state
    player.x = CANVAS_WIDTH / 2 - 20;
    player.y = CANVAS_HEIGHT - 60;
    player.dx = 0;
    player.dy = player.jumpVelocity; // Start with a jump
    
    // Reset platforms
    platforms = [];
    spawnPlatforms(); // Creates the initial set of platforms
    
    gameRunning = true;
    messageScreen.style.display = 'none';
    gameLoop();
}

// --- Game Loop ---
function gameLoop() {
    if (!gameRunning) return;

    handleInput();
    update();
    draw();

    gameLoopId = requestAnimationFrame(gameLoop);
}

// --- Event Listeners ---
document.addEventListener('keydown', (e) => {
    keyState[e.key] = true; 
    keyState[e.key.toLowerCase()] = true; // Handle both cases
});

document.addEventListener('keyup', (e) => {
    keyState[e.key] = false;
    keyState[e.key.toLowerCase()] = false;
});

startButton.addEventListener('click', initGame);

// Initial draw to show the start screen and character
draw();
