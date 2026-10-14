"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, Star, Clock, BookOpen } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Link } from "@/i18n/navigation";

export default function Catalogue() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [showFilters, setShowFilters] = useState(false);
  const [priceFilter, setPriceFilter] = useState("All"); // All, Free, Paid
  const [levelFilter, setLevelFilter] = useState("All"); // All, Débutant, Intermédiaire, Avancé
  const [ratingFilter, setRatingFilter] = useState(0); // 0, 3, 4, 4.5
  
  // Dynamic categories based on fetched courses
  const [categories, setCategories] = useState<string[]>(["Tout"]);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetchApi("/courses/");
        if (res.ok) {
          const data = await res.json();
          const publishedCourses = data.filter((c: any) => c.is_published);
          setCourses(publishedCourses);
          
          // Extract unique categories
          const uniqueCategories = new Set<string>();
          publishedCourses.forEach((c: any) => {
            if (c.category) uniqueCategories.add(c.category);
          });
          setCategories(["Tout", ...Array.from(uniqueCategories)]);
        }
      } catch (err) {
        console.error("Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    // Search
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (course.category && course.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category
    const matchesCategory = activeCategory === "Tout" || 
                            (course.category && course.category.toLowerCase() === activeCategory.toLowerCase());

    // Price
    let matchesPrice = true;
    if (priceFilter === "Free") matchesPrice = course.price <= 0;
    if (priceFilter === "Paid") matchesPrice = course.price > 0;
    
    // Level
    let matchesLevel = true;
    if (levelFilter !== "All") {
      matchesLevel = course.level === levelFilter;
    }
    
    // Rating
    let matchesRating = true;
    const courseRating = parseFloat(course.rating || course.average_rating || 0);
    if (ratingFilter > 0) {
      matchesRating = courseRating >= ratingFilter;
    }

    return matchesSearch && matchesCategory && matchesPrice && matchesLevel && matchesRating;
  });

  return (
    <div className="space-y-8">
      {/* En-tête et Recherche */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 md:text-3xl">
            Catalogue des Cours
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Trouvez la formation parfaite pour atteindre vos objectifs.
          </p>
        </div>
        
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white dark:focus:border-brand-500"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              showFilters 
                ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-400" 
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.05]"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtres {(priceFilter !== "All" || levelFilter !== "All" || ratingFilter > 0) && (
              <span className="ml-1 flex h-2 w-2 rounded-full bg-brand-500"></span>
            )}
          </button>
        </div>
      </div>
      
      {/* Menu Filtres Avancés */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 sm:p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Prix */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Prix</h4>
            <div className="flex flex-wrap gap-2">
              {["All", "Free", "Paid"].map(p => (
                <button
                  key={p}
                  onClick={() => setPriceFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    priceFilter === p 
                      ? "bg-brand-500 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {p === "All" ? "Tous les prix" : p === "Free" ? "Gratuit" : "Payant"}
                </button>
              ))}
            </div>
          </div>
          
          {/* Niveau */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Niveau</h4>
            <div className="flex flex-wrap gap-2">
              {["All", "Débutant", "Intermédiaire", "Avancé"].map(l => (
                <button
                  key={l}
                  onClick={() => setLevelFilter(l)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    levelFilter === l 
                      ? "bg-brand-500 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {l === "All" ? "Tous niveaux" : l}
                </button>
              ))}
            </div>
          </div>
          
          {/* Note */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Note minimale</h4>
            <div className="flex flex-wrap gap-2">
              {[0, 3, 4, 4.5].map(r => (
                <button
                  key={r}
                  onClick={() => setRatingFilter(r)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    ratingFilter === r 
                      ? "bg-brand-500 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {r === 0 ? "Toutes" : (
                    <>
                      {r} <Star className={`w-3.5 h-3.5 ${ratingFilter === r ? 'text-white' : 'text-yellow-500'}`} /> et +
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Catégories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              activeCategory === category
                ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grille de Cours */}
      {isLoading ? (
        <div className="py-20 text-center text-gray-500">Chargement du catalogue...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          {courses.length === 0 ? "Aucun cours publié pour le moment." : "Aucun cours ne correspond à votre recherche."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCourses.map((course) => (
            <div key={course.id} className="group flex flex-col md:flex-row overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-gray-700">
              {/* Image */}
              <div className="relative h-44 md:h-auto md:w-64 shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={course.thumbnail || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80"}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3 rounded bg-white/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-900 shadow-sm backdrop-blur-md dark:bg-gray-900/90 dark:text-white">
                  {course.category}
                </div>
              </div>
              
              {/* Contenu */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-gray-900 line-clamp-2 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-tight">
                      {course.title}
                    </h3>
                    <p className="mb-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Par {typeof course.instructor === 'object' && course.instructor !== null ? `${course.instructor.first_name} ${course.instructor.last_name}` : (course.instructor || "Instructeur")}
                    </p>
                  </div>
                  <span className={`text-lg font-extrabold whitespace-nowrap ${course.price <= 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    {course.price <= 0 ? 'Gratuit' : `${course.price} €`}
                  </span>
                </div>
                
                <div className="mt-auto space-y-4 pt-2">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 px-2 py-1 rounded-md">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {course.rating || "Nouveau"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 opacity-70" />
                      {course.duration || "N/A"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 opacity-70" />
                      {course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || "Plusieurs"} leçons
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      Commencez à apprendre dès aujourd'hui.
                    </p>
                    <Link 
                      href={`/student/courses/${course.id}`}
                      className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-600 hover:shadow-md dark:bg-white dark:text-gray-900 dark:hover:bg-brand-500 dark:hover:text-white w-full sm:w-auto text-center"
                    >
                      Voir le cours
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
