"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Book, Pencil, PenTool, GraduationCap, Laptop, Lightbulb } from "lucide-react";
import PublicFooter from "@/components/public/PublicFooter";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export default function Home() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("home");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  };

  // Floating educational icons config to avoid hydration mismatch
  const floatingIcons = [
    { Icon: Book, size: 56, top: "15%", left: "10%", delay: 0, dur: 12, yMove: -40, rotate: -15 },
    { Icon: Pencil, size: 48, top: "65%", left: "85%", delay: 2, dur: 14, yMove: -60, rotate: 20 },
    { Icon: GraduationCap, size: 64, top: "75%", left: "15%", delay: 1, dur: 10, yMove: -30, rotate: 10 },
    { Icon: Laptop, size: 56, top: "25%", left: "75%", delay: 3, dur: 15, yMove: -50, rotate: -10 },
    { Icon: Lightbulb, size: 48, top: "10%", left: "80%", delay: 0.5, dur: 11, yMove: -45, rotate: 25 },
    { Icon: PenTool, size: 40, top: "70%", left: "8%", delay: 4, dur: 13, yMove: -55, rotate: -25 },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Floating Educational Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 sm:opacity-100">
        {floatingIcons.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-brand-500/20 dark:text-brand-400/20"
            style={{ top: item.top, left: item.left }}
            animate={{
              y: [0, item.yMove, 0],
              x: [0, item.yMove / 2, 0],
              rotate: [item.rotate, item.rotate + 15, item.rotate],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: item.dur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
          >
            <div className="scale-75 sm:scale-100">
              <item.Icon size={item.size} strokeWidth={1.5} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navbar Minimalist */}
      <nav className="absolute top-0 w-full z-50 flex justify-between items-center px-4 py-3 md:px-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center">
          <img 
            src="/images/logo/logo-yinga-full.png" 
            alt="Yinga Academia" 
            className="h-10 sm:h-14 md:h-20 w-auto object-contain drop-shadow-sm" 
          />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
          <LanguageSwitcher variant="pill" />
          <Link href="/login" className="hidden sm:block text-gray-700 dark:text-gray-200 hover:text-brand-500 transition-colors">{t("login")}</Link>
          <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm text-white transition-all hover:bg-brand-500 hover:shadow-lg dark:bg-white dark:text-gray-900 dark:hover:bg-brand-500 dark:hover:text-white">
            {t("createAccount")}
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="mt-5 relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center sm:px-6 lg:px-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-600 dark:border-brand-400/30 dark:bg-brand-400/10 dark:text-brand-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
            </span>
            {t("badgeText")}
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="mb-4 sm:mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {t("heroTitlePrefix")}<br className="sm:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-yellow-400">Yinga Academia</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="mx-auto mb-8 sm:mb-10 max-w-2xl text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 px-2 sm:px-0">
            {t("heroDescription")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
            <Link href="/student/dashboard" className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-brand-500 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg transition-all hover:bg-brand-600 hover:shadow-brand-500/25 hover:-translate-y-0.5">
              {t("studentAreaButton")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/instructor/dashboard" className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-gray-300 bg-white/50 backdrop-blur-md px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-gray-700 shadow-sm transition-all hover:bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:bg-gray-800 hover:-translate-y-0.5">
              {t("instructorAreaButton")}
            </Link>
          </motion.div> 

        </motion.div>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
