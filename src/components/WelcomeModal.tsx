/**
 * Welcome Modal Component
 * Shows on first visit to collect user's name
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Sparkles, Globe, User, Check, X } from 'lucide-react';
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
    { code: 'en', flag: '/images/en_flag.webp', name: 'English' },
    { code: 'uz', flag: '/images/uz_flag.webp', name: 'O\'zbekcha' },
    { code: 'ru', flag: '/images/ru_flag.webp', name: 'Русский' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  const displayName = (firstName.trim() || lastName.trim()) ? `${firstName} ${lastName}`.trim() : '';

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
            className="sm:max-w-[440px] p-0 border border-slate-100 bg-white shadow-2xl rounded-3xl w-[92vw] max-h-[90vh] overflow-y-auto"
            style={{
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.15)',
            }}
          >

            {/* Language Switcher Pin - Top Left of Dialog */}
            <div className="absolute left-6 top-6 z-50">
              <DropdownMenu open={langMenuOpen} onOpenChange={setLangMenuOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-slate-500 hover:bg-slate-50 bg-slate-50/50 rounded-full border border-slate-200/40 shadow-sm transition-all flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <img
                      src={currentLanguage.flag}
                      alt={currentLanguage.name}
                      className="h-3 w-4.5 object-cover rounded-sm border border-slate-200"
                    />
                    <span className="text-[10px] font-black text-slate-600">{currentLanguage.code.toUpperCase()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  className="w-[160px] p-1 bg-white border border-slate-150 shadow-xl rounded-xl"
                >
                  {languages.map((language) => {
                    const isSelected = currentLanguage.code === language.code;
                    return (
                      <DropdownMenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={cn(
                          "flex items-center gap-2.5 cursor-pointer p-2 rounded-lg transition-all text-xs font-semibold",
                          isSelected
                            ? "bg-emerald-50/80 text-emerald-800"
                            : "hover:bg-slate-50 text-slate-600"
                        )}
                      >
                        <img
                          src={language.flag}
                          alt={language.name}
                          className="h-3.5 w-5 object-cover rounded-sm border border-gray-200"
                        />
                        <span className="text-xs font-medium">{language.name}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Main Content Area */}
            <div className="px-6 sm:px-8 pt-20 pb-8 text-left">
              {/* Header Text */}
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] tracking-[0.2em] uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>{t('welcome.passport')}</span>
                </div>
                <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {t('welcome.title')}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  {t('welcome.description')}
                </DialogDescription>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pl-0.5">
                      {t('welcome.firstName', { defaultValue: 'First Name' })} 
                      <span className="text-slate-300 font-medium lowercase ml-1">({t('welcome.optional', { defaultValue: 'optional' })})</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder={t('welcome.firstNamePlaceholder', { defaultValue: 'e.g. Suxrob' })}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-12 pl-10 bg-slate-50 border-slate-200/80 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-800 placeholder-slate-300 font-semibold rounded-2xl transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pl-0.5">
                      {t('welcome.lastName', { defaultValue: 'Last Name' })} 
                      <span className="text-slate-300 font-medium lowercase ml-1">({t('welcome.optional', { defaultValue: 'optional' })})</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder={t('welcome.lastNamePlaceholder', { defaultValue: 'e.g. Rixsiboyev' })}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-12 pl-10 bg-slate-50 border-slate-200/80 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-800 placeholder-slate-300 font-semibold rounded-2xl transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Minimalist Benefits Checklist */}
                <div className="py-2 flex flex-col gap-2.5">
                  {[
                    { text: t('welcome.benefit1') },
                    { text: t('welcome.benefit2') },
                    { text: t('welcome.benefit3') }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-500 font-medium w-full">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3] mt-0.5 flex-shrink-0" />
                      <span className="leading-tight flex-1 min-w-0 break-words">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    className="flex-1 h-12 border-slate-200/80 text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-700 font-bold rounded-2xl transition-all active:scale-[0.98]"
                  >
                    {t('welcome.skip', { defaultValue: 'Skip' })}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {t('welcome.continue', { defaultValue: 'Get Started' })}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

