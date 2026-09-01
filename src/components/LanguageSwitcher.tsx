import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSwitchLanguage } from '@/hooks/useSwitchLanguage';
import { stripLanguagePrefix, type SupportedLanguage } from '@/lib/i18nRouting';

const languages: Array<{ code: SupportedLanguage; flag: string; name: string; country: string }> = [
  { code: 'en', flag: '/images/en_flag.webp', name: 'English', country: 'US' },
  { code: 'uz', flag: '/images/uz_flag.webp', name: "O'zbekcha", country: 'UZ' },
  { code: 'ru', flag: '/images/ru_flag.webp', name: 'Русский', country: 'RU' },
];

export interface LanguageSwitcherProps {
  darkMode?: boolean;
  compact?: boolean;
  className?: string;
}

export default function LanguageSwitcher({
  darkMode = false,
  compact = false,
  className = '',
}: LanguageSwitcherProps) {
  const location = useLocation();
  const { currentLang, switchLanguage } = useSwitchLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find((language) => language.code === currentLang) || languages[0];
  const isPitchRoute = stripLanguagePrefix(location.pathname) === '/pitch';
  const isPitchStyle = darkMode && compact;

  // Pitch owns its language control inside PitchNavBar. Suppress Layout's global
  // non-compact instance on this route so two controls can never overlap.
  if (isPitchRoute && !compact) {
    return null;
  }

  const handleLanguageChange = (languageCode: SupportedLanguage) => {
    switchLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative z-50 notranslate', className)} translate="no">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <motion.div
          whileHover={isPitchStyle ? { y: -1 } : { scale: 1.025 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        >
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Select language. Current language: ${currentLanguage.name}`}
              className={cn(
                'group relative inline-flex select-none items-center justify-center overflow-hidden whitespace-nowrap transition-all duration-200',
                isPitchStyle
                  ? [
                      'h-9 min-w-[88px] rounded-full px-3',
                      'border border-white/[0.14] bg-slate-950/80 text-white',
                      'shadow-[0_8px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.06)]',
                      'backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/70',
                      'hover:border-white/20 hover:bg-slate-900/90 hover:text-white',
                      'focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                    ]
                  : [
                      darkMode ? 'bg-black/70 backdrop-blur-md' : 'bg-white/95 backdrop-blur-md',
                      darkMode ? 'border border-white/15' : 'border border-gray-200/60',
                      darkMode ? 'hover:border-white/30 hover:bg-black/85' : 'hover:border-emerald-400/60 hover:bg-white',
                      'shadow-md hover:shadow-lg',
                      darkMode ? 'text-white/90 hover:text-white' : 'text-gray-800 hover:text-gray-900',
                      'font-bold',
                      compact ? 'h-8 rounded-lg px-2.5 text-[11px]' : 'rounded-xl px-3 py-2 text-xs sm:text-sm',
                    ]
              )}
            >
              <span className={cn('relative z-10 flex items-center', isPitchStyle ? 'gap-2' : compact ? 'gap-1.5' : 'gap-2')}>
                <span
                  className={cn(
                    'relative flex-shrink-0 overflow-hidden bg-white/5',
                    isPitchStyle
                      ? 'h-[14px] w-5 rounded-[4px] ring-1 ring-white/20'
                      : compact
                        ? 'h-3.5 w-5 rounded-sm border border-gray-200/50 shadow-sm'
                        : 'h-4 w-6 rounded-sm border border-gray-200/50 shadow-sm sm:h-5 sm:w-7'
                  )}
                >
                  <img
                    src={currentLanguage.flag}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                  />
                </span>

                <span
                  className={cn(
                    'font-semibold uppercase leading-none',
                    isPitchStyle
                      ? 'text-[11px] tracking-[0.12em] text-white'
                      : compact
                        ? 'text-[11px] tracking-wide'
                        : 'text-xs tracking-wide sm:text-sm',
                    !isPitchStyle && (darkMode ? 'text-white/90' : 'text-gray-900')
                  )}
                >
                  {currentLanguage.code}
                </span>

                <motion.span
                  className="flex items-center justify-center"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <ChevronDown
                    className={cn(
                      isPitchStyle ? 'h-3.5 w-3.5 text-white/55 group-hover:text-white/80' : compact ? 'h-3 w-3' : 'h-3.5 w-3.5',
                      !isPitchStyle && (darkMode ? 'text-white/50 group-hover:text-white/80' : 'text-gray-500 group-hover:text-emerald-600')
                    )}
                    strokeWidth={2}
                  />
                </motion.span>
              </span>
            </Button>
          </DropdownMenuTrigger>
        </motion.div>

        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={isPitchStyle ? 10 : 8}
          collisionPadding={16}
          avoidCollisions
          className={cn(
            'z-50 overflow-hidden',
            isPitchStyle
              ? [
                  'w-[190px] rounded-2xl p-1.5',
                  'border border-white/10 bg-slate-950/95 text-white',
                  'shadow-[0_20px_60px_rgba(0,0,0,0.38)] backdrop-blur-2xl',
                ]
              : [
                  'w-[210px] rounded-xl p-2',
                  darkMode
                    ? 'border border-white/15 bg-gray-950/95 text-white shadow-2xl backdrop-blur-2xl'
                    : 'border-2 border-gray-200/60 bg-white/98 text-gray-900 shadow-2xl backdrop-blur-xl',
                ]
          )}
          style={{
            maxWidth: isPitchStyle ? 'min(190px, calc(100vw - 1.5rem))' : 'min(210px, calc(100vw - 2rem))',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          {languages.map((language) => {
            const isSelected = currentLanguage.code === language.code;

            return (
              <DropdownMenuItem
                key={language.code}
                onSelect={() => handleLanguageChange(language.code)}
                className={cn(
                  'group/item flex cursor-pointer items-center outline-none transition-colors duration-150',
                  isPitchStyle
                    ? [
                        'min-h-11 gap-2.5 rounded-xl px-2.5 py-2',
                        isSelected
                          ? 'bg-white/[0.09] text-white'
                          : 'text-white/72 hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white',
                      ]
                    : [
                        'gap-3 rounded-lg p-2.5 sm:p-3',
                        isSelected
                          ? darkMode
                            ? 'border border-emerald-500/30 bg-emerald-500/20 font-bold text-emerald-300'
                            : 'border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-teal-50 font-bold text-emerald-900'
                          : darkMode
                            ? 'text-white/80 hover:bg-white/10 hover:text-white focus:bg-white/10'
                            : 'hover:bg-emerald-50/70 hover:text-emerald-800 focus:bg-emerald-50/70',
                      ]
                )}
              >
                <span
                  className={cn(
                    'relative flex-shrink-0 overflow-hidden',
                    isPitchStyle
                      ? 'h-4 w-6 rounded-[5px] ring-1 ring-white/15'
                      : 'h-5 w-7 rounded-md border border-gray-200 shadow-sm sm:h-6 sm:w-8'
                  )}
                >
                  <img
                    src={language.flag}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                  />
                </span>

                <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <span className="truncate">
                    <span
                      className={cn(
                        'block leading-tight',
                        isPitchStyle ? 'text-[12px] font-semibold' : 'text-xs font-semibold sm:text-sm',
                        isSelected && isPitchStyle ? 'text-white' : ''
                      )}
                    >
                      {language.name}
                    </span>
                    {!isPitchStyle && (
                      <span
                        className={cn(
                          'mt-0.5 block text-[10px] font-medium',
                          darkMode ? 'text-white/40' : 'text-gray-500'
                        )}
                      >
                        {language.country} · {language.code.toUpperCase()}
                      </span>
                    )}
                  </span>

                  <span className="flex items-center gap-2">
                    {isPitchStyle && (
                      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/38">
                        {language.code}
                      </span>
                    )}

                    {isSelected && (
                      <span
                        className={cn(
                          'flex flex-shrink-0 items-center justify-center rounded-full',
                          isPitchStyle
                            ? 'h-5 w-5 bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/20'
                            : 'h-5 w-5 bg-emerald-600 text-white shadow-sm'
                        )}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
