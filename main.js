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

// Authentification anonyme
auth.signInAnonymously().catch(error => {
  console.error('Erreur lors de l\'authentification anonyme:', error);
});

// Variables globales
let currentUser = null;
let isChatOpen = false;
let selectedCallMembers = [];
const presidentCode = '0000';

// ==================== INITIALISATION ====================

document.addEventListener('DOMContentLoaded', () => {
  // Initialiser le thème
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

  // Initialiser le chatbot
  initChatbot();

  // Charger les données initiales
  updateMessagePopups();
  checkAutoMessages();

  // Ajouter les écouteurs d'événements
  document.querySelector('#refresh-data')?.addEventListener('click', () => {
    updateMembersList();
    updateEventsList();
    updateGalleryContent();
    updateMessagesList();
    updateCoranContent();
    updateLibraryContent();
  });
});

// ==================== FONCTIONS DE BASE POUR FIRESTORE ====================

async function loadData(collection) {
  try {
    const snapshot = await db.collection(collection).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Erreur loadData(${collection}):`, error);
    return [];
  }
}

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

async function uploadFile(file, path) {
  try {
    const storageRef = storage.ref(`${path}/${Date.now()}_${file.name}`);
    const snapshot = await storageRef.put(file);
    return await snapshot.ref.getDownloadURL();
  } catch (error) {
    console.error('Erreur uploadFile:', error);
    throw error;
  }
}

async function updateTreasurerContributionsList() {
  try {
    const members = await loadData('members');
    const contributions = await loadData('contributions');
    const search = document.querySelector('#treasurer-contributions-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#treasurer-contributions-list');
    const content = document.querySelector('#treasurer-contributions-content');
    if (!list || !content) {
      console.error('Élément #treasurer-contributions-list ou #treasurer-contributions-content introuvable');
      return;
    }

    // Afficher les cotisations globales en haut
    content.innerHTML = `
      <h3>Cotisations Globales</h3>
      ${contributions.length ? contributions.map(c => `
        <div class="contribution-card">
          <p><strong>${c.name}</strong>: ${c.amount} FCFA</p>
          <button class="cta-button" onclick="manageGlobalContribution('${c.id}', '${c.name}')">Gérer Paiements</button>
          <button class="cta-button danger" onclick="deleteGlobalContribution('${c.id}', '${c.name}')">Supprimer</button>
        </div>
      `).join('') : '<p>Aucune cotisation globale disponible</p>'}
      <h3>Liste des Membres</h3>
    `;

    // Afficher la liste des membres pour les cotisations mensuelles
    list.innerHTML = members
      .filter(m => `${m.firstname} ${m.lastname} ${m.code}`.toLowerCase().includes(search))
      .map(m => `
        <div class="member-card" onclick="manageMemberContributions('${m.code}')">
          <img src="${m.photo || 'assets/images/default-photo.png'}" alt="${m.firstname} ${m.lastname}" class="member-photo">
          <div>
            <p><strong>${m.firstname} ${m.lastname}</strong></p>
            <p><small>${m.code} • ${m.role}</small></p>
          </div>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateTreasurerContributionsList:', error);
  }
}
async function manageMemberContributions(code) {
  try {
    const members = await loadData('members');
    const member = members.find(m => m.code === code);
    if (!member) {
      alert('Membre introuvable');
      return;
    }

    const contributionsContainer = document.querySelector('#treasurer-contributions-content');
    if (!contributionsContainer) {
      console.error('Élément #treasurer-contributions-content introuvable');
      return;
    }

    contributionsContainer.innerHTML = `
      <h3>Cotisations de ${member.firstname} ${member.lastname} (${member.code})</h3>
      <button class="cta-button" onclick="showPage('treasurer'); showTab('treasurer-contributions')">Retour à la liste des membres</button>
      <form id="member-contributions-form">
        ${Object.entries(member.contributions.Mensuelle).map(([year, months]) => `
          <div class="contribution-year">
            <h4>${year}</h4>
            ${months.map((paid, i) => `
              <label>
                <input type="checkbox" name="month-${year}-${i}" ${paid ? 'checked' : ''} disabled>
                Mois ${i + 1}
              </label>
            `).join('')}
          </div>
        `).join('')}
      </form>
    `;
  } catch (error) {
    console.error('Erreur manageMemberContributions:', error);
    alert('Erreur lors du chargement des cotisations');
  }
}
// ==================== FONCTIONS D'INTERFACE ====================

function showPage(pageId) {
  try {
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');
    
    pages.forEach(page => page.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));

    const pageElement = document.querySelector(`#${pageId}`);
    const navElement = document.querySelector(`a[onclick="showPage('${pageId}')"]`);

    if (pageElement) pageElement.classList.add('active');
    if (navElement) navElement.classList.add('active');

    switch (pageId) {
      case 'members': updateMembersList(); break;
      case 'events': updateEventsList(); break;
      case 'gallery': updateGalleryContent(); break;
      case 'messages': updateMessagesList(); break;
      case 'coran': updateCoranContent(); break;
      case 'personal': updatePersonalPage(); break;
      case 'library': updateLibraryContent(); break;
      case 'home': updateMessagePopups(); break;
      case 'secret': if (currentUser?.role === 'president' || currentUser?.role === 'secretaire' || currentUser?.role === 'admin') showTab('stats'); break;
      case 'treasurer': if (currentUser?.role === 'tresorier') showTab('treasurer-contributions'); break;
      case 'president': if (currentUser?.role === 'president') showTab('president-files'); break;
      case 'secretary': if (currentUser?.role === 'secretaire') showTab('secretary-files'); break;
    }
  } catch (error) {
    console.error('Erreur showPage:', error);
  }
}

