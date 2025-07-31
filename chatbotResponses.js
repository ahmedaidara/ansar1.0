<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ANSAR ALMOUYASSAR</title>
  <link rel="stylesheet" href="main.css">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Amiri&display=swap" rel="stylesheet">
 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="manifest" href="manifest.json">
  <link rel="icon" href="data:,">
  <!-- Scripts Firebase -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-storage-compat.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
  <script src="chatbotResponses.js"></script>
  <script src="main.js" defer></script>
  <script src="https://unpkg.com/@whereby.com/browser-sdk"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
<header>
  <nav class="top-nav">
    <img src="assets/images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
    <div class="header-icons">
      <span class="material-icons social-icon" onclick="showPage('social')">share</span>
     <i class="fas fa-share-alt settings-icon" onclick="showPage('settings')"></i>
    </div>
  </nav>
</header>
  <main>
    <!-- Page d'accueil -->
<!-- Page d'accueil -->
<!-- Page d'accueil -->
<!-- Page d'accueil -->
<section id="home" class="page active">
  <div class="top-nav-bar">
    <div class="title-container">
        <h1>ANSAR ALMOUYASSAR</h1>
        <p>Association des ressortissants de l'institut coranique Al Mouyassar</p>
    </div>
    <img src="assets/images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
</div>
  <div class="header" style="background-image: url('assets/images/photo1.png');">
    <div class="header-content">
      <img src="assets/images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
      <button class="settings" onclick="showPage('settings')"><i class="fas fa-cog"></i></button>
    </div>
    <div class="ad-banner">
      <div class="ad-text banner-text">
        <h2>ANSAR ALMOUYASSAR</h2>
        <p>Association des ressortissant de l'institut Al Mouyassar</p>
      </div>
    </div>
  </div>
  <div class="association-title">
    <span>ANSAR ALMOUYASSAR</span>
  </div>
  <div id="home-motivation"></div>
  <div class="image-card">
    <img src="assets/images/photo2.png" alt="Image">
  </div>
  <div id="event-countdowns"></div>
  <div class="grid">
    <div class="item" onclick="showPage('members')"><span class="item-text">Membres</span><i class="fas fa-users icon"></i></div>
    <div class="item" onclick="showPage('events')"><span class="item-text">Événements</span><i class="fas fa-calendar-alt icon"></i></div>
    <div class="item" onclick="showPage('coran')"><span class="item-text">Coran</span><i class="fas fa-book icon"></i></div>
    <div class="item" onclick="showPage('hadith')"><span class="item-text">Hadith</span><i class="fas fa-book icon"></i></div>
    <div class="item" onclick="showPage('library')"><span class="item-text">Bibliothèque</span><i class="fas fa-book-open icon"></i></div>
    <div class="item" onclick="showPage('projet')"><span class="item-text">Projet Ansar</span><i class="fas fa-rocket icon"></i></div>
  </div>
 
  <h3>AFFICHE</h3>
  <div id="home-gallery" class="gallery-grid"></div>
  
          <!-- Business Section -->
     
       
               <!-- Business Section -->
 
        <h2 class="text-3xl font-bold text-purple-700 mb-8 text-center">Nos Professionnels</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="business-cards">
            <!-- Les cartes seront générées dynamiquement -->
        </div>


<!-- Ajouter ce modal juste après la section business-section -->
<div id="business-modal" class="business-modal hidden-section">
    <div class="business-modal-content">
        <span class="close-modal" onclick="hideBusinessDetails()">&times;</span>
        <h3 id="modal-title" class="text-2xl font-bold text-gray-800 mb-4"></h3>
        <div id="modal-content" class="space-y-4">
            <!-- Les détails seront chargés ici -->
        </div>
        <button onclick="hideBusinessDetails()">Fermer</button>
    </div>
</div>
  
</section>
    
    <!-- Page des membres -->
    <section id="members" class="page">
      <div class="top-nav-bar">
    <div class="title-container">
        <h1>ANSAR ALMOUYASSAR</h1>
        <p>Association des ressortissants de l'institut coranique Al Mouyassar</p>
    </div>
    <img src="images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
</div>
      <h2>Liste des Membres</h2>
      <div id="members-list"></div>
    </section>
    
    
    <!-- Page des réseaux sociaux -->
<section id="social" class="page">
  <h2>Nos Réseaux Sociaux</h2>
  <div class="social-links">
    <a href="https://facebook.com/votrepage" target="_blank" class="social-link facebook">
      <i class="fab fa-facebook-f"></i>
      <span>Facebook</span>
    </a>
    <a href="https://twitter.com/votrecompte" target="_blank" class="social-link twitter">
      <i class="fab fa-twitter"></i>
      <span>Twitter</span>
    </a>
    <a href="https://instagram.com/votrecompte" target="_blank" class="social-link instagram">
      <i class="fab fa-instagram"></i>
      <span>Instagram</span>
    </a>
    <a href="https://wa.me/votrenumero" target="_blank" class="social-link whatsapp">
      <i class="fab fa-whatsapp"></i>
      <span>WhatsApp</span>
    </a>
    <a href="https://youtube.com/votrechaine" target="_blank" class="social-link youtube">
      <i class="fab fa-youtube"></i>
      <span>YouTube</span>
    </a>
  </div>
</section>

    <!-- Page des événements -->
<!-- Page des événements -->
<section id="events" class="page">
  <div class="top-nav-bar">
    <div class="title-container">
        <h1>ANSAR ALMOUYASSAR</h1>
        <p>Association des ressortissants de l'institut coranique Al Mouyassar</p>
    </div>
    <img src="images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
</div>
  <div class="association-title">Événements à venir</div>
  
  <div id="events-list"></div>
</section>

    <!-- Page Coran -->
<!-- Page Coran -->
<section id="coran" class="page">
    <div class="top-nav-bar">
    <div class="title-container">
        <h1>ANSAR ALMOUYASSAR</h1>
        <p>Association des ressortissants de l'institut coranique Al Mouyassar</p>
    </div>
    <img src="images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
</div>
  <iframe src="coran.html" 
          style="width:100%; height:100vh; border:none;"
          title="Mushaf Coranique">
  </iframe>
</section>

   <!-- Page hadith-->
<!-- Page Hadith -->
<!-- Page Hadith -->
<section id="hadith" class="page">
  <div class="top-nav-bar">
    <div class="title-container">
        <h1>ANSAR ALMOUYASSAR</h1>
        <p>Association des ressortissants de l'institut coranique Al Mouyassar</p>
    </div>
    <img src="images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
</div>
  <iframe src="hadith.html" 
          style="width:100%; height:100vh; border:none;"
          title="Recueil de Hadiths">
  </iframe>
</section>
<!-- Page projet -->
<!-- Page projet -->
<section id="projet" class="page">
  <div class="top-nav-bar">
    <div class="title-container">
        <h1>ANSAR ALMOUYASSAR</h1>
        <p>Association des ressortissants de l'institut coranique Al Mouyassar</p>
    </div>
    <img src="images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
