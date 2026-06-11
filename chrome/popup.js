// Загружаем и отображаем список сохранённых выделений
function loadSavedTexts() {
  const savedList = document.getElementById('saved-list');
  const emptyMessage = document.getElementById('empty-message');

  chrome.storage.local.get({ savedTexts: [] }, (result) => {
    const savedTexts = result.savedTexts;

    if (!savedTexts || savedTexts.length === 0) {
      savedList.innerHTML = '';
      emptyMessage.style.display = 'block';
      return;
    }

    emptyMessage.style.display = 'none';
    savedList.innerHTML = '';

    // Показываем в обратном порядке (сначала новые)
    const reversed = [...savedTexts].reverse();

    reversed.forEach((item, index) => {
      const realIndex = savedTexts.length - 1 - index;
      const date = new Date(item.timestamp);
      const formattedDate = date.toLocaleString('ru-RU');

      const itemEl = document.createElement('div');
      itemEl.className = 'saved-item';
      itemEl.dataset.index = realIndex;

      itemEl.innerHTML = `
        <div class="saved-item-text">${escapeHtml(item.text)}</div>
        <div class="saved-item-meta">
          <strong>Страница:</strong> ${escapeHtml(item.pageTitle)}<br>
          <strong>URL:</strong> ${escapeHtml(item.url)}<br>
          <strong>Сохранено:</strong> ${formattedDate}
        </div>
        <div class="saved-item-actions">
          <button class="delete-btn" data-index="${realIndex}">Удалить</button>
        </div>
      `;

      savedList.appendChild(itemEl);
    });

    // Добавляем обработчики на кнопки удаления
    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        deleteSavedText(index);
      });
    });
  });
}

// Удаление элемента по индексу
function deleteSavedText(index) {
  chrome.storage.local.get({ savedTexts: [] }, (result) => {
    const savedTexts = result.savedTexts;
    savedTexts.splice(index, 1);
    chrome.storage.local.set({ savedTexts }, () => {
      loadSavedTexts(); // Обновляем список
    });
  });
}

// Экранирование HTML для безопасности
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadSavedTexts);