// Mettre à jour la fonction showTab
function showTab(tabId) {
  const tabContent = document.querySelector(`#${tabId}`);
  const tabButton = document.querySelector(`button[onclick="showTab('${tabId}')"]`);

  if (!tabContent || !tabButton) {
    console.error(`Tab ${tabId} introuvable`);
    return;
  }

  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

  tabContent.classList.add('active');
  tabButton.classList.add('active');

  switch (tabId) {
    case 'edit-member': updateEditMembersList(); break;
    case 'gallery-admin': updateGalleryAdminList(); break;
    case 'events-admin': updateEventsAdminList(); break;
    case 'messages-admin': updateMessagesAdminList(); break;
    case 'notes': updateNotesList(); break;
    case 'internal-docs':Lift internalDocsList(); break;
    case 'suggestions-admin': updateSuggestionsList(); break;
    case 'stats': updateStats(); break;
    case 'video-calls': initVideoCall(); break;
    case 'auto-messages': updateAutoMessagesList(); break;
    case 'treasurer-contributions':
      updateTreasurerContributionsList();
      break;
    case 'contributions-admin':
      updateContributionsAdminList();
      break;
    case 'president-files': updatePresidentFilesList(); break;
    case 'secretary-files': updateSecretaryFilesList(); break;
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// ==================== FONCTIONS CHATBOT ====================

function initChatbot() {
  const chatbotButton = document.querySelector('.chatbot-button');
  const chatbotForm = document.querySelector('#chatbot-form');
  const chatbotInput = document.querySelector('#chatbot-input');
  const chatbotMessages = document.querySelector('#chatbot-messages');

  if (!chatbotButton || !chatbotForm || !chatbotInput || !chatbotMessages) {
    console.error('Éléments du chatbot introuvables');
    return;
  }

  chatbotButton.addEventListener('click', toggleChatbot);
  chatbotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatbotInput.value.trim();
    if (!message) return;

    appendChatMessage('Vous', message);
    const response = getChatbotResponse(message);
    
    if (response === 'secret') {
      document.querySelector('#secret-entry').style.display = 'block';
      chatbotInput.disabled = true;
    } else {
      appendChatMessage('Assistant ANSAR', response);
    }

    chatbotInput.value = '';
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  });
}

function toggleChatbot() {
  const chatbot = document.querySelector('#chatbot');
  if (!chatbot) return;

  isChatOpen = !isChatOpen;
  chatbot.style.display = isChatOpen ? 'block' : 'none';
}

function appendChatMessage(sender, message) {
  const messages = document.querySelector('#chatbot-messages');
  if (!messages) return;

  const messageElement = document.createElement('div');
  messageElement.className = sender === 'Vous' ? 'chat-message user' : 'chat-message bot';
  messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
  messages.appendChild(messageElement);
}

function clearChatHistory() {
  const messages = document.querySelector('#chatbot-messages');
  if (messages) messages.innerHTML = '';
  document.querySelector('#secret-entry').style.display = 'none';
  document.querySelector('#chatbot-input').disabled = false;
}

async function checkSecretPassword() {
  const password = document.querySelector('#secret-password')?.value.trim();
  const secretCodes = [
    'ADMIN12301012000',
    '00000000',
    '11111111',
    '22222222',
    'JESUISMEMBRE66',
    '33333333',
    '44444444',
    '55555555'
  ];
  const treasurerCodes = [
    'ADMIN12301012000',
    '00000000',
    '11111111',
    '22222222',
    'JESUISTRESORIER444',
    '66666666',
    '77777777',
    '88888888'
  ];
  const presidentCodes = [
    'ADMIN12301012000',
    '00000000',
    '11111111',
    '22222222',
    'PRESIDENT000',
    '99999999',
    '11112222',
    '33334444'
  ];
  const secretaryCodes = [
    'ADMIN12301012000',
    '00000000',
    '11111111',
    '22222222',
    'SECRETAIRE000',
    '55556666',
    '77778888',
    '99990000'
  ];

  try {
    const members = await loadData('members');
    const adminMember = members.find(m => m.role === 'president' || m.role === 'secretaire');
    const dynamicAdminCode = adminMember ? `ADMIN${adminMember.code}${adminMember.dob}` : null;

    if (password) {
      if (secretCodes.includes(password) || (dynamicAdminCode && password === dynamicAdminCode)) {
        currentUser = adminMember ? { code: adminMember.code, role: adminMember.role } : { code: 'anonymous', role: 'admin' };
        showPage('secret');
        clearChatHistory();
      } else if (treasurerCodes.includes(password)) {
        currentUser = { code: 'treasurer', role: 'tresorier' };
        showPage('treasurer');
        clearChatHistory();
      } else if (presidentCodes.includes(password)) {
        currentUser = { code: 'president', role: 'president' };
        showPage('president');
        clearChatHistory();
      } else if (secretaryCodes.includes(password)) {
        currentUser = { code: 'secretary', role: 'secretaire' };
        showPage('secretary');
        clearChatHistory();
      } else {
        appendChatMessage('Assistant ANSAR', 'Mot de passe incorrect.');
      }
    }
  } catch (error) {
    console.error('Erreur checkSecretPassword:', error);
    appendChatMessage('Assistant ANSAR', 'Erreur lors de la vérification du mot de passe.');
  }
}