</div>
  <button onclick="showPage('home')" class="back-button">
    <i class="fas fa-arrow-left"></i>
  </button>

  <div class="projet-container">
    <!-- Header -->
    <header class="projet-header">
      <h1>Ansar Projet</h1>
    </header>

    <!-- Main Buttons -->
    <div class="projet-buttons">
       <button onclick="showProjetSection('promotion')" class="projet-btn bg-blue"> Promouvoir votre domaine .    
            <i class="fas fa-bullhorn"></i>
      </button>
      <button onclick="showProjetSection('financement')" class="projet-btn bg-green"> Demande de Financement .   
            <i class="fas fa-money-bill-wave"></i>
      </button>
      
    </div>

    <!-- Admin Link -->
    <div class="text-center mt-4">
      <a href="#" onclick="showProjetAdmin()" class="admin-link">
        <i class="fas fa-lock"></i> 
      </a>
    </div>

    <!-- Promotion Form -->
          <!-- Promotion Form -->
        <div id="promotion-form" class="form-container hidden-section bg-white rounded-lg shadow-xl p-6 mb-8">
            <button onclick="showMainInterface()" class="text-red-600 font-bold py-2 px-4 transition duration-300">
                <i class="fas fa-arrow-left mr-2"></i> Retour
            </button>
            <h2 class="text-2xl font-bold text-blue-700 mb-6">Objectif : Mettre en avant les compétences des membres</h2>
            <p class="text-gray-600 mb-6">Veillez remplir ce formulaire ci dessus</p>
            
            <form id="promotionForm" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-gray-700 mb-2" for="nom">Nom & Prénom</label>
                        <input type="text" id="nom" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2" for="dob">Date de Naissance</label>
                        <input type="date" id="dob" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                </div>
                
                <div>
                    <label class="block text-gray-700 mb-2">Êtes-vous membre de l'association ?</label>
                    <div class="flex space-x-4">
                        <label class="inline-flex items-center">
                            <input type="radio" name="membre" value="oui" class="h-5 w-5 text-blue-600" required>
                            <span class="ml-2 text-gray-700">Oui</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" name="membre" value="non" class="h-5 w-5 text-blue-600">
                            <span class="ml-2 text-gray-700">Non</span>
                        </label>
                    </div>
                </div>
                
                <div>
                    <label class="block text-gray-700 mb-2" for="metier">Métier</label>
                    <input type="text" id="metier" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                
                <div>
                    <label class="block text-gray-700 mb-2" for="experience">Années d'expérience</label>
                    <input type="number" id="experience" min="0" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                
                <div>
                    <label class="block text-gray-700 mb-2" for="description">Description</label>
                    <textarea id="description" rows="4" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
                </div>
                
                <div>
                    <label class="block text-gray-700 mb-2" for="adresse">Emplacement (Adresse)</label>
                    <input type="text" id="adresse" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                
                <div>
                    <label class="block text-gray-700 mb-2" for="contact">Contact</label>
                    <input type="tel" id="contact" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                
                <div>
                    <label class="block text-gray-700 mb-2" for="email">Adresse Gmail <span class="text-red-500">*</span></label>
                    <input type="email" id="email" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                
                <div class="pt-4">
                    <label class="block text-gray-700 mb-2">J'ai besoin de :</label>
                    <div class="flex flex-wrap gap-4">
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="besoins" value="site web" class="h-5 w-5 text-blue-600">
                            <span class="ml-2 text-gray-700">Un site web</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="besoins" value="affiche" class="h-5 w-5 text-blue-600">
                            <span class="ml-2 text-gray-700">Une affiche</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="besoins" value="portfolio" class="h-5 w-5 text-blue-600">
                            <span class="ml-2 text-gray-700">Un portfolio</span>
                        </label>
                    </div>
                </div>
                
                <div class="flex justify-end pt-6">
                    <button type="button" onclick="submitPromotionForm()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow transition duration-300">
                        Envoyer mon dossier
                    </button>
                </div>
            </form>
        </div>

    <!-- Financement Form -->
          <!-- Financement Form -->
        <div id="financement-form" class="form-container hidden-section bg-white rounded-lg shadow-xl p-6 mb-8">
            <button onclick="showMainInterface()" class="text-red-600 font-bold py-2 px-4 transition duration-300">
                <i class="fas fa-arrow-left mr-2"></i> Retour
            </button>
            <h2 class="text-2xl font-bold text-green-700 mb-6">Financement d'un Projet</h2>
            
            <form id="financementForm" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-gray-700 mb-2" for="f-nom">Nom & Prénom</label>
                        <input type="text" id="f-nom" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2" for="f-dob">Date de Naissance</label>
                        <input type="date" id="f-dob" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                    </div>
                </div>
                
                <div>
                    <label class="block text-gray-700 mb-2">Êtes-vous membre de l'association ?</label>
                    <div class="flex space-x-4">
                        <label class="inline-flex items-center">
                            <input type="radio" name="f-membre" value="oui" class="h-5 w-5 text-green-600" required>
                            <span class="ml-2 text-gray-700">Oui</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" name="f-membre" value="non" class="h-5 w-5 text-green-600">
                            <span class="ml-2 text-gray-700">Non</span>
                        </label>
                    </div>
                </div>
                
                <div>
                    <label class="block text-gray-700 mb-2" for="titre-projet">Titre de votre projet <span class="text-red-500">*</span></label>
                    <input type="text" id="titre-projet" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                </div>
                
                <div>
                    <label class="block text-gray-700 mb-2" for="description-projet">Description détaillée <span class="text-red-500">*</span></label>
                    <textarea id="description-projet" rows="4" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required></textarea>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-gray-700 mb-2" for="budget">Budget <span class="text-red-500">*</span></label>
                        <input type="number" id="budget" min="0" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2" for="delai">Délai <span class="text-red-500">*</span></label>
                        <input type="text" id="delai" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Ex: 3 mois" required>
                    </div>
                </div>
                
                <div class="pt-4">
                    <label class="block text-gray-700 mb-2">J'ai besoin de :</label>
                    <div class="flex flex-wrap gap-4">
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="f-besoins" value="site web" class="h-5 w-5 text-green-600">
                            <span class="ml-2 text-gray-700">Un site web</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="f-besoins" value="affiche" class="h-5 w-5 text-green-600">
                            <span class="ml-2 text-gray-700">Une affiche</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="f-besoins" value="portfolio" class="h-5 w-5 text-green-600">
                            <span class="ml-2 text-gray-700">Un portfolio</span>
                        </label>
                    </div>
                </div>
                
                <div class="flex justify-end pt-6">
                    <button type="button" onclick="submitFinancementForm()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow transition duration-300">
                        Envoyer mon dossier
                    </button>
                </div>
            </form>
        </div>

        <!-- Business Section -->
        <div id="business-section" class="hidden-section">
    <div class="container mx-auto px-4 py-8">
       
        <h2 class="text-3xl font-bold text-purple-700 mb-8 text-center"></h2>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="business-cards">
            <!-- Les cartes seront générées dynamiquement -->
        </div>
    </div>
