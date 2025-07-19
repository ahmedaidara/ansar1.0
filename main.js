const SUPABASE_URL = 'https://ncbfuuoupskhzgcjgpvq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYmZ1dW91cHNraHpnY2pncHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTMwNDYsImV4cCI6MjA2ODQyOTA0Nn0.3w7BT14mJeXQHBmZPNxbQwnArkk5wxytJ4aTqdYg4C8';

let supabase = null;

try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Supabase client initialized');
} catch (error) {
  console.error('Erreur lors de la création du client Supabase:', error);
  alert('Erreur : Impossible de se connecter à Supabase. Vérifiez votre connexion réseau.');
}

const presidentCode = '0000';
let currentUser = null;
let isChatOpen = false;
let selectedCallMembers = [];

async function initSupabase() {
  if (!supabase) {
    console.error('Supabase client not initialized');
    alert('Erreur : Client Supabase non initialisé');
    return;
  }
  try {
    console.log('Initializing Supabase subscriptions');
    await initRealtime();
    const { data: contributions } = await supabase.from('contributions').select('*').eq('name', 'Mensuelle').single();
    if (!contributions) {
      await supabase.from('contributions').insert([
        { name: 'Mensuelle', amount: 2000, years: ['2023', '2024', '2025'] }
      ]);
      console.log('Cotisation Mensuelle créée par défaut');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Supabase:', error);
    alert('Erreur lors de l\'initialisation de la base de données');
  }
}

async function uploadFile(bucket, file, fileName) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    alert('Erreur : Client Supabase non initialisé');
    return null;
  }
  try {
    const uniqueFileName = `${Date.now()}_${fileName}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, file, { upsert: true });
    if (error) throw error;
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
    return publicUrl;
  } catch (error) {
    console.error(`Erreur lors du téléchargement vers ${bucket}:`, error);
    alert(`Erreur lors du téléchargement du fichier dans ${bucket}: ${error.message}`);
    return null;
  }
}

async function initRealtime() {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return;
  }
  const tables = ['membres', 'contributions', 'events', 'suggestions', 'gallery', 'messages', 'auto_messages', 'notes', 'internal_docs', 'president_files', 'secretary_files', 'library'];
  tables.forEach(table => {
    supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, payload => {
        console.log(`Nouveau ${table}:`, payload.new);
        updateTable(table);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table }, payload => {
        console.log(`Mise à jour ${table}:`, payload.new);
        updateTable(table);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table }, payload => {
        console.log(`Suppression ${table}:`, payload.old);
        updateTable(table);
      })
      .subscribe();
  });
}

function updateTable(table) {
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
    checkAutoMessages();
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
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const page = document.querySelector(`#${pageId}`);
  if (!page) return;
  page.classList.add('active');
  document.querySelector(`a[onclick="showPage('${pageId}')"]`)?.classList.add('active');
  if (pageId === 'members') updateMembersList();
  if (pageId === 'events') updateEventsList();
  if (pageId === 'gallery') updateGalleryContent();
  if (pageId === 'messages') updateMessagesList();
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
  const tab = document.querySelector(`#${tabId}`);
  if (!tab) return;
  tab.classList.add('active');
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
  if (!supabase) return;
  const countdowns = document.querySelector('#event-countdowns');
  if (!countdowns) return;
  try {
    const { data: events, error } = await supabase.from('events').select('*');
    if (error) throw error;
    countdowns.innerHTML = events.map(event => {
      const eventDate = new Date(event.datetime);
      const now = new Date();
      const diff = eventDate - now;
      if (diff <= 0 && diff > -30 * 60 * 1000) {
        return `<div id="countdown-${event.id}">Événement ${event.name} : EN COURS</div>`;
      } else if (diff <= -30 * 60 * 1000) {
        return '';
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return `<div id="countdown-${event.id}">Événement ${event.name} : JOUR J - ${days}j ${hours}h ${minutes}m ${seconds}s</div>`;
    }).join('');
  } catch (error) {
    console.error('Erreur dans updateEventCountdowns:', error);
  }
}

setInterval(() => {
  if (supabase) {
    updateEventCountdowns();
  }
}, 1000);

document.querySelector('#settings-language')?.addEventListener('change', (e) => {
  // Language change handled in settings
});

function toggleChatbot() {
  isChatOpen = !isChatOpen;
  const chatbot = document.querySelector('#chatbot');
  if (chatbot) {
    chatbot.style.display = isChatOpen ? 'block' : 'none';
    if (isChatOpen) {
      const messages = document.querySelector('#chatbot-messages');
      if (messages) {
        messages.innerHTML = '<div class="chatbot-message received">Bienvenue ! Posez une question ou utilisez un mot-clé comme "association", "membre", "cotisation", etc.</div>';
        messages.scrollTop = messages.scrollHeight;
      }
    }
  }
}

const chatbotButton = document.querySelector('.chatbot-button');
if (chatbotButton) {
  chatbotButton.addEventListener('click', toggleChatbot);
}

const chatbotForm = document.querySelector('#chatbot-form');
if (chatbotForm) {
  chatbotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.querySelector('#chatbot-input');
    const message = input.value.trim();
    if (!message) return;
    const messages = document.querySelector('#chatbot-messages');
    if (messages) {
      messages.innerHTML += `<div class="chatbot-message sent">${message}</div>`;
      const secretCodes = ['ADMIN12301012000', '00000000', '11111111', '22222222'];
      if (secretCodes.includes(message)) {
        const secretEntry = document.querySelector('#secret-entry');
        if (secretEntry) {
          secretEntry.style.display = 'block';
        }
      } else {
        const response = getChatbotResponse(message);
        messages.innerHTML += `<div class="chatbot-message received">${response}</div>`;
      }
      input.value = '';
      messages.scrollTop = messages.scrollHeight;
    }
  });
}

