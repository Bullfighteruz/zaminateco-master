import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  DollarSign, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Heart,
  Gift,
  Shield,
  Zap
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { toast } from 'sonner';
import { useIsMobile } from '../hooks/use-mobile';
import { cn } from '../lib/utils';

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
}

type Currency = 'uzs' | 'usd';

const DonationDialog: React.FC<DonationDialogProps> = ({ 
  open, 
  onOpenChange, 
  projectTitle 
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  // Donation links
  const DONATION_LINKS = {
    uzs: 'https://tirikchilik.uz/zaminateco',
    usd: 'https://dalink.to/zaminat_eco'
  };

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  const handleProceed = () => {
    if (!selectedCurrency) {
      toast.error(t('selectCurrency', { defaultValue: 'Please select a currency' }));
      return;
    }

    const donationUrl = DONATION_LINKS[selectedCurrency];
    
    // Open donation link in new tab
    window.open(donationUrl, '_blank', 'noopener,noreferrer');
    
    toast.success(t('donationLinkOpened', { defaultValue: 'Opening donation page...' }));
    
    // Close dialog after a short delay
    setTimeout(() => {
      onOpenChange(false);
      setSelectedCurrency(null);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-md p-0 overflow-hidden",
        isMobile && "max-w-[95vw] mx-2"
      )}>
        {/* Animated Header with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-4 sm:p-6 text-white overflow-hidden"
        >
          {/* Animated Background Pattern - non-interactive so it won't block clicks on the close (X) button */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-20 h-20 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <DialogHeader className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 fill-white" />
                </motion.div>
                <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-center sm:text-left">
                  {t('donationDialogTitle', { defaultValue: 'Support This Project' })}
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm sm:text-base text-green-50 text-center sm:text-left leading-relaxed">
                {t('donationDialogDescription', { defaultValue: 'Choose your preferred currency and payment method to make a donation' })}
              </DialogDescription>
            </DialogHeader>

            {/* Trust Badges */}
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-4 flex-wrap">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1"
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">Secure</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1"
              >
                <Gift className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">Transparent</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 bg-gradient-to-b from-white to-gray-50">
          {/* Currency Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <label className="flex items-center space-x-2 text-sm sm:text-base font-bold text-gray-800">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              <span>{t('selectCurrency', { defaultValue: 'Select Currency' })}</span>
            </label>
            
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {/* UZS Option */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-300 border-2 relative overflow-hidden",
                    selectedCurrency === 'uzs'
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl shadow-green-200/50'
                      : 'border-gray-200 hover:border-green-300 hover:shadow-lg bg-white'
                  )}
                  onClick={() => handleCurrencySelect('uzs')}
                >
                  {selectedCurrency === 'uzs' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="h-5 w-5 text-green-500" />
                      </motion.div>
                    </motion.div>
                  )}
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        animate={selectedCurrency === 'uzs' ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: selectedCurrency === 'uzs' ? Infinity : 0 }}
                        className={cn(
                          "flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg",
                          selectedCurrency === 'uzs'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                        )}
                      >
                        {selectedCurrency === 'uzs' ? (
                          <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
                        ) : (
                          <DollarSign className="h-7 w-7 sm:h-8 sm:w-8" />
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1">
                          {t('uzbekSum', { defaultValue: 'Uzbekistani Som (UZS)' })}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          {t('forUzbekCitizens', { defaultValue: 'For Uzbek Citizens' })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* USD Option */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-300 border-2 relative overflow-hidden",
                    selectedCurrency === 'usd'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl shadow-blue-200/50'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white'
                  )}
                  onClick={() => handleCurrencySelect('usd')}
                >
                  {selectedCurrency === 'usd' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="h-5 w-5 text-blue-500" />
                      </motion.div>
                    </motion.div>
                  )}
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        animate={selectedCurrency === 'usd' ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: selectedCurrency === 'usd' ? Infinity : 0 }}
                        className={cn(
                          "flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg",
                          selectedCurrency === 'usd'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                        )}
                      >
                        {selectedCurrency === 'usd' ? (
                          <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
                        ) : (
                          <Globe className="h-7 w-7 sm:h-8 sm:w-8" />
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1">
                          {t('usDollar', { defaultValue: 'US Dollar (USD)' })}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                          {t('forInternationalDonors', { defaultValue: 'For International Donors' })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Project Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-5 border-2 border-purple-100 shadow-sm"
          >
            <div className="flex items-start space-x-3">
              <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">
                  {t('donationMessage', { defaultValue: 'I would like to make a donation for this project:' })}
                </p>
                <p className="text-sm sm:text-base font-bold text-gray-800 leading-tight">
                  {projectTitle}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedCurrency(null);
              }}
              className="flex-1 border-2 hover:bg-gray-50 font-semibold py-3 sm:py-6 text-sm sm:text-base"
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                onClick={handleProceed}
                disabled={!selectedCurrency}
                className={cn(
                  "w-full font-bold py-3 sm:py-6 text-sm sm:text-base shadow-xl transition-all duration-300",
                  selectedCurrency === 'uzs'
                    ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white'
                    : selectedCurrency === 'usd'
                    ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 text-white'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed text-white'
                )}
              >
                <span className="flex items-center justify-center">
                  {t('proceedToDonation', { defaultValue: 'Proceed to Donation' })}
                  <motion.div
                    animate={selectedCurrency ? { x: [0, 4, 0] } : {}}
                    transition={{ duration: 1.5, repeat: selectedCurrency ? Infinity : 0 }}
                  >
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.div>
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationDialog;

