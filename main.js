// ==================== CONFIGURATION DE BASE ====================
const TOKEN = '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'; // Remplace par ton nouveau token

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

async function uploadFile(file) {
  try {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const content = reader.result.split(',')[1];
        const fileName = `gallery/${Date.now()}_${file.name}`;
        const response = await fetch(`https://api.github.com/repos/ahmedaidara/ansar1.0/contents/${fileName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
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
    case 'add-member': break;
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

// ==================== GESTION COMPLÈTE DES MEMBRES ====================
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

// Fonctions d'affichage
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

async function editMember(code) {
  try {
    const members = await loadData('members.json');
    const member = members.find(m => m.code === code);
    if (!member) return;

    const form = document.querySelector('#add-member-form');
    form.dataset.editing = code;
    document.getElementById('new-member-firstname').value = member.firstname;
    document.getElementById('new-member-lastname').value = member.lastname;
    document.getElementById('new-member-age').value = member.age || '';
    document.getElementById('new-member-dob').value = member.dob || '';
    document.getElementById('new-member-birthplace').value = member.birthplace || '';
    document.getElementById('new-member-email').value = member.email || '';
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

async function updateAllMemberLists() {
  await Promise.all([
    updateMembersList(),
    updateEditMembersList(),
    updateStats()
  ]);
}

// ==================== GESTION DE LA GALERIE ====================
document.querySelector('#add-gallery-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.querySelector('#gallery-file');
  const description = document.querySelector('#gallery-description').value.trim();
  const file = fileInput.files[0];
  try {
    const fileUrl = await uploadFile(file);
    const gallery = await loadData('gallery.json');
    gallery.push({ url: fileUrl, description, date: new Date().toISOString() });
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
    const search = document.querySelector('#gallery-admin-search').value.toLowerCase();
    const list = document.querySelector('#gallery-admin-list');
    
    list.innerHTML = gallery
      .filter(g => g.description.toLowerCase().includes(search))
      .map(g => `
        <div class="gallery-item">
          <img src="${g.url}" alt="${g.description}" class="gallery-photo">
          <p>${g.description}</p>
          <p><small>${new Date(g.date).toLocaleDateString()}</small></p>
          <button class="cta-button small danger" onclick="deleteGalleryItem('${g.url}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateGalleryAdminList:', error);
    list.innerHTML = '<p>Aucune image disponible</p>';
  }
}

async function deleteGalleryItem(url) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce média ?")) return;
  try {
    const gallery = await loadData('gallery.json');
    const updatedGallery = gallery.filter(g => g.url !== url);
    await saveData('gallery.json', updatedGallery);
    await updateGalleryAdminList();
    alert('Média supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteGalleryItem:', error);
    alert('Erreur lors de la suppression');
  }
}

