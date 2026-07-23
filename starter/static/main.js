// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
const LEADERBOARD_STORAGE_KEY = 'sudoku-leaderboard';
let puzzle = [];
let timerInterval = null;
let elapsedSeconds = 0;
let currentDifficulty = 'medium';
let hintsUsed = 0;
let hintCellIndex = null;
let pendingScore = null;
let completionHandled = false;
const THEME_STORAGE_KEY = 'sudoku-theme';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.innerText = formatTime(elapsedSeconds);
  }
}

function setDifficulty(difficulty) {
  currentDifficulty = difficulty;
  document.querySelectorAll('.difficulty-btn').forEach((button) => {
    const isActive = button.dataset.difficulty === difficulty;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function stopTimer() {
  if (timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateHintButtonState() {
  const hintButton = document.getElementById('hint');
  if (hintButton) {
    hintButton.disabled = puzzle.every((row) => row.every((cell) => cell !== 0));
  }
}

function clearHintHighlight() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let idx = 0; idx < inputs.length; idx++) {
    inputs[idx].classList.remove('hinted');
  }
  hintCellIndex = null;
}

function startTimer() {
  stopTimer();
  elapsedSeconds = 0;
  updateTimerDisplay();
  timerInterval = window.setInterval(() => {
    elapsedSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function applyTheme(theme) {
  document.body.classList.toggle('dark-mode', theme === 'dark');
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }
}

function loadTheme() {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  const theme = storedTheme === 'dark' ? 'dark' : 'light';
  applyTheme(theme);
  return theme;
}

function saveTheme(theme) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function loadLeaderboard() {
  const stored = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
  const entries = stored ? JSON.parse(stored) : [];
  const leaderboardList = document.getElementById('leaderboard-list');
  if (!leaderboardList) {
    return;
  }
  leaderboardList.innerHTML = '';
  entries.slice(0, 10).forEach((entry) => {
    const item = document.createElement('li');
    item.innerText = `${entry.name} — ${formatTime(entry.time)} — ${entry.difficulty} — hints: ${entry.hintsUsed}`;
    leaderboardList.appendChild(item);
  });
}

function hideNamePrompt() {
  const prompt = document.getElementById('name-prompt');
  if (prompt) {
    prompt.hidden = true;
  }
}

function showNamePrompt() {
  const prompt = document.getElementById('name-prompt');
  const input = document.getElementById('player-name');
  if (prompt) {
    prompt.hidden = false;
  }
  if (input) {
    input.value = '';
    input.focus();
  }
}

function saveLeaderboardEntry(score) {
  const stored = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
  const entries = stored ? JSON.parse(stored) : [];
  entries.push(score);
  entries.sort((a, b) => a.time - b.time);
  const topTen = entries.slice(0, 10);
  window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(topTen));
  loadLeaderboard();
  hideNamePrompt();
}

function getBoardFromInputs() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  return board;
}

function applyCheckResult(data) {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const msg = document.getElementById('message');
  const incorrect = new Set(data.incorrect.map(x => x[0] * SIZE + x[1]));
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.classList.remove('incorrect');
    if (incorrect.has(idx)) {
      inp.classList.add('incorrect');
    }
  }
  return incorrect;
}

function completeGame() {
  if (completionHandled) {
    return;
  }
  completionHandled = true;
  stopTimer();
  pendingScore = {
    time: elapsedSeconds,
    difficulty: currentDifficulty,
    hintsUsed
  };
  showNamePrompt();
  const msg = document.getElementById('message');
  msg.style.color = '#388e3c';
  msg.innerText = `Congratulations! Time: ${formatTime(elapsedSeconds)} | Difficulty: ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)} | Hints used: ${hintsUsed}`;
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      const blockIndex = Math.floor(i / 3) + Math.floor(j / 3);
      const blockClass = blockIndex % 2 === 0 ? 'sudoku-block-light' : 'sudoku-block-dark';
      input.type = 'text';
      input.maxLength = 1;
      input.className = `sudoku-cell ${blockClass}`;
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', async (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        const idx = i * SIZE + j;
        const inputs = boardDiv.getElementsByTagName('input');
        if (inputs[idx]) {
          inputs[idx].classList.remove('incorrect');
        }
        const board = getBoardFromInputs();
        if (board.every((row) => row.every((cell) => cell !== 0))) {
          const res = await fetch('/check', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({board})
          });
          const data = await res.json();
          if (data.error) {
            return;
          }
          const incorrect = applyCheckResult(data);
          if (incorrect.size === 0) {
            completeGame();
          }
        }
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  clearHintHighlight();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className += ' prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
  updateHintButtonState();
}

async function newGame() {
  startTimer();
  hintsUsed = 0;
  pendingScore = null;
  completionHandled = false;
  clearHintHighlight();
  hideNamePrompt();
  const res = await fetch(`/new?difficulty=${encodeURIComponent(currentDifficulty)}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  document.getElementById('message').innerText = '';
}

async function requestHint() {
  const board = getBoardFromInputs();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const res = await fetch('/hint', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  if (data.error) {
    document.getElementById('message').innerText = data.error;
    return;
  }
  const hintIndex = data.row * SIZE + data.col;
  const hintInput = inputs[hintIndex];
  if (!hintInput || hintInput.disabled) {
    return;
  }
  clearHintHighlight();
  hintInput.value = data.value;
  hintInput.classList.add('hinted');
  hintCellIndex = hintIndex;
  hintsUsed += 1;
  updateHintButtonState();
  const boardAfterHint = getBoardFromInputs();
  if (boardAfterHint.every((row) => row.every((cell) => cell !== 0))) {
    const res = await fetch('/check', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({board: boardAfterHint})
    });
    const dataAfterHint = await res.json();
    if (!dataAfterHint.error) {
      const incorrect = applyCheckResult(dataAfterHint);
      if (incorrect.size === 0) {
        completeGame();
      }
    }
  }
}

async function checkSolution() {
  const board = getBoardFromInputs();
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }
  const incorrect = applyCheckResult(data);
  if (incorrect.size === 0) {
    completeGame();
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

// Wire buttons
window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint').addEventListener('click', requestHint);
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });
  document.getElementById('save-score').addEventListener('click', () => {
    if (!pendingScore) {
      return;
    }
    const playerNameInput = document.getElementById('player-name');
    const playerName = (playerNameInput.value || '').trim();
    if (!playerName) {
      msg = document.getElementById('message');
      if (msg) {
        msg.style.color = '#d32f2f';
        msg.innerText = 'Please enter a name before saving your score.';
      }
      return;
    }
    saveLeaderboardEntry({
      name: playerName,
      ...pendingScore
    });
    pendingScore = null;
  });
  document.querySelectorAll('.difficulty-btn').forEach((button) => {
    button.addEventListener('click', () => {
      setDifficulty(button.dataset.difficulty);
      newGame();
    });
  });
  setDifficulty(currentDifficulty);
  loadTheme();
  loadLeaderboard();
  // initialize
  newGame();
});