</div>

<!-- Ajouter ce modal juste après la section business-section -->
<div id="business-modal" class="business-modal hidden-section">
    <div class="business-modal-content">
        <span class="close-modal" onclick="hideBusinessDetails()">&times;</span>
        <h3 id="modal-title" class="text-2xl font-bold text-gray-800 mb-4"></h3>
        <div id="modal-content" class="space-y-4">
            <!-- Les détails seront chargés ici -->
        </div>
        <button onclick="hideBusinessDetails()">Fermer</button>
    </div>
</div>
                    
                    <div class="mt-6 flex justify-end">
                        
                    </div>
                </div>
            </div>
        </div>

        <!-- Success Messages -->
 

    <!-- Admin Section -->
  <!-- Admin Section -->
<div id="admin-section" class="modal hidden-section">
  <div class="modal-content">
    <span class="close-modal" onclick="closeModal('admin-section')">&times;</span>
    <h2>ESPACE RÉSERVÉ À L'ADMINISTRATION</h2>
    <div class="space-y-4">
      <div>
        <label class="block mb-2" for="code1">Code secret 1</label>
        <input type="password" id="code1" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
      </div>
      <div>
        <label class="block mb-2" for="code2">Code secret 2</label>
        <input type="password" id="code2" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
      </div>
      <div class="pt-4 flex justify-between">
        <button onclick="verifyAdminCodes()" class="bg-accent hover:bg-light-accent text-primary font-bold py-2 px-4 rounded transition duration-300">
          Valider
        </button>
      </div>
    </div>
  </div>
</div>

        <!-- Admin Dashboard -->
        <div id="admin-dashboard" class="hidden-section">
          <div class="top-nav-bar">
    <div class="title-container">
        <h1>ANSAR ALMOUYASSAR</h1>
        <p>Association des ressortissants de l'institut coranique Al Mouyassar</p>
    </div>
    <img src="images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
</div>
            <button onclick="showMainInterface()" class="text-red-600 font-bold py-2 px-4 transition duration-300">
                <i class="fas fa-arrow-left mr-2"></i> Retour
            </button>
            <h2 class="text-3xl font-bold text-indigo-800 mb-6">Tableau de bord Admin</h2>
            <div class="flex flex-nowrap overflow-x-auto justify-start gap-4 mb-8 px-2">
                <button onclick="showAdminForm('promotion')" class="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow transition duration-300">
                    <i class="fas fa-bullhorn mr-2"></i> Ajouter un affiche
                </button>
                <button onclick="showAdminForm('financement')" class="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow transition duration-300">
                    <i class="fas fa-money-bill-wave mr-2"></i> Enregistrer un Projet
                </button>
                <button onclick="showAdminBusinessList()" class="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow transition duration-300">
                    <i class="fas fa-briefcase mr-2"></i> Gérer les affiches
                </button>
                <button onclick="showAdminProjectList()" class="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow transition duration-300">
                    <i class="fas fa-project-diagram mr-2"></i> Gérer les Projets
                </button>
            </div>

            <!-- Admin Promotion Form -->
            <div id="admin-promotion-form" class="form-container hidden-section bg-white rounded-lg shadow-xl p-6 mb-8">
                <h2 class="text-2xl font-bold text-blue-700 mb-6">Ajouter un affiche</h2>
                
                <form id="adminPromotionForm" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-gray-700 mb-2" for="a-nom">Nom & Prénom</label>
                            <input type="text" id="a-nom" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2" for="a-dob">Date de Naissance</label>
                            <input type="date" id="a-dob" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2" for="a-membre">Membre</label>
                        <select id="a-membre" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="oui">Oui</option>
                            <option value="non">Non</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2" for="a-metier">Métier</label>
                        <input type="text" id="a-metier" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2" for="a-experience">Années d'expérience</label>
                        <input type="number" id="a-experience" min="0" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2" for="a-description">Description</label>
                        <textarea id="a-description" rows="4" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2" for="a-adresse">Emplacement (Adresse)</label>
                        <input type="text" id="a-adresse" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2" for="a-contact">Contact</label>
                        <input type="tel" id="a-contact" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2" for="a-email">Adresse Email</label>
                        <input type="email" id="a-email" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2" for="a-image">Lien de l'image (PostImages ou autre)</label>
                        <input type="url" id="a-image" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="postimages.org(.jpg)">
                      <div class="mb-4">
    <label for="a-website" class="block text-gray-700 font-medium mb-2">Site Web</label>
    <input id="a-website" name="a-website" type="url" placeholder="lien-directe" class="w-full p-3 border rounded">
</div>
<div class="mb-4">
    <label for="a-portfolio" class="block text-gray-700 font-medium mb-2">Portfolio</label>
    <input id="a-portfolio" name="a-portfolio" type="url" placeholder="lien-directe" class="w-full p-3 border rounded">
</div>
                    </div>
                    
                    <div class="pt-4">
                        <label class="block text-gray-700 mb-2">Services proposés</label>
                        <div class="flex flex-wrap gap-4">
                            <label class="inline-flex items-center">
                                <input type="checkbox" name="a-services" value="site web" class="h-5 w-5 text-blue-600">
                                <span class="ml-2 text-gray-700">Site web</span>
                            </label>
                            <label class="inline-flex items-center">
                                <input type="checkbox" name="a-services" value="affiche" class="h-5 w-5 text-blue-600">
                                <span class="ml-2 text-gray-700">Affiche</span>
                            </label>
                            <label class="inline-flex items-center">
                                <input type="checkbox" name="a-services" value="portfolio" class="h-5 w-5 text-blue-600">
                                <span class="ml-2 text-gray-700">Portfolio</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex justify-end pt-6">
                        <button type="button" onclick="saveBusiness()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow transition duration-300">
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- Admin Financement Form -->
            <div id="admin-financement-form" class="form-container hidden-section bg-white rounded-lg shadow-xl p-6 mb-8">
                <h2 class="text-2xl font-bold text-green-700 mb-6">Ajouter un Projet</h2>
                
                <form id="adminFinancementForm" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-gray-700 mb-2" for="af-nom">Nom & Prénom</label>
                            <input type="text" id="af-nom" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2" for="af-dob">Date de Naissance</label>
                            <input type="date" id="af-dob" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2" for="af-membre">Membre de l'association</label>
                        <select id="af-membre" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="oui">Oui</option>
                            <option value="non">Non</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2" for="af-titre">Titre du projet</label>
                        <input type="text" id="af-titre" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2" for="af-description">Description</label>
                        <textarea id="af-description" rows="4" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-gray-700 mb-2" for="af-budget">Budget</label>
                            <input type="number" id="af-budget" min="0" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2" for="af-delai">Délai</label>
                            <input type="text" id="af-delai" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Ex: 3 mois" required>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2" for="af-image">Lien de l'image (PostImages ou autre)</label>
                        <input type="url" id="af-image" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="https://postimages.org/example.jpg">
                      <div class="mb-4">
    <label for="af-website" class="block text-gray-700 font-medium mb-2">Site Web</label>
    <input id="af-website" name="af-website" type="url" placeholder="lien-directe" class="w-full p-3 border rounded">
