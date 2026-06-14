import { Home, Vote, Calendar, ShoppingBag, BookOpen, User, Leaf, Globe } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useMemo, memo } from 'react';
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
}

// Mobile Language Switcher Component
const MobileLanguageSwitcher = () => {
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
        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border-2 border-gray-200/50 hover:border-green-400/60 hover:bg-white text-gray-800 shadow-md hover:shadow-lg transition-all duration-300">
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

const Layout = memo(function Layout({ children, title }: LayoutProps) {
  const location = useLocation();
  const { t } = useTranslation('common'); // Specify the common namespace
  const isHomePage = location.pathname === '/';
  const isMobile = useIsMobile();

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
    if (isMobile) {
      return items.filter(item => item.path !== '/stories');
    }
    return items;
  }, [t, getMobileLabel, isMobile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/15 to-teal-50/20 relative overflow-hidden">
      {/* Global background glow elements for Glassmorphism Depth */}
      <div className="bg-glow-orb bg-glow-emerald w-[500px] h-[500px] -top-20 -left-20 opacity-30 pointer-events-none" />
      <div className="bg-glow-orb bg-glow-teal w-[600px] h-[600px] top-1/3 -right-40 opacity-35 pointer-events-none" />
      <div className="bg-glow-orb bg-glow-emerald w-[450px] h-[450px] bottom-10 -left-20 opacity-25 pointer-events-none" />
      {/* Sticky Logo with "ZAMINAT.eco" - Top left with "roots of change" style background - Hidden on mobile and profile page */}
      {location.pathname !== '/profile' && (
      <div className="hidden md:block fixed top-4 left-4 z-50">
        <PrefetchLink to="/" className="block">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
            className="relative"
          >
            <div
              className="relative overflow-hidden rounded-xl shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.4) 0%, rgba(59, 130, 246, 0.4) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '2px solid rgba(34, 197, 94, 0.5)',
                padding: isMobile ? '6px 10px' : '8px 12px',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
              }}
            >
              {/* Decorative leaf icons */}
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-1 left-2 opacity-30"
                style={{ pointerEvents: 'none' }}
              >
                <Leaf className="w-4 h-4 text-white" />
              </motion.div>

              <motion.div
                animate={{
                  rotate: [0, -5, 5, 0],
                  scale: [1, 0.95, 1],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
                className="absolute bottom-1 right-2 opacity-25"
                style={{ pointerEvents: 'none' }}
              >
                <Leaf className="w-3 h-3 text-white" />
              </motion.div>

              {/* Logo and text content */}
              <div className="relative flex items-center gap-2 sm:gap-3">
                <img 
                  src="/logo.webp" 
                  alt="ZAMINAT.eco Logo" 
                  className={cn(
                    "flex-shrink-0 self-center",
                    isMobile ? "h-8 w-8" : "h-10 w-10"
                  )}
                  loading="eager"
                />
                <div className="flex flex-col justify-center items-start" style={{ marginTop: '5px' }}>
                  <h1 className={cn(
                    "font-bold text-white leading-tight",
                    isMobile ? "text-sm" : "text-base"
                  )} style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}>
                    ZAMINAT.eco
                  </h1>
                  <p className={cn(
                    "text-white/90 leading-tight",
                    isMobile ? "text-[10px]" : "text-xs"
                  )} style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}>
                    {t('tagline')}
                  </p>
                </div>
              </div>

              {/* Shine effect */}
              <motion.div
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                  repeatDelay: 2,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ transform: 'skewX(-20deg)', pointerEvents: 'none' }}
              />

              {/* Pulsing glow effect */}
              <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0"
                style={{ 
                  background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
                  pointerEvents: 'none' 
                }}
              />
            </div>
          </motion.div>
        </PrefetchLink>
      </div>
      )}

      {/* Sticky Language Switcher Button - Pinned to top right - Hidden on mobile */}
      <div className="hidden md:block fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      
      {/* Floating Language Switcher Button - Mobile */}
      <div className="md:hidden fixed top-3 right-3 z-40">
        <MobileLanguageSwitcher />
      </div>
      
      {/* Main content with bottom padding for navigation */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation - Floating Glassmorphic Island */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 flex justify-center notranslate" translate="no">
        <div className="glass-island rounded-2xl px-4 py-2 w-full max-w-lg transition-all duration-300 hover:shadow-[0_12px_40px_rgba(34,197,94,0.12)]">
          <div className="flex justify-between items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <PrefetchLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[52px] sm:min-w-[64px]",
                    "relative group",
                    isActive
                      ? "text-emerald-600 bg-emerald-500/10 font-semibold"
                      : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-500/5"
                  )}
                >
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
    </div>
  );
});

export default Layout;