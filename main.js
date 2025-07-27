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
const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

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
  updateMotivationDisplay(); // Initialiser l'affichage des messages

  // Force l'affichage même si Firebase est lent
  updateMotivationDisplay();
  setInterval(updateMotivationDisplay, 300000); // Actualise toutes les 5 minutes

  // Ajouter les écouteurs d'événements
  document.querySelector('#refresh-data')?.addEventListener('click', () => {
    updateMembersList();
    updateEventsList();
    updateGalleryContent();
    updateMessagesList();
    updateMotivationDisplay();
    updateCoranContent();
    updateLibraryContent();
  });
});

// ==================== FONCTIONS DE BASE POUR FIRESTORE ====================

async function loadData(collection) {
  try {
    const snapshot = await firebase.firestore().collection(collection).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Erreur lors du chargement de ${collection}:`, error);
    throw error;
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



// ==================== FONCTIONS D'INTERFACE ====================

// ==================== FONCTIONS D'INTERFACE ====================

function showPage(pageId) {
  try {
    // [1] NETTOYAGE - Arrêter l'écouteur précédent s'il existe
    if (window.motivationListener) {
      window.motivationListener(); // Cette ligne arrête l'écouteur
      window.motivationListener = null; // On nettoie la référence
    }

    // [2] CODE EXISTANT - Tout ce que vous avez déjà
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      page.classList.remove('active');
      page.style.display = 'none';
    });

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Vérifier si la page existe
    const pageElement = document.getElementById(pageId);
    if (!pageElement) {
      console.error(`Page avec l'ID ${pageId} non trouvée`);
      showPage('home'); // Revenir à la page d'accueil si pageId est invalide
      return;
    }

    // Ajouter .active à la page demandée
    pageElement.classList.add('active');
    pageElement.style.display = 'block'; // Forcer l'affichage

    // Ajouter .active à l'élément de navigation correspondant
    const navElement = document.querySelector(`a[onclick="showPage('${pageId}')"]`);
    if (navElement) {
      navElement.classList.add('active');
    } else {
      console.warn(`Élément de navigation pour ${pageId} non trouvé`);
    }

    // Mettre à jour le contenu en fonction de la page
    switch (pageId) {
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
        case 'projet':
  const projetIframe = document.getElementById('projet-iframe');
  if (projetIframe) {
    // Bloquer tout chargement automatique de l'admin
    projetIframe.onload = function() {
      try {
        const iframeDoc = projetIframe.contentDocument || projetIframe.contentWindow.document;
        iframeDoc.getElementById('admin-section').style.display = 'none';
      } catch (e) {
        console.log("Sécurité iframe: " + e.message);
      }
    };
    
    // Charger l'iframe seulement si nécessaire
    if (!projetIframe.src || projetIframe.src === '') {
      projetIframe.src = 'projet.html';
    }
  }
  break;
      case 'library':
        updateLibraryContent();
        break;
      case 'home':
        updateMessagePopups();
        updateHomeGallery();
        updateEventCountdowns(); // Ajout pour initialiser le compte à rebours
        break;
      case 'settings':
        break;
    case 'secret':
      if (currentUser?.role !== 'admin') {
        showPage('home');
        return;
      }
      break;
      case 'admin-members':
        if (currentUser?.role === 'president' || currentUser?.role === 'secretaire' || currentUser?.role === 'admin') {
          updateEditMembersList();
        } else {
          showPage('home');
        }
        break;
    case 'treasurer':
      if (currentUser?.role !== 'tresorier') {
        showPage('home');
        return;
      }
      break;
      case 'treasurer-monthly':
        updateTreasurerMonthlyList();
        break;
      case 'treasurer-member-monthly':
        break;
      case 'treasurer-global':
        updateContributionsAdminList();
        break;
      case 'treasurer-global-manage':
        break;
      case 'president':
        if (currentUser?.role === 'president') {
          showTab('president-settings');
        } else {
          showPage('home');
        }
        break;
    case 'secretary':
      if (currentUser?.role !== 'secretaire') {
        showPage('home');
        return;
      }
      break;
      default:
        console.warn(`Page non reconnue : ${pageId}`);
        showPage('home');
        break;
    }

// [3] REACTIVATION - Si on va sur une page qui a besoin des messages
    if (pageId === 'home' || pageId === 'secretary') {
      updateMotivationDisplay(); // Recrée un nouvel écouteur
    }

    window.scrollTo(0, 0);
  } catch (error) {
    console.error('Erreur dans showPage:', error);
    showPage('home');
  }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  showPage('home'); // Forcer l'affichage de la page d'accueil
});

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
    case 'internal-docs': updateInternalDocsList(); break;
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

  console.log('Initialisation du chatbot'); // Journal pour confirmer l'initialisation

  chatbotButton.addEventListener('click', toggleChatbot);
  chatbotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatbotInput.value.trim();
    if (!message) {
      console.log('Message vide ignoré');
      return;
    }

    console.log('Message envoyé:', message); // Journal du message
    appendChatMessage('Vous', message);
    const response = getChatbotResponse(message);
    console.log('Réponse du chatbot:', response); // Journal de la réponse

    if (response === 'secret') {
      const secretEntry = document.querySelector('#secret-entry');
      if (secretEntry) {
        secretEntry.style.display = 'block';
        chatbotInput.disabled = true;
        appendChatMessage('Assistant ANSAR', 'Veuillez entrer le mot de passe sécurisé.');
      } else {
        console.error('Élément #secret-entry introuvable');
        appendChatMessage('Assistant ANSAR', 'Erreur : impossible d\'afficher la zone de saisie du mot de passe.');
      }
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
  
  // Suppression du préfixe - affiche uniquement le message
  messageElement.textContent = message; 
  
  messages.appendChild(messageElement);
  messages.scrollTop = messages.scrollHeight;
}

function clearChatHistory() {
  const messages = document.querySelector('#chatbot-messages');
  if (messages) messages.innerHTML = '';
  document.querySelector('#secret-entry').style.display = 'none';
  document.querySelector('#chatbot-input').disabled = false;
}

async function checkSecretPassword() {
  try {
    const password = document.querySelector('#secret-password')?.value.trim();
    if (!password) {
      appendChatMessage('Assistant ANSAR', 'Veuillez entrer un code valide.');
      return;
    }

    const accessCodes = await loadAccessCodes();
    
    if (password === accessCodes.presidentAccessCode || password === 'PRESIDENT000') {
      currentUser = { role: 'president' };
      showPage('president');
      clearChatHistory();
    }
    else if (password === accessCodes.secretAccessCode) {
      currentUser = { role: 'admin' };
      showPage('secret');
      clearChatHistory();
    } 
    else if (password === accessCodes.treasurerAccessCode) {
      currentUser = { role: 'tresorier' };
      showPage('treasurer');
      clearChatHistory();
    }
    else if (password === accessCodes.secretaryAccessCode) {
      currentUser = { role: 'secretaire' };
      showPage('secretary');
      clearChatHistory();
    }
    else {
      appendChatMessage('Assistant ANSAR', 'Code incorrect. Accès refusé.');
    }
  } catch (error) {
    console.error('Erreur checkSecretPassword:', error);
    appendChatMessage('Assistant ANSAR', 'Erreur système. Réessayez plus tard.');
  }
}

function getChatbotResponse(message) {
  const trimmedMsg = message.trim().toUpperCase(); // Convertir en majuscules et supprimer les espaces

  // Réponses pour les salutations
  if (trimmedMsg === 'BONJOUR') return 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?';
  if (trimmedMsg === 'SALUT') return 'Salut ! Posez-moi une question ';

  // Vérifier si c'est un mot-clé d'accès
  if (['ADMIN0000', 'TRESORIE0000R', 'SECRET0000AIRE', 'PRESID0000ENT'].includes(trimmedMsg)) {
    return 'secret';
  }

  // Vérifier les codes secrets
  const secretCodes = [
    'ADMIN12301012000',
    'JESUISTRESORIER444',
    'SECRETAIRE000',
    'PRESIDENT000',
    '33333333',
    '44444444',
    '55555555',
    'JESUISTRESORIER444',
    '66666666',
    '77777777',
    '88888888',
    'PRESIDENT000',
    '99999999',
    '11112222',
    '33334444',
    'SECRETAIRE000',
    '55556666',
    '77778888',
    '99990000'
  ];

  console.log('Vérification du message:', message); // Journal pour débogage

  // Vérifie si le message est un code secret
  if (secretCodes.includes(message.trim())) {
    console.log('Code secret détecté:', message);
    return 'secret';
  }

  // Réponses génériques pour autres messages
  switch (message.toLowerCase()) {
    case 'bonjour':
      return 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?';
    case 'salut':
      return 'Salut ! Posez-moi une question ou entrez un code d\'accès.';
    default:
      return 'Désolé, je ne comprends pas votre demande. Essayez un code d\'accès ou une question comme "bonjour".';
  }
}
// ==================== FONCTIONS MEMBRES ====================

document.querySelector('#add-member-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Récupérer le premier code disponible
  const availableCodes = await findAvailableCodes();
  const memberCode = availableCodes.length > 0 
    ? availableCodes[0] 
    : await generateMemberCode();
  
  const memberData = {
    code: memberCode, // Utiliser le code généré
    firstname: document.getElementById('new-member-firstname').value.trim(),
    lastname: document.getElementById('new-member-lastname').value.trim(),
    age: parseInt(document.getElementById('new-member-age')?.value) || null,
    dob: document.getElementById('new-member-dob')?.value || null,
    birthplace: document.getElementById('new-member-birthplace')?.value.trim() || null,
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
    await saveData('members', memberData);
    alert(`Membre ajouté avec le code: ${memberCode}`);
    document.getElementById('add-member-form').reset();
    updateMembersList();
  } catch (error) {
    console.error("Erreur ajout membre:", error);
    alert("Erreur lors de l'ajout du membre");
  }
});