</div>
<div class="mb-4">
    <label for="af-portfolio" class="block text-gray-700 font-medium mb-2">Portfolio</label>
    <input id="af-portfolio" name="af-portfolio" type="url" placeholder="lien-directe" class="w-full p-3 border rounded">
</div>
                    </div>
                    
                    <div class="pt-4">
                        <label class="block text-gray-700 mb-2">Besoins</label>
                        <div class="flex flex-wrap gap-4">
                            <label class="inline-flex items-center">
                                <input type="checkbox" name="af-besoins" value="site web" class="h-5 w-5 text-green-600">
                                <span class="ml-2 text-gray-700">Site web</span>
                            </label>
                            <label class="inline-flex items-center">
                                <input type="checkbox" name="af-besoins" value="affiche" class="h-5 w-5 text-green-600">
                                <span class="ml-2 text-gray-700">Affiche</span>
                            </label>
                            <label class="inline-flex items-center">
                                <input type="checkbox" name="af-besoins" value="portfolio" class="h-5 w-5 text-green-600">
                                <span class="ml-2 text-gray-700">Portfolio</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex justify-end pt-6">
                        <button type="button" onclick="saveProject()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow transition duration-300">
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- Admin Business List -->
            <div id="admin-business-list" class="form-container hidden-section">
                <h2 class="text-2xl font-bold text-purple-700 mb-6">Gérer les Professionnels</h2>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead class="bg-purple-600 text-white">
                           
                        </thead>
                        <tbody class="divide-y divide-gray-200" id="business-table-body">
                            <!-- Sample Row 1 -->
                            <tr>
                                <td class="py-3 px-4">Jean Dupont</td>
                                <td class="py-3 px-4">Designer Graphique</td>
                                <td class="py-3 px-4">5 ans</td>
                                <td class="py-3 px-4">Paris, France</td>
                                <td class="py-3 px-4 text-center">
                                    <button onclick="editBusiness('1')" class="text-blue-600 hover:text-blue-800 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteBusiness('1')" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                            <!-- Sample Row 2 -->
                            <tr>
                                <td class="py-3 px-4">Marie Martin</td>
                                <td class="py-3 px-4">Développeur Web</td>
                                <td class="py-3 px-4">3 ans</td>
                                <td class="py-3 px-4">Lyon, France</td>
                                <td class="py-3 px-4 text-center">
                                    <button onclick="editBusiness('2')" class="text-blue-600 hover:text-blue-800 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteBusiness('2')" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                            <!-- Sample Row 3 -->
                            <tr>
                                <td class="py-3 px-4">Sophie Lambert</td>
                                <td class="py-3 px-4">Photographe</td>
                                <td class="py-3 px-4">7 ans</td>
                                <td class="py-3 px-4">Marseille, France</td>
                                <td class="py-3 px-4 text-center">
                                    <button onclick="editBusiness('3')" class="text-blue-600 hover:text-blue-800 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteBusiness('3')" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Admin Project List -->
            <div id="admin-project-list" class="form-container hidden-section">
                <h2 class="text-2xl font-bold text-teal-700 mb-6">Gérer les Projets</h2>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white rounded-lg overflow-hidden">
                        
                        <tbody class="divide-y divide-gray-200" id="project-table-body">
                            <!-- Projects will be dynamically added here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

</section>
    
<script>
function handleIframeError() {
  console.error('Erreur de chargement de l\'iframe Projet');
  document.getElementById('projet-error').style.display = 'block';
  document.getElementById('projet-iframe').style.display = 'none';
}
</script>
    

 <!-- Page Bibliothèque -->
<section id="library" class="page">
  <div class="top-nav-bar">
    <div class="title-container">
        <h1>ANSAR ALMOUYASSAR</h1>
        <p>Association des ressortissants de l'institut coranique Al Mouyassar</p>
    </div>
    <img src="images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
</div>
  <div class="messages-header-container">
    <div class="messages-header">Bibliothèques</div>
  </div>
  <div class="messages-list-container">
    <div id="library-content"></div>
  </div>
</section>

    
    <!-- Page des Messages -->
<section id="messages" class="page">

  <div class="messages-header-container">
    <div class="messages-header">Boîte de réception</div>
  </div>
  <div class="messages-list-container">
    <div id="messages-list" class="messages-list">
      <!-- Les messages seront chargés ici dynamiquement par le JavaScript existant -->
    </div>
  </div>
</section>
    
    <!-- Espace personnel -->
 <!-- Espace personnel -->
    <section id="personal" class="page">
 
     <div id="personal-login" style="display: block;">
  <div class="main">
    <div class="top-section">
      <div class="profile-container">
        <div class="profile-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>
    </div>
    <div class="bottom-section">
      <div class="container">
        <h2>Espace Personnel</h2>
        <form id="personal-login-form" class="login-section">
          <label for="personal-member-code">Code</label>
          <input type="text" id="personal-member-code" placeholder=" " required>
          <label for="personal-password">Mot de passe </label>
          <input type="password" id="personal-password" placeholder=" " required>
          <button type="submit" class="cta-button">Se connecter</button>
        </form>
        <p id="personal-error-message" style="color: red; display: none;"></p>
        <p class="privacy-policy-link">En vous connectant, vous acceptez notre <a href="privacy-policy.html" target="_blank">Politique de Confidentialité</a></p>
      </div>
    </div>
  </div>
</div>
      <div id="personal-content" style="display: none;">
        <div class="main">
          <!-- Partie haute en vert avec profil -->
          <div class="top-section">
            <div class="profile-container">
              <div class="profile-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <p id="personal-title" class="user-name"></p>
              <p id="personal-role" class="user-role"></p> <!-- Nouvel élément pour le rôle -->
            </div>
          </div>

          <!-- Partie basse avec contenu -->
          <div class="bottom-section">
            <div class="container">
              <h1>Compte</h1>

              <!-- Section 1 : Informations personnelles -->
              <div id="personal-info" class="section info-section">
                <!-- Contenu rempli dynamiquement par JS, sans le rôle -->
              </div>

              <!-- Section 2 : Cotisations -->
              <div id="personal-contributions" class="section cotisations-section">
                <h2>Cotisations Mensuelles</h2> <!-- Transformé en titre -->
                <div id="cotisations-content"></div> <!-- Contenu des cotisations -->
                <h2>Autres Cotisations </h2> <!-- Titre pour cotisations globales -->
                <div id="global-cotisations-content"></div> <!-- Contenu des cotisations globales -->
              </div>

              <!-- Méthodes de paiement -->
              <div class="payment-methods">
                <button class="payment-btn" onclick="payViaWave()">Payer via Wave</button>
                <button class="payment-btn" onclick="payViaOrangeMoney()">Payer via Orange Money</button>
              </div>

              <!-- Section 3 : Suggestions -->
              <div class="section suggestions-section">
                <h2>Suggestions</h2>
                <form id="suggestion-form">
                  <textarea id="suggestion-text" placeholder="Écrivez vos suggestions ici..." rows="4" required></textarea>
                  <button type="submit" class="cta-button">Envoyer</button>
                </form>
              </div>

              <!-- Bouton Déconnexion -->
              <button class="logout-btn" onclick="logoutPersonal()">Se Déconnecter</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Espace Secret Général -->
    <section id="secret" class="page">
      <div class="top-nav-bar">
    <div class="title-container">
        <h1>ANSAR ALMOUYASSAR</h1>
        <p>Association des ressortissants de l'institut coranique Al Mouyassar</p>
    </div>
    <img src="images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
