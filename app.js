const config = window.UGTI_CONFIG;
const questions = config.questions;
const results = config.results;
const resultOrder = config.resultOrder;

const state = {
  nickname: "",
  current: 0,
  answers: Array(questions.length).fill(null),
  result: null,
  shareUrl: null
};

const els = {
  stage: document.querySelector(".stage"),
  welcomeView: document.querySelector("#welcomeView"),
  quizView: document.querySelector("#quizView"),
  resultView: document.querySelector("#resultView"),
  startForm: document.querySelector("#startForm"),
  nickname: document.querySelector("#nickname"),
  startBtn: document.querySelector("#startBtn"),
  questionIndex: document.querySelector("#questionIndex"),
  questionTitle: document.querySelector("#questionTitle"),
  options: document.querySelector("#options"),
  progressText: document.querySelector("#progressText"),
  progressPercent: document.querySelector("#progressPercent"),
  progressBar: document.querySelector("#progressBar"),
  prevBtn: document.querySelector("#prevBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  resultImage: document.querySelector("#resultImage"),
  resultNamePrefix: document.querySelector("#resultNamePrefix"),
  resultName: document.querySelector("#resultName"),
  resultTags: document.querySelector("#resultTags"),
  resultPortrait: document.querySelector("#resultPortrait"),
  resultSlogan: document.querySelector("#resultSlogan"),
  resultQr: document.querySelector("#resultQr"),
  restartBtn: document.querySelector("#restartBtn"),
  shareBtn: document.querySelector("#shareBtn"),
  shareModal: document.querySelector("#shareModal"),
  closeShareBtn: document.querySelector("#closeShareBtn"),
  shareImage: document.querySelector("#shareImage"),
  downloadShare: document.querySelector("#downloadShare")
};

function showView(view) {
  [els.welcomeView, els.quizView, els.resultView].forEach((item) => {
    item.classList.toggle("view-active", item === view);
  });
  syncStageHeight();
}

function getBaseStageHeight() {
  if (window.matchMedia("(max-width: 760px)").matches) {
    return window.innerHeight;
  }
  return Math.min(760, Math.max(0, window.innerHeight - 32));
}

function syncStageHeight() {
  window.requestAnimationFrame(() => {
    const activeView = document.querySelector(".view-active");
    if (!activeView || !els.stage) return;

    const styles = window.getComputedStyle(activeView);
    const bottomInset = Number.parseFloat(styles.bottom) || 0;
    const neededHeight = activeView.offsetTop + activeView.scrollHeight + bottomInset;
    els.stage.style.minHeight = `${Math.max(getBaseStageHeight(), Math.ceil(neededHeight))}px`;
  });
}

function renderQuestion() {
  const question = questions[state.current];
  const chosen = state.answers[state.current];
  const progress = ((state.current + 1) / questions.length) * 100;

  els.questionIndex.textContent = `Question ${String(state.current + 1).padStart(2, "0")}`;
  els.questionTitle.textContent = question.text;
  els.progressText.textContent = `第 ${state.current + 1} / ${questions.length} 题`;
  els.progressPercent.textContent = `${Math.round(progress)}%`;
  els.progressBar.style.width = `${progress}%`;
  els.prevBtn.disabled = state.current === 0;
  els.nextBtn.disabled = chosen === null;
  els.nextBtn.textContent = state.current === questions.length - 1 ? "查看结果" : "下一题";

  els.options.replaceChildren(
    ...question.options.map((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `option-btn${chosen === index ? " selected" : ""}`;
      button.textContent = option.label;
      button.addEventListener("click", () => selectOption(index));
      return button;
    })
  );
  syncStageHeight();
}

function selectOption(index) {
  state.answers[state.current] = index;
  renderQuestion();
  window.setTimeout(() => {
    if (state.current < questions.length - 1) {
      state.current += 1;
      renderQuestion();
    } else {
      renderResult();
      showView(els.resultView);
    }
  }, 220);
}

function calculateResult() {
  const scores = Object.fromEntries(resultOrder.map((id) => [id, 0]));

  state.answers.forEach((optionIndex, questionIndex) => {
    const option = questions[questionIndex].options[optionIndex];
    if (option && option.resultId in scores) {
      scores[option.resultId] += 1;
    }
  });

  let winnerId = resultOrder[0];
  for (const id of resultOrder) {
    if (scores[id] > scores[winnerId]) {
      winnerId = id;
    }
  }

  return results.find((result) => result.id === winnerId) || results[0];
}

function renderResult() {
  state.result = calculateResult();
  const imagePath = getResultImagePath(state.result);
  els.resultNamePrefix.textContent = `${state.nickname} 的毕业人格是`;
  els.resultName.textContent = state.result.name;
  els.resultTags.replaceChildren(
    ...state.result.tags.map((tag) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = tag;
      return span;
    })
  );
  els.resultPortrait.innerHTML = renderMarkdown(state.result.portrait);
  els.resultSlogan.textContent = state.result.slogan;
  els.resultImage.src = withCacheBust(imagePath);
  els.resultImage.alt = `${state.result.name} 人格形象图片`;
  UGTI_QR.drawToCanvas(els.resultQr, window.location.href);
  syncStageHeight();
}

