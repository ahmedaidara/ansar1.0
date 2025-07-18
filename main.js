const SUPABASE_URL = 'https://ncbfuuoupskhzgcjgpvq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYmZ1dW91cHNraHpnY2pncHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTMwNDYsImV4cCI6MjA2ODQyOTA0Nn0.3w7BT14mJeXQHBmZPNxbQwnArkk5wxytJ4aTqdYg4C8';
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const presidentCode = '0000';
let currentUser = null;
let isChatOpen = false;
let selectedCallMembers = [];

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

function toggleChatbot() {
  isChatOpen = !isChatOpen;
  document.querySelector('#chatbot').style.display = isChatOpen ? 'block' : 'none';
  if (isChatOpen) {
    document.querySelector('#chatbot-messages').innerHTML = '<div class="chatbot-message received">Bienvenue ! Posez une question ou utilisez un mot-clé comme "association", "membre", "cotisation", etc.</div>';
  }
}

document.querySelector('.chatbot-button').addEventListener('click', toggleChatbot);

document.querySelector('#chatbot-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.querySelector('#chatbot-input');
  const message = input.value;
  if (!message) return;
  const messages = document.querySelector('#chatbot-messages');
  messages.innerHTML += `<div class="chatbot-message sent">${message}</div>`;
  const secretCodes = ['ADMIN12301012000', '00000000', '11111111', '22222222'];
  if (secretCodes.includes(message)) {
    document.querySelector('#secret-entry').style.display = 'block';
  } else {
    const response = getChatbotResponse(message);
    messages.innerHTML += `<div class="chatbot-message received">${response}</div>`;
  }
  input.value = '';
  messages.scrollTop = messages.scrollHeight;
});

function enterSecret() {
  const password = document.querySelector('#secret-password').value;
  const adminCodes = ['JESUISMEMBRE66', '33333333', '44444444', '55555555'];
  const treasurerCodes = ['JESUISTRESORIER444', '66666666', '77777777', '88888888'];
  const presidentCodes = ['PRESIDENT000', '99999999', '11112222', '33334444'];
  const secretaryCodes = ['SECRETAIRE000', '55556666', '77778888', '99990000'];
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
  } else {
    document.querySelector('#chatbot-messages').innerHTML += '<div class="chatbot-message received">Mot de passe incorrect.</div>';
  }
}

function enterSecret() {
  const password = document.querySelector('#secret-password')?.value;
  if (!password) {
    console.error('Secret password input not found or empty');
    return;
  }
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
    date: new Date().toISOString()
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
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const { data: member, error } = await supabase.from('membres').select('*').eq('code', memberCode).single();
  if (error) {
    console.error('Erreur lors de la récupération du membre:', error);
    return;
  }
  member.contributions[contributionName][year][monthIndex] = paid;
  const { error: updateError } = await supabase.from('membres').update({ contributions: member.contributions }).eq('code', memberCode);
  if (updateError) {
    console.error('Erreur lors de la mise à jour de la cotisation:', updateError);
    alert('Erreur lors de la mise à jour de la cotisation');
    return;
  }
  sendNotification('Mise à jour cotisation', `Cotisation ${contributionName} pour ${member.firstname} ${member.lastname} (${year}, ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][monthIndex]}) marquée comme ${paid ? 'payée' : 'non payée'}.`);
}

