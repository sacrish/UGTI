const config = window.UGTI_CONFIG;
const questions = config.questions;
const results = config.results;
const resultOrder = config.resultOrder;
const qrCodePath = "./assets/qr.png";

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
  syncStageHeight();
}

function getResultImagePath(result) {
  if (result.image && !result.image.includes("personality-placeholder")) {
    return result.image;
  }
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

function assetHref(src) {
  return new URL(withCacheBust(src), window.location.href).href;
}

function escapeSvg(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripMarkdown(value) {
  return value.replace(/\*\*/g, "");
}

function wrapText(value, maxChars, maxLines) {
  const chars = Array.from(stripMarkdown(value));
  const lines = [];
  let line = "";

  chars.forEach((char) => {
    if (line.length >= maxChars && lines.length < maxLines - 1) {
      lines.push(line);
      line = char;
    } else {
      line += char;
    }
  });

  if (line && lines.length < maxLines) {
    lines.push(line);
  }

  if (chars.length > maxChars * maxLines) {
    lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, Math.max(0, maxChars - 1))}…`;
  }

  return lines;
}

function svgTextLines(lines, x, y, lineHeight, options = {}) {
  const { className = "", anchor = "start" } = options;
  return lines
    .map((line, index) => {
      const attrs = [`x="${x}"`, `y="${y + index * lineHeight}"`, `text-anchor="${anchor}"`];
      if (className) attrs.push(`class="${className}"`);
      return `<text ${attrs.join(" ")}>${escapeSvg(line)}</text>`;
    })
    .join("");
}

function renderShareSvg(options = {}) {
  const result = state.result;
  const resultImage = options.resultImage || assetHref(getResultImagePath(result));
  const qrImage = options.qrImage || assetHref(qrCodePath);
  const nameLines = wrapText(result.name, 5, 2);
  const portraitLines = wrapText(result.portrait, 24, 6);
  const sloganLines = wrapText(result.slogan, 16, 2);
  const blessingLines = wrapText(
    "测试仅供娱乐，希望每一位毕业生都能不被标签束缚，能够肆意洒脱地享受你的人生！",
    28,
    3
  );

  let tagX = 436;
  let tagY = 472;
  const tags = result.tags
    .map((tag) => {
      const width = Math.max(116, Array.from(tag).length * 24 + 28);
      if (tagX + width > 762) {
        tagX = 436;
        tagY += 56;
      }
      const markup = `
        <rect x="${tagX}" y="${tagY}" width="${width}" height="42" rx="8" fill="#38d7ff" stroke="#17130f" stroke-width="4"/>
        <text x="${tagX + 14}" y="${tagY + 28}" class="tag">${escapeSvg(tag)}</text>
      `;
      tagX += width + 12;
      return markup;
    })
    .join("");
  const portraitY = Math.max(554, tagY + 76);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1320" viewBox="0 0 900 1320">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff8ef"/>
      <stop offset="0.48" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f5f0ff"/>
    </linearGradient>
    <radialGradient id="blueGlow" cx="110" cy="180" r="360" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#38d7ff" stop-opacity="0.46"/>
      <stop offset="1" stop-color="#38d7ff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="limeGlow" cx="810" cy="140" r="330" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#b8f042" stop-opacity="0.48"/>
      <stop offset="1" stop-color="#b8f042" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cardBg" x1="0" y1="186" x2="804" y2="1016" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fffaf1"/>
      <stop offset="0.58" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#eefbff"/>
    </linearGradient>
    <style>
      text { font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", Arial, sans-serif; fill: #17130f; }
      .title { font-size: 36px; font-weight: 900; }
      .prefix { font-size: 24px; font-weight: 900; fill: #6f665c; }
      .name { font-size: 62px; font-weight: 900; }
      .tag { font-size: 24px; font-weight: 900; }
      .portrait { font-size: 27px; font-weight: 700; fill: #312b25; }
      .slogan { font-size: 28px; font-weight: 900; }
      .qr-label { font-size: 19px; font-weight: 800; }
      .blessing { font-size: 22px; font-weight: 700; fill: #6f665c; }
      .credit { font-size: 18px; font-weight: 800; fill: rgba(23, 19, 15, 0.58); }
    </style>
  </defs>
  <rect width="900" height="1320" fill="url(#bg)"/>
  <rect width="900" height="1320" fill="url(#blueGlow)"/>
  <rect width="900" height="1320" fill="url(#limeGlow)"/>
  <rect x="36" y="36" width="828" height="1248" rx="24" fill="#fff8ef" fill-opacity="0.9" stroke="#17130f" stroke-width="4"/>
  <text x="96" y="132" class="title">UGTI 大学毕业生人格测试</text>
  <rect x="106" y="196" width="708" height="830" rx="18" fill="#ff5b4a" fill-opacity="0.22"/>
  <rect x="96" y="186" width="708" height="830" rx="18" fill="url(#cardBg)" stroke="#17130f" stroke-width="4"/>
  <rect x="136" y="238" width="260" height="260" rx="18" fill="#fff" stroke="#17130f" stroke-width="4"/>
  <image href="${escapeSvg(resultImage)}" x="140" y="242" width="252" height="252" preserveAspectRatio="xMidYMid meet"/>
  <text x="436" y="268" class="prefix">${escapeSvg(`${state.nickname} 的毕业人格是`)}</text>
  ${svgTextLines(nameLines, 436, 346, 68, { className: "name" })}
  ${tags}
  ${svgTextLines(portraitLines, 136, portraitY, 48, { className: "portrait" })}
  <rect x="136" y="888" width="500" height="82" fill="rgba(255,216,79,0.42)"/>
  <rect x="136" y="888" width="8" height="82" fill="#ff5b4a"/>
  ${svgTextLines(sloganLines, 166, 922, 36, { className: "slogan" })}
  <rect x="646" y="864" width="118" height="118" fill="#fff"/>
  <image href="${escapeSvg(qrImage)}" x="646" y="864" width="118" height="118" preserveAspectRatio="xMidYMid meet"/>
  <text x="610" y="1004" class="qr-label">扫码来测你的 UGTI</text>
  ${svgTextLines(blessingLines, 96, 1110, 38, { className: "blessing" })}
  <text x="450" y="1204" text-anchor="middle" class="credit">Developed By</text>
  <text x="450" y="1232" text-anchor="middle" class="credit">大连东软信息学院 数字艺术与设计学院</text>
  <text x="450" y="1260" text-anchor="middle" class="credit">动画与数字媒体艺术系</text>
</svg>`;
}

async function imageFileToDataUrl(src) {
  const freshSrc = withCacheBust(src);

  try {
    const response = await fetch(freshSrc, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`图片加载失败：${src}`);
    }
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(`图片读取失败：${src}`));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("通过 fetch 读取图片失败，尝试用图片元素读取。", error);
    return imageElementToDataUrl(freshSrc);
  }
}

