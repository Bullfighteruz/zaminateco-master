import { Vote, Calendar, ShoppingBag, BookOpen, User, Home, Users, Handshake, Mail, Cpu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import PrefetchLink from './PrefetchLink';

const navigationItems = [
  { path: '/', icon: Home, labelKey: 'home' as const },
  { path: '/vote', icon: Vote, labelKey: 'ecoVote' as const },
  { path: '/actions', icon: Calendar, labelKey: 'ecoActions' as const },
  { path: '/pitch', icon: Cpu, labelKey: 'ai' as const, badge: 'New' },
  { path: '/shop', icon: ShoppingBag, labelKey: 'shop' as const },
  { path: '/stories', icon: BookOpen, labelKey: 'stories' as const },
  { path: '/profile', icon: User, labelKey: 'profile' as const }
];

const secondaryNavigationItems = [
  { path: '/partners', icon: Handshake, labelKey: 'partners' as const },
  { path: '/team', icon: Users, labelKey: 'team' as const },
  { path: '/contacts', icon: Mail, labelKey: 'contacts' as const }
];

export default function Navigation() {
  const location = useLocation();
  const { t, i18n } = useTranslation('common'); // Specify 'common' namespace

  // Helper function to get translation with proper fallback and mobile optimization
  const getTranslation = (key: string, isMobileNav: boolean = false): string => {
    if (key === 'ai') {
      return t('ai.tag', { defaultValue: 'AI Core' });
    }
    // For mobile navigation, use short versions for longer labels
    if (isMobileNav) {
      const shortKeyMap: Record<string, string> = {
        'ecoActions': 'ecoActionsShort',
        'home': 'homeShort',
        'ecoVote': 'ecoVoteShort',
        'shop': 'shopShort',
        'stories': 'storiesShort',
        'profile': 'profileShort'
      };
      
      if (shortKeyMap[key]) {
        const shortKey = shortKeyMap[key];
        const shortTranslation = t(shortKey, { ns: 'common' });
        if (shortTranslation && shortTranslation !== shortKey) {
          return shortTranslation;
        }
      }
    }
    
    // Explicitly get translation from 'common' namespace
    const translation = t(key, { ns: 'common' });
    
    // If translation is missing or returns the key, use explicit fallbacks
    if (!translation || translation === key) {
      const fallbacks: Record<string, Record<string, string>> = {
        en: { 
          ecoActions: 'EcoActions', 
          ecoActionsShort: 'Actions',
          home: 'Home',
          homeShort: 'Home'
        },
        ru: { 
          ecoActions: 'ЭкоДействия', 
          ecoActionsShort: 'Действия',
          home: 'Главная',
          homeShort: 'Главная'
        },
        uz: { 
          ecoActions: 'EkoHarakatlar', 
          ecoActionsShort: 'Harakatlar',
          home: 'Bosh sahifa',
          homeShort: 'Bosh'
        }
      };
      const currentLang = i18n.language || 'en';
      const langKey = currentLang.split('-')[0]; // Get base language (en, ru, uz)
      const shortKeyMap: Record<string, string> = {
        'ecoActions': 'ecoActionsShort',
        'home': 'homeShort'
      };
      const fallbackKey = isMobileNav && shortKeyMap[key] ? shortKeyMap[key] : key;
      return fallbacks[langKey as keyof typeof fallbacks]?.[fallbackKey] || key;
    }
    
    return translation;
  };

  return (
    <>
      {/* Main Bottom Navigation - Pinned to bottom, centered, not full-width */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-0 mobile-nav">
        <div className="bg-white border-t border-gray-200 shadow-lg rounded-t-2xl px-3 sm:px-4 py-2.5">
          <div className="flex justify-around items-center gap-0.5 sm:gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <PrefetchLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg transition-colors min-w-0 smooth-transition hover-effect touch-feedback",
                    "relative",
                    isActive
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  )}
                >
                  {('badge' in item) && item.badge && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-extrabold text-[7px] px-1 py-0.2 rounded-full uppercase scale-90 border border-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  <Icon className="h-5 w-5 mb-0.5 sm:mb-1 flex-shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-medium text-center leading-tight whitespace-nowrap">
                    {getTranslation(item.labelKey, true)}
                  </span>
                </PrefetchLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Secondary Navigation (Desktop/Tablet) */}
      <div className="hidden md:block fixed top-4 right-4 z-40">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2">
          <div className="flex flex-col gap-2">
            {secondaryNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <PrefetchLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm smooth-transition hover-effect",
                    isActive
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{t(item.labelKey, { ns: 'common' })}</span>
                </PrefetchLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Secondary Navigation Menu */}
      <div className="md:hidden fixed top-4 right-4 z-40">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-1">
          <div className="flex gap-1">
            {secondaryNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <PrefetchLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-md transition-colors smooth-transition hover-effect touch-feedback btn-touch",
                    isActive
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  )}
                  title={t(item.labelKey, { ns: 'common' })}
                >
                  <Icon className="h-4 w-4" />
                </PrefetchLink>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}