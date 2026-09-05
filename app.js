const config = window.USTI_CONFIG;
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
  participantCount: document.querySelector("#participantCount"),
  participantCountValue: document.querySelector("#participantCountValue"),
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
  wechatTip: document.querySelector("#wechatTip"),
  screenshotHint: document.querySelector("#screenshotHint"),
  restartBtn: document.querySelector("#restartBtn"),
  shareBtn: document.querySelector("#shareBtn"),
  shareModal: document.querySelector("#shareModal"),
  closeShareBtn: document.querySelector("#closeShareBtn"),
  shareImage: document.querySelector("#shareImage"),
  downloadShare: document.querySelector("#downloadShare")
};

const isWeChat = isWeChatBrowser();

function showView(view) {
  [els.welcomeView, els.quizView, els.resultView].filter(Boolean).forEach((item) => {
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
      button?.addEventListener("click", () => selectOption(index));
      return button;
    })
  );
  syncStageHeight();
}

let advanceTimer;
function selectOption(index) {
  window.clearTimeout(advanceTimer);
  state.answers[state.current] = index;
  renderQuestion();
  const current = state.current;
  if (current === questions.length - 1) {
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
      });
    });
    return;
  }
  advanceTimer = window.setTimeout(() => {
    if (state.current !== current) return;
    state.current += 1;
    renderQuestion();
  }, 220);
}

function openResultPage() {
  if (!questions.every((question, i) => Number.isInteger(state.answers[i]) && question.options[state.answers[i]])) return;
  try {
    sessionStorage.setItem("usti-result", JSON.stringify({ nickname: state.nickname, answers: state.answers }));
  } catch (error) {
    window.alert("无法保存测试结果，请允许浏览器使用网站存储后重试。你的答案仍保留在本页。");
    return;
  }
  trackTestCompletion();
  window.location.assign("./result.html");
}

function trackTestCompletion() {
  if (window.goatcounter?.count) {
    window.goatcounter.count({
      path: "test-completed",
      title: "USTI 测试完成",
      event: true
    });
  }
}

async function loadParticipantCount() {
  if (!els.participantCount || !els.participantCountValue || typeof fetch !== "function") return;
  try {
    const response = await fetch("https://zak.goatcounter.com/counter/test-completed.json", {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return;
    const data = await response.json();
    if (typeof data.count !== "string" && typeof data.count !== "number") return;
    els.participantCountValue.textContent = String(data.count);
    els.participantCount.hidden = false;
    syncStageHeight();
  } catch (error) {
    // The public counter can be disabled or blocked without affecting the test.
  }
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
  els.resultNamePrefix.textContent = `${state.nickname} 的大学人格是`;
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
  USTI_QR.drawToCanvas(els.resultQr, getQrTargetUrl());
  syncStageHeight();
}

function isWeChatBrowser() {
  return /MicroMessenger/i.test(window.navigator.userAgent);
}

function showWeChatTip() {
  if (!isWeChat || !els.wechatTip) return;
  els.wechatTip.hidden = false;
  window.setTimeout(syncStageHeight, 0);
}

function hideWeChatTip() {
  if (!els.wechatTip || els.wechatTip.hidden) return;
  els.wechatTip.hidden = true;
}

function showScreenshotHint() {
  if (!els.screenshotHint) return;
  els.screenshotHint.hidden = false;
  window.setTimeout(() => {
    els.screenshotHint.hidden = true;
  }, 1800);
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

// Point scanners to the test entry page, never the session-dependent result page.
function getQrTargetUrl() {
  const url = new URL("./", window.location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
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
  bg.addColorStop(0, "#fff8df");
  bg.addColorStop(0.48, "#ffffff");
  bg.addColorStop(1, "#f7edff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const blueGlow = ctx.createRadialGradient(110, 180, 10, 110, 180, 360);
  blueGlow.addColorStop(0, "rgba(237, 142, 191, 0.22)");
  blueGlow.addColorStop(1, "rgba(237, 142, 191, 0)");
  ctx.fillStyle = blueGlow;
  ctx.fillRect(0, 0, width, height);

  const limeGlow = ctx.createRadialGradient(width - 90, 140, 10, width - 90, 140, 330);
  limeGlow.addColorStop(0, "rgba(153, 124, 230, 0.18)");
  limeGlow.addColorStop(1, "rgba(153, 124, 230, 0)");
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

  ctx.fillStyle = "#fffdf5";
  ctx.strokeStyle = "#302653";
  ctx.lineWidth = 1;
  roundedRect(ctx, 36, 36, 828, 1248, 24, true, true);

  ctx.fillStyle = "#302653";
  ctx.font = "900 36px Microsoft YaHei, PingFang SC, sans-serif";
  ctx.fillText("USTI 大学生人格类型测试", 96, 132);

  ctx.fillStyle = "#e8daf8";
  roundedRect(ctx, 106, 196, 708, 830, 18, true, false);

  const cardBg = ctx.createLinearGradient(96, 186, 804, 1016);
  cardBg.addColorStop(0, "#fffdf5");
  cardBg.addColorStop(0.58, "#ffffff");
  cardBg.addColorStop(1, "#faf3ff");
  ctx.fillStyle = cardBg;
  ctx.strokeStyle = "#302653";
  ctx.lineWidth = 1;
  roundedRect(ctx, 96, 186, 708, 830, 18, true, true);

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#302653";
  ctx.lineWidth = 1;
  roundedRect(ctx, 136, 238, 260, 260, 18, true, true);
  ctx.drawImage(resultImage, 140, 242, 252, 252);

  ctx.fillStyle = "#746582";
  ctx.font = "900 24px Microsoft YaHei, PingFang SC, sans-serif";
  ctx.fillText(`${state.nickname} 的大学人格是`, 436, 268);
  ctx.fillStyle = "#302653";
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
    ctx.fillStyle = "#eee4ff";
    ctx.strokeStyle = "#302653";
    ctx.lineWidth = 1;
    roundedRect(ctx, x, y, width, 42, 8, true, true);
    ctx.fillStyle = "#302653";
    ctx.fillText(tag, x + 14, y + 28);
    tagBottom = Math.max(tagBottom, y + 42);
    x += width + 12;
  });

  ctx.font = "700 27px Microsoft YaHei, PingFang SC, sans-serif";
  ctx.fillStyle = "#594b6f";
  drawWrappedText(ctx, result.portrait, 136, Math.max(554, tagBottom + 34), 608, 48, 6);

  ctx.fillStyle = "#fff2bb";
  ctx.fillRect(136, 888, 500, 82);
  ctx.fillStyle = "#edb34c";
  ctx.fillRect(136, 888, 8, 82);
  ctx.fillStyle = "#302653";
  ctx.font = "900 28px Microsoft YaHei, PingFang SC, sans-serif";
  drawWrappedText(ctx, result.slogan, 166, 922, 430, 36, 2);

  USTI_QR.drawToContext(ctx, getQrTargetUrl(), 646, 864, 118);
  ctx.fillStyle = "#302653";
  ctx.font = "800 19px Microsoft YaHei, PingFang SC, sans-serif";
  ctx.fillText("扫码来测你的 USTI", 610, 1004);

  ctx.fillStyle = "#746582";
  ctx.font = "700 22px Microsoft YaHei, PingFang SC, sans-serif";
  drawWrappedText(
    ctx,
    "测试仅供娱乐，愿每一位大学生都不被标签束缚，在校园里勇敢探索、自在成长；初入大学的你，也能找到自己的节奏与热爱！",
    96,
    1110,
    708,
    38,
    3
  );

  ctx.fillStyle = "#746582";
  ctx.font = "800 18px Microsoft YaHei, PingFang SC, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Developed By", canvas.width / 2, 1204);
  ctx.fillText("大连东软信息学院 数字艺术与设计学院", canvas.width / 2, 1232);
  ctx.fillText("动画与数字媒体艺术系", canvas.width / 2, 1260);
  ctx.textAlign = "left";

  return canvas;
}

els.nickname?.addEventListener("input", () => {
  els.startBtn.disabled = els.nickname.value.trim().length === 0;
});

els.startForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  state.nickname = els.nickname.value.trim();
  if (!state.nickname) return;
  state.current = 0;
  state.answers = Array(questions.length).fill(null);
  renderQuestion();
  showView(els.quizView);
});

