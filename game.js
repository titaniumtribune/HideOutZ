const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let cursors;
let bullets;
let lastFired = 0;
let map;
let timerText;
let gameTime = 180; // 3 minutes
let timerEvent;

const game = new Phaser.Game(config);

function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('bullet', 'assets/bullet.png');
  this.load.image('map', 'assets/map.png');
  this.load.image('powerup', 'assets/powerup.png');
}

function create() {
  // Map background
  map = this.add.image(400, 300, 'map');

  // Player
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.speed = 200;
  player.isInvisible = false;

  // Controls
  cursors = this.input.keyboard.createCursorKeys();
  this.input.keyboard.on('keydown-SPACE', shootBullet, this);

  // Bullets group
  bullets = this.physics.add.group();

  // Timer
  timerText = this.add.text(650, 20, formatTime(gameTime), { font: '20px Arial', fill: '#fff' });
  timerEvent = this.time.addEvent({
    delay: 1000,
    callback: onEvent,
    callbackScope: this,
    loop: true
  });

  // Powerups
  this.powerup = this.physics.add.sprite(Phaser.Math.Between(50,750), Phaser.Math.Between(50,550), 'powerup');
  this.physics.add.overlap(player, this.powerup, collectPowerup, null, this);
}

function update(time, delta) {
  player.setVelocity(0);

  if (cursors.left.isDown) player.setVelocityX(-player.speed);
  if (cursors.right.isDown) player.setVelocityX(player.speed);
  if (cursors.up.isDown) player.setVelocityY(-player.speed);
  if (cursors.down.isDown) player.setVelocityY(player.speed);

  // Player invisibility effect
  player.alpha = player.isInvisible ? 0.3 : 1;

  // Optional: move bullets
  bullets.children.iterate(function(b) {
    if (b) {
      if (b.y < 0) b.destroy();
    }
  });
}

function shootBullet() {
  if (player.isInvisible) return; // Can't shoot while invisible
  const bullet = bullets.create(player.x, player.y, 'bullet');
  bullet.setVelocityY(-400);

  // Flash position logic (simple)
  console.log('Player shot! Position flashed for 2 seconds');
}

function onEvent() {
  gameTime--;
  timerText.setText(formatTime(gameTime));
  if (gameTime <= 0) {
    timerEvent.remove(false);
    this.add.text(300, 250, 'Game Over!', { font: '40px Arial', fill: '#ff5050' });
    this.physics.pause();
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds/60);
  const partInSeconds = seconds % 60;
  return `${minutes}:${partInSeconds < 10 ? '0' : ''}${partInSeconds}`;
}

function collectPowerup(player, powerup) {
  powerup.destroy();
  player.isInvisible = true;
  setTimeout(()=> { player.isInvisible = false; }, 5000);
}
