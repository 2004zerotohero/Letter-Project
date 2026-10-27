const scene = document.getElementById("scene");
const toggle = document.getElementById("letterToggle");
const headline = document.getElementById("headline");
const instruction = document.getElementById("instruction");
const subInstruction = document.getElementById("subInstruction");
const eyebrow = document.getElementById("eyebrow");
const confettiLayer = document.getElementById("confettiLayer");
const letterPaper = document.getElementById("letterPaper");

const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");
const musicNote = document.getElementById("musicNote");
const bgMusic = document.getElementById("bgMusic");

const letterNext = document.getElementById("letterNext");
const openMilestones = document.getElementById("openMilestones");
const milestoneView = document.getElementById("milestoneView");
const backToLetter = document.getElementById("backToLetter");

let isOpen = false;
let isAnimating = false;
let musicOn = false;

let typingTimers = [];
let typingRunId = 0;
let transitionTimer = null;
let animationTimer = null;

// =====================================
// HIỆU ỨNG ĐÁNH MÁY
// =====================================

function stopTyping() {
  typingRunId++;

  typingTimers.forEach((timer) => clearTimeout(timer));
  typingTimers = [];
}

function startTypingLetter() {
  stopTyping();

  const currentRunId = typingRunId;
  const content = document.querySelector(".paper-content");

  if (!content) return;

  const elements = [
    content.querySelector(".letter-date"),
    content.querySelector("h2"),
    content.querySelector(".letter-greeting"),
    ...content.querySelectorAll(".letter-message p"),
    content.querySelector(".letter-signoff"),
    content.querySelector(".letter-signature"),
  ].filter(Boolean);

  // Lưu lại nội dung gốc để có thể mở thư nhiều lần
  elements.forEach((element) => {
    if (!element.dataset.originalText) {
      element.dataset.originalText = element.textContent.trim();
    }

    element.textContent = "";
  });

  letterNext.hidden = true;

  const speed = 12;
  const paragraphDelay = 180;

  let elementIndex = 0;

  function typeElement() {
    if (!isOpen || currentRunId !== typingRunId) return;

    // Đã đánh máy xong toàn bộ nội dung thư
    if (elementIndex >= elements.length) {
      letterNext.hidden = false;
      letterPaper.scrollTop = letterPaper.scrollHeight;
      return;
    }

    const element = elements[elementIndex];
    const text = element.dataset.originalText;
    let charIndex = 0;

    function typeCharacter() {
      if (!isOpen || currentRunId !== typingRunId) return;

      if (charIndex < text.length) {
        element.textContent += text.charAt(charIndex);
        charIndex++;

        // Cuộn theo nội dung đang được đánh máy
        letterPaper.scrollTop = letterPaper.scrollHeight;

        const timer = setTimeout(typeCharacter, speed);
        typingTimers.push(timer);
      } else {
        elementIndex++;

        const timer = setTimeout(typeElement, paragraphDelay);
        typingTimers.push(timer);
      }
    }

    typeCharacter();
  }

  // Chờ giấy trượt lên trước khi bắt đầu đánh máy
  const timer = setTimeout(typeElement, 450);
  typingTimers.push(timer);
}

function restoreLetterText() {
  stopTyping();

  const content = document.querySelector(".paper-content");

  if (!content) return;

  const elements = content.querySelectorAll(
    ".letter-date, h2, .letter-greeting, .letter-message p, .letter-signoff, .letter-signature",
  );

  elements.forEach((element) => {
    if (element.dataset.originalText) {
      element.textContent = element.dataset.originalText;
    }
  });

  letterNext.hidden = true;
  letterPaper.scrollTop = 0;
}

// =====================================
// NHẠC NỀN
// =====================================

function updateMusicUI(isPlaying) {
  musicOn = isPlaying;

  musicToggle.setAttribute("aria-pressed", String(isPlaying));

  musicToggle.setAttribute(
    "aria-label",
    isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền",
  );

  musicLabel.textContent = isPlaying ? "Tắt nhạc" : "Bật nhạc";

  musicNote.textContent = isPlaying
    ? "Đang phát bản nhạc dành riêng cho em ♫"
    : "Bật nhạc để khoảnh khắc này dịu dàng hơn ♫";
}

window.addEventListener("DOMContentLoaded", () => {
  if (!bgMusic) return;

  bgMusic.volume = 0.6;

  // Trình duyệt có thể chặn tự động phát nhạc
  bgMusic
    .play()
    .then(() => {
      updateMusicUI(true);
    })
    .catch(() => {
      musicNote.textContent = 'Chạm vào nút "Bật nhạc" để nghe giai điệu nhé ♫';
    });
});

musicToggle.addEventListener("click", async (event) => {
  event.stopPropagation();

  if (musicOn) {
    bgMusic.pause();
    updateMusicUI(false);
    return;
  }

  try {
    await bgMusic.play();
    updateMusicUI(true);
  } catch (error) {
    musicNote.textContent =
      "Không thể phát nhạc. Hãy kiểm tra lại file MP3 nhé.";
  }
});

