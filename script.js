// === Firebase config (déjà insérée dans index.html) ===
// Initialisation automatique de l'app déjà faite

// === Références vers les bases de données ===
const db = firebase.firestore();
const auth = firebase.auth();

// === Vérification de la connexion utilisateur ===
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("userEmail").textContent = user.email;
    fetchMembers();
    fetchCotisations();
  } else {
    window.location.href = "login.html"; // Rediriger vers login
  }
});

// === Déconnexion ===
document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut();
});

// === Fonction : afficher membres dans le tableau ===
function fetchMembers() {
  const tableBody = document.getElementById("membersTableBody");
  tableBody.innerHTML = "";
  db.collection("membres").onSnapshot((snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.nom}</td>
        <td>${data.statut}</td>
        <td>${data.classement}</td>
      `;
      tableBody.appendChild(row);
    });
  });
}

// === Fonction : afficher cotisations dans le tableau et le graphe ===
function fetchCotisations() {
  const tableBody = document.getElementById("cotisationTableBody");
  const graph = document.getElementById("cotisationChart").getContext("2d");
  tableBody.innerHTML = "";

  db.collection("cotisations").orderBy("date", "desc").onSnapshot((snapshot) => {
    let graphLabels = [];
    let graphData = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement("tr");
      const montant = parseFloat(data.montant || 0);
      row.innerHTML = `
        <td>${data.nom}</td>
        <td>${montant.toFixed(2)} €</td>
        <td>${new Date(data.date.toDate()).toLocaleDateString()}</td>
      `;
      tableBody.appendChild(row);
      graphLabels.unshift(data.nom);
      graphData.unshift(montant);
    });

    new Chart(graph, {
      type: 'bar',
      data: {
        labels: graphLabels,
        datasets: [{
          label: 'Cotisations',
          data: graphData,
          backgroundColor: '#007bff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  });
}

// === Simulation de paiement ===
document.getElementById("payerBtn").addEventListener("click", () => {
  const nom = prompt("Votre nom complet ?");
  const montant = prompt("Montant à payer (€) ?");
  if (nom && montant) {
    db.collection("cotisations").add({
      nom: nom,
      montant: parseFloat(montant),
      date: firebase.firestore.Timestamp.now()
    }).then(() => {
      alert("Cotisation enregistrée !");
    });
  }
});

// === Ajouter un membre (admin uniquement, à sécuriser côté règles Firebase) ===
document.getElementById("ajouterMembreBtn").addEventListener("click", () => {
  const nom = prompt("Nom du membre ?");
  const statut = prompt("Statut (Actif, Inactif, Liste Noire) ?");
  const classement = prompt("Classement (ex : membre, admin...) ?");
  if (nom && statut && classement) {
    db.collection("membres").add({
      nom: nom,
      statut: statut,
      classement: classement
    }).then(() => {
      alert("Membre ajouté !");
    });
  }
});
