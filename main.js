const SUPABASE_URL = 'https://ncbfuuoupskhzgcjgpvq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYmZ1dW91cHNraHpnY2pncHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTMwNDYsImV4cCI6MjA2ODQyOTA0Nn0.3w7BT14mJeXQHBmZPNxbQwnArkk5wxytJ4aTqdYg4C8';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); // Corrigé : 'Supabase' -> 'supabase'

const presidentCode = '0000';
let currentUser = null;
let selectedCallMembers = [];
let secretEntryTimeout = null;

async function initSupabase() {
  try {
    console.log('Supabase client initialized');
    await initRealtime();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Supabase:', error);
  }
}

async function uploadFile(bucket, file, fileName) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
    return publicUrl;
  } catch (error) {
    console.error(`Erreur lors du téléchargement vers ${bucket}:`, error);
    alert(`Erreur lors du téléchargement du fichier dans ${bucket}`);
    return null;
  }
}

async function initRealtime() {
  const tables = ['membres', 'contributions', 'events', 'suggestions', 'gallery', 'messages', 'auto_messages', 'notes', 'internal_docs', 'president_files', 'secretary_files', 'library'];
  tables.forEach(table => {
    supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        if (table === 'membres') {
          updateMembersList();
          updateEditMembersList();
          updateCallMembersList();
          updatePersonalInfo();
          updateStats();
        } else if (table === 'contributions') {
          updateContributionsAdminList();
          updatePersonalInfo();
          updateStats();
        } else if (table === 'events') {
          updateEventsList();
          updateEventsAdminList();
          updateEventCountdowns();
        } else if (table === 'suggestions') {
          updateSuggestionsList();
        } else if (table === 'gallery') {
          updateGalleryContent();
          updateGalleryAdminList();
        } else if (table === 'messages') {
          updateMessagesList();
          updateMessagesAdminList();
          updateMessagePopups();
        } else if (table === 'auto_messages') {
          updateAutoMessagesList();
        } else if (table === 'notes') {
          updateNotesList();
        } else if (table === 'internal_docs') {
          updateInternalDocsList();
        } else if (table === 'president_files') {
          updatePresidentFilesList();
        } else if (table === 'secretary_files') {
          updateSecretaryFilesList();
        } else if (table === 'library') {
          updateLibraryContent();
        }
      })
      .subscribe();
  });
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`#${pageId}`).classList.add('active');
  document.querySelector(`a[onclick="showPage('${pageId}')"]`)?.classList.add('active');
  if (pageId === 'members') updateMembersList();
  if (pageId === 'events') updateEventsList();
  if (pageId === 'gallery') updateGalleryContent();
  if (pageId === 'messages') {
    updateMessagesList();
    // Attacher l'écouteur d'événements pour le formulaire de chat
    const chatForm = document.querySelector('#chat-form');
    if (chatForm) {
      chatForm.removeEventListener('submit', handleChatSubmit); // Éviter les doublons
      chatForm.addEventListener('submit', handleChatSubmit);
    }
  }
  if (pageId === 'coran') updateCoranContent();
  if (pageId === 'personal') {
    document.querySelector('#personal-login').style.display = currentUser && currentUser.role !== 'admin' ? 'none' : 'block';
    document.querySelector('#personal-content').style.display = currentUser && currentUser.role !== 'admin' ? 'block' : 'none';
    if (currentUser && currentUser.role !== 'admin') updatePersonalInfo();
  }
  if (pageId === 'library') updateLibraryContent();
  if (pageId === 'home') updateMessagePopups();
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`#${tabId}`).classList.add('active');
  document.querySelector(`button[onclick="showTab('${tabId}')"]`)?.classList.add('active');
  if (tabId === 'edit-member') updateEditMembersList();
  if (tabId === 'gallery-admin') updateGalleryAdminList();
  if (tabId === 'events-admin') updateEventsAdminList();
  if (tabId === 'messages-admin') updateMessagesAdminList();
  if (tabId === 'notes') updateNotesList();
  if (tabId === 'internal-docs') updateInternalDocsList();
  if (tabId === 'suggestions-admin') updateSuggestionsList();
  if (tabId === 'stats') updateStats();
  if (tabId === 'video-calls') initVideoCall();
  if (tabId === 'auto-messages') updateAutoMessagesList();
  if (tabId === 'treasurer') updateContributionsAdminList();
  if (tabId === 'president') updatePresidentFilesList();
  if (tabId === 'secretary') updateSecretaryFilesList();
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
}