function getChatbotResponse(message) {
  const responses = {
    'association': 'Notre association travaille pour le bien-être de la communauté.',
    'membre': 'Pour devenir membre, veuillez contacter un administrateur.',
    'cotisation': 'Les cotisations sont gérées par le trésorier. Consultez l\'onglet Cotisations.',
    'default': 'Je ne comprends pas votre demande. Essayez des mots-clés comme "association", "membre", ou "cotisation".'
  };
  const key = Object.keys(responses).find(k => message.toLowerCase().includes(k)) || 'default';
  return responses[key];
}

function enterSecret() {
  const password = document.querySelector('#secret-password')?.value;
  if (!password) return;
  const adminCodes = ['JESUISMEMBRE66', '33333333', '44444444', '55555555'];
  const treasurerCodes = ['JESUISTRESORIER444', '66666666', '77777777', '88888888'];
  const presidentCodes = ['PRESIDENT000', '99999999', '11112222', '33334444'];
  const secretaryCodes = ['SECRETAIRE000', '55556666', '77778888', '99990000'];
  const messages = document.querySelector('#chatbot-messages');
  if (adminCodes.includes(password)) {
    currentUser = { code: 'ADMIN123', role: 'admin' };
    showPage('secret');
    toggleChatbot();
  } else if (treasurerCodes.includes(password)) {
    currentUser = { code: 'TRESORIER', role: 'tresorier' };
    showPage('secret');
    showTab('treasurer');
    toggleChatbot();
  } else if (presidentCodes.includes(password)) {
    currentUser = { code: 'PRESIDENT', role: 'president' };
    showPage('secret');
    showTab('president');
    toggleChatbot();
  } else if (secretaryCodes.includes(password)) {
    currentUser = { code: 'SECRETAIRE', role: 'secretaire' };
    showPage('secret');
    showTab('secretary');
    toggleChatbot();
  } else if (messages) {
    messages.innerHTML += '<div class="chatbot-message received">Mot de passe incorrect.</div>';
    messages.scrollTop = messages.scrollHeight;
  }
}

document.querySelector('#personal-login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase) {
    alert('Erreur : Client Supabase non initialisé');
    return;
  }
  const code = document.querySelector('#personal-member-code')?.value;
  const password = document.querySelector('#personal-password')?.value;
  const errorMessage = document.querySelector('#personal-error-message');
  if (!code || !password || !errorMessage) return;

  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])(19|20)\d\d$/;
  if (!dateRegex.test(password)) {
    errorMessage.textContent = 'Mot de passe invalide (format : JJMMAAAA)';
    errorMessage.style.display = 'block';
    return;
  }

  try {
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
  } catch (error) {
    console.error('Erreur lors de la connexion personnelle:', error);
    errorMessage.textContent = 'Une erreur est survenue';
    errorMessage.style.display = 'block';
  }
});

function logoutPersonal() {
  currentUser = null;
  document.querySelector('#personal-login').style.display = 'block';
  document.querySelector('#personal-content').style.display = 'none';
  showPage('home');
}

document.querySelector('#add-member-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
    const { data: members } = await supabase.from('membres').select('code');
    const newCode = `${(Math.max(...members.map(m => parseInt(m.code) || 0)) + 1).toString().padStart(3, '0')}`;
    const file = document.querySelector('#new-member-photo')?.files[0];
    let photoUrl = 'assets/images/default-photo.png';
    
    if (file) {
      photoUrl = await uploadFile('membersphotos', file, `${newCode}_${file.name}`);
      if (!photoUrl) return;
    }
    
    const { data: contributions } = await supabase.from('contributions').select('*').eq('name', 'Mensuelle').single();
    if (!contributions) {
      alert('Erreur : Cotisation Mensuelle non trouvée');
      return;
    }
    
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
    if (error) throw error;
    
    document.querySelector('#add-member-form').reset();
    alert('Membre ajouté avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout du membre:', error);
    alert('Erreur lors de l\'ajout du membre: ' + error.message);
  }
});

document.querySelector('#delete-member-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase) {
    alert('Erreur : Client Supabase non initialisé');
    return;
  }
  
  const code = document.querySelector('#delete-member-code')?.value;
  if (code !== presidentCode) {
    alert('Code président incorrect');
    return;
  }
  
  const memberCode = document.querySelector('#delete-member-form').dataset.memberCode;
  try {
    const { error } = await supabase.from('membres').delete().eq('code', memberCode);
    if (error) throw error;
    document.querySelector('#delete-member-form').style.display = 'none';
    alert('Membre supprimé avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    alert('Erreur lors de la suppression du membre: ' + error.message);
  }
});

document.querySelector('#add-contribution-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase || !currentUser || currentUser.role !== 'tresorier') {
    alert('Accès réservé au trésorier');
    return;
  }
  
  try {
    const name = document.querySelector('#contribution-name')?.value;
    const amount = parseInt(document.querySelector('#contribution-amount')?.value);
    const currentYear = new Date().getFullYear().toString();
    
    const { error: contribError } = await supabase.from('contributions').insert([{ name, amount, years: [currentYear] }]);
    if (contribError) throw contribError;
    
    const { data: members } = await supabase.from('membres').select('*');
    for (const member of members) {
      if (!member.contributions[name]) {
        member.contributions[name] = { [currentYear]: Array(12).fill(false) };
        await supabase.from('membres').update({ contributions: member.contributions }).eq('code', member.code);
      }
    }
    document.querySelector('#add-contribution-form').reset();
    alert('Cotisation ajoutée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la cotisation:', error);
    alert('Erreur lors de l\'ajout de la cotisation: ' + error.message);
  }
});

document.querySelector('#suggestion-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase || !currentUser) {
    alert('Vous devez être connecté pour soumettre une suggestion');
    return;
  }
  
  try {
    const text = document.querySelector('#suggestion-text')?.value;
    const { error } = await supabase.from('suggestions').insert([{ member: `${currentUser.firstname} ${currentUser.lastname}`, text }]);
    if (error) throw error;
    document.querySelector('#suggestion-form').reset();
    alert('Suggestion envoyée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la suggestion:', error);
    alert('Erreur lors de l\'ajout de la suggestion: ' + error.message);
  }
});