function imageElementToDataUrl(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext("2d").drawImage(image, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () => reject(new Error(`图片加载失败：${src}`));
    image.src = src;
  });
}

async function imageSourceToDataUrl(src) {
  try {
    return await imageFileToDataUrl(src);
  } catch (freshError) {
    console.warn("带缓存参数的图片读取失败，尝试原始图片路径。", freshError);
    return imageElementToDataUrl(src);
  }
}

function svgToPngUrl(svg) {
  return new Promise((resolve, reject) => {
    const svgUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 900;
        canvas.height = 1320;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        URL.revokeObjectURL(svgUrl);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("PNG 图片生成失败"));
            return;
          }
          resolve(URL.createObjectURL(blob));
        }, "image/png");
      } catch (error) {
        URL.revokeObjectURL(svgUrl);
        reject(error);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error("分享图渲染失败"));
    };
    image.src = svgUrl;
  });
}

async function generateSharePngUrl() {
  const [resultImage, qrImage] = await Promise.all([
    imageSourceToDataUrl(getResultImagePath(state.result)),
    imageSourceToDataUrl(qrCodePath)
  ]);
  const pngSvg = renderShareSvg({ resultImage, qrImage });
  return svgToPngUrl(pngSvg);
}

function generateShareImage() {
  const svg = renderShareSvg();
  return { svg };
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
    const shareImage = generateShareImage();
    els.shareImage.innerHTML = shareImage.svg;
    els.downloadShare.href = "#";
    els.shareModal.hidden = false;
  } catch (error) {
    console.error("分享图生成失败：", error);
    window.alert("分享图生成失败，请刷新页面后重试。");
  } finally {
    els.shareBtn.textContent = originalText;
    els.shareBtn.disabled = false;
  }
});

els.downloadShare.addEventListener("click", async (event) => {
  event.preventDefault();
  const originalText = els.downloadShare.textContent;
  els.downloadShare.textContent = "保存中...";
  try {
    if (state.shareUrl) {
      URL.revokeObjectURL(state.shareUrl);
      state.shareUrl = null;
    }
    state.shareUrl = await generateSharePngUrl();
    const link = document.createElement("a");
    link.href = state.shareUrl;
    link.download = els.downloadShare.download || "UGTI-大学毕业生人格测试.png";
    document.body.append(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("PNG 保存失败：", error);
    window.alert("PNG 保存失败。请通过本地 HTTP 服务打开页面后重试。");
  } finally {
    els.downloadShare.textContent = originalText;
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
