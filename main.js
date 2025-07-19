// ==================== CONFIGURATION ====================
const REPO_OWNER = 'ahmedaidara';
const REPO_NAME = 'ansar1.0';
const DATA_PATH = 'data/';
const TOKEN = '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';
const presidentCode = '0000';

// Variables globales
let currentUser = null;
let isChatOpen = false;
let selectedCallMembers = [];

// ==================== FONCTIONS DE BASE ====================
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
      throw new Error(`Erreur ${response.status}`);
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
    let sha = null;
    try {
      const getResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}${fileName}`, {
        headers: {
          'Authorization': `token ${TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getResponse.ok) sha = (await getResponse.json()).sha;
    } catch (e) { console.log(`Fichier ${fileName} non existant`); }

    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}${fileName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Mise à jour ${fileName}`,
        content: btoa(JSON.stringify(data, null, 2)),
        sha: sha
      })
    });

    if (!response.ok) throw new Error(`Erreur ${response.status}`);
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
  document.getElementById(pageId)?.classList.add('active');
  document.querySelector(`a[onclick*="${pageId}"]`)?.classList.add('active');

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
  document.getElementById(tabId)?.classList.add('active');
  document.querySelector(`button[onclick*="${tabId}"]`)?.classList.add('active');

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
    const search = document.getElementById('members-search')?.value.toLowerCase() || '';
    const list = document.getElementById('members-list');
    if (!list) return;

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

async function addNewMember(memberData) {
  try {
    const members = await loadData('members.json');
    members.push(memberData);
    return await saveData('members.json', members);
  } catch (error) {
    console.error('Erreur addNewMember:', error);
    return false;
  }
}

// ==================== ÉVÉNEMENTS ====================
async function updateEventsList() {
  try {
    const events = await loadData('events.json');
    const search = document.getElementById('events-search')?.value.toLowerCase() || '';
    const list = document.getElementById('events-list');
    if (!list) return;

    list.innerHTML = events
      .filter(e => e.name.toLowerCase().includes(search) || e.description.toLowerCase().includes(search))
      .map(e => `
        <div class="event-card">
          ${e.image ? `<img src="${e.image}" alt="${e.name}" class="event-image">` : ''}
          <div class="event-details">
            <h4>${e.name}</h4>
            <p>${e.description}</p>
            <p class="event-date">${new Date(e.datetime).toLocaleString()}</p>
          </div>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateEventsList:', error);
  }
}

// ==================== GALERIE ====================
async function updateGalleryContent() {
  try {
    const gallery = await loadData('gallery.json');
    const content = document.getElementById('gallery-content');
    if (!content) return;

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

// ==================== INITIALISATION ====================
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('[onclick^="showPage("]').forEach(el => {
    el.addEventListener('click', (e) => {
      const pageId = e.target.getAttribute('onclick').match(/showPage\('([^']+)'/)[1];
      showPage(pageId);
    });
  });

  // Formulaire membre
  document.getElementById('add-member-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    
    const member = {
      code: `${(await loadData('members.json')).length + 1).toString().padStart(3, '0')}`,
      firstname: form.querySelector('#new-member-firstname').value,
      lastname: form.querySelector('#new-member-lastname').value,
      age: parseInt(form.querySelector('#new-member-age').value) || null,
      dob: form.querySelector('#new-member-dob').value || null,
      birthplace: form.querySelector('#new-member-birthplace').value || null,
      photo: 'assets/images/default-photo.png',
      email: form.querySelector('#new-member-email').value || null,
      activity: form.querySelector('#new-member-activity').value || null,
      address: form.querySelector('#new-member-address').value || null,
      phone: form.querySelector('#new-member-phone').value || null,
      residence: form.querySelector('#new-member-residence').value || null,
      role: form.querySelector('#new-member-role').value || 'membre',
      status: form.querySelector('#new-member-status').value || 'actif',
      contributions: { 
        'Mensuelle': { 
          '2023': Array(12).fill(false), 
          '2024': Array(12).fill(false), 
          '2025': Array(12).fill(false) 
        }
      }
    };

    if (await addNewMember(member)) {
      alert('Membre ajouté avec succès!');
      form.reset();
      await updateMembersList();
    }
  });
}

async function initializeApp() {
  // Vérifier les fichiers de données
  await Promise.all([
    loadData('members.json'),
    loadData('events.json'),
    loadData('gallery.json')
  ]);

  // Configurer les écouteurs
  setupEventListeners();

  // Charger les données initiales
  await Promise.all([
    updateMembersList(),
    updateEventsList(),
    updateGalleryContent()
  ]);

  // Synchronisation périodique
  setInterval(async () => {
    await updateMembersList();
    await updateEventsList();
  }, 30000);
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', initializeApp);