// =====================================
// HIỆU ỨNG TRÁI TIM BAY
// =====================================

function makeHearts() {
  const symbols = ["♡", "♥", "✧", "✦"];

  for (let i = 0; i < 14; i += 1) {
    const heart = document.createElement("span");

    heart.className = "heart-float";
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${12 + Math.random() * 18}px`;

    heart.style.setProperty("--duration", `${2.4 + Math.random() * 2.2}s`);

    heart.style.animationDelay = `${Math.random() * 0.7}s`;

    confettiLayer.appendChild(heart);

    heart.addEventListener("animationend", () => heart.remove(), {
      once: true,
    });
  }
}

// =====================================
// MỞ LÁ THƯ
// =====================================

function openLetter() {
  isOpen = true;
  isAnimating = true;

  scene.classList.remove("is-closing", "scene-leaving");
  scene.classList.add("is-open");

  toggle.setAttribute("aria-expanded", "true");
  toggle.setAttribute("aria-label", "Cất lá thư");

  letterPaper.setAttribute("aria-hidden", "false");

  headline.textContent = "Một lời chúc dành riêng cho em ♡";
  eyebrow.textContent = "WITH LOVE, JUST FOR YOU";

  instruction.textContent = "Chạm vào bao thư để cất lá thư lại";

  subInstruction.textContent =
    "Mong tuổi mới của em có thật nhiều điều dịu dàng.";

  letterPaper.scrollTop = 0;

  startTypingLetter();
  makeHearts();

  clearTimeout(animationTimer);

  animationTimer = setTimeout(() => {
    isAnimating = false;
  }, 1050);
}

// =====================================
// ĐÓNG LÁ THƯ
// =====================================

function closeLetter() {
  isOpen = false;
  isAnimating = true;

  restoreLetterText();

  scene.classList.add("is-closing");
  scene.classList.remove("is-open");

  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Mở lá thư");

  letterPaper.setAttribute("aria-hidden", "true");

  headline.textContent = "Gửi Thanh Xuân, ngày em đẹp nhất…";
  eyebrow.textContent = "A LITTLE SOMETHING FOR YOU";

  instruction.textContent = "Chạm vào bao thư để mở thư";

  subInstruction.textContent = "Một lời chúc nhỏ, chỉ dành riêng cho Xuân.";

  clearTimeout(animationTimer);

  animationTimer = setTimeout(() => {
    scene.classList.remove("is-closing");
    isAnimating = false;
  }, 800);
}

// =====================================
// CHUYỂN SANG TRANG CỘT MỐC
// =====================================

function showMilestones() {
  if (!isOpen || letterNext.hidden || isAnimating) return;

  if (transitionTimer) {
    clearTimeout(transitionTimer);
  }

  isAnimating = true;
  scene.classList.add("scene-leaving");

  transitionTimer = setTimeout(() => {
    scene.hidden = true;

    milestoneView.hidden = false;
    window.scrollTo({ top: 0, behavior: "auto" });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        milestoneView.classList.add("is-visible");
        isAnimating = false;
        transitionTimer = null;
      });
    });
  }, 450);
}

// =====================================
// QUAY LẠI LÁ THƯ
// =====================================

function returnToLetter() {
  if (isAnimating) return;

  isAnimating = true;

  milestoneView.classList.remove("is-visible");

  transitionTimer = setTimeout(() => {
    milestoneView.hidden = true;
    scene.hidden = false;

    window.scrollTo({ top: 0, behavior: "auto" });

    requestAnimationFrame(() => {
      scene.classList.remove("scene-leaving");

      isAnimating = false;
      transitionTimer = null;
    });
  }, 450);
}

// =====================================
// SỰ KIỆN CHUYỂN TRANG
// =====================================

openMilestones.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  showMilestones();
});

openMilestones.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    event.stopPropagation();

    showMilestones();
  }
});

backToLetter.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  returnToLetter();
});

// =====================================
// ĐIỀU KHIỂN MỞ / ĐÓNG THƯ
// =====================================

function toggleLetter() {
  if (isAnimating) return;

  // Thử phát nhạc sau tương tác của người dùng
  if (!musicOn && bgMusic.paused) {
    bgMusic
      .play()
      .then(() => updateMusicUI(true))
      .catch(() => {});
  }

  if (isOpen) {
    closeLetter();
  } else {
    openLetter();
  }
}

toggle.addEventListener("click", (event) => {
  // Chặn sự kiện nổi bọt từ nút bao thư
  if (event.target.closest("#openMilestones")) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  event.stopPropagation();
  toggleLetter();
});

// Chỉ nhấn vùng nền bên ngoài bao thư mới mở/đóng thư
scene.addEventListener("click", (event) => {
  if (
    event.target.closest("button") ||
    event.target.closest("#openMilestones") ||
    event.target.closest(".letter-paper")
  ) {
    return;
  }

  toggleLetter();
});
