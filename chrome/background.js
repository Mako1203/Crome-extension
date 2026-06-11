// =========================================
// Service Worker (background.js) — Manifest V3
// =========================================
console.log('[Background] Service Worker запущен');
console.log('[Background] chrome.storage доступен:', !!chrome?.storage?.local);

// Обработчик установки расширения
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Background] Установка/обновление:', details.reason, details.previousVersion);
});

// Обработчик старта Service Worker
chrome.runtime.onStartup.addListener(() => {
  console.log('[Background] Браузер запущен, Service Worker активирован');
});

// Слушаем сообщения от content.js или popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Получено сообщение:', message, 'от:', sender);

  if (message.type === 'PING') {
    sendResponse({ status: 'pong', timestamp: Date.now() });
  }

  // Обязательно возвращаем true для асинхронного ответа (если нужен)
  return true;
});

// Периодическая проверка, что Service Worker жив
setInterval(() => {
  console.log('[Background] Service Worker активен, памяти:', performance?.memory?.usedJSHeapSize || 'N/A');
}, 30000);

console.log('[Background] Инициализация завершена');