</div>
      <h2>Espace Administration</h2>
      <div class="tabs">
        <button class="tab-button active" onclick="showTab('add-member')">Ajouter un Membre</button>
        <button class="tab-button" onclick="showTab('mass-import')">Import en Masse</button>
        <button class="tab-button" onclick="showTab('edit-member')">Modifier un Membre</button>
        <button class="tab-button" onclick="showTab('events-admin')">Événements</button>
        <button class="tab-button" onclick="showTab('messages-admin')">Messages</button>
        <button class="tab-button" onclick="showTab('notes')">Notes</button>
        <button class="tab-button" onclick="showTab('suggestions-admin')">Suggestions</button>
        <button class="tab-button" onclick="showTab('stats')">Statistiques</button>
        <button class="tab-button" onclick="showTab('auto-messages')">Messages Automatisés</button>
      </div>
      <div id="add-member" class="tab-content active">
        <h3>Ajouter un Membre</h3>
        <form id="add-member-form">
          <input type="text" id="new-member-firstname" placeholder="Prénom (obligatoire)" required>
          <input type="text" id="new-member-lastname" placeholder="Nom (obligatoire)" required>
          <input type="number" id="new-member-age" placeholder="Âge">
          <input type="text" id="new-member-dob" placeholder="Date de naissance (JJMMAAAA)">
          <input type="text" id="new-member-birthplace" placeholder="Lieu de naissance">
          <input type="email" id="new-member-email" placeholder="Email">
          <input type="text" id="new-member-activity" placeholder="Activité actuelle">
          <input type="text" id="new-member-address" placeholder="Adresse">
          <input type="tel" id="new-member-phone" placeholder="Numéro de téléphone">
          <input type="text" id="new-member-residence" placeholder="Num. Carte d'identité CIN">
<select id="new-member-role">
  <option value="membre">Membre Simple</option>
  <option value="tresorier">Trésorier</option>
  <option value="vice-tresorier">Vice-Trésorière</option>
  <option value="president">Président</option>
  <option value="vice-president">Vice-Présidente</option>
  <option value="secretaire">Secrétaire</option>
  <option value="vice-secretaire">Vice-Secrétaire</option>
</select>
          <select id="new-member-status">
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="liste-noire">Liste noire</option>
          </select>
          <button type="submit" class="cta-button">Ajouter</button>
        </form>
      </div>
      
      <div id="mass-import" class="tab-content">
  <h3>Importation en masse</h3>
  <textarea id="mass-members-data" placeholder="Collez les données au format:
Prénom|Nom|Âge|Email|Téléphone|Rôle|Statut|Adresse|Activité|Résidence|Lieu de naissance|Date de naissance" 
            rows="20" style="width:100%"></textarea>
  <button class="cta-button" onclick="importMembersBulk()">Importer</button>
  <div id="import-progress"></div>
</div>
      
      <div id="edit-member" class="tab-content">
        <h3>Modifier/Supprimer un Membre</h3>
         <!-- Ajoutez cette barre de recherche -->
  <div class="search-container" style="margin-bottom: 20px;">
    <input type="text" id="edit-member-search" placeholder="Rechercher un membre..." 
           style="padding: 8px; width: 100%; max-width: 400px; border-radius: 4px; border: 1px solid #ccc;">
 
  </div>
        <div id="edit-members-list"></div>
        <form id="delete-member-form" style="display: none;">
          <p>Entrez le code président pour confirmer la suppression :</p>
          <input type="password" id="delete-member-code" placeholder="Code président" required>
          <button type="submit" class="cta-button">Confirmer la suppression</button>
          <button type="button" class="cta-button" onclick="showPage('admin-members')">Annuler</button>
        </form>
      </div>
      <div id="events-admin" class="tab-content">
        <h3>Ajouter un Événement</h3>
        <form id="add-event-form">
          <input type="text" id="event-name" placeholder="Nom de l'événement" required>
          <input type="date" id="event-date" required>
          <input type="time" id="event-time" required>
          <textarea id="event-description" placeholder="Description" required></textarea>
          <button type="submit" class="cta-button">Ajouter</button>
        </form>
         <div id="events-admin-list"></div>
      </div>
      <div id="messages-admin" class="tab-content">
        <h3>Gérer les Messages</h3>
        <form id="add-message-form">
          <input type="text" id="message-title" placeholder="Titre du message" required>
          <textarea id="message-text" placeholder="Contenu du message" required></textarea>
          <button type="submit" class="cta-button">Envoyer</button>
        </form>
         <div id="messages-admin-list"></div>
      </div>
      <div id="notes" class="tab-content">
        <h3>Notes</h3>
        <form id="add-note-form">
          <input type="text" id="note-theme" placeholder="Thème (ex. : Réunion)" required>
          <textarea id="note-text" placeholder="Contenu de la note" required></textarea>
          <button type="submit" class="cta-button">Ajouter</button>
        </form>
         <div id="notes-list"></div>
      </div>
      <div id="internal-docs" class="tab-content">
        <h3>Documents Internes</h3>
        <form id="add-internal-doc-form">
          <input type="text" id="internal-doc-category" placeholder="Catégorie" required>
          <button type="submit" class="cta-button">Ajouter</button>
        </form>
         <div id="internal-docs-list"></div>
      </div>
      <div id="suggestions-admin" class="tab-content">
        <h3>Suggestions des Membres</h3>
         <div id="suggestions-list"></div>
      </div>
      <button class="tab-button" onclick="showTab('suggestions-admin')">Suggestions</button>
 <div id="stats" class="tab-content">
  <h3>Statistiques</h3>
  <div id="stats-selection">
    <label for="stats-type">Type de cotisation :</label>
    <select id="stats-type">
      <option value="monthly">Cotisations Mensuelles</option>
      <option value="global">Cotisations Globales</option>
    </select>

    <!-- Sélection pour les cotisations mensuelles -->
    <div id="monthly-selection" style="display: block;">
      <label for="stats-month">Mois :</label>
      <select id="stats-month">
        <option value="0">Janvier</option>
        <option value="1">Février</option>
        <option value="2">Mars</option>
        <option value="3">Avril</option>
        <option value="4">Mai</option>
        <option value="5">Juin</option>
        <option value="6">Juillet</option>
        <option value="7">Août</option>
        <option value="8">Septembre</option>
        <option value="9">Octobre</option>
        <option value="10">Novembre</option>
        <option value="11">Décembre</option>
      </select>
      <label for="stats-year">Année :</label>
      <select id="stats-year">
        <option value="2023">2023</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
      </select>
    </div>

    <!-- Sélection pour les cotisations globales -->
    <div id="global-selection" style="display: none;">
      <label for="global-contribution">Cotisation Globale :</label>
      <select id="global-contribution">
        <!-- Options remplies dynamiquement via JavaScript -->
      </select>
    </div>

    <div id="chart-type-selection">
      <button class="cta-button" onclick="renderStatsChart('bar')">D. à Barres</button>
      <button class="cta-button" onclick="renderStatsChart('pie')">D. Circulaire</button>
      <button class="cta-button" onclick="renderStatsChart('line')">D. en Ligne</button>
    </div>
  </div>
  <canvas id="stats-chart" style="max-width: 600px; margin: 20px auto;"></canvas>
