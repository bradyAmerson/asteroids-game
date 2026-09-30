const CONFIG = {
  // Ship
  shipSize: 25,
  shipRotationSpeed: 0.035,
  shipThrust: 0.03,
  shipReverseThrust: 0.019,
  shipMaxSpeed: 5,
  shipFriction:0.995,
  shipLives: 3,
  shipInvincibleDuration: 365,
  
  // Weapons
  fireRate: 40,
  bulletSpeed: 10,
  bulletDamage: 10,
  bulletSize: 6,
  bulletFadeDuration: 1,
  bulletTrailLength: 18,
  bulletTrailSpacing: 0.5,
  bulletTrailAlpha: 0.5,

  // Triple
  tripleShotSpread: 0.06,
  tripleSize: 60,
  tripleSpeed: 1.5,
  tripleDuration: 1300,
  tripleBlinkingDuration: 500,
  tripleSpawnScore: 600, //6600
  tripleSpawnScoreIncrease: 5000,
  tripleFireDuration: 1100,

  // Rapid
  rapidFireDuration: 600,
  rapidFireRate: 7,
  rapidSize: 60,
  rapidSpeed: 1.5,
  rapidDuration: 1300,
  rapidBlinkingDuration: 500,
  rapidSpawnScore: 300, //3300
  rapidSpawnScoreIncrease: 5000,
  
  allThreePowerupsScore: 20000,
  allThreePowerupsScoreIncrease: 2000,
  
  // Asteroids
  asteroidSpawnRate: 150,
  asteroidSpeedMin: .4,
  asteroidSpeedMax: 1.5,
  asteroidLargeSize: 100,
  asteroidMediumSize: 75,
  asteroidSmallSize: 30,
  asteroidDensity: 109000,
  asteroidSizeWeights: { large: 6, medium: 3, small: 1 },
  asteroidHitboxScale: 0.875,
  asteroidSplitSpeedMultiplier: 1.2,
  asteroidSplitSpreadAngle: 1,
  
  // Audio
  sfxVolume: 0.5,
  musicVolume: 0.3,

  // Color
  backgroundColor: "#080011",

  // Effects
  trailParticleLifetime: 37,
  trailParticleSize: 6,
  trailStartColor: { r: 255, g: 255, b: 255},
  trailEndColor: { r: 0, g: 100, b: 255},
  trailColorFadePower: 2.5,
  explosionSize: 100,
  explosionDuration: 150,

  // Heart
  heartSize: 60,
  heartSpeed: 1.5,
  heartDuration: 1300,
  heartBlinkingDuration: 500,
  heartSpawnScoreAmount: 300, // 5000
  heartSpawnScoreIncrease: 10000,

  // stars
  starDensity: 6500,
  starMinSize: 0.6,
  starMaxSize: 1.5,
  starMinAlpha: 0.15,
  starMaxAlpha: 1,
  starTwinkleSpeedMin: 0.0008,
  starTwinkleSpeedMax: 0.002,
  starGlowChance: 0.25,
  starColors: [
  "#b777ff",
  "#3b99ff",
  "#50b1ff",
  "#70b1ff",
  "#9bb0ff", 
  "#9bb0ff",
  "#aabfff",
  "#aabfff",
  "#aabfff",
  "#cad7ff", 
  "#cad7ff", 
  "#cad7ff",
  "#f8f7ff",
  "#f8f7ff",
  "#f8f7ff",
  "#aabfff",
  "#e6d4ff",
  "#fff1c9",
  "#ffd2a1",
  "#ffffff", 
  "#cfe3ff",
  ]
  };

const IMAGES = {};
const ASSET_PATHS = {
  ship: "assets/ship.png",
  bulletImg: "assets/bullet.png",
  asteroidLarge: "assets/asteroid-large.png",
  asteroidMedium: "assets/asteroid-medium.png",
  asteroidSmall: "assets/asteroid-small.png",
  explosion: "assets/explosion.png",
  heart: "assets/heart.png",
  tripleFireImage: "assets/tripleFire.png",
  rapidFireImage: "assets/rapidFire.png",
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
  angle: -Math.PI /2
};

const particles = [];

