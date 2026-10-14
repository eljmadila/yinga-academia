const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'frontend/src/messages/en.json');
const frPath = path.join(__dirname, 'frontend/src/messages/fr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

const instructorEn = {
  "myCourses": {
    "title": "My Courses",
    "description": "Manage your courses, view statistics, and create new content.",
    "createCourse": "Create a new course",
    "all": "All",
    "published": "Published",
    "drafts": "Drafts",
    "search": "Search...",
    "table": {
      "course": "Course",
      "status": "Status",
      "price": "Price",
      "enrolled": "Enrolled",
      "sales": "Sales",
      "actions": "Actions"
    },
    "loading": "Loading courses...",
    "noCourses": "No courses found.",
    "statusPublished": "Published",
    "statusDraft": "Draft",
    "unpublish": "Unpublish",
    "publish": "Publish",
    "confirmDelete": "Are you sure you want to delete this course?",
    "deleteError": "Error deleting course.",
    "networkError": "Network error.",
    "statusError": "Error changing status."
  },
  "settings": {
    "title": "Profile Settings",
    "description": "Manage your public and private information.",
    "personalInfo": "Personal Information",
    "firstName": "First Name",
    "lastName": "Last Name",
    "professionalTitle": "Professional Title",
    "bio": "Bio",
    "socialNetworks": "Social Networks",
    "website": "Website",
    "saveChanges": "Save changes",
    "saving": "Saving...",
    "profilePicture": "Profile Picture",
    "clickToChange": "Click to change",
    "updateSuccess": "Update successful!",
    "updateError": "Error updating profile.",
    "networkError": "Network error."
  },
  "payouts": {
    "title": "Payouts & Revenue",
    "description": "Manage your earnings, track your sales, and withdraw your money.",
    "availableBalance": "Available Balance",
    "pending": "Pending",
    "totalRevenue": "Total Revenue",
    "requestWithdrawal": "Request Withdrawal",
    "amountToWithdraw": "Amount to withdraw",
    "insufficientBalance": "Insufficient balance",
    "paymentMethod": "Payment Method",
    "bankAccount": "Bank Account",
    "mobileMoney": "Mobile Money",
    "confirmWithdrawal": "Confirm withdrawal",
    "processing": "Processing...",
    "withdrawalHistory": "Withdrawal History",
    "date": "Date",
    "amount": "Amount",
    "status": "Status"
  },
  "createCourse": {
    "title": "Course Creation",
    "courseTitle": "Course Title",
    "description": "Description",
    "price": "Price (€)",
    "category": "Category",
    "publishCourse": "Publish course",
    "save": "Save",
    "saving": "Saving...",
    "success": "Course saved successfully!",
    "error": "Error saving course."
  }
};

const instructorFr = {
  "myCourses": {
    "title": "Mes Cours",
    "description": "Gérez vos formations, consultez les statistiques et créez du nouveau contenu.",
    "createCourse": "Créer un nouveau cours",
    "all": "Tous",
    "published": "Publiés",
    "drafts": "Brouillons",
    "search": "Rechercher...",
    "table": {
      "course": "Cours",
      "status": "Statut",
      "price": "Prix",
      "enrolled": "Inscrits",
      "sales": "Ventes",
      "actions": "Actions"
    },
    "loading": "Chargement des cours...",
    "noCourses": "Aucun cours trouvé.",
    "statusPublished": "Publié",
    "statusDraft": "Brouillon",
    "unpublish": "Dépublier",
    "publish": "Publier",
    "confirmDelete": "Êtes-vous sûr de vouloir supprimer ce cours ?",
    "deleteError": "Erreur lors de la suppression du cours.",
    "networkError": "Erreur réseau.",
    "statusError": "Erreur lors du changement de statut."
  },
  "settings": {
    "title": "Paramètres du Profil",
    "description": "Gérez vos informations publiques et privées.",
    "personalInfo": "Informations Personnelles",
    "firstName": "Prénom",
    "lastName": "Nom",
    "professionalTitle": "Titre professionnel",
    "bio": "Bio",
    "socialNetworks": "Réseaux Sociaux",
    "website": "Site Web",
    "saveChanges": "Enregistrer les modifications",
    "saving": "Enregistrement...",
    "profilePicture": "Photo de profil",
    "clickToChange": "Cliquez pour changer",
    "updateSuccess": "Mise à jour réussie!",
    "updateError": "Erreur lors de la mise à jour.",
    "networkError": "Erreur réseau."
  },
  "payouts": {
    "title": "Paiements & Revenus",
    "description": "Gérez vos gains, suivez vos ventes et retirez votre argent.",
    "availableBalance": "Solde Disponible",
    "pending": "En attente",
    "totalRevenue": "Revenus Totaux",
    "requestWithdrawal": "Demander un retrait",
    "amountToWithdraw": "Montant à retirer",
    "insufficientBalance": "Solde insuffisant",
    "paymentMethod": "Méthode de paiement",
    "bankAccount": "Compte Bancaire",
    "mobileMoney": "Mobile Money",
    "confirmWithdrawal": "Confirmer le retrait",
    "processing": "Traitement...",
    "withdrawalHistory": "Historique des retraits",
    "date": "Date",
    "amount": "Montant",
    "status": "Statut"
  },
  "createCourse": {
    "title": "Création de Cours",
    "courseTitle": "Titre du cours",
    "description": "Description",
    "price": "Prix (€)",
    "category": "Catégorie",
    "publishCourse": "Publier le cours",
    "save": "Sauvegarder",
    "saving": "Enregistrement...",
    "success": "Cours sauvegardé avec succès!",
    "error": "Erreur lors de la sauvegarde."
  }
};

en.instructor = instructorEn;
fr.instructor = instructorFr;

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(frPath, JSON.stringify(fr, null, 2));

console.log("Updated translations!");
