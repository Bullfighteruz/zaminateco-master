/**
 * Welcome Modal Component
 * Shows on first visit to collect user's name
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Sparkles, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveUserName, markAsVisited, isFirstVisit } from '@/utils/userName';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WelcomeModalProps {
  onComplete?: () => void;
}

export default function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', flag: '/images/en_flag.png', name: 'English' },
    { code: 'uz', flag: '/images/uz_flag.png', name: 'O\'zbekcha' },
    { code: 'ru', flag: '/images/ru_flag.png', name: 'Русский' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    // Check if this is first visit
    if (isFirstVisit()) {
      setIsOpen(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasInteracted(true);
    
    // If both fields are empty, treat as skip (use default)
    if (!firstName.trim() && !lastName.trim()) {
      handleSkip();
      return;
    }

    // Save exactly what user entered - no defaults for individual fields
    // If only first name is provided, lastName will be empty (no default last name added)
    saveUserName(firstName.trim() || '', lastName.trim() || '');
    markAsVisited();
    setIsOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    setHasInteracted(true);
    // Don't save anything, just mark as visited so it won't show again
    markAsVisited();
    setIsOpen(false);
    onComplete?.();
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setLangMenuOpen(false);
  };

  // Handle dialog open/close, including X button, ESC key, and overlay click
  const handleOpenChange = (open: boolean) => {
    // When closing on first visit without interaction, treat as "Skip":
    // close the modal and mark it as visited so it won't show again.
    if (!open && !hasInteracted && isFirstVisit()) {
      setHasInteracted(true);
      markAsVisited();
      setIsOpen(false);
      onComplete?.();
      return;
    }

    setIsOpen(open);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent 
            className="sm:max-w-[500px] p-0 overflow-hidden border-0 bg-gradient-to-br from-green-50 via-white to-blue-50"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Decorative Header */}
            <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-6 pb-8">
              {/* Animated Background Elements */}
              <motion.div
                className="absolute inset-0 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="absolute top-4 left-4"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Leaf className="w-12 h-12 text-white/20" />
                </motion.div>
                <motion.div
                  className="absolute top-8 right-8"
                  animate={{
                    rotate: [360, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Sparkles className="w-10 h-10 text-white/20" />
                </motion.div>
              </motion.div>

              <DialogHeader className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1"></div>
                  <DialogTitle className="text-2xl sm:text-3xl font-bold text-white text-center flex-1">
                    {t('welcome.title', { defaultValue: 'Welcome to ZAMINAT.eco!' })}
                  </DialogTitle>
                  <div className="flex-1 flex justify-end">
                    {/* Language Switcher */}
                    <DropdownMenu open={langMenuOpen} onOpenChange={setLangMenuOpen} modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 px-3 text-white hover:bg-white/30 bg-white/10 backdrop-blur-sm rounded-full border border-white/30 shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="h-5 w-5" />
                          <img
                            src={currentLanguage.flag}
                            alt={currentLanguage.name}
                            className="h-4 w-5 object-cover rounded-sm border border-white/50"
                          />
                          <span className="text-sm font-medium hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end"
                        side="bottom"
                        sideOffset={8}
                        className="w-[180px] p-2 bg-white/98 backdrop-blur-xl border-2 border-gray-200/60 shadow-2xl rounded-xl"
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
                  </div>
                </div>
                <DialogDescription className="text-white/90 text-center text-sm sm:text-base">
                  {t('welcome.description', { 
                    defaultValue: 'Join our ecological movement and make a difference together!' 
                  })}
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    {t('welcome.firstName', { defaultValue: 'First Name' })} 
                    <span className="text-gray-400 text-xs ml-1">({t('welcome.optional', { defaultValue: 'optional' })})</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder={t('welcome.firstNamePlaceholder', { defaultValue: 'Enter your first name' })}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    {t('welcome.lastName', { defaultValue: 'Last Name' })} 
                    <span className="text-gray-400 text-xs ml-1">({t('welcome.optional', { defaultValue: 'optional' })})</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder={t('welcome.lastNamePlaceholder', { defaultValue: 'Enter your last name' })}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                {t('welcome.note', { 
                  defaultValue: 'You can skip this step and use the default name, or change it later in your profile.' 
                })}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t('welcome.skip', { defaultValue: 'Skip' })}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {t('welcome.continue', { defaultValue: 'Continue' })}
                </Button>
              </div>
            </form>

            {/* Decorative Footer */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 border-t border-green-100">
              <p className="text-xs text-center text-gray-600">
                {t('welcome.footer', { 
                  defaultValue: '🌱 Together we can make a difference!' 
                })}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