// ==================== FONCTIONS MEMBRES ====================

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
    console.error("Erreur addMember:", error);
    alert(`Erreur lors de ${isEditing ? 'la modification' : "l'ajout"} du membre`);
  }
});

async function generateMemberCode() {
  const members = await loadData('members');
  return `${(members.length + 1).toString().padStart(3, '0')}`;
}

async function handlePhotoUpload(photoInput) {
  if (photoInput?.files.length > 0) {
    return await uploadFile(photoInput.files[0], 'members');
  }
  return 'assets/images/default-photo.png';
}

// Remplacer la fonction initializeContributions
function initializeContributions() {
  return {
    Mensuelle: {
      '2023': Array(12).fill(false),
      '2024': Array(12).fill(false),
      '2025': Array(12).fill(false)
    },
    globalContributions: {}
  };
}

// Remplacer la fonction updateMembersList
async function updateMembersList() {
  try {
    const members = await loadData('members');
    const search = document.querySelector('#members-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#members-list');
    if (!list) return;

    list.innerHTML = members
      .filter(m => `${m.firstname} ${m.lastname} ${m.code}`.toLowerCase().includes(search))
      .map(m => `
        <div class="member-card">
          <img src="${m.photo || 'assets/images/default-photo.png'}" alt="${m.firstname} ${m.lastname}" class="member-photo">
          <div>
            <p><strong>${m.firstname} ${m.lastname}</strong></p>
            <p><small>${m.code} • ${m.role}</small></p>
          </div>
        </div>
      `).join('');

    // Supprimer tout écouteur d'événements existant sur .member-card
    const memberCards = document.querySelectorAll('.member-card');
    memberCards.forEach(card => {
      card.removeEventListener('click', showMemberDetail); // Supprime tout écouteur précédent
      card.style.cursor = 'default'; // Indique visuellement que le clic n'est pas interactif
    });
  } catch (error) {
    console.error('Erreur updateMembersList:', error);
  }
}

async function updateEditMembersList() {
  try {
    const members = await loadData('members');
    const search = document.querySelector('#edit-member-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#edit-members-list');
    if (!list) return;

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
    if (!form) return;

    form.dataset.editing = member.id;
    document.getElementById('new-member-firstname').value = member.firstname || '';
    document.getElementById('new-member-lastname').value = member.lastname || '';
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
  const deleteForm = document.querySelector('#delete-member-form');
  if (!deleteForm) return;

  deleteForm.style.display = 'block';
  deleteForm.onsubmit = async (e) => {
    e.preventDefault();
    const presidentInput = document.querySelector('#delete-member-code')?.value.trim();
    if (presidentInput !== presidentCode) {
      alert('Code président incorrect');
      return;
    }

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
      deleteForm.style.display = 'none';
      deleteForm.reset();
    } catch (error) {
      console.error('Erreur deleteMember:', error);
      alert('Erreur lors de la suppression');
    }
  };
}

async function updateAllMemberLists() {
  await Promise.all([
    updateMembersList(),
    updateEditMembersList(),
    updateStats()
  ]);
}

async function showMemberDetail(code) {
  try {
    const members = await loadData('members');
    const member = members.find(m => m.code === code);
    if (!member) {
      alert('Membre introuvable');
      return;
    }

    showPage('personal');
    const personalContent = document.querySelector('#personal-content');
    const personalLogin = document.querySelector('#personal-login');
    if (personalContent && personalLogin) {
      personalLogin.style.display = 'none';
      personalContent.style.display = 'block';
      document.querySelector('#personal-title').textContent = `Espace de ${member.firstname} ${member.lastname}`;
      document.querySelector('#personal-info').innerHTML = `
        <p><strong>Code:</strong> ${member.code}</p>
        <p><strong>Nom:</strong> ${member.firstname} ${member.lastname}</p>
        <p><strong>Rôle:</strong> ${member.role}</p>
        <p><strong>Statut:</strong> ${member.status}</p>
        ${member.email ? `<p><strong>Email:</strong> ${member.email}</p>` : ''}
        ${member.phone ? `<p><strong>Téléphone:</strong> ${member.phone}</p>` : ''}
      `;
      const contributions = await loadData('contributions');
      document.querySelector('#personal-contributions').innerHTML = `
        <p><strong>Cotisations Mensuelles:</strong></p>
        ${Object.entries(member.contributions.Mensuelle).map(([year, months]) => `
          <p>${year}: ${months.map((paid, i) => paid ? `✅ Mois ${i+1}` : `❌ Mois ${i+1}`).join(', ')}</p>
        `).join('')}
        <p><strong>Cotisations Globales:</strong></p>
        ${contributions.map(c => `
          <p>${c.name} (${c.amount} FCFA): ${member.contributions.globalContributions?.[c.name]?.paid ? '✅ Payé' : '❌ Non payé'}</p>
        `).join('') || '<p>Aucune cotisation globale</p>'}
      `;
    }
  } catch (error) {
    console.error('Erreur showMemberDetail:', error);
    alert('Erreur lors de l\'affichage des détails du membre');
  }
}

// ==================== FONCTIONS GALERIE ====================