document.querySelector('#add-gallery-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
    const file = document.querySelector('#gallery-file')?.files[0];
    if (!file) {
      alert('Veuillez sélectionner un fichier');
      return;
    }
    const fileUrl = await uploadFile('gallery', file, file.name);
    if (!fileUrl) return;
    
    const { error } = await supabase.from('gallery').insert([{ type: file.type.startsWith('image') ? 'image' : 'video', url: fileUrl, name: file.name }]);
    if (error) throw error;
    
    document.querySelector('#add-gallery-form').reset();
    alert('Média ajouté à la galerie avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout au gallery:', error);
    alert('Erreur lors de l\'ajout au gallery: ' + error.message);
  }
});

document.querySelector('#add-event-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
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
    if (error) throw error;
    
    document.querySelector('#add-event-form').reset();
    alert('Événement ajouté avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'événement:', error);
    alert('Erreur lors de l\'ajout de l\'événement: ' + error.message);
  }
});

document.querySelector('#add-message-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
    const message = {
      title: document.querySelector('#message-title')?.value,
      text: document.querySelector('#message-text')?.value,
      date: new Date().toISOString()
    };
    
    const { error } = await supabase.from('messages').insert([message]);
    if (error) throw error;
    
    document.querySelector('#add-message-form').reset();
    sendNotification('Nouveau message', `${message.title}: ${message.text}`);
    alert('Message envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout du message:', error);
    alert('Erreur lors de l\'ajout du message: ' + error.message);
  }
});

document.querySelector('#add-auto-message-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
    const autoMessage = {
      name: document.querySelector('#auto-message-name')?.value,
      text: document.querySelector('#auto-message-text')?.value,
      datetime: new Date(`${document.querySelector('#auto-message-date')?.value}T${document.querySelector('#auto-message-time')?.value}`).toISOString()
    };
    
    const { error } = await supabase.from('auto_messages').insert([autoMessage]);
    if (error) throw error;
    
    document.querySelector('#add-auto-message-form').reset();
    alert('Message automatisé ajouté avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout du message automatisé:', error);
    alert('Erreur lors de l\'ajout du message automatisé: ' + error.message);
  }
});

document.querySelector('#add-note-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
    const note = {
      theme: document.querySelector('#note-theme')?.value,
      text: document.querySelector('#note-text')?.value
    };
    
    const { error } = await supabase.from('notes').insert([note]);
    if (error) throw error;
    
    document.querySelector('#add-note-form').reset();
    alert('Note ajoutée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la note:', error);
    alert('Erreur lors de l\'ajout de la note: ' + error.message);
  }
});

document.querySelector('#add-internal-doc-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
    const file = document.querySelector('#internal-doc')?.files[0];
    if (!file) {
      alert('Veuillez sélectionner un fichier');
      return;
    }
    const fileUrl = await uploadFile('internaldocs', file, file.name);
    if (!fileUrl) return;
    
    const { error } = await supabase.from('internal_docs').insert([{ 
      name: file.name, 
      url: fileUrl, 
      category: document.querySelector('#internal-doc-category')?.value 
    }]);
    if (error) throw error;
    
    document.querySelector('#add-internal-doc-form').reset();
    alert('Document interne ajouté avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout du document interne:', error);
    alert('Erreur lors de l\'ajout du document interne: ' + error.message);
  }
});

document.querySelector('#add-president-file-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase || !currentUser || currentUser.role !== 'president') {
    alert('Accès réservé au président');
    return;
  }
  
  try {
    const file = document.querySelector('#president-file')?.files[0];
    if (!file) {
      alert('Veuillez sélectionner un fichier');
      return;
    }
    const fileUrl = await uploadFile('presidentfiles', file, file.name);
    if (!fileUrl) return;
    
    const { error } = await supabase.from('president_files').insert([{ 
      name: file.name, 
      url: fileUrl, 
      category: document.querySelector('#president-file-category')?.value 
    }]);
    if (error) throw error;
    
    document.querySelector('#add-president-file-form').reset();
    alert('Fichier présidentiel ajouté avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout du fichier présidentiel:', error);
    alert('Erreur lors de l\'ajout du fichier présidentiel: ' + error.message);
  }
});

document.querySelector('#add-secretary-file-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase || !currentUser || currentUser.role !== 'secretaire') {
    alert('Accès réservé au secrétaire');
    return;
  }
  
  try {
    const file = document.querySelector('#secretary-file')?.files[0];
    if (!file) {
      alert('Veuillez sélectionner un fichier');
      return;
    }
    const fileUrl = await uploadFile('secretaryfiles', file, file.name);
    if (!fileUrl) return;
    
    const { error } = await supabase.from('secretary_files').insert([{ 
      name: file.name, 
      url: fileUrl, 
      category: document.querySelector('#secretary-file-category')?.value 
    }]);
    if (error) throw error;
    
    document.querySelector('#add-secretary-file-form').reset();
    alert('Fichier secrétaire ajouté avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout du fichier secrétaire:', error);
    alert('Erreur lors de l\'ajout du fichier secrétaire: ' + error.message);
  }
});

