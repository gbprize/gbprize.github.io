const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const winnerName = document.getElementById("winner-name");
const countdownElement = document.getElementById("countdown");

const participants = [
  { name: "Alice", amount: 364, color: "#00c77b" },
  { name: "Pumapipa", amount: 315, color: "#56c700" },
  { name: "Charlie", amount: 250, color: "#d035b8" },
  { name: "Dave", amount: 173, color: "#006bd7" },
  { name: "Jack", amount: 170, color: "#e63c30" },
  { name: "Adam", amount: 148, color: "#f0f3f4" },
  { name: "Nuka", amount: 150, color: "#6dcff6" }
];

const totalAmount = participants.reduce((sum, p) => sum + p.amount, 0);
let startAngle = 0;
let spinning = false;
let winnerIndex = null;

const spinSound = new Audio('./audio/spin_sound.mp3');
const winnerSound = new Audio('./audio/applause_cheer.mp3');
const countdownSound = new Audio('./audio/wallclock_countdown_sound.mp3');

let confettiInterval = null; // For clearing confetti on new spin

// Draw the wheel with winner highlighted
function drawWheel() {
  let currentAngle = startAngle;

  participants.forEach((participant, index) => {
    const sliceAngle = (participant.amount / totalAmount) * 2 * Math.PI;

    const radius = winnerIndex === index ? canvas.width / 2 + 3 : canvas.width / 2;

    let sliceColor = participant.color;
    if (winnerIndex === index) {
      sliceColor = "#FFD700"; // Highlight the winner with gold color
    }

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      radius,
      currentAngle,
      currentAngle + sliceAngle
    );
    ctx.fillStyle = sliceColor;
    ctx.fill();
    ctx.closePath();

    ctx.save();
    ctx.translate(
      canvas.width / 2 +
        Math.cos(currentAngle + sliceAngle / 2) * canvas.width / 3.5,
      canvas.height / 2 +
        Math.sin(currentAngle + sliceAngle / 2) * canvas.width / 3.5
    );
    ctx.rotate(currentAngle + sliceAngle / 2);
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(participant.name, 0, 0);
    ctx.restore();

    currentAngle += sliceAngle;
  });

  // Create a larger black circle at the center
  const blackCircleRadius = canvas.width / 2 - 25;
  ctx.beginPath();
  ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    blackCircleRadius,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.closePath();
}

// Countdown function
function startCountdown() {
  let countdown = 9; // Start countdown from 9 seconds
  countdownElement.textContent = countdown;

  countdownSound.play();

  const countdownInterval = setInterval(() => {
    countdown--;
    countdownElement.textContent = countdown;

    if (countdown <= 0) {
      clearInterval(countdownInterval);
      countdownSound.pause();
      countdownSound.currentTime = 0;
      startSpin(); // Start spinning after countdown ends
    }
  }, 1000);
}

// Start the spinning animation
function startSpin() {
  spinSound.play();

  const spinTime = 4000; // 4 seconds
  const spinAngle = Math.random() * 2 * Math.PI + 10 * Math.PI;
  const start = performance.now();

  function animateSpin(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / spinTime, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);

    startAngle = spinAngle * easeOut;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      spinning = false;
      spinSound.pause();
      spinSound.currentTime = 0;
      selectWinner();
    }
  }

  requestAnimationFrame(animateSpin);
}

// Select winner based on final angle
function selectWinner() {
  const normalizedAngle = startAngle % (2 * Math.PI);
  let currentAngle = 0;

  participants.forEach((participant, index) => {
    const sliceAngle = (participant.amount / totalAmount) * 2 * Math.PI;
    if (
      normalizedAngle >= currentAngle &&
      normalizedAngle < currentAngle + sliceAngle
    ) {
      winnerIndex = index;
      winnerName.textContent = "Winner: "+participant.name;
    }
    currentAngle += sliceAngle;
  });

  // Redraw the wheel with the winner highlighted
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWheel();

  // Play the winner sound effect
  winnerSound.play();

  // Trigger confetti animation after winner is selected
  triggerConfetti();
}

// Function to create and animate confetti
function triggerConfetti() {
  if (confettiInterval) {
    clearInterval(confettiInterval); // Stop previous confetti animation if any
  }

  const numberOfConfetti = 10;  // 10 confetti particles
  const confettiColors = ['#FFD700', '#FF5733', '#33FF57', '#3357FF', '#FF33A1'];  // 5 colors for confetti

  for (let i = 0; i < numberOfConfetti; i++) {
    const confetti = document.createElement('div');
    const shape = 'confetti-circle';  // Only circle shapes now
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];

    confetti.classList.add('confetti', shape);
    confetti.style.backgroundColor = color;

    // Set random position for each confetti at the top of the screen
    confetti.style.left = `${Math.random() * window.innerWidth}px`;
    confetti.style.top = `0px`; // Start from top

    // Append the confetti to the body or container
    document.body.appendChild(confetti);

    // Add falling animation
    confetti.style.animationDuration = `${Math.random() * 4 + 3}s`; // 3-7 seconds
  }

  // Set interval to create confetti falling repeatedly
  confettiInterval = setInterval(() => {
    triggerConfetti();
  }, 5000);
}

// Start countdown when the canvas is clicked
canvas.addEventListener("click", () => {
  if (spinning) return;
  spinning = true;

  // Start countdown before spinning
  startCountdown();
});

drawWheel();