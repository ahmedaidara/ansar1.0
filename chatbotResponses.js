const chatbotResponses = [
  {
    keywords: ["institut", "almouyassar", "école", "ecole", "institution"],
    response: "L'Institut Coranique Al Mouyassar est un établissement d'enseignement religieux qui forme des Huffaz (mémorisateurs du Coran). Il organise chaque année une cérémonie de remise des diplômes."
  },
  {
    keywords: ["cérémonie", "remise", "diplôme", "diplome", "huffaz"],
    response: "La 12ème Cérémonie de Remise des Diplômes aux Huffaz aura lieu le 24 Août 2025 au Grand Théâtre National Doudou Ndiaye Rose de Dakar. Mise en place à 13h45."
  },
  {
    keywords: ["date", "quand", "jour"],
    response: "La prochaine cérémonie est prévue pour le dimanche 24 Août 2025."
  },
  {
    keywords: ["application", "app", "appli"],
    response: "L'application ANSAR ALMOUYASSAR permet aux membres de mieux gérer leurs données et de veiller au bon fonctionnement de l'association."
  },
  {
    keywords: ["lieu", "où", "ou", "localisation", "adresse"],
    response: "La cérémonie se tiendra au Grand Théâtre National Doudou Ndiaye Rose de Dakar."
  },
  {
    keywords: ["programme", "activités", "activites"],
    response: "Au programme : récitations du Saint Coran, prestations artistiques et présentation de projets."
  },
  {
    keywords: ["parrainage", "parrain"],
    response: "L'édition 2025 est placée sous le parrainage de hautes personnalités."
  },
  {
    keywords: ["hadith", "citation", "prophète", "prophete"],
    response: "Le Prophète (ﷺ) a dit : 'Les meilleurs d'entre vous sont ceux qui apprennent le Coran et l'enseignent.' (Boukhari)"
  },
  {
    keywords: ["récompense", "mérite", "merite"],
    response: "Le Prophète (ﷺ) a dit que le Jour de la Résurrection, le Hafiz portera une couronne de lumière et ses parents des habits d'une valeur inestimable."
  },
  {
    keywords: ["mémorisation", "hifz", "apprendre"],
    response: "La mémorisation du Coran est un noble accomplissement. 'Allah élève ceux qui ont cru parmi vous et ceux qui ont reçu le savoir, d'un degré.' (Coran 58:11)"
  },
  {
    keywords: ["verset", "coranique", "sourate"],
    response: "Allah dit : 'Allah est la Lumière des cieux et de la terre...' (Coran 24:35). Le Coran illumine le cœur et l'esprit."
  },
  {
    keywords: ["communauté", "jama'ah", "unité", "unite"],
    response: "Le Prophète (ﷺ) a dit : 'La main d'Allah est avec la communauté (al-jama'ah).' (Tirmidhi)"
  },
  {
    keywords: ["joie", "bonheur", "sourire"],
    response: "'Dis : [Ceci provient] de la grâce d'Allah et de Sa miséricorde. Voilà de quoi ils devraient se réjouir.' (Coran 10:58)"
  },
  {
    keywords: ["enseignant", "professeur", "maître", "maitre"],
    response: "Le Prophète (ﷺ) a dit : 'Celui qui guide vers un bienfait a la même récompense que celui qui l'accomplit.' (Muslim)"
  },
  {
    keywords: ["tradition", "transmission", "héritage", "heritage"],
    response: "'Et suis le sentier de celui qui se tourne vers Moi.' (Coran 31:15). Nous perpétuons la transmission du savoir coranique."
  },
  {
    keywords: ["réussite", "succès", "succes", "victoire"],
    response: "'Et la victoire ne provient que d'Allah, le Puissant, le Sage.' (Coran 3:126)"
  },
  {
    keywords: ["invitation", "participer", "venir"],
    response: "Toute la communauté est invitée à célébrer nos Huffaz. 'Ordonne le convenable et interdit le blâmable.' (Coran 3:104)"
  },
  {
    keywords: ["réseaux", "social", "contact"],
    response: "Suivez-nous sur TikTok (@ansaralmouyassar), Instagram (@ansaralmouyassar), Snapchat (ansar102023) et YouTube (@almouyassartv)."
  },
  {
    keywords: ["lien", "site", "web"],
    response: "Visitez notre site web : https://ahmedaidara.github.io/ansar"
  },
  {
    keywords: ["politique", "confidentialité", "confidentialite"],
    response: "Consultez notre politique de confidentialité : https://ahmedaidara.github.io/ansar1.0/privacy-policy.html"
  },
  {
    keywords: ["aide", "assistance", "support"],
    response: "Pour toute assistance supplémentaire, veuillez contacter les membres du bureau via votre espace personnel ou les réseaux sociaux."
  },
  {
    keywords: ["motivation", "accueil"],
    response: "Le message sur la page d'accueil est géré par le secrétaire dans l'espace dédié."
  }
];

function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getChatbotResponse(message) {
  const lowerMessage = normalizeString(message.trim());

  const exactMatch = chatbotResponses.find(item =>
    item.keywords.some(keyword =>
      typeof keyword === "string" && normalizeString(keyword) === lowerMessage
    )
  );

  if (exactMatch) {
    return exactMatch.response;
  }

  const partialMatch = chatbotResponses.find(item =>
    item.keywords.some(keyword =>
      typeof keyword === "string" && lowerMessage.includes(normalizeString(keyword))
    )
  );

  return partialMatch
    ? partialMatch.response
    : "Désolé, je n'ai pas compris. Essayez des mots-clés comme 'institut', 'cérémonie', 'date', etc.";
}