async function updateMembersList() {
  if (!supabase) return;
  const search = document.querySelector('#members-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#members-list');
  if (!list) return;
  
  try {
    const { data: members, error } = await supabase.from('membres').select('*');
    if (error) throw error;
    
    list.innerHTML = members
      .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
      .map(m => `
        <div class="member-card">
          <img src="${m.photo}" alt="${m.firstname} ${m.lastname}" style="width: 50px; border-radius: 50%;">
          <p><strong>${m.firstname} ${m.lastname}</strong></p>
          <p><strong>Numéro :</strong> ${m.code}</p>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateMembersList:', error);
    alert('Erreur lors de la récupération des membres');
  }
}

async function updateContributionsAdminList() {
  if (!supabase || !currentUser || currentUser.role !== 'tresorier') return;
  
  const search = document.querySelector('#contributions-admin-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#contributions-admin-list');
  if (!list) return;
  
  try {
    const { data: contributions, error: contribError } = await supabase.from('contributions').select('*');
    const { data: members, error: memberError } = await supabase.from('membres').select('*');
    if (contribError || memberError) throw contribError || memberError;
    
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
                  <input type="checkbox" ${m.contributions[c.name]?.[year]?.[i] ? 'checked' : ''} onchange="updateMonthlyPayment('${m.code}', '${c.name}', '${year}', ${i}, this.checked)">
                  <label>${month}</label>
                `).join('')}
                <p>Payé: ${m.contributions[c.name]?.[year]?.map((p, i) => p ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][i] : '').filter(Boolean).join(', ') || 'Aucun'}</p>
                <p>Non payé: ${m.contributions[c.name]?.[year]?.map((p, i) => !p ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][i] : '').filter(Boolean).join(', ') || 'Aucun'}</p>
              `).join('')}
            </div>
          `).join('')}
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateContributionsAdminList:', error);
    alert('Erreur lors de la récupération des cotisations');
  }
}

async function updateMonthlyPayment(memberCode, contributionName, year, monthIndex, paid) {
  if (!supabase || !currentUser || currentUser.role !== 'tresorier') {
    alert('Accès réservé au trésorier');
    return;
  }
  
  try {
    const { data: member, error } = await supabase.from('membres').select('*').eq('code', memberCode).single();
    if (error) throw error;
    
    if (!member.contributions[contributionName]) {
      member.contributions[contributionName] = { [year]: Array(12).fill(false) };
    }
    member.contributions[contributionName][year][monthIndex] = paid;
    const { error: updateError } = await supabase.from('membres').update({ contributions: member.contributions }).eq('code', memberCode);
    if (updateError) throw updateError;
    
    sendNotification('Mise à jour cotisation', `Cotisation ${contributionName} pour ${member.firstname} ${member.lastname} (${year}, ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][monthIndex]}) marquée comme ${paid ? 'payée' : 'non payée'}.`);
  } catch (error) {
    console.error('Erreur dans updateMonthlyPayment:', error);
    alert('Erreur lors de la mise à jour de la cotisation: ' + error.message);
  }
}

