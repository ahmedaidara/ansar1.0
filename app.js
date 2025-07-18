```javascript
// Firebase Initialization
const firebaseConfig = {
  apiKey: "AIzaSyB7-fXR59CqNMyYgZTDAdBNpMTE_GkcOlA",
  authDomain: "ansar-93d9e.firebaseapp.com",
  projectId: "ansar-93d9e",
  storageBucket: "ansar-93d9e.firebasestorage.app",
  messagingSenderId: "697623655771",
  appId: "1:697623655771:web:2487489b5825ab211f567e",
  measurementId: "G-N3LBBHM2N0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

// Global Variables
let currentUser = null;
let currentSecretZone = null;
const secretCodes = {
  admin: ["ADMIN12301012000", "00000000", "11111111", "22222222"],
  member: ["JESUISMEMBRE66", "33333333", "44444444", "55555555"],
  tresorier: ["JESUISTRESORIER444", "66666666", "77777777", "88888888"],
  president: ["PRESIDENT000", "99999999", "11112222", "33334444"],
  secretaire: ["SECRETAIRE000", "55556666", "77778888", "99990000"]
};

// Navigation
document.querySelectorAll('nav button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelector(`#${button.dataset.page}`).classList.add('active');
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

// Theme Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Language Selection
document.getElementById('lang-select').addEventListener('change', (e) => {
  // Implement language change (placeholder for now)
  console.log(`Langue changée : ${e.target.value}`);
});

// Load Theme
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

// Help Chat
const helpChat = document.getElementById('help-chat');
const helpBtn = document.getElementById('help-btn');
const chatInput = document.getElementById('help-input');
const sendHelpBtn = document.getElementById('send-help-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');
const chatMessages = document.getElementById('chat-messages');
const secretCodeInput = document.getElementById('secret-code-input');
const submitSecretCode = document.getElementById('submit-secret-code');

helpBtn.addEventListener('click', () => {
  helpChat.style.display = helpChat.style.display === 'none' ? 'flex' : 'none';
});

document.addEventListener('click', (e) => {
  if (!helpChat.contains(e.target) && e.target !== helpBtn) {
    helpChat.style.display = 'none';
  }
});

clearChatBtn.addEventListener('click', () => {
  chatMessages.innerHTML = '';
});

sendHelpBtn.addEventListener('click', handleChatInput);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleChatInput();
});

