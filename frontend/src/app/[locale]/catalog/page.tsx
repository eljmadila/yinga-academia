"use client";

import React, { useEffect, useState } from "react";
import { Search, Star, Clock, BookOpen, Filter, ArrowRight, Sparkles } from "lucide-react";
import { fetchApi, resolveMediaUrl } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";

export default function PublicCatalogPage() {
  const locale = useLocale();
  const isFrench = locale === "fr";

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all"); // all, free, paid
  const [levelFilter, setLevelFilter] = useState("all"); // all, BEGINNER, INTERMEDIATE, ADVANCED
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetchApi("/courses/");
        if (res.ok) {
          const data = await res.json();
          const published = Array.isArray(data) ? data.filter((c: any) => c.is_published) : [];
          setCourses(published);

          const unique = new Set<string>();
          published.forEach((c: any) => {
            const cat = typeof c.category === "object" ? c.category?.name : c.category;
            if (cat) unique.add(cat);
          });
          setCategories(Array.from(unique));
        }
      } catch (err) {
        console.error("Failed to load catalog courses", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const courseCat = (typeof course.category === "object" ? course.category?.name : course.category) || "";
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courseCat.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "all" || courseCat.toLowerCase() === activeCategory.toLowerCase();

    let matchesPrice = true;
    const priceNum = Number(course.price) || 0;
    if (priceFilter === "free") matchesPrice = priceNum <= 0;
    if (priceFilter === "paid") matchesPrice = priceNum > 0;

    let matchesLevel = true;
    if (levelFilter !== "all") {
      matchesLevel = course.level === levelFilter;
    }

    return matchesSearch && matchesCategory && matchesPrice && matchesLevel;
  });

  const levelLabels: Record<string, string> = {
    BEGINNER: isFrench ? "Débutant" : "Beginner",
    INTERMEDIATE: isFrench ? "Intermédiaire" : "Intermediate",
    ADVANCED: isFrench ? "Avancé" : "Advanced",
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <PublicNavbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <Sparkles className="w-3.5 h-3.5" />
            {isFrench ? "Catalogue Officiel" : "Official Catalog"}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {isFrench ? "Explorez Toutes Nos Formations" : "Explore All Courses"}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            {isFrench
              ? "Des compétences concrètes enseignées par des professionnels pour accélérer votre carrière."
              : "Practical, career-focused courses created by verified industry experts."}
          </p>
        </div>

        {/* Search & Filters Toolbar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isFrench ? "Rechercher une formation, un sujet..." : "Search for courses, topics..."}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Price Filter */}
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                aria-label={isFrench ? "Filtrer par prix" : "Filter by price"}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm font-medium text-gray-700 outline-none shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="all">{isFrench ? "Tous les prix" : "All Prices"}</option>
                <option value="free">{isFrench ? "Gratuit" : "Free"}</option>
                <option value="paid">{isFrench ? "Payant" : "Paid"}</option>
              </select>

              {/* Level Filter */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                aria-label={isFrench ? "Filtrer par niveau" : "Filter by level"}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm font-medium text-gray-700 outline-none shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="all">{isFrench ? "Tous les niveaux" : "All Levels"}</option>
                <option value="BEGINNER">{isFrench ? "Débutant" : "Beginner"}</option>
                <option value="INTERMEDIATE">{isFrench ? "Intermédiaire" : "Intermediate"}</option>
                <option value="ADVANCED">{isFrench ? "Avancé" : "Advanced"}</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === "all"
                    ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20"
                    : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
                }`}
              >
                {isFrench ? "Toutes les catégories" : "All Categories"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20"
                      : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 animate-pulse p-4"
              />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const price = Number(course.price) || 0;
              const catName = (typeof course.category === "object" ? course.category?.name : course.category) || "";
              const instructorName =
                course.instructor_name ||
                (course.instructor ? `${course.instructor.first_name || ""} ${course.instructor.last_name || ""}`.trim() : "") ||
                (isFrench ? "Formateur certifié" : "Certified Instructor");

              return (
                <Link
                  key={course.id}
                  href={`/student/courses/${course.id}`}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <img
                      src={
                        resolveMediaUrl(course.thumbnail) ||
                        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80"
                      }
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80";
                      }}
                    />
                    {catName && (
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-gray-900 dark:bg-gray-900/90 dark:text-white uppercase tracking-wider">
                        {catName}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span className="font-semibold text-brand-600 dark:text-brand-400">
                        {levelLabels[course.level] || course.level}
                      </span>
                      <span>•</span>
                      <span>{instructorName}</span>
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-2">
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                        {course.description}
                      </p>
                    )}

                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-base font-extrabold text-gray-900 dark:text-white">
                        {price > 0 ? `KES ${price.toFixed(2)}` : (isFrench ? "Gratuit" : "Free")}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform">
                        {isFrench ? "Voir la formation" : "View Course"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900/50">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {isFrench ? "Aucune formation trouvée" : "No courses found"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              {isFrench
                ? "Essayez de modifier votre recherche ou de réinitialiser vos filtres."
                : "Try adjusting your search criteria or resetting the category filters."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
                setPriceFilter("all");
                setLevelFilter("all");
              }}
              className="rounded-xl bg-brand-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-brand-600 transition-colors"
            >
              {isFrench ? "Réinitialiser les filtres" : "Reset Filters"}
            </button>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