async function updateEventCountdowns() {
  const countdowns = document.getElementById('event-countdowns');
  if (!countdowns) return;
  const { data: events, error } = await supabase.from('events').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return;
  }
  countdowns.innerHTML = events.map(event => {
    const eventDate = new Date(event.datetime);
    const now = new Date();
    const diff = eventDate - now;
    if (diff <= 0 && diff > -30 * 60 * 1000) {
      return `<div id="countdown-${event.name}">Événement ${event.name} : EN COURS</div>`;
    } else if (diff <= -30 * 60 * 1000) {
      return '';
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `<div id="countdown-${event.name}">Événement ${event.name} : JOUR J - ${days}j ${hours}h ${minutes}m ${seconds}s</div>`;
  }).join('');
}

setInterval(updateEventCountdowns, 1000);

document.querySelector('#settings-language')?.addEventListener('change', (e) => {
  // Language change handled in settings
});

function showSecretEntry() {
  const secretEntry = document.querySelector('#secret-entry');
  const chatMessages = document.querySelector('#chat-messages');
  if (secretEntry && chatMessages) {
    secretEntry.style.display = 'block';
    if (secretEntryTimeout) clearTimeout(secretEntryTimeout);
    secretEntryTimeout = setTimeout(() => {
      secretEntry.style.display = 'none';
      chatMessages.innerHTML += '<div class="chat-message received">Le délai pour entrer le second code a expiré.</div>';
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 30000); // Masquer après 30 secondes
  } else {
    console.error('Conteneur #secret-entry ou #chat-messages non trouvé');
    if (chatMessages) {
      chatMessages.innerHTML += '<div class="chat-message received">Erreur : impossible d\'afficher le champ de code secret.</div>';
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
}

async function enterSecret() {
  const password = document.querySelector('#secret-password')?.value;
  const chatMessages = document.querySelector('#chat-messages');
  if (!password || !chatMessages) {
    console.error('Champ de mot de passe ou conteneur de messages non trouvé');
    chatMessages.innerHTML += '<div class="chat-message received">Erreur : veuillez réessayer.</div>';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return;
  }
  const adminCodes = ['JESUISMEMBRE66', '33333333', '44444444', '55555555'];
  const treasurerCodes = ['JESUISTRESORIER444', '66666666', '77777777', '88888888'];
  const presidentSecondCodes = ['99999999', '11112222', '33334444'];
  const secretaryCodes = ['SECRETAIRE000', '55556666', '77778888', '99990000'];

  if (adminCodes.includes(password)) {
    currentUser = { code: 'ADMIN123', role: 'admin' };
    showPage('secret');
  } else if (treasurerCodes.includes(password)) {
    currentUser = { code: 'TRESORIER', role: 'tresorier' };
    showPage('secret');
    showTab('treasurer');
  } else if (presidentSecondCodes.includes(password)) {
    currentUser = { code: 'PRESIDENT', role: 'president' };
    showPage('secret');
    showTab('president');
  } else if (secretaryCodes.includes(password)) {
    currentUser = { code: 'SECRETAIRE', role: 'secretaire' };
    showPage('secret');
    showTab('secretary');
  } else {
    chatMessages.innerHTML += '<div class="chat-message received">Mot de passe incorrect.</div>';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  document.querySelector('#secret-password').value = '';
  document.querySelector('#secret-entry').style.display = 'none';
  if (secretEntryTimeout) clearTimeout(secretEntryTimeout);
}

async function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.querySelector('#chat-input');
  const chatMessages = document.querySelector('#chat-messages');
  const sendButton = document.querySelector('#chat-form button[type="submit"]');
  if (!input || !chatMessages || !sendButton) {
    console.error('Éléments du formulaire de chat non trouvés');
    if (chatMessages) {
      chatMessages.innerHTML += '<div class="chat-message received">Erreur : formulaire de chat non trouvé.</div>';
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    return;
  }
  sendButton.disabled = true; // Désactiver le bouton pendant l'envoi
  const message = input.value.trim();
  if (!message) {
    sendButton.disabled = false;
    return;
  }

  const presidentFirstCodes = ['PRESIDENT00'];
  if (presidentFirstCodes.includes(message)) {
    chatMessages.innerHTML += `<div class="chat-message sent">${message}</div>`;
    chatMessages.innerHTML += '<div class="chat-message received">Veuillez entrer le second code.</div>';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    showSecretEntry();
    input.value = '';
    sendButton.disabled = false;
    return;
  }

  // Enregistrer le message de l'utilisateur
  const userMessage = {
    title: 'Message utilisateur',
    text: message,
    date: new Date().toISOString(),
    user_id: currentUser ? currentUser.code : 'anonymous'
  };
  const { error: userError } = await supabase.from('messages').insert([userMessage]);
  if (userError) {
    console.error('Erreur lors de l\'enregistrement du message:', userError);
    chatMessages.innerHTML += '<div class="chat-message received">Erreur lors de l\'envoi du message.</div>';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    sendButton.disabled = false;
    return;
  }

  // Afficher le message de l'utilisateur
  chatMessages.innerHTML += `<div class="chat-message sent">${message}</div>`;

  // Générer et enregistrer la réponse automatique
  const response = getChatbotResponse(message); // Appel depuis chatbotResponses.js
  const responseMessage = {
    title: 'Réponse automatique',
    text: response,
    date: new Date().toISOString(),
    user_id: 'bot'
  };
  const { error: botError } = await supabase.from('messages').insert([responseMessage]);
  if (botError) {
    console.error('Erreur lors de l\'enregistrement de la réponse automatique:', botError);
    chatMessages.innerHTML += '<div class="chat-message received">Erreur lors de la réception de la réponse.</div>';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    sendButton.disabled = false;
    return;
  }

  // Afficher la réponse automatique
  chatMessages.innerHTML += `<div class="chat-message received">${response}</div>`;
  chatMessages.scrollTop = chatMessages.scrollHeight;
  input.value = '';
  sendButton.disabled = false;
}

async function clearChatHistory() {
  const chatMessages = document.querySelector('#chat-messages');
  if (!chatMessages) return;
  const userId = currentUser ? currentUser.code : 'anonymous';
  const { error } = await supabase.from('messages').delete().eq('user_id', userId);
  if (error) {
    console.error('Erreur lors de la suppression de l\'historique:', error);
    chatMessages.innerHTML += '<div class="chat-message received">Erreur lors de la suppression de l\'historique.</div>';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return;
  }
  chatMessages.innerHTML = '';
}

async function updateMessagesList() {
  const chatMessages = document.querySelector('#chat-messages');
  if (!chatMessages) return;
  const userId = currentUser ? currentUser.code : 'anonymous';
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .in('user_id', [userId, 'bot'])
    .order('date', { ascending: true });
  if (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    chatMessages.innerHTML += '<div class="chat-message received">Erreur lors du chargement des messages.</div>';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return;
  }
  chatMessages.innerHTML = messages.map(m => `
    <div class="chat-message ${m.user_id === 'bot' ? 'received' : 'sent'}">${m.text}</div>
  `).join('');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.querySelector('#personal-login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = document.querySelector('#personal-member-code')?.value;
  const password = document.querySelector('#personal-password')?.value;
  const errorMessage = document.querySelector('#personal-error-message');
  if (!code || !password || !errorMessage) {
    console.error('Personal login form elements not found');
    return;
  }

  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])(19|20)\d\d$/;
  if (!dateRegex.test(password)) {
    errorMessage.textContent = 'Mot de passe invalide (format : JJMMAAAA)';
    errorMessage.style.display = 'block';
    return;
  }

  const { data: member, error } = await supabase
    .from('membres')
    .select('*')
    .eq('code', code)
    .eq('dob', password)
    .single();
  if (error || !member) {
    errorMessage.textContent = 'Numéro de membre ou mot de passe incorrect';
    errorMessage.style.display = 'block';
    return;
  }
  currentUser = member;
  document.querySelector('#personal-title').textContent = `Espace de ${member.firstname} ${member.lastname}`;
  document.querySelector('#personal-login').style.display = 'none';
  document.querySelector('#personal-content').style.display = 'block';
  updatePersonalInfo();
});

function logoutPersonal() {
  currentUser = null;
  document.querySelector('#personal-login').style.display = 'block';
  document.querySelector('#personal-content').style.display = 'none';
  showPage('home');
}

document.querySelector('#add-member-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const { data: members } = await supabase.from('membres').select('code');
  const newCode = `${(members.length + 1).toString().padStart(3, '0')}`;
  const file = document.querySelector('#new-member-photo')?.files[0];
  let photoUrl = 'assets/images/default-photo.png';
  if (file) {
    photoUrl = await uploadFile('membersphotos', file, `${newCode}_${file.name}`);
    if (!photoUrl) return;
  }
  const { data: contributions } = await supabase.from('contributions').select('*').eq('name', 'Mensuelle').single();
  const member = {
    code: newCode,
    firstname: document.querySelector('#new-member-firstname')?.value,
    lastname: document.querySelector('#new-member-lastname')?.value,
    age: parseInt(document.querySelector('#new-member-age')?.value) || null,
    dob: document.querySelector('#new-member-dob')?.value || null,
    birthplace: document.querySelector('#new-member-birthplace')?.value || null,
    photo: photoUrl,
    email: document.querySelector('#new-member-email')?.value || null,
    activity: document.querySelector('#new-member-activity')?.value || null,
    address: document.querySelector('#new-member-address')?.value || null,
    phone: document.querySelector('#new-member-phone')?.value || null,
    residence: document.querySelector('#new-member-residence')?.value || null,
    role: document.querySelector('#new-member-role')?.value || 'membre',
    status: document.querySelector('#new-member-status')?.value || 'actif',
    contributions: { Mensuelle: Object.fromEntries(contributions.years.map(year => [year, Array(12).fill(false)])) }
  };
  const { error } = await supabase.from('membres').insert([member]);
  if (error) {
    console.error('Erreur lors de l\'ajout du membre:', error);
    alert('Erreur lors de l\'ajout du membre');
    return;
  }
  document.querySelector('#add-member-form').reset();
});

document.querySelector('#delete-member-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = document.querySelector('#delete-member-code')?.value;
  if (code !== presidentCode) {
    alert('Code président incorrect');
    return;
  }
  const memberCode = document.querySelector('#delete-member-form').dataset.memberCode;
  const { error } = await supabase.from('membres').delete().eq('code', memberCode);
  if (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    alert('Erreur lors de la suppression du membre');
    return;
  }
  document.querySelector('#delete-member-form').style.display = 'none';
});