async function updateEditMembersList() {
  const search = document.querySelector('#edit-member-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#edit-members-list');
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
        <p><strong>Prénom :</strong> ${m.firstname}</p>
        <p><strong>Nom :</strong> ${m.lastname}</p>
        <button class="cta-button" onclick="editMember('${m.code}')">Modifier</button>
        <button class="cta-button" onclick="deleteMember('${m.code}')">Supprimer</button>
      </div>
    `).join('');
}

async function editMember(code) {
  const { data: member, error } = await supabase.from('membres').select('*').eq('code', code).single();
  if (error) {
    console.error('Erreur lors de la récupération du membre:', error);
    return;
  }
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
  document.querySelector('#new-member-role').value = member.role;
  document.querySelector('#new-member-status').value = member.status;
  showTab('add-member');
}

function deleteMember(code) {
  if (!currentUser || currentUser.role !== 'admin') return;
  document.querySelector('#delete-member-form').dataset.memberCode = code;
  document.querySelector('#delete-member-form').style.display = 'block';
}

async function updateEventsList() {
  const search = document.querySelector('#events-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#events-list');
  if (!list) return;
  const { data: events, error } = await supabase.from('events').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return;
  }
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
}

async function updateEventsAdminList() {
  const search = document.querySelector('#events-admin-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#events-admin-list');
  if (!list) return;
  const { data: events, error } = await supabase.from('events').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return;
  }
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
}

async function deleteEvent(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    alert('Erreur lors de la suppression de l\'événement');
  }
}

async function updateGalleryContent() {
  const content = document.querySelector('#gallery-content');
  if (!content) return;
  const { data: gallery, error } = await supabase.from('gallery').select('*');
  if (error) {
    console.error('Erreur lors de la récupération de la galerie:', error);
    return;
  }
  content.innerHTML = gallery
    .map(g => `
      <div>
        ${g.type === 'image' ? `<img src="${g.url}" alt="Galerie">` : `<video src="${g.url}" controls></video>`}
      </div>
    `).join('');
}

async function updateGalleryAdminList() {
  const search = document.querySelector('#gallery-admin-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#gallery-admin-list');
  if (!list) return;
  const { data: gallery, error } = await supabase.from('gallery').select('*');
  if (error) {
    console.error('Erreur lors de la récupération de la galerie:', error);
    return;
  }
  list.innerHTML = gallery
    .filter(g => g.name.toLowerCase().includes(search))
    .map(g => `
      <div>
        ${g.type === 'image' ? `<img src="${g.url}" alt="Galerie" style="max-width: 100%; border-radius: 10px;">` : `<video src="${g.url}" controls style="max-width: 100%; border-radius: 10px;"></video>`}
        <button class="cta-button" onclick="deleteGalleryItem('${g.id}')">Supprimer</button>
      </div>
    `).join('');
}

async function deleteGalleryItem(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  const { error } = await supabase.from('gallery').delete().eq('id', id);
  if (error) {
    console.error('Erreur lors de la suppression de l\'élément de la galerie:', error);
    alert('Erreur lors de la suppression de l\'élément de la galerie');
  }
}

async function updateMessagesList() {
  const list = document.querySelector('#messages-list');
  if (!list) return;
  const { data: messages, error } = await supabase.from('messages').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return;
  }
  list.innerHTML = messages
    .map(m => `
      <div class="message-card">
        <h4>${m.title}</h4>
        <p>${m.text}</p>
        <p><small>${new Date(m.date).toLocaleString()}</small></p>
      </div>
    `).join('');
}

async function updateMessagesAdminList() {
  const search = document.querySelector('#messages-admin-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#messages-admin-list');
  if (!list) return;
  const { data: messages, error } = await supabase.from('messages').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return;
  }
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
}

async function deleteMessage(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) {
    console.error('Erreur lors de la suppression du message:', error);
    alert('Erreur lors de la suppression du message');
  }
}

async function updateMessagePopups() {
  const popups = document.querySelector('#message-popups');
  if (!popups) return;
  const { data: messages, error } = await supabase.from('messages').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return;
  }
  popups.innerHTML = messages
    .map(m => `
      <div class="message-popup">
        <h4>${m.title}</h4>
        <p>${m.text}</p>
        <button class="close-button" onclick="deleteMessage('${m.id}')"><span class="material-icons">close</span></button>
      </div>
    `).join('');
}

async function updateAutoMessagesList() {
  const search = document.querySelector('#auto-messages-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#auto-messages-list');
  if (!list) return;
  const { data: autoMessages, error } = await supabase.from('auto_messages').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des messages automatisés:', error);
    return;
  }
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
}

async function deleteAutoMessage(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  const { error } = await supabase.from('auto_messages').delete().eq('id', id);
  if (error) {
    console.error('Erreur lors de la suppression du message automatisé:', error);
    alert('Erreur lors de la suppression du message automatisé');
  }
}

async function updateNotesList() {
  const search = document.querySelector('#notes-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#notes-list');
  if (!list) return;
  const { data: notes, error } = await supabase.from('notes').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    return;
  }
  list.innerHTML = notes
    .filter(n => n.theme.toLowerCase().includes(search) || n.text.toLowerCase().includes(search))
    .map(n => `
      <div class="note-card">
        <p><strong>${n.theme}</strong>: ${n.text}</p>
        <button class="cta-button" onclick="deleteNote('${n.id}')">Supprimer</button>
      </div>
    `).join('');
}

async function deleteNote(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) {
    console.error('Erreur lors de la suppression de la note:', error);
    alert('Erreur lors de la suppression de la note');
  }
}

async function updateInternalDocsList() {
  const search = document.querySelector('#internal-docs-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#internal-docs-list');
  if (!list) return;
  const { data: internalDocs, error } = await supabase.from('internal_docs').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des documents internes:', error);
    return;
  }
  list.innerHTML = internalDocs
    .filter(d => d.name.toLowerCase().includes(search) || d.category.toLowerCase().includes(search))
    .map(d => `
      <div class="file-card">
        <p><strong>Catégorie :</strong> ${d.category}</p>
        <a href="${d.url}" download>${d.name}</a>
        <button class="cta-button" onclick="deleteInternalDoc('${d.id}')">Supprimer</button>
      </div>
    `).join('');
}

async function deleteInternalDoc(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  const { error } = await supabase.from('internal_docs').delete().eq('id', id);
  if (error) {
    console.error('Erreur lors de la suppression du document interne:', error);
    alert('Erreur lors de la suppression du document interne');
  }
}

async function updatePresidentFilesList() {
  const search = document.querySelector('#president-files-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#president-files-list');
  if (!list) return;
  const { data: presidentFiles, error } = await supabase.from('president_files').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des fichiers présidentiels:', error);
    return;
  }
  list.innerHTML = presidentFiles
    .filter(f => f.name.toLowerCase().includes(search) || f.category.toLowerCase().includes(search))
    .map(f => `
      <div class="file-card">
        <p><strong>Catégorie :</strong> ${f.category}</p>
        <a href="${f.url}" download>${f.name}</a>
        <button class="cta-button" onclick="deletePresidentFile('${f.id}')">Supprimer</button>
      </div>
    `).join('');
}

async function deletePresidentFile(id) {
  if (!currentUser || currentUser.role !== 'president') return;
  const { error } = await supabase.from('president_files').delete().eq('id', id);
  if (error) {
    console.error('Erreur lors de la suppression du fichier présidentiel:', error);
    alert('Erreur lors de la suppression du fichier présidentiel');
  }
}

async function updateSecretaryFilesList() {
  const search = document.querySelector('#secretary-files-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#secretary-files-list');
  if (!list) return;
  const { data: secretaryFiles, error } = await supabase.from('secretary_files').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des fichiers secrétaire:', error);
    return;
  }
  list.innerHTML = secretaryFiles
    .filter(f => f.name.toLowerCase().includes(search) || f.category.toLowerCase().includes(search))
    .map(f => `
      <div class="file-card">
        <p><strong>Catégorie :</strong> ${f.category}</p>
        <a href="${f.url}" download>${f.name}</a>
        <button class="cta-button" onclick="deleteSecretaryFile('${f.id}')">Supprimer</button>
      </div>
    `).join('');
}

async function deleteSecretaryFile(id) {
  if (!currentUser || currentUser.role !== 'secretaire') return;
  const { error } = await supabase.from('secretary_files').delete().eq('id', id);
  if (error) {
    console.error('Erreur lors de la suppression du fichier secrétaire:', error);
    alert('Erreur lors de la suppression du fichier secrétaire');
  }
}

async function updateSuggestionsList() {
  const search = document.querySelector('#suggestions-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#suggestions-list');
  if (!list) return;
  const { data: suggestions, error } = await supabase.from('suggestions').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des suggestions:', error);
    return;
  }
  list.innerHTML = suggestions
    .filter(s => s.member.toLowerCase().includes(search) || s.text.toLowerCase().includes(search))
    .map(s => `
      <div class="suggestion-card">
        <p><strong>${s.member}</strong>: ${s.text}</p>
        <button class="cta-button" onclick="deleteSuggestion('${s.id}')">Supprimer</button>
      </div>
    `).join('');
}

async function deleteSuggestion(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  const { error } = await supabase.from('suggestions').delete().eq('id', id);
  if (error) {
    console.error('Erreur lors de la suppression de la suggestion:', error);
    alert('Erreur lors de la suppression de la suggestion');
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
  const search = document.querySelector('#library-search')?.value.toLowerCase() || '';
  const content = document.querySelector('#library-content');
  if (!content) return;
  const { data: library, error } = await supabase.from('library').select('*');
  if (error) {
    console.error('Erreur lors de la récupération de la bibliothèque:', error);
    return;
  }
  content.innerHTML = library
    .filter(l => l.name.toLowerCase().includes(search) || l.category.toLowerCase().includes(search))
    .map(l => `
      <div class="file-card">
        <p><strong>Catégorie :</strong> ${l.category}</p>
        <a href="${l.url}" download>${l.name}</a>
      </div>
    `).join('');
}

async function updatePersonalInfo() {
  if (!currentUser) return;
  const info = document.querySelector('#personal-info');
  const contributionsDiv = document.querySelector('#personal-contributions');
  if (!info || !contributionsDiv) return;
  const { data: contributions, error } = await supabase.from('contributions').select('*');
  if (error) {
    console.error('Erreur lors de la récupération des cotisations:', error);
    return;
  }
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
  `;
  contributionsDiv.innerHTML = Object.entries(currentUser.contributions).map(([name, years]) => `
    <div class="contribution-card">
      <p><strong>${name}</strong>: ${contributions.find(c => c.name === name).amount} FCFA</p>
      ${Object.entries(years).map(([year, months]) => `
        <p><strong>${year}</strong></p>
        <p>Payé: ${months.map((p, i) => p ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][i] : '').filter(Boolean).join(', ')}</p>
        <p>Non payé: ${months.map((p, i) => !p ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][i] : '').filter(Boolean).join(', ')}</p>
      `).join('')}
    </div>
  `).join('');
}

