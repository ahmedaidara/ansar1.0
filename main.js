// Configuration GitHub
const REPO_OWNER = 'ahmedaidara';
const REPO_NAME = 'ansar1.0';
const DATA_PATH = 'data/';
const TOKEN = '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'; // Remplacez par votre token GitHub

// Variables globales
let currentUser = null;
let isChatOpen = false;
let selectedCallMembers = [];
const presidentCode = '0000';

// ==================== FONCTIONS DE BASE POUR GITHUB ====================

async function loadData(fileName) {
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}${fileName}`, {
      headers: {
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(`Erreur ${response.status} lors du chargement de ${fileName}`);
    }
    
    const data = await response.json();
    return JSON.parse(atob(data.content));
  } catch (error) {
    console.error(`Erreur loadData(${fileName}):`, error);
    return [];
  }
}

async function saveData(fileName, data) {
  try {
    // Récupérer le SHA du fichier existant
    let sha = null;
    try {
      const getResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}${fileName}`, {
        headers: {
          'Authorization': `token ${TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (getResponse.ok) {
        const existingData = await getResponse.json();
        sha = existingData.sha;
      }
    } catch (e) {
      console.log(`Fichier ${fileName} non existant, création nouvelle`);
    }
    
    // Mettre à jour le fichier
    const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}${fileName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Mise à jour de ${fileName}`,
        content: btoa(JSON.stringify(data, null, 2)),
        sha: sha
      })
    });
    
    if (!updateResponse.ok) throw new Error(`Erreur ${updateResponse.status} lors de la sauvegarde`);
    return true;
  } catch (error) {
    console.error(`Erreur saveData(${fileName}):`, error);
    alert(`Erreur de sauvegarde: ${error.message}`);
    return false;
  }
}

// ==================== FONCTIONS D'INTERFACE ====================

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`#${pageId}`).classList.add('active');
  document.querySelector(`a[onclick="showPage('${pageId}')"]`).classList.add('active');
  
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
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`#${tabId}`).classList.add('active');
  document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
  
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
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// ==================== FONCTIONS MEMBRES ====================

