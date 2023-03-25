function game() {
  const canvas = document.getElementById("gameWindow");
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("startbtn");
  const restartButton = document.getElementById("restartbtn");
  const character = document.getElementById("characterImg");
  let height = (canvas.height = 600);
  let width = (canvas.width = 400);
  let reqId;
  let gameOver = false,
    score = 0,
    g = 0.25,
    nPlatforms = 10,
    slide = 0,
    slideRate = 0,
    dr = 0,
    oldTime = 0,
    fps,
    pressedKeys = {},
    platforms = [];

  class Player {
    constructor() {
      this.x = 200;
      this.y = 550;
      this.speedx = 3;
      this.speedy = 0;
      this.dx = 0;
      this.jumpHeight = 200;
      this.u = Math.sqrt(2 * g * this.jumpHeight);
      this.color = "#ff0";
    }
    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
    jump() {
      this.speedy = -this.u;
    }

    collision() {
      if (this.speedy > 0 && this.y >= ground.y - 5) {
        return true;
      }
      for (let i = 0; i < nPlatforms; i++) {
        if (platforms[i].collisionDetection()) {
          if (platforms[i].y <= width) {
            slide = 500 - platforms[i].y;
            slideRate = slide / 20;
          }
          return true;
        }
      }
      return false;
    }
    update() {
      if (this.y > height) {
        gameOver = true;
      }
      this.x += this.dx * this.speedx;

      if (this.x < -10) {
        this.x = canvas.width + 10;
      } else if (this.x > canvas.width + 10) {
        this.x = -10;
      }

      if (this.collision()) {
        this.jump();
      } else {
        this.speedy += g;
        this.y += this.speedy;
      }
      this.draw();
    }
  }
  class Platform {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.speedx = 1;
      this.width = 75;
      this.height = 20;
      this.color = "#0a0";
      this.moving = false;
      this.jetPack = false;
      this.spike = false;
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    collisionDetection() {
      if (
        player.speedy > 0 &&
        player.x > this.x &&
        player.x < this.x + this.width &&
        Math.abs(player.y - this.y) < 10
      ) {
        return true;
      }
    }
  }

  class Ground {
    constructor() {
      this.width = width;
      this.height = 50;
      this.x = 0;
      this.y = height - this.height;
      this.color = "#080";
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    update() {
      ground.y += slideRate;
      this.draw();
    }
  }

  document.addEventListener("keydown", (e) => {
    pressedKeys[e.key] = true;
    switch (e.key) {
      case "ArrowRight":
        player.dx = 1;
        break;
      case "ArrowLeft":
        player.dx = -1;
    }
  });

  document.addEventListener("keyup", (e) => {
    pressedKeys[e.key] = false;
    switch (e.key) {
      case "ArrowRight":
        if (player.dx == 1 && !pressedKeys["ArrowLeft"]) {
          player.dx = 0;
        } else {
          player.dx = -1;
        }
        break;
      case "ArrowLeft":
        if (player.dx == -1 && !pressedKeys["ArrowRight"]) {
          player.dx = 0;
        } else {
          player.dx = 1;
        }
    }
  });

  startButton.addEventListener("click", (e) => {
    reqId = window.requestAnimationFrame(loop);
    startButton.style.display = "none";
    restartButton.style.display = "inline";
  });

  restartButton.addEventListener("click", (e) => {
    window.cancelAnimationFrame(reqId);
    gameOver = false;
    score = 0;
    slide = 0;
    slideRate = 0;
    pressedKeys = {};
    platforms = [];
    ground = new Ground();
    player = new Player();
    for (let i = 0; i < nPlatforms; i++) {
      let x = Math.random() * 300;
      let y =
        (500 / nPlatforms) * (i + 1) +
        (500 / nPlatforms - 50) * (Math.random() - 0.5);
      platforms.push(new Platform(x, y));
    }
    reqId = window.requestAnimationFrame(loop);
  });

  function updatePlatforms() {
    if (slide > 0) {
      for (let i = 0; i < nPlatforms; i++) {
        platforms[i].y += slideRate;
      }
      player.y += slideRate;
      slide -= slideRate;
      slideRate -= slideRate * 0.05;
    }

    for (let i = 0; i < nPlatforms; i++) {
      if (platforms[i].moving) {
        platforms[i].x += platforms[i].speedx;
      }
      if (platforms[i].x < 0 || platforms[i].x > width - platforms[i].width) {
        platforms[i].speedx = -platforms[i].speedx;
      }
      if (platforms[i].y > height) {
        score++;
        platforms[i].x = Math.random() * 300;
        platforms[i].y = platforms[0].y - (150 * Math.random() + 25);
        if (score > 100) {
          platforms[i].moving = Math.random() < score / 500;
        }
        if (score > 200) {
          platforms[i].speedx = 2;
        }
        platforms.unshift(platforms.pop());
      }
    }
  }

  function gameOverScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, width, height);
    ctx.clearRect(20, 200, 360, 200);
    ctx.font = "bold 40px serif";
    ctx.fillStyle = "#f00";
    ctx.fillText("GAME  OVER :(", 50, 285);
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText("YOUR SCORE : " + score, 110, 350);
  }

  function loop(timestamp) {
    if (gameOver) {
      gameOverScreen();
      return;
    }

    ctx.clearRect(0, 0, width, height);
    if (ground.y < height + 30) {
      ground.update();
    }
    updatePlatforms();
    for (let i = 0; i < nPlatforms; i++) {
      platforms[i].draw();
    }
    player.update();

    // ctx.drawImage(character, 0, 0, 50, 50);

    fps = Math.round(1000 / (timestamp - oldTime));
    oldTime = timestamp;
    ctx.fillStyle = "#fff";
    ctx.font = "15px sans-serif";
    ctx.fillText("FPS : " + fps, 10, 30);
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("SCORE : " + score, 260, 30);

    reqId = reqId = window.requestAnimationFrame(loop);
  }

  let ground = new Ground();
  let player = new Player();
  for (let i = 0; i < nPlatforms; i++) {
    let x = Math.random() * 300;
    let y =
      (500 / nPlatforms) * (i + 1) +
      (500 / nPlatforms - 50) * (Math.random() - 0.5);
    platforms.push(new Platform(x, y));
  }
  ctx.fillStyle = "#fff";
  ctx.font = "bold 50px sans-serif";
  ctx.fillText("Doodle", 115, 285);
  ctx.fillText("Jump", 130, 385);
}
game();