const stars = [];

const bullets = [];
let fireCooldown = 0;
let rapidSpawnScore = CONFIG.rapidSpawnScore;
let tripleSpawnScore = CONFIG.tripleSpawnScore;
let allThreePowerupsScore = CONFIG.allThreePowerupsScore;
let tripleCounter = 0;
let rapidCounter = 0;
let rapidActive = false;
let tripleActive = false;
let rapidTimer = CONFIG.rapidDuration;
let tripleTimer = CONFIG.tripleDuration;
let rapidFireDuration = CONFIG.rapidFireDuration;
let tripleFireDuration = CONFIG.tripleFireDuration
let rapidBlinkingTimer = CONFIG.rapidBlinkingDuration;
let tripleBlinkingTimer = CONFIG.tripleBlinkingDuration;
let rapid = null;
let triple = null;
let reloadTimer = 0;
let lives = CONFIG.shipLives;
let invincibleTimer = 0;
let gameOver = false;
let score = 0;
let highScore = 0;
let respawnTimer = 0;
let isNewHighScore = false;
let heartSpawnScoreAmount = CONFIG.heartSpawnScoreAmount;
let heart = null;
let heartTimer = CONFIG.heartDuration;
let heartBlinkingTimer = CONFIG.heartBlinkingDuration; 
let heartIsBlinking = false;
let asteroidSpawnTimer = 0;

const asteroids = [];

function createStars() {
  stars.length = 0;
  const count = Math.round((canvas.width * canvas.height) / CONFIG.starDensity);

  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      size: CONFIG.starMinSize + Math.random() * (CONFIG.starMaxSize - CONFIG.starMinSize),
      speed: CONFIG.starTwinkleSpeedMin + Math.random() * (CONFIG.starTwinkleSpeedMax - CONFIG.starTwinkleSpeedMin),
      phase: Math.random() * Math.PI * 2,
      color: CONFIG.starColors[Math.floor(Math.random() * CONFIG.starColors.length)],
      glow: Math.random() < CONFIG.starGlowChance,    
    });
  }
}

createStars();
window.addEventListener("resize", createStars);

function pickAsteroidSize() {
  const weights = CONFIG.asteroidSizeWeights;
  const total = weights.large + weights.medium + weights.small;
  let roll = Math.random() * total;

  if (roll < weights.large) return "large";
  roll -= weights.large

  if (roll < weights.medium) return "medium";
  return "small";
}

function getAsteroidPoints(size)  {
  if (size === "large") return 20;
  if (size === "medium") return 50;
  return 100;
}

function getAsteroidStats(size) {
  if (size === "large") return { radius: CONFIG.asteroidLargeSize, hp: 30};
  if (size === "medium") return { radius: CONFIG.asteroidMediumSize, hp: 20};
  return { radius: CONFIG.asteroidSmallSize, hp: 10};
}

function getSplitSize(size) {
  if (size === "large") return "medium";
  if (size === "medium") return "small";
  return null;
}

function spawnAsteroidAt(x, y, size, baseAngle, parentSpeed)  {
  const stats = getAsteroidStats(size);
  const angle = baseAngle + (Math.random() - 0.5) * CONFIG.asteroidSplitSpreadAngle;
  const speed = parentSpeed * CONFIG.asteroidSplitSpeedMultiplier;

  asteroids.push({
    x: x,
    y: y,
    velocityX: Math.cos(angle) * speed,
    velocityY: Math.sin(angle) * speed,
    size: size,
    radius: stats.radius,
    hp: stats.hp,
    rotation: Math.random() * Math.PI * 2,
  });
}

