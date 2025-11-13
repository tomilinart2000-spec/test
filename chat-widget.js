(function () {
    // ---------- ЧТЕНИЕ НАСТРОЕК ИЗ <script> ----------
    const currentScript = document.currentScript;
  
    const backendUrl =
      (currentScript && currentScript.getAttribute('data-backend-url')) ||
      'https://your-backend.example.com/chat';
  
    const chatTitle =
      (currentScript && currentScript.getAttribute('data-title')) ||
      'Чат поддержки';
  
    // ---------- ДОБАВЛЯЕМ СТИЛИ ----------
    const style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = `
  :root {
    --chat-green: #00a652;
    --chat-light-gray: #f4f5f7;
    --chat-border-gray: #dde1e6;
    --chat-text-gray: #6b6b6b;
  }
  
  /* Чтобы виджет не ломал чужие стили body, не трогаем body вообще */
  
  /* Контейнер виджета в правом нижнем углу */
  .chat-widget {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  
  /* Кнопка открытия / закрытия */
  .chat-toggle-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    background: var(--chat-green);
    color: #fff;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  
  .chat-toggle-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }
  
  /* Окно чата */
  .chat-window {
    position: absolute;
    bottom: 72px;
    right: 0;
    width: 360px;
    max-height: 520px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    opacity: 0;
    transform: translateY(10px);
    pointer-events: none;
    transition: opacity 0.18s ease, transform 0.18s ease;
  }
  
  .chat-window.open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  
  /* Хедер */
  .chat-header {
    background: var(--chat-green);
    color: #fff;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .chat-header-title {
    font-size: 16px;
    font-weight: 600;
  }
  
  .chat-header-minimize {
    border: none;
    background: transparent;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    line-height: 1;
  }
  
  /* Основная область */
  .chat-body {
    background: var(--chat-light-gray);
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 300px;
  }
  
  /* Список сообщений */
  .chat-messages {
    padding: 12px 12px 8px;
    overflow-y: auto;
    flex: 1;
    max-height: 400px;
  }
  
  .chat-message-row {
    display: flex;
    margin-bottom: 8px;
  }
  
  .chat-message-row.bot {
    justify-content: flex-start;
  }
  
  .chat-message-row.user {
    justify-content: flex-end;
  }
  
  .chat-bubble {
    max-width: 80%;
    border-radius: 16px;
    padding: 8px 12px;
    font-size: 14px;
    line-height: 1.4;
  }
  
  .chat-bubble.bot {
    background: #ffffff;
    color: #000;
    border-radius: 16px 16px 16px 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  
  .chat-bubble.user {
    background: #e1f5e9;
    color: #000;
    border-radius: 16px 16px 4px 16px;
  }
  
  .chat-timestamp {
    font-size: 11px;
    color: var(--chat-text-gray);
    margin-top: 2px;
    padding: 0 6px;
  }
  
  .chat-message-row.bot .chat-timestamp {
    text-align: left;
  }
  
  .chat-message-row.user .chat-timestamp {
    text-align: right;
  }
  
  /* Футер с инпутом */
  .chat-input-area {
    padding: 8px;
    border-top: 1px solid var(--chat-border-gray);
    background: #fff;
    display: flex;
    gap: 6px;
    align-items: center;
  }
  
  .chat-input {
    flex: 1;
    border-radius: 20px;
    border: 1px solid var(--chat-border-gray);
    padding: 8px 12px;
    font-size: 14px;
    outline: none;
  }
  
  .chat-input:focus {
    border-color: var(--chat-green);
    box-shadow: 0 0 0 1px rgba(0, 166, 82, 0.1);
  }
  
  .chat-send-btn {
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    background: var(--chat-green);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  `;
    document.head.appendChild(style);
  
    // ---------- СОЗДАЁМ HTML ВИДЖЕТА ----------
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-widget';
    wrapper.innerHTML = `
      <div class="chat-window" id="chatWindow">
        <div class="chat-header">
          <div class="chat-header-title">${chatTitle}</div>
          <button class="chat-header-minimize" id="chatMinimizeBtn">–</button>
        </div>
        <div class="chat-body">
          <div class="chat-messages" id="chatMessages"></div>
          <div class="chat-input-area">
            <input
              type="text"
              id="chatInput"
              class="chat-input"
              placeholder="Введите ваш вопрос и нажмите Enter"
            />
            <button class="chat-send-btn" id="chatSendBtn">➤</button>
          </div>
        </div>
      </div>
      <button class="chat-toggle-btn" id="chatToggleBtn">💬</button>
    `;
    document.body.appendChild(wrapper);
  
    // ---------- ЛОГИКА ВИДЖЕТА ----------
  
    const chatWindow   = wrapper.querySelector('#chatWindow');
    const toggleBtn    = wrapper.querySelector('#chatToggleBtn');
    const minimizeBtn  = wrapper.querySelector('#chatMinimizeBtn');
    const messagesEl   = wrapper.querySelector('#chatMessages');
    const inputEl      = wrapper.querySelector('#chatInput');
    const sendBtn      = wrapper.querySelector('#chatSendBtn');
  
    function toggleChat(open) {
      const shouldOpen = open !== undefined ? open : !chatWindow.classList.contains('open');
      if (shouldOpen) {
        chatWindow.classList.add('open');
        inputEl.focus();
      } else {
        chatWindow.classList.remove('open');
      }
    }
  
    toggleBtn.addEventListener('click', () => toggleChat());
    minimizeBtn.addEventListener('click', () => toggleChat(false));
  
    function formatTime(date = new Date()) {
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      return hh + ':' + mm;
    }
  
    function appendMessage(text, sender) {
      if (!sender) sender = 'bot';
  
      const row = document.createElement('div');
      row.className = 'chat-message-row ' + sender;
  
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble ' + sender;
      bubble.textContent = text;
  
      const timestamp = document.createElement('div');
      timestamp.className = 'chat-timestamp';
      timestamp.textContent = formatTime();
  
      const inner = document.createElement('div');
      inner.appendChild(bubble);
      inner.appendChild(timestamp);
  
      row.appendChild(inner);
      messagesEl.appendChild(row);
  
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  
    // Приветственное сообщение
    appendMessage('Привет, я — виртуальный помощник! Могу ответить на популярные вопросы.', 'bot');
  
    async function sendMessage() {
      const text = (inputEl.value || '').trim();
      if (!text) return;
  
      appendMessage(text, 'user');
      inputEl.value = '';
      inputEl.focus();
  
      try {
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
  
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
  
        const data = await response.json();
        const botReply = data.reply || 'Извините, не удалось получить ответ.';
        appendMessage(botReply, 'bot');
      } catch (e) {
        console.error('Chat widget error:', e);
        appendMessage('Произошла ошибка при обращении к серверу. Попробуйте позже.', 'bot');
      }
    }
  
    sendBtn.addEventListener('click', sendMessage);
  
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  })();
  