</div>
 
      <div id="auto-messages" class="tab-content">
        <h3>Messages Automatisés</h3>
        <form id="add-auto-message-form">
          <input type="text" id="auto-message-name" placeholder="Nom (ex. : Rappel Cotisation)" required>
          <textarea id="auto-message-text" placeholder="Contenu du message" required></textarea>
          <input type="date" id="auto-message-date" required>
          <input type="time" id="auto-message-time" required>
          <button type="submit" class="cta-button">Ajouter</button>
        </form>
         <div id="auto-messages-list"></div>
      </div>
    </section>

    <!-- Espace Trésorier -->
    <section id="treasurer" class="page">
      <div class="top-nav-bar">
    <div class="title-container">
        <h1>ANSAR ALMOUYASSAR</h1>
        <p>Association des ressortissants de l'institut coranique Al Mouyassar</p>
    </div>
    <img src="images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
</div>
      <button class="cta-button back-button" onclick="showPage('home')"><span class="material-icons">arrow_back</span> Retour</button>
      <h2>Espace Trésorier</h2>
      <div class="tabs">
        <button class="tab-button active" onclick="showPage('treasurer-monthly')">Cotisations Mensuelles</button>
        <button class="tab-button" onclick="showPage('treasurer-global')">Autres Cotisations</button>
      </div>
    </section>

    <!-- Page des Cotisations Mensuelles -->
    <section id="treasurer-monthly" class="page">
      <button class="cta-button back-button" onclick="showPage('home')"><span class="material-icons">arrow_back</span> Retour</button>
      <h2>Cotisations Mensuelles</h2>
      <input type="text" id="treasurer-monthly-search" placeholder="Rechercher un membre..." class="search-bar">
       
      <div id="treasurer-monthly-list"></div>
    </section>

    <!-- Page des Cotisations Globales -->
    <section id="treasurer-global" class="page">
      <button class="cta-button back-button" onclick="goBackToTreasurer()"><span class="material-icons">arrow_back</span> Retour</button>
      <h2>Gestion des autres Cotisations</h2>
      <form id="add-contribution-form">
        <input type="text" id="contribution-name" placeholder="Nom (ex. : SET SETAL 500F)" required>
        <input type="number" id="contribution-amount" placeholder="Montant (FCFA)" required>
        <button type="submit" class="cta-button">Confirmer</button>
        <button type="button" class="cta-button cancel-button" onclick="document.getElementById('add-contribution-form').reset()">Annuler</button>
      </form>
       <div id="contributions-admin-list"></div>
    </section>

    <!-- Page de Gestion des Paiements d'une Cotisation Globale -->
<section id="treasurer-global-manage" class="page">
  <button class="cta-button back-button" onclick="goBackToTreasurerGlobal()">
    <span class="material-icons">arrow_back</span> Retour
  </button>
  <h2 id="treasurer-global-title">Gérer les Paiements</h2>
  <input type="text" id="global-contribution-search" placeholder="Rechercher un membre...">
  <div id="global-contribution-members"></div>
  <div id="treasurer-global-manage"></div>
</section>

    <!-- Page des Cotisations Mensuelles d'un Membre -->
    <section id="treasurer-member-monthly" class="page">
      <button class="cta-button back-button" onclick="goBackToTreasurerMonthly()"><span class="material-icons">arrow_back</span> Retour</button>
      <h2 id="treasurer-member-title">Cotisations du Membre</h2>
      <button class="cta-button" onclick="saveMonthlyContributions()">Enregistrer</button>
      <div id="treasurer-monthly-content"></div>
    </section>

    <!-- Espace Président -->
    <!-- Espace Président -->
    <section id="president" class="page">
      <div class="top-nav-bar">
    <div class="title-container">
        <h1>ANSAR ALMOUYASSAR</h1>
        <p>Association des ressortissants de l'institut coranique Al Mouyassar</p>
    </div>
    <img src="images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
</div>
      <button class="cta-button back-button" onclick="showPage('home')"><span class="material-icons">arrow_back</span> Retour</button>
      <h2>Espace Président</h2>
      <div class="tabs">
        <button class="tab-button active" onclick="showTab('president-settings')">Paramètres de Sécurité</button>
            <button class="tab-button" onclick="showTab('president-notes')">Notes Confidentiels</button>
      </div>
      <div id="president-settings" class="tab-content active">
        <h3>Codes de Suppression</h3>
        <form id="set-president-codes-form">
          <input type="password" id="member-deletion-code" placeholder="Supprimer un membre" required>
          <input type="password" id="contribution-deletion-code" placeholder="Supprimer une cotisation" required>
          <button type="submit" class="cta-button">Enregistrer</button>
        </form>
          <!-- Nouveaux codes d'accès -->
  <form id="set-access-codes-form">
    <h4>Codes d'Accès aux Espaces</h4>
    
    <!-- Code Président -->
  <div class="code-input-group">
    <label>Code Président:</label>
    <input type="password" id="president-code-input" placeholder="Nouveau code président">
    <button onclick="updateCode('presidentAccessCode')" class="cta-button">Mettre à jour</button>
  </div>

    
    <div class="code-input-group">
      <label>Administration:</label>
      <input type="password" id="secret-access-code" placeholder="Code pour l'espace secret" required>
      <button type="button" class="cta-button small" onclick="saveSingleCode('secret-access-code', 'secretAccessCode')">Enregistrer</button>
    </div>
    
    <div class="code-input-group">
      <label>Trésorier:</label>
      <input type="password" id="treasurer-access-code" placeholder="Code pour l'espace trésorier" required>
      <button type="button" class="cta-button small" onclick="saveSingleCode('treasurer-access-code', 'treasurerAccessCode')">Enregistrer</button>
    </div>
    
    <div class="code-input-group">
      <label>Secrétaire:</label>
      <input type="password" id="secretary-access-code" placeholder="Code pour l'espace secrétaire" required>
      <button type="button" class="cta-button small" onclick="saveSingleCode('secretary-access-code', 'secretaryAccessCode')">Enregistrer</button>
    </div>
  </form>
 
      </div>
      <!-- NOUVELLE SECTION NOTES -->
  <div id="president-notes" class="tab-content">
    <h3>Notes Privées</h3>
    
    <!-- Formulaire d'ajout/édition -->
    <form id="president-note-form">
      <textarea id="president-note-text" 
                placeholder="Écrivez vos notes ici..." 
                rows="5" required></textarea>
      <div class="form-actions">
        <button type="submit" class="cta-button" id="save-note-btn">Enregistrer</button>
        <button type="button" class="cta-button cancel-button" 
                onclick="cancelNoteEdit()" style="display:none;">Annuler</button>
      </div>
    </form>
    
    <!-- Liste des notes -->
   <div id="president-notes-list" class="notes-container">
      <!-- Les notes apparaîtront ici -->
    </div>
  </div>
