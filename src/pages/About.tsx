import React from 'react';
import { Leaf, Users, Target, Globe, Award, Heart, Mail, TrendingUp, Sparkles, Zap, CheckCircle2, Recycle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UzbekPattern } from '@/components/EcoIcons';
import { globalStats, goals2026 } from '@/lib/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { contactHelpers } from '@/utils/mailto';
import ScrollImageCarousel from '@/components/ScrollImageCarousel';
import { useSEO } from '@/hooks/useSEO';
import { useHreflang } from '@/hooks/useHreflang';

// Optimized animation variants with reduced motion support
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] // Custom cubic-bezier for smooth motion
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export default function About() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const shouldReduceMotion = useReducedMotion();

  useSEO({
    title: t('aboutZaminat', { defaultValue: 'About Us' }),
    description: t('aboutHeroSubtitle', { defaultValue: 'Transforming waste into valuable resources through AI, community action, and sustainable circular infrastructure.' }),
  });
  useHreflang();

  const roadmap = [
    { 
      year: '2025', 
      event: t('pilotLaunch'), 
      description: t('pilotLaunchDesc'),
      icon: Zap
    },
    { 
      year: '2026', 
      event: t('regionalExpansion'), 
      description: t('regionalExpansionDesc'),
      icon: TrendingUp
    },
    { 
      year: '2027', 
      event: t('industrialScale'), 
      description: t('industrialScaleDesc'),
      icon: Globe
    },
    { 
      year: '2028-2029', 
      event: t('nationalImpact'), 
      description: t('nationalImpactDesc'),
      icon: Award
    },
  ];

  const values = [
    {
      icon: <Recycle className="h-8 w-8" />,
      title: t('circularEconomy'),
      description: t('circularEconomyDesc'),
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('communityUnity'),
      description: t('communityUnityDesc'),
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t('transparency'),
      description: t('transparencyDesc'),
      color: "from-teal-500 to-emerald-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: t('socialImpact'),
      description: t('socialImpactDesc'),
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    }
  ];

  // Calculate progress percentages
  // wasteTarget is in kg (1,000,000 kg = 1,000 tons), so no conversion needed
  const wasteProgress = (globalStats.totalWasteCollected / goals2026.wasteTarget) * 100;
  const userProgress = (globalStats.totalUsers / goals2026.usersTarget) * 100;
  const projectProgress = (globalStats.totalProjects / goals2026.projectsTarget) * 100;
  const treeProgress = (globalStats.treesPlanted / goals2026.treesTarget) * 100;

  // Brand images for carousel - Only images starting with "zaminat" that exist in folder
  const brandImages = [
    '/images/Zaminat-brand-1.webp',
    '/images/Zaminat-brand-3.webp',
    '/images/Zaminat-brand-4.webp',
    '/images/Zaminat-brand-5.webp',
    '/images/Zaminat-brand-6.webp',
  ];

  return (
    <Layout title={t('aboutProject')}>
      <style>{`
        /* Optimized CSS animations for GPU acceleration */
        .card-hover-lift {
          transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1),
                      box-shadow 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
          will-change: transform;
        }
        
        .card-hover-lift:hover {
          transform: translate3d(0, -4px, 0);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .icon-glow {
          transition: filter 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        
        .icon-glow:hover {
          filter: drop-shadow(0 0 8px currentColor);
          transform: scale(1.05);
        }
        
        .progress-bar-glow {
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
        }
        
      `}</style>

      <div className={cn("w-full max-w-7xl mx-auto", isMobile ? "px-2 py-3 space-y-3" : "px-4 py-6 space-y-8")}>
        {/* Enhanced Hero Section - Mobile Optimized */}
        <motion.section
          id="hero"
          initial="hidden"
          animate="visible"
          variants={shouldReduceMotion ? {} : containerVariants}
          className={cn(
            "relative overflow-hidden rounded-xl text-white",
            "bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700",
            "shadow-2xl",
            isMobile ? "p-3" : "p-8"
          )}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          <motion.div
            variants={shouldReduceMotion ? {} : itemVariants}
            className="relative z-10"
          >
            <div className={cn("flex items-center gap-1.5", isMobile ? "mb-1.5" : "mb-4")}>
              <Sparkles className={cn("text-yellow-300 icon-glow", isMobile ? "h-3.5 w-3.5" : "h-6 w-6")} />
              <Badge className={cn(
                "bg-white/20 backdrop-blur-sm text-white border-white/30",
                "transition-all duration-200",
                isMobile ? "text-[8px] px-1.5 py-0.5" : "text-xs px-3 py-1"
              )}>
                {t('aboutProject')}
              </Badge>
            </div>

            <h1 className={cn(
              "font-bold leading-tight",
              isMobile ? "text-xl mb-2" : "text-4xl md:text-5xl mb-3"
            )}>
              {t('aboutZaminatEco')}
            </h1>
            
            <p className={cn(
              "opacity-95 leading-relaxed",
              isMobile ? "text-xs mb-2.5" : "text-lg md:text-xl mb-4"
            )}>
              <strong className="text-yellow-200">ZAMINAT.eco</strong> {t('aboutZaminatDesc')}
            </p>

            <div className={cn(
              "flex flex-wrap",
              isMobile ? "gap-1" : "gap-2"
            )}>
              {[
                t('plasticRubberRecyclingBadge'),
                t('ecoAppPlatformBadge'),
                t('ecoProductsBadge')
              ].map((badge, idx) => (
                <motion.div
                  key={idx}
                  initial={shouldReduceMotion ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + idx * 0.05, duration: 0.3 }}
                >
                  <Badge className={cn(
                    "bg-white/20 backdrop-blur-sm text-white border-white/30",
                    "transition-all duration-200 hover:bg-white/30",
                    isMobile ? "text-[8px] px-1.5 py-0.5" : "text-xs px-3 py-1"
                  )}>
                    {badge}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <UzbekPattern className={cn(
            "w-full text-white opacity-30 relative z-10",
            isMobile ? "h-1.5 mt-2" : "h-3 mt-6"
          )} />
        </motion.section>

        {/* Enhanced Mission Statement - Professional & User-Friendly */}
        <motion.section
          id="mission"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={shouldReduceMotion ? {} : fadeInUp}
          className={cn(isMobile ? "mb-8" : "mb-20")}
        >
          {!isMobile ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-stretch">
              {/* Mission Content - Enhanced Design */}
              <div className="space-y-8 flex flex-col h-full">
                {/* Mission Header - Enhanced with Gradient Background */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="p-2.5 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Target className="h-5 w-5" />
                    </motion.div>
                    <h2 className="font-bold text-gray-900 text-3xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {t('ourMission')}
                    </h2>
                  </div>
                  
                  {/* Mission Statement - Enhanced Card Design */}
                  <motion.div
                    className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-green-100 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    whileHover={{ 
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      borderColor: 'rgb(34, 197, 94)'
                    }}
                  >
                    {/* Decorative elements */}
                    <div className="absolute top-3 right-3 w-16 h-16 bg-green-200/30 rounded-full blur-xl" />
                    <div className="absolute bottom-3 left-3 w-12 h-12 bg-emerald-200/30 rounded-full blur-lg" />
                    
                    <p className="text-gray-700 leading-relaxed text-lg relative z-10">
                      <strong className="text-gray-900 font-semibold">{t('missionStatement')}</strong>
                    </p>
                  </motion.div>
                </motion.div>
                
                {/* What We Do & Impact Goals - Enhanced Cards with Better Visual Hierarchy */}
                <div className="grid gap-6 md:grid-cols-2 flex-1">
                  {/* What We Do Card - Enhanced */}
                  <motion.div 
                    className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Header with enhanced icon */}
                    <div className="relative z-10 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
                        <motion.div
                          className="p-1.5 rounded-lg bg-green-100"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <CheckCircle2 className="text-green-600 h-5 w-5" />
                        </motion.div>
                        <span className="bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                          {t('whatWeDo')}
                        </span>
                      </h3>
                    </div>
                    
                    <ul className="text-gray-700 space-y-3 text-sm relative z-10">
                      {[
                        { key: 'plastic', text: t('plasticRecyclingIntoTiles'), icon: Recycle },
                        { key: 'tires', text: t('rubberRecyclingIntoPlayground'), icon: Recycle },
                        { key: 'infrastructure', text: t('communityInfrastructureProjects'), icon: Users },
                        { key: 'education', text: t('educationalProgramsAndVolunteers'), icon: Award }
                      ].map((item, idx) => (
                        <motion.li 
                          key={idx}
                          className="flex items-start gap-3 group/item"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                        >
                          <motion.div
                            className="mt-0.5 flex-shrink-0"
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <item.icon className="text-green-600 h-4 w-4" />
                          </motion.div>
                          <span className="flex-1 leading-relaxed">
                            {item.key === 'plastic' && <strong className="text-gray-900">{t('plastic')}</strong>}
                            {item.key === 'tires' && <strong className="text-gray-900">{t('tires')}</strong>}
                            {item.key !== 'plastic' && item.key !== 'tires' && ''}
                            {item.text}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                  
                  {/* Our Impact Goals Card - Enhanced */}
                  <motion.div 
                    className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden group"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Header with enhanced icon */}
                    <div className="relative z-10 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
                        <motion.div
                          className="p-1.5 rounded-lg bg-teal-100"
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Target className="text-teal-600 h-5 w-5" />
                        </motion.div>
                        <span className="bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">
                          {t('ourImpactGoals')}
                        </span>
                      </h3>
                    </div>
                    
                    <ul className="text-gray-700 space-y-3 text-sm relative z-10">
                      {[
                        { text: t('schoolsAndPlaygrounds'), icon: Award },
                        { text: t('parksAndPublicSpaces'), icon: Leaf },
                        { text: t('transparentWasteTracking'), icon: Globe },
                        { text: t('gamifiedEnvironmentalEngagement'), icon: Sparkles }
                      ].map((item, idx) => (
                        <motion.li 
                          key={idx}
                          className="flex items-start gap-3 group/item"
                          initial={{ opacity: 0, x: 10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                        >
                          <motion.div
                            className="mt-0.5 flex-shrink-0"
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <item.icon className="text-teal-600 h-4 w-4" />
                          </motion.div>
                          <span className="flex-1 leading-relaxed">{item.text}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </div>
              
              {/* Image Carousel - Seamless Integration */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-24 h-full"
              >
                <ScrollImageCarousel
                  images={brandImages}
                  variant="inline"
                  className="w-full h-full"
                  transitionDuration={800}
                />
              </motion.div>
            </div>
          ) : (
            /* Mobile: Stack Layout - Enhanced & Optimized */
            <>
              <motion.div 
                className={cn("mb-4", isMobile ? "space-y-3" : "space-y-6 mb-6")}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {/* Mission Header - Enhanced */}
                <div className={cn("flex items-center", isMobile ? "gap-2" : "gap-3")}>
                  <motion.div 
                    className={cn(
                      "rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg",
                      isMobile ? "p-1.5" : "p-2 rounded-xl"
                    )}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Target className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                  </motion.div>
                  <h2 className={cn(
                    "font-bold text-gray-900",
                    isMobile ? "text-base" : "text-xl"
                  )}>
                    {t('ourMission')}
                  </h2>
                </div>
                
                {/* Mission Statement - Enhanced Card */}
                <motion.div
                  className={cn(
                    "relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl border-2 border-green-100 shadow-md",
                    isMobile ? "p-2.5" : "p-4 rounded-2xl"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className={cn(
                    "absolute bg-green-200/30 rounded-full blur-lg",
                    isMobile ? "top-1.5 right-1.5 w-8 h-8" : "top-2 right-2 w-12 h-12"
                  )} />
                  <p className={cn(
                    "text-gray-700 leading-relaxed relative z-10",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    <strong className="text-gray-900 font-semibold">{t('missionStatement')}</strong>
                  </p>
                </motion.div>
                
                <div className={cn("grid grid-cols-1", isMobile ? "gap-2.5" : "gap-4")}>
                  {/* What We Do Card - Enhanced */}
                  <motion.div 
                    className={cn(
                      "glass-card glass-card-hover rounded-xl relative overflow-hidden group",
                      isMobile ? "p-2.5" : "p-4 rounded-2xl"
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                      <h3 className={cn(
                        "font-semibold text-gray-900 flex items-center gap-1.5",
                        isMobile ? "mb-2 text-xs" : "mb-3 text-sm gap-2"
                      )}>
                        <div className={cn("rounded-lg bg-green-100", isMobile ? "p-0.5" : "p-1")}>
                          <CheckCircle2 className={cn("text-green-600", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                        </div>
                        <span className="bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                          {t('whatWeDo')}
                        </span>
                      </h3>
                      <ul className={cn(
                        "text-gray-700",
                        isMobile ? "space-y-1.5 text-[10px]" : "space-y-2.5 text-xs"
                      )}>
                        {[
                          { key: 'plastic', text: t('plasticRecyclingIntoTiles'), icon: Recycle },
                          { key: 'tires', text: t('rubberRecyclingIntoPlayground'), icon: Recycle },
                          { key: 'infrastructure', text: t('communityInfrastructureProjects'), icon: Users },
                          { key: 'education', text: t('educationalProgramsAndVolunteers'), icon: Award }
                        ].map((item, idx) => (
                          <li key={idx} className={cn("flex items-start", isMobile ? "gap-1.5" : "gap-2.5")}>
                            <item.icon className={cn(
                              "text-green-600 mt-0.5 flex-shrink-0",
                              isMobile ? "h-3 w-3" : "h-3.5 w-3.5"
                            )} />
                            <span className="flex-1 leading-relaxed">
                              {item.key === 'plastic' && <strong>{t('plastic')}</strong>}
                              {item.key === 'tires' && <strong>{t('tires')}</strong>}
                              {item.key !== 'plastic' && item.key !== 'tires' && ''}
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                  
                  {/* Our Impact Goals Card - Enhanced */}
                  <motion.div 
                    className={cn(
                      "glass-card glass-card-hover rounded-xl relative overflow-hidden group",
                      isMobile ? "p-2.5" : "p-4 rounded-2xl"
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                      <h3 className={cn(
                        "font-semibold text-gray-900 flex items-center gap-1.5",
                        isMobile ? "mb-2 text-xs" : "mb-3 text-sm gap-2"
                      )}>
                        <div className={cn("rounded-lg bg-teal-100", isMobile ? "p-0.5" : "p-1")}>
                          <Target className={cn("text-teal-600", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                        </div>
                        <span className="bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">
                          {t('ourImpactGoals')}
                        </span>
                      </h3>
                      <ul className={cn(
                        "text-gray-700",
                        isMobile ? "space-y-1.5 text-[10px]" : "space-y-2.5 text-xs"
                      )}>
                        {[
                          { text: t('schoolsAndPlaygrounds'), icon: Award },
                          { text: t('parksAndPublicSpaces'), icon: Leaf },
                          { text: t('transparentWasteTracking'), icon: Globe },
                          { text: t('gamifiedEnvironmentalEngagement'), icon: Sparkles }
                        ].map((item, idx) => (
                          <li key={idx} className={cn("flex items-start", isMobile ? "gap-1.5" : "gap-2.5")}>
                            <item.icon className={cn(
                              "text-teal-600 mt-0.5 flex-shrink-0",
                              isMobile ? "h-3 w-3" : "h-3.5 w-3.5"
                            )} />
                            <span className="flex-1 leading-relaxed">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Mobile Image Carousel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={cn(isMobile ? "mb-4" : "mb-6")}
              >
                <ScrollImageCarousel
                  images={brandImages}
                  variant="inline"
                  className="w-full"
                  transitionDuration={800}
                />
              </motion.div>
            </>
          )}
        </motion.section>

        {/* Enhanced Core Values - Mobile Optimized */}
        <motion.section
          id="values"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={shouldReduceMotion ? {} : containerVariants}
        >
          <div className={cn("flex items-center", isMobile ? "gap-2 mb-2.5" : "gap-3 mb-4")}>
            <div className={cn(
              "rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500",
              isMobile ? "p-1" : "p-2"
            )}>
              <Award className={cn("text-white", isMobile ? "h-4 w-4" : "h-6 w-6")} />
            </div>
            <h2 className={cn(
              "font-bold",
              isMobile ? "text-base" : "text-2xl md:text-3xl"
            )}>
              {t('ourValues')}
            </h2>
          </div>
          
          <div className={cn(
            "grid",
            isMobile ? "grid-cols-1 gap-2.5" : "md:grid-cols-2 gap-4"
          )}>
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={shouldReduceMotion ? {} : itemVariants}
                className="group"
              >
                <Card className={cn(
                  "glass-card glass-card-hover h-full card-hover-lift",
                  value.bgColor + "/20"
                )}>
                  <CardContent className={cn(isMobile ? "p-2.5" : "p-5")}>
                    <div className={cn("flex items-start", isMobile ? "gap-2" : "gap-4")}>
                      <div className={cn(
                        "rounded-lg bg-gradient-to-br",
                        value.color,
                        "text-white shadow-lg transition-transform duration-300 group-hover:scale-105",
                        isMobile ? "p-1.5" : "p-3 rounded-xl"
                      )}>
                        {isMobile ? (
                          React.cloneElement(value.icon, { className: "h-4 w-4" })
                        ) : (
                          value.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-bold",
                          value.textColor,
                          isMobile ? "text-xs mb-1" : "text-lg mb-2"
                        )}>
                          {value.title}
                        </h3>
                        <p className={cn(
                          "leading-relaxed",
                          value.textColor,
                          "opacity-80",
                          isMobile ? "text-[10px]" : "text-sm"
                        )}>
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Enhanced Roadmap with Timeline - Mobile Optimized */}
        <motion.section
          id="roadmap"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={shouldReduceMotion ? {} : containerVariants}
        >
          <div className={cn("flex items-center", isMobile ? "gap-2 mb-2.5" : "gap-3 mb-4")}>
            <div className={cn(
              "rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600",
              isMobile ? "p-1" : "p-2"
            )}>
              <TrendingUp className={cn("text-white", isMobile ? "h-4 w-4" : "h-6 w-6")} />
            </div>
            <h2 className={cn(
              "font-bold",
              isMobile ? "text-base" : "text-2xl md:text-3xl"
            )}>
              {t('ourRoadmap')}
            </h2>
          </div>

          <div className={cn("relative", isMobile ? "space-y-2" : "space-y-4")}>
            {/* Timeline Line */}
            {!isMobile && (
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 via-teal-400 to-emerald-400 opacity-30" />
            )}
            
            {roadmap.map((milestone, index) => (
              <motion.div
                key={index}
                variants={shouldReduceMotion ? {} : itemVariants}
                className="relative"
              >
                <Card className={cn(
                  "glass-card glass-card-hover card-hover-lift",
                  isMobile ? "ml-0" : "ml-16"
                )}>
                  <CardContent className={cn(isMobile ? "p-2.5" : "p-5")}>
                    <div className={cn("flex items-start", isMobile ? "gap-2" : "gap-4")}>
                      {/* Timeline Dot */}
                      {!isMobile && (
                        <div className={cn(
                          "absolute -left-12 top-6",
                          "w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500",
                          "flex items-center justify-center text-white shadow-lg",
                          "border-4 border-white transition-transform duration-300 hover:scale-110"
                        )}>
                          <milestone.icon className="h-5 w-5" />
                        </div>
                      )}
                      
                      <div className={cn(
                        "bg-gradient-to-br from-emerald-100 to-teal-100 rounded-md px-2 py-1",
                        "font-bold text-emerald-800 flex-shrink-0",
                        isMobile ? "text-[10px]" : "text-sm rounded-lg px-3 py-1.5"
                      )}>
                        {milestone.year}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-bold text-gray-900",
                          isMobile ? "text-xs mb-1" : "text-lg mb-2"
                        )}>
                          {milestone.event}
                        </h3>
                        <p className={cn(
                          "text-gray-600 leading-relaxed",
                          isMobile ? "text-[10px]" : "text-sm"
                        )}>
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Enhanced Progress & Goals with Animated Progress Bars - Mobile Optimized */}
        <motion.section
          id="progress"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={shouldReduceMotion ? {} : fadeInUp}
          className={cn(isMobile ? "mb-8" : "mb-16")}
        >
          <Card className={cn(
            "glass-card shadow-sm border overflow-hidden",
            isMobile ? "rounded-xl" : "rounded-3xl"
          )}>
            <CardHeader className={cn(
              "bg-transparent",
              isMobile ? "p-2.5 pb-2" : "p-6 pb-4"
            )}>
              <CardTitle className={cn(
                "flex items-center",
                isMobile ? "gap-1.5 text-xs" : "gap-2 text-xl"
              )}>
                <div className={cn(
                  "rounded-lg bg-teal-600 text-white",
                  isMobile ? "p-1" : "p-2"
                )}>
                  <Globe className={cn(isMobile ? "h-3 w-3" : "h-5 w-5")} />
                </div>
                {t('currentProgressAnd2026Goals')}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(isMobile ? "space-y-3 p-2.5" : "space-y-6 p-6")}>
              <p className={cn(
                "text-gray-700 leading-relaxed",
                isMobile ? "text-xs" : "text-base"
              )}>
                <strong className="text-blue-700">ZAMINAT.eco</strong> {t('currentProgressDesc')}
              </p>
              
              <div className={cn(
                "grid",
                isMobile ? "grid-cols-1 gap-2.5" : "md:grid-cols-2 gap-4"
              )}>
                {/* Current Status */}
                <div className={cn(
                  "bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200 shadow-md",
                  isMobile ? "p-2.5" : "p-5 rounded-xl"
                )}>
                  <h3 className={cn(
                    "font-bold text-gray-800 flex items-center gap-1.5",
                    isMobile ? "text-xs mb-2" : "text-base mb-4 gap-2"
                  )}>
                    <div className={cn("rounded-full bg-green-500", isMobile ? "w-1.5 h-1.5" : "w-2 h-2")} />
                    {t('currentStatus2025')}
                  </h3>
                  <div className={cn(isMobile ? "space-y-1.5" : "space-y-3")}>
                    {[
                      { label: t('plasticRubberRecycledLabel'), value: `${globalStats.totalWasteCollected} ${t('kg')}` },
                      { label: t('activeUsersLabel'), value: globalStats.totalUsers },
                      { label: t('pilotProjectsLabel'), value: globalStats.totalProjects },
                      { label: t('treesPlantedLabel'), value: globalStats.treesPlanted }
                    ].map((stat, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className={cn("text-gray-700", isMobile ? "text-[10px]" : "text-sm")}>
                            {stat.label}
                          </span>
                          <span className={cn(
                            "font-bold text-gray-900",
                            isMobile ? "text-[10px]" : "text-sm"
                          )}>
                            {stat.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 2026 Goals with Progress Bars */}
                <div className={cn(
                  "bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-md",
                  isMobile ? "p-2.5" : "p-5 rounded-xl"
                )}>
                  <h3 className={cn(
                    "font-bold text-green-800 flex items-center gap-1.5",
                    isMobile ? "text-xs mb-2" : "text-base mb-4 gap-2"
                  )}>
                    <Target className={cn("text-green-600", isMobile ? "h-3 w-3" : "h-5 w-5")} />
                    {t('2026Goals')}
                  </h3>
                  <div className={cn(isMobile ? "space-y-1.5" : "space-y-3")}>
                    {[
                      { 
                        label: t('wasteTargetLabel'), 
                        current: globalStats.totalWasteCollected,
                        target: goals2026.wasteTarget / 1000,
                        unit: t('tons'),
                        progress: Math.min(wasteProgress, 100)
                      },
                      { 
                        label: t('userTargetLabel'), 
                        current: globalStats.totalUsers,
                        target: goals2026.usersTarget,
                        unit: '',
                        progress: Math.min(userProgress, 100)
                      },
                      { 
                        label: t('projectTargetLabel'), 
                        current: globalStats.totalProjects,
                        target: goals2026.projectsTarget,
                        unit: '',
                        progress: Math.min(projectProgress, 100)
                      },
                      { 
                        label: t('treeTargetLabel'), 
                        current: globalStats.treesPlanted,
                        target: goals2026.treesTarget,
                        unit: '',
                        progress: Math.min(treeProgress, 100)
                      }
                    ].map((goal, idx) => (
                      <div key={idx} className={cn(isMobile ? "space-y-1" : "space-y-1.5")}>
                        <div className="flex justify-between items-center">
                          <span className={cn("text-green-700", isMobile ? "text-[10px]" : "text-sm")}>
                            {goal.label}
                          </span>
                          <span className={cn(
                            "font-bold text-green-800",
                            isMobile ? "text-[10px]" : "text-sm"
                          )}>
                            {goal.target.toLocaleString()}{goal.unit && ` ${goal.unit}`}
                          </span>
                        </div>
                        <div className={cn(
                          "w-full bg-green-200 rounded-full overflow-hidden",
                          isMobile ? "h-1.5" : "h-2"
                        )}>
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${goal.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ 
                              duration: shouldReduceMotion ? 0 : 1, 
                              delay: idx * 0.1, 
                              ease: [0.25, 0.1, 0.25, 1]
                            }}
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full progress-bar-glow"
                            style={{ willChange: 'width' }}
                          />
                        </div>
                        <div className={cn(
                          "text-green-600 opacity-75",
                          isMobile ? "text-[9px]" : "text-xs"
                        )}>
                          {goal.progress.toFixed(1)}% {t('completed', { defaultValue: 'complete' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Enhanced Technology & Innovation - Mobile Optimized */}
        <motion.section
          id="technology"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={shouldReduceMotion ? {} : fadeInUp}
          className={cn(isMobile ? "mb-8" : "mb-16")}
        >
          <Card className={cn(
            "shadow-sm border-0 overflow-hidden bg-white",
            isMobile ? "rounded-xl" : "rounded-3xl"
          )}>
            <CardHeader className={cn(
              "bg-transparent",
              isMobile ? "p-2.5 pb-2" : "p-6 pb-4"
            )}>
              <CardTitle className={cn(
                "flex items-center",
                isMobile ? "gap-1.5 text-xs" : "gap-2 text-xl"
              )}>
                <div className={cn(
                  "rounded-lg bg-teal-600 text-white",
                  isMobile ? "p-1" : "p-2"
                )}>
                  <Zap className={cn(isMobile ? "h-3 w-3" : "h-5 w-5")} />
                </div>
                {t('technologyAndInnovation')}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(isMobile ? "space-y-3 p-2.5" : "space-y-6 p-6")}>
              <p className={cn(
                "text-gray-700 leading-relaxed",
                isMobile ? "text-xs" : "text-base"
              )}>
                <strong className="text-teal-700">ZAMINAT.eco</strong> {t('technologyDesc')}
              </p>
              
              <div className={cn(
                "grid",
                isMobile ? "grid-cols-1 gap-2.5" : "md:grid-cols-2 gap-4"
              )}>
                <div
                  className={cn(
                    "bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200",
                    "card-hover-lift shadow-md",
                    isMobile ? "p-2.5" : "p-5 rounded-xl"
                  )}
                >
                  <h3 className={cn(
                    "font-bold text-blue-800 flex items-center gap-1.5",
                    isMobile ? "text-xs mb-2" : "text-base mb-3 gap-2"
                  )}>
                    <Sparkles className={cn("text-teal-600 icon-glow", isMobile ? "h-3 w-3" : "h-5 w-5")} />
                    {t('ecoAppPlatform')}
                  </h3>
                  <ul className={cn(
                    "text-blue-700",
                    isMobile ? "space-y-1 text-[10px]" : "space-y-2 text-sm"
                  )}>
                    {[
                      t('gamificationWith50Levels'),
                      t('democraticVotingOnProjects'),
                      t('realTimeWasteTracking'),
                      t('socialMissionMarketplace')
                    ].map((item, idx) => (
                      <li key={idx} className={cn("flex items-start", isMobile ? "gap-1" : "gap-2")}>
                        <CheckCircle2 className={cn(
                          "text-teal-600 flex-shrink-0 mt-0.5",
                          isMobile ? "h-2.5 w-2.5" : "h-4 w-4"
                        )} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div
                  className={cn(
                    "bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border border-teal-200",
                    "card-hover-lift shadow-md",
                    isMobile ? "p-2.5" : "p-5 rounded-xl"
                  )}
                >
                  <h3 className={cn(
                    "font-bold text-teal-800 flex items-center gap-1.5",
                    isMobile ? "text-xs mb-2" : "text-base mb-3 gap-2"
                  )}>
                    <TrendingUp className={cn("text-teal-600 icon-glow", isMobile ? "h-3 w-3" : "h-5 w-5")} />
                    {t('plannedFeatures')}
                  </h3>
                  <ul className={cn(
                    "text-teal-700",
                    isMobile ? "space-y-1 text-[10px]" : "space-y-2 text-sm"
                  )}>
                    {[
                      t('blockchainTransparency2027'),
                      t('arEducationalModules'),
                      t('communityImpactDashboards'),
                      t('integrationWithEcoKids')
                    ].map((item, idx) => (
                      <li key={idx} className={cn("flex items-start", isMobile ? "gap-1" : "gap-2")}>
                        <CheckCircle2 className={cn(
                          "text-teal-600 flex-shrink-0 mt-0.5",
                          isMobile ? "h-2.5 w-2.5" : "h-4 w-4"
                        )} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Enhanced Contact Section - Mobile Optimized */}
        <motion.section
          id="contact"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={shouldReduceMotion ? {} : fadeInUp}
        >
          <Card className={cn(
            "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50",
            "border-2 border-green-200 shadow-xl overflow-hidden",
            isMobile ? "rounded-xl" : ""
          )}>
            <CardHeader className={cn(isMobile ? "p-2.5 pb-2" : "p-6")}>
              <CardTitle className={cn(
                "flex items-center",
                isMobile ? "gap-1.5 text-xs" : "gap-2 text-xl"
              )}>
                <div className={cn(
                  "rounded-lg bg-emerald-600 text-white",
                  isMobile ? "p-1" : "p-2"
                )}>
                  <Mail className={cn(isMobile ? "h-3 w-3" : "h-5 w-5")} />
                </div>
                {t('getInTouch')}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(isMobile ? "space-y-2.5 p-2.5" : "space-y-5 p-6")}>
              <p className={cn(
                "text-gray-700 leading-relaxed",
                isMobile ? "text-xs" : "text-base"
              )}>
                {t('joinZaminatMovement')}
              </p>
              
              <div className={cn(
                "flex",
                isMobile ? "flex-col gap-2" : "flex-col sm:flex-row gap-3"
              )}>
                <Button 
                  className={cn(
                    "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg",
                    "w-full transition-all duration-200 hover:shadow-xl",
                    "flex items-center justify-center gap-1.5",
                    isMobile ? "h-10 text-xs py-2" : "h-12 gap-2"
                  )}
                  style={{ touchAction: 'manipulation' }}
                  onClick={() => {
                    contactHelpers.generalInquiry();
                  }}
                >
                  <Mail className={cn(isMobile ? "h-3.5 w-3.5" : "h-5 w-5")} />
                  {t('contactUs')}
                </Button>
                <Button 
                  variant="outline"
                  className={cn(
                    "border-green-600 text-green-700 hover:bg-green-50",
                    "w-full transition-all duration-200 hover:shadow-lg",
                    "flex items-center justify-center gap-1.5",
                    isMobile ? "h-10 text-xs py-2" : "h-12 gap-2"
                  )}
                  style={{ touchAction: 'manipulation' }}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('https://t.me/zaminat_eco', '_blank', 'noopener,noreferrer');
                  }}
                >
                  {t('joinTelegramCommunity')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Enhanced Call to Action - Mobile Optimized */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={shouldReduceMotion ? {} : fadeInUp}
          className={cn(
            "text-center",
            isMobile ? "py-4" : "py-10"
          )}
        >
          <h2 className={cn(
            "font-bold text-gray-900",
            isMobile ? "text-base mb-2" : "text-3xl md:text-4xl mb-3"
          )}>
            {t('joinTheZaminatMovement')}
          </h2>
          <p className={cn(
            "text-gray-600 leading-relaxed max-w-2xl mx-auto",
            isMobile ? "text-xs px-3" : "text-base md:text-lg px-4"
          )}>
            {t('bePartOfTransformation')}
          </p>
        </motion.section>
      </div>
    </Layout>
  );
}
