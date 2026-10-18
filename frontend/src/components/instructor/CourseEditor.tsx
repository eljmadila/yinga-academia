"use client";

import React, { useState } from "react";
import { Check, Info, LayoutList, CheckCircle2, Upload, Plus, Trash2, GripVertical } from "lucide-react";
import { fetchApi } from "@/lib/api";
import VideoUploader from "@/components/instructor/VideoUploader";
import { useTranslations } from "next-intl";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { toast } from "sonner";

interface LessonType {
  id: string;
  title: string;
  order: number;
}
interface ModuleType {
  id: string;
  title: string;
  order: number;
  lessons: LessonType[];
}

const SortableLesson = ({ lesson, modIdx, handleUpdateLessonTitle, handleDeleteLesson, activeLessonUpload, setActiveLessonUpload, pendingUploadFile, onLessonVideoUploaded, t, isFrench }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `lesson-${lesson.id}` });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const hasVideo = Boolean(lesson.video_url || lesson.video_file || (lesson.video_media && lesson.video_media.length > 0));
  
  return (
    <div ref={setNodeRef} style={style} className="flex flex-col rounded-lg bg-white p-4 border border-gray-100 dark:bg-gray-900 dark:border-gray-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 w-full max-w-xs">
          <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600"><GripVertical className="h-4 w-4" /></button>
          <input 
            type="text" 
            value={lesson.title} 
            onChange={(e) => handleUpdateLessonTitle(lesson.id, modIdx, e.target.value, false)}
            onBlur={(e) => handleUpdateLessonTitle(lesson.id, modIdx, e.target.value, true)}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-transparent outline-none w-full focus:border-b focus:border-brand-500" 
          />
        </div>
        <div className="flex items-center gap-3">
          {hasVideo ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              {isFrench ? "Vidéo prête" : "Video attached"}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              {isFrench ? "Pas de vidéo" : "No video"}
            </span>
          )}
          <button 
            onClick={() => setActiveLessonUpload(activeLessonUpload === lesson.id ? null : lesson.id)} 
            className="text-brand-500 hover:text-brand-600 text-xs font-semibold"
          >
            {hasVideo ? (isFrench ? "Changer vidéo" : "Change video") : (isFrench ? "+ Ajouter vidéo" : "+ Add video")}
          </button>
          <button onClick={() => handleDeleteLesson(lesson.id, modIdx)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      
      {activeLessonUpload === lesson.id && (
        <div className="mt-2 animate-in fade-in zoom-in-95 duration-200">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">{t("testUpload")}</p>
          <VideoUploader 
            lessonId={lesson.id} 
            initialFile={pendingUploadFile}
            onUploadSuccess={(data) => {
              toast.success(t("uploadComplete") + ": " + (data.file_url || ""));
              if (onLessonVideoUploaded) {
                onLessonVideoUploaded(lesson.id, modIdx, data.file_url);
              }
              setActiveLessonUpload(null);
            }} 
          />
        </div>
      )}
    </div>
  );
};

const SortableModule = ({ mod, modIdx, handleUpdateModuleTitle, handleDeleteModule, handleAddLessonClick, handleUpdateLessonTitle, handleDeleteLesson, activeLessonUpload, setActiveLessonUpload, pendingUploadFile, onLessonVideoUploaded, t, isFrench }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `mod-${mod.id}` });
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600"><GripVertical className="h-5 w-5" /></button>
          <input 
            type="text" 
            value={mod.title} 
            onChange={(e) => handleUpdateModuleTitle(mod.id, modIdx, e.target.value, false)}
            onBlur={(e) => handleUpdateModuleTitle(mod.id, modIdx, e.target.value, true)}
            className="bg-transparent font-bold text-gray-800 dark:text-white outline-none border-b border-transparent focus:border-brand-500 w-full" 
          />
        </div>
        <button onClick={() => handleDeleteModule(mod.id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
      </div>
      
      <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
        <SortableContext items={(mod.lessons || []).map((l: any) => `lesson-${l.id}`)} strategy={verticalListSortingStrategy}>
          {(mod.lessons || []).map((lesson: any) => (
            <SortableLesson 
              key={lesson.id} 
              lesson={lesson} 
              modIdx={modIdx} 
              handleUpdateLessonTitle={handleUpdateLessonTitle} 
              handleDeleteLesson={handleDeleteLesson} 
              activeLessonUpload={activeLessonUpload} 
              setActiveLessonUpload={setActiveLessonUpload} 
              pendingUploadFile={activeLessonUpload === lesson.id ? pendingUploadFile : null}
              onLessonVideoUploaded={onLessonVideoUploaded}
              t={t} 
              isFrench={isFrench}
            />
          ))}
        </SortableContext>
        
        <button onClick={() => handleAddLessonClick(mod.id, modIdx)} className="flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 p-2">
          <Plus className="h-4 w-4" /> {t("addLesson")}
        </button>
      </div>
    </div>
  );
};