async function updateGalleryContent() {
  try {
    const gallery = await loadData('gallery');
    const content = document.querySelector('#gallery-content');
    if (!content) return;

    content.innerHTML = gallery.map(item => `
      <div class="gallery-item">
        ${item.type === 'image' ? 
          `<img src="${item.url}" alt="${item.description || 'Image'}">` : 
          `<video src="${item.url}" controls></video>`}
        <p>${item.description || ''}</p>
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
    const fileUrl = await uploadFile(file, 'gallery');
    const galleryData = {
      type: file.type.startsWith('image') ? 'image' : 'video',
      url: fileUrl,
      name: file.name,
      description,
      date: new Date().toISOString()
    };

    await saveData('gallery', galleryData);
    await updateGalleryContent();
    await updateGalleryAdminList();
    document.querySelector('#add-gallery-form').reset();
    alert('Média ajouté avec succès');
  } catch (error) {
    console.error('Erreur addGalleryItem:', error);
    alert('Erreur lors de l\'ajout du média');
  }
});

async function updateGalleryAdminList() {
  try {
    const gallery = await loadData('gallery');
    const search = document.querySelector('#gallery-admin-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#gallery-admin-list');
    if (!list) return;

    list.innerHTML = gallery
      .filter(g => g.description?.toLowerCase().includes(search) || g.name?.toLowerCase().includes(search))
      .map(g => `
        <div class="gallery-item">
          ${g.type === 'image' ? 
            `<img src="${g.url}" alt="${g.description}" class="gallery-image">` : 
            `<video src="${g.url}" controls class="gallery-video"></video>`}
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
  }
}

async function deleteGalleryItem(id) {
  if (!confirm('Voulez-vous vraiment supprimer ce média ?')) return;
  try {
    await deleteData('gallery', id);
    await updateGalleryContent();
    await updateGalleryAdminList();
    alert('Média supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteGalleryItem:', error);
    alert('Erreur lors de la suppression du média');
  }
}

// ==================== FONCTIONS ÉVÉNEMENTS ====================

document.querySelector('#add-event-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.querySelector('#event-file');
  const file = fileInput?.files[0];
  const eventDate = document.querySelector('#event-date').value;
  const eventTime = document.querySelector('#event-time').value;

  const eventData = {
    name: document.querySelector('#event-name').value.trim(),
    description: document.querySelector('#event-description').value.trim(),
    datetime: new Date(`${eventDate}T${eventTime}`).toISOString(),
    image: file ? await uploadFile(file, 'events') : null,
    createdAt: new Date().toISOString()
  };

  try {
    await saveData('events', eventData);
    document.querySelector('#add-event-form').reset();
    await updateEventsList();
    await updateEventsAdminList();
    alert('Événement ajouté avec succès');
  } catch (error) {
    console.error('Erreur addEvent:', error);
    alert('Erreur lors de l\'ajout de l\'événement');
  }
});

async function updateEventsList() {
  try {
    const events = await loadData('events');
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
    if (!list) return;

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

async function deleteEvent(id) {
  if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
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

document.querySelector('#add-message-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageData = {
    title: document.querySelector('#message-title').value.trim(),
    text: document.querySelector('#message-text').value.trim(),
    date: new Date().toISOString()
  };

  try {
    await saveData('messages', messageData);
    document.querySelector('#add-message-form').reset();
    await updateMessagesList();
    await updateMessagesAdminList();
    await updateMessagePopups();
    sendNotification('Nouveau message', `${messageData.title}: ${messageData.text}`);
    alert('Message envoyé avec succès');
  } catch (error) {
    console.error('Erreur addMessage:', error);
    alert('Erreur lors de l\'envoi du message');
  }
});

async function updateMessagesList() {
  try {
    const messages = await loadData('messages');
    const list = document.querySelector('#messages-list');
    if (!list) return;

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
    if (!list) return;

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

async function deleteMessage(id) {
  if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return;
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

document.querySelector('#add-auto-message-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const autoMessageData = {
    name: document.querySelector('#auto-message-name').value.trim(),
    text: document.querySelector('#auto-message-text').value.trim(),
    datetime: new Date(`${document.querySelector('#auto-message-date').value}T${document.querySelector('#auto-message-time').value}`).toISOString(),
    createdAt: new Date().toISOString()
  };

  try {
    await saveData('autoMessages', autoMessageData);
    document.querySelector('#add-auto-message-form').reset();
    await updateAutoMessagesList();
    alert('Message automatisé ajouté avec succès');
  } catch (error) {
    console.error('Erreur addAutoMessage:', error);
    alert('Erreur lors de l\'ajout du message automatisé');
  }
});

async function checkAutoMessages() {
  try {
    const autoMessages = await loadData('autoMessages');
    const now = new Date();

    for (const msg of autoMessages) {
      if (new Date(msg.datetime) <= now) {
        await saveData('messages', {
          title: msg.name,
          text: msg.text,
          date: now.toISOString()
        });
        await deleteData('autoMessages', msg.id);
      }
    }
    await updateMessagesList();
    await updateMessagesAdminList();
    await updateMessagePopups();
  } catch (error) {
    console.error('Erreur checkAutoMessages:', error);
  }
}

async function updateAutoMessagesList() {
  try {
    const autoMessages = await loadData('autoMessages');
    const list = document.querySelector('#auto-messages-list');
    if (!list) return;

    list.innerHTML = autoMessages.map(msg => `
      <div class="message-card">
        <h4>${msg.name}</h4>
        <p>${msg.text}</p>
        <p>Programmé: ${formatDate(msg.datetime)}</p>
        <button class="cta-button danger" onclick="deleteAutoMessage('${msg.id}')">Supprimer</button>
      </div>
    `).join('') || '<p>Aucun message automatisé</p>';
  } catch (error) {
    console.error('Erreur updateAutoMessagesList:', error);
  }
}

async function deleteAutoMessage(id) {
  if (!confirm('Voulez-vous vraiment supprimer ce message automatisé ?')) return;
  try {
    await deleteData('autoMessages', id);
    await updateAutoMessagesList();
    alert('Message automatisé supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteAutoMessage:', error);
    alert('Erreur lors de la suppression du message automatisé');
  }
}

// ==================== FONCTIONS NOTES ET DOCUMENTS ====================

document.querySelector('#add-note-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const noteData = {
    title: document.querySelector('#note-theme').value.trim(),
    content: document.querySelector('#note-text').value.trim(),
    createdAt: new Date().toISOString()
  };

  try {
    await saveData('notes', noteData);
    document.querySelector('#add-note-form').reset();
    await updateNotesList();
    alert('Note ajoutée avec succès');
  } catch (error) {
    console.error('Erreur addNote:', error);
    alert('Erreur lors de l\'ajout de la note');
  }
});

