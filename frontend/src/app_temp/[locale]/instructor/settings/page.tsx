"use client";

import React, { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { User, Mail, Globe, AtSign, Link, Camera, Save, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageLoader } from "@/components/ui/PageLoader";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const settingsSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  title: z.string().max(100, "Le titre est trop long").optional(),
  bio: z.string().max(500, "La biographie est trop longue").optional(),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  twitter: z.string().optional(),
  linkedin: z.string().optional()
});

type SettingsValues = z.infer<typeof settingsSchema>;

export default function InstructorSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations("instructor.settings");
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      title: "",
      bio: "",
      website: "",
      twitter: "",
      linkedin: ""
    }
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetchApi("/auth/user/");
        if (res.ok) {
          const data = await res.json();
          setValue("firstName", data.first_name || "");
          setValue("lastName", data.last_name || "");
          setValue("title", data.title || "");
          setValue("bio", data.bio || "");
          setValue("website", data.social_links?.website || "");
          setValue("twitter", data.social_links?.twitter || "");
          setValue("linkedin", data.social_links?.linkedin || "");
          setAvatarPreview(data.avatar || null);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: SettingsValues) => {
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append("first_name", data.firstName);
      formData.append("last_name", data.lastName);
      if (data.title) formData.append("title", data.title);
      if (data.bio) formData.append("bio", data.bio);
      
      const socialLinks = { website: data.website, twitter: data.twitter, linkedin: data.linkedin };
      formData.append("social_links", JSON.stringify(socialLinks));
      
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const res = await fetchApi("/auth/user/", {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        toast.success(t("updateSuccess"));
      } else {
        toast.error(t("updateError"));
      }
    } catch (err) {
      toast.error(t("networkError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 md:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("description")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white/90">{t("profilePicture")}</h3>
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-gray-50 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-full w-full p-4 text-gray-400" />
              )}
            </div>
            <div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Camera className="h-4 w-4" />
                {t("clickToChange")}
              </button>
              <p className="mt-2 text-xs text-gray-500">JPG, GIF ou PNG. 1MB max.</p>
            </div>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white/90">{t("personalInfo")}</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("firstName")}</label>
              <input 
                type="text" 
                {...register("firstName")}
                className={`w-full rounded-lg border bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 ${errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-500 dark:border-gray-700'}`}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("lastName")}</label>
              <input 
                type="text" 
                {...register("lastName")}
                className={`w-full rounded-lg border bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 ${errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-500 dark:border-gray-700'}`}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("professionalTitle")}</label>
              <input 
                type="text" 
                {...register("title")}
                placeholder="ex: Senior React Developer, Expert Marketing..."
                className={`w-full rounded-lg border bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 ${errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-500 dark:border-gray-700'}`}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("bio")}</label>
              <textarea 
                rows={5}
                {...register("bio")}
                placeholder="Parlez de vous, de votre expérience et de ce que vous enseignez..."
                className={`w-full rounded-lg border bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 ${errors.bio ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-500 dark:border-gray-700'}`}
              />
              {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
            </div>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white/90">{t("socialNetworks")}</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("website")}</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input 
                  type="url" 
                  {...register("website")}
                  placeholder="https://..."
                  className={`w-full rounded-lg border bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 ${errors.website ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-500 dark:border-gray-700'}`}
                />
              </div>
              {errors.website && <p className="mt-1 text-xs text-red-500">{errors.website.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Twitter</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  {...register("twitter")}
                  placeholder="https://twitter.com/..."
                  className={`w-full rounded-lg border bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 ${errors.twitter ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-500 dark:border-gray-700'}`}
                />
              </div>
              {errors.twitter && <p className="mt-1 text-xs text-red-500">{errors.twitter.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  {...register("linkedin")}
                  placeholder="https://linkedin.com/in/..."
                  className={`w-full rounded-lg border bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 ${errors.linkedin ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-500 dark:border-gray-700'}`}
                />
              </div>
              {errors.linkedin && <p className="mt-1 text-xs text-red-500">{errors.linkedin.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? t("saving") : t("saveChanges")}
          </button>
        </div>
      </form>
    </div>
  );
}
