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
  try {
    // Masquer toutes les pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    
    // Désactiver tous les éléments de navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Afficher la page demandée
    const pageElement = document.getElementById(pageId);
    if (pageElement) {
      pageElement.classList.add('active');
    }
    
    // Activer l'élément de navigation correspondant
    const navElements = document.querySelectorAll(`[data-page="${pageId}"]`);
    navElements.forEach(el => {
      el.classList.add('active');
    });
    
    // Charger le contenu spécifique à la page
    switch(pageId) {
      case 'members': 
        updateMembersList(); 
        break;
      case 'events': 
        updateEventsList(); 
        break;
      case 'gallery': 
        updateGalleryContent(); 
        break;
      case 'messages': 
        updateMessagesList(); 
        break;
      case 'coran': 
        updateCoranContent(); 
        break;
      case 'personal': 
        updatePersonalPage(); 
        break;
      case 'library': 
        updateLibraryContent(); 
        break;
      case 'home': 
        updateMessagePopups(); 
        break;
      case 'secret': 
        if (currentUser) showTab('stats'); 
        break;
    }
  } catch (error) {
    console.error('Erreur dans showPage:', error);
  }
}

function showTab(tabId) {
  try {
    // Masquer tous les onglets
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Désactiver tous les boutons d'onglets
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Afficher l'onglet demandé
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
      tabElement.classList.add('active');
    }
    
    // Activer le bouton correspondant
    const tabButtons = document.querySelectorAll(`[data-tab="${tabId}"]`);
    tabButtons.forEach(btn => {
      btn.classList.add('active');
    });
    
    // Charger le contenu spécifique à l'onglet
    switch(tabId) {
      case 'edit-member': 
        updateEditMembersList(); 
        break;
      case 'gallery-admin': 
        updateGalleryAdminList(); 
        break;
      case 'events-admin': 
        updateEventsAdminList(); 
        break;
      case 'messages-admin': 
        updateMessagesAdminList(); 
        break;
      case 'stats': 
        updateStats(); 
        break;
    }
  } catch (error) {
    console.error('Erreur dans showTab:', error);
  }
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

// ==================== INITIALISATION ====================
function setupEventListeners() {
  // Navigation principale
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageId = this.getAttribute('data-page');
      showPage(pageId);
    });
  });

  // Onglets
  document.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const tabId = this.getAttribute('data-tab');
      showTab(tabId);
    });
  });

  // Formulaire d'ajout de membre
  const addMemberForm = document.getElementById('add-member-form');
  if (addMemberForm) {
    addMemberForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const member = {
        code: `${(await loadData('members.json')).length + 1}`.padStart(3, '0'),
        firstname: this.querySelector('#new-member-firstname').value,
        lastname: this.querySelector('#new-member-lastname').value,
        // ... autres champs
        photo: 'assets/images/default-photo.png'
      };

      if (await addNewMember(member)) {
        alert('Membre ajouté avec succès!');
        this.reset();
        await updateMembersList();
      }
    });
  }
}

async function initializeApp() {
  try {
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

    // Afficher la page d'accueil par défaut
    showPage('home');
  } catch (error) {
    console.error('Erreur initialisation:', error);
  }
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', initializeApp);