async function updateMembersList() {
  try {
    const members = await loadData('members.json');
    const search = document.querySelector('#members-search').value.toLowerCase();
    const list = document.querySelector('#members-list');
    
    list.innerHTML = members
      .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
      .map(m => `
        <div class="member-card">
          <img src="${m.photo || 'assets/images/default-photo.png'}" alt="${m.firstname} ${m.lastname}" class="member-photo">
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
    const members = await loadData('members.json');
    const search = document.querySelector('#edit-member-search').value.toLowerCase();
    const list = document.querySelector('#edit-members-list');
    
    list.innerHTML = members
      .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
      .map(m => `
        <div class="member-card">
          <img src="${m.photo || 'assets/images/default-photo.png'}" alt="${m.firstname} ${m.lastname}" class="member-photo">
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

async function addNewMember(memberData) {
  try {
    const members = await loadData('members.json');
    members.push(memberData);
    const success = await saveData('members.json', members);
    if (success) {
      await updateMembersList();
      await updateEditMembersList();
      await updateCallMembersList();
      await updateStats();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur addNewMember:', error);
    return false;
  }
}

async function editMember(code) {
  try {
    const members = await loadData('members.json');
    const member = members.find(m => m.code === code);
    if (!member) return;

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
    
    document.querySelector('#add-member-form').dataset.editing = code;
    showTab('add-member');
  } catch (error) {
    console.error('Erreur editMember:', error);
  }
}

function confirmDeleteMember(code) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) return;
  deleteMember(code);
}

async function deleteMember(code) {
  try {
    const members = await loadData('members.json');
    const updatedMembers = members.filter(m => m.code !== code);
    const success = await saveData('members.json', updatedMembers);
    
    if (success) {
      await updateMembersList();
      await updateEditMembersList();
      await updateCallMembersList();
      await updateStats();
      alert('Membre supprimé avec succès');
    }
  } catch (error) {
    console.error('Erreur deleteMember:', error);
    alert('Erreur lors de la suppression du membre');
  }
}

// ==================== FONCTIONS ÉVÉNEMENTS ====================

async function updateEventsList() {
  try {
    const events = await loadData('events.json');
    const search = document.querySelector('#events-search').value.toLowerCase();
    const list = document.querySelector('#events-list');
    
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
    const events = await loadData('events.json');
    const list = document.querySelector('#events-admin-list');
    
    list.innerHTML = events.map((e, index) => `
      <div class="event-card">
        ${e.image ? `<img src="${e.image}" alt="${e.name}" class="event-image">` : ''}
        <div class="event-details">
          <h4>${e.name}</h4>
          <p>${e.description}</p>
          <p class="event-date">${formatDate(e.datetime)}</p>
          <button class="cta-button danger" onclick="deleteEvent(${index})">Supprimer</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur updateEventsAdminList:', error);
  }
}

async function addNewEvent(eventData) {
  try {
    const events = await loadData('events.json');
    events.push(eventData);
    const success = await saveData('events.json', events);
    
    if (success) {
      await updateEventsList();
      await updateEventsAdminList();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur addNewEvent:', error);
    return false;
  }
}

async function deleteEvent(index) {
  try {
    const events = await loadData('events.json');
    events.splice(index, 1);
    const success = await saveData('events.json', events);
    
    if (success) {
      await updateEventsList();
      await updateEventsAdminList();
      alert('Événement supprimé avec succès');
    }
  } catch (error) {
    console.error('Erreur deleteEvent:', error);
    alert('Erreur lors de la suppression de l\'événement');
  }
}

// ==================== FONCTIONS GALERIE ====================

async function updateGalleryContent() {
  try {
    const gallery = await loadData('gallery.json');
    const content = document.querySelector('#gallery-content');
    
    content.innerHTML = gallery.map(item => `
      <div class="gallery-item">
        ${item.type === 'image' ? 
          `<img src="${item.url}" alt="${item.name}" class="gallery-image">` : 
          `<video src="${item.url}" controls class="gallery-video"></video>`}
        <p class="gallery-item-name">${item.name}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur updateGalleryContent:', error);
  }
}

async function updateGalleryAdminList() {
  try {
    const gallery = await loadData('gallery.json');
    const list = document.querySelector('#gallery-admin-list');
    
    list.innerHTML = gallery.map((item, index) => `
      <div class="gallery-item-admin">
        ${item.type === 'image' ? 
          `<img src="${item.url}" alt="${item.name}" class="gallery-image">` : 
          `<video src="${item.url}" controls class="gallery-video"></video>`}
        <p class="gallery-item-name">${item.name}</p>
        <button class="cta-button danger" onclick="deleteGalleryItem(${index})">Supprimer</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur updateGalleryAdminList:', error);
  }
}

async function addGalleryItem(item) {
  try {
    const gallery = await loadData('gallery.json');
    gallery.push(item);
    const success = await saveData('gallery.json', gallery);
    
    if (success) {
      await updateGalleryContent();
      await updateGalleryAdminList();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur addGalleryItem:', error);
    return false;
  }
}

async function deleteGalleryItem(index) {
  try {
    const gallery = await loadData('gallery.json');
    gallery.splice(index, 1);
    const success = await saveData('gallery.json', gallery);
    
    if (success) {
      await updateGalleryContent();
      await updateGalleryAdminList();
      alert('Élément supprimé avec succès');
    }
  } catch (error) {
    console.error('Erreur deleteGalleryItem:', error);
    alert('Erreur lors de la suppression de l\'élément');
  }
}

// ==================== FONCTIONS MESSAGES ====================

async function updateMessagesList() {
  try {
    const messages = await loadData('messages.json');
    const list = document.querySelector('#messages-list');
    
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
    const messages = await loadData('messages.json');
    const list = document.querySelector('#messages-admin-list');
    
    list.innerHTML = messages.map((msg, index) => `
      <div class="message-card">
        <h4>${msg.title}</h4>
        <p>${msg.text}</p>
        <p class="message-date">${formatDate(msg.date)}</p>
        <button class="cta-button danger" onclick="deleteMessage(${index})">Supprimer</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur updateMessagesAdminList:', error);
  }
}

async function addNewMessage(message) {
  try {
    const messages = await loadData('messages.json');
    messages.unshift(message);
    const success = await saveData('messages.json', messages);
    
    if (success) {
      await updateMessagesList();
      await updateMessagesAdminList();
      await updateMessagePopups();
      sendNotification('Nouveau message', `${message.title}: ${message.text}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur addNewMessage:', error);
    return false;
  }
}

async function deleteMessage(index) {
  try {
    const messages = await loadData('messages.json');
    messages.splice(index, 1);
    const success = await saveData('messages.json', messages);
    
    if (success) {
      await updateMessagesList();
      await updateMessagesAdminList();
      await updateMessagePopups();
      alert('Message supprimé avec succès');
    }
  } catch (error) {
    console.error('Erreur deleteMessage:', error);
    alert('Erreur lors de la suppression du message');
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

// ==================== INITIALISATION ====================

async function initializeApp() {
  // Vérifier le mode sombre
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
  
  // Configurer la synchronisation périodique
  setInterval(async () => {
    if (currentUser) {
      try {
        await updateMembersList();
        await updateEventsList();
        await updateMessagesList();
        await checkAutoMessages();
      } catch (error) {
        console.error('Erreur synchronisation:', error);
      }
    }
  }, 30000);
  
  // Charger les données initiales
  try {
    await updateMembersList();
    await updateEventsList();
    await updateGalleryContent();
    await updateMessagesList();
    await updateMessagePopups();
  } catch (error) {
    console.error('Erreur initialisation:', error);
  }
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', initializeApp);