async function updateNotesList() {
  try {
    const notes = await loadData('notes');
    const search = document.querySelector('#notes-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#notes-list');
    if (!list) return;

    list.innerHTML = notes
      .filter(n => n.title.toLowerCase().includes(search) || n.content.toLowerCase().includes(search))
      .map(note => `
        <div class="note-card">
          <h4>${note.title}</h4>
          <p>${note.content}</p>
          <p class="note-date">${formatDate(note.createdAt)}</p>
          <button class="cta-button danger" onclick="deleteNote('${note.id}')">Supprimer</button>
        </div>
      `).join('') || '<p>Aucune note disponible</p>';
  } catch (error) {
    console.error('Erreur updateNotesList:', error);
  }
}

async function deleteNote(id) {
  if (!confirm('Voulez-vous vraiment supprimer cette note ?')) return;
  try {
    await deleteData('notes', id);
    await updateNotesList();
    alert('Note supprimée avec succès');
  } catch (error) {
    console.error('Erreur deleteNote:', error);
    alert('Erreur lors de la suppression de la note');
  }
}

document.querySelector('#add-internal-doc-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.querySelector('#internal-doc');
  const file = fileInput?.files[0];
  if (!file) {
    alert('Veuillez sélectionner un fichier');
    return;
  }

  try {
    const fileUrl = await uploadFile(file, 'internalDocs');
    const docData = {
      name: file.name,
      category: document.querySelector('#internal-doc-category').value.trim(),
      url: fileUrl,
      createdAt: new Date().toISOString()
    };

    await saveData('internalDocs', docData);
    document.querySelector('#add-internal-doc-form').reset();
    await updateInternalDocsList();
    alert('Document ajouté avec succès');
  } catch (error) {
    console.error('Erreur addInternalDoc:', error);
    alert('Erreur lors de l\'ajout du document');
  }
});

async function updateInternalDocsList() {
  try {
    const docs = await loadData('internalDocs');
    const search = document.querySelector('#internal-docs-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#internal-docs-list');
    if (!list) return;

    list.innerHTML = docs
      .filter(d => d.name.toLowerCase().includes(search) || d.category.toLowerCase().includes(search))
      .map(doc => `
        <div class="doc-card">
          <p><strong>${doc.category}</strong>: <a href="${doc.url}" target="_blank">${doc.name}</a></p>
          <p class="doc-date">${formatDate(doc.createdAt)}</p>
          <button class="cta-button danger" onclick="deleteInternalDoc('${doc.id}')">Supprimer</button>
        </div>
      `).join('') || '<p>Aucun document disponible</p>';
  } catch (error) {
    console.error('Erreur updateInternalDocsList:', error);
  }
}

async function deleteInternalDoc(id) {
  if (!confirm('Voulez-vous vraiment supprimer ce document ?')) return;
  try {
    await deleteData('internalDocs', id);
    await updateInternalDocsList();
    alert('Document supprimé avec succès');
  } catch (error) {
    console.error('Erreur deleteInternalDoc:', error);
    alert('Erreur lors de la suppression du document');
  }
}

// ==================== FONCTIONS SUGGESTIONS ====================

document.querySelector('#suggestion-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const suggestionData = {
    text: document.querySelector('#suggestion-text').value.trim(),
    memberCode: currentUser?.code || 'Anonyme',
    createdAt: new Date().toISOString()
  };

  try {
    await saveData('suggestions', suggestionData);
    document.querySelector('#suggestion-form').reset();
    await updateSuggestionsList();
    alert('Suggestion envoyée avec succès');
  } catch (error) {
    console.error('Erreur addSuggestion:', error);
    alert('Erreur lors de l\'envoi de la suggestion');
  }
});

async function updateSuggestionsList() {
  try {
    const suggestions = await loadData('suggestions');
    const search = document.querySelector('#suggestions-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#suggestions-list');
    if (!list) return;

    list.innerHTML = suggestions
      .filter(s => s.text.toLowerCase().includes(search) || s.memberCode.toLowerCase().includes(search))
      .map(s => `
        <div class="suggestion-card">
          <p><strong>${s.memberCode}</strong>: ${s.text}</p>
          <p class="suggestion-date">${formatDate(s.createdAt)}</p>
        </div>
      `).join('') || '<p>Aucune suggestion disponible</p>';
  } catch (error) {
    console.error('Erreur updateSuggestionsList:', error);
  }
}

