const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const sendButton = form.querySelector('button');
const suggestions = document.querySelectorAll('.suggestion');

// Riwayat percakapan dikirim utuh ke backend agar Gemini dapat memahami konteks.
const conversation = [];

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  input.value = '';
  setLoading(true);

  const botMessage = appendMessage('bot', 'FoodFinder sedang berpikir... 🍴', true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      botMessage.textContent = data?.error || 'Maaf, terjadi kesalahan pada server.';
      return;
    }

    if (data?.result) {
      botMessage.textContent = data.result;
      conversation.push({ role: 'model', text: data.result });
    } else {
      botMessage.textContent = 'Maaf, FoodFinder belum menerima jawaban dari Gemini.';
    }
  } catch (error) {
    console.error('Error:', error);
    botMessage.textContent = 'Gagal terhubung ke server. Pastikan server Node.js sedang berjalan.';
  } finally {
    setLoading(false);
    input.focus();
    scrollToBottom();
  }
});

suggestions.forEach((button) => {
  button.addEventListener('click', () => {
    input.value = button.textContent.trim();
    input.focus();
  });
});

function appendMessage(sender, text, isTyping = false) {
  const message = document.createElement('div');
  message.className = `message ${sender}`;

  if (sender === 'bot') {
    const label = document.createElement('span');
    label.className = 'message-label';
    label.textContent = 'FoodFinder AI';
    message.appendChild(label);
  }

  const content = document.createElement('span');
  content.textContent = text;
  if (isTyping) content.classList.add('typing');
  message.appendChild(content);

  chatBox.appendChild(message);
  scrollToBottom();

  return content;
}

function setLoading(isLoading) {
  input.disabled = isLoading;
  sendButton.disabled = isLoading;
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}
