const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const linesEl = document.getElementById("lines");
const restartBtn = document.getElementById("restart");
const musicBtn = document.getElementById("musicToggle");

ctx.imageSmoothingEnabled = false;

const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]]
];

const COLORS = ["#ff9d2e", "#ffb84d", "#ff7b00", "#ffc266", "#ff9933", "#ff8f3a", "#e56a00"];

function makeBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

let board = makeBoard();
let score = 0;
let lines = 0;
let dropMs = 650;
let paused = false;
let gameOver = false;
let dropCounter = 0;
let lastTime = 0;

let audio;
let musicMuted = false;
let startedAudio = false;

function randomPiece() {
  const id = Math.floor(Math.random() * SHAPES.length);
  return {
    shape: SHAPES[id].map((r) => [...r]),
    color: COLORS[id],
    x: Math.floor(COLS / 2) - 1,
    y: 0
  };
}

let piece = randomPiece();

function drawCatBlock(x, y, color) {
  const px = x * BLOCK;
  const py = y * BLOCK;

  ctx.fillStyle = color;
  ctx.fillRect(px, py, BLOCK, BLOCK);

  ctx.fillStyle = "rgba(255,255,255,0.23)";
  ctx.fillRect(px + 2, py + 2, BLOCK - 4, 5);

  ctx.fillStyle = "#1d0c00";
  ctx.fillRect(px + 8, py + 11, 4, 4);
  ctx.fillRect(px + 18, py + 11, 4, 4);

  ctx.fillStyle = "#ffe7bf";
  ctx.fillRect(px + 11, py + 18, 8, 4);

  ctx.strokeStyle = "#2b1200";
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 1, py + 1, BLOCK - 2, BLOCK - 2);

  ctx.fillStyle = "#2b1200";
  ctx.beginPath();
  ctx.moveTo(px + 1, py + 1);
  ctx.lineTo(px + 8, py + 1);
  ctx.lineTo(px + 1, py + 8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(px + BLOCK - 1, py + 1);
  ctx.lineTo(px + BLOCK - 8, py + 1);
  ctx.lineTo(px + BLOCK - 1, py + 8);
  ctx.fill();
}

function drawBoard() {
  ctx.fillStyle = "#130a10";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) drawCatBlock(x, y, board[y][x]);
      ctx.strokeStyle = "rgba(255, 145, 0, 0.08)";
      ctx.strokeRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
    }
  }
}

function drawPiece(active) {
  active.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) drawCatBlock(active.x + x, active.y + y, active.color);
    });
  });
}

function collides(testPiece) {
  return testPiece.shape.some((row, y) => row.some((cell, x) => {
    if (!cell) return false;
    const newX = testPiece.x + x;
    const newY = testPiece.y + y;
    return (
      newX < 0 ||
      newX >= COLS ||
      newY >= ROWS ||
      (newY >= 0 && board[newY][newX])
    );
  }));
}

function mergePiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell && piece.y + y >= 0) board[piece.y + y][piece.x + x] = piece.color;
    });
  });
}

function rotate(shape) {
  return shape[0].map((_, i) => shape.map((row) => row[i]).reverse());
}

function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(Boolean)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      y++;
    }
  }

  if (cleared > 0) {
    lines += cleared;
    score += [0, 100, 300, 500, 800][cleared];
    dropMs = Math.max(160, 650 - Math.floor(lines / 5) * 45);
    scoreEl.textContent = score;
    linesEl.textContent = lines;
  }
}

function lockAndSpawn() {
  mergePiece();
  clearLines();
  piece = randomPiece();
  if (collides(piece)) {
    gameOver = true;
  }
}

function move(dx) {
  if (paused || gameOver) return;
  piece.x += dx;
  if (collides(piece)) piece.x -= dx;
}

function softDrop() {
  if (paused || gameOver) return;
  piece.y++;
  if (collides(piece)) {
    piece.y--;
    lockAndSpawn();
  }
}

function hardDrop() {
  if (paused || gameOver) return;
  while (!collides(piece)) piece.y++;
  piece.y--;
  lockAndSpawn();
}

function spin() {
  if (paused || gameOver) return;
  const backup = piece.shape;
  piece.shape = rotate(piece.shape);
  if (collides(piece)) piece.shape = backup;
}

function resetGame() {
  board = makeBoard();
  score = 0;
  lines = 0;
  dropMs = 650;
  paused = false;
  gameOver = false;
  dropCounter = 0;
  lastTime = 0;
  piece = randomPiece();
  scoreEl.textContent = score;
  linesEl.textContent = lines;
}

function drawOverlay() {
  if (!paused && !gameOver) return;
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffd89e";
  ctx.textAlign = "center";
  ctx.font = "bold 32px Courier New";
  ctx.fillText(gameOver ? "GAME OVER" : "PAUSED", canvas.width / 2, canvas.height / 2);
  ctx.font = "16px Courier New";
  if (gameOver) ctx.fillText("Press Restart for another cat stack.", canvas.width / 2, canvas.height / 2 + 35);
}

function loop(time = 0) {
  const delta = time - lastTime;
  lastTime = time;
  if (!paused && !gameOver) {
    dropCounter += delta;
    if (dropCounter > dropMs) {
      softDrop();
      dropCounter = 0;
    }
  }

  drawBoard();
  if (!gameOver) drawPiece(piece);
  drawOverlay();
  requestAnimationFrame(loop);
}

function setupInput() {
  window.addEventListener("keydown", (e) => {
    if (!startedAudio) {
      startMusic();
    }

    switch (e.key) {
      case "ArrowLeft":
        move(-1);
        break;
      case "ArrowRight":
        move(1);
        break;
      case "ArrowDown":
        softDrop();
        break;
      case "ArrowUp":
        spin();
        break;
      case " ":
        hardDrop();
        break;
      case "p":
      case "P":
        paused = !paused;
        break;
      default:
        return;
    }
    e.preventDefault();
  });

  restartBtn.addEventListener("click", resetGame);
  musicBtn.addEventListener("click", () => {
    if (!startedAudio) startMusic();
    musicMuted = !musicMuted;
    if (audio?.gainNode) audio.gainNode.gain.value = musicMuted ? 0 : 0.045;
    musicBtn.textContent = musicMuted ? "🎵 Unmute Music" : "🎵 Mute Music";
  });
}

function startMusic() {
  if (startedAudio) return;
  startedAudio = true;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctxAudio = new AudioCtx();
  const gainNode = ctxAudio.createGain();
  gainNode.gain.value = 0.045;
  gainNode.connect(ctxAudio.destination);

  const notes = [
    523.25, 659.25, 783.99, 659.25,
    493.88, 587.33, 659.25, 587.33,
    440.0, 523.25, 659.25, 523.25,
    392.0, 493.88, 587.33, 493.88
  ];

  let i = 0;
  setInterval(() => {
    if (musicMuted) return;
    const osc = ctxAudio.createOscillator();
    osc.type = "square";
    osc.frequency.value = notes[i % notes.length];
    const envelope = ctxAudio.createGain();
    envelope.gain.setValueAtTime(0.0001, ctxAudio.currentTime);
    envelope.gain.exponentialRampToValueAtTime(0.3, ctxAudio.currentTime + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.0001, ctxAudio.currentTime + 0.14);
    osc.connect(envelope).connect(gainNode);
    osc.start();
    osc.stop(ctxAudio.currentTime + 0.15);
    i++;
  }, 170);

  audio = { ctxAudio, gainNode };
}

setupInput();
resetGame();
loop();
