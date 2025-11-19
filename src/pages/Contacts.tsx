import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ExternalLink,
  Instagram,
  Linkedin,
  Sparkles,
  Heart,
  Star,
  Leaf,
  Recycle,
  TreePine,
  Zap,
  Globe,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import '../styles/mobile-responsive.css';

// Simplified floating elements for mobile
const FloatingElements = () => {
  const elements = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute rounded-full bg-green-200/20 blur-sm"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: element.size,
            height: element.size,
          }}
          animate={{
            opacity: [0, 0.4, 0],
            scale: [0, 1, 0],
            y: [0, -100, -200],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Simplified background for mobile
const SimpleBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-blue-50/60 to-purple-50/40" />
  </div>
);

// Animation variants - simplified for mobile
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Mobile-first contact card
const ContactCard = ({ contact }: { contact: { icon: typeof Mail, title: string, value: string, link?: string, color: string } }) => {
  const Icon = contact.icon;
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      variants={itemVariants}
      whileHover={isMobile ? {} : { scale: 1.02 }}
      className="h-full"
    >
      <Card className={cn(
        "h-full border bg-white/90 backdrop-blur-sm shadow-md transition-all duration-300",
        isMobile ? "" : "hover:shadow-lg"
      )}>
        <CardContent className={cn("text-center", isMobile ? "p-2" : "p-3 sm:p-4")}>
          <div className={cn(
            `inline-flex items-center justify-center bg-${contact.color}-100 text-${contact.color}-600 rounded-lg`,
            isMobile ? "w-8 h-8 mb-1.5" : "w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3"
          )}>
            <Icon className={cn(isMobile ? "h-4 w-4" : "h-5 w-5 sm:h-6 sm:w-6")} />
          </div>
          
          <h3 className={cn(
            "font-semibold text-gray-900 mb-1",
            isMobile ? "text-xs" : "text-sm sm:text-base"
          )}>
            {contact.title}
          </h3>
          
          {contact.link ? (
            <a 
              href={contact.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                `text-${contact.color}-600 hover:text-${contact.color}-700 hover:underline transition-colors break-all block`,
                isMobile ? "text-[10px]" : "text-xs sm:text-sm"
              )}
              style={{ touchAction: 'manipulation' }}
            >
              {contact.value}
            </a>
          ) : (
            <p className={cn(
              "text-gray-600",
              isMobile ? "text-[10px]" : "text-xs sm:text-sm"
            )}>
              {contact.value}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Mobile-first social card with fixed button colors
const SocialCard = ({ social }: { social: { icon: typeof Send, platform: string, handle: string, description: string, link: string, color: string, followers: string } }) => {
  const Icon = social.icon;
  const isMobile = useIsMobile();
  const { t } = useTranslation('common');
  
  // Define proper button colors
  const getButtonColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500 hover:bg-blue-600';
      case 'teal': return 'bg-teal-500 hover:bg-teal-600';
      case 'pink': return 'bg-pink-500 hover:bg-pink-600';
      case 'indigo': return 'bg-indigo-500 hover:bg-indigo-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const getIconBg = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'teal': return 'bg-teal-100 text-teal-600';
      case 'pink': return 'bg-pink-100 text-pink-600';
      case 'indigo': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'teal': return 'bg-teal-500';
      case 'pink': return 'bg-pink-500';
      case 'indigo': return 'bg-indigo-500';
      default: return 'bg-blue-500';
    }
  };
  
  return (
    <motion.div
      variants={itemVariants}
      whileHover={isMobile ? {} : { scale: 1.02 }}
      className="h-full"
    >
      <Card className={cn(
        "h-full border bg-white/90 backdrop-blur-sm shadow-md transition-all duration-300",
        isMobile ? "" : "hover:shadow-lg"
      )}>
        <CardContent className={cn(isMobile ? "p-2" : "p-3 sm:p-4")}>
          <div className={cn("flex items-center justify-between", isMobile ? "mb-2" : "mb-3")}>
            <div className={cn(`rounded-lg ${getIconBg(social.color)}`, isMobile ? "p-1.5" : "p-2")}>
              <Icon className={cn(isMobile ? "h-3 w-3" : "h-4 w-4 sm:h-5 sm:w-5")} />
            </div>
            <div className="text-right">
              <Badge className={cn(
                `${getBadgeColor(social.color)} text-white border-0`,
                isMobile ? "text-[10px] px-1 py-0" : "text-xs"
              )}>
                {social.platform}
              </Badge>
              <p className={cn("text-gray-500 mt-0.5", isMobile ? "text-[9px]" : "text-xs")}>{social.followers}</p>
            </div>
          </div>
          
          <h3 className={cn(
            "font-semibold text-gray-900 mb-1",
            isMobile ? "text-xs" : "text-sm"
          )}>
            {social.handle}
          </h3>
          <p className={cn(
            "text-gray-600 leading-relaxed",
            isMobile ? "text-[10px] mb-2" : "text-xs mb-3"
          )}>
            {social.description}
          </p>
          
          <Button
            size={isMobile ? "default" : "sm"}
            className={cn(
              `w-full ${getButtonColor(social.color)} text-white border-0 font-medium`,
              isMobile ? "h-8 text-[10px] py-1" : "text-xs"
            )}
            onClick={() => window.open(social.link, '_blank')}
            style={{ touchAction: 'manipulation' }}
          >
            <ExternalLink className={cn(isMobile ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} />
            {t('follow')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Contacts() {
  const isMobile = useIsMobile();
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Contact information - using translations
  const contactInfo = [
    {
      icon: Mail,
      title: t('ceoEmail'),
      value: "sukhrobjonrikhsiboev@gmail.com",
      link: "mailto:sukhrobjonrikhsiboev@gmail.com",
      color: "blue"
    },
    {
      icon: Phone,
      title: t('ceoPhone'),
      value: "+998 95 188 18 88",
      link: "tel:+998951881888",
      color: "green"
    },
    {
      icon: Mail,
      title: t('officialEmail'),
      value: "zaminateco@gmail.com",
      link: "mailto:zaminateco@gmail.com",
      color: "purple"
    },
    {
      icon: MapPin,
      title: t('location', { ns: 'translation', defaultValue: 'Location' }),
      value: "Tashkent, Uzbekistan",
      color: "orange"
    },
    {
      icon: Clock,
      title: t('workingHours'),
      value: t('workingHoursValue'),
      color: "indigo"
    }
  ];

  // Social media - using translations
  const socialMedia = [
    {
      icon: Send,
      platform: "Telegram",
      handle: "@ZaminatEco",
      description: t('russianEnglishUpdates'),
      link: "https://t.me/ZaminatEco",
      color: "blue",
      followers: "1.2K+"
    },
    {
      icon: Send,
      platform: "Telegram",
      handle: "@zaminat_eco",
      description: "O'zbek tilida yangiliklar",
      link: "https://t.me/zaminat_eco",
      color: "teal",
      followers: "850+"
    },
    {
      icon: Instagram,
      platform: "Instagram",
      handle: "@zaminat.eco",
      description: t('visualStoriesTips'),
      link: "https://instagram.com/zaminat.eco",
      color: "pink",
      followers: "2.1K+"
    },
    {
      icon: Linkedin,
      platform: "LinkedIn",
      handle: "Sukhrobjon Rikhsiboev",
      description: t('professionalNetwork'),
      link: "https://www.linkedin.com/in/sukhrobjon-rikhsiboev-5b9878386/",
      color: "indigo",
      followers: "500+"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => setShowSuccess(false), 4000);
    }, 1500);
  };

  return (
    <Layout title="Contact Us">
      <div className="min-h-screen relative overflow-hidden">
        <SimpleBackground />
        <FloatingElements />
        
        <div className={cn(
          "relative z-10 w-full",
          isMobile ? "px-2 py-3" : "px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8"
        )}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "max-w-6xl mx-auto",
              isMobile ? "space-y-4" : "space-y-6 sm:space-y-8 md:space-y-12"
            )}
          >
            {/* Mobile-first Header */}
            <motion.div variants={itemVariants} className={cn("text-center", isMobile ? "space-y-2" : "space-y-4")}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className={cn(
                  "inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-lg",
                  isMobile ? "w-10 h-10 mb-2" : "w-12 h-12 sm:w-16 sm:h-16 sm:rounded-2xl mb-3 sm:mb-4"
                )}
              >
                <Sparkles className={cn("text-white", isMobile ? "h-5 w-5" : "h-6 w-6 sm:h-8 sm:w-8")} />
              </motion.div>
              
              <h1 className={cn(
                "font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight",
                isMobile ? "text-xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
              )}>
                {t('getInTouch')}
              </h1>
              
              <p className={cn(
                "text-gray-600 max-w-2xl mx-auto leading-relaxed",
                isMobile ? "text-xs px-2" : "text-sm sm:text-base md:text-lg px-2"
              )}>
                {t('getInTouchDescription')}
              </p>

              {/* Mobile-optimized stats */}
              <div className={cn(
                "grid grid-cols-2 max-w-lg sm:max-w-2xl mx-auto",
                isMobile ? "gap-1.5 mt-3" : "sm:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6"
              )}>
                {[
                  { icon: Heart, label: t('clients'), value: "500+" },
                  { icon: Globe, label: t('cities'), value: "12+" },
                  { icon: Recycle, label: t('recycled'), value: "50T+" },
                  { icon: TreePine, label: t('trees'), value: "1K+" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className={cn(
                      "text-center bg-white/60 backdrop-blur-sm rounded-lg shadow-sm",
                      isMobile ? "p-1.5" : "p-2 sm:p-3"
                    )}
                  >
                    <stat.icon className={cn(
                      "mx-auto mb-1 text-green-600",
                      isMobile ? "h-3 w-3" : "h-4 w-4 sm:h-5 sm:w-5"
                    )} />
                    <div className={cn(
                      "font-bold text-gray-900",
                      isMobile ? "text-sm" : "text-lg sm:text-xl"
                    )}>
                      {stat.value}
                    </div>
                    <div className={cn(
                      "text-gray-600",
                      isMobile ? "text-[10px]" : "text-xs"
                    )}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Mobile-first content layout */}
            <div className={cn(isMobile ? "space-y-4" : "space-y-6 md:space-y-8")}>
              
              {/* Contact Form - Full width on mobile */}
              <motion.div variants={itemVariants}>
                <Card className="border bg-white/90 backdrop-blur-sm shadow-lg">
                  <CardHeader className={cn(isMobile ? "pb-2 p-3" : "pb-4")}>
                    <CardTitle className={cn(
                      "flex items-center font-bold",
                      isMobile ? "text-sm" : "text-lg sm:text-xl"
                    )}>
                      <div className={cn(
                        "bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow-md",
                        isMobile ? "p-1.5 mr-2" : "p-2 mr-3"
                      )}>
                        <MessageSquare className={cn("text-white", isMobile ? "h-3 w-3" : "h-4 w-4 sm:h-5 sm:w-5")} />
                      </div>
                      {t('sendUsAMessage')}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className={cn(isMobile ? "p-3" : "")}>
                    <AnimatePresence mode="wait">
                      {showSuccess ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={cn("text-center", isMobile ? "py-4" : "py-8")}
                        >
                          <div className={cn(
                            "inline-flex items-center justify-center bg-green-100 rounded-full mb-4",
                            isMobile ? "w-12 h-12" : "w-16 h-16"
                          )}>
                            <CheckCircle2 className={cn("text-green-600", isMobile ? "h-6 w-6" : "h-8 w-8")} />
                          </div>
                          <h3 className={cn(
                            "font-bold text-green-600 mb-2",
                            isMobile ? "text-base" : "text-xl"
                          )}>
                            {t('messageSent')}
                          </h3>
                          <p className={cn(
                            "text-gray-600",
                            isMobile ? "text-xs" : ""
                          )}>
                            {t('messageSentDescription')}
                          </p>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleSubmit} className={cn(isMobile ? "space-y-3" : "space-y-4")}>
                          <div className={cn(
                            "grid",
                            isMobile ? "grid-cols-1 gap-3" : "sm:grid-cols-2 gap-4"
                          )}>
                            <div>
                              <label className={cn(
                                "block font-medium text-gray-700 mb-2",
                                isMobile ? "text-xs" : "text-sm"
                              )}>
                                {t('fullName')} *
                              </label>
                              <Input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder={t('yourFullName')}
                                required
                                className={cn(
                                  "border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg transition-all duration-300",
                                  isMobile ? "h-9 text-xs" : "h-10 sm:h-11"
                                )}
                              />
                            </div>
                            <div>
                              <label className={cn(
                                "block font-medium text-gray-700 mb-2",
                                isMobile ? "text-xs" : "text-sm"
                              )}>
                                {t('emailAddress')} *
                              </label>
                              <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder={t('emailPlaceholder')}
                                required
                                className={cn(
                                  "border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg transition-all duration-300",
                                  isMobile ? "h-9 text-xs" : "h-10 sm:h-11"
                                )}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className={cn(
                              "block font-medium text-gray-700 mb-2",
                              isMobile ? "text-xs" : "text-sm"
                            )}>
                              {t('subject')} *
                            </label>
                            <Input
                              name="subject"
                              value={formData.subject}
                              onChange={handleInputChange}
                              placeholder={t('whatsThisAbout')}
                              required
                              className={cn(
                                "border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg transition-all duration-300",
                                isMobile ? "h-9 text-xs" : "h-10 sm:h-11"
                              )}
                            />
                          </div>
                          
                          <div>
                            <label className={cn(
                              "block font-medium text-gray-700 mb-2",
                              isMobile ? "text-xs" : "text-sm"
                            )}>
                              {t('message')} *
                            </label>
                            <Textarea
                              name="message"
                              value={formData.message}
                              onChange={handleInputChange}
                              placeholder={t('messagePlaceholder')}
                              rows={isMobile ? 3 : 4}
                              required
                              className={cn(
                                "border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg transition-all duration-300 resize-none",
                                isMobile ? "text-xs" : ""
                              )}
                            />
                          </div>
                          
                          <Button
                            type="submit"
                            size={isMobile ? "default" : "lg"}
                            disabled={isSubmitting}
                            className={cn(
                              "w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg border-0",
                              isMobile ? "h-9 text-xs py-2" : "h-11 sm:h-12"
                            )}
                            style={{ touchAction: 'manipulation' }}
                          >
                            {isSubmitting ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4 sm:h-5 sm:w-5")}
                                >
                                  <Sparkles className={cn(isMobile ? "h-3 w-3" : "h-4 w-4 sm:h-5 sm:w-5")} />
                                </motion.div>
                                {t('sending')}
                              </>
                            ) : (
                              <>
                                <Send className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4 sm:h-5 sm:w-5")} />
                                {t('sendMessage')}
                              </>
                            )}
                          </Button>
                        </form>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Information - Mobile grid */}
              <motion.div variants={itemVariants}>
                <h2 className={cn(
                  "font-bold text-gray-900 text-center",
                  isMobile ? "text-base mb-3" : "text-xl sm:text-2xl mb-4"
                )}>
                  {t('contactInformation')}
                </h2>
                
                <div className={cn(
                  "grid grid-cols-2",
                  isMobile ? "gap-2" : "sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4"
                )}>
                  {contactInfo.map((contact, index) => (
                    <ContactCard key={index} contact={contact} />
                  ))}
                </div>
              </motion.div>

              {/* Social Media - Mobile grid */}
              <motion.div variants={itemVariants}>
                <div className={cn("text-center", isMobile ? "mb-3" : "mb-4 sm:mb-6")}>
                  <h2 className={cn(
                    "font-bold text-gray-900",
                    isMobile ? "text-base mb-1" : "text-xl sm:text-2xl mb-2"
                  )}>
                    {t('followOurJourney')}
                  </h2>
                  <p className={cn(
                    "text-gray-600",
                    isMobile ? "text-xs" : "text-sm sm:text-base"
                  )}>
                    {t('followOurJourneyDescription')}
                  </p>
                </div>
                
                <div className={cn(
                  "grid grid-cols-1",
                  isMobile ? "gap-2" : "sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
                )}>
                  {socialMedia.map((social, index) => (
                    <SocialCard key={index} social={social} />
                  ))}
                </div>
              </motion.div>

              {/* Emergency Contact CTA - Mobile optimized */}
              <motion.div variants={itemVariants} className="text-center">
                <Card className="border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl">
                  <CardContent className={cn(isMobile ? "p-4" : "p-4 sm:p-6 md:p-8")}>
                    <div className={cn(
                      "inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full mb-4",
                      isMobile ? "w-10 h-10" : "w-12 h-12 sm:w-16 sm:h-16"
                    )}>
                      <Zap className={cn(isMobile ? "h-5 w-5" : "h-6 w-6 sm:h-8 sm:w-8")} />
                    </div>
                    
                    <h2 className={cn(
                      "font-bold",
                      isMobile ? "text-base mb-2" : "text-xl sm:text-2xl md:text-3xl mb-3"
                    )}>
                      {t('needImmediateAssistance')}
                    </h2>
                    <p className={cn(
                      "text-orange-100 leading-relaxed",
                      isMobile ? "text-xs mb-4" : "mb-6 text-sm sm:text-base"
                    )}>
                      {t('needImmediateAssistanceDescription')}
                    </p>
                    
                    <div className={cn(
                      "flex justify-center",
                      isMobile ? "flex-col gap-2" : "flex-col sm:flex-row gap-3"
                    )}>
                      <Button
                        size={isMobile ? "default" : "sm"}
                        className={cn(
                          "bg-white text-orange-600 hover:bg-gray-100 font-semibold rounded-lg shadow-lg",
                          isMobile ? "h-9 text-xs py-2 px-3" : "px-4 py-2"
                        )}
                        onClick={() => window.open('tel:+998951881888', '_blank')}
                        style={{ touchAction: 'manipulation' }}
                      >
                        <Phone className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                        {t('callNow')}
                      </Button>
                      <Button
                        size={isMobile ? "default" : "sm"}
                        className={cn(
                          "bg-white text-orange-600 hover:bg-gray-100 font-semibold rounded-lg shadow-lg",
                          isMobile ? "h-9 text-xs py-2 px-3" : "px-4 py-2"
                        )}
                        onClick={() => window.open('mailto:sukhrobjonrikhsiboev@gmail.com?subject=Urgent Inquiry', '_blank')}
                        style={{ touchAction: 'manipulation' }}
                      >
                        <Mail className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                        {t('emailCEO')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}