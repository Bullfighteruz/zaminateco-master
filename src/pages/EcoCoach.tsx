import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Send, ArrowLeft, Trash2, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { getEcoCoachResponse } from '@/lib/gemini';
import { loadUserProgress } from '@/lib/userProgress';
import { getAvatarImage } from '@/lib/avatarImages';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useZamiConversation, Message } from '@/contexts/ZamiConversationContext';

const BOT_AVATAR = '/images/ai-screens/Zami-bot-avatar.avif';

// ── Markdown renderer ──────────────────────────────────────────────
function renderMarkdown(text: string, role: 'user' | 'model' = 'model'): React.ReactNode[] {
  const safeText = typeof text === 'string' ? text : String(text || '');
  const lines = safeText.split('\n');
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
  const numIndexColor = isUser ? 'text-emerald-400 font-extrabold text-xs mt-[1px] min-w-[16px]' : 'text-emerald-650 font-extrabold text-xs mt-[1px] min-w-[16px]';
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
    const safeContent = typeof content === 'string' ? content : String(content || '');
    const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    const parts = safeContent.split(regex);
    
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
      elements.push(<hr key={`hr-${lineIdx}`} className={cn("my-2", hrColor)} />);
      return;
    }

    if (trimmed.startsWith('#### ')) {
      flushList();
      elements.push(
        <h4 key={`h4-${lineIdx}`} className={cn("font-bold text-sm mt-3 mb-1 text-left", h4Color)}>
          {renderInline(trimmed.slice(5), lineIdx)}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${lineIdx}`} className={cn("font-bold text-sm mt-3 mb-1 text-left", h3Color)}>
          {renderInline(trimmed.slice(4), lineIdx)}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${lineIdx}`} className={cn("font-bold text-base mt-3 mb-1 text-left", h2Color)}>
          {renderInline(trimmed.slice(3), lineIdx)}
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

function formatTime(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// ── Component ──────────────────────────────────────────────────────
export default function EcoCoach() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { messages, isTyping, sendMessage, clearConversation } = useZamiConversation();
  
  const [userProgress, setUserProgress] = useState(() => loadUserProgress());
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen to local progress updates
  useEffect(() => {
    const handleUpdate = () => {
      setUserProgress(loadUserProgress());
    };
    window.addEventListener('userProgressUpdated', handleUpdate);
    return () => window.removeEventListener('userProgressUpdated', handleUpdate);
  }, []);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setInputText('');
    await sendMessage(textToSend);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    clearConversation();
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout hideBottomNav={true}>
      {/* Full-screen fixed chat container */}
      <div className="fixed inset-0 flex flex-col bg-slate-50">
        {/* Subtle ambient texture */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-600/[0.03] rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-teal-600/[0.02] rounded-full blur-[120px]" />
        </div>

        {/* ─── Header ─── */}
        <header className="relative z-20 flex-shrink-0 border-b border-slate-100 bg-white shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:inline">{t('scanner.back', { defaultValue: 'Back' })}</span>
            </button>

            <div className="flex items-center gap-2.5">
              <img
                src={BOT_AVATAR}
                alt="Zami Bot"
                className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-tight">Zami Bot</span>
                <span className="text-[10px] text-emerald-600/80 font-bold leading-tight">
                  {i18n.language === 'uz' ? 'Onlayn' : i18n.language === 'ru' ? 'Онлайн' : 'Online'}
                </span>
              </div>
            </div>

            <button
              onClick={clearChat}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ─── Messages ─── */}
        <div className="flex-1 overflow-y-auto relative z-10 bg-slate-50/50">
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
                      className="h-7 w-7 rounded-full object-cover border border-slate-200 flex-shrink-0 mb-5"
                    />
                  )}

                  <div className="flex flex-col max-w-[82%] sm:max-w-[75%]">
                    <div className={cn(
                      "rounded-2xl px-4 py-3 text-[13px] leading-[1.65] shadow-[0_1px_2px_rgba(0,0,0,0.01)]",
                      message.role === 'user'
                        ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-br-none shadow-[0_4px_12px_rgba(16,185,129,0.12)]"
                        : "bg-white border border-slate-200/60 text-slate-700 rounded-bl-none"
                    )}>
                      {message.role === 'model' ? renderMarkdown(message.text, 'model') : message.text}
                      {message.role === 'model' && message.searchUsed && message.sources && message.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px]">
                          <span className="font-semibold text-slate-500 flex items-center gap-1">
                            <Globe className="h-3 w-3 text-emerald-600" />
                            {i18n.language === 'uz' ? 'Manbalar:' : i18n.language === 'ru' ? 'Источники:' : 'Sources:'}
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {message.sources.map((src, idx) => (
                              <a
                                key={idx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-medium transition-colors border border-slate-200/60 max-w-[200px] truncate"
                              >
                                <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                                <span className="truncate">{src.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] mt-1 px-1 font-light",
                      message.role === 'user' ? "text-slate-400 text-right" : "text-slate-400 text-left"
                    )}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  {/* User avatar placeholder */}
                  {message.role === 'user' && (
                    <div className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0 mb-5 flex items-center justify-center">
                      {userProgress?.activeAvatar && getAvatarImage(userProgress.activeAvatar) ? (
                        <img 
                          src={getAvatarImage(userProgress.activeAvatar)} 
                          alt="User Avatar" 
                          className="h-full w-full object-cover border border-slate-200 rounded-full" 
                        />
                      ) : (
                        <div className="h-full w-full bg-emerald-50 border border-emerald-100 flex items-center justify-center rounded-full">
                          <span className="text-[10px] font-bold text-emerald-600">
                            {(userProgress?.name || user?.displayName || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
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
                    className="h-7 w-7 rounded-full object-cover border border-slate-200 flex-shrink-0 mb-5"
                  />
                  <div className="bg-white border border-slate-200/60 rounded-2xl rounded-bl-none px-5 py-3.5 flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                    <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ─── Footer: Suggestions + Input ─── */}
        <footer className="relative z-20 flex-shrink-0 border-t border-slate-100 bg-white/95 backdrop-blur-md">
          <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
            {/* Quick suggestions — only when conversation just started */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(s)}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-350 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 h-11 px-4 text-base md:text-[13px] focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:ring-offset-0 focus-visible:border-emerald-500/30 focus:bg-white transition-all"
                />
              </div>
              <Button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                size="icon"
                className="h-11 w-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:bg-slate-100 disabled:text-slate-400 flex-shrink-0 active:scale-95 shadow-md shadow-emerald-500/10"
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
