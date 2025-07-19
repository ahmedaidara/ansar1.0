const chatbotResponses = [
  { 
    keywords: ["association", "ansar", "almouyassar"], 
    response: "ANSAR ALMOUYASSAR est une association dédiée au développement communautaire et spirituel sous la direction de Mouhamed Niang." 
  },
  { 
    keywords: ["membre", "membres", "adhérent"], 
    response: "Pour voir la liste des membres, consultez la page 'Membres'. Seuls les noms et numéros de membre sont affichés publiquement." 
  },
  { 
    keywords: ["cotisation", "paiement", "payer"], 
    response: "La cotisation mensuelle est de 2000 FCFA. Vous pouvez payer via Wave ou Orange Money dans votre Espace Personnel." 
  },
  { 
    keywords: ["événement", "evenement", "activité", "activite"], 
    response: "Consultez les événements à venir dans la section 'Événements'. Les membres du bureau peuvent en ajouter dans l'Espace Secret." 
  },
  { 
    keywords: ["galerie", "photo", "vidéo", "video"], 
    response: "La galerie contient des photos et vidéos des événements. Accessible à tous dans la section 'Galerie'." 
  },
  { 
    keywords: ["espace personnel", "connexion", "login"], 
    response: "Connectez-vous à votre espace personnel avec votre numéro de membre (ex. : 001) et mot de passe (format JJMMAAAA)." 
  },
  { 
    keywords: ["espace secret", "admin", "administration"], 
    response: "L'Espace Secret est réservé aux membres du bureau. Utilisez un code comme ADMIN12301012000 pour y accéder." 
  },
  { 
    keywords: ["coran", "juz", "quran"], 
    response: "La section 'Coran' affiche les 30 Juz'. Utilisez la barre de recherche pour trouver un Juz spécifique." 
  },
  { 
    keywords: ["suggestion", "proposition", "idée", "idee"], 
    response: "Vous pouvez soumettre une suggestion dans votre Espace Personnel. Les membres du bureau peuvent les consulter dans l'Espace Secret." 
  },
  { 
    keywords: ["bibliothèque", "bibliotheque", "livre"], 
    response: "La bibliothèque contient des livres classés par catégories (Fiqh, Hadith, Langue, etc.). Accessible dans la section 'Bibliothèque'." 
  },
  { 
    keywords: ["ADMIN12301012000", "00000000", "11111111", "22222222"],
    response: "secret" // Mot-clé spécial pour afficher le champ de mot de passe
  }
];

function getChatbotResponse(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Vérifie d'abord les réponses exactes
  const exactMatch = chatbotResponses.find(item => 
    item.keywords.some(keyword => 
      typeof keyword === 'string' && keyword.toLowerCase() === lowerMessage
    )
  );
  
  if (exactMatch) {
    return exactMatch.response;
  }
  
  // Ensuite vérifie les contenus partiels
  const partialMatch = chatbotResponses.find(item => 
    item.keywords.some(keyword => 
      typeof keyword === 'string' && lowerMessage.includes(keyword.toLowerCase())
    )
  );
  
  return partialMatch ? partialMatch.response : "Désolé, je n'ai pas compris. Essayez des mots-clés comme 'association', 'membre', 'cotisation', etc.";
}
