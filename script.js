(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];

  const state = {
    step: "welcome",
    skipAttempts: 0,
    isOpen: false,
    isAnimating: false,
    musicOn: false,
    typingTimers: [],
    typingRunId: 0,
    transitionTimer: null,
    animationTimer: null,
    currentBookPage: 0, // Trạng thái lật sách bắt đầu từ trang 0 (Bìa)
  };

  const elements = {
    journey: $("#journey"),
    panels: {
      welcome: $("#welcomeStep"),
      consent: $("#consentStep"),
      password: $("#passwordStep"),
      game: $("#gameStep"),
    },
    welcomeContinue: $("#welcomeContinue"),
    agreeButton: $("#agreeButton"),
    skipButton: $("#skipButton"),
    skipFeedback: $("#skipFeedback"),
    passwordForm: $("#passwordForm"),
    passwordFeedback: $("#passwordFeedback"),
    unlockOverlay: $("#unlockOverlay"),
    unlockContinue: $("#unlockContinue"),
    gameForm: $("#gameForm"),
    flyingWords: $("#flyingWords"),
    scene: $("#scene"),
    letterToggle: $("#letterToggle"),
    headline: $("#headline"),
    instruction: $("#instruction"),
    subInstruction: $("#subInstruction"),
    eyebrow: $("#eyebrow"),
    letterPaper: $("#letterPaper"),
    letterNext: $("#letterNext"),
    openMilestones: $("#openMilestones"),
    milestoneView: $("#milestoneView"),
    backToLetter: $("#backToLetter"),
    musicToggle: $("#musicToggle"),
    musicLabel: $("#musicLabel"),
    musicNote: $("#musicNote"),
    bgMusic: $("#bgMusic"),
    confettiLayer: $("#confettiLayer"),
    // Book elements
    bookPages: $$(".book-page"),
    prevPageBtn: $("#prevPageBtn"),
    nextPageBtn: $("#nextPageBtn"),
    bookPagination: $("#bookPagination"),
  };

  // Chuyển đổi giữa các màn hình
  function showPanel(name) {
    Object.entries(elements.panels).forEach(([key, panel]) => {
      panel.hidden = key !== name;
      panel.classList.toggle("is-active", key === name);
    });

    state.step = name;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Chuẩn hóa câu trả lời
  function normalizeAnswer(value) {
    return value
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("vi")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]/g, "");
  }

  // Xử lý nút skip
  function handleSkip() {
    state.skipAttempts += 1;

    const sizes = ["50%", "25%", "0%"];
    const nextSize = sizes[Math.min(state.skipAttempts - 1, sizes.length - 1)];

    elements.skipButton.style.transform = `scale(${nextSize === "0%" ? 0 : Number.parseInt(nextSize, 10) / 100})`;
    elements.skipButton.style.opacity = nextSize === "0%" ? "0" : "1";
    elements.skipButton.style.pointerEvents =
      nextSize === "0%" ? "none" : "auto";

    if (state.skipAttempts >= 3) {
      elements.skipButton.hidden = true;
      elements.skipFeedback.textContent =
        "Em chỉ được chọn ô “Toi dong tinh” thuii ♡";
    } else {
      elements.skipFeedback.textContent =
        "Hình như lựa chọn này hong được đâu… thử lại nhé bé♡";
    }
  }

  // Kiểm tra mật khẩu
  function handlePasswordSubmit(event) {
    event.preventDefault();

    const dateAnswer = normalizeAnswer($("#answerDate").value);
    const placeAnswer = normalizeAnswer($("#answerPlace").value);

    const correctDate = normalizeAnswer("trung thu");
    const correctPlace = normalizeAnswer("công viên");

    if (dateAnswer !== correctDate || placeAnswer !== correctPlace) {
      elements.passwordFeedback.textContent =
        "Chưa chính xác rồi, em thử nhớ lại một chút nhé ♡";
      return;
    }

    elements.passwordFeedback.textContent = "";
    elements.unlockOverlay.hidden = false;

    requestAnimationFrame(() => {
      elements.unlockOverlay.classList.add("is-visible");
    });
  }

  // Hiệu ứng chữ bay
  function createFlyingWords() {
    const words = [
      "Yêu em",
      "Thanh Xuân",
      "Hạnh phúc",
      "♡",
      "My love",
      "Mãi bên nhau",
      "Thương em",
      "✧",
    ];

    elements.flyingWords.replaceChildren();

    for (let index = 0; index < 34; index += 1) {
      const word = document.createElement("span");
      word.className = "flying-word";
      word.textContent = words[index % words.length];

      word.style.left = `${Math.random() * 100}%`;
      word.style.top = `${Math.random() * 100}%`;
      word.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 420}px`);
      word.style.setProperty("--drift-y", `${(Math.random() - 0.5) * 420}px`);
      word.style.setProperty("--rotation", `${(Math.random() - 0.5) * 90}deg`);
      word.style.setProperty("--delay", `${Math.random() * 0.5}s`);

      elements.flyingWords.append(word);
    }

    elements.flyingWords.hidden = false;

    requestAnimationFrame(() => {
      elements.flyingWords.classList.add("is-active");
    });

    window.setTimeout(() => {
      elements.flyingWords.classList.remove("is-active");
      elements.flyingWords.hidden = true;

      elements.journey.hidden = true;
      elements.scene.hidden = false;
      elements.scene.classList.add("scene-entering");

      window.scrollTo({ top: 0, behavior: "auto" });

      window.setTimeout(() => {
        elements.scene.classList.remove("scene-entering");
      }, 700);
    }, 2100);
  }

  // Dừng đánh máy
  function stopTyping() {
    state.typingRunId += 1;
    state.typingTimers.forEach(window.clearTimeout);
    state.typingTimers = [];
  }

  // Đánh máy nội dung lá thư
  function startTypingLetter() {
    stopTyping();

    const runId = state.typingRunId;
    const content = $(".paper-content");

    if (!content) return;

    const typedElements = [
      $(".letter-date", content),
      $("h2", content),
      $(".letter-greeting", content),
      ...$$(".letter-message p", content),
      $(".letter-signoff", content),
      $(".letter-signature", content),
    ].filter(Boolean);

    typedElements.forEach((element) => {
      if (!element.dataset.originalText) {
        element.dataset.originalText = element.textContent.trim();
      }
      element.textContent = "";
    });

    elements.letterNext.hidden = true;
    let elementIndex = 0;

    const typeNextElement = () => {
      if (!state.isOpen || runId !== state.typingRunId) return;

      if (elementIndex >= typedElements.length) {
        elements.letterNext.hidden = false;
        elements.letterPaper.scrollTop = elements.letterPaper.scrollHeight;
        return;
      }

      const element = typedElements[elementIndex];
      const text = element.dataset.originalText;
      let charIndex = 0;

      const typeCharacter = () => {
        if (!state.isOpen || runId !== state.typingRunId) return;

        if (charIndex < text.length) {
          element.textContent += text.charAt(charIndex++);
          elements.letterPaper.scrollTop = elements.letterPaper.scrollHeight;
          state.typingTimers.push(window.setTimeout(typeCharacter, 12));
        } else {
          elementIndex += 1;
          state.typingTimers.push(window.setTimeout(typeNextElement, 180));
        }
      };

      typeCharacter();
    };

    state.typingTimers.push(window.setTimeout(typeNextElement, 450));
  }

  // Khôi phục nội dung thư
  function restoreLetterText() {
    stopTyping();
    $$(
      ".letter-date, .paper-content h2, .letter-greeting, .letter-message p, .letter-signoff, .letter-signature",
    ).forEach((element) => {
      if (element.dataset.originalText) {
        element.textContent = element.dataset.originalText;
      }
    });

    elements.letterNext.hidden = true;
    elements.letterPaper.scrollTop = 0;
  }

  // Nhạc nền UI
  function updateMusicUI(isPlaying) {
    state.musicOn = isPlaying;
    elements.musicToggle.setAttribute("aria-pressed", String(isPlaying));
    elements.musicToggle.setAttribute(
      "aria-label",
      isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền",
    );
    elements.musicLabel.textContent = isPlaying ? "Tắt nhạc" : "Bật nhạc";
    elements.musicNote.textContent = isPlaying
      ? "Đang phát bản nhạc dành riêng cho em ♫"
      : "Bật nhạc để khoảnh khắc này dịu dàng hơn ♫";
  }

  async function toggleMusic() {
    if (state.musicOn) {
      elements.bgMusic.pause();
      updateMusicUI(false);
      return;
    }
    try {
      await elements.bgMusic.play();
      updateMusicUI(true);
    } catch {
      elements.musicNote.textContent =
        "Không thể phát nhạc. Hãy kiểm tra lại file MP3 nhé.";
    }
  }

  // Trái tim bay
  function makeHearts() {
    const symbols = ["♡", "♥", "✧", "✦"];

    for (let index = 0; index < 14; index += 1) {
      const heart = document.createElement("span");
      heart.className = "heart-float";
      heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.fontSize = `${12 + Math.random() * 18}px`;
      heart.style.setProperty("--duration", `${2.4 + Math.random() * 2.2}s`);
      heart.style.animationDelay = `${Math.random() * 0.7}s`;

      elements.confettiLayer.append(heart);
      heart.addEventListener("animationend", () => heart.remove(), {
        once: true,
      });
    }
  }

  // Mở thư
  function openLetter() {
    state.isOpen = true;
    state.isAnimating = true;

    elements.scene.classList.remove("is-closing", "scene-leaving");
    elements.scene.classList.add("is-open");
    elements.letterToggle.setAttribute("aria-expanded", "true");
    elements.letterToggle.setAttribute("aria-label", "Cất lá thư");
    elements.letterPaper.setAttribute("aria-hidden", "false");
    elements.headline.textContent = "Một lời chúc dành riêng cho em ♡";
    elements.eyebrow.textContent = "WITH LOVE, JUST FOR YOU";
    elements.instruction.textContent = "Chạm vào bao thư để cất lá thư lại";
    elements.subInstruction.textContent =
      "Mong tuổi mới của em có thật nhiều điều dịu dàng.";
    elements.letterPaper.scrollTop = 0;

    startTypingLetter();
    makeHearts();

    window.clearTimeout(state.animationTimer);
    state.animationTimer = window.setTimeout(() => {
      state.isAnimating = false;
    }, 1050);
  }

  // Đóng thư
  function closeLetter() {
    state.isOpen = false;
    state.isAnimating = true;

    restoreLetterText();

    elements.scene.classList.add("is-closing");
    elements.scene.classList.remove("is-open");
    elements.letterToggle.setAttribute("aria-expanded", "false");
    elements.letterToggle.setAttribute("aria-label", "Mở lá thư");
    elements.letterPaper.setAttribute("aria-hidden", "true");
    elements.headline.textContent = "Gửi Thanh Xuân, ngày em đẹp nhất…";
    elements.eyebrow.textContent = "A LITTLE SOMETHING FOR YOU";
    elements.instruction.textContent = "Chạm vào bao thư để mở thư";
    elements.subInstruction.textContent =
      "Một lời chúc nhỏ, chỉ dành riêng cho Xuân.";

    window.clearTimeout(state.animationTimer);
    state.animationTimer = window.setTimeout(() => {
      elements.scene.classList.remove("is-closing");
      state.isAnimating = false;
    }, 800);
  }

  function toggleLetter() {
    if (state.isAnimating) return;
    if (!state.musicOn && elements.bgMusic.paused) {
      elements.bgMusic
        .play()
        .then(() => updateMusicUI(true))
        .catch(() => {});
    }
    state.isOpen ? closeLetter() : openLetter();
  }

  // Cập nhật giao diện trang sách (Tổng 6 mốc: 0 đến 5)
  function updateBookView() {
    const totalPages = elements.bookPages.length;

    elements.bookPages.forEach((page, idx) => {
      page.classList.remove("active-page", "flipped");
      if (idx < state.currentBookPage) {
        page.classList.add("flipped");
      } else if (idx === state.currentBookPage) {
        page.classList.add("active-page");
      }
    });

    elements.prevPageBtn.disabled = state.currentBookPage === 0;
    elements.nextPageBtn.disabled = state.currentBookPage === totalPages - 1;

    if (state.currentBookPage === 0) {
      elements.bookPagination.textContent = "Bìa sách / 5";
    } else if (state.currentBookPage === totalPages - 1) {
      elements.bookPagination.textContent = "Trang cuối / 5";
    } else {
      elements.bookPagination.textContent = `Trang ${state.currentBookPage} / 5`;
    }
  }

  // Chuyển sang phần cột mốc dạng sách
  function showMilestones() {
    if (!state.isOpen || elements.letterNext.hidden || state.isAnimating) {
      return;
    }

    state.isAnimating = true;
    state.currentBookPage = 0; // Đặt lại về bìa sách
    updateBookView();

    elements.scene.classList.add("scene-leaving");

    state.transitionTimer = window.setTimeout(() => {
      elements.scene.hidden = true;
      elements.milestoneView.hidden = false;

      window.scrollTo({ top: 0, behavior: "auto" });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          elements.milestoneView.classList.add("is-visible");
          state.isAnimating = false;
        });
      });
    }, 450);
  }

  // Quay lại lá thư
  function returnToLetter() {
    if (state.isAnimating) return;
    state.isAnimating = true;

    elements.milestoneView.classList.remove("is-visible");

    state.transitionTimer = window.setTimeout(() => {
      elements.milestoneView.hidden = true;
      elements.scene.hidden = false;

      window.scrollTo({ top: 0, behavior: "auto" });

      requestAnimationFrame(() => {
        elements.scene.classList.remove("scene-leaving");
        state.isAnimating = false;
      });
    }, 450);
  }

  // Khởi tạo sự kiện
  elements.welcomeContinue.addEventListener("click", () => {
    showPanel("consent");
  });

  elements.agreeButton.addEventListener("click", () => {
    showPanel("password");
  });

  elements.skipButton.addEventListener("click", handleSkip);
  elements.passwordForm.addEventListener("submit", handlePasswordSubmit);

  elements.unlockContinue.addEventListener("click", () => {
    elements.unlockOverlay.classList.remove("is-visible");
    window.setTimeout(() => {
      elements.unlockOverlay.hidden = true;
      showPanel("game");
    }, 250);
  });

  elements.gameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    createFlyingWords();
  });

  document.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || state.step !== "welcome") return;
    if (
      ["INPUT", "TEXTAREA", "BUTTON"].includes(document.activeElement.tagName)
    )
      return;

    event.preventDefault();
    showPanel("consent");
  });

  elements.bgMusic.volume = 0.6;
  elements.musicToggle.addEventListener("click", toggleMusic);

  elements.welcomeContinue.addEventListener(
    "click",
    () => {
      if (!state.musicOn) {
        elements.bgMusic
          .play()
          .then(() => updateMusicUI(true))
          .catch(() => {});
      }
    },
    { once: true },
  );

  elements.letterToggle.addEventListener("click", (event) => {
    if (event.target.closest("#openMilestones")) return;
    toggleLetter();
  });

  elements.scene.addEventListener("click", (event) => {
    if (event.target.closest("button, #openMilestones, .letter-paper")) return;
    toggleLetter();
  });

  elements.openMilestones.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    showMilestones();
  });

  elements.openMilestones.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      showMilestones();
    }
  });

  elements.backToLetter.addEventListener("click", returnToLetter);

  elements.nextPageBtn.addEventListener("click", () => {
    if (state.currentBookPage < elements.bookPages.length - 1) {
      state.currentBookPage += 1;
      updateBookView();
    }
  });

  elements.prevPageBtn.addEventListener("click", () => {
    if (state.currentBookPage > 0) {
      state.currentBookPage -= 1;
      updateBookView();
    }
  });
})();
