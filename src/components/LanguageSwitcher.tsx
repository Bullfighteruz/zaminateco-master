import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', flag: '/images/en_flag.png', name: 'English', country: 'US' },
  { code: 'uz', flag: '/images/uz_flag.png', name: 'O\'zbekcha', country: 'UZ' },
  { code: 'ru', flag: '/images/ru_flag.png', name: 'Русский', country: 'RU' }
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

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
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
            className={cn(
              "flex items-center gap-2.5",
              "bg-white/95 backdrop-blur-md",
              "border-2 border-gray-200/50",
              "hover:border-green-400/60 hover:bg-white",
              "transition-all duration-300",
              "shadow-md hover:shadow-lg",
              "text-gray-800 hover:text-gray-900",
              "font-semibold",
              "px-3 py-2",
              "relative overflow-hidden",
              "group"
            )}
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-50/0 via-emerald-50/0 to-teal-50/0"
              animate={{
                background: isOpen 
                  ? "linear-gradient(90deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(20, 184, 166, 0.1) 100%)"
                  : "linear-gradient(90deg, rgba(34, 197, 94, 0) 0%, rgba(16, 185, 129, 0) 50%, rgba(20, 184, 166, 0) 100%)"
              }}
              transition={{ duration: 0.3 }}
            />
            
            <div className="relative z-10 flex items-center gap-2.5">
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
                    alt={currentLanguage.name}
                    className="h-5 w-7 object-cover rounded-sm shadow-sm border border-gray-200/50"
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
                className="text-sm font-bold text-gray-900 tracking-wide hidden sm:inline-block"
              >
                {currentLanguage.code.toUpperCase()}
              </motion.span>
              
              {/* Chevron with rotation */}
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ChevronDown className="h-3.5 w-3.5 text-gray-600 transition-colors group-hover:text-green-600" />
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
        collisionPadding={24}
        avoidCollisions={true}
        className={cn(
          "w-[200px] p-2",
          "bg-white/98 backdrop-blur-xl",
          "border-2 border-gray-200/60",
          "shadow-2xl",
          "rounded-xl",
          "overflow-hidden"
        )}
        style={{
          maxWidth: 'min(200px, calc(100vw - 2rem))',
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
                  delay: index * 0.05,
                  duration: 0.2,
                  ease: "easeOut"
                }}
              >
                <DropdownMenuItem
                  onClick={() => handleLanguageChange(language.code)}
                  className={cn(
                    "flex items-center gap-3",
                    "cursor-pointer p-3 rounded-lg",
                    "transition-all duration-200",
                    "relative overflow-hidden",
                    "group/item",
                    isSelected
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 font-semibold shadow-md border-2 border-green-200/50"
                      : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-800 hover:shadow-sm"
                  )}
                >
                  {/* Selected indicator background */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-emerald-100/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
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
                        alt={language.name}
                        className={cn(
                          "h-6 w-8 object-cover rounded-md shadow-md",
                          "border-2 transition-all duration-200",
                          isSelected 
                            ? "border-green-400 shadow-green-200/50" 
                            : "border-gray-200 group-hover/item:border-blue-300 group-hover/item:shadow-blue-200/50"
                        )}
                      />
                    </motion.div>
                    
                    {/* Language name */}
                    <span className={cn(
                      "text-sm font-medium flex-1",
                      isSelected ? "text-green-800" : "text-gray-700 group-hover/item:text-blue-800"
                    )}>
                      {language.name}
                    </span>
                    
                    {/* Country code */}
                    <span className={cn(
                      "text-xs font-bold ml-auto",
                      isSelected ? "text-green-600" : "text-gray-500 group-hover/item:text-blue-600"
                    )}>
                      {language.country}
                    </span>
                    
                    {/* Checkmark for selected */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0, rotate: -180 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0, rotate: 180 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 500,
                            damping: 25,
                            delay: 0.1
                          }}
                        >
                          <Check className="h-4 w-4 text-green-600 font-bold" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-emerald-400/0 to-teal-400/0 rounded-lg"
                    whileHover={{
                      background: "linear-gradient(90deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(20, 184, 166, 0.05) 100%)"
                    }}
                    transition={{ duration: 0.2 }}
                  />
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