async function updateStats() {
  const { data: members, error: memberError } = await supabase.from('membres').select('*');
  const { data: contributions, error: contribError } = await supabase.from('contributions').select('*');
  if (memberError || contribError) {
    console.error('Erreur lors de la récupération des données pour les stats:', memberError || contribError);
    return;
  }
  const totalAmount = members.reduce((sum, m) => sum + Object.values(m.contributions).reduce((s, years) => s + Object.values(years).reduce((t, months) => t + months.filter(p => p).length * contributions.find(c => c.name === Object.keys(m.contributions)[0]).amount, 0), 0), 0);
  const membersCount = members.length;
  const activeMembers = members.filter(m => m.status === 'actif').length;
  const upToDateMembers = members.filter(m => Object.values(m.contributions).every(years => Object.values(years).every(months => months.every(p => p)))).length;

  new Chart(document.getElementById('stats-total-amount'), {
    type: 'bar',
    data: {
      labels: ['Somme totale'],
      datasets: [{ label: 'Montant (FCFA)', data: [totalAmount], backgroundColor: '#9b9c28' }]
    }
  });

  new Chart(document.getElementById('stats-members'), {
    type: 'pie',
    data: {
      labels: ['Membres'],
      datasets: [{ data: [membersCount], backgroundColor: ['#3a6241'] }]
    }
  });

  new Chart(document.getElementById('stats-status'), {
    type: 'pie',
    data: {
      labels: ['Actifs', 'Inactifs', 'Liste noire'],
      datasets: [{ data: [activeMembers, membersCount - activeMembers - members.filter(m => m.status === 'liste-noire').length, members.filter(m => m.status === 'liste-noire').length], backgroundColor: ['#3a6241', '#778152', '#9b9c28'] }]
    }
  });

  new Chart(document.getElementById('stats-contributions'), {
    type: 'bar',
    data: {
      labels: ['À jour', 'En retard'],
      datasets: [{ label: 'Membres', data: [upToDateMembers, membersCount - upToDateMembers], backgroundColor: ['#3a6241', '#9b9c28'] }]
    }
  });
}

