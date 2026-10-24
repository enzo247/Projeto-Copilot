const emojis = ['💻', '🐙', '🤖', '🚀', '☕', '🐛'];

const board = document.getElementById('board');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const messageBox = document.getElementById('message');
const messageText = document.getElementById('message-text');
const restartButton = document.getElementById('restartButton');

const state = {
  deck: [],
  firstCard: null,
  secondCard: null,
  lockBoard: false,
  moves: 0,
  matchedPairs: 0,
  seconds: 0,
  timerId: null,
  started: false,
  finished: false,
};

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
  if (state.timerId !== null) {
    return;
  }

  state.timerId = setInterval(() => {
    state.seconds += 1;
    timerDisplay.textContent = formatTime(state.seconds);
  }, 1000);
}

function stopTimer() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createDeck() {
  return shuffle([...emojis, ...emojis]);
}

function updateMoves() {
  movesDisplay.textContent = String(state.moves);
}

function setCardAccessibility(card, emoji, isHidden) {
  if (isHidden) {
    card.setAttribute('aria-label', 'Carta oculta');
    card.setAttribute('aria-pressed', 'false');
  } else {
    card.setAttribute('aria-label', `Carta com emoji ${emoji}`);
    card.setAttribute('aria-pressed', 'true');
  }
}

function buildCard(emoji) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'memory-card';
  button.setAttribute('aria-label', 'Carta oculta');
  button.setAttribute('aria-pressed', 'false');

  const inner = document.createElement('span');
  inner.className = 'card-inner';

  const back = document.createElement('span');
  back.className = 'card-face card-back';
  back.setAttribute('aria-hidden', 'true');

  const front = document.createElement('span');
  front.className = 'card-face card-front';
  front.textContent = emoji;
  front.setAttribute('aria-hidden', 'true');

  inner.append(back, front);
  button.appendChild(inner);

  button.addEventListener('click', () => {
    if (
      state.lockBoard ||
      button === state.firstCard ||
      button.classList.contains('is-matched') ||
      button.classList.contains('is-flipped') ||
      state.finished
    ) {
      return;
    }

    if (!state.started) {
      state.started = true;
      startTimer();
    }

    button.classList.add('is-flipped');
    setCardAccessibility(button, emoji, false);

    if (!state.firstCard) {
      state.firstCard = button;
      return;
    }

    state.secondCard = button;
    state.moves += 1;
    updateMoves();
    state.lockBoard = true;

    const firstEmoji = state.firstCard.querySelector('.card-front').textContent;
    const secondEmoji = state.secondCard.querySelector('.card-front').textContent;

    if (firstEmoji === secondEmoji) {
      state.firstCard.classList.add('is-matched');
      state.secondCard.classList.add('is-matched');
      state.firstCard.disabled = true;
      state.secondCard.disabled = true;
      state.matchedPairs += 1;
      state.firstCard = null;
      state.secondCard = null;
      state.lockBoard = false;

      if (state.matchedPairs === emojis.length) {
        finishGame();
      }
      return;
    }

    setTimeout(() => {
      state.firstCard.classList.remove('is-flipped');
      state.secondCard.classList.remove('is-flipped');
      setCardAccessibility(state.firstCard, firstEmoji, true);
      setCardAccessibility(state.secondCard, secondEmoji, true);
      state.firstCard = null;
      state.secondCard = null;
      state.lockBoard = false;
    }, 1000);
  });

  return button;
}

function renderBoard() {
  board.innerHTML = '';

  state.deck.forEach((emoji) => {
    const card = buildCard(emoji);
    board.appendChild(card);
  });
}

function finishGame() {
  state.finished = true;
  stopTimer();
  messageText.textContent = `Você venceu em ${formatTime(state.seconds)} com ${state.moves} jogadas.`;
  messageBox.classList.add('visible');
}

function resetGame() {
  state.deck = createDeck();
  state.firstCard = null;
  state.secondCard = null;
  state.lockBoard = false;
  state.moves = 0;
  state.matchedPairs = 0;
  state.seconds = 0;
  state.started = false;
  state.finished = false;
  stopTimer();
  timerDisplay.textContent = '00:00';
  updateMoves();
  messageBox.classList.remove('visible');
  renderBoard();
}

resetGame();
restartButton.addEventListener('click', resetGame);
