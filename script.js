let game = new Chess();
let selected = null;
let isBot = false;
let botLevel = 1;

const board = document.getElementById('board');
const statusEl = document.getElementById('status');
const levelSelect = document.getElementById('level');

function drawBoard() {
  board.innerHTML = '';
  const pos = game.board();
  for (let y = 7; y >= 0; y--) {
    for (let x = 0; x < 8; x++) {
      const sq = String.fromCharCode(97 + x) + (y + 1);
      const piece = pos[y][x];
      const div = document.createElement('div');
      div.className = 'square ' + ((x + y) % 2 === 0 ? 'white' : 'black');
      div.dataset.square = sq;
      if (piece) div.textContent = piece.symbol;
      div.onclick = () => handleClick(sq);
      board.appendChild(div);
    }
  }
  statusEl.textContent = game.in_checkmate()
    ? 'Checkmate!'
    : game.in_draw()
    ? 'Draw'
    : (game.turn() === 'w' ? 'White' : 'Black') + "'s turn";
  saveGame();
}

function handleClick(square) {
  if (!selected) {
    selected = square;
    highlight(square);
  } else {
    const move = game.move({ from: selected, to: square, promotion: 'q' });
    selected = null;
    if (move) {
      drawBoard();
      if (isBot && game.turn() === 'b') {
        setTimeout(botMove, 200);
      }
    } else {
      drawBoard();
    }
  }
}

function highlight(sq) {
  drawBoard();
  const el = [...board.children].find(el => el.dataset.square === sq);
  if (el) el.classList.add('selected');
}

function startOffline() {
  isBot = false;
  game.reset();
  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  levelSelect.classList.add('hidden');
  drawBoard();
}

function startBot() {
  isBot = true;
  botLevel = parseInt(levelSelect.value);
  levelSelect.classList.remove('hidden');
  levelSelect.onchange = () => {
    botLevel = parseInt(levelSelect.value);
  };
  game.reset();
  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  drawBoard();
}

function undo() {
  game.undo();
  if (isBot) game.undo();
  drawBoard();
}

function saveGame() {
  localStorage.setItem('chessSave', game.fen());
}

function loadGame() {
  const saved = localStorage.getItem('chessSave');
  if (saved) {
    game.load(saved);
    drawBoard();
  }
}

// Very basic bot (random for levels 1-2, smarter at 3+)
function botMove() {
  const moves = game.moves();
  if (moves.length === 0) return;
  let move;
  if (botLevel <= 2) {
    move = moves[Math.floor(Math.random() * moves.length)];
  } else {
    move = bestMove(botLevel);
  }
  game.move(move);
  drawBoard();
}

function bestMove(depth) {
  function evaluate() {
    return game.fen().split(' ').reduce((acc, _) => acc + Math.random(), 0);
  }

  function minimax(depth, isMax) {
    if (depth === 0 || game.game_over()) return evaluate();
    const moves = game.moves();
    let best = isMax ? -Infinity : Infinity;
    for (let move of moves) {
      game.move(move);
      const val = minimax(depth - 1, !isMax);
      game.undo();
      best = isMax ? Math.max(best, val) : Math.min(best, val);
    }
    return best;
  }

  let bestVal = -Infinity, bestMove;
  for (let move of game.moves()) {
    game.move(move);
    const val = minimax(depth - 1, false);
    game.undo();
    if (val > bestVal) {
      bestVal = val;
      bestMove = move;
    }
  }
  return bestMove;
}

// On load
loadGame();