async function generateMemberCode() {
  try {
    const members = await loadData('members');
    
    // 1. Collecter tous les codes numériques existants
    const existingCodes = members
      .map(m => parseInt(m.code))
      .filter(code => !isNaN(code));
    
    // 2. Trouver le code maximum
    const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
    
    // 3. Trouver tous les "trous" dans la numérotation
    const allPossibleCodes = Array.from({length: maxCode}, (_, i) => i + 1);
    const missingCodes = allPossibleCodes.filter(
      code => !existingCodes.includes(code)
    );
    
    // 4. Retourner le premier code manquant ou le suivant
    return (missingCodes.length > 0 
      ? missingCodes[0] 
      : maxCode + 1).toString().padStart(3, '0');
      
  } catch (error) {
    console.error("Erreur génération code:", error);
    // Solution de secours
    return (Math.floor(Math.random() * 900) + 100).toString();
  }
}


async function findAvailableCodes() {
  const members = await loadData('members');
  const existingCodes = members.map(m => parseInt(m.code)).filter(c => !isNaN(c));
  
  if (existingCodes.length === 0) return ['001'];
  
  const maxCode = Math.max(...existingCodes);
  const allCodes = Array.from({length: maxCode}, (_, i) => i + 1);
  
  return allCodes
    .filter(code => !existingCodes.includes(code))
    .map(code => code.toString().padStart(3, '0'));
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
    const list = document.querySelector('#members-list');
    if (!list) {
      console.error('Élément #members-list introuvable');
      alert('Erreur : conteneur de la liste des membres introuvable');
      return;
    }

    // Mapper les rôles aux noms d'affichage
    const roleDisplayMap = {
      'membre': 'Membre',
      'tresorier': 'Trésorier',
      'vice-tresorier': 'Vice-Trésorière',
      'president': 'Président',
      'vice-president': 'Vice-Présidente',
      'secretaire': 'Secrétaire',
      'vice-secretaire': 'Vice-Secrétaire'
    };

    // 1. Trier les membres par code numérique
    const sortedMembers = members.sort((a, b) => {
      // Convertir les codes en nombres pour comparer
      const codeA = parseInt(a.code) || 0; // Si conversion échoue, utilise 0
      const codeB = parseInt(b.code) || 0;
      return codeA - codeB;
    });

    // 2. Générer le HTML avec les membres triés
    list.innerHTML = sortedMembers
      .map(m => `
        <div class="member-card">
          <div>
            <p><strong>${m.firstname} ${m.lastname}</strong></p>
            <p><small>${m.code} • ${roleDisplayMap[m.role] || m.role}</small></p>
          </div>
        </div>
      `).join('') || '<p>Aucun membre trouvé</p>';

  } catch (error) {
    console.error('Erreur updateMembersList:', error);
    alert('Erreur lors du chargement de la liste des membres');
  }
}


async function updateEditMembersList() {
  try {
    const members = await loadData('members');
    const search = document.querySelector('#edit-member-search')?.value.toLowerCase() || '';
    const filter = document.querySelector('#edit-member-filter')?.value || 'all';
    const list = document.querySelector('#edit-members-list');
    if (!list) {
      console.error('Élément #edit-members-list introuvable');
      alert('Erreur : conteneur de la liste des membres introuvable');
      return;
    }

    const filteredMembers = members.filter(m => {
      const matchesSearch = `${m.firstname} ${m.lastname} ${m.code}`.toLowerCase().includes(search);
      if (filter === 'all') return matchesSearch;
      const hasPaid = Object.values(m.contributions.Mensuelle).some(year => year.some(paid => paid)) ||
                      Object.values(m.contributions.globalContributions || {}).some(c => c.paid);
      return matchesSearch && (filter === 'paid' ? hasPaid : !hasPaid);
    });

    list.innerHTML = filteredMembers
      .map(m => `
        <div class="member-card">
          <div>
            <p><strong>${m.firstname} ${m.lastname}</strong></p>
            <p><small>${m.code} • ${m.role}</small></p>
          </div>
          <div class="member-actions">
            <button class="cta-button small" onclick="editMember('${m.code}')">Modifier</button>
            <button class="cta-button small danger" onclick="deleteMember('${m.id}', '${m.firstname} ${m.lastname}')">Supprimer</button>
          </div>
        </div>
      `).join('') || '<p>Aucun membre trouvé</p>';

    document.querySelector('#edit-member-search')?.addEventListener('input', updateEditMembersList);
    document.querySelector('#edit-member-filter')?.addEventListener('change', updateEditMembersList);
  } catch (error) {
    console.error('Erreur updateEditMembersList:', error);
    alert('Erreur lors du chargement de la liste des membres');
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

    form.dataset.editing = member.id; // On garde l'ID pour la sauvegarde dans Firestore
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

async function deleteMember(memberId, memberName) {
  console.log('deleteMember appelé:', memberId, memberName);
  try {
    const deleteForm = document.querySelector('#delete-member-form');
    const membersList = document.querySelector('#edit-members-list');
    const addForm = document.querySelector('#add-member-form');

    if (!deleteForm || !membersList) {
      console.error('Éléments #delete-member-form ou #edit-members-list introuvables');
      alert('Erreur : conteneur de suppression introuvable');
      return;
    }

    membersList.style.display = 'none';
    if (addForm) addForm.style.display = 'none';
    deleteForm.style.display = 'block';
    document.querySelector('#delete-member-code').value = '';

    const title = document.querySelector('#admin-members h3');
    if (title) title.textContent = `Supprimer ${memberName}`;

    const newForm = deleteForm.cloneNode(true);
    deleteForm.parentNode.replaceChild(newForm, deleteForm);

    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await confirmDeleteMember(memberId, memberName);
    });
  } catch (error) {
    console.error('Erreur deleteMember:', error);
    alert('Erreur lors de l’initialisation de la suppression');
  }
}

async function confirmDeleteMember(memberId, memberName) {
  console.log('confirmDeleteMember appelé:', memberId, memberName);
  try {
    const db = firebase.firestore();
    const codesDoc = await db.collection('settings').doc('presidentCodes').get();
    const presidentCodes = codesDoc.exists ? codesDoc.data() : { memberDeletionCode: '0000' };
    const presidentInput = document.querySelector('#delete-member-code')?.value.trim();

    if (!presidentInput) {
      console.log('Code président manquant');
      alert('Veuillez entrer le code président');
      return;
    }

    if (presidentInput !== presidentCodes.memberDeletionCode) {
      console.log('Code président incorrect:', presidentInput);
      alert('Code président incorrect');
      return;
    }

    await deleteData('members', memberId);
    await updateMembersList();
    showPage('admin-members');
    console.log('Membre supprimé:', memberName);
    alert('Membre supprimé avec succès');

    const membersList = document.querySelector('#edit-members-list');
    const addForm = document.querySelector('#add-member-form');
    const deleteForm = document.querySelector('#delete-member-form');
    const title = document.querySelector('#admin-members h3');
    if (membersList) membersList.style.display = 'block';
    if (addForm) addForm.style.display = 'block';
    if (deleteForm) deleteForm.style.display = 'none';
    if (title) title.textContent = 'Modifier/Supprimer un Membre';
  } catch (error) {
    console.error('Erreur confirmDeleteMember:', error);
    alert('Erreur lors de la suppression du membre');
  }
}

async function updateAllMemberLists() {
  await Promise.all([
    updateMembersList(),
    updateEditMembersList(),
    updateStats()
  ]);
}