document.querySelector('#add-contribution-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const name = document.querySelector('#contribution-name')?.value;
  const amount = parseInt(document.querySelector('#contribution-amount')?.value);
  const currentYear = new Date().getFullYear().toString();
  const { error: contribError } = await supabase.from('contributions').insert([{ name, amount, years: [currentYear] }]);
  if (contribError) {
    console.error('Erreur lors de l\'ajout de la cotisation:', contribError);
    alert('Erreur lors de l\'ajout de la cotisation');
    return;
  }
  const { data: members } = await supabase.from('membres').select('*');
  for (const member of members) {
    if (!member.contributions[name]) {
      member.contributions[name] = { [currentYear]: Array(12).fill(false) };
      await supabase.from('membres').update({ contributions: member.contributions }).eq('code', member.code);
    }
  }
  document.querySelector('#add-contribution-form').reset();
});

document.querySelector('#suggestion-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const text = document.querySelector('#suggestion-text')?.value;
  const { error } = await supabase.from('suggestions').insert([{ member: `${currentUser.firstname} ${currentUser.lastname}`, text }]);
  if (error) {
    console.error('Erreur lors de l\'ajout de la suggestion:', error);
    alert('Erreur lors de l\'ajout de la suggestion');
    return;
  }
  document.querySelector('#suggestion-form').reset();
});

