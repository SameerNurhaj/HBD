let flames = [];
let flameIndex = 0;
let extinguishing = false;
let blowCount = 0;
let lastBlowTime = 0;
let blowCooldown = 1500; // 1.5 seconds between valid blows

function extinguishCandlesByBlow() {
  const sets = [
    [0],        // First blow: 1 candle
    [1, 2, 3],  // Second blow: 3 candles
    [4, 5]      // Third blow: 2 candles
  ];

  if (blowCount < sets.length) {
    sets[blowCount].forEach(index => {
      const flame = flames[index];
      if (flame && !flame.classList.contains("off")) {
        flame.classList.add("off");
      }
    });
    blowCount++;
  }

  // Check if all candles are extinguished
  if (blowCount >= sets.length) {
    extinguishAllCandles(); 
    showMessage()// Call to trigger the confetti burst
  }
}


function showMessage() {
  const messageElement = document.getElementById("birthday-message");
  messageElement.style.display = "block";  // Show the message
  document.getElementById("birthday-message").textContent = document.getElementById("message").value;  // Add the message text
}


async function startMicDetection() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    const dataArray = new Uint8Array(analyser.fftSize);
    source.connect(analyser);

    function checkBlow() {
      analyser.getByteTimeDomainData(dataArray);
      const volume = dataArray.reduce((sum, val) => sum + Math.abs(val - 128), 0) / dataArray.length;
      const blowStrength = Math.min(1, volume / 40);

      if (blowStrength > 0.4) {
        const now = Date.now();
        if (now - lastBlowTime > blowCooldown) {
          tiltFlames(blowStrength);
          extinguishCandlesByBlow();
          lastBlowTime = now;
        }
      } else {
        resetFlames();
      }

      requestAnimationFrame(checkBlow);
    }

    checkBlow();
  } catch (err) {
    alert("Mic access error: " + err.message);
  }
}



function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createCard() {
      window.open('_blank');
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const message = document.getElementById("message").value;

  document.getElementById("greeting").textContent = `Happy ${age}th Birthday, ${name}! 🎉`;
  document.getElementById("birthday-message").textContent = message;
  document.getElementById("form-section").classList.remove("active");
  document.getElementById("card-section").classList.add("active");
  document.getElementById("romantic-music").play().catch(() => {});
  addCandles(6);
  startMicDetection();
}

function addCandles(count) {
  const container = document.getElementById("candles");
  container.innerHTML = "";
  flames = [];
  for (let i = 0; i < count; i++) {
    const candle = document.createElement("div");
    candle.className = "candle";
    const wick = document.createElement("div");
    wick.className = "wick";
    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(wick);
    candle.appendChild(flame);
    container.appendChild(candle);
    flames.push(flame);
  }
}


function tiltFlames(strength) {
  const direction = Math.random() > 0.5 ? 1 : -1;
  flames.forEach((flame, i) => {
    const angle = direction * (5 + i * 2) * strength;
    flame.style.transform = `rotate(${angle}deg) scale(1.1)`;
  });
}

function resetFlames() {
  flames.forEach(flame => {
    flame.style.transform = `rotate(0deg) scale(1)`;
  });
}

function extinguishOneByOne() {
  if (extinguishing || flameIndex >= flames.length) return;
  extinguishing = true;
  const flame = flames[flameIndex];
  flame.classList.add("off");
  flameIndex++;
  if (flameIndex === flames.length);
  setTimeout(() => {
    extinguishing = false;
    extinguishOneByOne();
  }, 500);
}
function burstConfetti() {
  const container = document.getElementById("confetti-container");
  const numberOfConfetti = 1000; // Number of confetti pieces

  const colors = ['#ff5e78', '#ffb6c1', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#ff9800'];

  for (let i = 0; i < numberOfConfetti; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");

    // Set random color
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.backgroundColor = randomColor;

    // Random position for each confetti piece
    const leftPosition = Math.random() * 100 + "vw"; // Random horizontal position
    const topPosition = Math.random() * 100 + "vh";  // Random vertical position
    const delay = Math.random() * 20 + "s"; // Random delay to stagger animation
    const rotate = Math.random() * 360 + "deg"; // Random rotation angle
    const size = Math.random() * 10 + 5 + "px"; // Random size for variation

    confetti.style.left = leftPosition;
    confetti.style.top = topPosition;
    confetti.style.animationDelay = delay;
    confetti.style.transform = `rotate(${rotate})`;
    confetti.style.width = size;
    confetti.style.height = size;

    container.appendChild(confetti);

    // Remove confetti after animation ends
    confetti.addEventListener("animationend", () => {
      confetti.remove();
    });
  }
}

function extinguishAllCandles() {
  flames.forEach(flame => {
    flame.classList.add("off");
  });
  
  // Trigger the confetti burst after candles are blown out
  setTimeout(burstConfetti, 1000); // Add a slight delay before triggering
}

