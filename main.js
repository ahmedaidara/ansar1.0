// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA-TpblN0YnekG2tKFRhjOwwEd80qke5pk",
  authDomain: "ansar-69617.firebaseapp.com",
  projectId: "ansar-69617",
  storageBucket: "ansar-69617.firebasestorage.app",
  messagingSenderId: "1075104578958",
  appId: "1:1075104578958:web:b5d55c76def4d1d430b8df",
  measurementId: "G-5XLSPLXH81"
};

// Initialiser Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// Variables globales
let currentUser = null;
let isChatOpen = false;
let selectedCallMembers = [];
const presidentCode = '0000';

// ==================== FONCTIONS DE BASE POUR FIRESTORE ====================

// Charger les données depuis Firestore
async function loadData(collection) {
  try {
    const snapshot = await db.collection(collection).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Erreur loadData(${collection}):`, error);
    return [];
  }
}

// Sauvegarder les données dans Firestore
async function saveData(collection, data, docId = null) {
  try {
    if (docId) {
      await db.collection(collection).doc(docId).set(data, { merge: true });
    } else {
      await db.collection(collection).add(data);
    }
    return true;
  } catch (error) {
    console.error(`Erreur saveData(${collection}):`, error);
    alert(`Erreur de sauvegarde: ${error.message}`);
    return false;
  }
}

// Supprimer un document
async function deleteData(collection, docId) {
  try {
    await db.collection(collection).doc(docId).delete();
    return true;
  } catch (error) {
    console.error(`Erreur deleteData(${collection}):`, error);
    alert(`Erreur lors de la suppression: ${error.message}`);
    return false;
  }
}

// Uploader un fichier vers Firebase Storage
async function uploadFile(file) {
  try {
    const storageRef = storage.ref(`gallery/${Date.now()}_${file.name}`);
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error('Erreur uploadFile:', error);
    throw error;
  }
}

// ==================== FONCTIONS D'INTERFACE ====================

function showPage(pageId) {
  try {
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');
    
    if (!pages.length || !navItems.length) {
      console.error('Éléments de navigation introuvables');
      return;
    }

    pages.forEach(page => page.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));

    const pageElement = document.querySelector(`#${pageId}`);
    const navElement = document.querySelector(`a[onclick="showPage('${pageId}')"]`);

    if (pageElement) pageElement.classList.add('active');
    if (navElement) navElement.classList.add('active');

    switch(pageId) {
      case 'members': updateMembersList(); break;
      case 'events': updateEventsList(); break;
      case 'gallery': updateGalleryContent(); break;
      case 'messages': updateMessagesList(); break;
      case 'coran': updateCoranContent(); break;
      case 'personal': updatePersonalPage(); break;
      case 'library': updateLibraryContent(); break;
      case 'home': updateMessagePopups(); break;
      case 'secret': if (currentUser) showTab('stats'); break;
    }
  } catch (error) {
    console.error('Erreur showPage:', error);
  }
}

