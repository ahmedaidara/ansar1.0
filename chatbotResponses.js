function getChatbotResponse(message) {
  const responses = {
    'association': 'ANSAR ALMOUYASSAR œuvre pour le développement communautaire et spirituel sous la direction de Mouhamed Niang. Visitez la page d\'accueil pour en savoir plus.',
    'membre': 'Pour devenir membre, contactez un administrateur via l\'espace secret ou consultez l\'onglet "Ajouter un Membre".',
    'cotisation': 'Les cotisations sont gérées par le trésorier. Consultez l\'espace personnel ou trésorier pour plus de détails.',
    'événement': 'Les événements à venir sont listés dans l\'onglet "Événements". Vous pouvez aussi voir les comptes à rebours sur la page d\'accueil.',
    'galerie': 'La galerie contient des photos et vidéos des activités de l\'association. Accédez-y via l\'onglet "Galerie".',
    'coran': 'L\'onglet "Coran" vous permet d\'explorer les 30 Juz\' du Coran. Utilisez la barre de recherche pour trouver un Juz spécifique.',
    'bibliothèque': 'La bibliothèque propose des ressources éducatives et spirituelles. Consultez l\'onglet "Bibliothèque" pour plus d\'informations.',
    'suggestion': 'Vous pouvez soumettre vos suggestions dans l\'espace personnel après connexion. Les administrateurs les examineront.',
    'président': 'Notre président, Mouhamed Niang, guide l\'association. Contactez-le via l\'espace secret si vous avez les codes appropriés.',
    'trésorier': 'Le trésorier gère les finances et cotisations. Accédez à l\'espace trésorier avec les codes appropriés.',
    'secrétaire': 'Le secrétaire gère les documents internes. Accédez à l\'espace secrétaire via les codes secrets.',
    'admin': 'L\'espace secret est réservé aux administrateurs. Utilisez les codes appropriés pour y accéder.',
    'code': 'Si vous essayez d\'accéder à une section réservée, entrez un code secret valide (par exemple, PRESIDENT00 suivi d\'un second code).',
    'aide': 'Posez une question avec des mots-clés comme "association", "membre", "cotisation", "événement", etc., pour obtenir une réponse automatique.',
    'default': 'Désolé, je ne comprends pas votre demande. Essayez des mots-clés comme "association", "membre", "cotisation", "événement", ou "aide".'
  };
  const key = Object.keys(responses).find(k => message.toLowerCase().includes(k)) || 'default';
  return responses[key];
}