function getResultImagePath(result) {
  return `./assets/personality-${result.id}.png`;
}

function renderMarkdown(source) {
  const escaped = source
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function withCacheBust(src) {
  if (src.startsWith("data:")) return src;
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}v=${Date.now()}`;
}

function stripMarkdown(value) {
  return value.replace(/\*\*/g, "");
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`图片加载失败：${src}`));
    image.src = src;
  });
}

function roundedRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const chars = Array.from(stripMarkdown(text));
  let line = "";
  let lines = 0;
  for (const char of chars) {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines += 1;
      line = char;
      if (lines >= maxLines) return y;
    } else {
      line = next;
    }
  }
  if (line && lines < maxLines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function drawShareBackground(ctx, width, height) {
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#fff8ef");
  bg.addColorStop(0.48, "#ffffff");
  bg.addColorStop(1, "#f5f0ff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const blueGlow = ctx.createRadialGradient(110, 180, 10, 110, 180, 360);
  blueGlow.addColorStop(0, "rgba(56, 215, 255, 0.46)");
  blueGlow.addColorStop(1, "rgba(56, 215, 255, 0)");
  ctx.fillStyle = blueGlow;
  ctx.fillRect(0, 0, width, height);

  const limeGlow = ctx.createRadialGradient(width - 90, 140, 10, width - 90, 140, 330);
  limeGlow.addColorStop(0, "rgba(184, 240, 66, 0.48)");
  limeGlow.addColorStop(1, "rgba(184, 240, 66, 0)");
  ctx.fillStyle = limeGlow;
  ctx.fillRect(0, 0, width, height);
}

function canvasToPngUrl(canvas) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("PNG 图片生成失败"));
          return;
        }
        resolve(URL.createObjectURL(blob));
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

async function generateShareImage() {
  const resultImage = await loadImage(withCacheBust(getResultImagePath(state.result)));
  const canvas = renderShareCanvas({ resultImage });
  return canvasToPngUrl(canvas);
}

function renderShareCanvas({ resultImage }) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1320;
  const ctx = canvas.getContext("2d");
  const result = state.result;

  drawShareBackground(ctx, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 248, 239, 0.9)";
  ctx.strokeStyle = "#17130f";
  ctx.lineWidth = 4;
  roundedRect(ctx, 36, 36, 828, 1248, 24, true, true);

  ctx.fillStyle = "#17130f";
  ctx.font = "900 36px Microsoft YaHei, PingFang SC, sans-serif";
  ctx.fillText("UGTI 大学毕业生人格测试", 96, 132);

  ctx.fillStyle = "rgba(255, 91, 74, 0.22)";
  roundedRect(ctx, 106, 196, 708, 830, 18, true, false);

  const cardBg = ctx.createLinearGradient(96, 186, 804, 1016);
  cardBg.addColorStop(0, "#fffaf1");
  cardBg.addColorStop(0.58, "#ffffff");
  cardBg.addColorStop(1, "#eefbff");
  ctx.fillStyle = cardBg;
  ctx.strokeStyle = "#17130f";
  ctx.lineWidth = 4;
  roundedRect(ctx, 96, 186, 708, 830, 18, true, true);

  ctx.drawImage(resultImage, 136, 238, 260, 260);

  ctx.fillStyle = "#6f665c";
  ctx.font = "900 24px Microsoft YaHei, PingFang SC, sans-serif";
  ctx.fillText(`${state.nickname} 的毕业人格是`, 436, 268);
  ctx.fillStyle = "#17130f";
  ctx.font = "900 62px Microsoft YaHei, PingFang SC, sans-serif";
  const titleBottom = drawWrappedText(ctx, result.name, 436, 346, 310, 68, 2);

  let x = 436;
  let y = titleBottom + 8;
  let tagBottom = y;
  result.tags.forEach((tag) => {
    ctx.font = "900 24px Microsoft YaHei, PingFang SC, sans-serif";
    const width = ctx.measureText(tag).width + 28;
    if (x + width > 762) {
      x = 436;
      y += 56;
    }
    ctx.fillStyle = "#38d7ff";
    ctx.strokeStyle = "#17130f";
    ctx.lineWidth = 4;
    roundedRect(ctx, x, y, width, 42, 8, true, true);
    ctx.fillStyle = "#17130f";
    ctx.fillText(tag, x + 14, y + 28);
    tagBottom = Math.max(tagBottom, y + 42);
    x += width + 12;
  });

  ctx.font = "700 27px Microsoft YaHei, PingFang SC, sans-serif";
  ctx.fillStyle = "#312b25";
  drawWrappedText(ctx, result.portrait, 136, Math.max(554, tagBottom + 34), 608, 48, 6);

  ctx.fillStyle = "rgba(255, 216, 79, 0.42)";
  ctx.fillRect(136, 888, 500, 82);
  ctx.fillStyle = "#ff5b4a";
  ctx.fillRect(136, 888, 8, 82);
  ctx.fillStyle = "#17130f";
  ctx.font = "900 28px Microsoft YaHei, PingFang SC, sans-serif";
  drawWrappedText(ctx, result.slogan, 166, 922, 430, 36, 2);

  UGTI_QR.drawToContext(ctx, window.location.href, 646, 864, 118);
  ctx.fillStyle = "#17130f";
  ctx.font = "800 19px Microsoft YaHei, PingFang SC, sans-serif";
  ctx.fillText("扫码来测你的 UGTI", 610, 1004);

  ctx.fillStyle = "#6f665c";
  ctx.font = "700 22px Microsoft YaHei, PingFang SC, sans-serif";
  drawWrappedText(
    ctx,
    "测试仅供娱乐，希望每一位毕业生都能不被标签束缚，能够肆意洒脱地享受你的人生！",
    96,
    1110,
    708,
    38,
    3
  );

  ctx.fillStyle = "rgba(23, 19, 15, 0.58)";
  ctx.font = "800 18px Microsoft YaHei, PingFang SC, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Developed By", canvas.width / 2, 1204);
  ctx.fillText("大连东软信息学院 数字艺术与设计学院", canvas.width / 2, 1232);
  ctx.fillText("动画与数字媒体艺术系", canvas.width / 2, 1260);
  ctx.textAlign = "left";

  return canvas;
}

els.nickname.addEventListener("input", () => {
  els.startBtn.disabled = els.nickname.value.trim().length === 0;
});

els.startForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.nickname = els.nickname.value.trim();
  if (!state.nickname) return;
  state.current = 0;
  state.answers = Array(questions.length).fill(null);
  renderQuestion();
  showView(els.quizView);
});

els.prevBtn.addEventListener("click", () => {
  if (state.current > 0) {
    state.current -= 1;
    renderQuestion();
  }
});

els.nextBtn.addEventListener("click", () => {
  if (state.answers[state.current] === null) return;
  if (state.current < questions.length - 1) {
    state.current += 1;
    renderQuestion();
  } else {
    renderResult();
    showView(els.resultView);
  }
});

els.restartBtn.addEventListener("click", () => {
  state.nickname = "";
  state.current = 0;
  state.answers = Array(questions.length).fill(null);
  state.result = null;
  els.nickname.value = "";
  els.startBtn.disabled = true;
  showView(els.welcomeView);
});

els.shareBtn.addEventListener("click", async () => {
  els.shareBtn.disabled = true;
  const originalText = els.shareBtn.textContent;
  els.shareBtn.textContent = "生成中...";
  try {
    if (state.shareUrl) {
      URL.revokeObjectURL(state.shareUrl);
      state.shareUrl = null;
    }
    state.shareUrl = await generateShareImage();
    els.shareImage.src = state.shareUrl;
    els.downloadShare.href = state.shareUrl;
    els.shareModal.hidden = false;
  } catch (error) {
    console.error("分享图生成失败：", error);
    window.alert("分享图生成失败，请刷新页面后重试。");
  } finally {
    els.shareBtn.textContent = originalText;
    els.shareBtn.disabled = false;
  }
});

els.closeShareBtn.addEventListener("click", () => {
  els.shareModal.hidden = true;
});

els.shareModal.addEventListener("click", (event) => {
  if (event.target === els.shareModal) {
    els.shareModal.hidden = true;
  }
});

window.addEventListener("resize", syncStageHeight);
window.addEventListener("load", syncStageHeight);