// ==================== FONCTIONS COTISATIONS ====================

// Remplacer la fonction add-contribution-form
document.querySelector('#add-contribution-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const contributionData = {
    name: document.querySelector('#contribution-name').value.trim(),
    amount: parseInt(document.querySelector('#contribution-amount').value) || 0,
    createdAt: new Date().toISOString()
  };

  try {
    // Enregistrer la cotisation globale
    const contributionRef = await db.collection('contributions').add(contributionData);
    const contributionId = contributionRef.id;

    // Initialiser la cotisation pour tous les membres
    const members = await loadData('members');
    for (const member of members) {
      const updatedContributions = {
        ...member.contributions,
        globalContributions: {
          ...member.contributions?.globalContributions,
          [contributionData.name]: {
            id: contributionId,
            paid: false
          }
        }
      };
      await saveData('members', { contributions: updatedContributions }, member.id);
    }

    document.querySelector('#add-contribution-form').reset();
    await updateContributionsAdminList();
    alert('Cotisation globale ajoutée avec succès');
  } catch (error) {
    console.error('Erreur addContribution:', error);
    alert('Erreur lors de l\'ajout de la cotisation');
  }
});


async function updateContributionsAdminList() {
  try {
    const contributions = await loadData('contributions');
    const members = await loadData('members');
    const search = document.querySelector('#contributions-admin-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#contributions-admin-list');
    if (!list) {
      console.error('Élément #contributions-admin-list introuvable');
      return;
    }

    list.innerHTML = contributions
      .filter(c => c.name.toLowerCase().includes(search))
      .map(c => `
        <div class="contribution-card">
          <p><strong>${c.name}</strong>: ${c.amount} FCFA</p>
          <p class="contribution-date">${formatDate(c.createdAt)}</p>
          <button class="cta-button" onclick="manageGlobalContribution('${c.id}', '${c.name}')">Gérer Paiements</button>
          <button class="cta-button danger" onclick="deleteGlobalContribution('${c.id}', '${c.name}')">Supprimer</button>
        </div>
      `).join('') || '<p>Aucune cotisation disponible</p>';
  } catch (error) {
    console.error('Erreur updateContributionsAdminList:', error);
  }
}

async function deleteGlobalContribution(contributionId, contributionName) {
  const deleteForm = document.createElement('div');
  deleteForm.id = 'delete-contribution-form';
  deleteForm.innerHTML = `
    <h3>Supprimer la cotisation: ${contributionName}</h3>
    <p>Entrez le code président pour confirmer la suppression :</p>
    <input type="password" id="delete-contribution-code" placeholder="Code président">
    <button class="cta-button" onclick="confirmDeleteContribution('${contributionId}', '${contributionName}')">Confirmer</button>
    <button class="cta-button" onclick="this.parentElement.remove()">Annuler</button>
  `;
  document.querySelector('#contributions-admin')?.appendChild(deleteForm);
}

async function confirmDeleteContribution(contributionId, contributionName) {
  const presidentInput = document.querySelector('#delete-contribution-code')?.value.trim();
  if (presidentInput !== presidentCode) {
    alert('Code président incorrect');
    return;
  }

  try {
    // Supprimer la cotisation de la collection 'contributions'
    await deleteData('contributions', contributionId);

    // Supprimer la cotisation globale des membres
    const members = await loadData('members');
    for (const member of members) {
      const updatedContributions = { ...member.contributions };
      delete updatedContributions.globalContributions[contributionName];
      await saveData('members', { contributions: updatedContributions }, member.id);
    }

    // Mettre à jour l'affichage
    await updateContributionsAdminList();
    document.querySelector('#delete-contribution-form')?.remove();
    alert('Cotisation globale supprimée avec succès');
  } catch (error) {
    console.error('Erreur deleteGlobalContribution:', error);
    alert('Erreur lors de la suppression de la cotisation');
  }
}


// Nouvelle fonction pour gérer les paiements des cotisations globales
async function manageGlobalContribution(contributionId, contributionName) {
  try {
    const members = await loadData('members');
    const contributionsAdmin = document.querySelector('#contributions-admin');
    if (!contributionsAdmin) return;

    contributionsAdmin.innerHTML = `
      <h3>Gérer les Paiements: ${contributionName}</h3>
      <input type="text" id="global-contribution-search" placeholder="Rechercher un membre..." class="search-bar">
      <div id="global-contribution-members"></div>
      <button class="cta-button" onclick="updateContributionsAdminList()">Retour</button>
    `;

    const updateMembersList = async () => {
      const search = document.querySelector('#global-contribution-search')?.value.toLowerCase() || '';
      const membersList = document.querySelector('#global-contribution-members');
      if (!membersList) return;

      membersList.innerHTML = members
        .filter(m => `${m.firstname} ${m.lastname} ${m.code}`.toLowerCase().includes(search))
        .map(m => `
          <div class="member-card">
            <p><strong>${m.firstname} ${m.lastname}</strong> (${m.code})</p>
            <label>
              <input type="checkbox" class="global-contribution-checkbox" data-member-id="${m.id}" data-contribution-id="${contributionId}" data-contribution-name="${contributionName}" ${m.contributions?.globalContributions?.[contributionName]?.paid ? 'checked' : ''}>
              Payé
            </label>
          </div>
        `).join('');
    };

    await updateMembersList();

    document.querySelector('#global-contribution-search')?.addEventListener('input', updateMembersList);

    const checkboxes = document.querySelectorAll('.global-contribution-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', async (e) => {
        const memberId = e.target.dataset.memberId;
        const contributionName = e.target.dataset.contributionName;
        const paid = e.target.checked;

        try {
          const member = members.find(m => m.id === memberId);
          const updatedContributions = {
            ...member.contributions,
            globalContributions: {
              ...member.contributions?.globalContributions,
              [contributionName]: {
                id: contributionId,
                paid
              }
            }
          };
          await saveData('members', { contributions: updatedContributions }, memberId);
          // Mettre à jour l'espace personnel si le membre est connecté
          if (currentUser?.code === member.code) {
            showMemberDetail(member.code);
          }
        } catch (error) {
          console.error('Erreur manageGlobalContribution:', error);
          alert('Erreur lors de la mise à jour du paiement');
        }
      });
    });
  } catch (error) {
    console.error('Erreur manageGlobalContribution:', error);
    alert('Erreur lors du chargement des paiements');
  }
}

