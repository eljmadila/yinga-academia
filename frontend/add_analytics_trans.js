const fs = require('fs');

const enPath = 'src/messages/en.json';
const frPath = 'src/messages/fr.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

en.instructor.analytics = {
  "loading": "Loading analytics...",
  "title": "Instructor analytics",
  "description": "Review course performance, learner activity, and revenue generated from your published courses.",
  "filterByDate": "Filter by date",
  "requestPayout": "Request payout",
  "availableBalance": "Available balance",
  "totalRevenue": "Total revenue",
  "pendingPayouts": "Pending payouts",
  "learnersEnrolled": "Learners enrolled",
  "recentTransactions": "Recent transactions",
  "recentTransactionsDesc": "Enrollment payments and course purchases from your students",
  "exportCsv": "Export CSV",
  "table": {
    "transactionId": "Transaction ID",
    "studentCourse": "Student & course",
    "amount": "Amount",
    "method": "Method",
    "date": "Date",
    "status": "Status"
  },
  "viewFullHistory": "View full history"
};

fr.instructor.analytics = {
  "loading": "Chargement des statistiques...",
  "title": "Statistiques formateur",
  "description": "Examinez les performances de vos cours, l'activité des apprenants et les revenus générés.",
  "filterByDate": "Filtrer par date",
  "requestPayout": "Demander un retrait",
  "availableBalance": "Solde disponible",
  "totalRevenue": "Revenu total",
  "pendingPayouts": "Retraits en attente",
  "learnersEnrolled": "Apprenants inscrits",
  "recentTransactions": "Transactions récentes",
  "recentTransactionsDesc": "Paiements d'inscription et achats de vos étudiants",
  "exportCsv": "Exporter CSV",
  "table": {
    "transactionId": "ID Transaction",
    "studentCourse": "Étudiant & cours",
    "amount": "Montant",
    "method": "Méthode",
    "date": "Date",
    "status": "Statut"
  },
  "viewFullHistory": "Voir l'historique complet"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(frPath, JSON.stringify(fr, null, 2));

console.log("Translations added.");
