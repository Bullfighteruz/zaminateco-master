import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSwitchLanguage } from '@/hooks/useSwitchLanguage';
import { type SupportedLanguage } from '@/lib/i18nRouting';

const languages: Array<{ code: SupportedLanguage; flag: string; name: string; country: string }> = [
  { code: 'en', flag: '/images/en_flag.webp', name: 'English', country: 'US' },
  { code: 'uz', flag: '/images/uz_flag.webp', name: "O'zbekcha", country: 'UZ' },
  { code: 'ru', flag: '/images/ru_flag.webp', name: 'Русский', country: 'RU' }
];

const flagVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: 5 },
  tap: { scale: 0.95 }
};

const menuItemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 }
};

export interface LanguageSwitcherProps {
  darkMode?: boolean;
  compact?: boolean;
  className?: string;
}

export default function LanguageSwitcher({ darkMode = false, compact = false, className = '' }: LanguageSwitcherProps) {
  const { currentLang, switchLanguage } = useSwitchLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  const handleLanguageChange = (languageCode: SupportedLanguage) => {
    switchLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative z-50 notranslate", className)} translate="no">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="outline"
              size="sm"
              aria-label={`Select language. Current: ${currentLanguage.name}`}
              className={cn(
                "flex items-center gap-2 select-none",
                darkMode ? "bg-black/70 backdrop-blur-md" : "bg-white/95 backdrop-blur-md",
                darkMode ? "border border-white/15" : "border border-gray-200/60",
                darkMode ? "hover:border-white/30 hover:bg-black/85" : "hover:border-emerald-400/60 hover:bg-white",
                "transition-all duration-300",
                "shadow-md hover:shadow-lg",
                darkMode ? "text-white/90 hover:text-white" : "text-gray-800 hover:text-gray-900",
                "font-bold",
                compact ? "px-2.5 h-8 text-[11px] rounded-lg" : "px-3 py-2 text-xs sm:text-sm rounded-xl",
                "relative overflow-hidden",
                "group"
              )}
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-teal-50/0 to-green-50/0 pointer-events-none"
                animate={{
                  background: isOpen
                    ? "linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(20, 184, 166, 0.12) 100%)"
                    : "linear-gradient(90deg, rgba(16, 185, 129, 0) 0%, rgba(20, 184, 166, 0) 100%)"
                }}
                transition={{ duration: 0.3 }}
              />

              <div className={cn("relative z-10 flex items-center", compact ? "gap-1.5" : "gap-2")}>
                {/* Flag icon with smooth transitions */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentLanguage.code}
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex-shrink-0"
                  >
                    <motion.img
                      src={currentLanguage.flag}
                      alt=""
                      className={cn("object-cover rounded-sm shadow-sm border border-gray-200/50", compact ? "h-3.5 w-5" : "h-4 w-6 sm:h-5 sm:w-7")}
                      variants={flagVariants}
                      whileHover="hover"
                      whileTap="tap"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Language code */}
                <motion.span
                  key={`code-${currentLanguage.code}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn("font-bold tracking-wide", compact ? "text-[11px]" : "text-xs sm:text-sm", darkMode ? "text-white/90" : "text-gray-900")}
                >
                  {currentLanguage.code.toUpperCase()}
                </motion.span>

                {/* Chevron with rotation */}
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronDown className={cn("transition-colors", compact ? "h-3 w-3" : "h-3.5 w-3.5", darkMode ? "text-white/50 group-hover:text-white/80" : "text-gray-500 group-hover:text-emerald-600")} />
                </motion.div>
              </div>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={8}
          alignOffset={0}
          collisionPadding={20}
          avoidCollisions={true}
          className={cn(
            "w-[210px] p-2",
            darkMode
              ? "bg-gray-950/95 backdrop-blur-2xl border border-white/15 shadow-2xl text-white rounded-xl"
              : "bg-white/98 backdrop-blur-xl border-2 border-gray-200/60 shadow-2xl text-gray-900 rounded-xl",
            "overflow-hidden",
            "z-50"
          )}
          style={{
            maxWidth: 'min(210px, calc(100vw - 2rem))',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <AnimatePresence>
            {languages.map((language, index) => {
              const isSelected = currentLanguage.code === language.code;

              return (
                <motion.div
                  key={language.code}
                  variants={menuItemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{
                    delay: index * 0.04,
                    duration: 0.2,
                    ease: "easeOut"
                  }}
                >
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange(language.code)}
                    className={cn(
                      "flex items-center gap-3",
                      "cursor-pointer p-2.5 sm:p-3 rounded-lg",
                      "transition-all duration-200",
                      "relative overflow-hidden",
                      "group/item",
                      isSelected
                        ? darkMode
                          ? "bg-emerald-500/20 text-emerald-300 font-bold shadow-sm border border-emerald-500/30"
                          : "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 font-bold shadow-sm border border-emerald-200/60"
                        : darkMode
                          ? "text-white/80 hover:bg-white/10 hover:text-white"
                          : "hover:bg-gradient-to-r hover:from-emerald-50/60 hover:to-teal-50/60 hover:text-emerald-800"
                    )}
                  >
                    <div className="relative z-10 flex items-center gap-3 w-full">
                      {/* Flag icon with hover animation */}
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="flex-shrink-0"
                      >
                        <img
                          src={language.flag}
                          alt=""
                          className={cn(
                            "h-5 w-7 sm:h-6 sm:w-8 object-cover rounded-md shadow-sm",
                            "border transition-all duration-200",
                            isSelected
                              ? "border-emerald-500 shadow-emerald-200/50"
                              : darkMode
                                ? "border-white/20 group-hover/item:border-white/40"
                                : "border-gray-200 group-hover/item:border-emerald-300"
                          )}
                        />
                      </motion.div>

                      {/* Language details */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className={cn(
                          "text-xs sm:text-sm font-semibold truncate transition-colors",
                          isSelected
                            ? darkMode
                              ? "text-emerald-300 font-bold"
                              : "text-emerald-950 font-bold"
                            : darkMode
                              ? "text-white/90 group-hover/item:text-white"
                              : "text-gray-700 group-hover/item:text-emerald-700"
                        )}>
                          {language.name}
                        </span>
                        <span className={cn(
                          "text-[10px] font-medium transition-colors",
                          isSelected
                            ? darkMode
                              ? "text-emerald-400/80"
                              : "text-emerald-700/80"
                            : darkMode
                              ? "text-white/40 group-hover/item:text-white/60"
                              : "text-gray-500"
                        )}>
                          {language.country} • {language.code.toUpperCase()}
                        </span>
                      </div>

                      {/* Checkmark icon for selected language */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="flex-shrink-0"
                        >
                          <div className="h-5 w-5 rounded-full bg-emerald-600 flex items-center justify-center shadow-sm">
                            <Check className="h-3 w-3 text-white stroke-[3]" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </DropdownMenuItem>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}