function showTab(tabId) {
  const tabContent = document.querySelector(`#${tabId}`);
  const tabButton = document.querySelector(`button[onclick="showTab('${tabId}')"]`);

  if (!tabContent) {
    console.error(`Tab content #${tabId} not found in DOM`);
    return;
  }
  if (!tabButton) {
    console.error(`Tab button for ${tabId} not found in DOM`);
    return;
  }

  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

  tabContent.classList.add('active');
  tabButton.classList.add('active');

  switch(tabId) {
    case 'edit-member': updateEditMembersList(); break;
    case 'gallery-admin': updateGalleryAdminList(); break;
    case 'events-admin': updateEventsAdminList(); break;
    case 'messages-admin': updateMessagesAdminList(); break;
    case 'notes': updateNotesList(); break;
    case 'internal-docs': updateInternalDocsList(); break;
    case 'suggestions-admin': updateSuggestionsList(); break;
    case 'stats': updateStats(); break;
    case 'video-calls': initVideoCall(); break;
    case 'auto-messages': updateAutoMessagesList(); break;
    case 'treasurer': updateContributionsAdminList(); break;
    case 'president': updatePresidentFilesList(); break;
    case 'secretary': updateSecretaryFilesList(); break;
    default: console.warn(`No action defined for tab ${tabId}`);
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// ==================== FONCTIONS MEMBRES ====================

// Gestion du formulaire d'ajout/modification de membre
document.querySelector('#add-member-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const isEditing = e.target.dataset.editing;
  const photoInput = document.getElementById('new-member-photo');

  const memberData = {
    code: isEditing || (await generateMemberCode()),
    firstname: document.getElementById('new-member-firstname')?.value.trim() || '',
    lastname: document.getElementById('new-member-lastname')?.value.trim() || '',
    age: parseInt(document.getElementById('new-member-age')?.value) || null,
    dob: document.getElementById('new-member-dob')?.value || null,
    birthplace: document.getElementById('new-member-birthplace')?.value.trim() || null,
    photo: await handlePhotoUpload(photoInput),
    email: document.getElementById('new-member-email')?.value.trim() || null,
    activity: document.getElementById('new-member-activity')?.value.trim() || null,
    address: document.getElementById('new-member-address')?.value.trim() || null,
    phone: document.getElementById('new-member-phone')?.value.trim() || null,
    residence: document.getElementById('new-member-residence')?.value.trim() || null,
    role: document.getElementById('new-member-role')?.value || 'membre',
    status: document.getElementById('new-member-status')?.value || 'actif',
    contributions: initializeContributions(),
    createdAt: new Date().toISOString()
  };

  try {
    await saveData('members', memberData, isEditing);
    document.getElementById('add-member-form').reset();
    delete e.target.dataset.editing;
    await updateAllMemberLists();
    alert(`Membre ${isEditing ? 'modifié' : 'ajouté'} avec succès!`);
  } catch (error) {
    console.error("Erreur:", error);
    alert(`Erreur lors de ${isEditing ? 'la modification' : "l'ajout"} du membre`);
  }
});

// Fonctions helper
async function generateMemberCode() {
  const members = await loadData('members');
  return `${(members.length + 1).toString().padStart(3, '0')}`;
}

async function handlePhotoUpload(photoInput) {
  if (photoInput?.files.length > 0) {
    try {
      return await uploadFile(photoInput.files[0]);
    } catch (error) {
      console.error("Erreur d'upload:", error);
    }
  }
  return 'assets/images/default-photo.png';
}

function initializeContributions() {
  return { 
    'Mensuelle': { 
      '2023': Array(12).fill(false), 
      '2024': Array(12).fill(false),
      '2025': Array(12).fill(false) 
    }
  };
}

// Mise à jour des listes de membres
async function updateMembersList() {
  try {
    const members = await loadData('members');
    const search = document.querySelector('#members-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#members-list');
    
    if (!list) {
      console.error('Element #members-list not found');
      return;
    }

    list.innerHTML = members
      .filter(m => `${m.firstname} ${m.lastname} ${m.code}`.toLowerCase().includes(search))
      .map(m => `
        <div class="member-card" onclick="showMemberDetail('${m.code}')">
          <img src="${m.photo}" alt="${m.firstname} ${m.lastname}" class="member-photo">
          <div>
            <p><strong>${m.firstname} ${m.lastname}</strong></p>
            <p><small>${m.code} • ${m.role}</small></p>
          </div>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateMembersList:', error);
  }
}

async function updateEditMembersList() {
  try {
    const members = await loadData('members');
    const search = document.querySelector('#edit-member-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#edit-members-list');
    
    if (!list) {
      console.error('Element #edit-members-list not found');
      return;
    }

    list.innerHTML = members
      .filter(m => `${m.firstname} ${m.lastname} ${m.code}`.toLowerCase().includes(search))
      .map(m => `
        <div class="member-card">
          <img src="${m.photo}" alt="${m.firstname} ${m.lastname}" class="member-photo">
          <div>
            <p><strong>${m.firstname} ${m.lastname}</strong></p>
            <p><small>${m.code} • ${m.role}</small></p>
          </div>
          <div class="member-actions">
            <button class="cta-button small" onclick="editMember('${m.code}')">Modifier</button>
            <button class="cta-button small danger" onclick="confirmDeleteMember('${m.code}')">Supprimer</button>
          </div>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateEditMembersList:', error);
  }
}

async function editMember(code) {
  try {
    const members = await loadData('members');
    const member = members.find(m => m.code === code);
    if (!member) {
      alert('Membre introuvable');
      return;
    }

    const form = document.querySelector('#add-member-form');
    if (!form) {
      console.error('Formulaire #add-member-form introuvable');
      return;
    }

    form.dataset.editing = member.id;
    document.getElementById('new-member-firstname').value = member.firstname || '';
    document.getElementById('new-member-lastname').value = member.lastname || '';
    document.getElementById('new-member-age').value = member.age || '';
    document.getElementById('new-member-dob').value = member.dob || '';
    document.getElementById('new-member-birthplace').value = member.birthplace || '';
    document.getElementById('new-member-email').value = member.header || '';
    document.getElementById('new-member-activity').value = member.activity || '';
    document.getElementById('new-member-address').value = member.address || '';
    document.getElementById('new-member-phone').value = member.phone || '';
    document.getElementById('new-member-residence').value = member.residence || '';
    document.getElementById('new-member-role').value = member.role || 'membre';
    document.getElementById('new-member-status').value = member.status || 'actif';

    showTab('add-member');
  } catch (error) {
    console.error('Erreur editMember:', error);
    alert('Erreur lors du chargement des données du membre');
  }
}

async function confirmDeleteMember(code) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce membre ?")) return;
  
  try {
    const members = await loadData('members');
    const member = members.find(m => m.code === code);
    if (!member) {
      alert('Membre introuvable');
      return;
    }
    await deleteData('members', member.id);
    await updateAllMemberLists();
    alert('Membre supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteMember:', error);
    alert('Erreur lors de la suppression');
  }
}

async function updateAllMemberLists() {
  await Promise.all([
    updateMembersList(),
    updateEditMembersList(),
    updateStats()
  ]);
}

// ==================== FONCTIONS GALERIE ====================

async function updateGalleryContent() {
  try {
    const gallery = await loadData('gallery');
    const content = document.querySelector('#gallery-content');
    if (!content) {
      console.error('Element #gallery-content not found');
      return;
    }

    content.innerHTML = gallery.map(item => `
      <div class="gallery-item">
        ${item.type === 'image' ? 
          `<img src="${item.url}" alt="${item.name}">` : 
          `<video src="${item.url}" controls></video>`}
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur updateGalleryContent:', error);
  }
}

document.querySelector('#add-gallery-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.querySelector('#gallery-file');
  const description = document.querySelector('#gallery-description')?.value.trim() || '';
  const file = fileInput?.files[0];
  
  if (!file) {
    alert('Veuillez sélectionner un fichier');
    return;
  }

  try {
    const fileUrl = await uploadFile(file);
    const galleryData = {
      type: file.type.startsWith('image') ? 'image' : 'video',
      url: fileUrl,
      name: file.name,
      description: description || 'Pas de description',
      date: new Date().toISOString()
    };

    await saveData('gallery', galleryData);
    await updateGalleryAdminList();
    
    fileInput.value = '';
    if (document.querySelector('#gallery-description')) {
      document.querySelector('#gallery-description').value = '';
    }
    alert('Média ajouté avec succès');
  } catch (error) {
    console.error("Erreur d'ajout à la galerie:", error);
    alert("Erreur lors de l'ajout du média");
  }
});

async function updateGalleryAdminList() {
  try {
    const gallery = await loadData('gallery');
    const search = document.querySelector('#gallery-admin-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#gallery-admin-list');
    
    if (!list) {
      console.error('Element #gallery-admin-list not found');
      return;
    }

    list.innerHTML = gallery
      .filter(g => 
        (g.description?.toLowerCase().includes(search)) || 
        (g.name?.toLowerCase().includes(search))
      )
      .map(g => `
        <div class="gallery-item">
          ${g.type === 'image' 
            ? `<img src="${g.url}" alt="${g.description}" class="gallery-image">` 
            : `<video src="${g.url}" controls class="gallery-video"></video>`
          }
          <div class="gallery-details">
            <p><strong>${g.description || 'Pas de description'}</strong></p>
            <p>${g.name}</p>
            <p class="gallery-date">${formatDate(g.date)}</p>
            <button class="cta-button danger" onclick="deleteGalleryItem('${g.id}')">Supprimer</button>
          </div>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateGalleryAdminList:', error);
    const list = document.querySelector('#gallery-admin-list');
    if (list) list.innerHTML = '<p>Aucun média disponible</p>';
  }
}

async function deleteGalleryItem(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce média ?")) return;
  
  try {
    await deleteData('gallery', id);
    await updateGalleryAdminList();
    alert('Média supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteGalleryItem:', error);
    alert('Erreur lors de la suppression du média');
  }
}

// ==================== FONCTIONS ÉVÉNEMENTS ====================

async function updateEventsList() {
  try {
    const events = await loadData('events');
    const search = document.querySelector('#events-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#events-list');
    
    if (!list) {
      console.error('Element #events-list not found');
      return;
    }

    list.innerHTML = events
      .filter(e => e.name.toLowerCase().includes(search) || e.description.toLowerCase().includes(search))
      .map(e => `
        <div class="event-card">
          ${e.image ? `<img src="${e.image}" alt="${e.name}" class="event-image">` : ''}
          <div class="event-details">
            <h4>${e.name}</h4>
            <p>${e.description}</p>
            <p class="event-date">${formatDate(e.datetime)}</p>
          </div>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateEventsList:', error);
  }
}

async function updateEventsAdminList() {
  try {
    const events = await loadData('events');
    const list = document.querySelector('#events-admin-list');
    
    if (!list) {
      console.error('Element #events-admin-list not found');
      return;
    }

    list.innerHTML = events.map(e => `
      <div class="event-card">
        ${e.image ? `<img src="${e.image}" alt="${e.name}" class="event-image">` : ''}
        <div class="event-details">
          <h4>${e.name}</h4>
          <p>${e.description}</p>
          <p class="event-date">${formatDate(e.datetime)}</p>
          <button class="cta-button danger" onclick="deleteEvent('${e.id}')">Supprimer</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur updateEventsAdminList:', error);
  }
}

async function addNewEvent(eventData) {
  try {
    await saveData('events', eventData);
    await updateEventsList();
    await updateEventsAdminList();
    return true;
  } catch (error) {
    console.error('Erreur addNewEvent:', error);
    return false;
  }
}

async function deleteEvent(id) {
  try {
    await deleteData('events', id);
    await updateEventsList();
    await updateEventsAdminList();
    alert('Événement supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteEvent:', error);
    alert('Erreur lors de la suppression de l\'événement');
  }
}

// ==================== FONCTIONS MESSAGES ====================

async function updateMessagesList() {
  try {
    const messages = await loadData('messages');
    const list = document.querySelector('#messages-list');
    
    if (!list) {
      console.error('Element #messages-list not found');
      return;
    }

    list.innerHTML = messages.map(msg => `
      <div class="message-card">
        <h4>${msg.title}</h4>
        <p>${msg.text}</p>
        <p class="message-date">${formatDate(msg.date)}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur updateMessagesList:', error);
  }
}

async function updateMessagesAdminList() {
  try {
    const messages = await loadData('messages');
    const list = document.querySelector('#messages-admin-list');
    
    if (!list) {
      console.error('Element #messages-admin-list not found');
      return;
    }

    list.innerHTML = messages.map(msg => `
      <div class="message-card">
        <h4>${msg.title}</h4>
        <p>${msg.text}</p>
        <p class="message-date">${formatDate(msg.date)}</p>
        <button class="cta-button danger" onclick="deleteMessage('${msg.id}')">Supprimer</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur updateMessagesAdminList:', error);
  }
}

async function addNewMessage(message) {
  try {
    await saveData('messages', message);
    await updateMessagesList();
    await updateMessagesAdminList();
    await updateMessagePopups();
    sendNotification('Nouveau message', `${message.title}: ${message.text}`);
    return true;
  } catch (error) {
    console.error('Erreur addNewMessage:', error);
    return false;
  }
}

async function deleteMessage(id) {
  try {
    await deleteData('messages', id);
    await updateMessagesList();
    await updateMessagesAdminList();
    await updateMessagePopups();
    alert('Message supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteMessage:', error);
    alert('Erreur lors de la suppression du message');
  }
}

// ==================== FONCTIONS AUTO-MESSAGES ====================

async function checkAutoMessages() {
  try {
    const autoMessages = await loadData('autoMessages');
    const messages = await loadData('messages');
    const now = new Date();

    for (const msg of autoMessages) {
      if (new Date(msg.datetime) <= now) {
        await addNewMessage({
          title: msg.name,
          text: msg.text,
          date: now.toISOString()
        });
        await deleteData('autoMessages', msg.id);
      }
    }
  } catch (error) {
    console.error('Erreur checkAutoMessages:', error);
  }
}

async function updateAutoMessagesList() {
  try {
    const autoMessages = await loadData('autoMessages');
    const autoMessagesList = document.querySelector('#auto-messages-list');
    if (!autoMessagesList) {
      console.error('Element #auto-messages-list not found');
      return;
    }

    autoMessagesList.innerHTML = autoMessages.length ? autoMessages.map(msg => `
      <li>${msg.content} (Programmé: ${formatDate(msg.date)})</li>
    `).join('') : '<p>Aucun message automatique disponible</p>';
  } catch (error) {
    console.error('Erreur updateAutoMessagesList:', error);
  }
}

// ==================== FONCTIONS NOTES ET DOCUMENTS ====================

async function updateNotesList() {
  try {
    const notes = await loadData('notes');
    const notesList = document.querySelector('#notes-list');
    if (!notesList) {
      console.error('Element #notes-list not found');
      return;
    }

    notesList.innerHTML = notes.length ? notes.map(note => `
      <li>${note.title}: ${note.content}</li>
    `).join('') : '<p>Aucune note disponible</p>';
  } catch (error) {
    console.error('Erreur updateNotesList:', error);
  }
}

async function updateInternalDocsList() {
  try {
    const docs = await loadData('internalDocs');
    const docsList = document.querySelector('#internal-docs-list');
    if (!docsList) {
      console.error('Element #internal-docs-list not found');
      return;
    }

    docsList.innerHTML = docs.length ? docs.map(doc => `
      <li>${doc.name} (<a href="${doc.url}">${doc.url}</a>)</li>
    `).join('') : '<p>Aucun document disponible</p>';
  } catch (error) {
    console.error('Erreur updateInternalDocsList:', error);
  }
}

// ==================== FONCTIONS STATISTIQUES ====================

async function updateStats() {
  try {
    const members = await loadData('members');
    const contributions = await loadData('contributions');
    
    const totalAmount = members.reduce((sum, m) => {
      return sum + Object.entries(m.contributions).reduce((s, [name, years]) => {
        return s + Object.values(years).reduce((t, months) => {
          return t + months.filter(Boolean).length * (contributions.find(c => c.name === name)?.amount || 0);
        }, 0);
      }, 0);
    }, 0);

    console.log('Statistiques mises à jour', { totalAmount });
  } catch (error) {
    console.error('Erreur updateStats:', error);
  }
}

// ==================== FONCTIONS UTILITAIRES ====================

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function sendNotification(title, body) {
  if (!('Notification' in window)) return;
  
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

// ==================== FONCTIONS CHATBOT ====================

function toggleChatbot() {
  console.log('toggleChatbot called');
  isChatOpen = !isChatOpen;
  const chatbot = document.querySelector('#chatbot');
  if (!chatbot) {
    console.error('Chatbot element #chatbot not found');
    return;
  }
  chatbot.style.display = isChatOpen ? 'block' : 'none';
  
  if (isChatOpen) {
    const messagesContainer = document.querySelector('#chatbot-messages');
    if (!messagesContainer) {
      console.error('Chatbot messages container #chatbot-messages not found');
      return;
    }
    messagesContainer.innerHTML = `
      <div class="chatbot-message received">
        Bienvenue ! Posez une question ou utilisez un mot-clé comme "association", "membre", "cotisation", etc.
      </div>
    `;
  }
}

function handleChatbotSubmit(e) {
  e.preventDefault();
  const input = document.querySelector('#chatbot-input');
  if (!input) {
    console.error('Chatbot input #chatbot-input not found');
    return;
  }
  const message = input.value.trim();
  if (!message) return;

  const messagesContainer = document.querySelector('#chatbot-messages');
  if (!messagesContainer) {
    console.error('Chatbot messages container #chatbot-messages not found');
    return;
  }

  messagesContainer.innerHTML += `
    <div class="chatbot-message sent">${message}</div>
  `;

  const response = getChatbotResponse(message);
  
  if (response === "secret") {
    messagesContainer.innerHTML += `
      <div class="chatbot-message received">
        Veuillez entrer un mot de passe (ex. : JESUISMEMBRE66, JESUISTRESORIER444, PRESIDENT000, SECRETAIRE000)
      </div>
      <div id="secret-entry" style="display: block; margin-top: 10px;">
        <input type="password" id="secret-password" placeholder="Mot de passe">
        <button onclick="checkSecretPassword()" class="cta-button">Valider</button>
      </div>
    `;
  } else {
    messagesContainer.innerHTML += `
      <div class="chatbot-message received">${response}</div>
    `;
  }

  input.value = '';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function checkSecretPassword() {
  const password = document.querySelector('#secret-password')?.value.trim();
  const messagesContainer = document.querySelector('#chatbot-messages');
  if (!messagesContainer) {
    console.error('Chatbot messages container #chatbot-messages not found');
    return;
  }

  const adminCodes = ['JESUISMEMBRE66', '33333333', '44444444', '55555555'];
  const treasurerCodes = ['JESUISTRESORIER444', '66666666', '77777777', '88888888'];
  const presidentCodes = ['PRESIDENT000', '99999999', '11112222', '33334444'];
  const secretaryCodes = ['SECRETAIRE000', '55556666', '77778888', '99990000'];

  if (adminCodes.includes(password)) {
    currentUser = { code: 'ADMIN123', role: 'admin' };
    messagesContainer.innerHTML += `
      <div class="chatbot-message received">
        Accès admin autorisé. Redirection vers l'Espace Secret...
      </div>
    `;
    setTimeout(() => {
      showPage('secret');
      toggleChatbot();
    }, 1500);
  } else if (treasurerCodes.includes(password)) {
    currentUser = { code: 'TRESORIER', role: 'tresorier' };
    messagesContainer.innerHTML += `
      <div class="chatbot-message received">
        Accès trésorier autorisé. Redirection vers l'Espace Secret...
      </div>
    `;
    setTimeout(() => {
      showPage('secret');
      showTab('treasurer');
      toggleChatbot();
    }, 1500);
  } else if (presidentCodes.includes(password)) {
    currentUser = { code: 'PRESIDENT', role: 'president' };
    messagesContainer.innerHTML += `
      <div class="chatbot-message received">
        Accès président autorisé. Redirection vers l'Espace Secret...
      </div>
    `;
    setTimeout(() => {
      showPage('secret');
      showTab('president');
      toggleChatbot();
    }, 1500);
  } else if (secretaryCodes.includes(password)) {
    currentUser = { code: 'SECRETAIRE', role: 'secretaire' };
    messagesContainer.innerHTML += `
      <div class="chatbot-message received">
        Accès secrétaire autorisé. Redirection vers l'Espace Secret...
      </div>
    `;
    setTimeout(() => {
      showPage('secret');
      showTab('secretary');
      toggleChatbot();
    }, 1500);
  } else {
    messagesContainer.innerHTML += `
      <div class="chatbot-message received">
        Mot de passe incorrect. Essayez à nouveau.
      </div>
    `;
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function clearChatHistory() {
  const messagesContainer = document.querySelector('#chatbot-messages');
  if (messagesContainer) {
    messagesContainer.innerHTML = `
      <div class="chatbot-message received">
        Historique effacé. Posez une nouvelle question !
      </div>
    `;
  } else {
    console.error('Chatbot messages container #chatbot-messages not found');
  }
}

// Fonctions non implémentées (à adapter selon votre HTML)
function updateCoranContent() {
  console.log('updateCoranContent non implémenté');
}

function updatePersonalPage() {
  console.log('updatePersonalPage non implémenté');
}

function updateLibraryContent() {
  console.log('updateLibraryContent non implémenté');
}

function updateMessagePopups() {
  console.log('updateMessagePopups non implémenté');
}

function updateSuggestionsList() {
  console.log('updateSuggestionsList non implémenté');
}

function initVideoCall() {
  console.log('initVideoCall non implémenté');
}

function updateContributionsAdminList() {
  console.log('updateContributionsAdminList non implémenté');
}

function updatePresidentFilesList() {
  console.log('updatePresidentFilesList non implémenté');
}

function updateSecretaryFilesList() {
  console.log('updateSecretaryFilesList non implémenté');
}

function showMemberDetail(code) {
  console.log(`showMemberDetail non implémenté pour code: ${code}`);
}

function getChatbotResponse(message) {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('secret') || lowerMessage.includes('admin')) {
    return 'secret';
  }
  return 'Désolé, je ne comprends pas votre demande. Essayez des mots-clés comme "membre", "événement", ou "secret".';
}

// ==================== INITIALISATION ====================

function setupRealtimeUpdates(collection, updateFunction) {
  db.collection(collection).onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added' || change.type === 'modified' || change.type === 'removed') {
        updateFunction();
      }
    });
  }, (error) => {
    console.error(`Erreur écouteur ${collection}:`, error);
  });
}

function setupEventListeners() {
  const chatbotButton = document.querySelector('.chatbot-button');
  if (chatbotButton) {
    console.log('Chatbot button found, attaching event listener');
    chatbotButton.addEventListener('click', toggleChatbot);
  } else {
    console.error('Chatbot button (.chatbot-button) not found in DOM');
  }

  const chatbotForm = document.querySelector('#chatbot-form');
  if (chatbotForm) {
    console.log('Chatbot form found, attaching event listener');
    chatbotForm.addEventListener('submit', handleChatbotSubmit);
  } else {
    console.error('Chatbot form (#chatbot-form) not found in DOM');
  }

  const refreshButton = document.querySelector('#refresh-data');
  if (refreshButton) {
    refreshButton.addEventListener('click', async () => {
      try {
        await Promise.all([
          updateMembersList(),
          updateEventsList(),
          updateMessagesList(),
          updateGalleryContent(),
          checkAutoMessages()
        ]);
        alert('Données rafraîchies avec succès !');
      } catch (error) {
        console.error('Erreur lors du rafraîchissement:', error);
        alert('Erreur lors du rafraîchissement des données');
      }
    });
  }
}

async function initializeApp() {
  try {
    console.log('Initializing app...');
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
    }
    
    setupEventListeners();
    
    await Promise.all([
      updateMembersList(),
      updateEventsList(),
      updateGalleryContent(),
      updateMessagesList()
    ]);
    
    setupRealtimeUpdates('members', updateAllMemberLists);
    setupRealtimeUpdates('gallery', updateGalleryContent);
    setupRealtimeUpdates('events', updateEventsList);
    setupRealtimeUpdates('messages', updateMessagesList);
    setupRealtimeUpdates('autoMessages', checkAutoMessages);
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Erreur initialisation:', error);
  }
}

document.addEventListener('DOMContentLoaded', initializeApp);
