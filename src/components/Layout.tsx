import React from 'react';
import { Home, Vote, Calendar, ShoppingBag, BookOpen, User, Globe, ScanLine } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useMemo, memo, useEffect } from 'react';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import PrefetchLink from './PrefetchLink';
import InstallPrompt from './InstallPrompt';
import { stripLanguagePrefix, replaceLanguageInPath, normalizeLanguage, type SupportedLanguage } from '@/lib/i18nRouting';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  hideBottomNav?: boolean;
}

const MobileLanguageSwitcher = ({ darkMode = false }: { darkMode?: boolean }) => {
  const { i18n } = useI18nTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages: Array<{ code: SupportedLanguage; flag: string; name: string }> = [
    { code: 'en', flag: '/images/en_flag.webp', name: 'English' },
    { code: 'uz', flag: '/images/uz_flag.webp', name: "O'zbekcha" },
    { code: 'ru', flag: '/images/ru_flag.webp', name: 'Русский' }
  ];
  
  const currentLang = normalizeLanguage(i18n.language);
  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  const handleLanguageChange = (languageCode: SupportedLanguage) => {
    i18n.changeLanguage(languageCode);
    const currentFull = location.pathname + location.search + location.hash;
    const newPath = replaceLanguageInPath(currentFull, languageCode);
    navigate(newPath, { replace: true });
    document.documentElement.lang = languageCode;
    try {
      localStorage.setItem('i18nextLng', languageCode);
    } catch {}
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Select language. Current: ${currentLanguage.name}`}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md border-2 shadow-md transition-all duration-300",
            darkMode
              ? "bg-black/70 border-white/10 hover:border-white/25 hover:bg-black/80 text-white/90 active:scale-95"
              : "bg-white/90 border-gray-200/50 hover:border-green-400/60 hover:bg-white text-gray-800 active:scale-95"
          )}
        >
          <Globe className="h-5 w-5 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={12}
        className="w-[180px] p-2 bg-white/98 backdrop-blur-xl border-2 border-gray-200/60 shadow-2xl rounded-xl"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {languages.map((language) => {
          const isSelected = currentLanguage.code === language.code;
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                "flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all",
                isSelected
                  ? "bg-green-50 text-green-800 font-semibold"
                  : "hover:bg-gray-50"
              )}
            >
              <img
                src={language.flag}
                alt=""
                className="h-5 w-7 object-cover rounded-sm border border-gray-200"
              />
              <span className="text-sm font-medium">{language.name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Layout = memo(function Layout({ children, title, hideBottomNav }: LayoutProps) {
  const location = useLocation();
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();
  
  // ── Scroll-direction tracking (hysteresis-based) ──
  const visible = useScrollDirection(isMobile ? 40 : 25);

  useEffect(() => {
    if (window.self !== window.top) {
      document.documentElement.classList.add('in-iframe');
    } else {
      document.documentElement.classList.remove('in-iframe');
    }
  }, []);

  const currentPathWithoutLang = stripLanguagePrefix(location.pathname);

  const getMobileLabel = useMemo(() => {
    return (key: string): string => {
      const shortKeyMap: Record<string, string> = {
        'ecoActions': 'ecoActionsShort',
        'home': 'homeShort'
      };
      if (shortKeyMap[key]) {
        const shortKey = shortKeyMap[key];
        const shortLabel = t(shortKey, { ns: 'common' });
        if (shortLabel && shortLabel !== shortKey) {
          return shortLabel;
        }
      }
      return t(key, { ns: 'common' });
    };
  }, [t]);

  const leftNavItems = useMemo(() => [
    { path: '/', icon: Home, label: getMobileLabel('home') },
    { path: '/vote', icon: Vote, label: t('ecoVote') },
    { path: '/actions', icon: Calendar, label: getMobileLabel('ecoActions') },
  ], [t, getMobileLabel]);

  const rightNavItems = useMemo(() => [
    { path: '/shop', icon: ShoppingBag, label: t('shop') },
    { path: '/stories', icon: BookOpen, label: t('stories') },
    { path: '/profile', icon: User, label: t('profile') },
  ], [t]);

  const isScannerActive = currentPathWithoutLang === '/scanner';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/15 to-teal-50/20 relative">
      {/* Background glow orbs */}
      {!isMobile && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          <div className="bg-glow-orb bg-glow-emerald w-[500px] h-[500px] -top-20 -left-20 opacity-30" />
          <div className="bg-glow-orb bg-glow-teal w-[600px] h-[600px] top-1/3 -right-40 opacity-35" />
          <div className="bg-glow-orb bg-glow-emerald w-[450px] h-[450px] bottom-10 -left-20 opacity-25" />
        </div>
      )}

      {/* Floating Language Switcher for mobile (top-right) */}
      {isMobile && (
        <div className="fixed top-4 right-4 z-40">
          <MobileLanguageSwitcher darkMode={hideBottomNav} />
        </div>
      )}
      
      {/* Main content */}
      <main className={hideBottomNav ? '' : 'pb-nav-safe'}>
        {children}
      </main>

      {/* ── Bottom Navigation ── */}
      {!hideBottomNav && (
        <nav 
          className="fixed left-3 right-3 z-50 flex justify-center notranslate" 
          translate="no"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
            transform: isMobile ? 'translate3d(0, 0, 0)' : (visible ? 'translate3d(0, 0, 0)' : 'translate3d(0, calc(100% + 24px), 0)'),
            transition: isMobile ? 'none' : 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            willChange: isMobile ? 'auto' : 'transform',
          }}
        >
          <div className="relative w-full max-w-xl">
            {/* Center AI Scan — elevated circle above nav bar */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-20">
              <PrefetchLink
                to="/scanner"
                className={cn(
                  "flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 active:scale-90",
                  "border",
                  isScannerActive
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-md"
                    : "bg-white/70 backdrop-blur-xl border-gray-200/60 text-gray-500 shadow-sm hover:shadow-md hover:border-emerald-300 hover:text-emerald-600"
                )}
              >
                <ScanLine className="h-5.5 w-5.5" strokeWidth={1.8} />
              </PrefetchLink>
              <span className={cn(
                "absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-semibold tracking-wide whitespace-nowrap",
                isScannerActive ? "text-emerald-600" : "text-gray-400"
              )}>
                Scan
              </span>
            </div>

            {/* Navigation bar pill */}
            <div className="glass-island rounded-[1.75rem] px-3 py-2 w-full">
              <div className="flex justify-between items-center">
                {leftNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPathWithoutLang === item.path;
                  return (
                    <PrefetchLink
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-xl transition-colors duration-150 min-w-[44px] sm:min-w-[56px]",
                        "active:scale-90 touch-manipulation",
                        isActive
                          ? "text-emerald-600"
                          : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <Icon className="h-5 w-5 mb-0.5" strokeWidth={isActive ? 2 : 1.5} />
                      <span className={cn(
                        "text-[9px] text-center leading-tight whitespace-nowrap",
                        isActive ? "font-semibold" : "font-medium"
                      )}>
                        {item.label}
                      </span>
                    </PrefetchLink>
                  );
                })}

                <div className="w-16 sm:w-20 flex-shrink-0" />

                {rightNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPathWithoutLang === item.path;
                  return (
                    <PrefetchLink
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-xl transition-colors duration-150 min-w-[44px] sm:min-w-[56px]",
                        "active:scale-90 touch-manipulation",
                        isActive
                          ? "text-emerald-600"
                          : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <Icon className="h-5 w-5 mb-0.5" strokeWidth={isActive ? 2 : 1.5} />
                      <span className={cn(
                        "text-[9px] text-center leading-tight whitespace-nowrap",
                        isActive ? "font-semibold" : "font-medium"
                      )}>
                        {item.label}
                      </span>
                    </PrefetchLink>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
});

export default Layout;