// ==================== FONCTIONS FICHIERS PRÉSIDENT/SECÉTAIRE ====================

document.querySelector('#add-president-file-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.querySelector('#president-file');
  const file = fileInput?.files[0];
  if (!file) {
    alert('Veuillez sélectionner un fichier');
    return;
  }

  try {
    const fileUrl = await uploadFile(file, 'presidentFiles');
    const fileData = {
      name: file.name,
      category: document.querySelector('#president-file-category').value.trim(),
      url: fileUrl,
      createdAt: new Date().toISOString()
    };

    await saveData('presidentFiles', fileData);
    document.querySelector('#add-president-file-form').reset();
    await updatePresidentFilesList();
    alert('Fichier ajouté avec succès');
  } catch (error) {
    console.error('Erreur addPresidentFile:', error);
    alert('Erreur lors de l\'ajout du fichier');
  }
});

async function updatePresidentFilesList() {
  try {
    const files = await loadData('presidentFiles');
    const search = document.querySelector('#president-files-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#president-files-list');
    if (!list) return;

    list.innerHTML = files
      .filter(f => f.name.toLowerCase().includes(search) || f.category.toLowerCase().includes(search))
      .map(f => `
        <div class="file-card">
          <p><strong>${f.category}</strong>: <a href="${f.url}" target="_blank">${f.name}</a></p>
          <p class="file-date">${formatDate(f.createdAt)}</p>
        </div>
      `).join('') || '<p>Aucun fichier disponible</p>';
  } catch (error) {
    console.error('Erreur updatePresidentFilesList:', error);
  }
}

document.querySelector('#add-secretary-file-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.querySelector('#secretary-file');
  const file = fileInput?.files[0];
  if (!file) {
    alert('Veuillez sélectionner un fichier');
    return;
  }

  try {
    const fileUrl = await uploadFile(file, 'secretaryFiles');
    const fileData = {
      name: file.name,
      category: document.querySelector('#secretary-file-category').value.trim(),
      url: fileUrl,
      createdAt: new Date().toISOString()
    };

    await saveData('secretaryFiles', fileData);
    document.querySelector('#add-secretary-file-form').reset();
    await updateSecretaryFilesList();
    alert('Fichier ajouté avec succès');
  } catch (error) {
    console.error('Erreur addSecretaryFile:', error);
    alert('Erreur lors de l\'ajout du fichier');
  }
});

async function updateSecretaryFilesList() {
  try {
    const files = await loadData('secretaryFiles');
    const search = document.querySelector('#secretary-files-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#secretary-files-list');
    if (!list) return;

    list.innerHTML = files
      .filter(f => f.name.toLowerCase().includes(search) || f.category.toLowerCase().includes(search))
      .map(f => `
        <div class="file-card">
          <p><strong>${f.category}</strong>: <a href="${f.url}" target="_blank">${f.name}</a></p>
          <p class="file-date">${formatDate(f.createdAt)}</p>
        </div>
      `).join('') || '<p>Aucun fichier disponible</p>';
  } catch (error) {
    console.error('Erreur updateSecretaryFilesList:', error);
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
          return t + months.filter(Boolean).length * (contributions.find(c => c.name === name)?.amount || 2000);
        }, 0);
      }, 0);
    }, 0);

    const memberCount = members.length;
    const statusCounts = members.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});

    const ctxTotal = document.getElementById('stats-total-amount')?.getContext('2d');
    if (ctxTotal) {
      ```chartjs
      {
        type: 'bar',
        data: {
          labels: ['Montant Total'],
          datasets: [{
            label: 'Montant des Cotisations (FCFA)',
            data: [totalAmount],
            backgroundColor: '#4CAF50',
            borderColor: '#388E3C',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: { beginAtZero: true }
          }
        }
      }
      ```
    }

    const ctxMembers = document.getElementById('stats-members')?.getContext('2d');
    if (ctxMembers) {
      ```chartjs
      {
        type: 'pie',
        data: {
          labels: ['Membres'],
          datasets: [{
            label: 'Nombre de Membres',
            data: [memberCount],
            backgroundColor: ['#2196F3'],
            borderColor: ['#1976D2'],
            borderWidth: 1
          }]
        }
      }
      ```
    }

    const ctxStatus = document.getElementById('stats-status')?.getContext('2d');
    if (ctxStatus) {
      ```chartjs
      {
        type: 'pie',
        data: {
          labels: Object.keys(statusCounts),
          datasets: [{
            label: 'Statut des Membres',
            data: Object.values(statusCounts),
            backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
            borderColor: ['#388E3C', '#D32F2F', '#FFA000'],
            borderWidth: 1
          }]
        }
      }
      ```
    }

    const ctxContributions = document.getElementById('stats-contributions')?.getContext('2d');
    if (ctxContributions) {
      ```chartjs
      {
        type: 'bar',
        data: {
          labels: contributions.map(c => c.name),
          datasets: [{
            label: 'Montant des Cotisations',
            data: contributions.map(c => c.amount),
            backgroundColor: '#FF9800',
            borderColor: '#F57C00',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: { beginAtZero: true }
          }
        }
      }
      ```
    }
  } catch (error) {
    console.error('Erreur updateStats:', error);
  }
}