// Fonction showMemberDetail mise à jour
async function showMemberDetail(code) {
  console.log('showMemberDetail appelé avec code:', code);
  try {
    // Charger les données des membres depuis Firestore
    const members = await loadData('members');
    const member = members.find(m => m.code === code);
    if (!member) {
      console.error('Membre introuvable pour code:', code);
      alert('Membre introuvable');
      return;
    }

    console.log('Membre trouvé:', {
      firstname: member.firstname,
      lastname: member.lastname,
      code: member.code,
      contributions: JSON.stringify(member.contributions, null, 2)
    });

    // Mettre à jour currentUser
    currentUser = member;

    // Afficher la page personnelle
    showPage('personal');
    const personalContent = document.querySelector('#personal-content');
    const personalLogin = document.querySelector('#personal-login');
    
    if (!personalContent || !personalLogin) {
      console.error('Éléments DOM manquants:', {
        personalContent: !!personalContent,
        personalLogin: !!personalLogin
      });
      alert('Erreur : conteneur de l\'espace personnel introuvable');
      return;
    }

    personalLogin.style.display = 'none';
    personalContent.style.display = 'block';
    
    // Mapper les rôles
    const roleDisplayMap = {
      'membre': 'Membre',
      'tresorier': 'Trésorier',
      'vice-tresorier': 'Vice-Trésorière',
      'president': 'Président',
      'vice-president': 'Vice-Présidente',
      'secretaire': 'Secrétaire',
      'vice-secretaire': 'Vice-Secrétaire'
    };
    
    document.querySelector('#personal-title').textContent = `Espace de ${member.firstname} ${member.lastname}`;
    document.querySelector('#personal-role').textContent = `Rôle: ${roleDisplayMap[member.role] || member.role}`;
    
    // Afficher les informations personnelles
    const personalInfo = document.querySelector('#personal-info');
    if (personalInfo) {
      const displayInfo = (value, label) => value ? `<p><strong>${label}:</strong> ${value}</p>` : '';
      personalInfo.innerHTML = `
        ${displayInfo(member.code, 'Code')}
        ${displayInfo(member.status, 'Statut')}
        ${displayInfo(member.age, 'Âge')}
        ${displayInfo(member.dob, 'Date de naissance')}
        ${displayInfo(member.birthplace, 'Lieu de naissance')}
        ${displayInfo(member.email, 'Email')}
        ${displayInfo(member.phone, 'Téléphone')}
        ${displayInfo(member.activity, 'Activité actuelle')}
        ${displayInfo(member.address, 'Adresse')}
        ${displayInfo(member.residence, 'Résidence actuelle')}
      `;
    } else {
      console.error('Élément #personal-info introuvable');
    }

    // Afficher les cotisations mensuelles
    const cotisationsContent = document.querySelector('#cotisations-content');
    if (cotisationsContent) {
      cotisationsContent.innerHTML = Object.entries(member.contributions?.Mensuelle || {}).map(([year, paidMonths]) => `
        <p>${year}: ${paidMonths.map((paid, i) => `${paid ? '✅' : '❌'} ${months[i]}`).join(', ')}</p>
      `).join('') || '<p>Aucune cotisation mensuelle</p>';
    } else {
      console.error('Élément #cotisations-content introuvable');
    }

    // Afficher les cotisations globales
    const contributions = await loadData('contributions');
    console.log('Cotisations globales chargées:', JSON.stringify(contributions, null, 2));
    const globalCotisationsContent = document.querySelector('#global-cotisations-content');
    if (globalCotisationsContent) {
      if (!contributions || contributions.length === 0) {
        console.warn('Aucune cotisation globale trouvée dans Firestore');
        globalCotisationsContent.innerHTML = '<p>Aucune cotisation globale disponible</p>';
      } else {
        globalCotisationsContent.innerHTML = contributions.map(c => {
          const contributionData = member.contributions?.globalContributions?.[c.name] || { paid: false, note: '' };
          console.log(`Affichage cotisation ${c.name} pour ${member.firstname}:`, {
            paid: contributionData.paid,
            note: contributionData.note,
            amount: c.amount
          });
          return `
            <div class="contribution-item">
              <p><strong>${c.name}</strong> (${c.amount} FCFA): ${contributionData.paid ? '✅ Payé' : '❌ Non payé'}
                ${contributionData.note ? `<br><small>Note: ${contributionData.note}</small>` : ''}
              </p>
            </div>
          `;
        }).join('');
      }
    } else {
      console.error('Élément #global-cotisations-content introuvable');
      alert('Erreur : conteneur des cotisations globales introuvable');
    }
  } catch (error) {
    console.error('Erreur showMemberDetail:', error);
    alert('Erreur lors de l\'affichage des détails du membre');
  }
}

// Fonction manageGlobalContribution mise à jour
async function manageGlobalContribution(contributionId, contributionName) {
  console.log('manageGlobalContribution appelé:', contributionId, contributionName);
  try {
    const members = await loadData('members');
    showPage('treasurer-global-manage');
    const globalManage = document.querySelector('#treasurer-global-manage');
    if (!globalManage) {
      console.error('Élément #treasurer-global-manage introuvable');
      alert('Erreur : conteneur des paiements introuvable');
      return;
    }

    globalManage.innerHTML = `
      <button class="cta-button back-button" onclick="goBackToTreasurerGlobal()">
        <span class="material-icons">arrow_back</span> Retour
      </button>
      <h2 id="treasurer-global-title">Gérer les Paiements: ${contributionName}</h2>
      <button id="save-contributions" class="cta-button">Enregistrer</button>
      <input type="text" id="global-contribution-search" placeholder="Rechercher un membre...">
      <div id="global-contribution-members"></div>
    `;

    const membersList = document.querySelector('#global-contribution-members');
    if (!membersList) {
      console.error('Élément #global-contribution-members introuvable après insertion');
      alert('Erreur : conteneur des membres introuvable');
      return;
    }

    const updateMembersList = async () => {
      const search = document.querySelector('#global-contribution-search')?.value.toLowerCase() || '';
      console.log('Mise à jour de la liste des membres avec recherche:', search);
      membersList.innerHTML = members
        .filter(m => `${m.firstname} ${m.lastname} ${m.code}`.toLowerCase().includes(search))
        .map(m => `
          <div class="member-card">
            <p><strong>${m.firstname} ${m.lastname}</strong> (${m.code})</p>
            <label>
              <input type="checkbox" class="global-contribution-checkbox" data-member-id="${m.id}" data-contribution-id="${contributionId}" data-contribution-name="${contributionName}" ${m.contributions?.globalContributions?.[contributionName]?.paid ? 'checked' : ''}>
              Payé
            </label>
            <label>
              <input type="text" class="global-contribution-note" data-member-id="${m.id}" data-contribution-name="${contributionName}" value="${m.contributions?.globalContributions?.[contributionName]?.note || ''}" placeholder="Ajouter une note">
            </label>
          </div>
        `).join('') || '<p>Aucun membre trouvé</p>';
    };

    await updateMembersList();

    const searchInput = document.querySelector('#global-contribution-search');
    if (searchInput) {
      searchInput.addEventListener('input', updateMembersList);
      console.log('Écouteur input ajouté à #global-contribution-search');
    } else {
      console.warn('Champ de recherche #global-contribution-search introuvable');
    }

    const saveButton = document.querySelector('#save-contributions');
    if (saveButton) {
      saveButton.addEventListener('click', async () => {
        console.log('Bouton Enregistrer cliqué');
        try {
          const checkboxes = document.querySelectorAll('.global-contribution-checkbox');
          const noteInputs = document.querySelectorAll('.global-contribution-note');
          const updatedMembers = await loadData('members');

          for (const checkbox of checkboxes) {
            const memberId = checkbox.dataset.memberId;
            const contribName = checkbox.dataset.contributionName;
            const paid = checkbox.checked;

            const noteInput = Array.from(noteInputs).find(input => input.dataset.memberId === memberId && input.dataset.contributionName === contribName);
            const note = noteInput ? noteInput.value.trim() : '';

            const member = updatedMembers.find(m => m.id === memberId);
            if (!member) {
              console.warn(`Membre ${memberId} introuvable dans les données mises à jour`);
              continue;
            }

            const updatedContributions = {
              ...member.contributions,
              globalContributions: {
                ...member.contributions?.globalContributions,
                [contribName]: {
                  id: contributionId,
                  paid,
                  note
                }
              }
            };
            await saveData('members', { contributions: updatedContributions }, memberId);
            console.log('Mise à jour pour', member.firstname, member.lastname, ': payé=', paid, 'note=', note);

            if (currentUser?.code === member.code) {
              console.log('Mise à jour de currentUser et rafraîchissement de l\'espace personnel pour', member.firstname);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1000ms
              currentUser = { ...member, contributions: updatedContributions };
              await showMemberDetail(member.code);
            }
          }

          alert('Modifications enregistrées avec succès');
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement des modifications:', error);
          alert('Erreur lors de l\'enregistrement des modifications');
        }
      });
    } else {
      console.error('Bouton #save-contributions introuvable');
      alert('Erreur : bouton Enregistrer introuvable');
    }
  } catch (error) {
    console.error('Erreur manageGlobalContribution:', error);
    alert('Erreur lors du chargement des paiements');
  }
}

// ==================== FONCTIONS GAL ====================
async function setPresidentCodes(event) {
  event.preventDefault();
  try {
    const memberDeletionCode = document.querySelector('#member-deletion-code').value.trim();
    const contributionDeletionCode = document.querySelector('#contribution-deletion-code').value.trim();

    if (!memberDeletionCode || !contributionDeletionCode) {
      console.error('Codes manquants');
      alert('Veuillez entrer les deux codes');
      return;
    }

    const db = firebase.firestore();
    await db.collection('settings').doc('presidentCodes').set({
      memberDeletionCode,
      contributionDeletionCode,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Codes présidentiels enregistrés:', { memberDeletionCode, contributionDeletionCode });
    alert('Codes de suppression enregistrés avec succès');
    document.querySelector('#set-president-codes-form').reset();
  } catch (error) {
    console.error('Erreur setPresidentCodes:', error);
    alert('Erreur lors de l’enregistrement des codes');
  }
}

// Attacher l'écouteur au formulaire
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#set-president-codes-form');
  if (form) {
    form.addEventListener('submit', setPresidentCodes);
  }
});



// ==================== FONCTIONS ÉVÉNEMENTS ====================

document.querySelector('#add-event-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    console.log('Soumission add-event-form à', new Date().toISOString());
    const name = document.querySelector('#event-name')?.value.trim();
    const dateInput = document.querySelector('#event-date')?.value;
    const timeInput = document.querySelector('#event-time')?.value;
    const description = document.querySelector('#event-description')?.value.trim();

    // Vérification de base des champs
    if (!name || !dateInput || !timeInput || !description) {
      console.error('Champs manquants:', { name, dateInput, timeInput, description });
      alert('Veuillez remplir tous les champs');
      return;
    }

    console.log('Valeurs brutes:', { dateInput, timeInput });

    // Création de la date (format attendu : YYYY-MM-DD et HH:mm)
    const eventDate = new Date(`${dateInput}T${timeInput}:00`);
    console.log('Date construite:', eventDate, 'ISO:', eventDate.toISOString());

    if (isNaN(eventDate.getTime())) {
      console.error('Date invalide:', { dateInput, timeInput });
      alert('Erreur : La date ou l\'heure saisie est invalide (ex. : 2025-07-23, 14:00).');
      return;
    }

    // Vérification simple que la date est future
    const now = new Date();
    if (eventDate <= now) {
      console.error('Date dans le passé:', eventDate);
      alert('L\'événement doit être prévu à une date future');
      return;
    }

    const eventData = {
      name,
      date: eventDate.toISOString(),
      description,
    };

    console.log('Données de l\'événement à enregistrer:', eventData);
    await saveData('events', eventData);
    document.querySelector('#add-event-form').reset();
    await updateEventsAdminList();
    await updateEventCountdowns();
    console.log('Événement ajouté:', name, eventDate);
    alert('Événement ajouté avec succès');
  } catch (error) {
    console.error('Erreur add-event-form:', error);
    alert('Erreur lors de l’ajout de l’événement : ' + error.message);
  }
});

