import React, { useState, useEffect } from 'react';
import { Share, Download, X, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
  const { i18n } = useTranslation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Localized texts
  const t = (key: string) => {
    const lang = i18n.language || 'en';
    const dict: Record<string, Record<string, string>> = {
      en: {
        title: "Install ZAMINAT.eco App",
        desc: "Add to home screen for the best experience, offline access, and fast loading.",
        iosInstructions: "Tap Share button below and select 'Add to Home Screen'.",
        installBtn: "Install App",
        closeBtn: "Close",
      },
      ru: {
        title: "Установить ZAMINAT.eco",
        desc: "Добавьте на главный экран для быстрого доступа, оффлайн-режима и лучшей работы.",
        iosInstructions: "Нажмите кнопку «Поделиться» ниже и выберите «На экран «Домой»».",
        installBtn: "Установить",
        closeBtn: "Закрыть",
      },
      uz: {
        title: "ZAMINAT.eco App-ni o'rnatish",
        desc: "Tezroq ishlash, ohlash va oflayn rejim uchun asosiy ekranga qo'shing.",
        iosInstructions: "Quyidagi 'Ulashish' (Share) tugmasini bosing va 'Asosiy ekranga qo'shish'ni tanlang.",
        installBtn: "O'rnatish",
        closeBtn: "Yopish",
      }
    };
    return (dict[lang] || dict['en'])[key] || key;
  };

  useEffect(() => {
    // 1. Check if already running in standalone/installed mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    if (standalone) return;

    // 2. Custom event listener to trigger install from outside (like from the robot button)
    const handleTriggerInstall = () => {
      setShowPrompt(true);
    };
    window.addEventListener('trigger-pwa-install', handleTriggerInstall);

    // 3. Check if dismissed before in this session / period
    const isDismissed = localStorage.getItem('zaminat_install_prompt_dismissed');
    let shouldShow = true;
    if (isDismissed) {
      const dismissedTime = parseInt(isDismissed, 10);
      if (Date.now() - dismissedTime < 3 * 24 * 60 * 60 * 1000) {
        shouldShow = false;
      }
    }

    // 4. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    if (ios) {
      if (shouldShow) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 4000);
        return () => {
          clearTimeout(timer);
          window.removeEventListener('trigger-pwa-install', handleTriggerInstall);
        };
      }
    } else {
      // Android / Desktop PWA prompt listener
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        if (shouldShow) {
          setShowPrompt(true);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('trigger-pwa-install', handleTriggerInstall);
      };
    }

    return () => {
      window.removeEventListener('trigger-pwa-install', handleTriggerInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback if event hasn't fired yet
      alert(i18n.language === 'uz' ? "Brauzeringiz menyusidan 'O'rnatish'ni tanlang" : i18n.language === 'ru' ? "Выберите 'Установить' в меню браузера" : "Select 'Install' from your browser menu");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('zaminat_install_prompt_dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="fixed bottom-[calc(7.5rem+env(safe-area-inset-bottom))] md:bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[999] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-emerald-100/50 dark:border-slate-800/80 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 select-none"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-850 dark:text-white leading-tight">
                  {t('title')}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-light">
                  {t('desc')}
                </p>
              </div>
            </div>
            <button 
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isIOS ? (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-3 border border-emerald-100/30 flex items-start gap-3">
              <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm shrink-0 flex items-center justify-center">
                <Share className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                {t('iosInstructions')}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                onClick={handleDismiss}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white px-3 py-2 transition-colors font-medium"
              >
                {t('closeBtn')}
              </button>
              <button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-4.5 py-2 rounded-xl shadow-md shadow-emerald-600/10 transition-all duration-200 flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                {t('installBtn')}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