function handleChatInput() {
  const message = chatInput.value.trim();
  if (!message) return;
  chatMessages.innerHTML += `<p>Vous: ${message}</p>`;
  if (secretCodes.admin.includes(message)) {
    secretCodeInput.style.display = 'block';
    setTimeout(() => secretCodeInput.style.display = 'none', 30000);
  } else {
    chatMessages.innerHTML += `<p>Aide: Tapez un mot-clé ou un code d'accès.</p>`;
  }
  chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

submitSecretCode.addEventListener('click', () => {
  const code = document.getElementById('secret-code').value;
  if (secretCodes.member.includes(code)) {
    currentSecretZone = 'admin';
    showSecretSection('espace-secret');
  } else if (secretCodes.tresorier.includes(code)) {
    currentSecretZone = 'tresorier';
    showSecretSection('espace-tresorier');
  } else if (secretCodes.president.includes(code)) {
    currentSecretZone = 'president';
    showSecretSection('espace-president');
  } else if (secretCodes.secretaire.includes(code)) {
    currentSecretZone = 'secretaire';
    showSecretSection('espace-secretaire');
  }
  helpChat.style.display = 'none';
});

function showSecretSection(sectionId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

// Espace Personnel
document.getElementById('login-btn').addEventListener('click', async () => {
  const numero = document.getElementById('login-numero').value;
  const password = document.getElementById('login-password').value;
  const doc = await db.collection('membres').doc(numero).get();
  if (doc.exists && doc.data().password === password) {
    currentUser = doc.data();
    currentUser.numero = numero;
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('espace-content').style.display = 'block';
    document.getElementById('espace-title').textContent = `${currentUser.prenom} ${currentUser.nom}`;
    displayMemberInfo();
    loadCotisations();
  } else {
    alert('Numéro ou mot de passe incorrect.');
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('espace-content').style.display = 'none';
});

async function displayMemberInfo() {
  const info = document.getElementById('espace-info');
  info.innerHTML = `
    <p><strong>Prénom :</strong> ${currentUser.prenom}</p>
    <p><strong>Nom :</strong> ${currentUser.nom}</p>
    <p><strong>Numéro :</strong> ${currentUser.numero}</p>
    <p><strong>Âge :</strong> ${currentUser.age || '-'}</p>
    <p><strong>Date de naissance :</strong> ${currentUser.dateNaissance || '-'}</p>
    <p><strong>Lieu de naissance :</strong> ${currentUser.lieuNaissance || '-'}</p>
    <p><strong>Email :</strong> ${currentUser.email || '-'}</p>
    <p><strong>Activité actuelle :</strong> ${currentUser.activite || '-'}</p>
    <p><strong>Adresse :</strong> ${currentUser.adresse || '-'}</p>
    <p><strong>Numéro de téléphone :</strong> ${currentUser.telephone || '-'}</p>
    <p><strong>Résidence actuelle :</strong> ${currentUser.residence || '-'}</p>
    <p><strong>Rôle :</strong> ${currentUser.role || '-'}</p>
  `;
}

async function loadCotisations() {
  const cotisationsContent = document.getElementById('cotisations-content');
  cotisationsContent.innerHTML = '';
  const years = ['2023', '2024', '2025'];
  for (const year of years) {
    const doc = await db.collection('cotisations').doc(`${currentUser.numero}_${year}`).get();
    const data = doc.exists ? doc.data() : { months: {} };
    let status = `<h4>${year}</h4><p>Payé : `;
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    let paid = [], unpaid = [];
    months.forEach((month, i) => {
      if (data.months[i + 1]) paid.push(month);
      else unpaid.push(month);
    });
    status += paid.join(', ') || 'Aucun';
    status += `<br>Non payé : ${unpaid.join(', ') || 'Aucun'}</p>`;
    cotisationsContent.innerHTML += status;
  }
  // Autres cotisations
  const autresDocs = await db.collection('cotisations_autres').where('membre', '==', currentUser.numero).get();
  autresDocs.forEach(doc => {
    const data = doc.data();
    cotisationsContent.innerHTML += `
      <p><strong>${data.nom}</strong>: ${data.montantPaye >= data.montant ? 'Payé' : `Payé ${data.montantPaye} FCFA, reste ${data.montant - data.montantPaye} FCFA`}</p>
    `;
  });
}

document.getElementById('suggestion-btn').addEventListener('click', async () => {
  const suggestion = document.getElementById('suggestion-text').value;
  if (suggestion) {
    await db.collection('suggestions').add({
      membre: currentUser.numero,
      texte: suggestion,
      date: new Date()
    });
    alert('Suggestion envoyée.');
    document.getElementById('suggestion-text').value = '';
  }
});

// Membres List
async function loadMembres() {
  const membresList = document.getElementById('membres-list');
  membresList.innerHTML = '';
  const docs = await db.collection('membres').get();
  docs.forEach(doc => {
    const data = doc.data();
    membresList.innerHTML += `<li>${data.prenom} ${data.nom} (${doc.id})</li>`;
  });
}

// Événements
async function loadEvenements() {
  const evenementsList = document.getElementById('evenements-list');
  evenementsList.innerHTML = '';
  const docs = await db.collection('evenements').orderBy('date', 'desc').get();
  docs.forEach(doc => {
    const data = doc.data();
    evenementsList.innerHTML += `
      <li>
        <h3>${data.nom}</h3>
        <p>${data.description}</p>
        <p>Date: ${new Date(data.date).toLocaleString()}</p>
        ${data.affiche ? `<img src="${data.affiche}" alt="Affiche">` : ''}
      </li>
    `;
  });
  updateCountdown();
}

// Compte à rebours
async function updateCountdown() {
  const countdownDiv = document.getElementById('event-countdown');
  const docs = await db.collection('evenements').where('date', '>', new Date().toISOString()).get();
  countdownDiv.innerHTML = '';
  docs.forEach(doc => {
    const data = doc.data();
    const eventDate = new Date(data.date);
    const interval = setInterval(() => {
      const now = new Date();
      const diff = eventDate - now;
      if (diff <= 0) {
        countdownDiv.innerHTML = `<p>${data.nom}: EN COURS</p>`;
        setTimeout(() => countdownDiv.innerHTML = '', 30 * 60 * 1000);
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        countdownDiv.innerHTML += `<p>${data.nom}: JOUR J - ${days}J ${hours}H ${minutes}MN ${seconds}S</p>`;
      }
    }, 1000);
  });
}

// Galerie
async function loadGalerie() {
  const galerieContent = document.getElementById('galerie-content');
  galerieContent.innerHTML = '';
  const docs = await db.collection('galerie').get();
  docs.forEach(doc => {
    const data = doc.data();
    galerieContent.innerHTML += data.type === 'image' ? 
      `<img src="${data.url}" alt="Galerie">` : 
      `<video controls><source src="${data.url}" type="video/mp4"></video>`;
  });
}

// Coran
function loadCoran() {
  const juzList = document.getElementById('juz-list');
  for (let i = 1; i <= 30; i++) {
    juzList.innerHTML += `<li>Juz' ${i} (Arabe)</li>`;
  }
}

// Bibliothèque
async function loadBibliotheque() {
  const bibliothequeContent = document.getElementById('bibliotheque-content');
  bibliothequeContent.innerHTML = '';
  const docs = await db.collection('bibliotheque').get();
  docs.forEach(doc => {
    const data = doc.data();
    bibliothequeContent.innerHTML += `<div>${data.titre} (${data.categorie})</div>`;
  });
}

// Notifications
async function loadNotifications() {
  const notificationsDiv = document.getElementById('notifications');
  notificationsDiv.innerHTML = '';
  const docs = await db.collection('messages').orderBy('date', 'desc').get();
  docs.forEach(doc => {
    const data = doc.data();
    notificationsDiv.innerHTML += `
      <div class="notification">
        <h3>${data.titre}</h3>
        <p>${data.contenu}</p>
        <button onclick="this.parentElement.remove()">Fermer</button>
      </div>
    `;
    // Notification push
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(data.titre, { body: data.contenu });
    }
  });
}

// Espace Secret
document.getElementById('add-membre-btn').addEventListener('click', () => {
  document.getElementById('secret-subsection').innerHTML = `
    <h3>Ajouter un membre</h3>
    <input type="text" id="membre-prenom" placeholder="Prénom (obligatoire)">
    <input type="text" id="membre-nom" placeholder="Nom (obligatoire)">
    <input type="text" id="membre-age" placeholder="Âge">
    <input type="text" id="membre-dateNaissance" placeholder="Date de naissance">
    <input type="text" id="membre-lieuNaissance" placeholder="Lieu de naissance">
    <input type="file" id="membre-photo" accept="image/*">
    <input type="email" id="membre-email" placeholder="Email">
    <input type="text" id="membre-activite" placeholder="Activité actuelle">
    <input type="text" id="membre-adresse" placeholder="Adresse">
    <input type="text" id="membre-telephone" placeholder="Numéro de téléphone">
    <input type="text" id="membre-residence" placeholder="Résidence actuelle">
    <input type="text" id="membre-role" placeholder="Rôle">
    <input type="text" id="membre-password" placeholder="Mot de passe (ex. 10012005)">
    <button id="submit-membre">Ajouter</button>
  `;
  document.getElementById('submit-membre').addEventListener('click', async () => {
    const prenom = document.getElementById('membre-prenom').value;
    const nom = document.getElementById('membre-nom').value;
    if (!prenom || !nom) {
      alert('Prénom et nom sont obligatoires.');
      return;
    }
    const membreData = {
      prenom,
      nom,
      age: document.getElementById('membre-age').value || null,
      dateNaissance: document.getElementById('membre-dateNaissance').value || null,
      lieuNaissance: document.getElementById('membre-lieuNaissance').value || null,
      email: document.getElementById('membre-email').value || null,
      activite: document.getElementById('membre-activite').value || null,
      adresse: document.getElementById('membre-adresse').value || null,
      telephone: document.getElementById('membre-telephone').value || null,
      residence: document.getElementById('membre-residence').value || null,
      role: document.getElementById('membre-role').value || null,
      password: document.getElementById('membre-password').value || null
    };
    const photo = document.getElementById('membre-photo').files[0];
    const numero = `MEMBRE${(await db.collection('membres').get()).size + 1}`.padStart(8, '0');
    if (photo) {
      const ref = storage.ref(`membres/${numero}`);
      await ref.put(photo);
      membreData.photo = await ref.getDownloadURL();
    }
    await db.collection('membres').doc(numero).set(membreData);
    alert('Membre ajouté.');
    document.getElementById('secret-subsection').innerHTML = '';
    loadMembres();
  });
});

document.getElementById('edit-membre-btn').addEventListener('click', async () => {
  const subsection = document.getElementById('secret-subsection');
  subsection.innerHTML = '<input type="text" id="search-edit-membre" placeholder="Rechercher un membre...">';
  const membresList = document.createElement('ul');
  subsection.appendChild(membresList);
  const docs = await db.collection('membres').get();
  docs.forEach(doc => {
    const data = doc.data();
    membresList.innerHTML += `<li onclick="editMembre('${doc.id}')">${data.prenom} ${data.nom} (${doc.id})</li>`;
  });
});

window.editMembre = async (numero) => {
  const doc = await db.collection('membres').doc(numero).get();
  const data = doc.data();
  document.getElementById('secret-subsection').innerHTML = `
    <h3>Modifier ${data.prenom} ${data.nom}</h3>
    <input type="text" id="membre-prenom" value="${data.prenom}">
    <input type="text" id="membre-nom" value="${data.nom}">
    <input type="text" id="membre-age" value="${data.age || ''}">
    <input type="text" id="membre-dateNaissance" value="${data.dateNaissance || ''}">
    <input type="text" id="membre-lieuNaissance" value="${data.lieuNaissance || ''}">
    <input type="file" id="membre-photo" accept="image/*">
    <input type="email" id="membre-email" value="${data.email || ''}">
    <input type="text" id="membre-activite" value="${data.activite || ''}">
    <input type="text" id="membre-adresse" value="${data.adresse || ''}">
    <input type="text" id="membre-telephone" value="${data.telephone || ''}">
    <input type="text" id="membre-residence" value="${data.residence || ''}">
    <input type="text" id="membre-role" value="${data.role || ''}">
    <input type="text" id="membre-password" value="${data.password || ''}">
    <button id="update-membre">Mettre à jour</button>
    <button id="delete-membre">Supprimer</button>
  `;
  document.getElementById('update-membre').addEventListener('click', async () => {
    const membreData = {
      prenom: document.getElementById('membre-prenom').value,
      nom: document.getElementById('membre-nom').value,
      age: document.getElementById('membre-age').value || null,
      dateNaissance: document.getElementById('membre-dateNaissance').value || null,
      lieuNaissance: document.getElementById('membre-lieuNaissance').value || null,
      email: document.getElementById('membre-email').value || null,
      activite: document.getElementById('membre-activite').value || null,
      adresse: document.getElementById('membre-adresse').value || null,
      telephone: document.getElementById('membre-telephone').value || null,
      residence: document.getElementById('membre-residence').value || null,
      role: document.getElementById('membre-role').value || null,
      password: document.getElementById('membre-password').value || null
    };
    const photo = document.getElementById('membre-photo').files[0];
    if (photo) {
      const ref = storage.ref(`membres/${numero}`);
      await ref.put(photo);
      membreData.photo = await ref.getDownloadURL();
    }
    await db.collection('membres').doc(numero).update(membreData);
    alert('Membre mis à jour.');
    document.getElementById('secret-subsection').innerHTML = '';
    loadMembres();
  });
  document.getElementById('delete-membre').addEventListener('click', async () => {
    const code = prompt('Entrez le code présidentiel (0000) :');
    if (code === '0000') {
      await db.collection('membres').doc(numero).delete();
      alert('Membre supprimé.');
      document.getElementById('secret-subsection').innerHTML = '';
      loadMembres();
    } else {
      alert('Code incorrect.');
    }
  });
};

document.getElementById('galerie-btn').addEventListener('click', () => {
  document.getElementById('secret-subsection').innerHTML = `
    <h3>Galerie</h3>
    <input type="file" id="galerie-media" accept="image/*,video/*">
    <button id="add-media">Ajouter</button>
    <div id="galerie-list"></div>
  `;
  loadGalerieAdmin();
  document.getElementById('add-media').addEventListener('click', async () => {
    const file = document.getElementById('galerie-media').files[0];
    if (file) {
      const ref = storage.ref(`galerie/${Date.now()}_${file.name}`);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      await db.collection('galerie').add({
        url,
        type: file.type.startsWith('image') ? 'image' : 'video',
        date: new Date()
      });
      loadGalerie();
      loadGalerieAdmin();
    }
  });
});

async function loadGalerieAdmin() {
  const galerieList = document.getElementById('galerie-list');
  galerieList.innerHTML = '';
  const docs = await db.collection('galerie').get();
  docs.forEach(doc => {
    const data = doc.data();
    galerieList.innerHTML += `
      <div>
        ${data.type === 'image' ? `<img src="${data.url}" alt="Media">` : `<video controls><source src="${data.url}" type="video/mp4"></video>`}
        <button onclick="deleteMedia('${doc.id}')">Supprimer</button>
      </div>
    `;
  });
}

window.deleteMedia = async (id) => {
  await db.collection('galerie').doc(id).delete();
  loadGalerie();
  loadGalerieAdmin();
};

document.getElementById('evenements-btn').addEventListener('click', () => {
  document.getElementById('secret-subsection').innerHTML = `
    <h3>Ajouter un événement</h3>
    <input type="text" id="event-nom" placeholder="Nom">
    <input type="text" id="event-description" placeholder="Description">
    <input type="datetime-local" id="event-date">
    <input type="file" id="event-affiche" accept="image/*">
    <button id="add-event">Ajouter</button>
    <div id="events-list"></div>
  `;
  loadEvenementsAdmin();
  document.getElementById('add-event').addEventListener('click', async () => {
    const nom = document.getElementById('event-nom').value;
    const description = document.getElementById('event-description').value;
    const date = document.getElementById('event-date').value;
    const affiche = document.getElementById('event-affiche').files[0];
    if (nom && date) {
      const eventData = { nom, description, date };
      if (affiche) {
        const ref = storage.ref(`evenements/${Date.now()}_${affiche.name}`);
        await ref.put(affiche);
        eventData.affiche = await ref.getDownloadURL();
      }
      await db.collection('evenements').add(eventData);
      document.getElementById('secret-subsection').innerHTML = '';
      loadEvenements();
    }
  });
});

async function loadEvenementsAdmin() {
  const eventsList = document.getElementById('events-list');
  eventsList.innerHTML = '';
  const docs = await db.collection('evenements').get();
  docs.forEach(doc => {
    const data = doc.data();
    eventsList.innerHTML += `
      <div>
        <h3>${data.nom}</h3>
        <p>${data.description}</p>
        <button onclick="deleteEvent('${doc.id}')">Supprimer</button>
      </div>
    `;
  });
}

window.deleteEvent = async (id) => {
  await db.collection('evenements').doc(id).delete();
  loadEvenements();
  loadEvenementsAdmin();
};

document.getElementById('messages-btn').addEventListener('click', () => {
  document.getElementById('secret-subsection').innerHTML = `
    <h3>Ajouter un message</h3>
    <input type="text" id="message-titre" placeholder="Titre">
    <textarea id="message-contenu" placeholder="Contenu"></textarea>
    <button id="add-message">Ajouter</button>
    <div id="messages-list"></div>
  `;
  loadMessagesAdmin();
  document.getElementById('add-message').addEventListener('click', async () => {
    const titre = document.getElementById('message-titre').value;
    const contenu = document.getElementById('message-contenu').value;
    if (titre && contenu) {
      await db.collection('messages').add({
        titre,
        contenu,
        date: new Date()
      });
      document.getElementById('secret-subsection').innerHTML = '';
      loadNotifications();
    }
  });
});

async function loadMessagesAdmin() {
  const messagesList = document.getElementById('messages-list');
  messagesList.innerHTML = '';
  const docs = await db.collection('messages').orderBy('date', 'desc').get();
  docs.forEach(doc => {
    const data = doc.data();
    messagesList.innerHTML += `
      <div>
        <h3>${data.titre}</h3>
        <p>${data.contenu}</p>
        <button onclick="deleteMessage('${doc.id}')">Supprimer</button>
      </div>
    `;
  });
}

window.deleteMessage = async (id) => {
  await db.collection('messages').doc(id).delete();
  loadNotifications();
  loadMessagesAdmin();
};

document.getElementById('notes-btn').addEventListener('click', () => {
  document.getElementById('secret-subsection').innerHTML = `
    <h3>Ajouter une note</h3>
    <input type="text" id="note-titre" placeholder="Titre">
    <textarea id="note-contenu" placeholder="Contenu"></textarea>
    <input type="text" id="note-categorie" placeholder="Catégorie">
    <button id="add-note">Ajouter</button>
    <div id="notes-list"></div>
  `;
  loadNotes();
  document.getElementById('add-note').addEventListener('click', async () => {
    const titre = document.getElementById('note-titre').value;
    const contenu = document.getElementById('note-contenu').value;
    const categorie = document.getElementById('note-categorie').value;
    if (titre && contenu) {
      await db.collection('notes').add({
        titre,
        contenu,
        categorie,
        date: new Date()
      });
      loadNotes();
    }
  });
});

async function loadNotes() {
  const notesList = document.getElementById('notes-list');
  notesList.innerHTML = '';
  const docs = await db.collection('notes').get();
  docs.forEach(doc => {
    const data = doc.data();
    notesList.innerHTML += `
      <div>
        <h3>${data.titre} (${data.categorie})</h3>
        <p>${data.contenu}</p>
        <button onclick="deleteNote('${doc.id}')">Supprimer</button>
      </div>
    `;
  });
}

window.deleteNote = async (id) => {
  await db.collection('notes').doc(id).delete();
  loadNotes();
};

document.getElementById('documents-btn').addEventListener('click', () => {
  document.getElementById('secret-subsection').innerHTML = `
    <h3>Ajouter un document</h3>
    <input type="text" id="doc-titre" placeholder="Titre">
    <input type="text" id="doc-categorie" placeholder="Catégorie">
    <input type="file" id="doc-file" accept=".pdf,.doc,.docx">
    <button id="add-doc">Ajouter</button>
    <div id="docs-list"></div>
  `;
  loadDocuments();
  document.getElementById('add-doc').addEventListener('click', async () => {
    const titre = document.getElementById('doc-titre').value;
    const categorie = document.getElementById('doc-categorie').value;
    const file = document.getElementById('doc-file').files[0];
    if (titre && file) {
      const ref = storage.ref(`documents/${Date.now()}_${file.name}`);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      await db.collection('documents').add({
        titre,
        categorie,
        url,
        date: new Date()
      });
      loadDocuments();
    }
  });
});

async function loadDocuments() {
  const docsList = document.getElementById('docs-list');
  docsList.innerHTML = '';
  const docs = await db.collection('documents').get();
  docs.forEach(doc => {
    const data = doc.data();
    docsList.innerHTML += `
      <div>
        <a href="${data.url}" target="_blank">${data.titre} (${data.categorie})</a>
        <button onclick="deleteDocument('${doc.id}')">Supprimer</button>
      </div>
    `;
  });
}

window.deleteDocument = async (id) => {
  await db.collection('documents').doc(id).delete();
  loadDocuments();
};

document.getElementById('suggestions-btn').addEventListener('click', async () => {
  document.getElementById('secret-subsection').innerHTML = '<div id="suggestions-list"></div>';
  const suggestionsList = document.getElementById('suggestions-list');
  const docs = await db.collection('suggestions').orderBy('date', 'desc').get();
  docs.forEach(doc => {
    const data = doc.data();
    suggestionsList.innerHTML += `
      <div>
        <p>${data.membre}: ${data.texte}</p>
        <button onclick="deleteSuggestion('${doc.id}')">Supprimer</button>
      </div>
    `;
  });
});

window.deleteSuggestion = async (id) => {
  await db.collection('suggestions').doc(id).delete();
  document.getElementById('suggestions-btn').click();
};

// Statistiques
document.getElementById('stats-btn').addEventListener('click', async () => {
  const subsection = document.getElementById('secret-subsection');
  subsection.innerHTML = `
    <h3>Statistiques</h3>
    <canvas id="stats-chart-sommes"></canvas>
    <canvas id="stats-chart-membres"></canvas>
    <canvas id="stats-chart-cotisations"></canvas>
  `;
  const membresDocs = await db.collection('membres').get();
  const cotisationsDocs = await db.collection('cotisations').get();
  const cotisationsAutresDocs = await db.collection('cotisations_autres').get();
  let totalSommes = 0, actifs = 0, inactifs = 0, aJour = 0, enRetard = 0;
  membresDocs.forEach(doc => {
    const data = doc.data();
    if (data.actif) actifs++;
    else inactifs++;
  });
  cotisationsDocs.forEach(doc => {
    const data = doc.data();
    Object.values(data.months).forEach(paid => {
      if (paid) totalSommes += 2000;
    });
  });
  cotisationsAutresDocs.forEach(doc => {
    totalSommes += doc.data().montantPaye;
  });
  const currentYear = new Date().getFullYear();
  const cotisationsCurrentYear = await db.collection('cotisations').where('year', '==', currentYear.toString()).get();
  cotisationsCurrentYear.forEach(doc => {
    const data = doc.data();
    const allPaid = Object.values(data.months).every(paid => paid);
    if (allPaid) aJour++;
    else enRetard++;
  });

  new Chart(document.getElementById('stats-chart-sommes'), {
    type: 'bar',
    data: {
      labels: ['Sommes collectées'],
      datasets: [{
        label: 'Montant (FCFA)',
        data: [totalSommes],
        backgroundColor: '#778152'
      }]
    }
  });

  new Chart(document.getElementById('stats-chart-membres'), {
    type: 'pie',
    data: {
      labels: ['Actifs', 'Inactifs'],
      datasets: [{
        data: [actifs, inactifs],
        backgroundColor: ['#3a6241', '#9b9c28']
      }]
    }
  });

  new Chart(document.getElementById('stats-chart-cotisations'), {
    type: 'pie',
    data: {
      labels: ['À jour', 'En retard'],
      datasets: [{
        data: [aJour, enRetard],
        backgroundColor: ['#3a6241', '#9b9c28']
      }]
    }
  });
});

// Appels
document.getElementById('calls-btn').addEventListener('click', async () => {
  document.getElementById('secret-subsection').innerHTML = `
    <h3>Appels</h3>
    <input type="text" id="search-calls" placeholder="Rechercher un membre...">
    <label><input type="checkbox" id="call-all">Cocher tout</input></label>
    <div id="membres-call-list"></div>
    <button id="call-audio">Appel Audio</button>
    <button id="call-video">Appel Vidéo</button>
  `;
  const membresCallList = document.getElementById('membres-call-list');
  const docs = await db.collection('membres').get();
  docs.forEach(doc => {
    membresCallList.innerHTML += `
      <label><input type="checkbox" class="call-checkbox" value="${doc.id}">${doc.data().prenom} ${doc.data().nom} (${doc.id})</label>
    `;
  });
  document.getElementById('call-all').addEventListener('change', (e) => {
    document.querySelectorAll('.call-checkbox').forEach(cb => cb.checked = e.target.checked);
  });
  document.getElementById('call-audio').addEventListener('click', () => startCall(false));
  document.getElementById('call-video').addEventListener('click', () => startCall(true));
});

function startCall(video) {
  const selected = Array.from(document.querySelectorAll('.call-checkbox:checked')).map(cb => cb.value);
  if (selected.length) {
    const room = `ansar-${Date.now()}`;
    const embed = document.createElement('whereby-embed');
    embed.setAttribute('room', `https://ansar.whereby.com/${room}`);
    embed.setAttribute('audio', 'true');
    embed.setAttribute('video', video.toString());
    document.getElementById('secret-subsection').appendChild(embed);
  }
}

// Messages automatisés
document.getElementById('auto-messages-btn').addEventListener('click', () => {
  document.getElementById('secret-subsection').innerHTML = `
    <h3>Messages automatisés</h3>
    <input type="text" id="auto-message-nom" placeholder="Nom">
    <textarea id="auto-message-contenu" placeholder="Contenu"></textarea>
    <input type="datetime-local" id="auto-message-date">
    <button id="add-auto-message">Ajouter</button>
    <div id="auto-messages-list"></div>
  `;
  loadAutoMessages();
  document.getElementById('add-auto-message').addEventListener('click', async () => {
    const nom = document.getElementById('auto-message-nom').value;
    const contenu = document.getElementById('auto-message-contenu').value;
    const date = document.getElementById('auto-message-date').value;
    if (nom && contenu && date) {
      await db.collection('auto_messages').add({
        nom,
        contenu,
        date,
        sent: false
      });
      loadAutoMessages();
    }
  });
});

async function loadAutoMessages() {
  const autoMessagesList = document.getElementById('auto-messages-list');
  autoMessagesList.innerHTML = '';
  const docs = await db.collection('auto_messages').get();
  docs.forEach(doc => {
    const data = doc.data();
    autoMessagesList.innerHTML += `
      <div>
        <h3>${data.nom}</h3>
        <p>${data.contenu}</p>
        <p>Date: ${new Date(data.date).toLocaleString()}</p>
        <button onclick="deleteAutoMessage('${doc.id}')">Supprimer</button>
      </div>
    `;
  });
}

window.deleteAutoMessage = async (id) => {
  await db.collection('auto_messages').doc(id).delete();
  loadAutoMessages();
};

// Trésorier
document.getElementById('add-cotisation-btn').addEventListener('click', () => {
  document.getElementById('tresorier-subsection').innerHTML = `
    <h3>Ajouter une cotisation</h3>
    <input type="text" id="cotisation-nom" placeholder="Nom (ex. Conférence)">
    <input type="number" id="cotisation-montant" placeholder="Montant (FCFA)">
    <button id="submit-cotisation">Ajouter</button>
  `;
  document.getElementById('submit-cotisation').addEventListener('click', async () => {
    const nom = document.getElementById('cotisation-nom').value;
    const montant = parseInt(document.getElementById('cotisation-montant').value);
    if (nom && montant) {
      const membresDocs = await db.collection('membres').get();
      membresDocs.forEach(async (doc) => {
        await db.collection('cotisations_autres').add({
          membre: doc.id,
          nom,
          montant,
          montantPaye: 0
        });
      });
      alert('Cotisation ajoutée.');
      document.getElementById('tresorier-subsection').innerHTML = '';
    }
  });
});

document.getElementById('manage-cotisations-btn').addEventListener('click', async () => {
  document.getElementById('tresorier-subsection').innerHTML = `
    <h3>Gérer les cotisations</h3>
    <input type="text" id="search-cotisations" placeholder="Rechercher un membre...">
    <div id="cotisations-list"></div>
  `;
  const cotisationsList = document.getElementById('cotisations-list');
  const membresDocs = await db.collection('membres').get();
  cotisationsList.innerHTML = '';
  membresDocs.forEach(async (doc) => {
    const membre = doc.data();
    cotisationsList.innerHTML += `
      <div>
        <h4>${membre.prenom} ${membre.nom} (${doc.id})</h4>
        <h5>Cotisations mensuelles</h5>
        <div id="mensuelles-${doc.id}"></div>
        <h5>Autres cotisations</h5>
        <div id="autres-${doc.id}"></div>
      </div>
    `;
    const years = ['2023', '2024', '2025'];
    for (const year of years) {
      const cotDoc = await db.collection('cotisations').doc(`${doc.id}_${year}`).get();
      const data = cotDoc.exists ? cotDoc.data() : { months: {} };
      const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      let html = `<h6>${year}</h6>`;
      months.forEach((month, i) => {
        html += `
          <label><input type="checkbox" class="cotisation-month" data-membre="${doc.id}" data-year="${year}" data-month="${i + 1}" ${data.months[i + 1] ? 'checked' : ''}>${month}</label>
        `;
      });
      document.getElementById(`mensuelles-${doc.id}`).innerHTML += html;
    }
    const autresDocs = await db.collection('cotisations_autres').where('membre', '==', doc.id).get();
    autresDocs.forEach(adoc => {
      const data = adoc.data();
      document.getElementById(`autres-${doc.id}`).innerHTML += `
        <p>${data.nom}: <input type="number" class="cotisation-autre" data-id="${adoc.id}" value="${data.montantPaye}"> FCFA (Total: ${data.montant} FCFA)</p>
      `;
    });
  });
  document.querySelectorAll('.cotisation-month').forEach(cb => {
    cb.addEventListener('change', async (e) => {
      const { membre, year, month } = e.target.dataset;
      const cotDoc = db.collection('cotisations').doc(`${membre}_${year}`);
      const doc = await cotDoc.get();
      const months = doc.exists ? doc.data().months : {};
      months[month] = e.target.checked;
      await cotDoc.set({ months, year }, { merge: true });
      if (currentUser && currentUser.numero === membre) loadCotisations();
    });
  });
  document.querySelectorAll('.cotisation-autre').forEach(input => {
    input.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const montantPaye = parseInt(e.target.value);
      await db.collection('cotisations_autres').doc(id).update({ montantPaye });
      if (currentUser) loadCotisations();
    });
  });
});