</section>

   <!-- Espace Secrétaire -->
<!-- Espace Secrétaire -->
<section id="secretary" class="page">
  <div class="top-nav-bar">
    <div class="title-container">
        <h1>ANSAR ALMOUYASSAR</h1>
        <p>Association des ressortissants de l'institut coranique Al Mouyassar</p>
    </div>
    <img src="images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
</div>
  <button class="cta-button back-button" onclick="showPage('home')"><span class="material-icons">arrow_back</span> Retour</button>
  <h2>Espace Secrétaire</h2>
  
  <!-- Barre de boutons en haut -->
  <div class="button-group" style="display: flex; gap: 10px; margin-bottom: 20px;">
    <button class="tab-button active" onclick="showSecretarySection('affiche')" style="flex: 1;">Ajouter une affiche</button>
    <button class="tab-button" onclick="showSecretarySection('livre')" style="flex: 1;">Ajouter un livre</button>
    <button class="tab-button" onclick="showSecretarySection('message')" style="flex: 1;">Message (page d'accueil)</button>
  </div>

  <!-- Section Ajouter une affiche -->
  <div id="affiche-section" class="secretary-content" style="display: block;">
    <form id="add-secretary-file-form">
      <h3>Ajouter une affiche</h3>
      <input type="text" id="secretary-file-name" placeholder="Nom" required>
      <input type="text" id="secretary-file-category" placeholder="Catégorie" required>
      <input type="text" id="secretary-file-url" placeholder="Lien (ex: postimages.org)" required>
      <button type="submit" class="cta-button">Ajouter</button>
    </form>

    <!-- Liste des affiches -->
    <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
      <h4>Affiches existantes</h4>
      <div id="secretary-files-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
        <!-- Contenu généré dynamiquement par le JS existant -->
      </div>
    </div>
  </div>

  <!-- Section Ajouter un livre -->
  <div id="livre-section" class="secretary-content" style="display: none;">
    <form id="add-library-book-form">
      <h3>Ajouter un livre</h3>
      <input type="text" id="book-title" placeholder="Titre du livre" required>
      <input type="text" id="book-category" placeholder="RUBRIQUE" required>
      <input type="text" id="book-cover-url" placeholder="Lien de la couverture (postimages.org)" required>
      <input type="text" id="book-pdf-url" placeholder="Lien du PDF (Drive)" required>
      <button type="submit" class="cta-button">Ajouter à la bibliothèque</button>
    </form>

    <!-- Liste des livres -->
    <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
      <h4>Voir la liste dans la section affiche</h4>
      <div id="library-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
        <!-- Contenu généré dynamiquement par le JS existant -->
      </div>
    </div>
  </div>

  <!-- Section Message page d'accueil -->
  <div id="message-section" class="secretary-content" style="display: none;">
    <div id="motivation-admin">
      <h3>Message (page d'accueil)</h3>
      <textarea id="motivation-text" placeholder="Entrez votre message motivationnel..." style="width: 100%; min-height: 100px; margin-bottom: 10px;"></textarea>
      <div style="display: flex; gap: 10px;">
        <button id="send-motivation-btn" class="cta-button">Envoyer</button>
        <button id="delete-motivation-btn" class="cta-button danger">Supprimer le dernier</button>
      </div>
      <div id="displayed-motivation" style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">Aucun message affiché</div>
    </div>

    <!-- Historique des messages -->
    <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
       
      <div id="motivation-history" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
        <!-- Contenu généré dynamiquement par le JS existant -->
      </div>
    </div>
  </div>
</section>

 <!-- Page des paramètres -->
<section id="settings" class="page">
  <div class="top-nav-bar">
    <div class="title-container">
        <h1>ANSAR ALMOUYASSAR</h1>
        <p>Association des ressortissants de l'institut coranique Al Mouyassar</p>
    </div>
    <img src="images/logo.png" alt="Logo ANSAR ALMOUYASSAR" class="logo">
</div>
  <div class="association-title">Paramètres</div>
  
  <!-- Nouvelle section Réseaux sociaux -->
  <h3>Nous suivre</h3>
  <div class="social-grid">
    <a href="https://www.tiktok.com/@ansaralmouyassar?_t=ZM-8yJ6XeNaLLB&_r=1" target="_blank" class="social-item">
      <i class="fab fa-tiktok"></i>
    </a>
    <a href="https://www.instagram.com/ansaralmouyassar?igsh=c3AxamJzeXlrenh1" target="_blank" class="social-item">
      <i class="fab fa-instagram"></i>
    </a>
    <a href="https://www.snapchat.com/add/ansar102023?share_id=rr0qM35WH9U&locale=fr-FR" target="_blank" class="social-item">
      <i class="fab fa-snapchat-ghost"></i>
    </a>
    <a href="https://youtube.com/@almouyassartv?feature=shared" target="_blank" class="social-item">
      <i class="fab fa-youtube"></i>
    </a>
  </div>
  
  <h3>Liens Utiles</h3>
  <div class="links-container">
    <a href="https://ahmedaidara.github.io/ansar" target="_blank" class="link-button">
      Site Officiel
    </a>
    <a href="https://www.schoolandcollegelistings.com/SN/Dakar/1042239852495002/Institut-Al-Mouyassar" target="_blank" class="link-button">
      Institut Al Mouyassar
    </a>
    <a href="https://ahmedaidara.github.io/ansar1.0/reglement.html" target="_blank" class="link-button">
      Réglement intérieur
    </a>
    <a href="https://ahmedaidara.github.io/ansar1.0/privacy-policy.html" target="_blank" class="link-button">
      Politique de confidentialité
    </a>
  </div>
</section>
    
  </main>
  <footer>
    <nav class="bottom-nav">
      <a href="#" class="nav-item active" onclick="showPage('home')"><span class="material-icons">home</span> </a>
     
      
      <a href="#" class="nav-item" onclick="showPage('messages')"><span class="material-icons">notifications</span> </a>
      
      <a href="#" class="nav-item" onclick="showPage('personal')"><span class="material-icons">person</span> </a>
      
    </nav>
  </footer>
  <div class="chatbot-button">
    <span class="material-icons">chat</span>
  </div>
  <div id="chatbot" class="chatbot-container" style="display: none;">
    <div class="chatbot-header">
      <h3>Assistant ANSAR</h3>
      <span class="material-icons" onclick="toggleChatbot()">close</span>
    </div>
    <div id="chatbot-messages"></div>
    <div id="chatbot-controls">
      <button class="cta-button clear-history" onclick="clearChatHistory()"><span class="material-icons">delete</span> </button>
    </div>
    <form id="chatbot-form">
  <input type="text" id="chatbot-input" placeholder="Posez une question...">
  <button type="submit" class="cta-button"><span class="material-icons">send</span></button>
</form>
    <div id="secret-entry" style="display: none;">
  <input type="password" id="secret-password" placeholder="Mot de passe">
  <button class="cta-button" onclick="checkSecretPassword()">Entrée</button>
</div>
  </div>
<script>
  // Copier le contenu de #business-cards dans #business-cards-home au chargement
  document.addEventListener('DOMContentLoaded', () => {
    const businessCards = document.getElementById('business-cards');
    const homeBusinessCards = document.getElementById('business-cards-home');
    if (businessCards && homeBusinessCards) {
      homeBusinessCards.innerHTML = businessCards.innerHTML;
    }
  });
</script>
<script>
document.addEventListener('scroll', function() {
    const title = document.querySelector('#home .association-title');
    const navBar = document.querySelector('#home .top-nav-bar');
    
    // Vérifier si la page active est #home
    if (document.querySelector('#home.active')) {
        // Obtenir la position du titre
        const titleRect = title.getBoundingClientRect();
        
        // Si le bas du titre est hors du viewport (non visible), afficher la barre
        if (titleRect.bottom < 0) {
            navBar.classList.add('active');
        } else {
            navBar.classList.remove('active');
        }
    }
});
</script>
<!-- Modal pour le succès du formulaire de promotion -->

<!-- Modal pour le succès du formulaire de promotion -->
<div id="success-promotion-modal" class="modal hidden-section">
  <div class="modal-content">
    <span class="close-modal">&times;</span>
    <h2>Soumission réussie</h2>
    <p id="success-promotion-message">Votre message a été soumis, Ansar vous contactera dans un délai de 3 à 5 jours.</p>
    <button onclick="closeModal('success-promotion-modal')">Fermer</button>
  </div>
</div>

<!-- Modal pour le succès du formulaire de financement -->
<div id="success-financement-modal" class="modal hidden-section">
  <div class="modal-content">
    <span class="close-modal">&times;</span>
    <h2>Soumission réussie</h2>
    <p id="success-financement-message">Votre message a été soumis, Ansar vous contactera dans un délai de 3 à 5 jours.</p>
    <button onclick="closeModal('success-financement-modal')">Fermer</button>
  </div>
</div>
<script>
// Réponses du chatbot
const chatbotResponses = {
  "salam": "Wa ealeykoum Salam, comment puis-je vous aider",
  "app": "L'application permet aux membres de gérer leurs données personnelles, les cotisations et les événements de l'association.",
  "bonjour": "Bonjour! Comment puis-je vous aider?",
  "salut": "Salut! Que puis-je faire pour vous?",
  "aide": "Je peux vous renseigner sur l'association ANSAR ALMOUYASSAR et son application. Posez-moi vos questions!",
  "politique": "Consultez notre politique de confidentialité dans la page paramétre",
  "almouyassar": "L'Institut Coranique Al Mouyassar est un établissement d'enseignement religieux qui forme des Huffaz (mémorisateurs du Coran). Il organise chaque année une cérémonie de remise des diplômes.",
  "réseaux": "Suivez-nous sur TikTok (@ansaralmouyassar), Instagram (@ansaralmouyassar), Snapchat (ansar102023) et YouTube (@almouyassartv).",
  "diplome": "La 12ème Cérémonie de Remise des Diplômes aux Huffaz aura lieu le 24 Août 2025 au Grand Théâtre National Doudou Ndiaye Rose de Dakar. Mise en place à 13h45.",
  "lieu": "Salut! Que puis-je faire pour vous?",
  "conference": "La cérémonie se tiendra au Grand Théâtre National Doudou Ndiaye Rose de Dakar.",
  "ansar": "L'association ANSAR ALMOUYASSAR regroupe les anciens élèves et ressortissants de l'institut coranique Al Mouyassar, un établissement d'enseignement islamique réputé pour son excellence dans la transmission du Coran et des sciences islamiques. Notre mission est de maintenir les liens entre les anciens élèves, de promouvoir les valeurs islamiques et de contribuer au développement de notre communauté à travers diverses activités éducatives, sociales et caritatives.",
  "mission": "Notre mission est de maintenir les liens entre les anciens élèves, de promouvoir les valeurs islamiques et de contribuer au développement de notre communauté à travers diverses activités éducatives, sociales et caritatives.",
  "activités": "Soutenir l’institut en participant à son développement.",
  // ... vous pouvez garder vos autres réponses existantes ici
};

// Fonction pour gérer les questions du chatbot
function handleChatbotQuestion(question) {
  const lowerQuestion = question.toLowerCase();
  
  // Vérifie les mots-clés
  for (const [keyword, response] of Object.entries(chatbotResponses)) {
    if (lowerQuestion.includes(keyword)) {
      return response;
    }
  }
  
  // Réponse par défaut si aucun mot-clé n'est trouvé
  return "Désolé, je n'ai pas compris votre question. Posez-moi une question sur ANSAR ALMOUYASSAR ou son application.";
}
</script>
<script>
document.getElementById('chatbot-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const input = document.getElementById('chatbot-input');
  const question = input.value;
  input.value = '';
  
  // Ajouter la question de l'utilisateur
  addChatMessage(question, 'user');
  
  // Obtenir et afficher la réponse
  const response = handleChatbotQuestion(question);
  setTimeout(() => addChatMessage(response, 'bot'), 500);
});

function addChatMessage(message, sender) {
  const messagesDiv = document.getElementById('chatbot-messages');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('chat-message', sender);
  messageDiv.textContent = message;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
</script>
</body>
  <script>
// Fonction pour afficher les sections (à ajouter à la fin du body)
function showSecretarySection(section) {
  // Masquer tous les contenus
  document.querySelectorAll('.secretary-content').forEach(el => {
    el.style.display = 'none';
  });
  
  // Désactiver tous les boutons
  document.querySelectorAll('.button-group .tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Afficher la section sélectionnée
  document.getElementById(section + '-section').style.display = 'block';
  
  // Activer le bouton cliqué
  event.target.classList.add('active');
}
</script>
</html>
