// ==================== CONFIGURATION ====================
const REPO_OWNER = 'ahmedaidara';
const REPO_NAME = 'ansar1.0';
const DATA_PATH = 'data/';
const TOKEN = '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'; // REMPLACEZ PAR VOTRE VRAI TOKEN

// Vérification du token
if (!TOKEN || TOKEN.includes('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')) {
  console.error('Token GitHub non configuré!');
  alert('ERREUR : Token GitHub non configuré dans main.js');
}

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
      if (response.status === 404) {
        // Si le fichier n'existe pas, le créer avec un tableau vide
        await saveData(fileName, []);
        return [];
      }
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
    // 1. Récupérer le SHA du fichier existant
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

    // 2. Envoyer la requête
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

// ==================== FONCTIONS MEMBRES ====================
async function updateMembersList() {
  try {
    const members = await loadData('members.json');
    const search = document.querySelector('#members-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#members-list');
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

// ==================== FONCTIONS GALERIE ====================
async function updateGalleryContent() {
  try {
    const gallery = await loadData('gallery.json');
    const content = document.querySelector('#gallery-content');
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

async function addGalleryItem(item) {
  try {
    const gallery = await loadData('gallery.json');
    gallery.push(item);
    return await saveData('gallery.json', gallery);
  } catch (error) {
    console.error('Erreur addGalleryItem:', error);
    return false;
  }
}

// ==================== FONCTIONS ÉVÉNEMENTS ====================
async function updateEventsList() {
  try {
    const events = await loadData('events.json');
    const search = document.querySelector('#events-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#events-list');
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

// ==================== FONCTIONS UTILITAIRES ====================
function setupEventListeners() {
  // Membres
  document.querySelector('#add-member-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    
    const member = {
      code: `${(await loadData('members.json')).length + 1).toString().padStart(3, '0')}`,
      firstname: form.querySelector('#new-member-firstname').value,
      lastname: form.querySelector('#new-member-lastname').value,
      // ... autres champs
      photo: 'assets/images/default-photo.png'
    };

    if (await addNewMember(member)) {
      alert('Membre ajouté avec succès!');
      form.reset();
      await updateMembersList();
    }
  });

  // Galerie
  document.querySelector('#add-gallery-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = e.target.querySelector('#gallery-file');
    if (fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const item = {
      type: file.type.startsWith('image') ? 'image' : 'video',
      url: URL.createObjectURL(file),
      name: file.name,
      date: new Date().toISOString()
    };

    if (await addGalleryItem(item)) {
      alert('Élément ajouté à la galerie!');
      fileInput.value = '';
      await updateGalleryContent();
    }
  });
}

// ==================== INITIALISATION ====================
async function initializeApp() {
  // Créer les fichiers s'ils n'existent pas
  await Promise.all([
    loadData('members.json'),
    loadData('gallery.json'),
    loadData('events.json')
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