// ==================== FONCTIONS ESPACE PERSONNEL ====================

document.querySelector('#personal-login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = document.querySelector('#personal-member-code').value.trim();
  const password = document.querySelector('#personal-password').value.trim();
  const errorMessage = document.querySelector('#personal-error-message');

  try {
    const members = await loadData('members');
    const member = members.find(m => m.code === code && m.dob === password);
    if (!member) {
      errorMessage.textContent = 'Code ou mot de passe incorrect';
      errorMessage.style.display = 'block';
      return;
    }

    currentUser = { code: member.code, role: member.role };
    showMemberDetail(member.code);
  } catch (error) {
    console.error('Erreur loginPersonal:', error);
    errorMessage.textContent = 'Erreur lors de la connexion';
    errorMessage.style.display = 'block';
  }
});

function updatePersonalPage() {
  if (!currentUser) {
    const personalContent = document.querySelector('#personal-content');
    const personalLogin = document.querySelector('#personal-login');
    if (personalContent && personalLogin) {
      personalContent.style.display = 'none';
      personalLogin.style.display = 'block';
    }
  }
}

function logoutPersonal() {
  currentUser = null;
  updatePersonalPage();
  document.querySelector('#personal-login-form').reset();
  document.querySelector('#personal-error-message').style.display = 'none';
}

function payViaWave() {
  alert('Paiement via Wave non implémenté. Redirigez vers l\'application Wave.');
}

function payViaOrangeMoney() {
  alert('Paiement via Orange Money non implémenté. Redirigez vers l\'application Orange Money.');
}

// ==================== FONCTIONS CORAN ====================

async function updateCoranContent() {
  try {
    const juzList = Array.from({ length: 30 }, (_, i) => `Juz' ${i + 1}`);
    const search = document.querySelector('#coran-search')?.value.toLowerCase() || '';
    const content = document.querySelector('#coran-content');
    if (!content) return;

    content.innerHTML = juzList
      .filter(juz => juz.toLowerCase().includes(search))
      .map(juz => `<div class="juz-item">${juz}</div>`)
      .join('') || '<p>Aucun Juz trouvé</p>';
  } catch (error) {
    console.error('Erreur updateCoranContent:', error);
  }
}

// ==================== FONCTIONS BIBLIOTHÈQUE ====================

async function updateLibraryContent() {
  try {
    const books = await loadData('books');
    const search = document.querySelector('#library-search')?.value.toLowerCase() || '';
    const content = document.querySelector('#library-content');
    if (!content) return;

    content.innerHTML = books
      .filter(b => b.title?.toLowerCase().includes(search) || b.category?.toLowerCase().includes(search))
      .map(b => `
        <div class="book-item">
          <h4>${b.title || 'Sans titre'}</h4>
          <p>Catégorie: ${b.category || 'Non spécifié'}</p>
          ${b.url ? `<a href="${b.url}" target="_blank">Télécharger</a>` : ''}
        </div>
      `).join('') || '<p>Aucun livre disponible</p>';
  } catch (error) {
    console.error('Erreur updateLibraryContent:', error);
  }
}

// ==================== FONCTIONS MESSAGES POPUPS ====================

async function updateMessagePopups() {
  try {
    const messages = await loadData('messages');
    const popups = document.querySelector('#message-popups');
    if (!popups) return;

    popups.innerHTML = messages
      .slice(0, 3)
      .map(msg => `
        <div class="message-popup">
          <h4>${msg.title}</h4>
          <p>${msg.text}</p>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur updateMessagePopups:', error);
  }
}

// ==================== FONCTIONS APPELS VIDÉO ====================

async function initVideoCall() {
  try {
    const members = await loadData('members');
    const search = document.querySelector('#video-calls-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#members-call-list');
    if (!list) return;

    list.innerHTML = members
      .filter(m => `${m.firstname} ${m.lastname} ${m.code}`.toLowerCase().includes(search))
      .map(m => `
        <div class="member-card">
          <input type="checkbox" class="call-member-checkbox" data-code="${m.code}">
          <p>${m.firstname} ${m.lastname} (${m.code})</p>
        </div>
      `).join('');
  } catch (error) {
    console.error('Erreur initVideoCall:', error);
  }
}

function toggleCallAll() {
  const checkboxes = document.querySelectorAll('.call-member-checkbox');
  const callAll = document.querySelector('#call-all');
  checkboxes.forEach(cb => cb.checked = callAll.checked);
  selectedCallMembers = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.dataset.code);
}

function startCall(type) {
  const container = document.querySelector('#video-call-container');
  if (!container) return;
  container.innerHTML = `<p>Appel ${type} non implémenté. Intégration avec Whereby requise.</p>`;
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