// Président
document.getElementById('president-access-btn').addEventListener('click', () => {
  const password = document.getElementById('president-password').value;
  if (password === '0000') {
    document.getElementById('president-content').style.display = 'block';
    document.getElementById('president-password').style.display = 'none';
    document.getElementById('president-access-btn').style.display = 'none';
  } else {
    alert('Mot de passe incorrect.');
  }
});

document.getElementById('add-sensitive-doc-btn').addEventListener('click', () => {
  document.getElementById('president-subsection').innerHTML = `
    <h3>Ajouter un document sensible</h3>
    <input type="text" id="sensitive-doc-titre" placeholder="Titre">
    <input type="text" id="sensitive-doc-categorie" placeholder="Catégorie">
    <input type="file" id="sensitive-doc-file" accept=".pdf,.png,.doc,.docx">
    <button id="submit-sensitive-doc">Ajouter</button>
  `;
  document.getElementById('submit-sensitive-doc').addEventListener('click', async () => {
    const titre = document.getElementById('sensitive-doc-titre').value;
    const categorie = document.getElementById('sensitive-doc-categorie').value;
    const file = document.getElementById('sensitive-doc-file').files[0];
    if (titre && file) {
      const ref = storage.ref(`sensitive_docs/${Date.now()}_${file.name}`);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      await db.collection('sensitive_docs').add({
        titre,
        categorie,
        url,
        date: new Date()
      });
      document.getElementById('president-subsection').innerHTML = '';
    }
  });
});

