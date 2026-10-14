const fs = require('fs');
const path = require('path');

const frPath = path.join(__dirname, 'src/messages/fr.json');
const enPath = path.join(__dirname, 'src/messages/en.json');

const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Student Course
fr.student.course.loading = "Chargement du cours...";
en.student.course.loading = "Loading course...";
fr.student.course.notFound = "Cours introuvable";
en.student.course.notFound = "Course not found";
fr.student.course.trailer = "Bande annonce";
en.student.course.trailer = "Trailer";
fr.student.course.yourInstructor = "Votre formateur";
en.student.course.yourInstructor = "Your Instructor";
fr.student.course.addToFavorites = "Ajouter aux favoris";
en.student.course.addToFavorites = "Add to favorites";
fr.student.course.removeFromFavorites = "Retirer des favoris";
en.student.course.removeFromFavorites = "Remove from favorites";
fr.student.course.processing = "Traitement...";
en.student.course.processing = "Processing...";
fr.student.course.noObjectives = "Les objectifs d'apprentissage n'ont pas encore été définis pour ce cours.";
en.student.course.noObjectives = "Learning objectives have not been defined for this course yet.";
fr.student.course.noSyllabus = "Ce cours n'a pas encore de programme.";
en.student.course.noSyllabus = "This course does not have a syllabus yet.";
fr.student.course.noRequirements = "Aucun prérequis spécifique n'a été indiqué.";
en.student.course.noRequirements = "No specific requirements indicated.";
fr.student.course.reviews = "Avis";
en.student.course.reviews = "Reviews";
fr.student.course.noReviews = "Aucun avis pour le moment. Soyez le premier !";
en.student.course.noReviews = "No reviews yet. Be the first!";

// Student Classroom
fr.student.classroom.congratulations = "Félicitations !";
en.student.classroom.congratulations = "Congratulations!";
fr.student.classroom.certAvailable = "Vous avez officiellement terminé {title} à 100%. Votre certificat est maintenant disponible !";
en.student.classroom.certAvailable = "You have officially completed {title} at 100%. Your certificate is now available!";
fr.student.classroom.getCertificate = "Obtenir mon certificat";
en.student.classroom.getCertificate = "Get my certificate";
fr.student.classroom.noVideo = "Aucune vidéo disponible pour cette leçon";
en.student.classroom.noVideo = "No video available for this lesson";

// Student QA (LessonQA component)
fr.student.qa = {
  title: "Questions & Réponses",
  askQuestion: "Poser une nouvelle question",
  titlePlaceholder: "Titre de votre question...",
  bodyPlaceholder: "Décrivez votre problème en détail...",
  submit: "Publier la question",
  submitting: "Envoi...",
  loading: "Chargement...",
  empty: "Aucune question pour le moment. Soyez le premier à en poser une !",
  resolved: "Résolu",
  instructor: "Formateur",
  cancel: "Annuler",
  reply: "Répondre",
  replyPlaceholder: "Votre réponse..."
};
en.student.qa = {
  title: "Q&A",
  askQuestion: "Ask a new question",
  titlePlaceholder: "Title of your question...",
  bodyPlaceholder: "Describe your problem in detail...",
  submit: "Post question",
  submitting: "Submitting...",
  loading: "Loading...",
  empty: "No questions yet. Be the first to ask!",
  resolved: "Resolved",
  instructor: "Instructor",
  cancel: "Cancel",
  reply: "Reply",
  replyPlaceholder: "Your reply..."
};

// Instructor QA
fr.instructor = fr.instructor || {};
fr.instructor.qa = {
  title: "Questions des étudiants",
  subtitle: "Gérez les questions posées par les étudiants sur vos cours.",
  emptyTitle: "Aucune question",
  emptySubtitle: "Vos étudiants n'ont pas encore posé de questions sur vos cours.",
  lesson: "Leçon",
  markResolved: "Marquer résolu",
  resolved: "Résolu",
  you: "Vous",
  replyPlaceholder: "Écrivez votre réponse...",
  cancel: "Annuler",
  send: "Envoyer",
  replyToStudent: "Répondre à l'étudiant",
  loading: "Chargement des questions..."
};

en.instructor = en.instructor || {};
en.instructor.qa = {
  title: "Student Questions",
  subtitle: "Manage questions asked by students on your courses.",
  emptyTitle: "No questions",
  emptySubtitle: "Your students haven't asked any questions on your courses yet.",
  lesson: "Lesson",
  markResolved: "Mark resolved",
  resolved: "Resolved",
  you: "You",
  replyPlaceholder: "Write your reply...",
  cancel: "Cancel",
  send: "Send",
  replyToStudent: "Reply to student",
  loading: "Loading questions..."
};

fs.writeFileSync(frPath, JSON.stringify(fr, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
console.log('Translations updated successfully.');
