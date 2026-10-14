"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { MessageCircle, Send, CheckCircle } from 'lucide-react';

export default function LessonQA({ lessonId }: { lessonId: string }) {
  const t = useTranslations('student.qa');
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionBody, setNewQuestionBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [lessonId]);

  const loadQuestions = async () => {
    try {
      const res = await fetchApi(`/questions/?lesson_id=${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Erreur de chargement des questions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionTitle.trim() || !newQuestionBody.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await fetchApi('/questions/', {
        method: 'POST',
        body: JSON.stringify({
          lesson: lessonId,
          title: newQuestionTitle,
          body: newQuestionBody
        })
      });
      if (res.ok) {
        setNewQuestionTitle("");
        setNewQuestionBody("");
        loadQuestions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (questionId: string) => {
    if (!replyBody.trim()) return;
    
    setSubmittingReply(true);
    try {
      const res = await fetchApi('/answers/', {
        method: 'POST',
        body: JSON.stringify({
          question: questionId,
          body: replyBody
        })
      });
      if (res.ok) {
        setReplyTo(null);
        setReplyBody("");
        loadQuestions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="mt-8 border-t border-gray-800 pt-8">
      <h3 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-brand-500" />
        {t('title')} ({questions.length})
      </h3>

      {/* Poser une question */}
      <div className="mb-10 rounded-xl bg-gray-900/50 p-6 border border-gray-800">
        <h4 className="mb-4 font-semibold text-gray-200">{t('askQuestion')}</h4>
        <form onSubmit={handleAskQuestion}>
          <input 
            type="text"
            placeholder={t("titlePlaceholder")}
            value={newQuestionTitle}
            onChange={(e) => setNewQuestionTitle(e.target.value)}
            className="w-full mb-3 rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
            required
          />
          <textarea
            placeholder={t("bodyPlaceholder")}
            value={newQuestionBody}
            onChange={(e) => setNewQuestionBody(e.target.value)}
            className="w-full mb-3 rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none resize-none"
            rows={3}
            required
          />
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={submitting || !newQuestionTitle.trim() || !newQuestionBody.trim()}
              className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              {submitting ? t("submitting") : t("submit")}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des questions */}
      {loading ? (
        <p className="text-gray-500 text-sm">{t("loading")}</p>
      ) : questions.length === 0 ? (
        <p className="text-gray-500 text-sm italic">{t("empty")}</p>
      ) : (
        <div className="space-y-6">
          {questions.map((q: any) => (
            <div key={q.id} className="rounded-xl border border-gray-800 bg-gray-900/30 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-8 w-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs uppercase">
                      {q.student_name ? q.student_name.substring(0, 2) : "ST"}
                    </div>
                    <span className="font-semibold text-gray-300 text-sm">{q.student_name || "Student"}</span>
                    <span className="text-xs text-gray-600">• il y a quelques instants</span>
                  </div>
                  <h5 className="font-bold text-white text-lg mt-2">{q.title}</h5>
                  <p className="text-gray-400 text-sm mt-1 whitespace-pre-wrap">{q.body}</p>
                </div>
                {q.is_resolved && (
                  <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                    <CheckCircle className="h-3 w-3" />
                    {t('resolved')}
                  </span>
                )}
              </div>

              {/* Réponses */}
              {q.answers && q.answers.length > 0 && (
                <div className="mt-5 ml-4 pl-4 border-l border-gray-800 space-y-4">
                  {q.answers.map((ans: any) => (
                    <div key={ans.id} className="bg-gray-800/30 rounded-lg p-4 relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs uppercase ${ans.author_role === 'INSTRUCTOR' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-700 text-gray-300'}`}>
                          {ans.author_name ? ans.author_name.substring(0, 2) : "XX"}
                        </div>
                        <span className={`font-semibold text-sm ${ans.author_role === 'INSTRUCTOR' ? 'text-yellow-500' : 'text-gray-300'}`}>
                          {ans.author_name || "User"}
                          {ans.author_role === 'INSTRUCTOR' && <span className="ml-2 text-[10px] bg-yellow-500/20 px-1.5 py-0.5 rounded text-yellow-500">{t('instructor')}</span>}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{ans.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Bouton pour répondre */}
              <div className="mt-4 ml-4 pl-4 border-l border-transparent">
                {replyTo === q.id ? (
                  <div className="mt-2">
                    <textarea
                      autoFocus
                      placeholder={t("replyPlaceholder")}
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none resize-none mb-2"
                      rows={2}
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setReplyTo(null); setReplyBody(""); }} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">{t('cancel')}</button>
                      <button 
                        onClick={() => handleReply(q.id)}
                        disabled={submittingReply || !replyBody.trim()}
                        className="rounded bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                      >
                        {t('reply')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setReplyTo(q.id); setReplyBody(""); }}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-400 transition"
                  >
                    <Send className="h-3 w-3" />
                    {t('reply')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