document.getElementById('manage-sensitive-docs-btn').addEventListener('click', async () => {
  document.getElementById('president-subsection').innerHTML = '<div id="sensitive-docs-list"></div>';
  const docsList = document.getElementById('sensitive-docs-list');
  const docs = await db.collection('sensitive_docs').get();
  docs.forEach(doc => {
    const data = doc.data();
    docsList.innerHTML += `
      <div>
        <a href="${data.url}" target="_blank">${data.titre} (${data.categorie})</a>
        <button onclick="deleteSensitiveDoc('${doc.id}')">Supprimer</button>
      </div>
    `;
  });
});

window.deleteSensitiveDoc = async (id) => {
  await db.collection('sensitive_docs').doc(id).delete();
  document.getElementById('manage-sensitive-docs-btn').click();
};

// Secrétaire
document.getElementById('add-note-btn').addEventListener('click', () => {
  document.getElementById('secretaire-subsection').innerHTML = `
    <h3>Ajouter une note</h3>
    <input type="text" id="sec-note-titre" placeholder="Titre">
    <textarea id="sec-note-contenu" placeholder="Contenu"></textarea>
    <input type="text" id="sec-note-categorie" placeholder="Catégorie">
    <button id="submit-sec-note">Ajouter</button>
  `;
  document.getElementById('submit-sec-note').addEventListener('click', async () => {
    const titre = document.getElementById('sec-note-titre').value;
    const contenu = document.getElementById('sec-note-contenu').value;
    const categorie = document.getElementById('sec-note-categorie').value;
    if (titre && contenu) {
      await db.collection('secretaire_notes').add({
        titre,
        contenu,
        categorie,
        date: new Date()
      });
      document.getElementById('secretaire-subsection').innerHTML = '';
    }
  });
});