async function updateEventsList() {
  try {
    const events = await loadData('events');
    const list = document.querySelector('#events-list');
    
    list.innerHTML = events.map(event => `
      <div class="event-card">
        <h4>${event.name}</h4>
        <p>${event.description}</p>
        <p class="event-date">${formatEventDate(event.date)}</p>
      </div>
    `).join('') || '<p>Aucun événement disponible</p>';
  } catch (error) {
    console.error('Error updating events:', error);
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

let countdownInterval = null;

async function updateEventCountdowns() {
  try {
    console.log('Début updateEventCountdowns à', new Date().toISOString());
    const countdownContainer = document.querySelector('#event-countdowns');
    if (!countdownContainer) {
      console.error('Élément #event-countdowns introuvable dans le DOM');
      alert('Erreur : Conteneur des comptes à rebours introuvable');
      return;
    }

    const events = await loadData('events');
    console.log('Événements récupérés:', events);

    if (countdownInterval) {
      clearInterval(countdownInterval);
      console.log('Intervalle précédent arrêté');
    }

    const now = new Date();
    const futureEvents = events
      .filter(e => {
        const eventDate = new Date(e.date);
        if (isNaN(eventDate.getTime())) {
          console.warn('Date invalide pour l\'événement:', e);
          return false;
        }
        return true; // On garde tous les événements, passés et futurs
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log('Tous les événements:', futureEvents);

    const updateCountdowns = () => {
      const now = new Date();
      let html = '';

      futureEvents.forEach(event => {
        const eventTime = new Date(event.date);
        if (isNaN(eventTime.getTime())) {
          console.warn('Date invalide dans updateCountdowns:', event);
          html += `<p class="event-countdown">${event.name} - Date invalide</p>`;
          return;
        }

        const timeDiff = eventTime - now;

        if (timeDiff <= 0) {
          // Événement en cours ou passé
          html += `<p class="event-countdown">${event.name} - EN COURS</p>`;
          console.log('Événement en cours ou passé:', event.name);
        } else {
          // Événement futur
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

          html += `
            <p class="event-countdown">${event.name} - ${days} JOURS ${hours}H ${minutes}MN ${seconds}S</p>
          `;
        }
      });

      countdownContainer.innerHTML = html || '<p class="event-countdown">Aucun événement à venir</p>';
      console.log('Comptes à rebours mis à jour:', futureEvents.length, 'événements');
    };

    updateCountdowns();
    countdownInterval = setInterval(updateCountdowns, 1000);
    console.log('Comptes à rebours démarrés pour:', futureEvents.length, 'événements');
  } catch (error) {
    console.error('Erreur updateEventCountdowns:', error);
    if (countdownContainer) {
      countdownContainer.innerHTML = '<p class="event-countdown">Erreur lors du chargement des événements</p>';
    }
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
    console.log('Début updateMessagesList');
    const messages = await loadData('messages');
    console.log('Messages récupérés:', messages);
    const list = document.querySelector('#messages-list');
    if (!list) {
      console.error('Élément #messages-list introuvable');
      return;
    }

    // Trier les messages par date en ordre décroissant (nouveaux en haut)
    const sortedMessages = messages.sort((a, b) => new Date(b.date) - new Date(a.date));

    list.innerHTML = sortedMessages.map(msg => `
      <div class="message-card">
        <div class="title">
          <img src="assets/images/logo.png" alt="Logo">
          ${msg.title}
        </div>
        <div class="message">${msg.text}</div>
        <div class="separator"></div>
        <div class="date">${formatDate(msg.date)}</div>
      </div>
    `).join('') || '<p>Aucun message disponible</p>';

    console.log('Liste des messages mise à jour');
  } catch (error) {
    console.error('Erreur updateMessagesList:', error);
    alert('Erreur lors du chargement des messages');
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
  
  // Nouveau code avec correction de fuseau horaire
  const dateStr = document.querySelector('#auto-message-date').value;
  const timeStr = document.querySelector('#auto-message-time').value;
  const localDate = new Date(`${dateStr}T${timeStr}`);
  const utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));

  const autoMessageData = {
    name: document.querySelector('#auto-message-name').value.trim(),
    text: document.querySelector('#auto-message-text').value.trim(),
    datetime: utcDate.toISOString(), // Stockage en UTC
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
    const nowUTC = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));

    for (const msg of autoMessages) {
      const msgDate = new Date(msg.datetime);
      if (msgDate <= nowUTC) {
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
    console.log('Début updateSuggestionsList');
    const suggestions = await loadData('suggestions');
    console.log('Suggestions récupérées:', suggestions);
    const search = document.querySelector('#suggestions-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#suggestions-list');
    if (!list) {
      console.error('Élément #suggestions-list introuvable');
      alert('Erreur : conteneur des suggestions introuvable');
      return;
    }

    list.innerHTML = suggestions
      .filter(s => s.text.toLowerCase().includes(search) || s.memberCode.toLowerCase().includes(search))
      .map(s => `
        <div class="suggestion-card">
          <p><strong>${s.memberCode}</strong>: ${s.text}</p>
          <p class="suggestion-date">${formatDate(s.createdAt)}</p>
          <button class="cta-button danger small" onclick="deleteSuggestion('${s.id}')">Supprimer</button>
        </div>
      `).join('') || '<p>Aucune suggestion disponible</p>';

    console.log('Liste des suggestions mise à jour');
  } catch (error) {
    console.error('Erreur updateSuggestionsList:', error);
    alert('Erreur lors du chargement des suggestions');
  }
}

async function deleteSuggestion(suggestionId) {
  console.log('deleteSuggestion appelé avec ID:', suggestionId);
  try {
    if (!confirm('Voulez-vous vraiment supprimer cette suggestion ?')) {
      console.log('Suppression annulée par l\'utilisateur');
      return;
    }

    await deleteData('suggestions', suggestionId);
    await updateSuggestionsList();
    console.log('Suggestion supprimée:', suggestionId);
    alert('Suggestion supprimée avec succès');
  } catch (error) {
    console.error('Erreur deleteSuggestion:', error);
    alert('Erreur lors de la suppression de la suggestion : ' + error.message);
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
  console.log('updateContributionsAdminList appelé');
  try {
    const contributions = await loadData('contributions');
    const members = await loadData('members');
    const search = document.querySelector('#contributions-admin-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#contributions-admin-list');
    if (!list) {
      console.error('Élément #contributions-admin-list introuvable');
      alert('Erreur : conteneur des cotisations introuvable');
      return;
    }

    // Fonction pour échapper les caractères spéciaux
    const escapeString = (str) => str.replace(/'/g, "\\'").replace(/"/g, '\\"');

    list.innerHTML = contributions
      .filter(c => c.name.toLowerCase().includes(search))
      .map(c => `
        <div class="contribution-card">
          <p><strong>${c.name}</strong>: ${c.amount} FCFA</p>
          <p class="contribution-date">${formatDate(c.createdAt)}</p>
          <button class="cta-button" onclick="manageGlobalContribution('${c.id}', '${escapeString(c.name)}')">Gérer Paiements</button>
          <button class="cta-button danger" onclick="deleteGlobalContribution('${c.id}', '${escapeString(c.name)}')">Supprimer</button>
        </div>
      `).join('') || '<p>Aucune cotisation disponible</p>';
  } catch (error) {
    console.error('Erreur updateContributionsAdminList:', error);
    alert('Erreur lors du chargement des cotisations');
  }
}

async function deleteGlobalContribution(contributionId, contributionName) {
  console.log('deleteGlobalContribution appelé:', contributionId, contributionName);
  try {
    showPage('treasurer-global-manage');
    const globalManage = document.querySelector('#treasurer-global-manage');
    if (!globalManage) {
      console.error('Élément #treasurer-global-manage introuvable');
      alert('Erreur : conteneur des paiements introuvable');
      return;
    }

    globalManage.innerHTML = `
      <button class="cta-button back-button" onclick="goBackToTreasurerGlobal()"><span class="material-icons">arrow_back</span> Retour</button>
      <h2 id="treasurer-global-title">Supprimer la cotisation: ${contributionName}</h2>
      <form id="delete-contribution-form">
        <p>Entrez le code président pour confirmer la suppression :</p>
        <input type="password" id="delete-contribution-code" placeholder="Code président" required>
        <button type="submit" class="cta-button">Confirmer</button>
        <button type="button" class="cta-button" onclick="goBackToTreasurerGlobal()">Annuler</button>
      </form>
    `;

    const deleteForm = document.querySelector('#delete-contribution-form');
    deleteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await confirmDeleteContribution(contributionId, contributionName);
    });
  } catch (error) {
    console.error('Erreur deleteGlobalContribution:', error);
    alert('Erreur lors de l’initialisation de la suppression');
  }
}

async function confirmDeleteContribution(contributionId, contributionName) {
  console.log('confirmDeleteContribution appelé:', contributionId, contributionName);
  try {
    const db = firebase.firestore();
    const codesDoc = await db.collection('settings').doc('presidentCodes').get();
    const presidentCodes = codesDoc.exists ? codesDoc.data() : { contributionDeletionCode: '0000' };
    const presidentInput = document.querySelector('#delete-contribution-code')?.value.trim();

    if (presidentInput !== presidentCodes.contributionDeletionCode) {
      console.log('Code président incorrect:', presidentInput);
      alert('Code président incorrect');
      return;
    }

    await deleteData('contributions', contributionId);
    const members = await loadData('members');
    for (const member of members) {
      const updatedContributions = { ...member.contributions };
      delete updatedContributions.globalContributions[contributionName];
      await saveData('members', { contributions: updatedContributions }, member.id);
    }

    await updateContributionsAdminList();
    showPage('treasurer-global');
    console.log('Cotisation supprimée:', contributionName);
    alert('Cotisation globale supprimée avec succès');
  } catch (error) {
    console.error('Erreur confirmDeleteContribution:', error);
    alert('Erreur lors de la suppression de la cotisation');
  }
}

// Nouvelle fonction pour gérer les paiements des cotisations globales
async function manageGlobalContribution(contributionId, contributionName) {
  console.log('manageGlobalContribution appelé:', contributionId, contributionName);
  try {
    const members = await loadData('members');
    showPage('treasurer-global-manage');
    const globalManage = document.querySelector('#treasurer-global-manage');
    if (!globalManage) {
      console.error('Élément #treasurer-global-manage introuvable');
      alert('Erreur : conteneur des paiements introuvable');
      return;
    }

    // Initialiser le contenu avec le titre, le bouton Enregistrer et le champ de recherche
    globalManage.innerHTML = `
      <button class="cta-button back-button" onclick="goBackToTreasurerGlobal()">
        <span class="material-icons">arrow_back</span> Retour
      </button>
      <h2 id="treasurer-global-title">Gérer les Paiements: ${contributionName}</h2>
      <button id="save-contributions" class="cta-button">Enregistrer</button>
      <input type="text" id="global-contribution-search" placeholder="Rechercher un membre...">
      <div id="global-contribution-members"></div>
    `;

    // S'assurer que #global-contribution-members existe après l'insertion
    const membersList = document.querySelector('#global-contribution-members');
    if (!membersList) {
      console.error('Élément #global-contribution-members introuvable après insertion');
      alert('Erreur : conteneur des membres introuvable');
      return;
    }

    const updateMembersList = async () => {
      const search = document.querySelector('#global-contribution-search')?.value.toLowerCase() || '';
      console.log('Mise à jour de la liste des membres avec recherche:', search);
      membersList.innerHTML = members
        .filter(m => `${m.firstname} ${m.lastname} ${m.code}`.toLowerCase().includes(search))
        .map(m => `
          <div class="member-card">
            <p><strong>${m.firstname} ${m.lastname}</strong> (${m.code})</p>
            <label>
              <input type="checkbox" class="global-contribution-checkbox" data-member-id="${m.id}" data-contribution-id="${contributionId}" data-contribution-name="${contributionName}" ${m.contributions?.globalContributions?.[contributionName]?.paid ? 'checked' : ''}>
              Payé
            </label>
            <label>
              <input type="text" class="global-contribution-note" data-member-id="${m.id}" data-contribution-name="${contributionName}" value="${m.contributions?.globalContributions?.[contributionName]?.note || ''}" placeholder="Ajouter une note">
            </label>
          </div>
        `).join('') || '<p>Aucun membre trouvé</p>';
    };

    // Mettre à jour la liste des membres immédiatement
    await updateMembersList();

    // Ajouter l'écouteur pour la recherche
    const searchInput = document.querySelector('#global-contribution-search');
    if (searchInput) {
      searchInput.addEventListener('input', updateMembersList);
      console.log('Écouteur input ajouté à #global-contribution-search');
    } else {
      console.warn('Champ de recherche #global-contribution-search introuvable');
    }

    // Gérer le clic sur le bouton Enregistrer
    const saveButton = document.querySelector('#save-contributions');
    if (saveButton) {
      saveButton.addEventListener('click', async () => {
        console.log('Bouton Enregistrer cliqué');
        try {
          const checkboxes = document.querySelectorAll('.global-contribution-checkbox');
          const noteInputs = document.querySelectorAll('.global-contribution-note');

          for (const checkbox of checkboxes) {
            const memberId = checkbox.dataset.memberId;
            const contribName = checkbox.dataset.contributionName;
            const paid = checkbox.checked;

            const noteInput = Array.from(noteInputs).find(input => input.dataset.memberId === memberId && input.dataset.contributionName === contribName);
            const note = noteInput ? noteInput.value.trim() : '';

            const member = members.find(m => m.id === memberId);
            const updatedContributions = {
              ...member.contributions,
              globalContributions: {
                ...member.contributions?.globalContributions,
                [contribName]: {
                  id: contributionId,
                  paid,
                  note
                }
              }
            };
            await saveData('members', { contributions: updatedContributions }, memberId);
            console.log('Mise à jour pour', member.firstname, member.lastname, ': payé=', paid, 'note=', note);

            // Mettre à jour l'espace personnel si nécessaire
            if (currentUser?.code === member.code) {
              showMemberDetail(member.code);
            }
          }

          alert('Modifications enregistrées avec succès');
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement des modifications:', error);
          alert('Erreur lors de l\'enregistrement des modifications');
        }
      });
    } else {
      console.error('Bouton #save-contributions introuvable');
      alert('Erreur : bouton Enregistrer introuvable');
    }
  } catch (error) {
    console.error('Erreur manageGlobalContribution:', error);
    alert('Erreur lors du chargement des paiements');
  }
}

function goBackToTreasurerGlobal() {
  console.log('Retour à treasurer-global'); // Journal
  showPage('treasurer-global');
}

async function updateTreasurerMonthlyList() {
  try {
    const members = await loadData('members');
    const search = document.querySelector('#treasurer-monthly-search')?.value.toLowerCase() || '';
    const filter = document.querySelector('#treasurer-monthly-filter')?.value || 'all';
    const list = document.querySelector('#treasurer-monthly-list');
    if (!list) {
      console.error('Élément #treasurer-monthly-list introuvable');
      return;
    }

    const filteredMembers = members.filter(m => {
      const matchesSearch = `${m.firstname} ${m.lastname} ${m.code}`.toLowerCase().includes(search);
      if (filter === 'all') return matchesSearch;
      const hasPaid = Object.values(m.contributions.Mensuelle).some(year => year.some(paid => paid));
      return matchesSearch && (filter === 'paid' ? hasPaid : !hasPaid);
    });

    list.innerHTML = filteredMembers
      .map(m => `
        <div class="member-card" onclick="manageMemberMonthlyContributions('${m.code}')">
          <div>
            <p><strong>${m.firstname} ${m.lastname}</strong></p>
            <p><small>${m.code} • ${m.role}</small></p>
          </div>
        </div>
      `).join('') || '<p>Aucun membre trouvé</p>';

    document.querySelector('#treasurer-monthly-search')?.addEventListener('input', updateTreasurerMonthlyList);
    document.querySelector('#treasurer-monthly-filter')?.addEventListener('change', updateTreasurerMonthlyList);
  } catch (error) {
    console.error('Erreur updateTreasurerMonthlyList:', error);
  }
}

async function manageMemberMonthlyContributions(code) {
  console.log('manageMemberMonthlyContributions appelé avec code:', code);
  try {
    const members = await loadData('members');
    const member = members.find(m => m.code === code);
    if (!member) {
      console.error('Membre introuvable pour code:', code);
      alert('Membre introuvable');
      return;
    }

    console.log('Membre trouvé:', member.firstname, member.lastname);
    const content = document.querySelector('#treasurer-monthly-content');
    if (!content) {
      console.error('Élément #treasurer-monthly-content introuvable');
      alert('Erreur : conteneur des cotisations mensuelles introuvable');
      return;
    }

    document.querySelector('#treasurer-member-title').textContent = `Cotisations de ${member.firstname} ${member.lastname}`;
    content.innerHTML = `
      <form id="member-monthly-contributions-form">
        ${Object.entries(member.contributions.Mensuelle).map(([year, paidMonths]) => `
          <div class="contribution-year">
            <h4>${year}</h4>
            ${paidMonths.map((paid, i) => `
              <label>
                <input type="checkbox" name="month-${year}-${i}" data-member-id="${member.id}" data-year="${year}" data-month="${i}" ${paid ? 'checked' : ''}>
                ${months[i]}
              </label>
            `).join('')}
          </div>
        `).join('')}
      </form>
    `;

    console.log('Contenu des cotisations mensuelles généré pour', member.firstname, member.lastname);
    showPage('treasurer-member-monthly');
  } catch (error) {
    console.error('Erreur manageMemberMonthlyContributions:', error);
    alert('Erreur lors du chargement des cotisations');
  }
}


async function saveMonthlyContributions() {
  console.log('saveMonthlyContributions appelé');
  try {
    const form = document.querySelector('#member-monthly-contributions-form');
    if (!form) {
      console.error('Formulaire #member-monthly-contributions-form introuvable');
      alert('Erreur : formulaire des cotisations introuvable');
      return;
    }

    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length === 0) {
      console.error('Aucune case à cocher trouvée');
      alert('Aucune cotisation à enregistrer');
      return;
    }

    const memberId = checkboxes[0].dataset.memberId; // Récupérer l'ID du membre depuis la première case
    const members = await loadData('members');
    const member = members.find(m => m.id === memberId);
    if (!member) {
      console.error('Membre introuvable pour ID:', memberId);
      alert('Membre introuvable');
      return;
    }

    // Collecter l'état des cases à cocher
    const updatedContributions = { ...member.contributions };
    checkboxes.forEach(checkbox => {
      const year = checkbox.dataset.year;
      const month = parseInt(checkbox.dataset.month);
      updatedContributions.Mensuelle[year][month] = checkbox.checked;
    });

    // Sauvegarder dans Firestore
    await saveData('members', { contributions: updatedContributions }, memberId);
    console.log('Cotisations enregistrées pour', member.firstname, member.lastname);

    // Mettre à jour l'espace personnel si l'utilisateur est le membre concerné
    if (currentUser?.code === member.code) {
      showMemberDetail(member.code);
    }

    alert('Cotisations mensuelles enregistrées avec succès');
    showPage('treasurer-monthly'); // Retour à la liste des membres
  } catch (error) {
    console.error('Erreur saveMonthlyContributions:', error);
    alert('Erreur lors de l’enregistrement des cotisations');
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

// Ajouter un fichier secrétaire
document.querySelector('#add-secretary-file-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileData = {
    name: document.querySelector('#secretary-file-name')?.value.trim() || 'Fichier sans nom',
    category: document.querySelector('#secretary-file-category')?.value.trim() || '',
    url: document.querySelector('#secretary-file-url')?.value.trim() || '',
    createdAt: new Date().toISOString()
  };

  try {
    if (!fileData.url.match(/\.(jpeg|jpg|png|gif)$/i)) {
      throw new Error('Lien d\'image invalide. Utilisez un lien vers une image (jpg, png, gif).');
    }
    await saveData('secretaryFiles', fileData);
    document.querySelector('#add-secretary-file-form').reset();
    await updateSecretaryFilesList();
    await updateHomeGallery();
    alert('Image ajoutée avec succès');
  } catch (error) {
    console.error('Erreur addSecretaryFile:', error);
    alert('Erreur lors de l\'ajout de l\'image : ' + error.message);
  }
});

// Mettre à jour la liste des fichiers secrétaire
async function updateSecretaryFilesList() {
  try {
    // Charger à la fois les fichiers et les livres
    const files = await loadData('secretaryFiles');
    const books = await loadData('books');
    const search = document.querySelector('#secretary-files-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#secretary-files-list');
    
    if (!list) return;

    // Afficher les fichiers et livres ensemble
    list.innerHTML = [
      ...files.map(f => `
        <div class="file-card">
          <p><strong>${f.category}</strong>: ${f.name}</p>
          <p><a href="${f.url}" target="_blank">${f.url}</a></p>
          <p class="file-date">${formatDate(f.createdAt)}</p>
          <button class="cta-button danger" onclick="deleteSecretaryFile('${f.id}')">Supprimer</button>
        </div>
      `),
      ...books.map(b => `
        <div class="file-card">
          <p><strong>Livre: ${b.title}</strong> (${b.category})</p>
          <p>Couverture: <a href="${b.coverUrl}" target="_blank">Lien</a></p>
          <p>PDF: <a href="${b.pdfUrl}" target="_blank">Télécharger</a></p>
          <p class="file-date">${formatDate(b.createdAt)}</p>
          <button class="cta-button danger" onclick="deleteLibraryBook('${b.id}')">Supprimer</button>
        </div>
      `)
    ].join('') || '<p>Aucun fichier ou livre disponible</p>';
  } catch (error) {
    console.error('Erreur updateSecretaryFilesList:', error);
  }
}

async function deleteLibraryBook(bookId) {
  if (!confirm('Voulez-vous vraiment supprimer ce livre ? Cette action est irréversible.')) {
    return;
  }

  try {
    // Supprimer le livre de la collection 'books'
    await deleteData('books', bookId);
    
    // Mettre à jour les deux listes
    await updateSecretaryFilesList();
    await updateLibraryContent();
    
    alert('Livre supprimé avec succès !');
  } catch (error) {
    console.error('Erreur deleteLibraryBook:', error);
    alert('Erreur lors de la suppression du livre');
  }
}

// Supprimer un fichier secrétaire
async function deleteSecretaryFile(fileId) {
  try {
    await firebase.firestore().collection('secretaryFiles').doc(fileId).delete();
    console.log('Fichier supprimé:', fileId);
    await updateSecretaryFilesList();
    await updateHomeGallery();
    alert('Image supprimée avec succès');
  } catch (error) {
    console.error('Erreur deleteSecretaryFile:', error);
    alert('Erreur lors de la suppression de l\'image');
  }
}

// Mettre à jour la galerie dans la page d'accueil
async function updateHomeGallery() {
  try {
    const files = await loadData('secretaryFiles');
    const gallery = document.querySelector('#home-gallery');
    if (!gallery) {
      console.error('Élément #home-gallery introuvable');
      return;
    }

    gallery.innerHTML = files
      .map(f => `
        <div class="gallery-item">
          <img src="${f.url}" alt="${f.name}" class="gallery-image">
        </div>
      `).join('') || '<p>Aucune image disponible</p>';
  } catch (error) {
    console.error('Erreur updateHomeGallery:', error);
    alert('Erreur lors du chargement de la galerie');
  }
}


// Ajouter un livre à la bibliothèque
// Ajouter un livre à la bibliothèque
document.querySelector('#add-library-book-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const bookData = {
    title: document.querySelector('#book-title').value.trim(),
    category: document.querySelector('#book-category').value.trim(),
    coverUrl: document.querySelector('#book-cover-url').value.trim(),
    pdfUrl: document.querySelector('#book-pdf-url').value.trim(),
    createdAt: new Date().toISOString()
  };

  try {
    // Validation de l'URL de couverture
    if (!bookData.coverUrl.match(/\.(jpeg|jpg|png|gif)$/i)) {
      throw new Error('Lien de couverture invalide. Utilisez un lien vers une image (jpg, png, gif).');
    }
    
    // Nouvelle validation améliorée pour les PDF
    if (!isValidPdfUrl(bookData.pdfUrl)) {
      throw new Error('Lien PDF invalide. Utilisez un lien direct .pdf ou un lien Google Drive valide');
    }

    // Convertir les liens Google Drive en liens de téléchargement direct
    bookData.pdfUrl = convertToDirectDownloadLink(bookData.pdfUrl);

    await saveData('books', bookData);
    document.querySelector('#add-library-book-form').reset();
    await updateLibraryContent();
    alert('Livre ajouté avec succès!');
  } catch (error) {
    console.error('Erreur addLibraryBook:', error);
    alert('Erreur: ' + error.message);
  }
});

