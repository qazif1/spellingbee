const words = [
  "sat", "pin", "tin", "sit", "nap", "tap", "pat", "pit", "tip", "sip",
  "pan", "tan", "ant", "sin", "nit",
  "sick", "pick", "tick", "pack", "back", "tack", "kick", "neck", "sack", "lick",
  "pen", "hen", "ten", "men", "net", "pet", "set", "hit", "hat", "him",
  "rat", "rip", "rim", "ran", "ram", "rag", "rid", "rot",
  "mat", "map", "mad", "dip", "dim", "dam", "did", "mud", "mid", "pad"
];

let currentWordIndex = 0;
let currentWord = "";
let score = 0;
let timer;
let timeLeft = 30;

// DOM Elements
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gamePage = document.getElementById("gamePage");
const landingPage = document.getElementById("landingPage");
const gameOverPage = document.getElementById("gameOverPage");
const answerContainer = document.getElementById("answerContainer");
const lettersContainer = document.getElementById("lettersContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const timerDisplay = document.getElementById("timer");
const feedback = document.getElementById("feedback");
const scoreDisplay = document.getElementById("score");
const nextBtn = document.getElementById("nextBtn");
const playWordBtn = document.getElementById("playWordBtn");
const hintBtn = document.getElementById("hintBtn");
const finalScore = document.getElementById("finalScore");
const confettiCanvas = document.createElement("canvas");

// Add confetti canvas
confettiCanvas.id = "confettiCanvas";
document.body.appendChild(confettiCanvas);
const confettiCtx = confettiCanvas.getContext("2d");

// Show page
function showPage(page) {
  landingPage.classList.remove("active");
  gamePage.classList.remove("active");
  gameOverPage.classList.remove("active");
  document.getElementById(page).classList.add("active");
}

// Start Game
function startGame() {
  score = 0;
  currentWordIndex = 0;
  scoreDisplay.textContent = "Score: 0";
  showPage("gamePage");
  loadWord();
}

// Load new word
function loadWord() {
  if (currentWordIndex >= words.length) {
    showGameOver();
    return;
  }

  currentWord = words[currentWordIndex];
  answerContainer.innerHTML = "";
  lettersContainer.innerHTML = "";
  feedback.textContent = "";
  nextBtn.style.display = "none";

  // Update progress
  progressBar.style.width = `${((currentWordIndex + 1) / words.length) * 100}%`;
  progressText.textContent = `Word ${currentWordIndex + 1} of ${words.length}`;

  // Create empty slots
  currentWord.split("").forEach(() => {
    const slot = document.createElement("div");
    slot.classList.add("drop-slot");
    slot.addEventListener("dragover", e => e.preventDefault());
    slot.addEventListener("drop", handleDrop);
    answerContainer.appendChild(slot);
  });

  // Add letter blocks with distractors
  const letters = shuffle([...currentWord.split(""), ...getDistractors(currentWord)]);
  letters.forEach(letter => {
    const block = document.createElement("div");
    block.classList.add("letter-block");
    block.textContent = letter.toUpperCase();
    block.setAttribute("draggable", true);
    block.addEventListener("dragstart", e => e.dataTransfer.setData("letter", letter));
    lettersContainer.appendChild(block);
  });

  startTimer();
}

// Create 3 distractor letters
function getDistractors(word) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const extra = [];
  while (extra.length < 3) {
    const r = alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!word.includes(r) && !extra.includes(r)) extra.push(r);
  }
  return extra;
}

// Handle dropping letters
function handleDrop(e) {
  const letter = e.dataTransfer.getData("letter");
  e.target.textContent = letter.toUpperCase();
  checkAnswer();
}

// Check if word is correct
function checkAnswer() {
  const slots = document.querySelectorAll(".drop-slot");
  let attempt = "";
  slots.forEach(s => attempt += s.textContent.toLowerCase());

  if (attempt.length === currentWord.length) {
    if (attempt === currentWord) {
      feedback.innerHTML = `<img src="true.png" style="width:50px; vertical-align:middle;"> Correct!`;
      new Audio("correct.mp3").play();
      startConfetti();
      score++;
      scoreDisplay.textContent = "Score: " + score;
      stopTimer();
      nextBtn.style.display = "inline-block";
    } else {
      feedback.innerHTML = `<img src="cross.png" style="width:50px; vertical-align:middle;"> Wrong! Try again.`;
      new Audio("wrong.mp3").play();
      resetLetters();
    }
  }
}

// Reset empty slots
function resetLetters() {
  setTimeout(() => {
    document.querySelectorAll(".drop-slot").forEach(slot => slot.textContent = "");
    feedback.innerHTML = "";
  }, 1000);
}

// Timer
function startTimer() {
  stopTimer();
  timeLeft = 30;
  timerDisplay.textContent = `Time: ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      stopTimer();
      feedback.innerHTML = `<img src="cross.png" style="width:50px; vertical-align:middle;"> Time's up!`;
      new Audio("wrong.mp3").play();
      nextBtn.style.display = "inline-block";
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

// Shuffle letters
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Play sound of the current word (letter by letter)
function playWord(word, delay = 800) {
  const letters = word.split("");
  let i = 0;

  function playNextLetter() {
    if (i < letters.length) {
      const audio = new Audio(`sound_${letters[i]}.mp3`);
      audio.play();
      i++;
      setTimeout(playNextLetter, delay);
    }
  }
  playNextLetter();
}

// Confetti Animation
let confettiPieces = [];
function startConfetti() {
  resizeConfettiCanvas();
  confettiPieces = createConfetti(100);
  confettiCanvas.style.display = "block";
  requestAnimationFrame(updateConfetti);
  setTimeout(stopConfetti, 2000); // Confetti lasts 2 seconds
}

function createConfetti(count) {
  const pieces = [];
  for (let i = 0; i < count; i++) {
    pieces.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      size: Math.random() * 6 + 4,
      speed: Math.random() * 3 + 2
    });
  }
  return pieces;
}

function updateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach(p => {
    p.y += p.speed;
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(p.x, p.y, p.size, p.size);
  });
  if (confettiPieces.length > 0) {
    requestAnimationFrame(updateConfetti);
  }
}

function stopConfetti() {
  confettiPieces = [];
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiCanvas.style.display = "none";
}

function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

// Hint button
hintBtn.addEventListener("click", () => {
  const slots = document.querySelectorAll(".drop-slot");
  if (slots[0].textContent === "") {
    slots[0].textContent = currentWord[0].toUpperCase();
  }
});

// Event Listeners
playWordBtn.addEventListener("click", () => playWord(currentWord));
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
nextBtn.addEventListener("click", () => {
  currentWordIndex++;
  loadWord();
});

// Game Over
function showGameOver() {
  finalScore.textContent = `Your final score is ${score} out of ${words.length}`;
  showPage("gameOverPage");
}
