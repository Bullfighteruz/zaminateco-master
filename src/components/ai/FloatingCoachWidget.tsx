import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Send, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getEcoCoachResponse } from '@/lib/gemini';
import { loadUserProgress } from '@/lib/userProgress';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const STORAGE_KEY = 'zami_bot_chat';

/** Parse simple markdown (bold, bullet points, headers, lists) into React elements */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-1.5 my-2 pl-4 list-disc text-slate-200">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  const renderInline = (content: string, lineIdx: number): React.ReactNode[] => {
    const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    const parts = content.split(regex);
    
    return parts.map((part, i) => {
      if (part.startsWith('***') && part.endsWith('***')) {
        return (
          <strong key={`${lineIdx}-bi-${i}`} className="font-extrabold italic text-white">
            {part.slice(3, -3).replace(/\*/g, '')}
          </strong>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`${lineIdx}-b-${i}`} className="font-bold text-white">
            {part.slice(2, -2).replace(/\*/g, '')}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={`${lineIdx}-i-${i}`} className="italic text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      return <span key={`${lineIdx}-t-${i}`}>{part}</span>;
    });
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    if (trimmed === '---') {
      flushList();
      elements.push(<hr key={`hr-${lineIdx}`} className="my-3 border-white/10" />);
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h-${lineIdx}`} className="text-xs font-black text-emerald-300 mt-3 mb-1.5 tracking-wider uppercase">
          {renderInline(trimmed.slice(4), lineIdx)}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h-${lineIdx}`} className="text-sm font-black text-emerald-200 mt-4 mb-2 tracking-wide">
          {renderInline(trimmed.slice(3), lineIdx)}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h-${lineIdx}`} className="text-base font-black text-white mt-4 mb-2 tracking-wide">
          {renderInline(trimmed.slice(2), lineIdx)}
        </h2>
      );
      return;
    }

    const bulletMatch = trimmed.match(/^[-•*]\s+(.*)/);
    if (bulletMatch) {
      listItems.push(
        <li key={`li-${lineIdx}`} className="text-slate-200 leading-relaxed text-left">
          {renderInline(bulletMatch[1], lineIdx)}
        </li>
      );
      return;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      flushList();
      elements.push(
        <div key={`num-${lineIdx}`} className="flex items-start gap-2 my-1 text-slate-200">
          <span className="text-emerald-400 font-extrabold text-xs mt-[1px] min-w-[16px]">{numMatch[1]}.</span>
          <span className="flex-1 text-left">{renderInline(numMatch[2], lineIdx)}</span>
        </div>
      );
      return;
    }

    if (!trimmed) {
      flushList();
      elements.push(<div key={`sp-${lineIdx}`} className="h-2" />);
      return;
    }

    flushList();
    elements.push(
      <p key={`p-${lineIdx}`} className="text-slate-200 my-1 text-left">
        {renderInline(trimmed, lineIdx)}
      </p>
    );
  });

  flushList();
  return elements;
}

function loadMessages(): Message[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function saveMessages(messages: Message[]) {
  try {
    // Save only the last 50 messages to keep localStorage lean
    const toSave = messages.slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // localStorage full or unavailable
  }
}

function getWelcomeText(lang: string): string {
  return lang === 'uz'
    ? "Salom! Men Zami Bot yordamchisiman. Sizga qayta ishlash yoki platforma bo'yicha qanday yordam bera olaman?"
    : lang === 'ru'
    ? "Привет! Я помощник Zami Bot. Чем могу помочь вам по сортировке или работе платформы?"
    : "Hello! I'm Zami Bot. How can I help you today with sorting or recycling?";
}

export default function FloatingCoachWidget() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ctaIndex, setCtaIndex] = useState(0);
  const [showCta, setShowCta] = useState(true);
  const ctaCycleCount = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const ctaMessages: Record<string, string[]> = useMemo(() => ({
    en: [
      "♻️ Not sure how to sort it? Ask me!",
      "🤖 I know Uzbekistan's eco-laws",
      "🌱 Get personalized eco-tips",
      "📊 Check your recycling impact",
    ],
    uz: [
      "♻️ Qanday saralashni bilmayapsizmi?",
      "🤖 Ekologiya qonunlarini bilaman",
      "🌱 Shaxsiy eko-maslahatlar oling",
      "📊 Qayta ishlash ta'siringizni tekshiring",
    ],
    ru: [
      "♻️ Не знаете, как сортировать?",
      "🤖 Знаю эко-законы Узбекистана",
      "🌱 Получите эко-советы",
      "📊 Проверьте свой эко-вклад",
    ],
  }), []);

  // Cycle CTA messages
  useEffect(() => {
    if (isOpen || !showCta) return;
    const interval = setInterval(() => {
      setCtaIndex(prev => {
        const lang = i18n.language as string;
        const msgs = ctaMessages[lang] || ctaMessages.en;
        const next = (prev + 1) % msgs.length;
        if (next === 0) {
          ctaCycleCount.current += 1;
          if (ctaCycleCount.current >= 3) {
            setShowCta(false);
          }
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, showCta, i18n.language, ctaMessages]);

  const defaultMessages: Message[] = useMemo(() => [{
    id: 'welcome',
    role: 'model' as const,
    text: getWelcomeText(i18n.language)
  }], []);

  const [messages, setMessages] = useState<Message[]>(() => {
    return loadMessages() || defaultMessages;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isTyping]);

  // Update welcome message text when language changes
  useEffect(() => {
    setMessages(prev => prev.map(m => {
      if (m.id === 'welcome') {
        return { ...m, text: getWelcomeText(i18n.language) };
      }
      return m;
    }));
  }, [i18n.language]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    // Re-focus the input after sending — prevents iOS keyboard from dismissing
    // Use a microtask delay so React has re-rendered first
    setTimeout(() => inputRef.current?.focus(), 50);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const progress = loadUserProgress();
      const userInfo = progress ? {
        displayName: progress.name,
        coins: progress.ecoCoins,
        points: progress.ecoPoints,
        level: progress.level,
        location: "Uzbekistan",
        school: "School #45, Chilonzor District",
      } : undefined;

      const reply = await getEcoCoachResponse(textToSend, history, i18n.language, userInfo);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: reply
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    const freshMessages = [{
      id: 'welcome',
      role: 'model' as const,
      text: getWelcomeText(i18n.language)
    }];
    setMessages(freshMessages);
    saveMessages(freshMessages);
  };

  // Don't show this widget on the main EcoCoach page
  if (location.pathname === '/coach') return null;

  return (
    // bottom position: standard float position on mobile, clearing the bottom navigation bar beautifully
    <div
      className="fixed right-4 z-[45] flex flex-col items-end pointer-events-auto select-none"
      style={{
        bottom: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 90px)' : '24px',
      }}
    >
      
      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.95 }}
            className="w-[calc(100vw-2rem)] sm:w-[390px] md:w-[410px] max-h-[calc(100vh-8.5rem)] h-[550px] bg-slate-950/90 backdrop-blur-3xl border border-white/[0.08] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden mb-4 mr-0 sm:mr-2"
          >
            {/* Header - World Class Integrated Glass Design */}
            <div className="bg-slate-900/40 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img src="/images/ai-screens/Zami-bot-avatar.jpg" alt="Zami Bot" className="h-8 w-8 rounded-full object-cover border border-white/10" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-100 tracking-wide">Zami AI Assistant</span>
                  <span className="text-[9px] text-emerald-400 font-semibold tracking-wide">Online & Ready</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button
                    onClick={clearChat}
                    className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                    title="Clear chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <Link 
                  to="/coach" 
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-bold px-2.5 py-1 rounded-lg mr-1 flex items-center gap-1 transition-all border border-emerald-500/15"
                >
                  {i18n.language === 'uz' ? 'To\'liq' : i18n.language === 'ru' ? 'Полный экран' : 'Full Page'} <ArrowRight className="h-3 w-3" />
                </Link>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages - Sleek Custom Scrollbar */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-gradient-to-b from-transparent to-slate-950/20">
              {messages.map((m) => (
                <motion.div 
                  key={m.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={cn(
                    "flex w-full items-start gap-2.5",
                    m.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {m.role === 'model' && (
                    <img src="/images/ai-screens/Zami-bot-avatar.jpg" alt="Zami Bot" className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0" />
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm",
                    m.role === 'user'
                      ? "bg-emerald-600/15 border border-emerald-500/20 text-emerald-100 rounded-tr-none text-left font-medium"
                      : "bg-white/[0.04] border border-white/[0.08] text-slate-200 rounded-tl-none text-left"
                  )}>
                    {m.role === 'model' ? renderMarkdown(m.text) : m.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex w-full items-start gap-2.5 justify-start">
                  <img src="/images/ai-screens/Zami-bot-avatar.jpg" alt="Zami Bot" className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0" />
                  <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-tl-none px-3.5 py-2.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400/80 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-400/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-400/80 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form - Seamless Sleek Overlay */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="bg-slate-950/60 border-t border-white/[0.06] p-3 flex items-center gap-2"
            >
              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={2000}
                placeholder={i18n.language === 'uz' ? "Yozing..." : i18n.language === 'ru' ? "Напишите..." : "Type here..."}
                className="flex-1 bg-white/[0.03] border border-white/[0.08] hover:border-white/20 focus:border-emerald-500/50 text-white placeholder-slate-500 h-10 px-3.5 rounded-xl text-xs transition-all focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-white/[0.05]"
              />
              <Button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                size="icon"
                className="h-10 w-10 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-emerald-500/10"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button + CTA */}
      <div className="flex items-center gap-2.5">
        {/* CTA Speech Bubble - Minimalistic design with glassmorphism style */}
        <AnimatePresence>
          {!isOpen && showCta && (
            <motion.div
              initial={{ opacity: 0, x: -8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -4, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mr-2 mb-1"
            >
              <button
                onClick={() => { setShowCta(false); setIsOpen(true); }}
                className="relative bg-slate-950/95 backdrop-blur-md border border-white/10 text-slate-200 text-[10px] font-semibold leading-relaxed pl-3 pr-7 py-2 rounded-xl shadow-lg hover:shadow-xl hover:border-emerald-400/50 transition-all duration-200 max-w-[170px] cursor-pointer text-left"
              >
                {(ctaMessages[i18n.language] || ctaMessages.en)[ctaIndex]}
                {/* Dismiss X */}
                <span
                  onClick={(e) => { e.stopPropagation(); setShowCta(false); }}
                  className="absolute top-1 right-1.5 text-slate-400 hover:text-slate-200 text-[10px] leading-none cursor-pointer"
                >
                  ✕
                </span>
                {/* Triangle pointer */}
                <span className="absolute top-1/2 -translate-y-1/2 -right-[5px] w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-slate-950/95" />
                <span className="absolute top-1/2 -translate-y-1/2 -right-[6px] w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-white/10" style={{ zIndex: -1 }} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar Button */}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 select-none relative hover:shadow-xl flex-shrink-0"
        >
          {isOpen ? (
            <div className="h-14 w-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
              <X className="h-5 w-5 text-white" />
            </div>
          ) : (
            <img
              src="/images/ai-screens/Zami-bot-avatar.jpg"
              alt="Zami Bot"
              className="h-14 w-14 rounded-full object-cover ring-2 ring-white/80 shadow-lg"
            />
          )}
        </button>
      </div>

    </div>
  );
}