function spawnAsteroid()  {
  const size = pickAsteroidSize();
  const stats = getAsteroidStats(size);
  
  const edge = Math.floor(Math.random() * 4);
  let x, y;

  if (edge === 0) {
    x = Math.random() * canvas.width;
    y = - stats.radius;
  } else if (edge === 1)  {
    x = canvas.width + stats.radius;
    y = Math.random() * canvas.height;
  } else if (edge === 2) {
    x = Math.random() * canvas.width;
    y = canvas.height + stats.radius;
  } else {
    x = -stats.radius;
    y = Math.random() * canvas.height;
  }
  
  const angle = Math.random() * Math.PI * 2;
  const speed = CONFIG.asteroidSpeedMin + Math.random() * (CONFIG.asteroidSpeedMax - CONFIG.asteroidSpeedMin);

  asteroids.push({
    x: x,
    y: y,
    velocityX: Math.cos(angle) * speed,
    velocityY: Math.sin(angle) * speed,
    size: size,
    radius: stats.radius,
    hp: stats.hp,
    rotation: Math.random() * Math.PI * 2,
  });
}

function spawnTriple() {
  const edge = Math.floor(Math.random() * 4);
  let x, y;

  if (edge === 0) {
    x = Math.random() * canvas.width;
    y = -CONFIG.tripleSize;
  } else if (edge === 1) {
    x = canvas.width + CONFIG.tripleSize;
    y = Math.random() * canvas.height;
  } else if (edge === 2) {
    x = Math.random() * canvas.width;
    y = canvas.height + CONFIG.tripleSize;
  } else {
    x = -CONFIG.tripleSize;
    y = Math.random() * canvas.height;
  }

  const centerAngle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
  const angle = centerAngle + (Math.random() - 0.5) * (Math.PI / 6);
  const speed = CONFIG.tripleSpeed;

  triple = {
    x: x,
    y: y,
    velocityX: Math.cos(angle) * speed,
    velocityY: Math.sin(angle) * speed,
    radius: CONFIG.tripleSize / 2,
    hp: 1,
  };
}

function spawnHeart() {
  const edge = Math.floor(Math.random() * 4);
  let x, y;

  if (edge === 0) {
    x = Math.random() * canvas.width;
    y = -CONFIG.heartSize;
  } else if (edge === 1) {
    x = canvas.width + CONFIG.heartSize;
    y = Math.random() * canvas.height;
  } else if (edge === 2) {
    x = Math.random() * canvas.width;
    y = canvas.height + CONFIG.heartSize;
  } else {
    x = -CONFIG.heartSize;
    y = Math.random() * canvas.height;
  }

  const centerAngle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
  const angle = centerAngle + (Math.random() - 0.5) * (Math.PI / 6);
  const speed = CONFIG.heartSpeed;

  heart = {
    x: x,
    y: y,
    velocityX: Math.cos(angle) * speed,
    velocityY: Math.sin(angle) * speed,
    radius: CONFIG.heartSize / 2,
    hp: 1,
  };
}

function spawnRapid() {
  const edge = Math.floor(Math.random() * 4);
  let x, y;

  if (edge === 0) {
    x = Math.random() * canvas.width;
    y = -CONFIG.rapidSize;
  } else if (edge === 1) {
    x = canvas.width + CONFIG.rapidSize;
    y = Math.random() * canvas.height;
  } else if (edge === 2) {
    x = Math.random() * canvas.width;
    y = canvas.height + CONFIG.rapidSize;
  } else {
    x = -CONFIG.rapidSize;
    y = Math.random() * canvas.height;
  }

  const centerAngle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
  const angle = centerAngle + (Math.random() - 0.5) * (Math.PI / 6);
  const speed = CONFIG.rapidSpeed;

  rapid = {
    x: x,
    y: y,
    velocityX: Math.cos(angle) * speed,
    velocityY: Math.sin(angle) * speed,
    radius: CONFIG.rapidSize / 2,
    hp: 1,
  };
}