// Fonction de validation des URLs PDF
function isValidPdfUrl(url) {
  // Accepte :
  // - Les liens se terminant par .pdf
  // - Les liens Google Drive
  // - Les liens Dropbox
  const validPatterns = [
    /\.pdf$/i, // Termine par .pdf
    /drive\.google\.com\/file\/d\//i, // Lien Google Drive standard
    /drive\.google\.com\/uc\?export=download/i, // Lien Google Drive direct
    /dropbox\.com\/s\//i // Lien Dropbox
  ];
  
  return validPatterns.some(pattern => pattern.test(url));
}

// Fonction pour convertir les liens Google Drive en liens de téléchargement direct
function convertToDirectDownloadLink(url) {
  // Si c'est déjà un lien direct, ne rien faire
  if (url.includes('uc?export=download')) return url;
  
  // Conversion des liens Google Drive standard
  if (url.includes('drive.google.com/file/d/')) {
    const fileId = url.match(/\/file\/d\/([^\/]+)/)?.[1];
    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }
  
  return url; // Retourne l'URL originale si aucune conversion n'est possible
}

// ==================== FONCTIONS MESSAGES MOTIVATIONNELS ====================

// Gestion de l'envoi
// Remplacez toute la fonction par cette version garantie
async function updateMotivationDisplay() {
  try {
    // Nettoyer l'ancien écouteur s'il existe
    if (window.motivationUnsubscribe) {
      window.motivationUnsubscribe();
    }

    // Créer un nouvel écouteur en temps réel pour le dernier message
    window.motivationUnsubscribe = db.collection("motivations")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.empty) {
            const latest = snapshot.docs[0].data();
            const formattedDate = formatDate(latest.createdAt?.toDate());
            
            // Mise à jour dans l'interface admin
const adminDisplay = document.querySelector('#displayed-motivation');
if (adminDisplay) {
  if (latest.text) {
    adminDisplay.textContent = latest.text;
    adminDisplay.style.display = 'block';
  } else {
    adminDisplay.style.display = 'none';
  }
}
            
            // Mise à jour sur la page d'accueil
// Nouveau code (disparaît si pas de message)
const homeDisplay = document.querySelector('#home-motivation');
if (homeDisplay) {
  if (latest.text) {
    homeDisplay.innerHTML = `
      <div class="motivation-card">
        <p>${latest.text}</p>
        ${latest.createdAt ? `<small>Posté le ${formattedDate}</small>` : ''}
      </div>
    `;
    homeDisplay.style.display = 'block';
  } else {
    homeDisplay.innerHTML = ''; // Vide complètement le contenu
    homeDisplay.style.display = 'none'; // Cache l'élément
  }
}

            // Mise à jour de l'historique
            const historyContainer = document.querySelector('#motivation-history');
            if (historyContainer) {
              historyContainer.innerHTML = snapshot.docs.map(doc => {
                const data = doc.data();
                const date = formatDate(data.createdAt?.toDate());
                return `
                  <div style="padding: 10px; border-bottom: 1px solid #eee;">
                    <p>${data.text}</p>
                    <small>${date}</small>
                    <button onclick="deleteMotivationMessage('${doc.id}')" style="float: right;" class="cta-button danger small">Supprimer</button>
                  </div>
                `;
              }).join('') || '<p>Aucun message dans l\'historique</p>';
            }
          }
        },
        (error) => {
          console.error("Erreur d'écoute des messages motivationnels:", error);
        }
      );
  } catch (error) {
    console.error("Erreur dans updateMotivationDisplay:", error);
  }
}

