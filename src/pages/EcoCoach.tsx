import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Send, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { getEcoCoachResponse } from '@/lib/gemini';
import { loadUserProgress } from '@/lib/userProgress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const COACH_STORAGE_KEY = 'zami_bot_chat';
const BOT_AVATAR = '/images/ai-screens/Zami-bot-avatar.jpg';

// ── Markdown renderer ──────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-1 my-1.5 pl-0.5">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  const renderInline = (content: string, lineIdx: number): React.ReactNode[] => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${lineIdx}-b-${i}`} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      return <span key={`${lineIdx}-t-${i}`}>{part}</span>;
    });
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Heading lines (### or ##)
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h-${lineIdx}`} className="text-[13px] font-bold text-emerald-300 mt-3 mb-1 tracking-wide">
          {trimmed.slice(4)}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h-${lineIdx}`} className="text-sm font-bold text-emerald-200 mt-3 mb-1">
          {trimmed.slice(3)}
        </h3>
      );
      return;
    }

    // Bullet lines
    const bulletMatch = trimmed.match(/^[-•*]\s+(.*)/);
    if (bulletMatch) {
      listItems.push(
        <li key={`li-${lineIdx}`} className="flex items-start gap-2 text-slate-200">
          <span className="text-emerald-400/70 mt-[3px] text-[10px] select-none">●</span>
          <span className="flex-1">{renderInline(bulletMatch[1], lineIdx)}</span>
        </li>
      );
      return;
    }

    // Numbered lines (e.g. "1. Something")
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      flushList();
      elements.push(
        <div key={`num-${lineIdx}`} className="flex items-start gap-2 my-0.5 text-slate-200">
          <span className="text-emerald-400/60 text-[11px] font-bold mt-[2px] min-w-[16px]">{numMatch[1]}.</span>
          <span className="flex-1">{renderInline(numMatch[2], lineIdx)}</span>
        </div>
      );
      return;
    }

    // Empty line
    if (!trimmed) {
      flushList();
      elements.push(<div key={`sp-${lineIdx}`} className="h-1.5" />);
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${lineIdx}`} className="text-slate-200 my-0.5">
        {renderInline(trimmed, lineIdx)}
      </p>
    );
  });

  flushList();
  return elements;
}

// ── Persistence ────────────────────────────────────────────────────
function loadCoachMessages(): Message[] | null {
  try {
    const stored = localStorage.getItem(COACH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(m => ({
          ...m,
          timestamp: m.timestamp && !isNaN(new Date(m.timestamp).getTime())
            ? m.timestamp
            : new Date().toISOString()
        }));
      }
    }
  } catch { /* ignore */ }
  return null;
}

function saveCoachMessages(messages: Message[]) {
  try {
    localStorage.setItem(COACH_STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  } catch { /* localStorage full */ }
}

// ── Component ──────────────────────────────────────────────────────
export default function EcoCoach() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const getWelcomeText = (lang: string) =>
    lang === 'uz'
      ? "Salom! Men Zami Bot yordamchisiman. Chiqindilarni saralash, qayta ishlash, yaqin atrofdagi EcoPointlarni topish va eko-loyihalarimiz haqida savolingiz bo'lsa, yozib qoldiring!"
      : lang === 'ru'
      ? "Привет! Я помощник Zami Bot. Задайте любой вопрос о сортировке отходов, переработке, поиске ближайших EcoPoints или о наших эко-проектах!"
      : "Hello! I'm Zami Bot. Ask me anything about waste sorting, recycling, finding nearby EcoPoints, or our eco-projects!";

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = loadCoachMessages();
    if (saved) return saved;
    return [{
      id: 'welcome',
      role: 'model',
      text: getWelcomeText(i18n.language),
      timestamp: new Date().toISOString()
    }];
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    if (i18n.language === 'uz') return [
      "Qanday materiallarni topshirish mumkin?",
      "Plastik idishlarni qanday tayyorlash kerak?",
      "Yaqin atrofdagi EcoPointlar qayerda?",
      "Eco Point tangalari nima beradi?"
    ];
    if (i18n.language === 'ru') return [
      "Какие материалы можно сдать?",
      "Как подготовить пластик?",
      "Где ближайшие EcoPoints?",
      "Что дают монеты Eco Points?"
    ];
    return [
      "What materials can I recycle?",
      "How to prepare plastic bottles?",
      "Where are the nearest EcoPoints?",
      "What can I buy with Eco Points?"
    ];
  }, [i18n.language]);

  useEffect(() => { saveCoachMessages(messages); }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    setMessages(prev => prev.map(m =>
      m.id === 'welcome' ? { ...m, text: getWelcomeText(i18n.language) } : m
    ));
  }, [i18n.language]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, parts: [{ text: m.text }] }));

      const progress = loadUserProgress();
      const userInfo = progress ? {
        displayName: progress.name,
        coins: progress.ecoCoins,
        points: progress.ecoPoints,
        level: progress.level,
        location: "Uzbekistan",
        school: "School #45, Chilonzor District",
      } : undefined;

      const replyText = await getEcoCoachResponse(textToSend, history, i18n.language, userInfo);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: replyText,
        timestamp: new Date().toISOString()
      }]);
    } catch {
      toast.error("Failed to get response");
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    const freshMessages: Message[] = [{
      id: 'welcome',
      role: 'model',
      text: i18n.language === 'uz'
        ? "Chat tozalandi. Sizga yana qanday yordam bera olaman?"
        : i18n.language === 'ru'
        ? "История очищена. Чем я могу ещё помочь?"
        : "Chat cleared. How else can I assist you today?",
      timestamp: new Date().toISOString()
    }];
    setMessages(freshMessages);
    saveCoachMessages(freshMessages);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout hideBottomNav={true}>
      {/* Full-screen fixed chat container */}
      <div className="fixed inset-0 flex flex-col bg-[#0c1117]">
        {/* Subtle ambient texture */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-600/[0.04] rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-teal-600/[0.03] rounded-full blur-[120px]" />
        </div>

        {/* ─── Header ─── */}
        <header className="relative z-20 flex-shrink-0 border-b border-white/[0.06]">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:inline">{t('scanner.back', { defaultValue: 'Back' })}</span>
            </button>

            <div className="flex items-center gap-2.5">
              <img
                src={BOT_AVATAR}
                alt="Zami Bot"
                className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white leading-tight">Zami Bot</span>
                <span className="text-[10px] text-emerald-400/80 font-medium leading-tight">
                  {i18n.language === 'uz' ? 'Onlayn' : i18n.language === 'ru' ? 'Онлайн' : 'Online'}
                </span>
              </div>
            </div>

            <button
              onClick={clearChat}
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.04] transition-colors"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ─── Messages ─── */}
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "flex w-full items-end gap-2.5",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {/* Bot avatar */}
                  {message.role === 'model' && (
                    <img
                      src={BOT_AVATAR}
                      alt="Zami Bot"
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0 mb-5"
                    />
                  )}

                  <div className="flex flex-col max-w-[82%] sm:max-w-[75%]">
                    <div className={cn(
                      "rounded-2xl px-4 py-3 text-[13px] leading-[1.65]",
                      message.role === 'user'
                        ? "bg-emerald-600 text-white rounded-br-md"
                        : "bg-white/[0.05] border border-white/[0.06] text-slate-200 rounded-bl-md"
                    )}>
                      {message.role === 'model' ? renderMarkdown(message.text) : message.text}
                    </div>
                    <span className={cn(
                      "text-[10px] mt-1 px-1 font-light",
                      message.role === 'user' ? "text-slate-500 text-right" : "text-slate-600 text-left"
                    )}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  {/* User avatar placeholder */}
                  {message.role === 'user' && (
                    <div className="h-7 w-7 rounded-full bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mb-5">
                      <span className="text-[10px] font-bold text-emerald-400">
                        {(user?.displayName || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex w-full items-end gap-2.5 justify-start"
                >
                  <img
                    src={BOT_AVATAR}
                    alt="Zami Bot"
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0 mb-5"
                  />
                  <div className="bg-white/[0.05] border border-white/[0.06] rounded-2xl rounded-bl-md px-5 py-3.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ─── Footer: Suggestions + Input ─── */}
        <footer className="relative z-20 flex-shrink-0 border-t border-white/[0.06] bg-[#0c1117]/90 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
            {/* Quick suggestions — only when conversation just started */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(s)}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-emerald-500/20 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    i18n.language === 'uz' ? "Savolingizni yozing..."
                    : i18n.language === 'ru' ? "Напишите вопрос..."
                    : "Type your message..."
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 h-11 px-4 text-[13px] focus-visible:ring-1 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-0 focus-visible:border-emerald-500/30 transition-all"
                />
              </div>
              <Button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                size="icon"
                className="h-11 w-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-30 disabled:bg-slate-700 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
