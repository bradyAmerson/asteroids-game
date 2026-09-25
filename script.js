const CONFIG = {
  // Ship
  shipSize: 15,
  shipRotationSpeed: 0.06,
  shipThrust: 0.08,
  shipMaxSpeed: 6,
  shipFriction:0.995,
  
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
}

const IMAGES = {};
const IMAGE_SOURCES = {
  
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function update() {
  // Game state updates
}

function 