// Nouvelle fonction pour supprimer un message spécifique
async function deleteMotivationMessage(id) {
  if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;
  
  try {
    await db.collection("motivations").doc(id).delete();
    alert("Message supprimé avec succès");
    updateMotivationDisplay(); // Rafraîchir l'affichage
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    alert("Erreur lors de la suppression du message");
  }
}


// Gestion de l'envoi des messages motivationnels
document.querySelector('#send-motivation-btn')?.addEventListener('click', async function() {
  const motivationText = document.querySelector('#motivation-text').value.trim();
  
  if (!motivationText) {
    alert("Veuillez entrer un message motivationnel");
    return;
  }

  try {
    await db.collection("motivations").add({
      text: motivationText,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    alert("Message envoyé avec succès !");
    document.querySelector('#motivation-text').value = "";
    updateMotivationDisplay(); // Mettre à jour l'affichage
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error);
    alert("Une erreur est survenue lors de l'envoi");
  }
});

// Gestion de la suppression des messages motivationnels
document.querySelector('#delete-motivation-btn')?.addEventListener('click', async function() {
  if (!confirm("Voulez-vous vraiment supprimer le dernier message motivationnel ?")) {
    return;
  }

  try {
    // Récupérer le dernier message
    const snapshot = await db.collection("motivations")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (!snapshot.empty) {
      // Supprimer le document
      await snapshot.docs[0].ref.delete();
      alert("Message supprimé avec succès !");
      updateMotivationDisplay(); // Mettre à jour l'affichage
    } else {
      alert("Aucun message à supprimer");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    alert("Une erreur est survenue lors de la suppression");
  }
});

// Version corrigée de updateMotivationDisplay (fusion des deux versions)
async function updateMotivationDisplay() {
  try {
    // Nettoyer l'ancien écouteur s'il existe
    if (window.motivationUnsubscribe) {
      window.motivationUnsubscribe();
    }

    // Créer un nouvel écouteur en temps réel
    window.motivationUnsubscribe = db.collection("motivations")
      .orderBy("createdAt", "desc")
      .limit(1)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.empty) {
            const latest = snapshot.docs[0].data();
            const formattedDate = formatDate(latest.createdAt?.toDate());
            
            // Mise à jour dans l'interface admin
            const adminDisplay = document.querySelector('#displayed-motivation');
            if (adminDisplay) {
              adminDisplay.textContent = latest.text || "Aucun message";
            }
            
            // Mise à jour sur la page d'accueil
            const homeDisplay = document.querySelector('#home-motivation');
            if (homeDisplay) {
              homeDisplay.innerHTML = `
                <div class="motivation-card">
                  <p>${latest.text || "Aucun message motivationnel"}</p>
                  ${latest.createdAt ? `<small>Posté le ${formattedDate}</small>` : ''}
                </div>
              `;
            }
          } else {
            // Si aucun message n'existe
            const homeDisplay = document.querySelector('#home-motivation');
            if (homeDisplay) {
              homeDisplay.innerHTML = `
                <div class="motivation-card">
                  <p>Aucun message motivationnel</p>
                </div>
              `;
            }
          }
        },
        (error) => {
          console.error("Erreur d'écoute des messages motivationnels:", error);
        }
      );
  } catch (error) {
    console.error("Erreur dans updateMotivationDisplay:", error);
  }
}


