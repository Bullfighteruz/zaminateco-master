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

      {/* ── Top-Right Responsive Language Switcher for all viewports ── */}
      <div
        className="fixed top-4 right-4 sm:top-5 sm:right-6 z-40"
        data-testid="layout-language-switcher"
      >
        <LanguageSwitcher darkMode={hideBottomNav} />
      </div>
      
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