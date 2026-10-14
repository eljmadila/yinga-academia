"use client";

import React, { useEffect, useState } from 'react';
import { MessageSquare, Search, CheckCircle2, Clock, Reply } from 'lucide-react';
import { resolveApiUrl } from '@/lib/api';

interface Answer {
  id: string;
  body: string;
  author?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  } | string;
  author_name?: string;
  author_role?: string;
  created_at: string;
}

interface Question {
  id: string;
  title: string;
  body: string;
  is_resolved: boolean;
  created_at: string;
  student?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  } | string;
  student_name?: string;
  lesson?: {
    id: string;
    title: string;
    course?: {
      id: string;
      title: string;
    };
  } | string | null;
  lesson_details?: {
    id: string;
    title: string;
    course?: {
      id: string;
      title: string;
    } | null;
  } | null;
  course_title?: string;
  lesson_title?: string;
  answers?: Answer[];
}

export default function QAClient({ token }: { token: string | undefined }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unanswered">("unanswered");
  const [replyBody, setReplyBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    fetch(resolveApiUrl('/questions/'), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      const list: Question[] = Array.isArray(data) ? data : (data?.results || []);
      setQuestions(list);
      if (list.length > 0) {
        setActiveQuestion(list[0]);
      }
    })
    .catch(err => console.error("Failed to fetch questions:", err));
  }, [token]);

  const filteredQuestions = questions.filter(q => {
    const titleMatch = (q.title || "").toLowerCase().includes(search.toLowerCase());
    const bodyMatch = (q.body || "").toLowerCase().includes(search.toLowerCase());
    if (!titleMatch && !bodyMatch) return false;
    
    if (filter === "unanswered") return (q.answers || []).length === 0;
    return true;
  });

  const handlePostReply = async () => {
    if (!activeQuestion || !replyBody.trim()) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(resolveApiUrl('/answers/'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: activeQuestion.id,
          body: replyBody
        })
      });
      
      if (res.ok) {
        const newAnswer = await res.json();
        // Update local state
        setQuestions(prev => prev.map(q => {
          if (q.id === activeQuestion.id) {
            const updated = { ...q, answers: [...(q.answers || []), newAnswer] };
            if (activeQuestion.id === q.id) setActiveQuestion(updated);
            return updated;
          }
          return q;
        }));
        setReplyBody("");
      } else {
        alert("Failed to post reply");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleResolve = async () => {
    if (!activeQuestion) return;
    
    try {
      const res = await fetch(resolveApiUrl(`/questions/${activeQuestion.id}/`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          is_resolved: !activeQuestion.is_resolved
        })
      });
      
      if (res.ok) {
        const updatedQuestion = await res.json();
        setQuestions(prev => prev.map(q => q.id === activeQuestion.id ? { ...q, is_resolved: updatedQuestion.is_resolved } : q));
        setActiveQuestion(prev => prev ? { ...prev, is_resolved: updatedQuestion.is_resolved } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  const getCourseTitle = (q?: Question | null) => {
    if (!q) return "Course";
    if (q.lesson_details?.course?.title) return q.lesson_details.course.title;
    if (typeof q.lesson === 'object' && q.lesson?.course?.title) return q.lesson.course.title;
    if (q.course_title) return q.course_title;
    return "Course Q&A";
  };

  const getLessonTitle = (q?: Question | null) => {
    if (!q) return "General Lesson";
    if (q.lesson_details?.title) return q.lesson_details.title;
    if (typeof q.lesson === 'object' && q.lesson?.title) return q.lesson.title;
    if (q.lesson_title) return q.lesson_title;
    return "General Question";
  };

  const getStudentDisplayName = (q?: Question | null) => {
    if (!q) return "Student";
    if (q.student_name) return q.student_name;
    const s = q.student;
    if (!s) return "Student";
    if (typeof s === "string") return s;
    if (s.first_name || s.last_name) return `${s.first_name || ""} ${s.last_name || ""}`.trim();
    if (s.email) return s.email.split('@')[0];
    return "Student";
  };

  const getAuthorDisplayName = (author?: any, authorName?: string) => {
    if (authorName) return authorName;
    if (!author) return "Instructor";
    if (typeof author === "string") return author;
    if (author.first_name || author.last_name) return `${author.first_name || ""} ${author.last_name || ""}`.trim();
    if (author.email) return author.email.split('@')[0];
    return "Instructor";
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Q&A Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage and answer student questions</p>
          </div>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Questions List (Sidebar) */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button 
              onClick={() => setFilter("unanswered")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${filter === "unanswered" ? "text-brand-600 dark:text-brand-400 border-b-2 border-brand-500 bg-brand-50/50 dark:bg-brand-900/10" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}
            >
              Unanswered ({questions.filter(q => (q.answers || []).length === 0).length})
            </button>
            <button 
              onClick={() => setFilter("all")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${filter === "all" ? "text-brand-600 dark:text-brand-400 border-b-2 border-brand-500 bg-brand-50/50 dark:bg-brand-900/10" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}
            >
              All Questions
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No questions found.</p>
              </div>
            ) : (
              filteredQuestions.map(q => (
                <div 
                  key={q.id}
                  onClick={() => setActiveQuestion(q)}
                  className={`p-4 rounded-xl cursor-pointer transition-colors border ${activeQuestion?.id === q.id ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${activeQuestion?.id === q.id ? 'text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/50' : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'}`}>
                      Course: {getCourseTitle(q)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(q.created_at)}
                    </span>
                  </div>
                  <h4 className={`text-sm mb-1 line-clamp-1 ${activeQuestion?.id === q.id ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-800 dark:text-gray-200'}`}>
                    {q.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {q.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Question Detail View */}
        <div className="w-full lg:w-2/3 flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          {activeQuestion ? (
            <>
              {/* Question Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-lg">
                      {getStudentDisplayName(activeQuestion).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{getStudentDisplayName(activeQuestion)}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{getLessonTitle(activeQuestion)}</p>
                    </div>
                  </div>
                  {activeQuestion.is_resolved ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" /> Resolved
                    </span>
                  ) : (
                    <button 
                      onClick={handleToggleResolve}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Resolved
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {activeQuestion.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                  {activeQuestion.body}
                </p>
              </div>

              {/* Answers Area */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 p-6 overflow-y-auto space-y-6">
                {(activeQuestion.answers || []).map(ans => {
                  const authorName = getAuthorDisplayName(ans.author, ans.author_name);
                  return (
                    <div key={ans.id} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-full">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {authorName} {ans.author_role === 'INSTRUCTOR' ? '(Instructor)' : ''}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(ans.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {ans.body}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div className="bg-white dark:bg-gray-800 border border-brand-200 dark:border-brand-900/50 rounded-xl shadow-sm focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all overflow-hidden flex flex-col mt-4">
                  <textarea 
                    value={replyBody}
                    onChange={e => setReplyBody(e.target.value)}
                    className="w-full p-4 bg-transparent outline-none text-gray-800 dark:text-gray-200 resize-none min-h-[120px]"
                    placeholder={`Write your answer to ${getStudentDisplayName(activeQuestion)}...`}
                  />
                  <div className="flex justify-end items-center p-3 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-700">
                    <button 
                      onClick={handlePostReply}
                      disabled={!replyBody.trim() || isSubmitting}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Reply className="w-4 h-4" /> {isSubmitting ? "Posting..." : "Post Reply"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-200">No question selected</p>
              <p className="text-sm">Select a question from the sidebar to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