async function updateCallMembersList() {
  const search = document.querySelector('#video-calls-search')?.value.toLowerCase() || '';
  const list = document.querySelector('#members-call-list');
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
        <input type="checkbox" id="call-${m.code}" value="${m.code}" onchange="updateSelectedCallMembers('${m.code}', this.checked)">
        <label for="call-${m.code}">${m.firstname} ${m.lastname} (${m.code})</label>
      </div>
    `).join('');
}

function updateSelectedCallMembers(code, checked) {
  if (checked) {
    selectedCallMembers.push(code);
  } else {
    selectedCallMembers = selectedCallMembers.filter(c => c !== code);
  }
}

function toggleCallAll() {
  const checkAll = document.querySelector('#call-all')?.checked;
  selectedCallMembers = checkAll ? (async () => {
    const { data: members } = await supabase.from('membres').select('code');
    return members.map(m => m.code);
  })() : [];
  document.querySelectorAll('#members-call-list input[type=checkbox]').forEach(checkbox => {
    checkbox.checked = checkAll;
  });
}

function initVideoCall() {
  if (!currentUser || !['admin', 'tresorier', 'president', 'secretaire'].includes(currentUser.role)) {
    document.querySelector('#video-call-container').innerHTML = '<p>Accès réservé aux membres du bureau.</p>';
    return;
  }
  updateCallMembersList();
  document.querySelector('#video-call-container').innerHTML = '<p>Sélectionnez les membres à appeler ou cochez "Cocher tout".</p>';
}

function startCall(type) {
  if (!currentUser || !['admin', 'tresorier', 'president', 'secretaire'].includes(currentUser.role)) return;
  if (selectedCallMembers.length === 0) {
    alert('Veuillez sélectionner au moins un membre.');
    return;
  }
  const roomId = `ansar-room-${Date.now()}`;
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmFwcGVhci5pbiIsImF1ZCI6Imh0dHBzOi8vYXBpLmFwcGVhci5pbi92MSIsImV4cCI6OTAwNzE5OTI1NDc0MDk5MSwiaWF0IjoxNzUyNzQzMzY5LCJvcmdhbml6YXRpb25JZCI6MzIwMzY3LCJqdGkiOiJmYzdmMjhiYS0xZTViLTRhYjAtOGQwZi1kZWNjNzAxYzkyNzAifQ.2WXwlPQj_-Da17X3IXJrVFYfiAsGlxzaRftPiG5oFWI';
  const videoCallContainer = document.querySelector('#video-call-container');
  const roomUrl = `https://ansar-almouyassar.whereby.com/${roomId}?token=${token}&${type === 'audio' ? 'audioOnly=true' : ''}&displayName=${currentUser.firstname || 'Admin'} ${currentUser.lastname || ''}`;
  videoCallContainer.innerHTML = `<whereby-embed room="${roomUrl}"></whereby-embed>`;
  alert(`${type === 'video' ? 'Appel vidéo' : 'Appel audio'} démarré avec ${selectedCallMembers.length} membre(s).`);
}