function showSecretarySection(sectionId) {
  try {
    // Sélectionner toutes les sections avec la classe 'secretary-content'
    const sections = document.querySelectorAll('.secretary-content');
    const buttons = document.querySelectorAll('.tab-button');

    // Masquer toutes les sections et désactiver la classe 'active' des boutons
    sections.forEach(section => {
      section.style.display = 'none';
    });
    buttons.forEach(button => {
      button.classList.remove('active');
    });

    // Afficher la section demandée et activer le bouton correspondant
    const targetSection = document.getElementById(`${sectionId}-section`);
    const targetButton = document.querySelector(`button[onclick="showSecretarySection('${sectionId}')"]`);

    if (targetSection && targetButton) {
      targetSection.style.display = 'block';
      targetButton.classList.add('active');
      
      // Mettre à jour le contenu spécifique à la section
      switch (sectionId) {
        case 'affiche':
          updateSecretaryFilesList();
          break;
        case 'livre':
          updateLibraryContent();
          break;
        case 'message':
          updateMotivationDisplay();
          break;
        default:
          console.warn(`Section non reconnue : ${sectionId}`);
      }
    } else {
      console.error(`Section ou bouton pour ${sectionId} introuvable`);
    }
  } catch (error) {
    console.error('Erreur dans showSecretarySection:', error);
    alert('Erreur lors du changement de section');
  }
}

// ==================== FONCTIONS STATISTIQUES ====================

async function updateStats() {
  try {
    console.log('Début updateStats à', new Date().toISOString());
    const members = await loadData('members');
    console.log('Membres chargés:', members);
    const contributions = await loadData('contributions');
    console.log('Cotisations chargées:', contributions);

    // Remplir le sélecteur des cotisations globales
    const globalSelect = document.querySelector('#global-contribution');
    if (globalSelect) {
      globalSelect.innerHTML = contributions
        .map(c => `<option value="${c.name}">${c.name} (${c.amount} FCFA)</option>`)
        .join('') || '<option value="">Aucune cotisation globale</option>';
    } else {
      console.warn('Sélecteur #global-contribution introuvable');
    }

    // Gérer le changement de type de cotisation
    const statsTypeSelect = document.querySelector('#stats-type');
    if (statsTypeSelect) {
      statsTypeSelect.addEventListener('change', () => {
        const monthlySelection = document.querySelector('#monthly-selection');
        const globalSelection = document.querySelector('#global-selection');
        if (monthlySelection && globalSelection) {
          monthlySelection.style.display = statsTypeSelect.value === 'monthly' ? 'block' : 'none';
          globalSelection.style.display = statsTypeSelect.value === 'global' ? 'block' : 'none';
          // Afficher un graphique par défaut lors du changement
          renderStatsChart('bar');
        }
      });
    } else {
      console.warn('Sélecteur #stats-type introuvable');
    }

    // Ajouter des écouteurs pour les changements de mois et d'année
    const statsMonth = document.querySelector('#stats-month');
    const statsYear = document.querySelector('#stats-year');
    const globalContribution = document.querySelector('#global-contribution');

    if (statsMonth) statsMonth.addEventListener('change', () => renderStatsChart('bar'));
    if (statsYear) statsYear.addEventListener('change', () => renderStatsChart('bar'));
    if (globalContribution) globalContribution.addEventListener('change', () => renderStatsChart('bar'));

    // Afficher un graphique par défaut
    renderStatsChart('bar');
} catch (error) {
    console.error('Erreur updateStats:', error.message, error.stack);
    alert('Erreur lors du chargement des statistiques : ' + error.message);
  }
}

// Fonction pour afficher les graphiques statistiques
async function renderStatsChart(chartType) {
  try {
    console.log('Début renderStatsChart avec type:', chartType);
    
    // Récupérer les données nécessaires
    const members = await loadData('members');
    const contributions = await loadData('contributions');
    
    // Récupérer les sélections
    const statsType = document.querySelector('#stats-type').value;
    const ctx = document.getElementById('stats-chart').getContext('2d');
    
    // Détruire le graphique précédent s'il existe
    if (window.statsChart) {
      window.statsChart.destroy();
    }

    // Préparer les données selon le type de statistique
    let chartData;
    if (statsType === 'monthly') {
      // Statistiques mensuelles
      const month = parseInt(document.querySelector('#stats-month').value);
      const year = document.querySelector('#stats-year').value;
      
      const paidCount = members.filter(m => 
        m.contributions?.Mensuelle?.[year]?.[month]
      ).length;
      
      const unpaidCount = members.length - paidCount;
      
      chartData = {
        labels: ['Payé', 'Non payé'],
        datasets: [{
          label: `Cotisations ${months[month]} ${year}`,
          data: [paidCount, unpaidCount],
          backgroundColor: ['#4CAF50', '#F44336']
        }]
      };
    } else {
      // Statistiques globales
      const contributionName = document.querySelector('#global-contribution').value;
      const contribution = contributions.find(c => c.name === contributionName);
      
      if (!contribution) {
        console.error('Cotisation globale non trouvée');
        return;
      }
      
      const paidCount = members.filter(m => 
        m.contributions?.globalContributions?.[contributionName]?.paid
      ).length;
      
      const unpaidCount = members.length - paidCount;
      
      chartData = {
        labels: ['Payé', 'Non payé'],
        datasets: [{
          label: `Cotisation ${contributionName}`,
          data: [paidCount, unpaidCount],
          backgroundColor: ['#4CAF50', '#F44336']
        }]
      };
    }

    // Créer le graphique selon le type demandé
    window.statsChart = new Chart(ctx, {
      type: chartType,
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Statistiques des Cotisations'
          }
        }
      }
    });
    
    console.log('Graphique généré avec succès');
  } catch (error) {
    console.error('Erreur dans renderStatsChart:', error);
    alert('Erreur lors de la génération du graphique: ' + error.message);
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
  // Ouvrir le lien Wave dans un nouvel onglet
  window.open('https://pay.wave.com/m/M_sn_dyIw8DZWV46K/c/sn/', '_blank');
  
  // Alternative : rediriger dans la même fenêtre
  // window.location.href = 'https://pay.wave.com/m/M_sn_dyIw8DZWV46K/c/sn/';
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
      .filter(b => 
        b.title?.toLowerCase().includes(search) || 
        b.category?.toLowerCase().includes(search)
      )
      .map(b => `
        <div class="book-item">
          <div class="book-cover" onclick="downloadPDF('${b.pdfUrl}', '${b.title.replace(/'/g, "\\'")}')">
            <img src="${b.coverUrl}" alt="${b.title}">
          </div>
          <div class="book-info">
            <h4>${b.title || 'Sans titre'}</h4>
            <p>Catégorie: ${b.category || 'Non spécifié'}</p>
            ${currentUser?.role === 'secretaire' ? `
              <button class="cta-button danger small" onclick="deleteLibraryBook('${b.id}')">
                Supprimer
              </button>
            ` : ''}
          </div>
        </div>
      `).join('') || '<p>Aucun livre disponible</p>';
  } catch (error) {
    console.error('Erreur updateLibraryContent:', error);
  }
}

