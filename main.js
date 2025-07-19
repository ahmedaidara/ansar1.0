// Configuration GitHub - À METTUR EN TOUT DÉBUT DU FICHIER
const REPO_OWNER = 'ahmedaidara';
const REPO_NAME = 'ansar1.0';
const DATA_PATH = 'data/';
const TOKEN = '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'; // REMPLACEZ PAR VOTRE VRAI TOKEN



// Variables globales
let currentUser = null;
let isChatOpen = false;
let selectedCallMembers = [];
const presidentCode = '0000';




// ==================== FONCTIONS DE BASE POUR GITHUB ====================

// ==================== FONCTIONS DE BASE ====================
async function loadData(file, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`https://api.github.com/repos/ahmedaidara/ansar1.0/contents/data/${file}`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.error(`Erreur 401: Vérifiez le token GitHub ou ses permissions pour ${file}`);
        }
        throw new Error(`Erreur ${response.status} lors du chargement de ${file}`);
      }
      const data = await response.json();
      return JSON.parse(atob(data.content));
    } catch (error) {
      if (attempt === retries) {
        console.error(`Erreur loadData(${file}) après ${retries} tentatives:`, error);
        return [];
      }
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

async function saveData(file, data, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const currentData = await loadData(file);
      const response = await fetch(`https://api.github.com/repos/ahmedaidara/ansar1.0/contents/data/${file}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          message: `Mise à jour de ${file}`,
          content: btoa(JSON.stringify(data, null, 2)),
          sha: currentData.sha || (await (await fetch(`https://api.github.com/repos/ahmedaidara/ansar1.0/contents/data/${file}`, {
            headers: { 'Authorization': `Bearer ${TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
          })).json()).sha
        })
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.error(`Erreur 401: Vérifiez le token GitHub ou ses permissions pour ${file}`);
        }
        throw new Error(`Erreur ${response.status}: Bad credentials`);
      }
      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        console.error(`Erreur saveData(${file}) après ${retries} tentatives:`, error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

    // Déclencher une mise à jour immédiate après sauvegarde
    switch (fileName) {
      case 'members.json':
        await updateAllMemberLists();
        break;
      case 'gallery.json':
        await updateGalleryContent();
        await updateGalleryAdminList();
        break;
      case 'events.json':
        await updateEventsList();
        await updateEventsAdminList();
        break;
      case 'messages.json':
        await updateMessagesList();
        await updateMessagesAdminList();
        break;
    }

    return true;
  } catch (error) {
    console.error(`Erreur saveData(${fileName}):`, error);
    alert(`Erreur de sauvegarde: ${error.message}`);
    return false;
  }
}


async function updateNotesList() {
  try {
    const notes = await loadData('notes.json');
    const notesList = document.querySelector('#notes-list');
    if (!notesList) {
      console.error('Element #notes-list not found');
      return;
    }
    notesList.innerHTML = notes.length ? notes.map(note => `<li>${note.title}: ${note.content}</li>`).join('') : '<p>Aucune note disponible</p>';
  } catch (error) {
    console.error('Erreur updateNotesList:', error);
  }
}

async function updateInternalDocsList() {
  try {
    const docs = await loadData('internalDocs.json');
    const docsList = document.querySelector('#internal-docs-list');
    if (!docsList) {
      console.error('Element #internal-docs-list not found');
      return;
    }
    docsList.innerHTML = docs.length ? docs.map(doc => `<li>${doc.name} (<a href="${doc.url}">${doc.url}</a>)</li>`).join('') : '<p>Aucun document disponible</p>';
  } catch (error) {
    console.error('Erreur updateInternalDocsList:', error);
  }
}

async function updateAutoMessagesList() {
  try {
    const autoMessages = await loadData('autoMessages.json');
    const autoMessagesList = document.querySelector('#auto-messages-list');
    if (!autoMessagesList) {
      console.error('Element #auto-messages-list not found');
      return;
    }
    autoMessagesList.innerHTML = autoMessages.length ? autoMessages.map(msg => `<li>${msg.content} (Programmé: ${msg.date})</li>`).join('') : '<p>Aucun message automatique disponible</p>';
  } catch (error) {
    console.error('Erreur updateAutoMessagesList:', error);
  }
}


async function updateSuggestionsList() {
  try {
    const suggestions = await loadData('suggestions.json');
    const search = document.querySelector('#suggestions-search').value.toLowerCase();
    const list = document.querySelector('#suggestions-list');
    
    list.innerHTML = suggestions
      .filter(s => s.text.toLowerCase().includes(search))
      .map(s => `
        <div class="suggestion-card">
          <p><strong>Suggestion de ${s.memberName || 'Anonyme'}</strong></p>
          <p>${s.text}</p>
          <p><small>${new Date(s.date).toLocaleDateString()}</small></p>
          <button class="cta-button small danger" onclick="deleteSuggestion('${s.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateSuggestionsList:', error);
    list.innerHTML = '<p>Aucune suggestion disponible</p>';
  }
}

async function deleteSuggestion(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette suggestion ?")) return;
  try {
    const suggestions = await loadData('suggestions.json');
    const updatedSuggestions = suggestions.filter(s => s.id !== id);
    await saveData('suggestions.json', updatedSuggestions);
    await updateSuggestionsList();
    alert('Suggestion supprimée avec succès');
  } catch (error) {
    console.error('Erreur deleteSuggestion:', error);
    alert('Erreur lors de la suppression');
  }
}

// ==================== FONCTIONS D'INTERFACE ====================

function showPage(pageId) {
  try {
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');
    
    if (!pages || !navItems) {
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


async function updateContributionsAdminList() {
  try {
    const contributions = await loadData('contributions.json');
    const search = document.querySelector('#contributions-admin-search').value.toLowerCase();
    const list = document.querySelector('#contributions-admin-list');
    
    list.innerHTML = contributions
      .filter(c => c.name.toLowerCase().includes(search))
      .map(c => `
        <div class="contribution-card">
          <p><strong>${c.name}</strong></p>
          <p>Montant: ${c.amount} FCFA</p>
          <button class="cta-button small danger" onclick="deleteContribution('${c.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateContributionsAdminList:', error);
    list.innerHTML = '<p>Aucune cotisation disponible</p>';
  }
}

async function deleteContribution(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette cotisation ?")) return;
  try {
    const contributions = await loadData('contributions.json');
    const updatedContributions = contributions.filter(c => c.id !== id);
    await saveData('contributions.json', updatedContributions);
    await updateContributionsAdminList();
    alert('Cotisation supprimée avec succès');
  } catch (error) {
    console.error('Erreur deleteContribution:', error);
    alert('Erreur lors de la suppression');
  }
}

async function updatePresidentFilesList() {
  try {
    const files = await loadData('presidentFiles.json');
    const search = document.querySelector('#president-files-search').value.toLowerCase();
    const list = document.querySelector('#president-files-list');
    
    list.innerHTML = files
      .filter(f => f.category.toLowerCase().includes(search))
      .map(f => `
        <div class="file-card">
          <p><strong>${f.category}</strong></p>
          <a href="${f.url}" target="_blank">${f.name}</a>
          <button class="cta-button small danger" onclick="deletePresidentFile('${f.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updatePresidentFilesList:', error);
    list.innerHTML = '<p>Aucun fichier disponible</p>';
  }
}

async function deletePresidentFile(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) return;
  try {
    const files = await loadData('presidentFiles.json');
    const updatedFiles = files.filter(f => f.id !== id);
    await saveData('presidentFiles.json', updatedFiles);
    await updatePresidentFilesList();
    alert('Fichier supprimé avec succès');
  } catch (error) {
    console.error('Erreur deletePresidentFile:', error);
    alert('Erreur lors de la suppression');
  }
}

async function updateSecretaryFilesList() {
  try {
    const files = await loadData('secretaryFiles.json');
    const search = document.querySelector('#secretary-files-search').value.toLowerCase();
    const list = document.querySelector('#secretary-files-list');
    
    list.innerHTML = files
      .filter(f => f.category.toLowerCase().includes(search))
      .map(f => `
        <div class="file-card">
          <p><strong>${f.category}</strong></p>
          <a href="${f.url}" target="_blank">${f.name}</a>
          <button class="cta-button small danger" onclick="deleteSecretaryFile('${f.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateSecretaryFilesList:', error);
    list.innerHTML = '<p>Aucun fichier disponible</p>';
  }
}

async function deleteSecretaryFile(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) return;
  try {
    const files = await loadData('secretaryFiles.json');
    const updatedFiles = files.filter(f => f.id !== id);
    await saveData('secretaryFiles.json', updatedFiles);
    await updateSecretaryFilesList();
    alert('Fichier supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteSecretaryFile:', error);
    alert('Erreur lors de la suppression');
  }
}


// ==================== GESTION DES ONGLETS ====================
function showTab(tabId) {
  const tabContent = document.querySelector(`#${tabId}`);
  const tabButton = document.querySelector(`button[onclick="showTab('${tabId}')"]`);

  if (!tabContent || !tabButton) {
    console.error(`Tab content or button for ${tabId} not found`);
    return;
  }

  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

  tabContent.classList.add('active');
  tabButton.classList.add('active');

  switch (tabId) {
    case 'add-member': break; // Pas d'action nécessaire
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
    case 'treasurer-contributions': updateContributionsAdminList(); break;
    case 'president-files': updatePresidentFilesList(); break;
    case 'secretary-files': updateSecretaryFilesList(); break;
    default: console.warn(`No action defined for tab ${tabId}`);
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// ==================== FONCTIONS MEMBRES ====================

// ==================== GESTION COMPLÈTE DES MEMBRES ====================

// Écouteur pour le formulaire d'ajout/modification
document.querySelector('#add-member-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const members = await loadData('members.json');
  const isEditing = e.target.dataset.editing;
  const photoInput = document.getElementById('new-member-photo');

  const memberData = {
    code: isEditing || generateMemberCode(members),
    firstname: document.getElementById('new-member-firstname').value.trim(),
    lastname: document.getElementById('new-member-lastname').value.trim(),
    age: parseInt(document.getElementById('new-member-age').value) || null,
    dob: document.getElementById('new-member-dob').value || null,
    birthplace: document.getElementById('new-member-birthplace').value.trim() || null,
    photo: await handlePhotoUpload(photoInput),
    email: document.getElementById('new-member-email').value.trim() || null,
    activity: document.getElementById('new-member-activity').value.trim() || null,
    address: document.getElementById('new-member-address').value.trim() || null,
    phone: document.getElementById('new-member-phone').value.trim() || null,
    residence: document.getElementById('new-member-residence').value.trim() || null,
    role: document.getElementById('new-member-role').value || 'membre',
    status: document.getElementById('new-member-status').value || 'actif',
    contributions: initializeContributions()
  };

  try {
    if (isEditing) {
      await updateExistingMember(members, memberData, isEditing);
    } else {
      await addNewMember(members, memberData);
    }

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
function generateMemberCode(members) {
  return `${(members.length + 1).toString().padStart(3, '0')}`;
}

async function handlePhotoUpload(photoInput) {
  if (photoInput.files.length > 0) {
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

// Opérations CRUD
async function updateExistingMember(members, memberData, code) {
  const index = members.findIndex(m => m.code === code);
  if (index === -1) throw new Error('Membre introuvable');
  members[index] = memberData;
  await saveData('members.json', members);
}

async function addNewMember(members, memberData) {
  members.push(memberData);
  await saveData('members.json', members);
}

// Fonctions d'affichage (conservez vos anciennes fonctions avec améliorations)
async function updateMembersList() {
  try {
    const members = await loadData('members.json');
    const search = document.querySelector('#members-search').value.toLowerCase();
    const list = document.querySelector('#members-list');
    
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
    const members = await loadData('members.json');
    const search = document.querySelector('#edit-member-search').value.toLowerCase();
    const list = document.querySelector('#edit-members-list');
    
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

// Fonctions d'édition/suppression (améliorées)
async function editMember(code) {
  try {
    const members = await loadData('members.json');
    const member = members.find(m => m.code === code);
    if (!member) return;

    // Remplissage du formulaire
    const form = document.querySelector('#add-member-form');
    form.dataset.editing = code;
    document.getElementById('new-member-firstname').value = member.firstname;
    document.getElementById('new-member-lastname').value = member.lastname;
    // ... (autres champs comme dans votre ancienne version)

    showTab('add-member');
  } catch (error) {
    console.error('Erreur editMember:', error);
    alert('Erreur lors du chargement des données du membre');
  }
}

async function confirmDeleteMember(code) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce membre ?")) return;
  
  try {
    const members = await loadData('members.json');
    const updatedMembers = members.filter(m => m.code !== code);
    await saveData('members.json', updatedMembers);
    await updateAllMemberLists();
    alert('Membre supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteMember:', error);
    alert('Erreur lors de la suppression');
  }
}

// Mise à jour globale
async function updateAllMemberLists() {
  await Promise.all([
    updateMembersList(),
    updateEditMembersList(),
    updateStats()
  ]);
}

// ==================== FONCTIONS MANQUANTES ====================

async function updateGalleryContent() {
  try {
    const gallery = await loadData('gallery.json');
    const content = document.querySelector('#gallery-content');
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

async function checkAutoMessages() {
  try {
    const autoMessages = await loadData('autoMessages.json');
    const messages = await loadData('messages.json');
    const now = new Date();

    for (let i = autoMessages.length - 1; i >= 0; i--) {
      if (new Date(autoMessages[i].datetime) <= now) {
        messages.unshift({
          title: autoMessages[i].name,
          text: autoMessages[i].text,
          date: now.toISOString()
        });
        
        autoMessages.splice(i, 1);
        await saveData('autoMessages.json', autoMessages);
        await saveData('messages.json', messages);
        
        sendNotification('Message automatisé', `${autoMessages[i].name}: ${autoMessages[i].text}`);
      }
    }
  } catch (error) {
    console.error('Erreur checkAutoMessages:', error);
  }
}

async function updateStats() {
  try {
    const members = await loadData('members.json');
    const contributions = await loadData('contributions.json');
    
    const totalAmount = members.reduce((sum, m) => {
      return sum + Object.entries(m.contributions).reduce((s, [name, years]) => {
        return s + Object.values(years).reduce((t, months) => {
          return t + months.filter(Boolean).length * (contributions.find(c => c.name === name)?.amount || 0);
        }, 0);
      }, 0);
    }, 0);

    // Mettez à jour vos graphiques ici...
    console.log('Statistiques mises à jour', { totalAmount });
  } catch (error) {
    console.error('Erreur updateStats:', error);
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



document.querySelector('#refresh-data')?.addEventListener('click', async () => {
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
// ==================== FONCTIONS GALERIE ====================

// ==================== GESTION DE LA GALERIE ====================

document.querySelector('#add-gallery-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.querySelector('#gallery-file');
  const description = document.querySelector('#gallery-description').value.trim();
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Veuillez sélectionner un fichier');
    return;
  }

  try {
    const fileUrl = await uploadFile(file);
    const gallery = await loadData('gallery.json');
    
    gallery.push({
      type: file.type.startsWith('image') ? 'image' : 'video',
      url: fileUrl,
      name: file.name,
      description: description || 'Pas de description',
      date: new Date().toISOString()
    });

    await saveData('gallery.json', gallery);
    await updateGalleryAdminList();
    
    fileInput.value = '';
    document.querySelector('#gallery-description').value = '';
    alert('Média ajouté avec succès');
  } catch (error) {
    console.error("Erreur d'ajout à la galerie:", error);
    alert("Erreur lors de l'ajout du média");
  }
});

async function updateGalleryAdminList() {
  try {
    const gallery = await loadData('gallery.json');
    const search = document.querySelector('#gallery-admin-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#gallery-admin-list');
    
    if (!list) return;

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
            <button class="cta-button danger" onclick="deleteGalleryItem('${g.url}')">Supprimer</button>
          </div>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateGalleryAdminList:', error);
    const list = document.querySelector('#gallery-admin-list');
    if (list) list.innerHTML = '<p>Aucun média disponible</p>';
  }
}

async function deleteGalleryItem(url) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce média ?")) return;
  
  try {
    const gallery = await loadData('gallery.json');
    const updatedGallery = gallery.filter(g => g.url !== url);
    await saveData('gallery.json', updatedGallery);
    await updateGalleryAdminList();
    alert('Média supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteGalleryItem:', error);
    alert('Erreur lors de la suppression du média');
  }
}


function clearChatHistory() {
  const messagesContainer = document.querySelector('#chatbot-messages');
  if (messagesContainer) {
    messagesContainer.innerHTML = `
      <div class="chatbot-message received">
        Historique effacé. Posez une nouvelle question !
      </div>
    `;
  }
}


async function uploadFile(file) {
  try {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const content = reader.result.split(',')[1]; // Obtenir le contenu en base64
        const fileName = `gallery/${Date.now()}_${file.name}`;
        const response = await fetch(`https://api.github.com/repos/ahmedaidara/ansar1.0/contents/${fileName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: `Upload ${file.name}`,
            content: content
          })
        });
        if (!response.ok) {
          throw new Error(`Erreur ${response.status} lors de l'upload de ${file.name}`);
        }
        const data = await response.json();
        resolve(data.content.download_url);
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Erreur uploadFile:', error);
    throw error;
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

// Chatbot functions
function toggleChatbot() {
  isChatOpen = !isChatOpen;
  const chatbot = document.querySelector('#chatbot');
  chatbot.style.display = isChatOpen ? 'block' : 'none';
  
  if (isChatOpen) {
    document.querySelector('#chatbot-messages').innerHTML = `
      <div class="chatbot-message received">
        Bienvenue ! Posez une question ou utilisez un mot-clé comme "association", "membre", "cotisation", etc.
      </div>
    `;
  }
}

function handleChatbotSubmit(e) {
  e.preventDefault();
  const input = document.querySelector('#chatbot-input');
  const message = input.value.trim();
  if (!message) return;

  const messagesContainer = document.querySelector('#chatbot-messages');
  
  // Ajouter le message de l'utilisateur
  messagesContainer.innerHTML += `
    <div class="chatbot-message sent">${message}</div>
  `;

  // Obtenir et afficher la réponse
  const response = getChatbotResponse(message);
  
  if (response === "secret") {
    // Afficher le champ pour le mot de passe secret
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
  const password = document.querySelector('#secret-password').value.trim();
  const messagesContainer = document.querySelector('#chatbot-messages');
  
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
  } 
  else if (treasurerCodes.includes(password)) {
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
  }
  else if (presidentCodes.includes(password)) {
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
  }
  else if (secretaryCodes.includes(password)) {
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
  }
  else {
    messagesContainer.innerHTML += `
      <div class="chatbot-message received">
        Mot de passe incorrect. Essayez à nouveau.
      </div>
    `;
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Initialisation du chatbot
// Initialisation du chatbot
const chatbotButton = document.querySelector('.chatbot-button');
if (chatbotButton) {
  chatbotButton.addEventListener('click', toggleChatbot);
} else {
  console.error("Le bouton du chatbot (.chatbot-button) n'a pas été trouvé dans le DOM.");
}

// Initialisation du formulaire du chatbot
const chatbotForm = document.querySelector('#chatbot-form');
if (chatbotForm) {
  chatbotForm.addEventListener('submit', handleChatbotSubmit);
} else {
  console.error("Le formulaire du chatbot (#chatbot-form) n'a pas été trouvé dans le DOM.");
}

// ==================== INITIALISATION ====================

// ==================== INITIALISATION ====================
function initializeApp() {
  const chatbotButton = document.querySelector('.chatbot-button');
  if (chatbotButton) {
    chatbotButton.addEventListener('click', toggleChatbot);
  }

  const chatbotForm = document.querySelector('#chatbot-form');
  if (chatbotForm) {
    chatbotForm.addEventListener('submit', handleChatbotSubmit);
  }

  const refreshButton = document.querySelector('#refresh-data');
  if (refreshButton) {
    refreshButton.addEventListener('click', async () => {
      await updateAllMemberLists();
      await updateEventsList();
      await updateMessagesList();
      await updateGalleryAdminList();
      await checkAutoMessages();
    });
  }

  setInterval(async () => {
    try {
      await Promise.all([
        updateMembersList(),
        updateEventsList(),
        updateMessagesList(),
        checkAutoMessages()
      ]);
    } catch (error) {
      console.error('Erreur lors de la mise à jour périodique:', error);
    }
  }, 10000);

  // Appeler les fonctions d'initialisation
  updateAllMemberLists();
  updateGalleryAdminList();
  updateEventsAdminList();
  updateMessagesAdminList();
  updateNotesList();
  updateInternalDocsList();
  updateAutoMessagesList();
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', initializeApp);
