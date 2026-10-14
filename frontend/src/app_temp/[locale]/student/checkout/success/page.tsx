"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, PlayCircle, Home } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("courseId");
  
  useEffect(() => {
    // Lancer des confettis
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, { particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center bg-white dark:bg-white/[0.03] p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
        </div>
        
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Félicitations !
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Votre inscription a bien été confirmée. Vous pouvez dès maintenant commencer votre apprentissage.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {courseId ? (
            <Link 
              href={`/student/courses/${courseId}/lesson/1`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-brand-600 shadow-lg shadow-brand-500/30"
            >
              <PlayCircle className="h-5 w-5" />
              Commencer le cours
            </Link>
          ) : (
            <Link 
              href={`/student/dashboard`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-brand-600 shadow-lg shadow-brand-500/30"
            >
              <Home className="h-5 w-5" />
              Aller au tableau de bord
            </Link>
          )}
          
          <Link 
            href="/student/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3.5 text-base font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.02]"
          >
            Voir mon tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="flex h-[70vh] items-center justify-center">Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