export default function CourseEditor({ courseIdProp }: { courseIdProp?: string | null }) {
  const t = useTranslations("CreateCourse");
  const locale = useLocale();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [level, setLevel] = useState("BEGINNER");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [courseId, setCourseId] = useState<string | null>(courseIdProp || null);
  
  const [modules, setModules] = useState<ModuleType[]>([]);
  const [activeLessonUpload, setActiveLessonUpload] = useState<string | null>(null);
  
  const [pendingLessonModule, setPendingLessonModule] = useState<{ id: string, index: number } | null>(null);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load existing course if present
  React.useEffect(() => {
    if (courseId) {
      fetchApi(`/courses/${courseId}/`)
        .then(res => {
          if (!res.ok) throw new Error("Course not found");
          return res.json();
        })
        .then(data => {
          if (data.title && !title) {
            setTitle(data.title);
            setCategory(data.category);
            setPrice(data.price?.toString() || "");
            setLevel(data.level);
            setDescription(data.description);
            if (data.thumbnail) setThumbnailPreview(data.thumbnail);
          }
          if (data.modules && Array.isArray(data.modules)) {
            setModules(data.modules);
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [courseId]);

  const handleLessonVideoUploaded = (lessonId: string, modIdx: number, videoUrl: string) => {
    setModules(prevMods => prevMods.map((m, mI) => mI === modIdx ? {
      ...m,
      lessons: (m.lessons || []).map((l: any) => l.id === lessonId ? { ...l, video_url: videoUrl, video_media: [{ video_url: videoUrl }] } : l)
    } : m));
  };

  const isFrench = locale === "fr";

  const handleAddModule = async () => {
    const modTitle = isFrench 
      ? `Module ${modules.length + 1}: Nouveau Module` 
      : `Module ${modules.length + 1}: New Module`;
    try {
      const res = await fetchApi('/modules/', {
        method: 'POST',
        body: JSON.stringify({ course: courseId, title: modTitle, order: modules.length })
      });
      if (res.ok) {
        const newMod = await res.json();
        setModules([...modules, { ...newMod, lessons: [] }]);
      } else {
        const errData = await res.text();
        toast.error((isFrench ? "Erreur création module: " : "Error creating module: ") + errData);
      }
    } catch (e) {
      toast.error((isFrench ? "Erreur réseau: " : "Network error: ") + String(e));
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm(isFrench ? "Supprimer ce module et toutes ses leçons ?" : "Delete this module and all its lessons?")) return;
    await fetchApi(`/modules/${moduleId}/`, { method: 'DELETE' });
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const handleUpdateModuleTitle = async (moduleId: string, modIdx: number, newTitle: string, isBlur: boolean) => {
    const newModules = [...modules];
    newModules[modIdx].title = newTitle;
    setModules(newModules);
    
    if (isBlur) {
      await fetchApi(`/modules/${moduleId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ title: newTitle })
      });
    }
  };

  const handleAddLessonClick = (moduleId: string, moduleIndex: number) => {
    setPendingLessonModule({ id: moduleId, index: moduleIndex });
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onLessonFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingLessonModule) return;
    
    const mod = modules[pendingLessonModule.index];
    const lessonsCount = mod.lessons ? mod.lessons.length : 0;
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    
    try {
      const res = await fetchApi('/lessons/', {
        method: 'POST',
        body: JSON.stringify({ 
          course: courseId, 
          module: pendingLessonModule.id, 
          title: baseName, 
          order: lessonsCount 
        })
      });
      if (res.ok) {
        const newLesson = await res.json();
        const newModules = [...modules];
        if (!newModules[pendingLessonModule.index].lessons) {
          newModules[pendingLessonModule.index].lessons = [];
        }
        newModules[pendingLessonModule.index].lessons.push(newLesson);
        setModules(newModules);
        
        // Open the uploader automatically for this lesson and pass the file
        setActiveLessonUpload(newLesson.id);
        setPendingUploadFile(file);
      } else {
        const errData = await res.text();
        toast.error((isFrench ? "Erreur création leçon: " : "Error creating lesson: ") + errData);
      }
    } catch (err) {
      toast.error((isFrench ? "Erreur réseau: " : "Network error: ") + String(err));
    }
    
    // Reset file input
    e.target.value = '';
    setPendingLessonModule(null);
  };

  const handleDeleteLesson = async (lessonId: string, moduleIndex: number) => {
    if (!confirm(isFrench ? "Supprimer cette leçon ?" : "Delete this lesson?")) return;
    await fetchApi(`/lessons/${lessonId}/`, { method: 'DELETE' });
    const newModules = [...modules];
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter(l => l.id !== lessonId);
    setModules(newModules);
  };

  const handleUpdateLessonTitle = async (lessonId: string, moduleIndex: number, newTitle: string, isBlur: boolean) => {
    const newModules = [...modules];
    const lessonIndex = newModules[moduleIndex].lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex > -1) {
      newModules[moduleIndex].lessons[lessonIndex].title = newTitle;
      setModules(newModules);
      if (isBlur) {
        await fetchApi(`/lessons/${lessonId}/`, {
          method: 'PATCH',
          body: JSON.stringify({ title: newTitle })
        });
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith('mod-') && overId.startsWith('mod-')) {
      const oldIndex = modules.findIndex(m => `mod-${m.id}` === activeId);
      const newIndex = modules.findIndex(m => `mod-${m.id}` === overId);
      const newModules = arrayMove(modules, oldIndex, newIndex);
      setModules(newModules);
      
      Promise.all(newModules.map((m, idx) => 
         fetchApi(`/modules/${m.id}/`, { method: 'PATCH', body: JSON.stringify({ order: idx }) })
      ));
    } else if (activeId.startsWith('lesson-') && overId.startsWith('lesson-')) {
      const modIndex = modules.findIndex(m => m.lessons?.some(l => `lesson-${l.id}` === activeId));
      if (modIndex === -1) return;
      
      const mod = modules[modIndex];
      const oldIndex = mod.lessons.findIndex(l => `lesson-${l.id}` === activeId);
      const newIndex = mod.lessons.findIndex(l => `lesson-${l.id}` === overId);
      
      const newModules = [...modules];
      newModules[modIndex].lessons = arrayMove(mod.lessons, oldIndex, newIndex);
      setModules(newModules);
      
      Promise.all(newModules[modIndex].lessons.map((l, idx) => 
         fetchApi(`/lessons/${l.id}/`, { method: 'PATCH', body: JSON.stringify({ order: idx }) })
      ));
    }
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = t("errTitle");
    if (!category) newErrors.category = t("errCategory");
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      newErrors.price = t("errPrice");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isValid = validateStep1();
      if (!isValid) return;
      
      // Optionally save as draft here if needed for Curriculum builder
      try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("category", category);
        formData.append("price", (parseFloat(price) || 0).toString());
        formData.append("level", level);
        formData.append("description", description);
        if (thumbnail) {
          formData.append("thumbnail", thumbnail);
        }

        if (!courseId) {
          setIsSubmitting(true);
          formData.append("status", "DRAFT");
          formData.append("is_published", "false");
          
          const res = await fetchApi("/courses/", {
            method: "POST",
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            setCourseId(data.id);
          } else {
            throw new Error("Failed");
          }
        } else {
          // Update existing course
          setIsSubmitting(true);
          await fetchApi(`/courses/${courseId}/`, {
            method: "PATCH",
            body: formData
          });
        }
      } catch (err) {
        alert(t("errSaveDraft"));
        setIsSubmitting(false);
        return; // Stop if saving fails
      }
      setIsSubmitting(false);
    }
    setCurrentStep(Math.min(steps.length, currentStep + 1));
  };

  const handleSave = async (isPublished: boolean) => {
    setIsSubmitting(true);
    try {
      const method = courseId ? "PATCH" : "POST";
      const endpoint = courseId ? `/courses/${courseId}/` : "/courses/";
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("price", (parseFloat(price) || 0).toString());
      formData.append("level", level);
      formData.append("description", description);
      formData.append("status", isPublished ? "PUBLISHED" : "DRAFT");
      formData.append("is_published", isPublished ? "true" : "false");
      
      // Only append thumbnail if it's a File object (not null)
      if (thumbnail instanceof File) {
        formData.append("thumbnail", thumbnail);
      }
      
      const res = await fetchApi(endpoint, {
        method: method,
        body: formData
      });
      if (!res.ok) throw new Error("Failed to save course");
      router.push(`/${locale}/instructor/my-courses`);
    } catch (err) {
      alert(t("errSaveCourse"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: t("step1"), icon: Info },
    { id: 2, title: t("step2"), icon: LayoutList },
    { id: 3, title: t("step3"), icon: CheckCircle2 }
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 md:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            
            return (
              <div key={step.id} className="relative flex flex-col items-center flex-1">
                {/* Connecting Line */}
                {index !== 0 && (
                  <div 
                    className={`absolute top-5 left-[-50%] w-full h-[2px] -z-10 transition-colors duration-500 ${
                      isCompleted || isCurrent ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-800"
                    }`}
                  />
                )}
                
                {/* Step Circle */}
                <div 
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white dark:bg-gray-900 transition-all duration-300 z-10 ${
                    isCompleted
                      ? "border-brand-500 bg-brand-500 text-white"
                      : isCurrent
                        ? "border-brand-500 text-brand-600 dark:text-brand-400 ring-4 ring-brand-50 dark:ring-brand-500/20"
                        : "border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                
                {/* Step Text */}
                <div className="mt-3 flex flex-col items-center text-center">
                  <span className={`text-sm font-semibold ${
                    isCurrent ? "text-brand-600 dark:text-brand-400" : isCompleted ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forms Area */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 dark:border-gray-800 dark:bg-white/[0.03]">
        
        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-6">{t("generalInfo")}</h2>
            
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("courseTitle")}</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("courseTitlePlaceholder")} className={`w-full rounded-lg border bg-transparent px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-500 ${errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'}`} />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>
              
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("category")}</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full rounded-lg border bg-transparent px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-500 text-gray-600 ${errors.category ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'}`}>
                    <option value="">{t("categorySelect")}</option>
                    <option value="Développement Web">{t("categoryWeb")}</option>
                    <option value="Design UI/UX">{t("categoryDesign")}</option>
                    <option value="Marketing">{t("categoryMarketing")}</option>
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("level")}</label>
                  <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-3 outline-none focus:border-brand-500 dark:border-gray-800 dark:focus:border-brand-500 text-gray-600">
                    <option value="BEGINNER">{t("levelBeginner")}</option>
                    <option value="INTERMEDIATE">{t("levelIntermediate")}</option>
                    <option value="ADVANCED">{t("levelAdvanced")}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("price")}</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t("pricePlaceholder")} className={`w-full rounded-lg border bg-transparent px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-500 ${errors.price ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'}`} />
                  {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("description")}</label>
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-3 outline-none focus:border-brand-500 dark:border-gray-800 dark:focus:border-brand-500" placeholder={t("descriptionPlaceholder")}></textarea>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("coverImage")}</label>
                <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 dark:border-gray-700 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer overflow-hidden group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files ? e.target.files[0] : null;
                      setThumbnail(file);
                      if (file) setThumbnailPreview(URL.createObjectURL(file));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  {thumbnailPreview ? (
                    <div className="flex flex-col items-center">
                      <div className="w-full max-w-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm mb-3 relative">
                        <img src={thumbnailPreview} alt="Preview" className="w-full h-40 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-sm font-medium">
                            {isFrench ? "Changer d'image" : "Change image"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs">
                        {thumbnail?.name || (isFrench ? "Image sauvegardée" : "Saved image")}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-400 mb-3 group-hover:text-brand-500 transition-colors" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("uploadText")}</p>
                      <p className="text-xs text-gray-400 mt-1">{t("uploadSubtext")}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-6">{t("courseStructure")}</h2>
            
            <p className="text-sm text-gray-500 mb-4">{t("courseStructureSub")}</p>
            
            <div className="space-y-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={modules.map(m => `mod-${m.id}`)} strategy={verticalListSortingStrategy}>
                  {modules.map((mod, modIdx) => (
                    <SortableModule 
                      key={mod.id} 
                      mod={mod} 
                      modIdx={modIdx}
                      handleUpdateModuleTitle={handleUpdateModuleTitle}
                      handleDeleteModule={handleDeleteModule}
                      handleAddLessonClick={handleAddLessonClick}
                      handleUpdateLessonTitle={handleUpdateLessonTitle}
                      handleDeleteLesson={handleDeleteLesson}
                      activeLessonUpload={activeLessonUpload}
                      setActiveLessonUpload={setActiveLessonUpload}
                      pendingUploadFile={pendingUploadFile}
                      onLessonVideoUploaded={handleLessonVideoUploaded}
                      t={t}
                      isFrench={isFrench}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <button onClick={handleAddModule} className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-sm font-bold text-gray-500 hover:border-brand-500 hover:text-brand-500 dark:border-gray-700 transition-colors">
                <Plus className="h-5 w-5" /> {t("addModule")}
              </button>
            </div>
            
            {/* Hidden file input for adding a lesson via video upload */}
            <input 
              type="file" 
              accept="video/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={onLessonFileSelected} 
            />
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6 dark:bg-green-900/30">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">{t("readyPublish")}</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              {t("publishText")}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6 dark:border-gray-800">
          <button 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 ${currentStep === 1 ? 'invisible' : ''}`}
          >
            {t("prev")}
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={() => handleSave(false)} 
              disabled={isSubmitting}
              className="rounded-lg px-6 py-2.5 text-sm font-medium text-brand-600 bg-brand-50 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 disabled:opacity-50"
            >
              {t("saveDraft")}
            </button>
            
            {currentStep < 3 ? (
              <button 
                onClick={handleNextStep}
                disabled={isSubmitting}
                className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? t("saving") : t("next")}
              </button>
            ) : (
              <button 
                onClick={() => handleSave(true)}
                disabled={isSubmitting}
                className="rounded-lg bg-green-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600 inline-block text-center disabled:opacity-50"
              >
                {t("publishCourse")}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
