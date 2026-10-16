"use client";

import React, { useState } from "react";
import { Search, Users } from "lucide-react";
import { useLocale } from "next-intl";

export default function LatestStudentsTable({ latestStudents }: { latestStudents: any[] }) {
  const locale = useLocale();
  const isFrench = locale === "fr";
  const [search, setSearch] = useState("");

  const filteredStudents = latestStudents.filter((student) => {
    const searchLower = search.toLowerCase();
    return (
      (student.name || "").toLowerCase().includes(searchLower) ||
      (student.email || "").toLowerCase().includes(searchLower) ||
      (student.course || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
          {isFrench ? "Derniers étudiants inscrits" : "Latest Students"}
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={isFrench ? "Rechercher des étudiants..." : "Search students..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4 font-semibold">{isFrench ? "Étudiant" : "Student"}</th>
              <th className="px-6 py-4 font-semibold">{isFrench ? "Cours" : "Course"}</th>
              <th className="px-6 py-4 font-semibold">{isFrench ? "Progression" : "Progress"}</th>
              <th className="px-6 py-4 font-semibold">{isFrench ? "Date" : "Date"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredStudents.length > 0 ? filteredStudents.map((student: any) => (
              <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-bold uppercase flex-shrink-0">
                      {(student.name || "S").charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white/90 line-clamp-1">{student.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">{student.course}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[80px] overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${student.progress || 0}%` }}></div>
                    </div>
                    <span className="text-xs">{student.progress || 0}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{student.date}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {search 
                      ? (isFrench ? "Aucun étudiant ne correspond à votre recherche." : "No students match your search.")
                      : (isFrench ? "Aucun étudiant inscrit pour le moment." : "No students enrolled yet.")}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