// Télécharger le PDF
function downloadPDF(pdfUrl, fileName) {
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = fileName || 'document';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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


function goBackToTreasurerMonthly() {
  console.log('Retour à treasurer-monthly');
  showPage('treasurer-monthly');
}

function goBackToTreasurer() {
  console.log('Retour à treasurer'); // Journal pour débogage
  showPage('treasurer');
}

function formatEventDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date à confirmer'; // Message de repli
  }
}

// Charger les codes d'accès
async function loadAccessCodes() {
  try {
    const doc = await db.collection('securitySettings').doc('accessCodes').get();
    if (!doc.exists) {
      // Si le document n'existe pas, initialisez-le avec des valeurs par défaut
      await initializeDefaultCodes();
      return {
        secretAccessCode: 'ADMIN123',
        treasurerAccessCode: 'TRESORIER66',
        secretaryAccessCode: 'SECRETAIRE33',
        presidentAccessCode: 'PRESIDENT000'
      };
    }
    return doc.data();
  } catch (error) {
    console.error('Erreur loadAccessCodes:', error);
    return null;
  }
}

// Sauvegarder un code individuel
async function saveSingleCode(inputId, codeType) {
  try {
    const codeValue = document.getElementById(inputId).value.trim();
    if (!codeValue) {
      alert('Veuillez entrer un code valide');
      return;
    }

    const currentCodes = await loadAccessCodes();
    await db.collection('securitySettings').doc('accessCodes').set({
      ...currentCodes,
      [codeType]: codeValue
    }, { merge: true });

    alert('Code mis à jour avec succès!');
  } catch (error) {
    console.error('Erreur saveSingleCode:', error);
    alert('Erreur lors de la mise à jour du code');
  }
}

// Initialiser les champs de code
async function initCodeFields() {
  if (currentUser?.role !== 'president') return;

  try {
    const codes = await loadAccessCodes();
    document.getElementById('secret-access-code').value = codes.secretAccessCode || '';
    document.getElementById('treasurer-access-code').value = codes.treasurerAccessCode || '';
    document.getElementById('secretary-access-code').value = codes.secretaryAccessCode || '';
  } catch (error) {
    console.error('Erreur initCodeFields:', error);
  }
}

// Modifier la fonction checkSecretPassword
async function checkSecretPassword() {
  try {
    const password = document.querySelector('#secret-password')?.value.trim().toUpperCase();
    if (!password) {
      appendChatMessage('Assistant ANSAR', 'Veuillez entrer un code valide.');
      return;
    }

    // Charger les codes depuis Firestore
    const accessCodes = await loadAccessCodes();
    
    // Vérifier chaque code
    if (password === accessCodes.presidentAccessCode || password === 'PRESIDENT000') {
      currentUser = { role: 'president' };
      showPage('president');
      clearChatHistory();
    }
    else if (password === accessCodes.secretAccessCode || password === 'ADMIN12301012000') {
      currentUser = { role: 'admin' };
      showPage('secret');
      clearChatHistory();
    } 
    else if (password === accessCodes.treasurerAccessCode || password === 'JESUISTRESORIER444') {
      currentUser = { role: 'tresorier' };
      showPage('treasurer');
      clearChatHistory();
    }
    else if (password === accessCodes.secretaryAccessCode || password === 'SECRETAIRE000') {
      currentUser = { role: 'secretaire' };
      showPage('secretary');
      clearChatHistory();
    }
    else {
      appendChatMessage('Assistant ANSAR', 'Code incorrect. Accès refusé.');
    }
  } catch (error) {
    console.error('Erreur checkSecretPassword:', error);
    appendChatMessage('Assistant ANSAR', 'Erreur système. Réessayez plus tard.');
  }
}

async function initializeDefaultCodes() {
  try {
    await db.collection('securitySettings').doc('accessCodes').set({
      secretAccessCode: 'ADMIN12301012000',  // Pour l'espace admin
      treasurerAccessCode: 'JESUISTRESORIER444', // Pour l'espace trésorier
      secretaryAccessCode: 'SECRETAIRE000',  // Pour l'espace secrétaire
      presidentAccessCode: 'PRESIDENT000'    // Pour l'espace président
    });
    console.log("Codes d'accès initialisés avec succès");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des codes:", error);
  }
}


// À exécuter une seule fois dans la console :
// initializeDefaultCodes();

// À exécuter une seule fois dans la console :
// initializeDefaultCodes();
// Appeler cette fonction une seule fois depuis la console :
// initializeDefaultCodes();

async function updateCode(codeType) {
  try {
    const inputId = `${codeType.replace('AccessCode', '-code-input')}`;
    const newCode = document.getElementById(inputId).value.trim();
    
    if (!newCode || newCode.length < 6) {
      alert('Le code doit contenir au moins 6 caractères');
      return;
    }

    await db.collection('securitySettings').doc('accessCodes').set({
      [codeType]: newCode
    }, { merge: true });

    alert('Code mis à jour avec succès!');
    
    // Recharger les codes
    const codes = await loadAccessCodes();
    document.getElementById('president-code-input').value = codes.presidentAccessCode || '';
    document.getElementById('admin-code-input').value = codes.secretAccessCode || '';
    document.getElementById('treasurer-code-input').value = codes.treasurerAccessCode || '';
    document.getElementById('secretary-code-input').value = codes.secretaryAccessCode || '';
  } catch (error) {
    console.error('Erreur updateCode:', error);
    alert('Erreur lors de la mise à jour du code');
  }
}


async function importMembersBulk() {
  const rawData = document.getElementById('mass-members-data').value;
  if (!rawData.trim()) {
    alert('Veuillez entrer des données à importer');
    return;
  }

  const lines = rawData.split('\n')
                      .filter(line => line.trim() !== '' && !line.startsWith('Prénom')); // Ignore l'en-tête
  const progress = document.getElementById('import-progress');
  progress.innerHTML = `Préparation: ${lines.length} membres à importer...`;

  // Désactiver le bouton pendant l'import
  const importBtn = document.querySelector('#mass-import .cta-button');
  importBtn.disabled = true;
  importBtn.textContent = 'Import en cours...';

  try {
    let imported = 0;
    let errors = 0;

    for (const [index, line] of lines.entries()) {
      const parts = line.split('|').map(part => part.trim());
      
      // Mise à jour de la progression
      progress.innerHTML = `Traitement ${index+1}/${lines.length} | Importés: ${imported} | Erreurs: ${errors}<br>`;
      progress.innerHTML += `En cours: ${parts[0] || ''} ${parts[1] || ''}`;

      if (parts.length < 6) { // Au moins Prénom, Nom, Âge, Email, Téléphone, Rôle
        errors++;
        progress.innerHTML += `<br>→ Erreur: format incorrect (${parts.length} champs)`;
        continue;
      }

      try {
        const memberCode = await generateMemberCode();
        
        const memberData = {
          code: memberCode,
          firstname: parts[0],
          lastname: parts[1],
          age: parts[2] ? parseInt(parts[2]) : null,
          email: parts[3] || null,
          phone: parts[4] || null,
          role: parts[5] || 'membre',
          status: parts[6] || 'actif',
          address: parts[7] || null,
          activity: parts[8] || null,
          residence: parts[9] || null,
          birthplace: parts[10] || null,
          dob: parts[11] || null,
          contributions: initializeContributions(),
          createdAt: new Date().toISOString()
        };

        await saveData('members', memberData);
        imported++;
      } catch (error) {
        errors++;
        progress.innerHTML += `<br>→ Erreur: ${error.message}`;
      }
      
      // Pause pour éviter de surcharger
      if (index % 10 === 0) await new Promise(resolve => setTimeout(resolve, 500));
    }

    progress.innerHTML += `<br><br><strong>Import terminé!</strong><br>
                          Membres importés: ${imported}<br>
                          Erreurs: ${errors}`;
    
    // Mettre à jour les listes
    updateMembersList();
    updateEditMembersList();
  } catch (error) {
    progress.innerHTML += `<br><strong>ERREUR GLOBALE:</strong> ${error.message}`;
  } finally {
    importBtn.disabled = false;
    importBtn.textContent = 'Importer';
  }
}
