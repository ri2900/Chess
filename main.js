// State variables
let game = new Chess(); // use chess.js engine
let botLevel = 1;
let mode = null; // "bot", "online", "offline"

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

// Initialization
document.getElementById('btn-vs-bot').onclick = () => setupMode('bot');
document.getElementById('btn-online').onclick = () => setupMode('online');
document.getElementById('btn-offline').onclick = () => setupMode('offline');

// Mode setup
function setupMode(selectedMode) {
  mode = selectedMode;
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('game-container').classList.remove('hidden');

  document.getElementById('mode-indicator').textContent = 
    {bot: "Playing vs Bot", online: "Online Match", offline: "2‑Player Offline"}[mode];

  if (mode === 'bot') {
    document.getElementById('bot-level').classList.remove('hidden');
    document.getElementById('bot-level').onchange = e => botLevel = +e.target.value;
  }

  if (mode === 'online') initWebSocketMatch();
  if (mode === 'offline') loadOfflineGame();

  drawBoard();
}

// Board drawing function (load images and pieces, etc.)
function drawBoard() { /* … render board … */ }

// Handling clicks/drags for moves
canvas.addEventListener('click', e => {
  const sq = pixelToSquare(e.offsetX, e.offsetY);
  handleSquareClick(sq);
});

// Move logic based on mode
function handleSquareClick(sq) {
  // Use chess.js to select/move
  // After move, save offline, send online, or trigger bot move
}

// Bot move (minimax + depth depending on botLevel)
function doBotMove() { /* … */ }

// WebSocket (online play)
let socket;
function initWebSocketMatch() {
  socket = new WebSocket('wss://yourserver.example/match');
  socket.onmessage = msg => {
    const data = JSON.parse(msg.data);
    if (data.type === 'move') {
      game.move(data.move);
      drawBoard();
    }
  };
}

// Offline save
function saveOfflineGame() {
  localStorage.setItem('savedGame', game.fen());
}
function loadOfflineGame() {
  const fen = localStorage.getItem('savedGame');
  if (fen) {
    game.load(fen);
  }
}

// Undo/resign buttons
document.getElementById('btn-undo').onclick = () => { game.undo(); drawBoard(); if (mode==='offline') saveOfflineGame() };
document.getElementById('btn-resign').onclick = () => alert('Game over. Resign!');

// Game loop, check for game over
function checkGameEnd() {
  if (game.game_over()) {
    document.getElementById('status').textContent = 
      game.in_checkmate() ? "Checkmate!" : "Draw!";
  }
  if (mode==='offline') saveOfflineGame();
}
