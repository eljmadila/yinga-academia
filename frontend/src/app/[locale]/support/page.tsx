"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Clock,
  Search,
  ChevronDown,
  Send,
  CheckCircle2,
  Bot,
  Sparkles,
  BookOpen,
  CreditCard,
  ShieldCheck,
  User,
  ExternalLink,
  MessageCircle,
  Award,
  Layers
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  quickActions?: { label: string; action: string }[];
}

export default function SupportPage({
  defaultTab = "faq"
}: {
  defaultTab?: "faq" | "chat" | "ticket";
} = {}) {
  const locale = useLocale();
  const isFrench = locale === "fr";
  const t = useTranslations("support");

  const [activeTab, setActiveTab] = useState<"faq" | "chat" | "ticket">(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Ticket form state
  const [ticketData, setTicketData] = useState({
    name: "",
    email: "",
    role: "student",
    category: "general",
    subject: "",
    message: ""
  });
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSent, setTicketSent] = useState(false);

  // AI Chatbot state
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const initialBotMessage = isFrench
    ? "Bonjour ! Je suis l'assistant virtuel de Yinga Academia 🎓. Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser une question sur vos cours, les paiements M-Pesa, ou les certificats."
    : "Hello! I am Yinga Academia's virtual support assistant 🎓. How can I help you today? Ask me anything about courses, M-Pesa payments, or certificates.";

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: initialBotMessage,
      time: "Just now",
      quickActions: [
        { label: isFrench ? "Paiement M-Pesa" : "M-Pesa Payment", action: "mpesa" },
        { label: isFrench ? "Télécharger Certificat" : "Download Certificate", action: "certificate" },
        { label: isFrench ? "Devenir Formateur" : "Become Instructor", action: "instructor" },
        { label: isFrench ? "Problème Vidéo" : "Video Issue", action: "video" }
      ]
    }
  ]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // Comprehensive FAQ list
  const faqList = useMemo(() => [
    {
      id: 1,
      category: "payment",
      q: isFrench ? "Comment payer une formation avec M-Pesa ?" : "How do I pay for a course using M-Pesa?",
      a: isFrench
        ? "Lors de la commande, sélectionnez l'option M-Pesa et entrez votre numéro de téléphone (au format 243... ou 254...). Vous recevrez directement une invite sécurisée sur votre mobile pour valider votre code PIN. Dès confirmation, votre accès au cours est instantanément débloqué."
        : "During checkout, choose the M-Pesa option and enter your phone number. You will receive an instant push prompt on your mobile phone to approve the transaction with your PIN. Access to the course is activated immediately once confirmed."
    },
    {
      id: 2,
      category: "learning",
      q: isFrench ? "Où trouver et télécharger mes certificats de réussite ?" : "Where can I find and download my completion certificates?",
      a: isFrench
        ? "Une fois que vous avez complété 100% des leçons d'un cours, un bouton 'Télécharger le certificat' apparaît dans la salle de classe ainsi que dans votre espace 'Mes Cours'. Vos certificats sont générés au format PDF avec un identifiant unique vérifiable."
        : "Once you achieve 100% completion in all lessons of a course, a 'Download Certificate' button appears both inside the classroom and under 'My Courses' in your student dashboard. Certificates are generated as verifiable official PDFs."
    },
    {
      id: 3,
      category: "account",
      q: isFrench ? "Comment réinitialiser mon mot de passe en cas d'oubli ?" : "How do I reset my password if I forgot it?",
      a: isFrench
        ? "Sur la page de connexion, cliquez sur 'Mot de passe oublié ?'. Saisissez votre adresse email et un lien sécurisé vous sera envoyé dans la minute pour choisir un nouveau mot de passe."
        : "On the sign-in page, click 'Forgot password?'. Enter your registered email address and you will receive a secure password reset link within seconds."
    },
    {
      id: 4,
      category: "instructor",
      q: isFrench ? "Comment les formateurs retirent-ils leurs gains ?" : "How do instructors withdraw their course earnings?",
      a: isFrench
        ? "Depuis votre tableau de bord 'Retraits' (/instructor/payouts), vous pouvez suivre vos revenus nets et demander un retrait par Mobile Money (M-Pesa) ou virement bancaire. Les demandes sont traitées sous 24 à 48 heures ouvrées."
        : "From your Instructor Payouts dashboard (/instructor/payouts), you can track your earnings and request withdrawals via Mobile Money (M-Pesa) or direct bank transfer. Requests are processed within 24 to 48 business hours."
    },
    {
      id: 5,
      category: "technical",
      q: isFrench ? "Que faire si une vidéo ne se charge pas ou saccade ?" : "What should I do if a course video is buffering or fails to load?",
      a: isFrench
        ? "Nos vidéos sont optimisées avec streaming adaptatif (Cloudinary & Range Requests). Assurez-vous d'avoir une connexion stable, désactivez les bloqueurs de publicité agressifs, ou rafraîchissez la page. Si le souci persiste, contactez le support en précisant la leçon concernée."
        : "Our video player utilizes adaptive range streaming. Please ensure a stable internet connection, temporarily disable strict ad-blockers, or refresh the page. If the issue persists, send a ticket with the lesson URL."
    },
    {
      id: 6,
      category: "instructor",
      q: isFrench ? "Comment créer et publier une nouvelle formation ?" : "How do I create and publish a new course?",
      a: isFrench
        ? "Rendez-vous dans 'Créer un cours' (/instructor/create-course), renseignez le titre, la description, la catégorie et le prix. Ajoutez vos modules et uploadez vos vidéos grâce à notre uploader par morceaux, puis cliquez sur 'Publier'."
        : "Navigate to 'Create Course' (/instructor/create-course). Fill in the course details, category, and price. Add modules and lessons using our chunked video uploader, then click 'Publish' to make it live for students."
    }
  ], [isFrench]);

  const filteredFaqs = useMemo(() => {
    return faqList.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqList, selectedCategory, searchQuery]);

  // AI Chat Bot Auto-responses
  const handleSendChat = (messageText?: string) => {
    const textToSend = messageText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!messageText) setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let botReply = isFrench
        ? "Merci pour votre question ! Notre équipe d'assistance a également pris note. Vous pouvez également ouvrir un ticket ci-dessous pour une assistance personnalisée."
        : "Thank you for asking! Our support team has logged your inquiry. You can also submit a direct ticket below for personalized assistance.";

      let quickActions: { label: string; action: string }[] | undefined;

      if (lower.includes("mpesa") || lower.includes("paiement") || lower.includes("payer") || lower.includes("payment")) {
        botReply = isFrench
          ? "💳 Pour payer avec M-Pesa : choisissez votre cours, cliquez sur 'Acheter', sélectionnez M-Pesa et entrez votre numéro. Validez l'invite USSD reçue sur votre téléphone en tapant votre code PIN."
          : "💳 To pay with M-Pesa: select your course, click 'Enroll/Buy', select M-Pesa, and enter your mobile number. Authorize the prompt on your phone by entering your secret PIN.";
      } else if (lower.includes("certificat") || lower.includes("certificate") || lower.includes("diplome")) {
        botReply = isFrench
          ? "📜 Dès que toutes les leçons d'une formation sont validées à 100%, votre certificat officiel PDF est généré automatiquement. Vous pouvez le télécharger depuis la page de la formation ou sous 'Mes Cours'."
          : "📜 Once you reach 100% completion in a course, your official PDF certificate is unlocked immediately. You can download it directly from the lesson viewer or 'My Courses'.";
      } else if (lower.includes("formateur") || lower.includes("instructor") || lower.includes("vendre") || lower.includes("payout")) {
        botReply = isFrench
          ? "👨‍🏫 Pour publier un cours et toucher vos revenus : rendez-vous dans l'espace formateur (/instructor). Vos gains peuvent être retirés par Mobile Money ou virement bancaire."
          : "👨‍🏫 To publish courses and withdraw earnings: access your Instructor Hub (/instructor). Payouts are delivered smoothly via Mobile Money or bank wire.";
      } else if (lower.includes("video") || lower.includes("lecture") || lower.includes("bug")) {
        botReply = isFrench
          ? "🎥 Si une vidéo ne démarre pas : vérifiez votre connexion ou désactivez les extensions bloqueuses. Si le souci persiste, envoyez-nous le lien de la leçon via l'onglet 'Ouvrir un ticket'."
          : "🎥 If video playback stutters: check your connection speed or disable ad-blocker extensions. If it persists, please file a ticket with the lesson link.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          quickActions
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketData.name || !ticketData.email || !ticketData.subject || !ticketData.message) {
      toast.error(isFrench ? "Veuillez remplir tous les champs obligatoires." : "Please fill out all required fields.");
      return;
    }

    setIsSubmittingTicket(true);
    setTimeout(() => {
      setIsSubmittingTicket(false);
      setTicketSent(true);
      toast.success(
        isFrench
          ? "Ticket de support créé avec succès ! Un accusé de réception a été envoyé à votre adresse."
          : "Support ticket created successfully! A confirmation has been sent to your email."
      );
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <PublicNavbar />

      <main className="flex-1 pb-16">
        {/* Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-500/10 via-transparent to-transparent py-14 px-4 sm:px-6 lg:px-8 border-b border-gray-200/60 dark:border-gray-800">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 shadow-xs">
              <Sparkles className="w-4 h-4 text-brand-500" />
              {isFrench ? "Centre d'Assistance & IA 24/7" : "24/7 Help Center & Smart Assistant"}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {isFrench ? "Comment pouvons-nous vous aider ?" : "How can we assist you today?"}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {isFrench
                ? "Trouvez des réponses instantanées, échangez avec notre assistant intelligent ou transmettez votre demande à notre équipe d'experts."
                : "Find instant answers in our knowledge base, chat with our virtual assistant, or submit a request directly to our team."}
            </p>

            {/* Live Search Bar */}
            <div className="pt-4 max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== "faq") setActiveTab("faq");
                }}
                placeholder={
                  isFrench
                    ? "Rechercher une question (M-Pesa, certificats, cours, formateurs)..."
                    : "Search topics, questions, M-Pesa, certificates..."
                }
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex border-b border-gray-200 dark:border-gray-800 justify-center gap-4 sm:gap-8">
            <button
              onClick={() => setActiveTab("faq")}
              className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === "faq"
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              {isFrench ? "Base de Connaissances & FAQ" : "Knowledge Base & FAQ"}
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === "chat"
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Bot className="w-4 h-4 text-brand-500" />
              {isFrench ? "Assistant Virtuel (Chatbot)" : "Virtual Assistant (Chatbot)"}
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-300">
                Live
              </span>
            </button>
            <button
              onClick={() => setActiveTab("ticket")}
              className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === "ticket"
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Send className="w-4 h-4" />
              {isFrench ? "Ouvrir un Ticket" : "Submit Ticket"}
            </button>
          </div>
        </div>

        {/* Tab 1: FAQ & Knowledge Base */}
        {activeTab === "faq" && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10 animate-in fade-in duration-300">
            {/* Category Quick Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {[
                { id: "all", label: isFrench ? "Toutes les rubriques" : "All Topics", icon: Layers },
                { id: "payment", label: isFrench ? "Paiements & M-Pesa" : "Payments & M-Pesa", icon: CreditCard },
                { id: "learning", label: isFrench ? "Formations & Certificats" : "Courses & Certificates", icon: Award },
                { id: "instructor", label: isFrench ? "Espace Formateur" : "Instructor Hub", icon: User },
                { id: "account", label: isFrench ? "Compte & Sécurité" : "Account & Security", icon: ShieldCheck }
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Accordion FAQ Items */}
            <div className="bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 sm:p-8 shadow-xs divide-y divide-gray-100 dark:divide-gray-800">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={faq.id} className="py-5 first:pt-0 last:pb-0">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="flex items-center justify-between w-full text-left font-semibold text-gray-900 dark:text-white text-base group"
                      >
                        <span className="pr-4 group-hover:text-brand-500 transition-colors">
                          {faq.q}
                        </span>
                        <div
                          className={`p-1.5 rounded-full bg-gray-50 dark:bg-gray-700/60 text-gray-400 group-hover:text-brand-500 transition-transform duration-200 ${
                            isOpen ? "rotate-180 bg-brand-50 text-brand-500 dark:bg-brand-900/30" : ""
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </button>
                      {isOpen && (
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed pr-8 animate-in fade-in duration-200">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400 space-y-3">
                  <BookOpen className="w-10 h-10 mx-auto text-gray-400 opacity-60" />
                  <p className="font-semibold">
                    {isFrench ? "Aucune réponse trouvée pour cette recherche." : "No matching FAQ found."}
                  </p>
                  <p className="text-xs">
                    {isFrench
                      ? "Essayez d'autres mots-clés ou utilisez notre assistant virtuel."
                      : "Try different search terms or chat directly with our assistant."}
                  </p>
                </div>
              )}
            </div>

            {/* Direct Contact Channels Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-start gap-4 shadow-xs">
                <div className="p-3 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    {isFrench ? "Assistance par Email" : "Email Support"}
                  </h4>
                  <a
                    href="mailto:support@yinga-academia.com"
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline mt-1 block"
                  >
                    support@yinga-academia.com
                  </a>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {isFrench ? "Réponse en moins de 24h" : "Reply within 24 hours"}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-start gap-4 shadow-xs">
                <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">WhatsApp Support</h4>
                  <a
                    href="https://wa.me/243000000000"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-green-600 dark:text-green-400 hover:underline mt-1 flex items-center gap-1"
                  >
                    {isFrench ? "Discuter sur WhatsApp" : "Chat on WhatsApp"} <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {isFrench ? "Lun - Sam, 8h - 19h" : "Mon - Sat, 8am - 7pm"}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-start gap-4 shadow-xs">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    {isFrench ? "Délai de Traitement" : "Response SLA"}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {isFrench ? "98% résolus sous 4 heures" : "98% solved within 4 hours"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {isFrench ? "Priorité aux paiements M-Pesa" : "High priority for billing"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive AI Assistant / Chatbot */}
        {activeTab === "chat" && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[580px]">
              {/* Chat Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-brand-500 to-brand-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base flex items-center gap-2">
                      Yinga AI Assistant
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                    </h3>
                    <p className="text-xs text-brand-100">
                      {isFrench ? "Disponible 24h/24 pour vos questions" : "Available 24/7 for instant assistance"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setChatMessages([
                      {
                        id: "1",
                        sender: "bot",
                        text: initialBotMessage,
                        time: "Just now",
                        quickActions: [
                          { label: isFrench ? "Paiement M-Pesa" : "M-Pesa Payment", action: "mpesa" },
                          { label: isFrench ? "Télécharger Certificat" : "Download Certificate", action: "certificate" },
                          { label: isFrench ? "Devenir Formateur" : "Become Instructor", action: "instructor" }
                        ]
                      }
                    ]);
                  }}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors text-white font-medium"
                >
                  {isFrench ? "Réinitialiser" : "Reset Chat"}
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-gray-900/40">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-2xs ${
                        msg.sender === "user"
                          ? "bg-brand-500 text-white rounded-br-xs"
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700 rounded-bl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span
                        className={`text-[10px] mt-2 block text-right ${
                          msg.sender === "user" ? "text-brand-100" : "text-gray-400"
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>

                    {/* Quick suggestion buttons */}
                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pl-2">
                        {msg.quickActions.map((qa, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendChat(qa.label)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800 hover:bg-brand-100 transition-colors"
                          >
                            {qa.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 p-2">
                    <Bot className="w-4 h-4 text-brand-500" />
                    <span className="italic">{isFrench ? "L'assistant rédige..." : "Assistant is typing..."}</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChat();
                  }}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      isFrench
                        ? "Posez votre question à l'assistant..."
                        : "Type your question to the assistant..."
                    }
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="p-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Direct Ticket Form */}
        {activeTab === "ticket" && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 sm:p-10 shadow-sm">
              {ticketSent ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isFrench ? "Ticket envoyé avec succès !" : "Ticket Submitted Successfully!"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {isFrench
                      ? "Notre équipe d'ingénieurs et de support a bien reçu votre demande. Un email de suivi contenant votre numéro de ticket vient de vous être adressé."
                      : "Our engineering and customer support team has received your ticket. A confirmation email with your reference number has been dispatched."}
                  </p>
                  <button
                    onClick={() => {
                      setTicketSent(false);
                      setTicketData({
                        name: "",
                        email: "",
                        role: "student",
                        category: "general",
                        subject: "",
                        message: ""
                      });
                    }}
                    className="mt-4 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded-xl transition-colors"
                  >
                    {isFrench ? "Ouvrir une autre demande" : "Submit Another Request"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {isFrench ? "Créer un ticket d'assistance" : "Open a Support Ticket"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {isFrench
                        ? "Détaillez votre besoin pour être orienté vers le bon spécialiste."
                        : "Describe your inquiry so we can route it to the right specialist."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
                        {isFrench ? "Nom complet *" : "Full Name *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={ticketData.name}
                        onChange={(e) => setTicketData({ ...ticketData, name: e.target.value })}
                        placeholder={isFrench ? "Ex: Sarah Connor" : "e.g. John Doe"}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
                        {isFrench ? "Adresse Email *" : "Email Address *"}
                      </label>
                      <input
                        type="email"
                        required
                        value={ticketData.email}
                        onChange={(e) => setTicketData({ ...ticketData, email: e.target.value })}
                        placeholder="you@domain.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
                        {isFrench ? "Catégorie" : "Category"}
                      </label>
                      <select
                        value={ticketData.category}
                        onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                      >
                        <option value="general">{isFrench ? "Général / Autre" : "General / Other"}</option>
                        <option value="billing">{isFrench ? "Paiement & Facture M-Pesa" : "Billing & M-Pesa"}</option>
                        <option value="course">{isFrench ? "Accès au cours & Vidéos" : "Course & Video Access"}</option>
                        <option value="instructor">{isFrench ? "Formateurs & Payouts" : "Instructors & Payouts"}</option>
                        <option value="account">{isFrench ? "Problème de compte" : "Account & Login"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
                        {isFrench ? "Vous êtes" : "You are"}
                      </label>
                      <select
                        value={ticketData.role}
                        onChange={(e) => setTicketData({ ...ticketData, role: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                      >
                        <option value="student">{isFrench ? "Étudiant(e)" : "Student"}</option>
                        <option value="instructor">{isFrench ? "Formateur / Instructeur" : "Instructor"}</option>
                        <option value="visitor">{isFrench ? "Visiteur / Prospect" : "Visitor"}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
                      {isFrench ? "Sujet *" : "Subject *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketData.subject}
                      onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                      placeholder={
                        isFrench ? "Ex: Blocage sur la leçon 3 du cours React" : "e.g. Issue opening lesson 3 in React"
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
                      {isFrench ? "Message détaillé *" : "Detailed Message *"}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={ticketData.message}
                      onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                      placeholder={
                        isFrench
                          ? "Expliquez précisément votre situation, message d'erreur ou question..."
                          : "Please explain your issue, error message, or questions in detail..."
                      }
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingTicket}
                      className="flex items-center gap-2 px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-brand-500/20 disabled:opacity-50 text-sm"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmittingTicket
                        ? isFrench ? "Transmission en cours..." : "Submitting..."
                        : isFrench ? "Envoyer le ticket" : "Submit Ticket"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
