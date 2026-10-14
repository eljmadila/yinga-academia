"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { PlayCircle, FileText, ChevronLeft, ChevronRight, CheckCircle, ArrowLeft, Menu, X, Star } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { APITypes } from "plyr-react";
const Plyr: any = dynamic(() => import("plyr-react").then((mod: any) => mod.default || mod.Plyr || mod), { ssr: false });
import "plyr-react/plyr.css";
import LessonQA from "@/components/LessonQA";

export default function LessonRoom() {
  const t = useTranslations("student.classroom");
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonIdParam = params.lessonId as string;

  const [course, setCourse] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Progress states
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const playerRef = React.useRef<APITypes>(null);
  
  // Certificate states
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    async function fetchCourseData() {
      try {
        const [courseRes, progressRes] = await Promise.all([
          fetchApi(`/courses/${courseId}/`),
          fetchApi(`/progress/by_course/?course_id=${courseId}`)
        ]);

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          const completedIds = new Set<string>();
          progressData.forEach((p: any) => completedIds.add(p.lesson));
          setCompletedLessonIds(completedIds);
        }

        if (courseRes.ok) {
          const data = await courseRes.json();
          setCourse(data);

          // Aplatir toutes les leçons pour la navigation
          const lessonsList: any[] = [];
          if (data.modules) {
            data.modules.forEach((mod: any) => {
              if (mod.lessons) {
                mod.lessons.forEach((l: any) => {
                  lessonsList.push({ ...l, moduleId: mod.id, moduleTitle: mod.title });
                });
              }
            });
          }
          setAllLessons(lessonsList);

          // Si lessonId = 1 ou n'existe pas, prendre la première
          let targetLesson = lessonsList.find((l) => l.id === lessonIdParam);
          if (!targetLesson && lessonsList.length > 0) {
            targetLesson = lessonsList[0];
            router.replace(`/student/courses/${courseId}/lesson/${targetLesson.id}`);
          }
          setActiveLesson(targetLesson);
        }
      } catch (err) {
        console.error("Erreur de chargement", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourseData();
  }, [courseId, lessonIdParam, router]);

  const handleLessonChange = (newLessonId: string) => {
    router.push(`/student/courses/${courseId}/lesson/${newLessonId}`);
  };

  const handleMarkComplete = async (timecode: number = 0) => {
    if (!activeLesson || isMarkingComplete) return;
    setIsMarkingComplete(true);
    
    try {
      const res = await fetchApi(`/progress/update_progress/`, {
        method: 'POST',
        body: JSON.stringify({ 
          lesson_id: activeLesson.id,
          is_completed: true,
          current_timecode: timecode
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Ajouter à la liste locale
        setCompletedLessonIds(prev => {
          const newSet = new Set(prev);
          newSet.add(activeLesson.id);
          
          // Si le backend dit que c'est fini, ou si la taille locale correspond au total
          if (data.course_completed || newSet.size === allLessons.length) {
            setShowCertificateModal(true);
          } else if (data.progress_percentage >= 50 && !data.has_reviewed && !reviewSubmitted) {
            setShowReviewModal(true);
          } else {
            // Auto-play: Aller à la leçon suivante après 1 seconde
            const cIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
            if (cIndex >= 0 && cIndex < allLessons.length - 1) {
              const nLesson = allLessons[cIndex + 1];
              setTimeout(() => {
                handleLessonChange(nLesson.id);
              }, 1000);
            }
          }
          
          return newSet;
        });
      }
    } catch (err) {
      console.error("Erreur mark complete", err);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleTimeUpdate = async () => {
    if (!playerRef.current?.plyr || !activeLesson) return;
    const timecode = playerRef.current.plyr.currentTime;
    
    // Save progress periodically (every 10s roughly, handled by throttle or just on pause)
    // To keep it simple, we save on pause or just update state.
    // In production, we'd throttle API calls here.
  };

  const submitReview = async () => {
    if (rating === 0) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetchApi(`/reviews/`, {
        method: "POST",
        body: JSON.stringify({
          course: courseId,
          rating,
          comment
        })
      });
      if (res.ok) {
        setReviewSubmitted(true);
        setShowReviewModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const res = await fetchApi(`/enrollments/certificate/?course_id=${courseId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificat_${course?.title || 'Yinga'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Erreur téléchargement certificat");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-950 text-white">
        <h2 className="mb-4 text-2xl font-bold">Cours introuvable</h2>
        <Link href={`/student/dashboard`} className="text-brand-500 hover:underline">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  if (allLessons.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-950 text-white p-4 text-center">
        <FileText className="mb-4 h-16 w-16 text-gray-700" />
        <h2 className="mb-2 text-2xl font-bold">{t("emptyText")}</h2>
        <p className="mb-6 text-gray-400 max-w-md">Ce cours ne contient pas encore de leçons ou de vidéos. Elles seront ajoutées très prochainement.</p>
        <Link href={`/student/courses/${courseId}`} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600">
          Retour à la page du cours
        </Link>
      </div>
    );
  }

  if (!activeLesson) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-950 text-white">
        <h2 className="mb-4 text-2xl font-bold">Leçon introuvable</h2>
        <Link href={`/student/courses/${courseId}`} className="text-brand-500 hover:underline">
          {t("back")}
        </Link>
      </div>
    );
  }

  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  
  const courseIsFullyCompleted = completedLessonIds.size === allLessons.length && allLessons.length > 0;

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-gray-200">
      
      {/* Modal Certificat */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-gray-800 bg-gray-900 p-10 text-center shadow-2xl overflow-hidden">
            {/* Lueur d'arrière-plan */}
            <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-brand-500/20 blur-[80px]"></div>
            <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-yellow-500/20 blur-[80px]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/40">
                <span className="text-4xl">🎓</span>
              </div>
              <h2 className="mb-2 text-3xl font-extrabold text-white">{t("congratulations")}</h2>
              <p className="mb-8 text-gray-400">
                {t("certAvailable").replace("{title}", course.title)}
              </p>
              
              <button 
                onClick={handleDownloadCertificate}
                className="mb-8 block w-full rounded-xl bg-brand-500 px-6 py-4 font-bold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 hover:scale-[1.02]"
              >
                {t("downloadCert")}
              </button>
              
              {!reviewSubmitted ? (
                <div className="w-full rounded-xl bg-gray-800/50 p-6 border border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-2">{t("ratingTitle")}</h3>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        onClick={() => setRating(star)}
                        className={`text-3xl transition ${rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-600 hover:text-yellow-400/50'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea 
                    placeholder={t("ratingPlaceholder")} 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 mb-4 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
                    rows={2}
                  />
                  <button 
                    onClick={submitReview}
                    disabled={rating === 0 || isSubmittingReview}
                    className="w-full py-2.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition disabled:opacity-50"
                  >
                    {isSubmittingReview ? "Envoi..." : t("submitRating")}
                  </button>
                </div>
              ) : (
                <div className="w-full rounded-xl bg-green-500/10 border border-green-500/30 p-6 text-green-400">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-semibold">{t("thankYou")}</p>
                </div>
              )}

              <button 
                onClick={() => setShowCertificateModal(false)}
                className="text-sm text-gray-500 hover:text-white mt-6"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'Avis (Review) */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-gray-800 bg-gray-900 p-8 text-center shadow-2xl overflow-hidden">
            <button 
              onClick={() => {
                setShowReviewModal(false);
                // Si l'utilisateur ferme la modale, on passe à la leçon suivante
                const cIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
                if (cIndex >= 0 && cIndex < allLessons.length - 1) {
                  handleLessonChange(allLessons[cIndex + 1].id);
                }
              }}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-gray-400 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400">
                <Star className="h-8 w-8 fill-current" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-white">Vous aimez ce cours ?</h2>
              <p className="mb-6 text-gray-400 text-sm">
                Vous avez visionné la moitié du cours. Prenez un instant pour partager votre avis avec la communauté !
              </p>
              
              <div className="mb-6 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-600 hover:text-yellow-400/50'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Dites-nous ce que vous en pensez (optionnel)..."
                className="mb-6 w-full rounded-xl border border-gray-700 bg-gray-800 p-4 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                rows={3}
              />
              
              <button 
                onClick={submitReview}
                disabled={rating === 0 || isSubmittingReview}
                className="w-full rounded-xl bg-brand-500 px-6 py-3 font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
              >
                {isSubmittingReview ? t("submitting") : t("submitRating")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar Salle de classe */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-gray-900 px-4 z-20">
        <div className="flex items-center gap-4">
          <Link href={`/student/courses/${courseId}`} className="text-gray-400 hover:text-white transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white truncate max-w-[300px] lg:max-w-[500px]">{course.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Bouton pour ouvrir la sidebar sur mobile */}
          <button 
            className="lg:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Lecteur Vidéo (Centre) */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'lg:mr-80' : ''}`}>
          <div className="mx-auto w-full max-w-5xl">
            {/* Espace Video */}
            <div className="aspect-video w-full bg-black">
              {activeLesson.video_url ? (
                <div className="h-full w-full">
                  <Plyr
                    ref={playerRef}
                    source={{
                      type: 'video',
                      sources: [
                        {
                          src: activeLesson.video_url,
                          provider: activeLesson.video_url.includes('youtube') ? 'youtube' : undefined,
                        }
                      ]
                    }}
                    options={{
                      autoplay: false,
                      controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen'],
                      settings: ['quality', 'speed'],
                      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
                    }}
                    onEnded={() => handleMarkComplete(playerRef.current?.plyr.currentTime)}
                  />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center border border-gray-800 bg-gray-900">
                  <PlayCircle className="mb-4 h-16 w-16 text-gray-600" />
                  <p className="text-gray-400">{t("noVideo")}</p>
                </div>
              )}
            </div>

            {/* Informations sous la vidéo */}
            <div className="p-6 md:p-10">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-6">
                <div>
                  <p className="mb-1 text-sm text-brand-500 font-medium">{activeLesson.moduleTitle}</p>
                  <h2 className="text-2xl font-bold text-white">{activeLesson.title}</h2>
                </div>
                
                {/* Bouton de complétion */}
                <button 
                  onClick={() => handleMarkComplete()}
                  disabled={isMarkingComplete || completedLessonIds.has(activeLesson.id)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                    completedLessonIds.has(activeLesson.id)
                      ? 'border-green-500/50 bg-green-500/10 text-green-500 cursor-default'
                      : 'border-brand-500 bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white'
                  }`}
                >
                  <CheckCircle className={`h-5 w-5 ${completedLessonIds.has(activeLesson.id) ? 'fill-current' : ''}`} />
                  {completedLessonIds.has(activeLesson.id) ? 'Terminé' : '{t("markComplete")}'}
                </button>
              </div>

              {/* Description / Contenu texte */}
              {activeLesson.content && (
                <div className="prose prose-invert max-w-none text-gray-300">
                  <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                </div>
              )}

              {/* QA Section */}
              <LessonQA lessonId={activeLesson.id} />

              {/* Navigation des leçons */}
              <div className="mt-12 flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                {prevLesson ? (
                  <button 
                    onClick={() => handleLessonChange(prevLesson.id)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="hidden sm:inline">{t("prev")}</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {nextLesson ? (
                  <button 
                    onClick={() => handleLessonChange(nextLesson.id)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white"
                  >
                    <span className="hidden sm:inline">{t("next")}</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                ) : courseIsFullyCompleted ? (
                  <button 
                    onClick={handleDownloadCertificate}
                    className="text-sm font-semibold text-yellow-500 hover:underline flex items-center gap-2"
                  >
                    <span>🎓 {t("getCertificate")}</span>
                  </button>
                ) : (
                  <Link href={`/student/courses/${courseId}`} className="text-sm font-semibold text-brand-500 hover:underline">
                    Terminer le cours
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar Programme (Droite) */}
        <aside 
          className={`absolute inset-y-0 right-0 z-10 w-80 transform border-l border-gray-800 bg-gray-900 transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-800 p-4">
              <h3 className="font-bold text-white">Contenu du cours</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {course.modules?.map((module: any, mIdx: number) => (
                <div key={module.id} className="mb-6 last:mb-0">
                  <h4 className="mb-3 text-sm font-bold text-gray-400">
                    Section {mIdx + 1}: {module.title}
                  </h4>
                  <div className="flex flex-col gap-1">
                    {module.lessons?.map((lesson: any, lIdx: number) => {
                      const isActive = activeLesson?.id === lesson.id;
                      const isCompleted = completedLessonIds.has(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonChange(lesson.id)}
                          className={`flex items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                            isActive 
                              ? 'bg-brand-500/10 text-brand-400' 
                              : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0 relative">
                            {lesson.video_url || lesson.video_media?.length > 0 ? (
                              <PlayCircle className={`h-4 w-4 ${isActive ? 'text-brand-500' : 'text-gray-500'}`} />
                            ) : (
                              <FileText className={`h-4 w-4 ${isActive ? 'text-brand-500' : 'text-gray-500'}`} />
                            )}
                            {isCompleted && (
                              <div className="absolute -bottom-1 -right-1 rounded-full bg-gray-900">
                                <CheckCircle className="h-3 w-3 text-green-500 fill-current" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium">{lIdx + 1}. {lesson.title}</span>
                            <div className="mt-1 text-xs opacity-60">
                              {lesson.duration_minutes ? `${lesson.duration_minutes} min` : "Lecture"}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
