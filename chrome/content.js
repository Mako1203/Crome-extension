// =====================
// STATE
// =====================
let currentSelection = null;
let currentRange = null;
let saveBtn = null;

// =====================
// CREATE SAVE BUTTON
// =====================
function createSaveButton() {
  const btn = document.createElement("button");
  btn.innerText = "Сохранить";

  btn.style.position = "absolute";
  btn.style.zIndex = "999999";
  btn.style.padding = "6px 10px";
  btn.style.fontSize = "12px";
  btn.style.background = "#8931ec";
  btn.style.border = "1px solid #333";
  btn.style.borderRadius = "6px";
  btn.style.cursor = "pointer";
  btn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  btn.style.display = "none";

  document.body.appendChild(btn);

  btn.addEventListener("click", saveSelection);

  return btn;
}

// =====================
// SHOW BUTTON NEAR SELECTION
// =====================
function showSaveButton() {
  const selection = window.getSelection();

  if (!selection || selection.toString().trim() === "") {
    hideSaveButton();
    return;
  }

  currentSelection = selection.toString();
  currentRange = selection.getRangeAt(0);

  const rect = currentRange.getBoundingClientRect();

  saveBtn.style.top = `${window.scrollY + rect.top - 35}px`;
  saveBtn.style.left = `${window.scrollX + rect.left}px`;

  saveBtn.style.display = "block";
}

// =====================
// HIDE BUTTON
// =====================
function hideSaveButton() {
  if (saveBtn) {
    saveBtn.style.display = "none";
  }
}

// =====================
// HIGHLIGHT TEXT
// =====================
function highlightRange(range) {
  try {
    const span = document.createElement("span");

    span.style.backgroundColor = "yellow";
    span.style.color = "black";
    span.style.borderRadius = "3px";

    span.textContent = currentSelection;

    range.deleteContents();
    range.insertNode(span);
  } catch (err) {
    console.warn("Highlight error:", err);
  }
}

// =====================
// SAVE TO CHROME STORAGE
// =====================
function saveSelection() {
  if (!currentSelection || currentSelection.trim() === "") return;

  const data = {
    text: currentSelection,
    url: window.location.href,
    pageTitle: document.title,
    timestamp: Date.now()
  };

  chrome.storage.local.get({ savedTexts: [] }, (result) => {
    const savedTexts = result.savedTexts;

    savedTexts.push(data);

    chrome.storage.local.set({ savedTexts }, () => {
      console.log("Saved:", data);

      if (currentRange) {
        highlightRange(currentRange);
      }

      hideSaveButton();
      window.getSelection().removeAllRanges();
    });
  });
}

// =====================
// EVENTS
// =====================

// выделение текста
document.addEventListener("mouseup", (e) => {
  // если клик по кнопке — игнор
  if (saveBtn && e.target === saveBtn) return;

  setTimeout(() => {
    const selection = window.getSelection();

    if (!selection || selection.toString().trim() === "") {
      hideSaveButton();
      return;
    }

    showSaveButton();
  }, 10);
});

// скрытие при клике вне
document.addEventListener("mousedown", (e) => {
  if (saveBtn && e.target !== saveBtn) {
    hideSaveButton();
  }
});

// скрытие при скролле
window.addEventListener("scroll", hideSaveButton);

// =====================
// INIT
// =====================
function init() {
  saveBtn = createSaveButton();

  console.log("Web Highlighter extension loaded");
  console.log("chrome.storage available:", chrome?.storage);
}

init();