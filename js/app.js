(function () {
  const UNIT_PRICE = 29.99;

  const $ = (sel) => document.querySelector(sel);
  const textInput = $("#textInput");
  const previewText = $("#previewText");
  const charCount = $("#charCount");
  const fontSelect = $("#fontSelect");
  const textColor = $("#textColor");
  const textColorValue = $("#textColorValue");
  const fontSize = $("#fontSize");
  const fontSizeValue = $("#fontSizeValue");
  const shirtColors = $("#shirtColors");
  const quantityInput = $("#quantity");
  const qtyMinus = $("#qtyMinus");
  const qtyPlus = $("#qtyPlus");
  const priceDisplay = $("#priceDisplay");
  const addToCartBtn = $("#addToCart");
  const downloadBtn = $("#downloadBtn");
  const textLayer = $("#textLayer");
  const previewStage = $("#previewStage");
  const toast = $("#toast");

  // ─── Live Text Update ───
  textInput.addEventListener("input", () => {
    const val = textInput.value.trim();
    previewText.textContent = val || "Your Text Here";
    charCount.textContent = textInput.value.length;
  });

  // ─── Font Family ───
  fontSelect.addEventListener("change", () => {
    previewText.style.fontFamily = fontSelect.value;
  });

  // ─── Text Color ───
  function applyTextColor() {
    previewText.style.color = textColor.value;
    textColorValue.textContent = textColor.value;
  }
  textColor.addEventListener("input", applyTextColor);
  textColor.addEventListener("change", applyTextColor);

  // ─── Font Size ───
  fontSize.addEventListener("input", () => {
    const size = fontSize.value;
    fontSizeValue.textContent = size;
    previewText.style.fontSize = size + "px";
  });

  // ─── T-Shirt Color Swatches ───
  shirtColors.addEventListener("click", (e) => {
    const swatch = e.target.closest(".swatch");
    if (!swatch) return;

    shirtColors.querySelector(".swatch--active")?.classList.remove("swatch--active");
    swatch.classList.add("swatch--active");

    const stage = previewStage;
    stage.style.setProperty("--shirt-color", swatch.dataset.color);
    stage.style.setProperty("--shirt-stroke", swatch.dataset.stroke);
    stage.style.setProperty("--collar-shadow", swatch.dataset.shadow);

    if (swatch.dataset.color === "#f5f5f5" && textColor.value === "#ffffff") {
      textColor.value = "#1a1a1a";
      textColor.dispatchEvent(new Event("input"));
    }
  });

  // ─── Quantity ───
  function updatePrice() {
    const qty = parseInt(quantityInput.value) || 1;
    const total = (UNIT_PRICE * qty).toFixed(2);
    priceDisplay.textContent = "$" + total;
  }

  qtyMinus.addEventListener("click", () => {
    let val = parseInt(quantityInput.value) || 1;
    if (val > 1) {
      quantityInput.value = val - 1;
      updatePrice();
    }
  });

  qtyPlus.addEventListener("click", () => {
    let val = parseInt(quantityInput.value) || 1;
    if (val < 99) {
      quantityInput.value = val + 1;
      updatePrice();
    }
  });

  // ─── Drag-to-Reposition Text ───
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  function getPosition() {
    const stageRect = previewStage.getBoundingClientRect();
    const layerRect = textLayer.getBoundingClientRect();
    return {
      left: layerRect.left - stageRect.left + layerRect.width / 2,
      top: layerRect.top - stageRect.top + layerRect.height / 2,
    };
  }

  function onPointerDown(e) {
    isDragging = true;
    textLayer.classList.add("dragging");

    const stageRect = previewStage.getBoundingClientRect();
    const layerRect = textLayer.getBoundingClientRect();

    startX = e.clientX;
    startY = e.clientY;
    startLeft = layerRect.left - stageRect.left + layerRect.width / 2;
    startTop = layerRect.top - stageRect.top + layerRect.height / 2;

    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;

    const stageRect = previewStage.getBoundingClientRect();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newLeft = startLeft + dx;
    let newTop = startTop + dy;

    newLeft = Math.max(0, Math.min(stageRect.width, newLeft));
    newTop = Math.max(0, Math.min(stageRect.height, newTop));

    const leftPct = (newLeft / stageRect.width) * 100;
    const topPct = (newTop / stageRect.height) * 100;

    textLayer.style.left = leftPct + "%";
    textLayer.style.top = topPct + "%";
    textLayer.style.transform = "translate(-50%, -50%)";

    e.preventDefault();
  }

  function onPointerUp() {
    isDragging = false;
    textLayer.classList.remove("dragging");
  }

  textLayer.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);

  // ─── Toast Notification ───
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  // ─── Add to Cart ───
  addToCartBtn.addEventListener("click", () => {
    const text = textInput.value.trim() || "Your Text Here";
    const qty = quantityInput.value;
    showToast(`Added ${qty}× custom tee "${text}" to cart!`);
  });

  // ─── Download Design as PNG ───
  downloadBtn.addEventListener("click", () => {
    const stage = previewStage;
    const stageRect = stage.getBoundingClientRect();

    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = stageRect.width * scale;
    canvas.height = stageRect.height * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    const bgGrad = ctx.createLinearGradient(0, 0, stageRect.width, stageRect.height);
    bgGrad.addColorStop(0, "#e8e8e8");
    bgGrad.addColorStop(1, "#f2f2f2");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, stageRect.width, stageRect.height);

    const svg = stage.querySelector(".tshirt-svg");
    const svgData = new XMLSerializer().serializeToString(svg);

    const computedStyle = getComputedStyle(stage);
    const shirtColor = computedStyle.getPropertyValue("--shirt-color").trim() || "#2d2d2d";
    const shirtStroke = computedStyle.getPropertyValue("--shirt-stroke").trim() || "#444";
    const collarShadow = computedStyle.getPropertyValue("--collar-shadow").trim() || "rgba(0,0,0,0.15)";

    let resolvedSvg = svgData
      .replace(/var\(--shirt-color\)/g, shirtColor)
      .replace(/var\(--shirt-stroke\)/g, shirtStroke)
      .replace(/var\(--collar-shadow\)/g, collarShadow);

    const svgBlob = new Blob([resolvedSvg], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      const svgRect = svg.getBoundingClientRect();
      const offX = svgRect.left - stageRect.left;
      const offY = svgRect.top - stageRect.top;
      ctx.drawImage(img, offX, offY, svgRect.width, svgRect.height);
      URL.revokeObjectURL(svgUrl);

      const textEl = previewText;
      const textStyle = getComputedStyle(textEl);
      const layerRect = textLayer.getBoundingClientRect();

      ctx.font = `${textStyle.fontWeight} ${textStyle.fontSize} ${textStyle.fontFamily}`;
      ctx.fillStyle = textStyle.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;

      const tx = layerRect.left - stageRect.left + layerRect.width / 2;
      const ty = layerRect.top - stageRect.top + layerRect.height / 2;

      const maxWidth = stageRect.width * 0.45;
      const words = textEl.textContent.split(" ");
      const lineHeight = parseFloat(textStyle.fontSize) * 1.3;
      const lines = [];
      let currentLine = "";

      for (const word of words) {
        const test = currentLine ? currentLine + " " + word : word;
        if (ctx.measureText(test).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = test;
        }
      }
      if (currentLine) lines.push(currentLine);

      const totalH = lines.length * lineHeight;
      let startYText = ty - totalH / 2 + lineHeight / 2;

      for (const line of lines) {
        ctx.fillText(line, tx, startYText);
        startYText += lineHeight;
      }

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "craftedge-design.png";
        a.click();
        URL.revokeObjectURL(url);
        showToast("Design downloaded!");
      }, "image/png");
    };

    img.src = svgUrl;
  });
})();
