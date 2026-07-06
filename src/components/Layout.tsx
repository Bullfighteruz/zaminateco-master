import { Home, Vote, Calendar, ShoppingBag, BookOpen, User, Globe } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useMemo, memo, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import PrefetchLink from './PrefetchLink';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  hideBottomNav?: boolean;
}

// Mobile Language Switcher Component
const MobileLanguageSwitcher = ({ darkMode = false }: { darkMode?: boolean }) => {
  const { i18n } = useI18nTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'en', flag: '/images/en_flag.webp', name: 'English' },
    { code: 'uz', flag: '/images/uz_flag.webp', name: 'O\'zbekcha' },
    { code: 'ru', flag: '/images/ru_flag.webp', name: 'Русский' }
  ];
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md border-2 shadow-md hover:shadow-lg transition-all duration-300",
          darkMode 
            ? "bg-black/70 border-white/10 hover:border-white/25 hover:bg-black/80 text-white/90"
            : "bg-white/90 border-gray-200/50 hover:border-green-400/60 hover:bg-white text-gray-800"
        )}>
          <Globe className="h-5 w-5 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        side="bottom"
        sideOffset={8}
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
                alt={language.name}
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
  const { t } = useTranslation('common'); // Specify the common namespace
  const isHomePage = location.pathname === '/';
  const isMobile = useIsMobile();

  // Hide scrollbars when rendered within an iframe mockup
  useEffect(() => {
    if (window.self !== window.top) {
      document.documentElement.classList.add('in-iframe');
    } else {
      document.documentElement.classList.remove('in-iframe');
    }
  }, []);

  // Helper to get mobile-friendly labels - Memoized
  const getMobileLabel = useMemo(() => {
    return (key: string): string => {
      const shortKeyMap: Record<string, string> = {
        'ecoActions': 'ecoActionsShort',
        'home': 'homeShort'
      };
      
      if (shortKeyMap[key]) {
        const shortKey = shortKeyMap[key];
        const shortLabel = t(shortKey, { ns: 'common' });
        // If translation exists and is not the key itself, use it
        if (shortLabel && shortLabel !== shortKey) {
          return shortLabel;
        }
      }
      return t(key, { ns: 'common' });
    };
  }, [t]);

  // Memoize nav items to prevent unnecessary recalculations
  const navItems = useMemo(() => {
    const items = [
      { path: '/', icon: Home, label: getMobileLabel('home') },
      { path: '/vote', icon: Vote, label: t('ecoVote') },
      { path: '/actions', icon: Calendar, label: getMobileLabel('ecoActions') },
      { path: '/shop', icon: ShoppingBag, label: t('shop') },
      { path: '/stories', icon: BookOpen, label: t('stories') },
      { path: '/profile', icon: User, label: t('profile') }
    ];
    return items;
  }, [t, getMobileLabel, isMobile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/15 to-teal-50/20 relative">
      {/* Global background glow elements for Glassmorphism Depth wrapped in a clipped z-0 container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="bg-glow-orb bg-glow-emerald w-[500px] h-[500px] -top-20 -left-20 opacity-30" />
        <div className="bg-glow-orb bg-glow-teal w-[600px] h-[600px] top-1/3 -right-40 opacity-35" />
        <div className="bg-glow-orb bg-glow-emerald w-[450px] h-[450px] bottom-10 -left-20 opacity-25" />
      </div>


      {/* Sticky Language Switcher Button - Pinned to top right - Hidden on mobile */}
      {location.pathname !== '/pitch' && (
        <div className="hidden md:block fixed top-4 right-4 z-50">
          <LanguageSwitcher darkMode={hideBottomNav} />
        </div>
      )}
      
      {/* Floating Language Switcher Button - Mobile */}
      {location.pathname !== '/pitch' && (
        <div className="md:hidden fixed top-3 right-3 z-40">
          <MobileLanguageSwitcher darkMode={hideBottomNav} />
        </div>
      )}
      
      {/* Main content with bottom padding for navigation */}
      <main className={hideBottomNav ? '' : 'pb-20'}>
        {children}
      </main>

      {/* Bottom Navigation - Floating Glassmorphic Island */}
      {!hideBottomNav && (
        <nav className="fixed bottom-4 left-4 right-4 z-50 flex justify-center notranslate" translate="no">
          <div className="glass-island rounded-2xl px-4 py-2 w-full max-w-xl transition-all duration-300 hover:shadow-[0_12px_40px_rgba(34,197,94,0.12)]">
            <div className="flex justify-between items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <PrefetchLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[48px] sm:min-w-[64px]",
                      "relative group",
                      isActive
                        ? "text-emerald-600 bg-emerald-500/10 font-semibold"
                        : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-500/5"
                    )}
                  >
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-extrabold text-[7px] px-1 py-0.2 rounded-full uppercase scale-90 border border-white shadow-sm">
                        {item.badge}
                      </span>
                    )}
                    <Icon className={cn(
                      "h-5 w-5 mb-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                      isActive && "scale-105"
                    )} />
                    <span className="text-[9px] sm:text-[10px] font-medium text-center leading-tight whitespace-nowrap">
                      {item.label}
                    </span>
                    
                  </PrefetchLink>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
});

export default Layout;