document.querySelector('#add-gallery-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const file = document.querySelector('#gallery-file')?.files[0];
  if (file) {
    const fileUrl = await uploadFile('gallery', file, file.name);
    if (!fileUrl) return;
    const { error } = await supabase.from('gallery').insert([{ type: file.type.startsWith('image') ? 'image' : 'video', url: fileUrl, name: file.name }]);
    if (error) {
      console.error('Erreur lors de l\'ajout au gallery:', error);
      alert('Erreur lors de l\'ajout au gallery');
      return;
    }
    document.querySelector('#add-gallery-form').reset();
  }
});

document.querySelector('#add-event-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const file = document.querySelector('#event-file')?.files[0];
  let imageUrl = '';
  if (file) {
    imageUrl = await uploadFile('eventsimages', file, file.name);
    if (!imageUrl) return;
  }
  const event = {
    name: document.querySelector('#event-name')?.value,
    description: document.querySelector('#event-description')?.value,
    datetime: new Date(`${document.querySelector('#event-date')?.value}T${document.querySelector('#event-time')?.value}`).toISOString(),
    image: imageUrl
  };
  const { error } = await supabase.from('events').insert([event]);
  if (error) {
    console.error('Erreur lors de l\'ajout de l\'événement:', error);
    alert('Erreur lors de l\'ajout de l\'événement');
    return;
  }
  document.querySelector('#add-event-form').reset();
});

