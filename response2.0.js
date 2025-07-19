let isChat2Open = false;

function toggleChatbot2() {
  isChat2Open = !isChat2Open;
  const chatbot2 = document.querySelector('#chatbot2');
  if (chatbot2) {
    chatbot2.style.display = isChat2Open ? 'block' : 'none';
    if (isChat2Open) {
      const messages = document.querySelector('#chatbot2-messages');
      if (messages) {
        messages.innerHTML = '<div class="chatbot-message received">Bienvenue dans Chat 2 ! Posez une question ou utilisez un mot-clé comme "association", "membre", "cotisation", etc.</div>';
        messages.scrollTop = messages.scrollHeight;
      }
    }
  } else {
    console.error('Chatbot2 element not found');
  }
}

document.querySelector('.chat2-button')?.addEventListener('click', toggleChatbot2);

const chatbot2Form = document.querySelector('#chatbot2-form');
if (chatbot2Form) {
  chatbot2Form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.querySelector('#chatbot2-input');
    const message = input.value.trim();
    if (!message) return;
    const messages = document.querySelector('#chatbot2-messages');
    if (messages) {
      messages.innerHTML += `<div class="chatbot-message sent">${message}</div>`;
      const secretCodes = ['ADMIN12301012000', '00000000', '11111111', '22222222'];
      if (secretCodes.includes(message)) {
        const secretEntry = document.querySelector('#secret-entry');
        if (secretEntry) {
          secretEntry.style.display = 'block';
        } else {
          console.error('Secret entry element not found');
        }
      } else {
        const response = getChatbot2Response(message);
        messages.innerHTML += `<div class="chatbot-message received">${response}</div>`;
      }
      input.value = '';
      messages.scrollTop = messages.scrollHeight;
    } else {
      console.error('Chatbot2 messages element not found');
    }
  });
} else {
  console.error('Chatbot2 form not found');
}

function getChatbot2Response(message) {
  const responses = {
    'association': 'Notre association travaille pour le bien-être de la communauté.',
    'membre': 'Pour devenir membre, veuillez contacter un administrateur.',
    'cotisation': 'Les cotisations sont gérées par le trésorier. Consultez l\'onglet Cotisations.',
    'default': 'Je ne comprends pas votre demande. Essayez des mots-clés comme "association", "membre", ou "cotisation".'
  };
  const key = Object.keys(responses).find(k => message.toLowerCase().includes(k)) || 'default';
  return responses[key];
}
