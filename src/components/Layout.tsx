import { Home, Vote, Calendar, ShoppingBag, BookOpen, User, Leaf, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTranslation as useI18nTranslation } from 'react-i18next';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

// Mobile Language Switcher Component
const MobileLanguageSwitcher = () => {
  const { i18n } = useI18nTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'en', flag: '/images/en_flag.png', name: 'English' },
    { code: 'uz', flag: '/images/uz_flag.png', name: 'O\'zbekcha' },
    { code: 'ru', flag: '/images/ru_flag.png', name: 'Русский' }
  ];
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex flex-col items-center justify-center">
          <Globe className="h-5 w-5 mb-0.5 flex-shrink-0" />
          <span className="text-[9px] font-medium text-center leading-tight whitespace-nowrap">
            {currentLanguage.code.toUpperCase()}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        side="top"
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

export default function Layout({ children, title }: LayoutProps) {
  const location = useLocation();
  const { t } = useTranslation('common'); // Specify the common namespace
  const isHomePage = location.pathname === '/';
  const isMobile = useIsMobile();

  // Helper to get mobile-friendly labels
  const getMobileLabel = (key: string): string => {
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

  const navItems = [
    { path: '/', icon: Home, label: getMobileLabel('home') },
    { path: '/vote', icon: Vote, label: t('ecoVote') },
    { path: '/actions', icon: Calendar, label: getMobileLabel('ecoActions') },
    { path: '/shop', icon: ShoppingBag, label: t('shop') },
    { path: '/stories', icon: BookOpen, label: t('stories') },
    { path: '/profile', icon: User, label: t('profile') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Logo with "ZAMINAT.eco" - Top left with "roots of change" style background - Hidden on mobile and profile page */}
      {location.pathname !== '/profile' && (
      <div className="hidden md:block fixed top-4 left-4 z-50">
        <Link to="/" className="block">
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
                  src="/logo.png" 
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
        </Link>
      </div>
      )}

      {/* Sticky Language Switcher Button - Pinned to top right - Hidden on mobile */}
      <div className="hidden md:block fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      
      {/* Main content with bottom padding for navigation */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation - Pinned to bottom, centered, not full-width */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-0">
        <div className="bg-white border-t border-gray-200 shadow-lg rounded-t-2xl px-3 sm:px-4 py-2.5">
          <div className="flex justify-around items-center gap-0.5 sm:gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg transition-colors min-w-0",
                    "relative",
                    isActive
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  )}
                >
                  <Icon className="h-5 w-5 mb-0.5 sm:mb-1 flex-shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-medium text-center leading-tight whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              );
            })}
            
            {/* Language Switcher - Only visible on mobile */}
            <div className="md:hidden flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors text-gray-600 hover:text-green-600 hover:bg-green-50">
              <MobileLanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}