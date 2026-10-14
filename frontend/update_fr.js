const fs = require('fs');
const fr = JSON.parse(fs.readFileSync('src/messages/fr.json', 'utf8'));
fr.student = {
  catalog: {
    title: 'Catalogue des Cours',
    subtitle: 'Trouvez la formation parfaite pour atteindre vos objectifs.',
    searchPlaceholder: 'Rechercher un cours...',
    filters: 'Filtres',
    all: 'Tout',
    loading: 'Chargement du catalogue...',
    empty: 'Aucun cours publié pour le moment.',
    noMatch: 'Aucun cours ne correspond à votre recherche.',
    by: 'Par',
    new: 'Nouveau',
    free: 'Gratuit',
    viewCourse: 'Voir le cours'
  },
  course: {
    title: 'Cours',
    backToCatalog: 'Retour au catalogue',
    enrollments: 'étudiants',
    level: 'Niveau',
    lastUpdated: 'Dernière mise à jour',
    includes: 'Ce cours inclut',
    objectives: 'Ce que vous allez apprendre',
    syllabus: 'Programme du cours',
    requirements: 'Prérequis',
    modules: 'modules',
    lessons: 'leçons',
    description: 'Description',
    instructor: 'Formateur',
    enrollNow: 'Acheter pour',
    freeEnroll: 'S\'inscrire gratuitement',
    continueCourse: 'Continuer le cours'
  },
  classroom: {
    back: 'Retour au cours',
    next: 'Leçon suivante',
    prev: 'Leçon précédente',
    markComplete: 'Marquer comme terminé',
    completed: 'Terminé',
    downloadCert: 'Télécharger mon certificat',
    ratingTitle: 'Qu\'avez-vous pensé de ce cours ?',
    ratingPlaceholder: 'Laissez un petit commentaire (optionnel)...',
    submitRating: 'Envoyer mon avis',
    submitting: 'Envoi...',
    thankYou: 'Merci pour votre retour !',
    close: 'Fermer',
    emptyText: 'Le formateur prépare le contenu !',
    loading: 'Chargement de la salle de classe...'
  },
  myCourses: {
    title: 'Mes Apprentissages',
    subtitle: 'Reprenez là où vous vous êtes arrêté.',
    progress: 'Progression',
    resume: 'Reprendre'
  },
  settings: {
    title: 'Mon Profil',
    subtitle: 'Gérez vos informations personnelles et votre avatar.',
    avatar: 'Photo de profil',
    avatarHint: 'Recommandé : image carrée d\'au moins 300x300px.',
    changeAvatar: 'Changer d\'image',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Adresse Email (Lecture seule)',
    bio: 'Bio / Description',
    bioPlaceholder: 'Parlez-nous un peu de vous...',
    save: 'Enregistrer les modifications',
    saving: 'Enregistrement...',
    success: 'Profil mis à jour avec succès !',
    error: 'Erreur lors de la mise à jour du profil.'
  }
};
fs.writeFileSync('src/messages/fr.json', JSON.stringify(fr, null, 2));