document.querySelector('#add-message-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const message = {
    title: document.querySelector('#message-title')?.value,
    text: document.querySelector('#message-text')?.value,
    date: new Date().toISOString(),
    user_id: 'admin'
  };
  const { error } = await supabase.from('messages').insert([message]);
  if (error) {
    console.error('Erreur lors de l\'ajout du message:', error);
    alert('Erreur lors de l\'ajout du message');
    return;
  }
  document.querySelector('#add-message-form').reset();
  sendNotification('Nouveau message', `${message.title}: ${message.text}`);
});

document.querySelector('#add-auto-message-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const autoMessage = {
    name: document.querySelector('#auto-message-name')?.value,
    text: document.querySelector('#auto-message-text')?.value,
    datetime: new Date(`${document.querySelector('#auto-message-date')?.value}T${document.querySelector('#auto-message-time')?.value}`).toISOString()
  };
  const { error } = await supabase.from('auto_messages').insert([autoMessage]);
  if (error) {
    console.error('Erreur lors de l\'ajout du message automatisé:', error);
    alert('Erreur lors de l\'ajout du message automatisé');
    return;
  }
  document.querySelector('#add-auto-message-form').reset();
});

document.querySelector('#add-note-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const note = {
    theme: document.querySelector('#note-theme')?.value,
    text: document.querySelector('#note-text')?.value
  };
  const { error } = await supabase.from('notes').insert([note]);
  if (error) {
    console.error('Erreur lors de l\'ajout de la note:', error);
    alert('Erreur lors de l\'ajout de la note');
    return;
  }
  document.querySelector('#add-note-form').reset();
});

document.querySelector('#add-internal-doc-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const file = document.querySelector('#internal-doc')?.files[0];
  if (file) {
    const fileUrl = await uploadFile('internaldocs', file, file.name);
    if (!fileUrl) return;
    const { error } = await supabase.from('internal_docs').insert([{ name: file.name, url: fileUrl, category: document.querySelector('#internal-doc-category')?.value }]);
    if (error) {
      console.error('Erreur lors de l\'ajout du document interne:', error);
      alert('Erreur lors de l\'ajout du document interne');
      return;
    }
    document.querySelector('#add-internal-doc-form').reset();
  }
});