function spawnBullet(sideOffset = 0, forwardOffset = CONFIG.shipSize, angleOffset = 0)  {
  const perpX = -Math.sin(ship.angle);
  const perpY = Math.cos(ship.angle);
  const bulletAngle = ship.angle + angleOffset;

  bullets.push({
    x: ship.x + Math.cos(ship.angle) * forwardOffset + perpX * sideOffset,
    y: ship.y + Math.sin(ship.angle) * forwardOffset + perpY * sideOffset,
    velocityX: Math.cos(bulletAngle) * CONFIG.bulletSpeed + ship.velocityX,
    velocityY: Math.sin(bulletAngle) * CONFIG.bulletSpeed + ship.velocityY,
    angle: bulletAngle,
    life: CONFIG.bulletFadeDuration,
    age: 0,
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

function checkBulletAsteroidCollisions()  {
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const dx = bullets[i].x - asteroids[j].x;
      const dy = bullets[i].y - asteroids[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < (asteroids[j].radius + CONFIG.bulletSize) * CONFIG.asteroidHitboxScale) {
        bullets.splice(i, 1);
        asteroids[j].hp -= CONFIG.bulletDamage;

        if (asteroids[j].hp <= 0)  {
          score += getAsteroidPoints(asteroids[j].size);
          
          if (score >= allThreePowerupsScore && !rapid && !triple && !heart){
            spawnHeart();
            spawnRapid();
            spawnTriple();
            allThreePowerupsScore += CONFIG.allThreePowerupsScoreIncrease;
          }
          
          if (score >= heartSpawnScoreAmount && !heart)  {
            spawnHeart();
            heartSpawnScoreAmount += CONFIG.heartSpawnScoreIncrease;
          }

          if (score >= rapidSpawnScore && !rapid) {
            spawnRapid();
            rapidSpawnScore += CONFIG.rapidSpawnScoreIncrease;
          }

          if (score >= tripleSpawnScore && !triple) {
            spawnTriple();
            tripleSpawnScore += CONFIG.tripleSpawnScoreIncrease;
          }

          if (score > highScore)  {
            highScore = score;
          }
          const splitSize = getSplitSize(asteroids[j].size);

          if (splitSize)  {
            const baseAngle = Math.atan2(asteroids[j].velocityY, asteroids[j].velocityX);
            const parentSpeed = Math.sqrt(asteroids[j].velocityX ** 2 + asteroids[j].velocityY ** 2);
            
            spawnAsteroidAt(asteroids[j].x, asteroids[j].y, splitSize, baseAngle, parentSpeed);
            spawnAsteroidAt(asteroids[j].x, asteroids[j].y, splitSize, baseAngle, parentSpeed);
          }
          asteroids.splice(j, 1);
        }
        break;
      }
    }
  }
}

const explosions = [];

function spawnExplosion(x, y) {
  explosions.push({
    x: x,
    y: y,
    life: CONFIG.explosionDuration,
  });
}

function respawnShip() {
  ship.x = canvas.width / 2;
  ship.y = canvas.height / 2;
  ship.velocityX = 0;
  ship.velocityY = 0;
  ship.angle = -Math.PI / 2;
  invincibleTimer = CONFIG.shipInvincibleDuration;
}

function checkShipAsteroidCollision() {
  if (invincibleTimer > 0 || respawnTimer > 0) return;

  for (const a of asteroids)  {
    const dx = ship.x - a.x;
    const dy = ship.y - a.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < a.radius + CONFIG.shipSize * 0.5)  {
      lives--;
      rapidActive = false;
      rapidFireDuration = CONFIG.rapidFireDuration;
      spawnExplosion(ship.x, ship.y);

      if (lives <= 0) {
        gameOver = true;
        isNewHighScore = (score === highScore && highScore > 0);
      } else  {
        respawnTimer = CONFIG.explosionDuration;
      }
      break;
    }
  }
}

function checkShipHeartCollision() {
  if (!heart) {
    return;
  }

  const dx = ship.x - heart.x;
  const dy = ship.y - heart.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < heart.radius + CONFIG.shipSize * 0.5)  {
    lives++;
    heart = null;
  }
}

function checkShipRapidCollision() {
  if (!rapid) {
    return;
  }

  const dx = ship.x - rapid.x;
  const dy = ship.y - rapid.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < rapid.radius + CONFIG.shipSize * 0.9)  {
    rapidCounter++;
    rapid = null;
    rapidTimer = CONFIG.rapidDuration;
    rapidBlinkingTimer = CONFIG.rapidBlinkingDuration;
  }
}

function checkShipTripleCollision() {
  if (!triple) {
    return;
  }

  const dx = ship.x - triple.x;
  const dy = ship.y - triple.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < triple.radius + CONFIG.shipSize * 0.9)  {
    tripleCounter++;
    triple = null;
    tripleTimer = CONFIG.tripleDuration;
    tripleBlinkingTimer = CONFIG.tripleBlinkingDuration;
  }
}

