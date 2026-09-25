const CONFIG = {
  // Ship
  shipSize: 15,
  shipRotationSpeed: 0.06,
  shipThrust: 0.08,
  shipMaxSpeed: 6,
  shipFriction:0.995,
  shipReverseThrust:0.03,

  
  // Weapons
  fireRate: 8,
  fireMode: "single",
  dualShot: false,
  bulletSpeed: 8,
  bulletDamage: 1,
  
  // Asteroids
  asteroidSpawnRate: 90,
  asteroidSpeedMin: 1,
  asteroidSpeedMax: 3,
  
  // Audio
  sfxVolume: 0.5,
  musicVolume: 0.3,

  // Colors
  backgroundColor: "#000000",
}

const IMAGES = {};
const ASSET_PATHS = {
  ship: "assets/ship.png",
  bulletImg: "assets/bullet.png",
  asteroidLarge: "assets/asteroid-large.png",
  asteroidMedium: "assets/asteroid-medium.png",
  asteroidSmall: "assets/asteroid-small.png",
};

let imagesLoaded = 0;
const totalImages = Object.keys(ASSET_PATHS).length;

function loadImages(callback) {
  for (const key in ASSET_PATHS)  {
    const img = new Image();

    img.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        callback();
      }
    };

    img.src = ASSET_PATHS[key];
    
    IMAGES[key] = img;
  }
}


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  velocityX: 0,
  velocityY: 0,
  angle: 0,
};

const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function update() {
  if (keys["ArrowLeft"] || keys["a"]) {
    ship.angle -= CONFIG.shipRotationSpeed;
  }
  
  if (keys["ArrowRight"] || keys["d"])  {
    ship.angle += CONFIG.shipRotationSpeed;
  }

  if (keys["ArrowUp"] || keys["w"]) {
    ship.velocityX += Math.cos(ship.angle) * CONFIG.shipThrust;
    ship.velocityY += Math.sin(ship.angle) * CONFIG.shipThrust;
  }

  if (keys["ArrowDown"] || keys["s"]) {
    ship.velocityX -= Math.cos(ship.angle) * CONFIG.shipReverseThrust;
    ship.velocityY -= Math.sin(ship.angle) * CONFIG.shipReverseThrust;
  }

  const speed = Math.sqrt(ship.velocityX ** 2 + ship.velocityY ** 2);
  if (speed > CONFIG.shipMaxSpeed)  {
    ship.velocityX = (ship.velocityX /speed) * CONFIG.shipMaxSpeed;
    ship.velocityY = (ship.velocityY /speed) * CONFIG.shipMaxSpeed;
  }

  ship.velocityX *= CONFIG.shipFriction;
  ship.velocityY *= CONFIG.shipFriction;

  ship.x += ship.velocityX;
  ship.y += ship.velocityY;
}

function drawShip() {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle + Math.PI / 2);
  ctx.drawImage(
    IMAGES.ship,
    -CONFIG.shipSize,
    -CONFIG.shipSize,
    CONFIG.shipSize * 2,
    CONFIG.shipSize * 2
  );
  ctx.restore();
}

function draw() {
  ctx.fillStyle = CONFIG.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawShip();
}

function gameLoop()  {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

loadImages(() => {
  gameLoop();
});
