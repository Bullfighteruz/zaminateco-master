import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getEcoCoachResponse } from '@/lib/gemini';
import { loadUserProgress } from '@/lib/userProgress';
import { toast } from 'sonner';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  searchUsed?: boolean;
  sources?: Array<{ title: string; url: string }>;
}

export interface ZamiConversationContextType {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (textToSend: string) => Promise<void>;
  clearConversation: () => void;
}

const ZAMI_STORAGE_KEY = 'zami_bot_chat';

function getWelcomeText(lang: string): string {
  return lang === 'uz'
    ? "Salom! Men Zami Bot yordamchisiman. Chiqindilarni saralash, qayta ishlash, yaqin atrofdagi EcoPointlarni topish va eko-loyihalarimiz haqida savolingiz bo'lsa, yozib qoldiring!"
    : lang === 'ru'
    ? "Привет! Я помощник Zami Bot. Задайте любой вопрос о сортировке отходов, переработке, поиске ближайших EcoPoints или о наших эко-проектах!"
    : "Hello! I'm Zami Bot. Ask me anything about waste sorting, recycling, finding nearby EcoPoints, or our eco-projects!";
}

function loadPersistedMessages(lang: string): Message[] {
  try {
    const stored = localStorage.getItem(ZAMI_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((m: any) => ({
          id: m.id || String(Date.now()),
          role: m.role === 'user' ? 'user' : 'model',
          text: typeof m.text === 'string'
            ? m.text
            : (m.text && typeof m.text === 'object' && typeof m.text.text === 'string' ? m.text.text : String(m.text || '')),
          timestamp: m.timestamp && !isNaN(new Date(m.timestamp).getTime())
            ? m.timestamp
            : new Date().toISOString(),
          searchUsed: Boolean(m.searchUsed),
          sources: Array.isArray(m.sources) ? m.sources : [],
        }));
      }
    }
  } catch { /* ignore parse error */ }

  return [{
    id: 'welcome',
    role: 'model',
    text: getWelcomeText(lang),
    timestamp: new Date().toISOString()
  }];
}

function savePersistedMessages(messages: Message[]) {
  try {
    localStorage.setItem(ZAMI_STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  } catch { /* storage full */ }
}

const ZamiConversationContext = createContext<ZamiConversationContextType | undefined>(undefined);

export const ZamiConversationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>(() => loadPersistedMessages(i18n.language));
  const [isTyping, setIsTyping] = useState(false);

  // Sync welcome message text on language change if present
  useEffect(() => {
    setMessages(prev => prev.map(m =>
      m.id === 'welcome' ? { ...m, text: getWelcomeText(i18n.language) } : m
    ));
  }, [i18n.language]);

  // Persist to localStorage whenever messages state changes
  useEffect(() => {
    savePersistedMessages(messages);
  }, [messages]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
      timestamp: new Date().toISOString()
    };

    // Construct Gemini history from PRIOR messages only (excluding welcome and current message)
    const history = messages
      .filter(m => m.id !== 'welcome' && m.id !== userMessage.id && typeof m.text === 'string' && m.text.trim().length > 0)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const progress = loadUserProgress();
      const userInfo = progress ? {
        displayName: progress.name,
        coins: progress.ecoCoins,
        points: progress.ecoPoints,
        level: progress.level,
        location: "Uzbekistan",
        school: "School #45, Chilonzor District",
      } : undefined;

      const botResponse = await getEcoCoachResponse(trimmed, history, i18n.language, userInfo);
      const responseText = typeof botResponse?.text === 'string' ? botResponse.text : String(botResponse?.text || '');

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        searchUsed: Boolean(botResponse?.searchUsed),
        sources: Array.isArray(botResponse?.sources) ? botResponse.sources : [],
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch {
      toast.error("Failed to get response");
    } finally {
      setIsTyping(false);
    }
  };

  const clearConversation = () => {
    const freshWelcome: Message = {
      id: 'welcome',
      role: 'model',
      text: getWelcomeText(i18n.language),
      timestamp: new Date().toISOString()
    };
    setMessages([freshWelcome]);
    savePersistedMessages([freshWelcome]);
  };

  return (
    <ZamiConversationContext.Provider value={{ messages, isTyping, sendMessage, clearConversation }}>
      {children}
    </ZamiConversationContext.Provider>
  );
};

export function useZamiConversation(): ZamiConversationContextType {
  const context = useContext(ZamiConversationContext);
  if (!context) {
    throw new Error('useZamiConversation must be used within a ZamiConversationProvider');
  }
  return context;
}
