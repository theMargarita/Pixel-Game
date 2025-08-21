const gameContainer = document.getElementById("game-container");
const player = document.getElementById("player");
const cookieCount = document.getElementById("cookie-count");
const missedCount = document.getElementById("missed-count");
const gameOver = document.getElementById("game-over");
const winScreen = document.getElementById("win-screen");
const restartButton = document.getElementById("restart-button");
const playAgainButton = document.getElementById("play-again-button");
const startButton = document.getElementById("start-button");
const instructions = document.getElementById("instructions");

let playerPosition = {
  x: 360,
};

let gameWidth = 800;
let playerWidth = 80;
let playerSpeed = 10;
let cookies = 0;
let missed = 0;
let foodItems = [];
let clouds = [];
let gameRunning = false;
let keys = {};

const foodTypes = ["cookie", "apple", "banana", "broccoli"];

function startGame() {
  instructions.style.display = "none";
  cookies = 0;
  missed = 0;
  cookieCount.textContent = cookies;
  missedCount.textContent = missed;
  gameOver.style.display = "none";
  winScreen.style.display = "none";
  foodItems = [];
  gameRunning = true;

  // Remove existing food items
  document.querySelectorAll(".food").forEach((item) => item.remove());

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
  food.dataset.type = foodType; //dataset - svg element

  const randomX = Math.random() * (gameWidth - 40);
  food.style.left = `${randomX}px`;

  gameContainer.appendChild(food);

  const speed = Math.random() * 2 + 2; // Random speed between 2 and 4

  //add new elements to teh end of the arrays an d returns the new length
  foodItems.push({
    element: food,
    position: {
      x: randomX,
      y: -40,
    },
    speed: speed,
    type: foodType,
  });
}

function createClouds() {
  for (let i = 0; i < 6; i++) {
    createCloud();
  }

  setInterval(createCloud, 10000);
}

function createCloud() {
  if (!gameRunning) return;

  const cloud = document.createElement("div");
  cloud.className = "cloud";

  const randomY = Math.random() * 400;
  const randomX = -100;

  cloud.style.top = `${randomY}px`;
  cloud.style.left = `${randomX}px`;

  gameContainer.appendChild(cloud);

  const speed = Math.random() * 0.5 + 0.2; // Random speed between 0.2 and 0.7

  //add new elements to teh end of the arrays an d returns the new length
  clouds.push({
    element: cloud,
    position: {
      x: randomX,
      y: randomY,
    },
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
          endGame(false);
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
  clearInterval(createFoodInterval);

  if (isWin) {
    winScreen.style.display = "flex";
  } else {
    gameOver.style.display = "flex";
  }
}

// Event listeners / aka clickers
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

restartButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", startGame);
startButton.addEventListener("click", startGame);