document.querySelector('#add-president-file-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'president') return;
  const file = document.querySelector('#president-file')?.files[0];
  if (file) {
    const fileUrl = await uploadFile('presidentfiles', file, file.name);
    if (!fileUrl) return;
    const { error } = await supabase.from('president_files').insert([{ name: file.name, url: fileUrl, category: document.querySelector('#president-file-category')?.value }]);
    if (error) {
      console.error('Erreur lors de l\'ajout du fichier présidentiel:', error);
      alert('Erreur lors de l\'ajout du fichier présidentiel');
      return;
    }
    document.querySelector('#add-president-file-form').reset();
  }
});

document.querySelector('#add-secretary-file-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'secretaire') return;
  const file = document.querySelector('#secretary-file')?.files[0];
  if (file) {
    const fileUrl = await uploadFile('secretaryfiles', file, file.name);
    if (!fileUrl) return;
    const { error } = await supabase.from('secretary_files').insert([{ name: file.name, url: fileUrl, category: document.querySelector('#secretary-file-category')?.value }]);
    if (error) {
      console.error('Erreur lors de l\'ajout du fichier secrétaire:', error);
      alert('Erreur lors de l\'ajout du fichier secrétaire');
      return;
    }
    document.querySelector('#add-secretary-file-form').reset();
  }
});

async function updateMembersList() {
  const search = document.querySelector('#members-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#members-list');
  if (!list) return;
  const { data: members, error } = await supabase.from('membres').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    return;
  }
  list.innerHTML = members
    .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
    .map(m => `
      <div class="member-card">
        <p><strong>${m.firstname} ${m.lastname}</strong></p>
        <p><strong>Numéro :</strong> ${m.code}</p>
      </div>
    `).join('');
}

async function updateContributionsAdminList() {
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const search = document.querySelector('#contributions-admin-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#contributions-admin-list');
  if (!list) return;
  const { data: contributions, error: contribError } = await supabase.from('contributions').select('*');
  const { data: members, error: memberError } = await supabase.from('membres').select('*');
  if (contribError || memberError) {
    console.error('Erreur lors de la récupération des cotisations ou membres:', contribError || memberError);
    return;
  }
  list.innerHTML = contributions
    .filter(c => c.name.toLowerCase().includes(search))
    .map(c => `
      <div class="contribution-card">
        <h4>${c.name} (${c.amount} FCFA)</h4>
        ${members.map(m => `
          <div>
            <p>${m.firstname} ${m.lastname}</p>
            ${c.years.map(year => `
              <h5>${year}</h5>
              ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((month, i) => `
                <input type="checkbox" ${m.contributions[c.name][year][i] ? 'checked' : ''} onchange="updateMonthlyPayment('${m.code}', '${c.name}', '${year}', ${i}, this.checked)">
                <label>${month}</label>
              `).join('')}
              <p>Payé: ${m.contributions[c.name][year].map((p, i) => p ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][i] : '').filter(Boolean).join(', ')}</p>
              <p>Non payé: ${m.contributions[c.name][year].map((p, i) => !p ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][i] : '').filter(Boolean).join(', ')}</p>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `).join('');
}

async function updateMonthlyPayment(memberCode, contributionName, year, monthIndex, paid) {
  const { data: member, error: memberError } = await supabase.from('membres').select('contributions').eq('code', memberCode).single();
  if (memberError) {
    console.error('Erreur lors de la récupération du membre:', memberError);
    return;
  }
  member.contributions[contributionName][year][monthIndex] = paid;
  const { error: updateError } = await supabase.from('membres').update({ contributions: member.contributions }).eq('code', memberCode);
  if (updateError) {
    console.error('Erreur lors de la mise à jour des cotisations:', updateError);
    alert('Erreur lors de la mise à jour des cotisations');
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  updateEventCountdowns();
});
