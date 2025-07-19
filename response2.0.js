let isChat2Open = false;
let awaitingSecondCode = false;
let firstCode = null;

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

function clearChat2History() {
  const messages = document.querySelector('#chatbot2-messages');
  if (messages) {
    messages.innerHTML = '<div class="chatbot-message received">Historique effacé. Posez une question ou utilisez un mot-clé comme "association", "membre", "cotisation", etc.</div>';
    messages.scrollTop = messages.scrollHeight;
    awaitingSecondCode = false;
    firstCode = null;
    const secretEntry = document.querySelector('#secret-entry2');
    if (secretEntry) {
      secretEntry.style.display = 'none';
    }
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
      if (!awaitingSecondCode && secretCodes.includes(message)) {
        const secretEntry = document.querySelector('#secret-entry2');
        if (secretEntry) {
          secretEntry.style.display = 'block';
          awaitingSecondCode = true;
          firstCode = message;
          messages.innerHTML += `<div class="chatbot-message received">Veuillez entrer le deuxième code d'accès.</div>`;
        } else {
          console.error('Secret entry element not found');
          messages.innerHTML += `<div class="chatbot-message received">Erreur : Impossible d'afficher le champ de mot de passe.</div>`;
        }
      } else if (!awaitingSecondCode) {
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

function enterSecret2() {
  const password = document.querySelector('#secret-password2')?.value;
  const messages = document.querySelector('#chatbot2-messages');
  if (!password || !messages) {
    console.error('Secret password input or messages element not found');
    messages.innerHTML += '<div class="chatbot-message received">Erreur : Champ de mot de passe introuvable.</div>';
    messages.scrollTop = messages.scrollHeight;
    return;
  }

  const adminCodes = ['JESUISMEMBRE66', '33333333', '44444444', '55555555'];
  const treasurerCodes = ['JESUISTRESORIER444', '66666666', '77777777', '88888888'];
  const presidentCodes = ['PRESIDENT000', '99999999', '11112222', '33334444'];
  const secretaryCodes = ['SECRETAIRE000', '55556666', '77778888', '99990000'];

  if (adminCodes.includes(password)) {
    currentUser = { code: 'ADMIN123', role: 'admin' };
    showPage('secret');
    toggleChatbot2();
    awaitingSecondCode = false;
    firstCode = null;
    document.querySelector('#secret-entry2').style.display = 'none';
    messages.innerHTML += '<div class="chatbot-message received">Accès à l\'espace secret autorisé.</div>';
  } else if (treasurerCodes.includes(password)) {
    currentUser = { code: 'TRESORIER', role: 'tresorier' };
    showPage('secret');
    showTab('treasurer');
    toggleChatbot2();
    awaitingSecondCode = false;
    firstCode = null;
    document.querySelector('#secret-entry2').style.display = 'none';
    messages.innerHTML += '<div class="chatbot-message received">Accès à l\'espace trésorier autorisé.</div>';
  } else if (presidentCodes.includes(password)) {
    currentUser = { code: 'PRESIDENT', role: 'president' };
    showPage('secret');
    showTab('president');
    toggleChatbot2();
    awaitingSecondCode = false;
    firstCode = null;
    document.querySelector('#secret-entry2').style.display = 'none';
    messages.innerHTML += '<div class="chatbot-message received">Accès à l\'espace président autorisé.</div>';
  } else if (secretaryCodes.includes(password)) {
    currentUser = { code: 'SECRETAIRE', role: 'secretaire' };
    showPage('secret');
    showTab('secretary');
    toggleChatbot2();
    awaitingSecondCode = false;
    firstCode = null;
    document.querySelector('#secret-entry2').style.display = 'none';
    messages.innerHTML += '<div class="chatbot-message received">Accès à l\'espace secrétaire autorisé.</div>';
  } else {
    messages.innerHTML += '<div class="chatbot-message received">Mot de passe incorrect.</div>';
  }
  messages.scrollTop = messages.scrollHeight;
  document.querySelector('#secret-password2').value = '';
}

document.querySelector('#secret-entry2 button')?.addEventListener('click', enterSecret2);
