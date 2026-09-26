const CONFIG = {
  // Ship
  // Initial values: 25, 0.06, 0.08, 0.03, 8, 0.995
  shipSize: 25,
  shipRotationSpeed: 0.06,
  shipThrust: 0.08,
  shipReverseThrust: 0.03,
  shipMaxSpeed: 20,
  shipFriction:0.995,


  
  // Weapons
  fireRate: 8,
  fireMode: "single",
  tripleShot: false,
  bulletSpeed: 8,
  bulletDamage: 1,
  bulletSize: 4,
  
  // Asteroids
  asteroidSpawnRate: 90,
  asteroidSpeedMin: 1,
  asteroidSpeedMax: 3,
  asteroidLargeSize: 50,
  asteroidMediumSize: 30,
  asteroidSmallSize: 15,
  
  // Audio
  sfxVolume: 0.5,
  musicVolume: 0.3,

  // Colors
  backgroundColor: "#000000",

  // Effects
  trailParticleLifetime: 30,
  trailParticleSize: 6,
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

const particles = [];

function spawnTrailParticle() {
  const backX = ship.x - Math.cos(ship.angle) * CONFIG.shipSize;
  const backY = ship.y - Math.sin(ship.angle) * CONFIG.shipSize;
   
  particles.push({
    x: backX,
    y: backY,
    life: CONFIG.trailParticleLifetime,
  });
}

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
    spawnTrailParticle();
  }

  if (keys["ArrowDown"] || keys["s"]) {
    ship.velocityX -= Math.cos(ship.angle) * CONFIG.shipReverseThrust;
    ship.velocityY -= Math.sin(ship.angle) * CONFIG.shipReverseThrust;
  }

  if (keys["x"])  {
    ship.velocityX *= 0.92;
    ship.velocityY *= 0.92;
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

  if (ship.x < 0) ship.x = canvas.width;
  if (ship.x > canvas.width) ship.x = 0;
  if (ship.y < 0) ship.y = canvas.height;
  if (ship.y > canvas.height) ship.y = 0;
  
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].life--;
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
      
    }
  }
}

function drawParticles()  {
  for (const p of particles)  {
    const lifeRatio = p.life / CONFIG.trailParticleLifetime;
    const shrinkFactor = lifeRatio ** 1.45;

    const glowRadius = CONFIG.trailParticleSize * 2 * shrinkFactor;

    const gradient = ctx.createRadialGradient(
      p.x, p.y, 0,
      p.x, p.y, glowRadius
    );
    gradient.addColorStop(0, `rgba(0, 200, 255, ${lifeRatio})`);
    gradient.addColorStop(1, `rgba(0, 200, 255, 0)`);


    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }
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
  
  drawParticles();
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
