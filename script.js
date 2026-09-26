const CONFIG = {
  // Ship
  // Initial values: 25, 0.06, 0.08, 0.03, 8, 0.995
  shipSize: 25,
  shipRotationSpeed: 0.06,
  shipThrust: 0.08,
  shipReverseThrust: 0.03,
  shipMaxSpeed: 8,
  shipFriction:0.995,
  
  // Weapons
  
  fireRate: 35,
  fireMode: "single",
  tripleShot: false,
  bulletSpeed: 12,
  bulletDamage: 1,
  bulletSize: 6,
  
  // Turbo
  // Initial Values: 150, 8, 180
  turboDuration: 150,
  turboFireRate: 8,
  turboReloadTime: 180,
  
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
  // initial values: 35, 6, 255, 255, 255, 0, 100, 255, 2.5
  trailParticleLifetime: 35,
  trailParticleSize: 6,
  trailStartColor: { r: 255, g: 255, b: 255},
  trailEndColor: { r: 0, g: 100, b: 255},
  trailColorFadePower: 2.5,
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

const bullets = [];
let fireCooldown = 0;
let turboActive = false;
let turboTimer = 0;
let reloadTimer = 0;


function spawnBullet(sideOffset = 0, forwardOffset = CONFIG.shipSize)  {
  const perpX = -Math.sin(ship.angle);
  const perpY = Math.cos(ship.angle);

  bullets.push({
    x: ship.x + Math.cos(ship.angle) * forwardOffset + perpX * sideOffset,
    y: ship.y + Math.sin(ship.angle) * forwardOffset + perpY * sideOffset,
    velocityX: Math.cos(ship.angle) * CONFIG.bulletSpeed + ship.velocityX,
    velocityY: Math.sin(ship.angle) * CONFIG.bulletSpeed + ship.velocityY,
    angle: ship.angle,
  })
}

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

  if (e.key === "t")  {
    CONFIG.tripleShot = !CONFIG.tripleShot;
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

window.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    keys["Mouse0"] = true
  }
  if (e.button === 2 && reloadTimer <= 0 && !turboActive) {
    turboActive = true;
    turboTimer = CONFIG.turboDuration;
  }
});

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 0) {
    keys["Mouse0"] = false;
  }
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

  if (turboActive)  {
    turboTimer--;
    if (turboTimer <= 0)  {
      turboActive = false;
      reloadTimer = CONFIG.turboReloadTime;
    }
  }

  if (reloadTimer > 0)  {
    reloadTimer--;
  }

  if (fireCooldown > 0) {
    fireCooldown--;
  }

  if ((keys[" "] || keys["Mouse0"] || turboActive) && fireCooldown <= 0 && reloadTimer <= 0) {
    if (CONFIG.tripleShot)  {
        spawnBullet(-17, -16);
        spawnBullet(0, 7);
        spawnBullet(17, -16);
    } else  {
        spawnBullet();
    }
    fireCooldown = turboActive ? CONFIG.turboFireRate : CONFIG.fireRate;
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].velocityX;
    bullets[i].y += bullets[i].velocityY;

    if (
      bullets[i].x < 0 ||
      bullets[i].x > canvas.width ||
      bullets[i].y < 0 ||
      bullets[i].y > canvas.height
    ) {
      bullets.splice(i, 1);
    }
  }
}

function drawParticles()  {
  for (const p of particles)  {
    const lifeRatio = p.life / CONFIG.trailParticleLifetime;
    const shrinkFactor = lifeRatio ** 1.45;
    const glowRadius = CONFIG.trailParticleSize * 2 * shrinkFactor;

    const colorRatio = lifeRatio ** CONFIG.trailColorFadePower;

    const start = CONFIG.trailStartColor;
    const end = CONFIG.trailEndColor;

    const r = Math.round(end.r + (start.r - end.r) * colorRatio);
    const g = Math.round(end.g + (start.g - end.g) * colorRatio);
    const b = Math.round(end.b + (start.b - end.b) * colorRatio);

    const gradient = ctx.createRadialGradient(
      p.x, p.y, 0,
      p.x, p.y, glowRadius
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${lifeRatio})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);


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

function drawBullets()  {
  for (const b of bullets)  {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle + Math.PI / 2);
    ctx.drawImage(
      IMAGES.bulletImg,
      -CONFIG.bulletSize,
      -CONFIG.bulletSize,
      CONFIG.bulletSize * 2,
      CONFIG.bulletSize * 2,
    );
    ctx.restore();
  }
}

function draw() {
  ctx.fillStyle = CONFIG.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  drawParticles();
  drawShip();
  drawBullets();
}

function gameLoop()  {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

loadImages(() => {
  gameLoop();
});