// ==================== GESTION DES ÉVÉNEMENTS ====================
async function updateEventsAdminList() {
  try {
    const events = await loadData('events.json');
    const search = document.querySelector('#events-admin-search').value.toLowerCase();
    const list = document.querySelector('#events-admin-list');
    
    list.innerHTML = events
      .filter(e => e.name.toLowerCase().includes(search))
      .map(e => `
        <div class="event-card">
          <p><strong>${e.name}</strong></p>
          <p>${e.description}</p>
          <p><small>${new Date(e.date).toLocaleDateString()} ${e.time}</small></p>
          <button class="cta-button small danger" onclick="deleteEvent('${e.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateEventsAdminList:', error);
    list.innerHTML = '<p>Aucun événement disponible</p>';
  }
}

async function deleteEvent(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;
  try {
    const events = await loadData('events.json');
    const updatedEvents = events.filter(e => e.id !== id);
    await saveData('events.json', updatedEvents);
    await updateEventsAdminList();
    alert('Événement supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteEvent:', error);
    alert('Erreur lors de la suppression');
  }
}

// ==================== GESTION DES MESSAGES ====================
async function updateMessagesAdminList() {
  try {
    const messages = await loadData('messages.json');
    const search = document.querySelector('#messages-admin-search').value.toLowerCase();
    const list = document.querySelector('#messages-admin-list');
    
    list.innerHTML = messages
      .filter(m => m.title.toLowerCase().includes(search))
      .map(m => `
        <div class="message-card">
          <p><strong>${m.title}</strong></p>
          <p>${m.text}</p>
          <button class="cta-button small danger" onclick="deleteMessage('${m.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateMessagesAdminList:', error);
    list.innerHTML = '<p>Aucun message disponible</p>';
  }
}

async function deleteMessage(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;
  try {
    const messages = await loadData('messages.json');
    const updatedMessages = messages.filter(m => m.id !== id);
    await saveData('messages.json', updatedMessages);
    await updateMessagesAdminList();
    alert('Message supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteMessage:', error);
    alert('Erreur lors de la suppression');
  }
}

// ==================== FONCTIONS MANQUANTES ====================
async function updateNotesList() {
  try {
    const notes = await loadData('notes.json');
    const search = document.querySelector('#notes-search').value.toLowerCase();
    const list = document.querySelector('#notes-list');
    
    list.innerHTML = notes
      .filter(n => n.theme.toLowerCase().includes(search))
      .map(n => `
        <div class="note-card">
          <p><strong>${n.theme}</strong></p>
          <p>${n.text}</p>
          <button class="cta-button small danger" onclick="deleteNote('${n.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateNotesList:', error);
    list.innerHTML = '<p>Aucune note disponible</p>';
  }
}

async function deleteNote(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) return;
  try {
    const notes = await loadData('notes.json');
    const updatedNotes = notes.filter(n => n.id !== id);
    await saveData('notes.json', updatedNotes);
    await updateNotesList();
    alert('Note supprimée avec succès');
  } catch (error) {
    console.error('Erreur deleteNote:', error);
    alert('Erreur lors de la suppression');
  }
}

async function updateInternalDocsList() {
  try {
    const docs = await loadData('internalDocs.json');
    const search = document.querySelector('#internal-docs-search').value.toLowerCase();
    const list = document.querySelector('#internal-docs-list');
    
    list.innerHTML = docs
      .filter(d => d.category.toLowerCase().includes(search))
      .map(d => `
        <div class="doc-card">
          <p><strong>${d.category}</strong></p>
          <a href="${d.url}" target="_blank">${d.name}</a>
          <button class="cta-button small danger" onclick="deleteDoc('${d.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateInternalDocsList:', error);
    list.innerHTML = '<p>Aucun document disponible</p>';
  }
}

async function deleteDoc(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;
  try {
    const docs = await loadData('internalDocs.json');
    const updatedDocs = docs.filter(d => d.id !== id);
    await saveData('internalDocs.json', updatedDocs);
    await updateInternalDocsList();
    alert('Document supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteDoc:', error);
    alert('Erreur lors de la suppression');
  }
}

async function updateAutoMessagesList() {
  try {
    const messages = await loadData('autoMessages.json');
    const search = document.querySelector('#auto-messages-search').value.toLowerCase();
    const list = document.querySelector('#auto-messages-list');
    
    list.innerHTML = messages
      .filter(m => m.name.toLowerCase().includes(search))
      .map(m => `
        <div class="message-card">
          <p><strong>${m.name}</strong></p>
          <p>${m.text}</p>
          <p><small>Programmé: ${m.date} ${m.time}</small></p>
          <button class="cta-button small danger" onclick="deleteAutoMessage('${m.id}')">Supprimer</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateAutoMessagesList:', error);
    list.innerHTML = '<p>Aucun message automatisé disponible</p>';
  }
}

async function deleteAutoMessage(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce message automatisé ?")) return;
  try {
    const messages = await loadData('autoMessages.json');
    const updatedMessages = messages.filter(m => m.id !== id);
    await saveData('autoMessages.json', updatedMessages);
    await updateAutoMessagesList();
    alert('Message automatisé supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteAutoMessage:', error);
    alert('Erreur lors de la suppression');
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

async function initVideoCall() {
  try {
    const members = await loadData('members.json');
    const search = document.querySelector('#video-calls-search').value.toLowerCase();
    const list = document.querySelector('#members-call-list');
    
    list.innerHTML = members
      .filter(m => `${m.firstname} ${m.lastname} ${m.code}`.toLowerCase().includes(search))
      .map(m => `
        <div class="member-card">
          <input type="checkbox" id="call-${m.code}" name="call-members" value="${m.code}">
          <label for="call-${m.code}">${m.firstname} ${m.lastname} (${m.code})</label>
        </div>
      `).join('');

    const videoContainer = document.querySelector('#video-call-container');
    videoContainer.innerHTML = '<p>Chargement de l\'interface d\'appel vidéo...</p>';
  } catch (error) {
    console.error('Erreur initVideoCall:', error);
    document.querySelector('#members-call-list').innerHTML = '<p>Erreur lors du chargement des membres</p>';
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

// ==================== FONCTIONS MANQUANTES ====================
async function updateEventsList() {
  try {
    const events = await loadData('events.json');
    const search = document.querySelector('#events-search').value.toLowerCase();
    const list = document.querySelector('#events-list');
    
    list.innerHTML = events
      .filter(e => e.name.toLowerCase().includes(search))
      .map(e => `
        <div class="event-card">
          <p><strong>${e.name}</strong></p>
          <p>${e.description}</p>
          <p><small>${new Date(e.date).toLocaleDateString()} ${e.time}</small></p>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateEventsList:', error);
    list.innerHTML = '<p>Aucun événement disponible</p>';
  }
}

async function updateMessagesList() {
  try {
    const messages = await loadData('messages.json');
    const search = document.querySelector('#messages-search').value.toLowerCase();
    const list = document.querySelector('#messages-list');
    
    list.innerHTML = messages
      .filter(m => m.title.toLowerCase().includes(search))
      .map(m => `
        <div class="message-card">
          <p><strong>${m.title}</strong></p>
          <p>${m.text}</p>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateMessagesList:', error);
    list.innerHTML = '<p>Aucun message disponible</p>';
  }
}

async function checkAutoMessages() {
  try {
    const messages = await loadData('autoMessages.json');
    const now = new Date();
    messages.forEach(m => {
      const messageDate = new Date(`${m.date}T${m.time}`);
      if (messageDate <= now) {
        console.log(`Envoi du message automatisé: ${m.name}`);
        // Logique pour envoyer le message (par exemple, via une notification)
      }
    });
  } catch (error) {
    console.error('Erreur checkAutoMessages:', error);
  }
}

async function updateStats() {
  try {
    const members = await loadData('members.json');
    const contributions = await loadData('contributions.json');
    console.log('Statistiques mises à jour', { members, contributions });
  } catch (error) {
    console.error('Erreur updateStats:', error);
  }
}

function toggleChatbot() {
  const chatbot = document.querySelector('#chatbot');
  chatbot.style.display = chatbot.style.display === 'none' ? 'block' : 'none';
}

function handleChatbotSubmit(e) {
  e.preventDefault();
  const input = document.querySelector('#chatbot-input');
  const message = input.value.trim();
  if (message) {
    const messages = document.querySelector('#chatbot-messages');
    messages.innerHTML += `<p><strong>Vous:</strong> ${message}</p>`;
    messages.innerHTML += `<p><strong>Assistant:</strong> Désolé, je suis encore en développement !</p>`;
    input.value = '';
  }
}

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

  updateAllMemberLists();
  updateGalleryAdminList();
  updateEventsAdminList();
  updateMessagesAdminList();
  updateNotesList();
  updateInternalDocsList();
  updateAutoMessagesList();
}

document.addEventListener('DOMContentLoaded', initializeApp);
