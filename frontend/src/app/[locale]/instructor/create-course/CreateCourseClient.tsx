"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  Settings,
  Video,
  CheckCircle2,
  ChevronRight,
  UploadCloud,
  PlusCircle,
  Trash2,
  Film,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { resolveApiUrl } from "@/lib/api";

const MAX_FILE_MB = 5;
const TOTAL_STEPS = 4;

export type LessonState = {
  id: string;
  title: string;
  file?: File;
};

export type ModuleState = {
  id: string;
  title: string;
  lessons: LessonState[];
};

export default function CreateCourseClient({ token }: { token: string | undefined }) {
  const locale = useLocale();
  const isFrench = locale === "fr";
  const router = useRouter();

  const STEPS = [
    {
      icon: FileText,
      label: isFrench ? "Infos" : "Basic Info",
      step: 1,
      title: isFrench ? "Informations de base" : "Basic Information",
    },
    {
      icon: Video,
      label: isFrench ? "Programme" : "Curriculum",
      step: 2,
      title: isFrench ? "Programme du cours" : "Curriculum",
    },
    {
      icon: Settings,
      label: isFrench ? "Paramètres" : "Settings",
      step: 3,
      title: isFrench ? "Paramètres du cours" : "Settings",
    },
    {
      icon: CheckCircle2,
      label: isFrench ? "Publier" : "Publish",
      step: 4,
      title: isFrench ? "Publication" : "Publish",
    },
  ];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    language: isFrench ? "fr" : "en",
    level: "BEGINNER",
    price: "0",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [validationError, setValidationError] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Image upload state
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Curriculum Builder state
  const [modules, setModules] = useState<ModuleState[]>([]);

  // Clear toast timer on unmount / when a new toast replaces the old one
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "title" && value.length > 0) {
      setValidationError(false);
    }
  };

  // Block moving past step 1 without a title
  const goToStep = (target: number) => {
    if (target > 1 && !formData.title.trim()) {
      setCurrentStep(1);
      setValidationError(true);
      showToast(isFrench ? "Le titre de la formation est obligatoire" : "Course Title is required", "error");
      return;
    }
    setCurrentStep(Math.min(Math.max(target, 1), TOTAL_STEPS));
  };

  const parseError = async (res: Response): Promise<string> => {
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") return data.detail;
      // DRF field errors: { title: ["This field is required."] }
      const first = Object.entries(data ?? {})[0];
      if (first) {
        const [field, msg] = first;
        return `${field}: ${Array.isArray(msg) ? msg[0] : String(msg)}`;
      }
    } catch {
      /* response was not JSON */
    }
    return isFrench ? "Échec de l'enregistrement de la formation" : "Failed to save course";
  };

  const submitCourse = async (isDraft: boolean) => {
    if (!formData.title.trim()) {
      setCurrentStep(1);
      setValidationError(true);
      showToast(isFrench ? "Le titre de la formation est obligatoire" : "Course Title is required", "error");
      return;
    }

    if (isDraft) setIsDrafting(true);
    else setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("description", formData.description);
      payload.append("category", formData.category);
      payload.append("language", formData.language);
      payload.append("level", formData.level);
      payload.append("price", formData.price);
      payload.append("status", isDraft ? "DRAFT" : "PUBLISHED");
      payload.append("is_published", isDraft ? "false" : "true");
      if (selectedFile) {
        payload.append("thumbnail", selectedFile);
      }
      
      // Pass curriculum data to backend. Note: Actual nested file uploads for videos
      // require a chunked upload approach on the backend. Here we pass the text metadata.
      const modulesPayload = modules.map(m => ({
        title: m.title,
        lessons: m.lessons.map(l => ({ title: l.title }))
      }));
      payload.append("modules_json", JSON.stringify(modulesPayload));

      // Do not set Content-Type: the browser adds the multipart boundary
      const res = await fetch(resolveApiUrl('/courses/'), {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
      });

      if (res.ok) {
        showToast(
          isFrench
            ? `Formation ${isDraft ? "enregistrée en brouillon" : "créée"} avec succès !`
            : `Course ${isDraft ? "saved as draft" : "created"} successfully!`,
          "success"
        );
        setTimeout(() => {
          router.push("/instructor/my-courses");
          router.refresh();
        }, 1000);
      } else {
        showToast(await parseError(res), "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : (isFrench ? "Une erreur est survenue" : "An error occurred"), "error");
    } finally {
      setIsSubmitting(false);
      setIsDrafting(false);
    }
  };

  const acceptFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast(isFrench ? "Veuillez choisir un fichier image" : "Please choose an image file", "error");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      showToast(isFrench ? `L'image doit être inférieure à ${MAX_FILE_MB} Mo` : `Image must be smaller than ${MAX_FILE_MB} MB`, "error");
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0]);
  };

  // Curriculum functions
  const addModule = () => {
    setModules([...modules, { id: Date.now().toString(), title: `Module ${modules.length + 1}`, lessons: [] }]);
  };

  const updateModuleTitle = (moduleId: string, newTitle: string) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, title: newTitle } : m));
  };

  const deleteModule = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const addLesson = (moduleId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: [...m.lessons, { id: Date.now().toString(), title: `Lesson ${m.lessons.length + 1}` }]
        };
      }
      return m;
    }));
  };

  const updateLessonTitle = (moduleId: string, lessonId: string, newTitle: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.map(l => l.id === lessonId ? { ...l, title: newTitle } : l)
        };
      }
      return m;
    }));
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.filter(l => l.id !== lessonId)
        };
      }
      return m;
    }));
  };

  const handleLessonFile = (moduleId: string, lessonId: string, file: File | undefined) => {
    if (!file) return;
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.map(l => l.id === lessonId ? { ...l, file } : l)
        };
      }
      return m;
    }));
  };

  const busy = isSubmitting || isDrafting;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/instructor/my-courses"
            className="p-2 -ml-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg transition-colors"
            aria-label={isFrench ? "Retour à mes formations" : "Back to my courses"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isFrench ? "Créer une nouvelle formation" : "Create New Course"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isFrench
                ? `Étape ${currentStep} sur ${TOTAL_STEPS} : ${STEPS[currentStep - 1].title}`
                : `Step ${currentStep} of ${TOTAL_STEPS}: ${STEPS[currentStep - 1].title}`}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={() => goToStep(currentStep - 1)}
              disabled={busy}
              className="px-5 py-2.5 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {isFrench ? "Retour" : "Back"}
            </button>
          )}
          <button
            onClick={() => submitCourse(true)}
            disabled={busy}
            className={`px-5 py-2.5 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${isDrafting ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isDrafting ? (isFrench ? "Enregistrement..." : "Saving...") : (isFrench ? "Enregistrer en brouillon" : "Save as Draft")}
          </button>
          <button
            onClick={() => {
              if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
              else submitCourse(false);
            }}
            disabled={busy}
            className={`px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isSubmitting
              ? (isFrench ? "Publication..." : "Submitting...")
              : currentStep === TOTAL_STEPS
              ? (isFrench ? "Publier la formation" : "Publish Course")
              : (isFrench ? "Étape suivante" : "Next Step")}
            {currentStep < TOTAL_STEPS && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${toast ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`}
      >
        {toast && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between relative before:absolute before:top-1/2 before:-translate-y-1/2 before:left-0 before:right-0 before:h-0.5 before:bg-gray-200 dark:before:bg-gray-700 before:-z-10 z-0">
        {STEPS.map((item) => {
          const isActive = currentStep === item.step;
          const isPassed = currentStep > item.step;
          return (
            <button
              type="button"
              key={item.step}
              className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-900 px-2 cursor-pointer"
              onClick={() => goToStep(item.step)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive || isPassed ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400" : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400"}`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold ${isActive || isPassed ? "text-brand-600 dark:text-brand-400" : "text-gray-500"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-sm">
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {isFrench ? "Informations de la formation" : "Course Information"}
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {isFrench ? "Titre de la formation" : "Course Title"} <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={60}
                  placeholder={isFrench ? "ex. Développeur React Complet en 2026" : "e.g. Complete React Developer in 2026"}
                  className={`w-full px-4 py-3 rounded-xl border bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${validationError ? "border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-900/10" : "border-gray-300 dark:border-gray-600 focus:ring-brand-500/20 focus:border-brand-500"}`}
                />
                <p className={`text-xs flex justify-between ${validationError ? "text-red-500 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                  <span>
                    {validationError
                      ? (isFrench ? "Le titre est requis pour continuer." : "Title is required to save or continue.")
                      : (isFrench ? "Un titre accrocheur aidera les étudiants à trouver votre cours." : "A catchy title will help students find your course.")}
                  </span>
                  <span>{formData.title.length} / 60</span>
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {isFrench ? "Description de la formation" : "Course Description"}
                </label>
                <textarea
                  id="description"
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={isFrench ? "Décrivez ce que les étudiants vont apprendre, les compétences visées..." : "Describe what students will learn, who this course is for, and why they should take it."}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {isFrench ? "Catégorie" : "Category"}
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                  >
                    <option value="">{isFrench ? "Sélectionner une catégorie" : "Select a category"}</option>
                    <option value="Development">{isFrench ? "Développement" : "Development"}</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="language" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {isFrench ? "Langue" : "Language"}
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                  >
                    <option value="en">{isFrench ? "Anglais" : "English"}</option>
                    <option value="fr">{isFrench ? "Français" : "French"}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {isFrench ? "Miniature de la formation" : "Course Thumbnail"}
                </span>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${isDragging ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 scale-[1.02]" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"} ${selectedFile ? "border-green-500 bg-green-50/50 dark:bg-green-900/10" : ""}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    aria-label={isFrench ? "Téléverser la miniature" : "Upload course thumbnail"}
                  />

                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${selectedFile ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400"}`}
                  >
                    {selectedFile ? <CheckCircle2 className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium mb-1">
                    {selectedFile
                      ? selectedFile.name
                      : isFrench
                      ? "Cliquez pour téléverser ou glissez-déposez"
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedFile
                      ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                      : `PNG, JPG, GIF ou SVG (max. ${MAX_FILE_MB} Mo)`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {isFrench ? "Programme du cours" : "Curriculum Builder"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {isFrench
                ? "Construisez votre formation en ajoutant des modules, des leçons et des fichiers."
                : "Start putting together your course by creating sections, lectures and practice."}
            </p>

            <div className="space-y-6">
              {modules.map((mod, modIdx) => (
                <div key={mod.id} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
                    <div className="flex-1 flex items-center gap-3">
                      <span className="font-semibold text-gray-900 dark:text-white shrink-0">
                        {isFrench ? `Module ${modIdx + 1} :` : `Module ${modIdx + 1}:`}
                      </span>
                      <input 
                        type="text" 
                        value={mod.title}
                        onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                        placeholder={isFrench ? "Titre du module" : "Enter module title"}
                        className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white"
                      />
                    </div>
                    <button 
                      onClick={() => deleteModule(mod.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title={isFrench ? "Supprimer le module" : "Delete Module"}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {mod.lessons.map((lesson, lessonIdx) => (
                      <div key={lesson.id} className="flex flex-col gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 shrink-0">
                            {isFrench ? `Leçon ${lessonIdx + 1} :` : `Lesson ${lessonIdx + 1}:`}
                          </span>
                          <input 
                            type="text" 
                            value={lesson.title}
                            onChange={(e) => updateLessonTitle(mod.id, lesson.id, e.target.value)}
                            placeholder={isFrench ? "Titre de la leçon" : "Enter lesson title"}
                            className="flex-1 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white"
                          />
                          <button 
                            onClick={() => deleteLesson(mod.id, lesson.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title={isFrench ? "Supprimer la leçon" : "Delete Lesson"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="pl-16">
                          <div className="flex items-center gap-4">
                            <label className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-colors ${lesson.file ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                              <Film className="w-4 h-4" />
                              {lesson.file ? lesson.file.name : (isFrench ? "Téléverser vidéo ou PDF" : "Upload Video or PDF")}
                              <input 
                                type="file" 
                                accept="video/*,.pdf" 
                                className="hidden"
                                onChange={(e) => handleLessonFile(mod.id, lesson.id, e.target.files?.[0])}
                              />
                            </label>
                            {lesson.file && (
                              <span className="text-xs text-gray-500">
                                {(lesson.file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => addLesson(mod.id)}
                      className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium py-2 px-3 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      {isFrench ? "Ajouter une leçon" : "Add Lesson"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={addModule}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              {isFrench ? "Ajouter un nouveau module" : "Add New Module"}
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {isFrench ? "Paramètres du cours" : "Course Settings"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {isFrench
                ? "Configurez le prix et le niveau d'expérience recommandé pour votre formation."
                : "Configure the price and difficulty level of your course."}
            </p>

            <div className="space-y-2">
              <label htmlFor="level" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {isFrench ? "Niveau d'expérience requis" : "Experience Level"}
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
              >
                <option value="BEGINNER">{isFrench ? "Débutant (Aucune expérience préalable)" : "Beginner (No prior experience)"}</option>
                <option value="INTERMEDIATE">{isFrench ? "Intermédiaire (Quelques connaissances)" : "Intermediate (Some experience)"}</option>
                <option value="ADVANCED">{isFrench ? "Avancé (Niveau expert)" : "Advanced (Expert level)"}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {isFrench ? "Prix de la formation ($)" : "Course Price ($)"}
              </label>
              <input
                id="price"
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isFrench ? "Indiquez 0 pour rendre la formation entièrement gratuite." : "Set to 0 to make the course free."}
              </p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {isFrench ? "Prêt à publier" : "Ready to Publish"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {isFrench
                ? "Vérifiez les détails de votre formation avant sa publication."
                : "Review your course details before publishing."}
            </p>
            <div className="bg-brand-50 dark:bg-brand-900/20 p-6 rounded-xl border border-brand-100 dark:border-brand-900/50">
              <div className="flex gap-4 items-start">
                <CheckCircle2 className="w-6 h-6 text-brand-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {isFrench ? "Vous y êtes presque !" : "You are almost there!"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {isFrench ? (
                      <>
                        En cliquant sur <strong>&quot;Publier la formation&quot;</strong> ci-dessous, votre cours sera mis en ligne et accessible aux étudiants. Assurez-vous que le titre et le contenu sont complets.
                      </>
                    ) : (
                      <>
                        By clicking <strong>&quot;Publish Course&quot;</strong> below, your course will be submitted for
                        review or immediately published. Make sure your title and descriptions are exactly how you want
                        them.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}