function payContribution() {
  const paymentWindow = window.open('', '_blank');
  paymentWindow.document.write(`
    <html>
      <head><title>Paiement Cotisation</title></head>
      <body>
        <h2>Choisir un mode de paiement</h2>
        <a href="https://pay.wave.com/m/M_sn_dyIw8DZWV46K/c/sn/?amount=2000" target="_blank">Payer via Wave</a><br>
        <a href="https://sugu.orange-sonatel.com/mp/dc3PQ0eEeSdcKQWVvcTH2Z" target="_blank">Payer via Orange Money</a>
      </body>
    </html>
  `);
}

function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  }
}

document.querySelector('#members-search')?.addEventListener('input', updateMembersList);
document.querySelector('#events-search')?.addEventListener('input', updateEventsList);
document.querySelector('#coran-search')?.addEventListener('input', updateCoranContent);
document.querySelector('#library-search')?.addEventListener('input', updateLibraryContent);
document.querySelector('#edit-member-search')?.addEventListener('input', updateEditMembersList);
document.querySelector('#gallery-admin-search')?.addEventListener('input', updateGalleryAdminList);
document.querySelector('#events-admin-search')?.addEventListener('input', updateEventsAdminList);
document.querySelector('#messages-admin-search')?.addEventListener('input', updateMessagesAdminList);
document.querySelector('#notes-search')?.addEventListener('input', updateNotesList);
document.querySelector('#internal-docs-search')?.addEventListener('input', updateInternalDocsList);
document.querySelector('#suggestions-search')?.addEventListener('input', updateSuggestionsList);
document.querySelector('#video-calls-search')?.addEventListener('input', updateCallMembersList);
document.querySelector('#auto-messages-search')?.addEventListener('input', updateAutoMessagesList);
document.querySelector('#contributions-admin-search')?.addEventListener('input', updateContributionsAdminList);
document.querySelector('#president-files-search')?.addEventListener('input', updatePresidentFilesList);
document.querySelector('#secretary-files-search')?.addEventListener('input', updateSecretaryFilesList);

initSupabase().then(() => {
  updateMembersList();
  updateContributionsAdminList();
  updateEventsList();
  updateGalleryContent();
  updateMessagesList();
  updateAutoMessagesList();
  updateNotesList();
  updateInternalDocsList();
  updatePresidentFilesList();
  updateSecretaryFilesList();
  updateSuggestionsList();
  updateCoranContent();
  updateLibraryContent();
  updateStats();
  updateEventCountdowns();
  updateMessagePopups();
});