async function updateEditMembersList() {
  if (!supabase) return;
  const search = document.querySelector('#edit-member-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#edit-members-list');
  if (!list) return;
  
  try {
    const { data: members, error } = await supabase.from('membres').select('*');
    if (error) throw error;
    
    list.innerHTML = members
      .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
      .map(m => `
        <div class="member-card">
          <p><strong>Prénom :</strong> ${m.firstname}</p>
          <p><strong>Nom :</strong> ${m.lastname}</p>
          <button class="cta-button" onclick="editMember('${m.code}')">Modifier</button>
          <button class="cta-button" onclick="deleteMember('${m.code}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateEditMembersList:', error);
    alert('Erreur lors de la récupération des membres pour modification');
  }
}

async function editMember(code) {
  if (!supabase) return;
  
  try {
    const { data: member, error } = await supabase.from('membres').select('*').eq('code', code).single();
    if (error) throw error;
    
    document.querySelector('#new-member-firstname').value = member.firstname;
    document.querySelector('#new-member-lastname').value = member.lastname;
    document.querySelector('#new-member-age').value = member.age || '';
    document.querySelector('#new-member-dob').value = member.dob || '';
    document.querySelector('#new-member-birthplace').value = member.birthplace || '';
    document.querySelector('#new-member-email').value = member.email || '';
    document.querySelector('#new-member-activity').value = member.activity || '';
    document.querySelector('#new-member-address').value = member.address || '';
    document.querySelector('#new-member-phone').value = member.phone || '';
    document.querySelector('#new-member-residence').value = member.residence || '';
    document.querySelector('#new-member-role③



').value = member.role;
    document.querySelector('#new-member-status').value = member.status;
    
    const form = document.querySelector('#add-member-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        const file = document.querySelector('#new-member-photo')?.files[0];
        let photoUrl = member.photo;
        if (file) {
          photoUrl = await uploadFile('membersphotos', file, `${code}_${file.name}`);
          if (!photoUrl) return;
        }
        
        const updatedMember = {
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
          status: document.querySelector('#new-member-status')?.value || 'actif'
        };
        
        const { error } = await supabase.from('membres').update(updatedMember).eq('code', code);
        if (error) throw error;
        form.reset();
        form.onsubmit = null;
        showTab('edit-member');
        alert('Membre mis à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du membre:', error);
        alert('Erreur lors de la mise à jour du membre: ' + error.message);
      }
    };
    
    showTab('add-member');
  } catch (error) {
    console.error('Erreur dans editMember:', error);
    alert('Erreur lors de la récupération du membre pour modification');
  }
}

function deleteMember(code) {
  if (!currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  document.querySelector('#delete-member-form').dataset.memberCode = code;
  document.querySelector('#delete-member-form').style.display = 'block';
}

async function updateEventsList() {
  if (!supabase) return;
  const search = document.querySelector('#events-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#events-list');
  if (!list) return;
  
  try {
    const { data: events, error } = await supabase.from('events').select('*');
    if (error) throw error;
    
    list.innerHTML = events
      .filter(e => e.name.toLowerCase().includes(search) || e.description.toLowerCase().includes(search))
      .map(e => `
        <div class="event-card">
          <h4>${e.name}</h4>
          <p>${e.description}</p>
          <p>Date: ${new Date(e.datetime).toLocaleString()}</p>
          ${e.image ? `<img src="${e.image}" alt="${e.name}" style="max-width: 100%; border-radius: 10px;">` : ''}
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateEventsList:', error);
    alert('Erreur lors de la récupération des événements');
  }
}

async function updateEventsAdminList() {
  if (!supabase) return;
  const search = document.querySelector('#events-admin-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#events-admin-list');
  if (!list) return;
  
  try {
    const { data: events, error } = await supabase.from('events').select('*');
    if (error) throw error;
    
    list.innerHTML = events
      .filter(e => e.name.toLowerCase().includes(search) || e.description.toLowerCase().includes(search))
      .map(e => `
        <div class="event-card">
          <h4>${e.name}</h4>
          <p>${e.description}</p>
          <p>Date: ${new Date(e.datetime).toLocaleString()}</p>
          ${e.image ? `<img src="${e.image}" alt="${e.name}" style="max-width: 100%; border-radius: 10px;">` : ''}
          <button class="cta-button" onclick="deleteEvent('${e.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateEventsAdminList:', error);
    alert('Erreur lors de la récupération des événements pour administration');
  }
}

async function deleteEvent(id) {
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
    alert('Événement supprimé avec succès');
  } catch (error) {
    console.error('Erreur dans deleteEvent:', error);
    alert('Erreur lors de la suppression de l\'événement: ' + error.message);
  }
}

async function updateGalleryContent() {
  if (!supabase) return;
  const list = document.querySelector('#gallery-content');
  if (!list) return;
  try {
    const { data: gallery, error } = await supabase.from('gallery').select('*');
    if (error) throw error;
    list.innerHTML = gallery.map(item => `
      <div class="gallery-item">
        ${item.type === 'image' ? `<img src="${item.url}" alt="${item.name}">` : 
          `<video src="${item.url}" controls></video>`}
        <p>${item.name}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur dans updateGalleryContent:', error);
    alert('Erreur lors de la récupération de la galerie');
  }
}

async function updateGalleryAdminList() {
  if (!supabase) return;
  const search = document.querySelector('#gallery-admin-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#gallery-admin-list');
  if (!list) return;
  
  try {
    const { data: gallery, error } = await supabase.from('gallery').select('*');
    if (error) throw error;
    
    list.innerHTML = gallery
      .filter(g => g.name.toLowerCase().includes(search))
      .map(g => `
        <div>
          ${g.type === 'image' ? `<img src="${g.url}" alt="${g.name}" style="max-width: 100%; border-radius: 10px;">` : 
            `<video src="${g.url}" controls style="max-width: 100%; border-radius: 10px;"></video>`}
          <p>${g.name}</p>
          <button class="cta-button" onclick="deleteGalleryItem('${g.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateGalleryAdminList:', error);
    alert('Erreur lors de la récupération de la galerie pour administration');
  }
}

async function deleteGalleryItem(id) {
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) throw error;
    alert('Média supprimé de la galerie avec succès');
  } catch (error) {
    console.error('Erreur dans deleteGalleryItem:', error);
    alert('Erreur lors de la suppression de l\'élément de la galerie: ' + error.message);
  }
}

async function updateMessagesList() {
  if (!supabase) return;
  const list = document.querySelector('#messages-list');
  if (!list) return;
  try {
    const { data: messages, error } = await supabase.from('messages').select('*');
    if (error) throw error;
    list.innerHTML = messages.map(m => `
      <div class="message-card">
        <h4>${m.title}</h4>
        <p>${m.text}</p>
        <p><small>${new Date(m.date).toLocaleString()}</small></p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur dans updateMessagesList:', error);
    alert('Erreur lors de la récupération des messages');
  }
}

async function updateMessagesAdminList() {
  if (!supabase) return;
  const search = document.querySelector('#messages-admin-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#messages-admin-list');
  if (!list) return;
  
  try {
    const { data: messages, error } = await supabase.from('messages').select('*');
    if (error) throw error;
    
    list.innerHTML = messages
      .filter(m => m.title.toLowerCase().includes(search) || m.text.toLowerCase().includes(search))
      .map(m => `
        <div class="message-card">
          <h4>${m.title}</h4>
          <p>${m.text}</p>
          <p><small>${new Date(m.date).toLocaleString()}</small></p>
          <button class="cta-button" onclick="deleteMessage('${m.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateMessagesAdminList:', error);
    alert('Erreur lors de la récupération des messages pour administration');
  }
}

async function deleteMessage(id) {
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw error;
    alert('Message supprimé avec succès');
  } catch (error) {
    console.error('Erreur dans deleteMessage:', error);
    alert('Erreur lors de la suppression du message: ' + error.message);
  }
}

async function updateMessagePopups() {
  if (!supabase) return;
  const popups = document.querySelector('#message-popups');
  if (!popups) return;
  
  try {
    const { data: messages, error } = await supabase.from('messages').select('*');
    if (error) throw error;
    
    popups.innerHTML = messages
      .map(m => `
        <div class="message-popup">
          <h4>${m.title}</h4>
          <p>${m.text}</p>
          <button class="close-button" onclick="deleteMessage('${m.id}')"><span class="material-icons">close</span></button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateMessagePopups:', error);
    alert('Erreur lors de la récupération des popups de messages');
  }
}

async function checkAutoMessages() {
  if (!supabase) return;
  try {
    const { data: autoMessages, error } = await supabase.from('auto_messages').select('*');
    if (error) throw error;
    
    const now = new Date();
    for (const msg of autoMessages) {
      const msgDate = new Date(msg.datetime);
      if (now >= msgDate && now < new Date(msgDate.getTime() + 5 * 60 * 1000)) {
        await supabase.from('messages').insert([{ title: msg.name, text: msg.text, date: now.toISOString() }]);
        await supabase.from('auto_messages').delete().eq('id', msg.id);
        sendNotification(msg.name, msg.text);
      }
    }
  } catch (error) {
    console.error('Erreur dans checkAutoMessages:', error);
  }
}

async function updateAutoMessagesList() {
  if (!supabase) return;
  const search = document.querySelector('#auto-messages-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#auto-messages-list');
  if (!list) return;
  
  try {
    const { data: autoMessages, error } = await supabase.from('auto_messages').select('*');
    if (error) throw error;
    
    list.innerHTML = autoMessages
      .filter(m => m.name.toLowerCase().includes(search) || m.text.toLowerCase().includes(search))
      .map(m => `
        <div class="message-card">
          <h4>${m.name}</h4>
          <p>${m.text}</p>
          <p>Date: ${new Date(m.datetime).toLocaleString()}</p>
          <button class="cta-button" onclick="deleteAutoMessage('${m.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateAutoMessagesList:', error);
    alert('Erreur lors de la récupération des messages automatisés');
  }
}

async function deleteAutoMessage(id) {
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
    const { error } = await supabase.from('auto_messages').delete().eq('id', id);
    if (error) throw error;
    alert('Message automatisé supprimé avec succès');
  } catch (error) {
    console.error('Erreur dans deleteAutoMessage:', error);
    alert('Erreur lors de la suppression du message automatisé: ' + error.message);
  }
}

async function updateNotesList() {
  if (!supabase) return;
  const search = document.querySelector('#notes-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#notes-list');
  if (!list) return;
  
  try {
    const { data: notes, error } = await supabase.from('notes').select('*');
    if (error) throw error;
    
    list.innerHTML = notes
      .filter(n => n.theme.toLowerCase().includes(search) || n.text.toLowerCase().includes(search))
      .map(n => `
        <div class="note-card">
          <p><strong>${n.theme}</strong>: ${n.text}</p>
          <button class="cta-button" onclick="deleteNote('${n.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateNotesList:', error);
    alert('Erreur lors de la récupération des notes');
  }
}

async function deleteNote(id) {
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
    alert('Note supprimée avec succès');
  } catch (error) {
    console.error('Erreur dans deleteNote:', error);
    alert('Erreur lors de la suppression de la note: ' + error.message);
  }
}

async function updateInternalDocsList() {
  if (!supabase) return;
  const search = document.querySelector('#internal-docs-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#internal-docs-list');
  if (!list) return;
  
  try {
    const { data: internalDocs, error } = await supabase.from('internal_docs').select('*');
    if (error) throw error;
    
    list.innerHTML = internalDocs
      .filter(d => d.name.toLowerCase().includes(search) || d.category.toLowerCase().includes(search))
      .map(d => `
        <div class="file-card">
          <p><strong>Catégorie :</strong> ${d.category}</p>
          <a href="${d.url}" download>${d.name}</a>
          <button class="cta-button" onclick="deleteInternalDoc('${d.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateInternalDocsList:', error);
    alert('Erreur lors de la récupération des documents internes');
  }
}

async function deleteInternalDoc(id) {
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
    const { error } = await supabase.from('internal_docs').delete().eq('id', id);
    if (error) throw error;
    alert('Document interne supprimé avec succès');
  } catch (error) {
    console.error('Erreur dans deleteInternalDoc:', error);
    alert('Erreur lors de la suppression du document interne: ' + error.message);
  }
}

async function updatePresidentFilesList() {
  if (!supabase) return;
  const search = document.querySelector('#president-files-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#president-files-list');
  if (!list) return;
  
  try {
    const { data: presidentFiles, error } = await supabase.from('president_files').select('*');
    if (error) throw error;
    
    list.innerHTML = presidentFiles
      .filter(f => f.name.toLowerCase().includes(search) || f.category.toLowerCase().includes(search))
      .map(f => `
        <div class="file-card">
          <p><strong>Catégorie :</strong> ${f.category}</p>
          <a href="${f.url}" download>${f.name}</a>
          <button class="cta-button" onclick="deletePresidentFile('${f.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updatePresidentFilesList:', error);
    alert('Erreur lors de la récupération des fichiers présidentiels');
  }
}

async function deletePresidentFile(id) {
  if (!supabase || !currentUser || currentUser.role !== 'president') {
    alert('Accès réservé au président');
    return;
  }
  
  try {
    const { error } = await supabase.from('president_files').delete().eq('id', id);
    if (error) throw error;
    alert('Fichier présidentiel supprimé avec succès');
  } catch (error) {
    console.error('Erreur dans deletePresidentFile:', error);
    alert('Erreur lors de la suppression du fichier présidentiel: ' + error.message);
  }
}

async function updateSecretaryFilesList() {
  if (!supabase) return;
  const search = document.querySelector('#secretary-files-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#secretary-files-list');
  if (!list) return;
  
  try {
    const { data: secretaryFiles, error } = await supabase.from('secretary_files').select('*');
    if (error) throw error;
    
    list.innerHTML = secretaryFiles
      .filter(f => f.name.toLowerCase().includes(search) || f.category.toLowerCase().includes(search))
      .map(f => `
        <div class="file-card">
          <p><strong>Catégorie :</strong> ${f.category}</p>
          <a href="${f.url}" download>${f.name}</a>
          <button class="cta-button" onclick="deleteSecretaryFile('${f.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateSecretaryFilesList:', error);
    alert('Erreur lors de la récupération des fichiers secrétaire');
  }
}

async function deleteSecretaryFile(id) {
  if (!supabase || !currentUser || currentUser.role !== 'secretaire') {
    alert('Accès réservé au secrétaire');
    return;
  }
  
  try {
    const { error } = await supabase.from('secretary_files').delete().eq('id', id);
    if (error) throw error;
    alert('Fichier secrétaire supprimé avec succès');
  } catch (error) {
    console.error('Erreur dans deleteSecretaryFile:', error);
    alert('Erreur lors de la suppression du fichier secrétaire: ' + error.message);
  }
}

async function updateSuggestionsList() {
  if (!supabase) return;
  const search = document.querySelector('#suggestions-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#suggestions-list');
  if (!list) return;
  
  try {
    const { data: suggestions, error } = await supabase.from('suggestions').select('*');
    if (error) throw error;
    
    list.innerHTML = suggestions
      .filter(s => s.member.toLowerCase().includes(search) || s.text.toLowerCase().includes(search))
      .map(s => `
        <div class="suggestion-card">
          <p><strong>${s.member}</strong>: ${s.text}</p>
          <button class="cta-button" onclick="deleteSuggestion('${s.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateSuggestionsList:', error);
    alert('Erreur lors de la récupération des suggestions');
  }
}

async function deleteSuggestion(id) {
  if (!supabase || !currentUser || currentUser.role !== 'admin') {
    alert('Accès réservé aux administrateurs');
    return;
  }
  
  try {
    const { error } = await supabase.from('suggestions').delete().eq('id', id);
    if (error) throw error;
    alert('Suggestion supprimée avec succès');
  } catch (error) {
    console.error('Erreur dans deleteSuggestion:', error);
    alert('Erreur lors de la suppression de la suggestion: ' + error.message);
  }
}

function updateCoranContent() {
  const search = document.querySelector('#coran-search')?.value.toLowerCase() || '';
  const content = document.querySelector('#coran-content');
  if (!content) return;
  content.innerHTML = Array(30).fill()
    .map((_, i) => ({ juz: `Juz' ${i + 1}`, id: i + 1 }))
    .filter(j => j.juz.toLowerCase().includes(search))
    .map(j => `<p style="font-family: 'Amiri', serif; font-size: 1.2rem;">${j.juz}</p>`).join('');
}

async function updateLibraryContent() {
  if (!supabase) return;
  const search = document.querySelector('#library-search')?.value.toLowerCase() || '';
  const content = document.querySelector('#library-content');
  if (!content) return;
  
  try {
    const { data: library, error } = await supabase.from('library').select('*');
    if (error) throw error;
    
    content.innerHTML = library
      .filter(l => l.name.toLowerCase().includes(search) || l.category.toLowerCase().includes(search))
      .map(l => `
        <div class="file-card">
          <p><strong>Catégorie :</strong> ${l.category}</p>
          <a href="${l.url}" download>${l.name}</a>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateLibraryContent:', error);
    alert('Erreur lors de la récupération de la bibliothèque');
  }
}

async function updatePersonalInfo() {
  if (!supabase || !currentUser) return;
  
  const info = document.querySelector('#personal-info');
  const contributionsDiv = document.querySelector('#personal-contributions');
  if (!info || !contributionsDiv) return;
  
  try {
    const { data: contributions, error } = await supabase.from('contributions').select('*');
    if (error) throw error;
    
    info.innerHTML = `
      <img src="${currentUser.photo}" alt="${currentUser.firstname} ${currentUser.lastname}" style="width: 100px; border-radius: 50%;">
      <p><strong>Prénom :</strong> ${currentUser.firstname}</p>
      <p><strong>Nom :</strong> ${currentUser.lastname}</p>
      ${currentUser.age ? `<p><strong>Âge :</strong> ${currentUser.age}</p>` : ''}
      ${currentUser.dob ? `<p><strong>Date de naissance :</strong> ${currentUser.dob}</p>` : ''}
      ${currentUser.birthplace ? `<p><strong>Lieu de naissance :</strong> ${currentUser.birthplace}</p>` : ''}
      ${currentUser.email ? `<p><strong>Email :</strong> ${currentUser.email}</p>` : ''}
      ${currentUser.activity ? `<p><strong>Activité :</strong> ${currentUser.activity}</p>` : ''}
      ${currentUser.address ? `<p><strong>Adresse :</strong> ${currentUser.address}</p>` : ''}
      ${currentUser.phone ? `<p><strong>Téléphone :</strong> ${currentUser.phone}</p>` : ''}
      ${currentUser.residence ? `<p><strong>Résidence :</strong> ${currentUser.residence}</p>` : ''}
      <p><strong>Rôle :</strong> ${currentUser.role}</p>
      <p><strong>Statut :</strong> ${currentUser.status}</p>
      <button class="cta-button" onclick="logoutPersonal()">Déconnexion</button>
    `;
    
    contributionsDiv.innerHTML = contributions.map(c => `
      <div class="contribution-card">
        <h4>${c.name} (${c.amount} FCFA)</h4>
        ${c.years.map(year => `
          <h5>${year}</h5>
          ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((month, i) => `
            <p>${month}: ${currentUser.contributions[c.name]?.[year]?.[i] ? 'Payé' : 'Non payé'}</p>
            ${!currentUser.contributions[c.name]?.[year]?.[i] ? `<button class="cta-button" onclick="payContribution('${c.name}', '${year}', ${i})">Payer</button>` : ''}
          `).join('')}
        `).join('')}
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur dans updatePersonalInfo:', error);
    alert('Erreur lors de la récupération des informations personnelles');
  }
}

async function updateCallMembersList() {
  if (!supabase) return;
  const search = document.querySelector('#call-members-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#call-members-list');
  if (!list) return;
  
  try {
    const { data: members, error } = await supabase.from('membres').select('*');
    if (error) throw error;
    
    list.innerHTML = members
      .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
      .map(m => `
        <div class="member-card">
          <input type="checkbox" id="call-member-${m.code}" ${selectedCallMembers.includes(m.code) ? 'checked' : ''} onchange="updateSelectedCallMembers('${m.code}', this.checked)">
          <label for="call-member-${m.code}">${m.firstname} ${m.lastname} (${m.code})</label>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur dans updateCallMembersList:', error);
    alert('Erreur lors de la récupération des membres pour appel');
  }
}

function updateSelectedCallMembers(memberCode, isChecked) {
  if (isChecked) {
    if (!selectedCallMembers.includes(memberCode)) {
      selectedCallMembers.push(memberCode);
    }
  } else {
    selectedCallMembers = selectedCallMembers.filter(code => code !== memberCode);
  }
  const selectedList = document.querySelector('#selected-call-members');
  if (selectedList) {
    selectedList.innerHTML = selectedCallMembers.length > 0
      ? selectedCallMembers.map(code => `<span>${code}</span>`).join(', ')
      : 'Aucun membre sélectionné';
  }
}

function toggleCallAll() {
  const checkboxes = document.querySelectorAll('#call-members-list input[type="checkbox"]');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  checkboxes.forEach(cb => {
    cb.checked = !allChecked;
    const memberCode = cb.id.replace('call-member-', '');
    updateSelectedCallMembers(memberCode, !allChecked);
  });
}

async function initVideoCall() {
  if (!supabase || !currentUser || !['admin', 'president'].includes(currentUser.role)) {
    alert('Accès réservé aux administrateurs ou au président');
    return;
  }
  await updateCallMembersList();
  const callAllButton = document.querySelector('#call-all-button');
  if (callAllButton) {
    callAllButton.onclick = toggleCallAll;
  }
  const startCallButton = document.querySelector('#start-call-button');
  if (startCallButton) {
    startCallButton.onclick = startCall;
  }
}

async function startCall() {
  if (!supabase || !currentUser || !['admin', 'president'].includes(currentUser.role)) {
    alert('Accès réservé aux administrateurs ou au président');
    return;
  }
  if (selectedCallMembers.length === 0) {
    alert('Veuillez sélectionner au moins un membre pour l\'appel');
    return;
  }
  
  try {
    const roomName = `call_${Date.now()}`;
    const { data, error } = await supabase.from('calls').insert([{ room: roomName, members: selectedCallMembers }]);
    if (error) throw error;
    
    const wherebyUrl = `https://whereby.com/${roomName}`;
    window.open(wherebyUrl, '_blank');
    sendNotification('Nouvel appel vidéo', `Rejoignez l\'appel vidéo ici : ${wherebyUrl}`);
    alert('Appel vidéo démarré avec succès');
  } catch (error) {
    console.error('Erreur dans startCall:', error);
    alert('Erreur lors du démarrage de l\'appel vidéo: ' + error.message);
  }
}

async function payContribution(contributionName, year, monthIndex) {
  if (!supabase || !currentUser) {
    alert('Vous devez être connecté pour effectuer un paiement');
    return;
  }
  
  try {
    const { data: contribution, error } = await supabase.from('contributions').select('*').eq('name', contributionName).single();
    if (error) throw error;
    
    // Simuler un paiement via InTouch (remplacez par l'intégration réelle de l'API InTouch)
    const paymentSuccessful = confirm(`Confirmez le paiement de ${contribution.amount} FCFA pour ${contributionName} (${year}, ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][monthIndex]})`);
    
    if (paymentSuccessful) {
      const { data: member, error: memberError } = await supabase.from('membres').select('*').eq('code', currentUser.code).single();
      if (memberError) throw memberError;
      
      if (!member.contributions[contributionName]) {
        member.contributions[contributionName] = { [year]: Array(12).fill(false) };
      }
      member.contributions[contributionName][year][monthIndex] = true;
      
      const { error: updateError } = await supabase.from('membres').update({ contributions: member.contributions }).eq('code', currentUser.code);
      if (updateError) throw updateError;
      
      sendNotification('Paiement effectué', `Paiement de ${contributionName} pour ${member.firstname} ${member.lastname} (${year}, ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][monthIndex]}) confirmé.`);
      alert('Paiement effectué avec succès');
      updatePersonalInfo();
    }
  } catch (error) {
    console.error('Erreur dans payContribution:', error);
    alert('Erreur lors du paiement: ' + error.message);
  }
}

function sendNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  }
}

async function updateStats() {
  if (!supabase) return;
  const statsDiv = document.querySelector('#stats-content');
  if (!statsDiv) return;
  
  try {
    const { data: members, error: memberError } = await supabase.from('membres').select('*');
    const { data: contributions, error: contribError } = await supabase.from('contributions').select('*');
    if (memberError || contribError) throw memberError || contribError;
    
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'actif').length;
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount * members.filter(m => m.contributions[c.name]?.[new Date().getFullYear().toString()]?.some(p => p)).length, 0);
    
    statsDiv.innerHTML = `
      <p><strong>Nombre total de membres :</strong> ${totalMembers}</p>
      <p><strong>Membres actifs :</strong> ${activeMembers}</p>
      <p><strong>Total des cotisations collectées (année en cours) :</strong> ${totalContributions} FCFA</p>
    `;
    
    // Chart for member status
    const statusChart = `
      <canvas id="status-chart"></canvas>
      <chartjs>
        {
          "type": "pie",
          "data": {
            "labels": ["Actifs", "Inactifs"],
            "datasets": [{
              "data": [${activeMembers}, ${totalMembers - activeMembers}],
              "backgroundColor": ["#4CAF50", "#F44336"],
              "borderColor": ["#388E3C", "#D32F2F"],
              "borderWidth": 1
            }]
          },
          "options": {
            "responsive": true,
            "plugins": {
              "legend": {
                "position": "top",
                "labels": { "color": "#333" }
              },
              "title": {
                "display": true,
                "text": "Statut des membres",
                "color": "#333"
              }
            }
          }
        }
      </chartjs>
    `;
    
    // Chart for contributions
    const contributionsChart = `
      <canvas id="contributions-chart"></canvas>
      <chartjs>
        {
          "type": "bar",
          "data": {
            "labels": [${contributions.map(c => `"${c.name}"`).join(', ')}],
            "datasets": [{
              "label": "Montant collecté (FCFA)",
              "data": [${contributions.map(c => members.filter(m => m.contributions[c.name]?.[new Date().getFullYear().toString()]?.some(p => p)).length * c.amount).join(', ')}],
              "backgroundColor": "#2196F3",
              "borderColor": "#1976D2",
              "borderWidth": 1
            }]
          },
          "options": {
            "responsive": true,
            "plugins": {
              "legend": {
                "position": "top",
                "labels": { "color": "#333" }
              },
              "title": {
                "display": true,
                "text": "Cotisations collectées par type",
                "color": "#333"
              }
            },
            "scales": {
              "y": {
                "beginAtZero": true,
                "title": { "display": true, "text": "Montant (FCFA)", "color": "#333" }
              }
            }
          }
        }
      </chartjs>
    `;
    
    statsDiv.innerHTML += statusChart + contributionsChart;
  } catch (error) {
    console.error('Erreur dans updateStats:', error);
    alert('Erreur lors de la récupération des statistiques');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initSupabase();
  showPage('home');
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
});                           