els.prevBtn?.addEventListener("click", () => {
  window.clearTimeout(advanceTimer);
  if (state.current > 0) {
    state.current -= 1;
    renderQuestion();
  }
});

els.nextBtn?.addEventListener("click", () => {
  window.clearTimeout(advanceTimer);
  if (state.answers[state.current] === null) return;
  if (state.current < questions.length - 1) {
    state.current += 1;
    renderQuestion();
  } else {
    openResultPage();
  }
});

els.restartBtn?.addEventListener("click", () => {
  try { sessionStorage.removeItem("usti-result"); } catch (error) { /* Navigation still works if storage is blocked. */ }
  window.location.assign("./index.html");
});

els.shareBtn?.addEventListener("click", async () => {
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
    els.shareModal.classList.toggle("wechat-share-mode", isWeChat);
    els.shareModal.hidden = false;
    if (isWeChat) showScreenshotHint();
  } catch (error) {
    console.error("分享图生成失败：", error);
    window.alert("分享图生成失败，请刷新页面后重试。");
  } finally {
    els.shareBtn.textContent = originalText;
    els.shareBtn.disabled = false;
  }
});

els.closeShareBtn?.addEventListener("click", () => {
  els.shareModal.hidden = true;
});

els.shareModal?.addEventListener("click", (event) => {
  if (isWeChat || event.target === els.shareModal) {
    els.shareModal.hidden = true;
  }
});

els.wechatTip?.addEventListener("click", hideWeChatTip);
document.addEventListener("click", hideWeChatTip);
showWeChatTip();
loadParticipantCount();

window?.addEventListener("resize", syncStageHeight);
window?.addEventListener("load", syncStageHeight);

// Results persist within this tab so refreshing the result page remains useful.
if (els.resultView) {
  try {
    const saved = JSON.parse(sessionStorage.getItem("usti-result"));
    if (!saved || typeof saved.nickname !== "string" || !saved.nickname.trim() ||
        saved.nickname.length > 16 || !Array.isArray(saved.answers) ||
        saved.answers.length !== questions.length ||
        !questions.every((question, i) => Number.isInteger(saved.answers[i]) && question.options[saved.answers[i]])) {
      throw new Error("Missing or invalid result");
    }
    state.nickname = saved.nickname;
    state.answers = saved.answers;
    renderResult();
    showView(els.resultView);
  } catch (error) {
    window.location.replace("./index.html");
  }
}
