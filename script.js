// --- Game Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const speedDisplay = document.getElementById('speed');
const messageScreen = document.getElementById('messageScreen');
const startButton = document.getElementById('startButton');

let gameLoopId;
let gameRunning = false;
let score = 0;

const GRID_SIZE = 20; // Size of each square in pixels
const COLS = canvas.width / GRID_SIZE;
const ROWS = canvas.height / GRID_SIZE;
let speed = 150; // Milliseconds between updates (slower is easier)

// --- Snake Object ---
let snake = [];
let dx = GRID_SIZE; // Velocity X (starts moving right)
let dy = 0; // Velocity Y
let changingDirection = false;

// --- Food Object ---
let food = {};

// --- Functions ---

function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
    // Optional: Draw a slight border for grid clarity
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(x, y, GRID_SIZE, GRID_SIZE);
}

function drawSnake() {
    snake.forEach(segment => {
        drawSquare(segment.x, segment.y, '#50fa7b'); // Neon green body
    });
}

function drawFood() {
    drawSquare(food.x, food.y, '#ffffff'); // White food
}

function advanceSnake() {
    // Create the new head position
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Add the new head to the beginning of the snake array
    snake.unshift(head);
    
    // Check if the snake ate the food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = `SCORE: ${score}`;
        
        // Increase speed every 50 points
        if (score % 50 === 0 && speed > 50) {
            speed -= 10;
            speedDisplay.textContent = `SPEED: ${speed}ms`;
            // Reset game loop with new speed
            clearInterval(gameLoopId);
            gameLoopId = setInterval(main, speed);
        }
        
        // Generate new food
        generateFood();
        // NOTE: We do NOT pop the tail here, allowing the snake to grow
    } else {
        // If no food eaten, remove the last segment (pop the tail)
        snake.pop();
    }

    changingDirection = false;
}

function checkCollision() {
    const head = snake[0];
    
    // 1. Wall collision
    const hitLeftWall = head.x < 0;
    const hitRightWall = head.x >= canvas.width;
    const hitTopWall = head.y < 0;
    const hitBottomWall = head.y >= canvas.height;

    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
        return true;
    }

    // 2. Self collision (start checking from the 4th segment, as the first three are always safe)
    for (let i = 4; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

function generateFood() {
    function randomGridCoord(min, max) {
        // Generate a random number that aligns with the grid (multiple of GRID_SIZE)
        return Math.round((Math.random() * (max - min) + min) / GRID_SIZE) * GRID_SIZE;
    }

    food.x = randomGridCoord(0, canvas.width - GRID_SIZE);
    food.y = randomGridCoord(0, canvas.height - GRID_SIZE);

    // Check if the new food location is on the snake
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            // If it is, re-generate the food
            generateFood();
        }
    });
}

function changeDirection(event) {
    // Prevent changing direction multiple times per game tick
    if (changingDirection) return;
    changingDirection = true;
    
    const keyPressed = event.key.toLowerCase();
    const LEFT = ['arrowleft', 'a'];
    const RIGHT = ['arrowright', 'd'];
    const UP = ['arrowup', 'w'];
    const DOWN = ['arrowdown', 's'];
    
    const goingUp = dy === -GRID_SIZE;
    const goingDown = dy === GRID_SIZE;
    const goingRight = dx === GRID_SIZE;
    const goingLeft = dx === -GRID_SIZE;

    if (LEFT.includes(keyPressed) && !goingRight) {
        dx = -GRID_SIZE;
        dy = 0;
    } else if (UP.includes(keyPressed) && !goingDown) {
        dx = 0;
        dy = -GRID_SIZE;
    } else if (RIGHT.includes(keyPressed) && !goingLeft) {
        dx = GRID_SIZE;
        dy = 0;
    } else if (DOWN.includes(keyPressed) && !goingUp) {
        dx = 0;
        dy = GRID_SIZE;
    }
}

// --- Game Loop and Start ---

function main() {
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // Clear the canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawFood();
    advanceSnake();
    drawSnake();
}

function initGame() {
    score = 0;
    speed = 150;
    snake = [
        {x: 2 * GRID_SIZE, y: 0},
        {x: 1 * GRID_SIZE, y: 0},
        {x: 0, y: 0}
    ];
    dx = GRID_SIZE; // Start moving right
    dy = 0;
    
    scoreDisplay.textContent = `SCORE: ${score}`;
    speedDisplay.textContent = `SPEED: ${speed}ms`;

    generateFood();
    gameRunning = true;
    messageScreen.style.display = 'none';

    // Start the main game loop
    clearInterval(gameLoopId); 
    gameLoopId = setInterval(main, speed);
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoopId);
    messageScreen.querySelector('h1').textContent = "GAME OVER";
    messageScreen.querySelector('p').innerHTML = `Final Score: ${score}<br>Press START to play again.`;
    messageScreen.querySelector('#startButton').textContent = "PLAY AGAIN";
    messageScreen.style.display = 'flex';
}

// --- Event Listeners ---
document.addEventListener('keydown', changeDirection);
startButton.addEventListener('click', initGame);