document.getElementById('add-doc-btn').addEventListener('click', () => {
  document.getElementById('secretaire-subsection').innerHTML = `
    <h3>Ajouter un document</h3>
    <input type="text" id="sec-doc-titre" placeholder="Titre">
    <input type="text" id="sec-doc-categorie" placeholder="Catégorie">
    <input type="file" id="sec-doc-file" accept=".pdf,.doc,.docx">
    <button id="submit-sec-doc">Ajouter</button>
  `;
  document.getElementById('submit-sec-doc').addEventListener('click', async () => {
    const titre = document.getElementById('sec-doc-titre').value;
    const categorie = document.getElementById('sec-doc-categorie').value;
    const file = document.getElementById('sec-doc-file').files[0];
    if (titre && file) {
      const ref = storage.ref(`secretaire_docs/${Date.now()}_${file.name}`);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      await db.collection('secretaire_docs').add({
        titre,
        categorie,
        url,
        date: new Date()
      });
      document.getElementById('secretaire-subsection').innerHTML = '';
    }
  });
});

document.getElementById('manage-notes-docs-btn').addEventListener('click', async () => {
  document.getElementById('secretaire-subsection').innerHTML = `
    <h3>Notes</h3><div id="sec-notes-list"></div>
    <h3>Documents</h3><div id="sec-docs-list"></div>
  `;
  const notesList = document.getElementById('sec-notes-list');
  const docsList = document.getElementById('sec-docs-list');
  const notesDocs = await db.collection('secretaire_notes').get();
  notesDocs.forEach(doc => {
    const data = doc.data();
    notesList.innerHTML += `
      <div>
        <h4>${data.titre} (${data.categorie})</h4>
        <p>${data.contenu}</p>
        <button onclick="deleteSecNote('${doc.id}')">Supprimer</button>
      </div>
    `;
  });
  const docsDocs = await db.collection('secretaire_docs').get();
  docsDocs.forEach(doc => {
    const data = doc.data();
    docsList.innerHTML += `
      <div>
        <a href="${data.url}" target="_blank">${data.titre} (${data.categorie})</a>
        <button onclick="deleteSecDoc('${doc.id}')">Supprimer</button>
      </div>
    `;
  });
});

