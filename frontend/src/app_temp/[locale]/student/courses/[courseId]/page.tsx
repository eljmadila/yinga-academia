"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Award, Star, Clock, Globe, ChevronDown, ChevronUp, PlayCircle, FileText, CheckCircle, ArrowLeft, Users, Video, CheckSquare, PhoneCall, ClipboardList, Heart, X } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const Plyr: any = dynamic(() => import("plyr-react").then((mod: any) => mod.default || mod.Plyr || mod), { ssr: false });
import "plyr-react/plyr.css";

export default function CourseDetails() {
  const t = useTranslations("student.course");
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ text: "", isError: false });

  useEffect(() => {
    async function loadData() {
      try {
        const [courseRes, reviewsRes] = await Promise.all([
          fetchApi(`/courses/${courseId}/`),
          fetchApi(`/reviews/?course_id=${courseId}`)
        ]);

        if (courseRes.ok) {
          const data = await courseRes.json();
          setCourse(data);
          setIsFavorite(data.is_favorite || false);
          if (data.modules && data.modules.length > 0) {
            setOpenModule(data.modules[0].id);
          }
        }
        
        if (reviewsRes.ok) {
          const revData = await reviewsRes.json();
          setReviews(Array.isArray(revData) ? revData : revData.results || []);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [courseId]);

  const toggleModule = (id: string) => {
    setOpenModule(openModule === id ? null : id);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setReviewMsg({ text: "", isError: false });
    
    try {
      const res = await fetchApi("/reviews/", {
        method: "POST",
        body: JSON.stringify({
          course: courseId,
          rating,
          comment
        })
      });
      
      if (res.ok) {
        setReviewMsg({ text: "Merci pour votre avis !", isError: false });
        setComment("");
        setRating(5);
        
        // Recharge les avis
        const revRes = await fetchApi(`/reviews/?course_id=${courseId}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(Array.isArray(revData) ? revData : revData.results || []);
        }
      } else {
        const errData = await res.json();
        let errorMsg = "Vous devez être inscrit pour laisser un avis.";
        if (Array.isArray(errData) && typeof errData[0] === 'string') errorMsg = errData[0];
        else if (errData.detail) errorMsg = errData.detail;
        else if (errData.non_field_errors) errorMsg = errData.non_field_errors[0];
        else if (typeof errData === 'object' && Object.values(errData)[0]) {
           const val: any = Object.values(errData)[0];
           errorMsg = Array.isArray(val) ? val[0] : val;
        }
        
        setReviewMsg({ text: errorMsg, isError: true });
      }
    } catch (err) {
      setReviewMsg({ text: "Une erreur est survenue lors de l'envoi de votre avis.", isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError("");
    try {
      const res = await fetchApi('/payments/create-checkout-session/', {
        method: 'POST',
        body: JSON.stringify({ course_id: courseId }),
      });
      if (res.ok) {
        const data = await res.json();
        // Rediriger vers Stripe
        window.location.href = data.url;
      } else {
        const data = await res.json();
        setCheckoutError(data.error || "Une erreur est survenue lors de l'achat.");
      }
    } catch (err) {
      setCheckoutError("Erreur de connexion au serveur.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true);
    try {
      const res = await fetchApi(`/courses/${courseId}/toggle_favorite/`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.is_favorite);
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-gray-500">Chargement du cours...</div>;
  }

  if (!course) {
    return (
      <div className="py-20 text-center text-gray-500">
        <h2>Cours introuvable</h2>
        <Link href="/student/catalog" className="mt-4 text-brand-500 hover:underline">{t("backToCatalog")}</Link>
      </div>
    );
  }

  // Calculer la durée totale approximative
  const totalMinutes = course.modules?.reduce((acc: number, mod: any) => {
    return acc + (mod.lessons?.reduce((lAcc: number, l: any) => lAcc + (l.duration_minutes || 0), 0) || 0);
  }, 0) || 0;
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src={course.thumbnail || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80"} 
            alt={course.title} 
            className="h-full w-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
        </div>
        
        {/* Play Trailer Button (Center of Banner) */}
        {course.trailer_url && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <button 
              onClick={() => setShowTrailer(true)}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/90 text-white shadow-[0_0_40px_rgba(var(--brand-500-rgb),0.6)] backdrop-blur-md transition-transform hover:scale-110 hover:bg-brand-500"
            >
              <PlayCircle className="h-10 w-10 fill-white text-brand-500" />
            </button>
            <p className="mt-4 text-center font-semibold text-white text-shadow-sm">Bande annonce</p>
          </div>
        )}
        
        <div className="relative z-10 grid grid-cols-1 gap-8 p-8 md:grid-cols-12 md:p-12 lg:p-16">
          <div className="md:col-span-8 lg:col-span-7">
            <span className="mb-4 inline-block rounded-full bg-brand-500/20 px-3 py-1 text-sm font-semibold text-brand-300">
              {course.category || "Général"}
            </span>
            <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              {course.title}
            </h1>
            <p className="mb-6 text-lg text-gray-300">
              {course.description || "Maîtrisez ce sujet et développez vos compétences avec ce cours détaillé."}
            </p>
            
            <div className="mb-8 flex flex-wrap items-center gap-6 text-sm text-gray-300">
              <span className="flex items-center gap-2 text-yellow-400">
                <Star className={`h-5 w-5 ${course.average_rating > 0 ? 'fill-current' : 'text-gray-400 opacity-50'}`} />
                {course.average_rating > 0 ? (
                  <>
                    <span className="font-bold text-white">{course.average_rating}</span> 
                    <span className="text-gray-300">({course.reviews_count || 0} avis)</span>
                  </>
                ) : (
                  <span className="text-gray-300">Nouveau</span>
                )}
                <span className="ml-2 border-l border-gray-600 pl-4 text-gray-300">{course.enrollments_count || 0} inscrits</span>
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {totalMinutes > 0 ? durationText : "N/A"} de vidéo
              </span>
              <span className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Français
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              {checkoutError && (
                <div className="rounded-lg bg-red-500/20 p-3 text-sm text-red-200">
                  {checkoutError}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-4">
                {course.is_enrolled ? (
                  <Link 
                    href={`/student/courses/${course.id}/lesson/1`}
                    className="rounded-lg bg-brand-500 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-600 flex items-center justify-center"
                  >
                    {t("continueCourse")}
                  </Link>
                ) : (
                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="rounded-lg bg-brand-500 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut ? t("processing") : course.price > 0 ? `${t("enrollNow")} ${course.price} €` : t("freeEnroll")}
                  </button>
                )}
                <button 
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite}
                  className={`flex items-center gap-2 rounded-lg border px-8 py-3.5 text-base font-semibold transition-colors ${
                    isFavorite 
                      ? 'border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                      : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-10 lg:col-span-2">
          
          {/* Objectifs */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">{t("objectives")}</h2>
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-white/[0.02] sm:grid-cols-2">
              {course.learning_objectives && course.learning_objectives.length > 0 ? (
                course.learning_objectives.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-gray-500 italic">
                  {t('noObjectives')}
                </div>
              )}
            </div>
          </section>

          {/* Sommaire du cours (Syllabus) */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">{t("syllabus")}</h2>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              {course.modules && course.modules.length > 0 ? (
                course.modules.map((module: any) => (
                  <div 
                    key={module.id} 
                    className={`border-b border-gray-100 last:border-0 dark:border-gray-800`}
                  >
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="flex w-full items-center justify-between bg-gray-50/50 p-5 text-left transition-colors hover:bg-gray-50 dark:bg-transparent dark:hover:bg-white/[0.02]"
                    >
                      <span className="font-semibold text-gray-800 dark:text-white/90">{module.title}</span>
                      {openModule === module.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    
                    {openModule === module.id && (
                      <div className="bg-white p-2 dark:bg-transparent">
                        {module.lessons && module.lessons.length > 0 ? (
                          module.lessons.map((lesson: any) => (
                            <div 
                              key={lesson.id}
                              className="flex items-center justify-between rounded-lg p-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.02]"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.video_url || lesson.video_media ? (
                                  <PlayCircle className="h-4 w-4 text-brand-500" />
                                ) : (
                                  <FileText className="h-4 w-4 text-blue-500" />
                                )}
                                <span>{lesson.title}</span>
                              </div>
                              <span className="text-gray-400">
                                {lesson.duration_minutes ? `${lesson.duration_minutes} min` : "N/A"}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-gray-400 italic">Aucune leçon dans ce module.</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">Ce cours n'a pas encore de programme défini.</div>
              )}
            </div>
          </section>

          {/* Section Avis / Reviews */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">Avis des étudiants</h2>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              
              {/* Formulaire d'avis */}
              <div className="mb-8 rounded-xl bg-gray-50 p-5 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800">
                <h3 className="mb-3 font-semibold text-gray-800 dark:text-white/90">Laissez un avis</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Note (sur 5)</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          type="button" 
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star className={`h-6 w-6 transition-colors ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-700 hover:text-yellow-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Commentaire</label>
                    <textarea 
                      required
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Partagez votre expérience avec ce cours..."
                      className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-black/20 dark:text-white"
                    ></textarea>
                  </div>
                  
                  {reviewMsg.text && (
                    <div className={`rounded-lg p-3 text-sm font-medium ${reviewMsg.isError ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
                      {reviewMsg.text}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                  >
                    {submitting ? "Envoi..." : "Publier l'avis"}
                  </button>
                </form>
              </div>

              {/* Liste des avis */}
              {reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review: any, idx: number) => (
                    <div key={idx} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
                            {review.student_name ? review.student_name.charAt(0).toUpperCase() : "A"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white/90">{review.student_name || "Anonyme"}</p>
                            <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString("fr-FR") || "Récemment"}</p>
                          </div>
                        </div>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < (review.rating || 5) ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Star className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">Aucun avis pour le moment</h3>
                  <p className="text-gray-500 max-w-sm mt-1">Soyez le premier à partager votre expérience sur ce cours après l'avoir suivi.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructeur */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white/90">Votre formateur</h3>
            <div className="flex items-center gap-4 mb-4">
              {course.instructor?.avatar ? (
                <img 
                  src={course.instructor.avatar} 
                  alt={t("instructor")} 
                  className="h-16 w-16 rounded-full object-cover border-2 border-brand-100"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-600 border-2 border-brand-100 dark:bg-brand-500/20 dark:text-brand-300">
                  {course.instructor?.first_name 
                    ? course.instructor.first_name.charAt(0).toUpperCase() 
                    : (course.instructor?.email ? course.instructor.email.charAt(0).toUpperCase() : "F")}
                </div>
              )}
              <div>
                <h4 className="font-bold text-gray-800 dark:text-white/90">
                  {course.instructor?.first_name || course.instructor?.last_name 
                    ? `${course.instructor.first_name || ""} ${course.instructor.last_name || ""}`.trim() 
                    : (course.instructor?.email?.split('@')[0] || t("instructor"))}
                </h4>
                <p className="text-sm text-gray-500">{course.instructor?.title || "Expert en la matière"}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              {course.instructor?.bio || `${t("instructor")} passionné prêt à vous transmettre tout son savoir-faire et son expérience pour vous aider à atteindre vos objectifs.`}
            </p>
            <a href={`/student/instructors/${course.instructor?.id || '#'}`} className="block w-full text-center rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Voir le profil
            </a>
          </div>
          
          {/* Card Info Supplémentaires */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white/90">{t("includes")} :</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-3">
                <PlayCircle className="h-5 w-5 text-gray-400 shrink-0" /> {totalMinutes > 0 ? durationText : "Vidéos à la demande"}
              </li>
              {course.course_includes && course.course_includes.length > 0 ? (
                course.course_includes.map((key: string, idx: number) => {
                  const featuresMap: Record<string, { icon: any, text: string }> = {
                    'LIFETIME_ACCESS': { icon: Globe, text: "Accès illimité à vie" },
                    'CERTIFICATE': { icon: Award, text: "Certificat de fin de cours" },
                    'DOWNLOADABLE_RESOURCES': { icon: FileText, text: "Ressources téléchargeables" },
                    'COMMUNITY_SUPPORT': { icon: Users, text: "Accès à la communauté privée" },
                    'LIVE_QA': { icon: Video, text: "Sessions de Q&A en direct" },
                    'PROJECT_REVIEW': { icon: CheckSquare, text: "Correction de projets" },
                    'ONE_ON_ONE': { icon: PhoneCall, text: "Mentorat 1-on-1" },
                    'QUIZZES': { icon: ClipboardList, text: "Quizz et exercices pratiques" }
                  };
                  const feature = featuresMap[key];
                  
                  if (!feature) return null;
                  const Icon = feature.icon;
                  return (
                    <li key={idx} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-400 shrink-0" /> {feature.text}
                    </li>
                  );
                })
              ) : (
                <>
                  <li className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400 shrink-0" /> Ressources téléchargeables
                  </li>
                  <li className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-400 shrink-0" /> Accès illimité à vie
                  </li>
                  <li className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-gray-400 shrink-0" /> Certificat de fin de cours
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
      {/* Trailer Modal */}
      {showTrailer && course.trailer_url && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-12">
          <button 
            onClick={() => setShowTrailer(false)}
            className="absolute top-6 right-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl">
            <Plyr
              source={{
                type: "video",
                sources: [
                  { src: course.trailer_url, provider: "html5" }
                ]
              }}
              options={{ autoplay: true }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