function checkBulletHeartCollision()  {
  if (!heart) {
    return;
  }
  for (let i = bullets.length - 1; i >= 0; i--) {
    const dx = bullets[i].x - heart.x;
    const dy = bullets[i].y - heart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < (heart.radius + CONFIG.bulletSize) * 0.5) {
      bullets.splice(i, 1);
      lives++;
      heart = null;
      break;
    }
  }
}

function checkBulletRapidCollision()  {
  if (!rapid) {
    return;
  }
  for (let i = bullets.length - 1; i >= 0; i--) {
    const dx = bullets[i].x - rapid.x;
    const dy = bullets[i].y - rapid.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < (rapid.radius + CONFIG.bulletSize)) {
      bullets.splice(i, 1);
      rapidCounter++;
      rapid = null;
      rapidTimer = CONFIG.rapidDuration;
      rapidBlinkingTimer = CONFIG.rapidBlinkingDuration;
      break;
    }
  }
}

function checkBulletTripleCollision()  {
  if (!triple) {
    return;
  }
  for (let i = bullets.length - 1; i >= 0; i--) {
    const dx = bullets[i].x - triple.x;
    const dy = bullets[i].y - triple.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < (triple.radius + CONFIG.bulletSize)) {
      bullets.splice(i, 1);
      tripleCounter++;
      triple = null;
      tripleTimer = CONFIG.tripleDuration;
      tripleBlinkingTimer = CONFIG.tripleBlinkingDuration;
      break;
    }
  }
}
const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.key === "t")  {
    if (tripleCounter >= 1) {
      tripleActive = true;
      tripleFireDuration = CONFIG.tripleFireDuration;
      tripleCounter--;
    }
  }
  

  if (e.key === "Enter" && gameOver)  {
    resetGame();
  }

  if (e.key.toLowerCase() === "r" && reloadTimer <= 0 && !rapidActive) {
    if (rapidCounter >= 1) {
      rapidActive = true;
      rapidFireDuration = CONFIG.rapidFireDuration;
      rapidCounter--;
    }
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

window.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    keys["Mouse0"] = true
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
  if (heart) {
    if (heartTimer > 0) {
      heartTimer--;
    } else {
      heartBlinkingTimer--;
    }
    if (heartTimer <= 0 && heartBlinkingTimer <= 0) {
      heart = null;
      heartTimer = CONFIG.heartDuration;
      heartBlinkingTimer = CONFIG.heartBlinkingDuration;
    }

    if (heart)  {
      heart.x += heart.velocityX;
      heart.y += heart.velocityY;
      
      if (heart.x < -heart.radius) heart.x = canvas.width + heart.radius;
      if (heart.x > canvas.width + heart.radius) heart.x = -heart.radius;
      if (heart.y < -heart.radius) heart.y = canvas.height + heart.radius;
      if (heart.y > canvas.height + heart.radius) heart.y = -heart.radius;
    }
  }

  if (rapid) {
    if (rapidTimer > 0) {
      rapidTimer--;
    } else {
      rapidBlinkingTimer--;
    }
    if (rapidTimer <= 0 && rapidBlinkingTimer <= 0) {
      rapid = null;
      rapidTimer = CONFIG.rapidDuration;
      rapidBlinkingTimer = CONFIG.rapidBlinkingDuration;
    }

    if (rapid)  {
      rapid.x += rapid.velocityX;
      rapid.y += rapid.velocityY;
      
      if (rapid.x < -rapid.radius) rapid.x = canvas.width + rapid.radius;
      if (rapid.x > canvas.width + rapid.radius) rapid.x = -rapid.radius;
      if (rapid.y < -rapid.radius) rapid.y = canvas.height + rapid.radius;
      if (rapid.y > canvas.height + rapid.radius) rapid.y = -rapid.radius;
    }
  }

  if (triple) {
    if (tripleTimer > 0) {
      tripleTimer--;
    } else {
      tripleBlinkingTimer--;
    }
    if (tripleTimer <= 0 && tripleBlinkingTimer <= 0) {
      triple = null;
      tripleTimer = CONFIG.tripleDuration;
      tripleBlinkingTimer = CONFIG.tripleBlinkingDuration;
    }

    if (triple)  {
      triple.x += triple.velocityX;
      triple.y += triple.velocityY;
      
      if (triple.x < -triple.radius) triple.x = canvas.width + triple.radius;
      if (triple.x > canvas.width + triple.radius) triple.x = -triple.radius;
      if (triple.y < -triple.radius) triple.y = canvas.height + triple.radius;
      if (triple.y > canvas.height + triple.radius) triple.y = -triple.radius;
    }
  }

    if (gameOver) {
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].life--;
      if (particles[i].life <= 0) {
        particles.splice(i, 1);
      }
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
      explosions[i].life--;
      if (explosions[i].life <= 0) {
        explosions.splice(i, 1);
      }
    }
    
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.age++;

      if (
        b.x < 0 || b.x > canvas.width ||
        b.y < 0 || b.y > canvas.height
      ) {
        b.life--;
        if (b.life <= 0) {
          bullets.splice(i, 1);
        } 
      } else {
        b.x += b.velocityX;
        b.y += b.velocityY;
      }
  }
    
    for (const a of asteroids)  {
      a.x += a.velocityX;
      a.y += a.velocityY;

      if (a.x < -a.radius) a.x = canvas.width + a.radius;
      if (a.x > canvas.width + a.radius) a.x = -a.radius;
      if (a.y < -a.radius) a.y = canvas.height + a.radius;
      if (a.y > canvas.height + a.radius) a.y = -a.radius;
    }

    return;
  }

  if (respawnTimer <= 0)  {
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

    if (keys["c"])  {
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
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].life--;
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }

  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].life--;
    if (explosions[i].life <= 0) {
      explosions.splice(i, 1);
    }
  }

  if (rapidActive)  {
    rapidFireDuration--;
    if (rapidFireDuration <= 0)  {
      rapidActive = false;
      rapidFireDuration = CONFIG.rapidFireDuration;
    }
  }

  if (tripleActive) {
    tripleFireDuration--;
    if (tripleFireDuration <= 0)  {
      tripleActive = false;
      tripleFireDuration = CONFIG.tripleFireDuration;
    }
  }

  if (reloadTimer > 0)  {
    reloadTimer--;
  }

  if (fireCooldown > 0) {
    fireCooldown--;
  }

  if (invincibleTimer > 0)  {
    invincibleTimer--;
  }

  if (respawnTimer > 0)  {
    respawnTimer--;
    if (respawnTimer <= 0)  {
      respawnShip();
    }
  }

  if (respawnTimer <= 0 && (keys[" "] || keys["Mouse0"] || rapidActive) && fireCooldown <= 0 && reloadTimer <= 0) {
    if (tripleActive)  {
        spawnBullet(-17, -16, -CONFIG.tripleShotSpread);
        spawnBullet(0, 7);
        spawnBullet(17, -16, CONFIG.tripleShotSpread);
    } else  {
        spawnBullet();
    }
    fireCooldown = rapidActive ? CONFIG.rapidFireRate : CONFIG.fireRate;
  }

   for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.age++;

    if (
      b.x < 0 || b.x > canvas.width ||
      b.y < 0 || b.y > canvas.height
    ) {
      b.life--;
      if (b.life <= 0) {
        bullets.splice(i, 1);
      }
    } else {
      b.x += b.velocityX;
      b.y += b.velocityY;
    }
  }

  checkBulletAsteroidCollisions();
  checkShipAsteroidCollision();
  checkBulletHeartCollision();
  checkShipHeartCollision();
  checkShipRapidCollision();
  checkBulletRapidCollision();
  checkBulletTripleCollision();
  checkShipTripleCollision();

  asteroidSpawnTimer--;
 
  if (asteroidSpawnTimer <= 0 && asteroids.length < (canvas.width * canvas.height) / CONFIG.asteroidDensity)  {
    spawnAsteroid();
    asteroidSpawnTimer = CONFIG.asteroidSpawnRate;
  }

  for (const a of asteroids)  {
    a.x += a.velocityX;
    a.y += a.velocityY;

    if (a.x < -a.radius) a.x = canvas.width + a.radius;
    if (a.x > canvas.width + a.radius) a.x = -a.radius;
    if (a.y < -a.radius) a.y = canvas.height + a.radius;
    if (a.y > canvas.height + a.radius) a.y = -a.radius;
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
  if (gameOver || respawnTimer > 0) return;

  if (invincibleTimer > 0 && Math.floor (invincibleTimer / 6) % 2 === 0)  {
    return;
  }

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

function drawAsteroids()  {
  for (const a of asteroids)  {
    let img;
    if (a.size === "large") img = IMAGES.asteroidLarge;
    else if (a.size === "medium") img = IMAGES.asteroidMedium;
    else img = IMAGES.asteroidSmall;
    
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rotation);
    ctx.drawImage(
      img,
      -a.radius,
      -a.radius,
      a.radius * 2,
      a.radius * 2
    );
    ctx.restore();
  }
}

