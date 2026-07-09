import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Send, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getEcoCoachResponse } from '@/lib/gemini';
import { loadUserProgress } from '@/lib/userProgress';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const STORAGE_KEY = 'zami_bot_chat';

/** Parse simple markdown (bold, bullet points, headers, lists) into React elements */
function renderMarkdown(text: string, role: 'user' | 'model' = 'model'): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const isUser = role === 'user';
  const listColor = isUser ? 'text-slate-100' : 'text-slate-600';
  const listTextColor = isUser ? 'text-slate-200 leading-relaxed text-left' : 'text-slate-600 leading-relaxed text-left';
  const boldColor = isUser ? 'text-white font-bold' : 'text-slate-900 font-bold';
  const boldItalicColor = isUser ? 'text-white font-extrabold italic' : 'text-slate-900 font-extrabold italic';
  const italicColor = isUser ? 'text-slate-200 italic' : 'text-slate-500 italic';
  const hrColor = isUser ? 'border-white/10' : 'border-slate-150';
  const h4Color = isUser ? 'text-emerald-300' : 'text-emerald-700';
  const h3Color = isUser ? 'text-emerald-200' : 'text-emerald-600';
  const h2Color = isUser ? 'text-white' : 'text-slate-900';
  const numColor = isUser ? 'flex items-start gap-2 my-1 text-slate-200' : 'flex items-start gap-2 my-1 text-slate-600';
  const numIndexColor = isUser ? 'text-emerald-400 font-extrabold text-xs mt-[1px] min-w-[16px]' : 'text-emerald-600 font-extrabold text-xs mt-[1px] min-w-[16px]';
  const paragraphColor = isUser ? 'text-slate-200 my-1 text-left' : 'text-slate-600 my-1 text-left';

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className={cn("space-y-1.5 my-2 pl-4 list-disc", listColor)}>
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
          <strong key={`${lineIdx}-bi-${i}`} className={boldItalicColor}>
            {part.slice(3, -3).replace(/\*/g, '')}
          </strong>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`${lineIdx}-b-${i}`} className={boldColor}>
            {part.slice(2, -2).replace(/\*/g, '')}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={`${lineIdx}-i-${i}`} className={italicColor}>
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
      elements.push(<hr key={`hr-${lineIdx}`} className={cn("my-3", hrColor)} />);
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h-${lineIdx}`} className={cn("text-xs font-black mt-3 mb-1.5 tracking-wider uppercase", h4Color)}>
          {renderInline(trimmed.slice(4), lineIdx)}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h-${lineIdx}`} className={cn("text-sm font-black mt-4 mb-2 tracking-wide", h3Color)}>
          {renderInline(trimmed.slice(3), lineIdx)}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h-${lineIdx}`} className={cn("text-base font-black mt-4 mb-2 tracking-wide", h2Color)}>
          {renderInline(trimmed.slice(2), lineIdx)}
        </h2>
      );
      return;
    }

    const bulletMatch = trimmed.match(/^[-•*]\s+(.*)/);
    if (bulletMatch) {
      listItems.push(
        <li key={`li-${lineIdx}`} className={listTextColor}>
          {renderInline(bulletMatch[1], lineIdx)}
        </li>
      );
      return;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      flushList();
      elements.push(
        <div key={`num-${lineIdx}`} className={numColor}>
          <span className={numIndexColor}>{numMatch[1]}.</span>
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
      <p key={`p-${lineIdx}`} className={paragraphColor}>
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
  const navigate = useNavigate();
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

  // Don't show this widget on full-screen / scanner / pitch pages
  if (['/coach', '/scanner', '/pitch', '/pitch-live'].includes(location.pathname)) return null;

  return (
    // bottom position: standard float position on mobile, clearing the bottom navigation bar beautifully
    <div
      className="fixed right-4 z-[9999] flex flex-col items-end pointer-events-auto select-none"
      style={{
        bottom: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 90px)' : '24px',
      }}
    >
      
      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-[calc(100vw-2rem)] sm:w-[390px] md:w-[410px] max-h-[calc(100vh-8.5rem)] h-[550px] bg-white border border-slate-200/80 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden mb-4 mr-0 sm:mr-2"
          >
            {/* Header - Premium Minimalist Light-Emerald Design */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="absolute h-2.5 w-2.5 rounded-full bg-emerald-500/30 animate-ping" />
                </div>
                <span className="text-sm font-bold text-slate-800 tracking-wide">Zami Bot</span>
              </div>
              <div className="flex items-center gap-1.5">
                {messages.length > 1 && (
                  <button
                    onClick={clearChat}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    setTimeout(() => {
                      navigate('/coach');
                    }, 250);
                  }}
                  className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-lg mr-1.5 transition-all border border-slate-200/60"
                >
                  {i18n.language === 'uz' ? 'To\'liq' : i18n.language === 'ru' ? 'Экран' : 'Full'}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages - Ultra Clean Borderless Chat bubbles */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin bg-slate-50/50">
              {messages.map((m) => (
                <motion.div 
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={cn(
                    "flex w-full items-start gap-3",
                    m.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {m.role === 'model' && (
                    <img src="/images/ai-screens/Zami-bot-avatar.jpg" alt="Zami Bot" className="h-8 w-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-[0_1px_2px_rgba(0,0,0,0.01)]",
                    m.role === 'user'
                      ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-tr-none text-left font-medium shadow-[0_4px_12px_rgba(16,185,129,0.12)]"
                      : "bg-white border border-slate-200/60 text-slate-700 rounded-tl-none text-left"
                  )}>
                    {m.role === 'model' ? renderMarkdown(m.text) : m.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex w-full items-start gap-3 justify-start">
                  <img src="/images/ai-screens/Zami-bot-avatar.jpg" alt="Zami Bot" className="h-8 w-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  <div className="bg-white border border-slate-200/60 rounded-2xl rounded-tl-none px-3.5 py-2.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form - Premium Flat Design */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="bg-white border-t border-slate-100 p-4 flex items-center gap-2"
            >
              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={2000}
                placeholder={i18n.language === 'uz' ? "Yozing..." : i18n.language === 'ru' ? "Напишите..." : "Type here..."}
                className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-emerald-500/50 focus:bg-white text-slate-800 placeholder-slate-400 h-10 px-3.5 rounded-xl text-xs transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                size="icon"
                className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white transition-all flex items-center justify-center shadow-md shadow-emerald-500/10 active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button + CTA */}
      {/* CTA Speech Bubble - Centered directly above the chatbot button */}
      <AnimatePresence>
        {!isOpen && showCta && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mb-2.5 mr-1 z-10"
          >
            <button
              onClick={() => { setShowCta(false); setIsOpen(true); }}
              className="relative text-slate-800 text-[10px] font-bold leading-relaxed px-3.5 py-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:border-white/50 transition-all duration-200 max-w-[170px] cursor-pointer text-left"
              style={{ 
                background: 'rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
              }}
            >
              {(ctaMessages[i18n.language] || ctaMessages.en)[ctaIndex]}
              {/* Dismiss X - Modern round badge */}
              <span
                onClick={(e) => { e.stopPropagation(); setShowCta(false); }}
                className="absolute -top-1.5 -right-1.5 bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold cursor-pointer shadow-sm transition-colors"
              >
                ✕
              </span>
              
              {/* Pointer triangle pointing DOWN towards the avatar */}
              <span 
                className="absolute bottom-[-5px] right-[23px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px]" 
                style={{ borderTopColor: 'rgba(255, 255, 255, 0.35)' }}
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          "h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 select-none relative hover:shadow-xl flex-shrink-0 border-2 overflow-hidden mr-1",
          isOpen ? "bg-slate-800 border-white/10" : "bg-zinc-900 border-white/80"
        )}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <img
            src="/images/ai-screens/Zami-bot-avatar.jpg"
            alt="Zami Bot"
            className="h-full w-full object-cover"
          />
        )}
      </button>

    </div>
  );
}