window.deleteSecNote = async (id) => {
  await db.collection('secretaire_notes').doc(id).delete();
  document.getElementById('manage-notes-docs-btn').click();
};

window.deleteSecDoc = async (id) => {
  await db.collection('secretaire_docs').doc(id).delete();
  document.getElementById('manage-notes-docs-btn').click();
};

// Search Functionality
function addSearchListener(id, listId, collection) {
  document.getElementById(id).addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase();
    const list = document.getElementById(listId);
    list.innerHTML = '';
    const docs = await db.collection(collection).get();
    docs.forEach(doc => {
      const data = doc.data();
      if (collection === 'membres' && `${data.prenom} ${data.nom} ${doc.id}`.toLowerCase().includes(query)) {
        list.innerHTML += `<li>${data.prenom} ${data.nom} (${doc.id})</li>`;
      } else if (collection === 'evenements' && data.nom.toLowerCase().includes(query)) {
        list.innerHTML += `
          <li>
            <h3>${data.nom}</h3>
            <p>${data.description}</p>
            <p>Date: ${new Date(data.date).toLocaleString()}</p>
            ${data.affiche ? `<img src="${data.affiche}" alt="Affiche">` : ''}
          </li>
        `;
      } else if (collection === 'bibliotheque' && data.titre.toLowerCase().includes(query)) {
        list.innerHTML += `<div>${data.titre} (${data.categorie})</div>`;
      }
    });
  });
}

addSearchListener('search-membres', 'membres-list', 'membres');
addSearchListener('search-evenements', 'evenements-list', 'evenements');
addSearchListener('search-bibliotheque', 'bibliotheque-content', 'bibliotheque');

// Auto Messages Scheduler
setInterval(async () => {
  const now = new Date();
  const docs = await db.collection('auto_messages').where('sent', '==', false).get();
  docs.forEach(async doc => {
    const data = doc.data();
    if (new Date(data.date) <= now) {
      await db.collection('messages').add({
        titre: data.nom,
        contenu: data.contenu,
        date: new Date()
      });
      await db.collection('auto_messages').doc(doc.id).update({ sent: true });
      loadNotifications();
    }
  });
}, 60000);

// Initial Load
loadMembres();
loadEvenements();
loadGalerie();
loadCoran();
loadBibliotheque();
loadNotifications();

// Request Notification Permission
if ('Notification' in window) {
  Notification.requestPermission();
}
```