function drawExplosions() {
  for (const e of explosions) {
    const lifeRatio = e.life / CONFIG.explosionDuration;
    const growRatio = 1 - lifeRatio;
    const currentSize = CONFIG.explosionSize * (0.3 + growRatio * 0.7);
    const alpha = lifeRatio ** 0.3;

    ctx.globalAlpha = alpha;
    ctx.drawImage(
      IMAGES.explosion,
      e.x - currentSize / 2,
      e.y - currentSize / 2,
      currentSize,
      currentSize
    );
    ctx.globalAlpha = 1;
  }
}

function drawBullets()  {
  for (const b of bullets)  {
    const alpha = b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height
      ? b.life / CONFIG.bulletFadeDuration
      : 1;

    // Motion trail: fading ghosts behind the bullet (visual only)
    const trailCount = Math.min(CONFIG.bulletTrailLength, b.age);
    for (let t = trailCount; t >= 1; t--) {
      const fade = 1 - t / (CONFIG.bulletTrailLength + 1);
      const gx = b.x - b.velocityX * CONFIG.bulletTrailSpacing * t;
      const gy = b.y - b.velocityY * CONFIG.bulletTrailSpacing * t;
      const gs = CONFIG.bulletSize * (0.5 + 0.5 * fade);

      ctx.save();
      ctx.globalAlpha = alpha * CONFIG.bulletTrailAlpha * fade;
      ctx.translate(gx, gy);
      ctx.rotate(b.angle + Math.PI / 2);
      ctx.drawImage(IMAGES.bulletImg, -gs, -gs, gs * 2, gs * 2);
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = alpha;
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

function drawHeart() {
  if (heart) {
    
    if (heartBlinkingTimer > 0 && heartTimer <= 0 && Math.floor (heartBlinkingTimer / 12) % 2 === 0)  {
      return;
    }

    ctx.save();
    ctx.translate(heart.x, heart.y);

    const drawHeight = CONFIG.heartSize;
    const drawWidth = drawHeight * (IMAGES.heart.width / IMAGES.heart.height);

    ctx.drawImage(
      IMAGES.heart,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    ctx.restore();
  }
}

function drawRapid() {
  if (rapid) { 
    if (rapidBlinkingTimer > 0 && rapidTimer <= 0 && Math.floor (rapidBlinkingTimer / 12) % 2 === 0)  {
      return;
    }

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(rapid.x, rapid.y);

    const drawHeight = CONFIG.rapidSize;
    const drawWidth = drawHeight * (IMAGES.rapidFireImage.width / IMAGES.rapidFireImage.height);

    ctx.drawImage(
      IMAGES.rapidFireImage,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    ctx.restore();
  }
}

function drawTriple() {
  if (triple) { 
    if (tripleBlinkingTimer > 0 && tripleTimer <= 0 && Math.floor (tripleBlinkingTimer / 12) % 2 === 0)  {
      return;
    }

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(triple.x, triple.y);

    const drawHeight = CONFIG.tripleSize;
    const drawWidth = drawHeight * (IMAGES.tripleFireImage.width / IMAGES.tripleFireImage.height);

    ctx.drawImage(
      IMAGES.tripleFireImage,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    ctx.restore();
  }
}

function drawStars() {
  const time = performance.now();
  const alphaRange = CONFIG.starMaxAlpha - CONFIG.starMinAlpha;

  for (const s of stars)  {
    const pulse = 0.5 + 0.5 * Math.sin(time * s.speed + s.phase);
    const alpha = CONFIG.starMinAlpha + alphaRange * pulse;
    const x = s.x * canvas.width;
    const y = s.y * canvas.height;

    ctx.fillStyle = s.color;

    if (s.glow) {
      const glowRadius = s.size * 4;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      gradient.addColorStop(0, s.color);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.globalAlpha = alpha * 0.35;
      ctx.fillStyle = gradient;
      ctx.beginPath()
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = s.color;
    }
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawHUD()  {
  ctx.fillStyle = "#66d1de";
  ctx.font = "400 30px 'Audiowide', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Lives: ${lives}`, 20, 30);
  ctx.fillText(`Rapid Fire [r]: ${rapidCounter}`, 20, 61);
  ctx.fillText(`Triple Shot [t]: ${tripleCounter}`, 20, 92);
  ctx.textAlign = "right";
  //ctx.fillStyle = "#ffffff";
  ctx.fillText(`Score: ${score}`, canvas.width - 20, 30);
  //ctx.fillStyle = "#ffdd00";
  ctx.fillText(`High Score: ${highScore}`, canvas.width - 20, 61);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff3333";
  ctx.textAlign = "center";
  ctx.font = "900 64px 'Audiowide', sans-serif";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
  
  ctx.font = "700 32px 'Audiowide', sans-serif";
  ctx.fillStyle = "#66d1de";
  ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
  //ctx.fillStyle = "#aaaaaa";
  ctx.fillText("Press Enter to Restart", canvas.width / 2, canvas.height / 2 + 60);

  if (isNewHighScore) {
    const flashOn = Math.floor(Date.now() / 350) % 2 === 0;
    if (flashOn)  {
      ctx.fillStyle = "#ffee33";
      ctx.font = "900 48px 'Audiowide', sans-serif";
      ctx.fillText(`New High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 - 90);
    }
  }
}

function resetGame()  {
  lives = CONFIG.shipLives;
  score = 0;
  gameOver = false;
  isNewHighScore = false;

  heart = null;
  heartTimer = CONFIG.heartDuration;
  heartBlinkingTimer = CONFIG.heartBlinkingDuration;
  heartSpawnScoreAmount = CONFIG.heartSpawnScoreAmount;

  asteroids.length = 0;
  bullets.length = 0;
  particles.length = 0;

  fireCooldown = 0;
  rapid = null;
  triple = null;
  rapidActive = false;
  rapidTimer = CONFIG.rapidDuration;
  rapidCounter = 0;
  rapidActive = false;
  rapidFireDuration = CONFIG.rapidFireDuration;
  rapidBlinkingTimer = CONFIG.rapidBlinkingDuration;
  rapidSpawnScore = CONFIG.rapidSpawnScore;
  tripleSpawnScore = CONFIG.tripleSpawnScore;
  tripleCounter = 0;
  reloadTimer = 0;
  tripleTimer = CONFIG.tripleDuration;
  tripleBlinkingTimer = CONFIG.tripleBlinkingDuration;
  tripleFireDuration = CONFIG.tripleFireDuration;
  asteroidSpawnTimer = 0;
  tripleActive = false;
  allThreePowerupsScore = CONFIG.allThreePowerupsScore; 
  respawnTimer = 0;
  respawnShip();
  invincibleTimer = 0;
}

function draw() {
  ctx.fillStyle = CONFIG.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  drawStars();
  drawAsteroids();
  drawParticles();
  drawShip();
  drawBullets();
  drawExplosions();
  drawHeart();
  drawRapid();
  drawTriple();
  drawHUD();

  if (gameOver) {
    drawGameOver();
    canvas.style.cursor = "default";
  } else {
    canvas.style.cursor = "none";
  }
}

function gameLoop()  {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

loadImages(() => {
  gameLoop();
});
