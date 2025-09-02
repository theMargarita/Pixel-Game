console.log("Script starting...");

const debugStatus = document.getElementById("debug-status");

function updateDebug(status) {
  debugStatus.textContent = status;
  console.log("Debug:", status);
}

// Get all elements
const gameContainer = document.getElementById("game-container");
const player = document.getElementById("player");
const cookieCount = document.getElementById("cookie-count");
const missedCount = document.getElementById("missed-count");
const healthDisplay = document.getElementById("health-display");
const gameOver = document.getElementById("game-over");
const winScreen = document.getElementById("win-screen");
const restartButton = document.getElementById("restart-button");
const playAgainButton = document.getElementById("play-again-button");
const startButton = document.getElementById("start-button");
const instructions = document.getElementById("instructions");

// // Check if elements exist
// console.log("Elements check:");
// console.log("startButton:", startButton);
// console.log("gameContainer:", gameContainer);
// console.log("player:", player);

// //error handling
// if (!startButton) {
//   updateDebug("ERROR: Start button not found!");
//   console.error("Start button element not found!");
// } else {
//   updateDebug("Elements found, setting up...");
// }

let playerPosition = { x: 360 };
let gameWidth = 800;
let playerWidth = 80;
let playerSpeed = 10;
let cookies = 0;
let missed = 0;
let health = 3;
let foodItems = [];
let clouds = [];
let gameRunning = false;
let keys = {};
let createFoodInterval;

const foodTypes = ["cookie", "apple", "banana", "broccoli", "mushroom"];
const foodEmojis = { cookie: "🍪", apple: "🍎", banana: "🍌", broccoli: "🥦", mushroom: "🍄‍🟫" };

function updateHealthDisplay() {
  const hearts = "❤️".repeat(health) + "🖤".repeat(3 - health);
  healthDisplay.textContent = hearts;
}

function takeDamage() {
  health--;
  updateHealthDisplay();

  //add damage flash effect
  const scoreContainer = document.getElementById("score-container");
  scoreContainer.classList.add("damage-effect");
  setTimeout(() => {
    scoreContainer.classList.remove("damage-effect");
  }, 500);

  if (health <= 0) {
    endGame(false, "You ate too much unhealthy food!");
    return true;
  }
  return false;
}

function startGame() {
  console.log("startGame() called!");
  updateDebug("Game starting...");

  instructions.style.display = "none";
  cookies = 0;
  missed = 0;
  health = 3;
  cookieCount.textContent = cookies;
  missedCount.textContent = missed;
  updateHealthDisplay();
  gameOver.style.display = "none";
  winScreen.style.display = "none";
  foodItems = [];
  gameRunning = true;

  // Remove existing food items
  document.querySelectorAll(".food").forEach((item) => item.remove());

  // Clear any existing interval
  if (createFoodInterval) {
    clearInterval(createFoodInterval);
  }

  updateDebug("Game running!");

  // Start game loops
  gameLoop();
  createClouds();
  createFoodInterval = setInterval(createFood, 1000);
}

function createFood() {
  if (!gameRunning) return;

  const food = document.createElement("div");
  const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];

  food.className = `food ${foodType}`;
  food.dataset.type = foodType;
  food.textContent = foodEmojis[foodType];

  const randomX = Math.random() * (gameWidth - 40);
  food.style.left = `${randomX}px`;

  gameContainer.appendChild(food);

  const speed = Math.random() * 2 + 2;

  foodItems.push({
    element: food,
    position: { x: randomX, y: -40 },
    speed: speed,
    type: foodType,
  });
}

//creates the clouds - plural
function createClouds() {
  for (let i = 0; i < 7; i++) {
    createCloud();
  }
  setInterval(createCloud, 10000);
}

//creates a single cloud
function createCloud() {
  if (!gameRunning) return;

  const cloud = document.createElement("div");
  cloud.className = "cloud";

  const randomY = Math.random() * 400;
  const randomX = -200;

  cloud.style.top = `${randomY}px`;
  cloud.style.left = `${randomX}px`;

  gameContainer.appendChild(cloud);

  const speed = Math.random() * 0.7 + 0.5;

  clouds.push({
    element: cloud,
    position: { x: randomX, y: randomY },
    speed: speed,
  });
}

function gameLoop() {
  if (!gameRunning) return;

  // Move player based on key presses
  if (keys.ArrowLeft || keys.a || keys.A) {
    playerPosition.x -= playerSpeed;
  }
  if (keys.ArrowRight || keys.d || keys.D) {
    playerPosition.x += playerSpeed;
  }

  // Keep player within bounds
  playerPosition.x = Math.max(
    0,
    Math.min(gameWidth - playerWidth, playerPosition.x)
  );

  // Update player position
  player.style.left = `${playerPosition.x}px`;

  // Move food items
  for (let i = foodItems.length - 1; i >= 0; i--) {
    const food = foodItems[i];
    food.position.y += food.speed;
    food.element.style.top = `${food.position.y}px`;

    // Check for collision with player
    if (
      food.position.y >= 480 &&
      food.position.y <= 560 &&
      food.position.x >= playerPosition.x - 30 &&
      food.position.x <= playerPosition.x + playerWidth - 10
    ) {
      // Remove collected food
      gameContainer.removeChild(food.element);
      foodItems.splice(i, 1);

      // Update score if cookie
      if (food.type === "cookie") {
        cookies++;
        cookieCount.textContent = cookies;

        // Check for win
        if (cookies >= 5) {
          endGame(true);
          return;
        }
        // Take damage if not cookie
      } else {
        if (takeDamage()) {
          endGame(false);
          return;
        }
      }
    }
    // Remove food if it's off screen
    else if (food.position.y > 600) {
      // Count missed cookies
      if (food.type === "cookie") {
        missed++;
        missedCount.textContent = missed;

        // Check for game over
        if (missed >= 3) {
          endGame(false, "You missed too many cookies!");
          return;
        }
      }

      // Remove the food
      gameContainer.removeChild(food.element);
      foodItems.splice(i, 1);
    }
  }

  // Move clouds
  for (let i = clouds.length - 1; i >= 0; i--) {
    const cloud = clouds[i];
    cloud.position.x += cloud.speed;
    cloud.element.style.left = `${cloud.position.x}px`;

    // Remove cloud if it's off screen
    if (cloud.position.x > gameWidth) {
      gameContainer.removeChild(cloud.element);
      clouds.splice(i, 1);
    }
  }

  requestAnimationFrame(gameLoop);
}

function endGame(isWin) {
  gameRunning = false;
  updateDebug(isWin ? "You won!" : "Game over!");

  if (createFoodInterval) {
    clearInterval(createFoodInterval);
  }

  if (isWin) {
    winScreen.style.display = "flex";
  } else {
    gameOver.style.display = "flex";
  }
}

// Event listeners
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Button event listeners with debug
if (startButton) {
  startButton.addEventListener("click", () => {
    console.log("Start button clicked!");
    updateDebug("Start button clicked!");
    startGame();
  });
  updateDebug("Start button ready!");
}

if (restartButton) {
  restartButton.addEventListener("click", startGame);
}

if (playAgainButton) {
  playAgainButton.addEventListener("click", startGame);
}

console.log("Script setup complete!");
updateDebug("Ready to play!");
