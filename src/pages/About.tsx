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

  const roadmap = [
    { 
      year: '2025', 
      event: t('pilotLaunch'), 
      description: t('pilotLaunchDesc'),
      icon: <Zap className="h-5 w-5" />
    },
    { 
      year: '2026', 
      event: t('regionalExpansion'), 
      description: t('regionalExpansionDesc'),
      icon: <TrendingUp className="h-5 w-5" />
    },
    { 
      year: '2027', 
      event: t('industrialScale'), 
      description: t('industrialScaleDesc'),
      icon: <Globe className="h-5 w-5" />
    },
    { 
      year: '2028-2029', 
      event: t('nationalImpact'), 
      description: t('nationalImpactDesc'),
      icon: <Award className="h-5 w-5" />
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
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t('transparency'),
      description: t('transparencyDesc'),
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: t('socialImpact'),
      description: t('socialImpactDesc'),
      color: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700"
    }
  ];

  // Calculate progress percentages
  const wasteProgress = (globalStats.totalWasteCollected / (goals2026.wasteTarget / 1000)) * 100;
  const userProgress = (globalStats.totalUsers / goals2026.usersTarget) * 100;
  const projectProgress = (globalStats.totalProjects / goals2026.projectsTarget) * 100;
  const treeProgress = (globalStats.treesPlanted / goals2026.treesTarget) * 100;

  // Brand images for scroll carousel - High quality images
  const brandImages = [
    '/images/Zaminat-brand-1.jpeg',
    '/images/Zaminat-brand-2.jpeg',
    '/images/Zaminat-brand-3.png',
    '/images/Zaminat-brand-4.jpeg',
    '/images/Zaminat-brand-5.jpeg',
    '/images/Zaminat-brand-6.jpeg',
    '/images/Zaminat-brand-7.jpeg',
  ];

  // Section identifiers for scroll-based image transitions
  const sectionIds = [
    'hero',
    'mission',
    'values',
    'roadmap',
    'progress',
    'technology',
    'contact'
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

      <div className={cn("w-full max-w-7xl mx-auto", isMobile ? "px-3 py-4 space-y-4" : "px-4 py-6 space-y-8")}>
        {/* Enhanced Hero Section */}
        <motion.section
          id="hero"
          initial="hidden"
          animate="visible"
          variants={shouldReduceMotion ? {} : containerVariants}
          className={cn(
            "relative overflow-hidden rounded-2xl text-white",
            "bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700",
            "shadow-2xl",
            isMobile ? "p-4" : "p-8"
          )}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          <motion.div
            variants={shouldReduceMotion ? {} : itemVariants}
            className="relative z-10"
          >
            <div className={cn("flex items-center gap-2 mb-3", isMobile ? "mb-2" : "mb-4")}>
              <Sparkles className={cn("text-yellow-300 icon-glow", isMobile ? "h-4 w-4" : "h-6 w-6")} />
              <Badge className={cn(
                "bg-white/20 backdrop-blur-sm text-white border-white/30",
                "transition-all duration-200",
                isMobile ? "text-[9px] px-2 py-0.5" : "text-xs px-3 py-1"
              )}>
                {t('aboutProject')}
              </Badge>
            </div>

            <h1 className={cn(
              "font-bold mb-3 leading-tight",
              isMobile ? "text-2xl" : "text-4xl md:text-5xl"
            )}>
              {t('aboutZaminatEco')}
            </h1>
            
            <p className={cn(
              "opacity-95 leading-relaxed mb-4",
              isMobile ? "text-sm" : "text-lg md:text-xl"
            )}>
              <strong className="text-yellow-200">ZAMINAT.eco</strong> {t('aboutZaminatDesc')}
            </p>

            <div className={cn(
              "flex flex-wrap gap-2",
              isMobile ? "gap-1.5" : "gap-2"
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
                    isMobile ? "text-[9px] px-2 py-0.5" : "text-xs px-3 py-1"
                  )}>
                    {badge}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <UzbekPattern className={cn(
            "w-full text-white opacity-30 relative z-10",
            isMobile ? "h-2 mt-3" : "h-3 mt-6"
          )} />
        </motion.section>

        {/* Enhanced Mission Statement - Linear/Apple Style */}
        <motion.section
          id="mission"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={shouldReduceMotion ? {} : fadeInUp}
          className="mb-20"
        >
          {!isMobile ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
              {/* Mission Content - Minimal Design */}
              <div className="space-y-8">
                {/* Mission Header */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-green-600 text-white shadow-sm">
                      <Target className="h-5 w-5" />
                    </div>
                    <h2 className="font-bold text-gray-900 text-3xl">
                      {t('ourMission')}
                    </h2>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed text-lg">
                    <strong className="text-gray-900">{t('missionStatement')}</strong>
                  </p>
                </div>
                
                {/* What We Do & Impact Goals - Clean Cards */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-white rounded-2xl shadow-sm p-6 card-hover-lift">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
                      <CheckCircle2 className="text-green-600 h-5 w-5" />
                      {t('whatWeDo')}
                    </h3>
                    <ul className="text-gray-700 space-y-2.5 text-sm">
                      <li className="flex items-start gap-2.5">
                        <span className="text-green-600 mt-1.5 font-bold">•</span>
                        <span><strong className="text-gray-900">{t('plastic')}</strong> {t('plasticRecyclingIntoTiles')}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-green-600 mt-1.5 font-bold">•</span>
                        <span><strong className="text-gray-900">{t('tires')}</strong> {t('rubberRecyclingIntoPlayground')}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-green-600 mt-1.5 font-bold">•</span>
                        <span>{t('communityInfrastructureProjects')}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-green-600 mt-1.5 font-bold">•</span>
                        <span>{t('educationalProgramsAndVolunteers')}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-sm p-6 card-hover-lift">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
                      <Target className="text-blue-600 h-5 w-5" />
                      {t('ourImpactGoals')}
                    </h3>
                    <ul className="text-gray-700 space-y-2.5 text-sm">
                      <li className="flex items-start gap-2.5">
                        <span className="text-blue-600 mt-1.5 font-bold">•</span>
                        <span>{t('schoolsAndPlaygrounds')}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-blue-600 mt-1.5 font-bold">•</span>
                        <span>{t('parksAndPublicSpaces')}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-blue-600 mt-1.5 font-bold">•</span>
                        <span>{t('transparentWasteTracking')}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-blue-600 mt-1.5 font-bold">•</span>
                        <span>{t('gamifiedEnvironmentalEngagement')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Image Carousel - Seamless Integration */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-24"
              >
                <ScrollImageCarousel
                  images={brandImages}
                  sections={sectionIds}
                  variant="inline"
                  className="w-full"
                  transitionDuration={800}
                />
              </motion.div>
            </div>
          ) : (
            /* Mobile: Stack Layout */
            <>
              <div className="space-y-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-600 text-white">
                    <Target className="h-4 w-4" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-xl">
                    {t('ourMission')}
                  </h2>
                </div>
                
                <p className="text-gray-700 leading-relaxed text-sm">
                  <strong className="text-gray-900">{t('missionStatement')}</strong>
                </p>
                
                <div className="grid gap-4 grid-cols-1">
                  <div className="bg-white rounded-2xl shadow-sm p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                      <CheckCircle2 className="text-green-600 h-4 w-4" />
                      {t('whatWeDo')}
                    </h3>
                    <ul className="text-gray-700 space-y-2 text-xs">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span><strong>{t('plastic')}</strong> {t('plasticRecyclingIntoTiles')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span><strong>{t('tires')}</strong> {t('rubberRecyclingIntoPlayground')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{t('communityInfrastructureProjects')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{t('educationalProgramsAndVolunteers')}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-sm p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                      <Target className="text-blue-600 h-4 w-4" />
                      {t('ourImpactGoals')}
                    </h3>
                    <ul className="text-gray-700 space-y-2 text-xs">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{t('schoolsAndPlaygrounds')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{t('parksAndPublicSpaces')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{t('transparentWasteTracking')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{t('gamifiedEnvironmentalEngagement')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Mobile Image Carousel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <ScrollImageCarousel
                  images={brandImages}
                  sections={sectionIds}
                  variant="inline"
                  className="w-full"
                  transitionDuration={800}
                />
              </motion.div>
            </>
          )}
        </motion.section>

        {/* Enhanced Core Values */}
        <motion.section
          id="values"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={shouldReduceMotion ? {} : containerVariants}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500",
              isMobile ? "p-1.5" : "p-2"
            )}>
              <Award className={cn("text-white", isMobile ? "h-5 w-5" : "h-6 w-6")} />
            </div>
            <h2 className={cn(
              "font-bold",
              isMobile ? "text-lg" : "text-2xl md:text-3xl"
            )}>
              {t('ourValues')}
            </h2>
          </div>
          
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "md:grid-cols-2"
          )}>
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={shouldReduceMotion ? {} : itemVariants}
                className="group"
              >
                <Card className={cn(
                  "h-full border-2 card-hover-lift",
                  "hover:border-green-300",
                  value.bgColor
                )}>
                  <CardContent className={cn(isMobile ? "p-4" : "p-5")}>
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl bg-gradient-to-br",
                        value.color,
                        "text-white shadow-lg transition-transform duration-300 group-hover:scale-105",
                        isMobile ? "p-2" : "p-3"
                      )}>
                        {isMobile ? (
                          React.cloneElement(value.icon, { className: "h-5 w-5" })
                        ) : (
                          value.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-bold mb-2",
                          value.textColor,
                          isMobile ? "text-sm" : "text-lg"
                        )}>
                          {value.title}
                        </h3>
                        <p className={cn(
                          "leading-relaxed",
                          value.textColor,
                          "opacity-80",
                          isMobile ? "text-xs" : "text-sm"
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

        {/* Enhanced Roadmap with Timeline */}
        <motion.section
          id="roadmap"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={shouldReduceMotion ? {} : containerVariants}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600",
              isMobile ? "p-1.5" : "p-2"
            )}>
              <TrendingUp className={cn("text-white", isMobile ? "h-5 w-5" : "h-6 w-6")} />
            </div>
            <h2 className={cn(
              "font-bold",
              isMobile ? "text-lg" : "text-2xl md:text-3xl"
            )}>
              {t('ourRoadmap')}
            </h2>
          </div>

          <div className={cn("relative", isMobile ? "space-y-3" : "space-y-4")}>
            {/* Timeline Line */}
            {!isMobile && (
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 to-purple-400 opacity-30" />
            )}
            
            {roadmap.map((milestone, index) => (
              <motion.div
                key={index}
                variants={shouldReduceMotion ? {} : itemVariants}
                className="relative"
              >
                <Card className={cn(
                  "border-2 card-hover-lift",
                  "hover:border-green-300",
                  isMobile ? "ml-0" : "ml-16"
                )}>
                  <CardContent className={cn(isMobile ? "p-4" : "p-5")}>
                    <div className="flex items-start gap-4">
                      {/* Timeline Dot */}
                      {!isMobile && (
                        <div className={cn(
                          "absolute -left-12 top-6",
                          "w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500",
                          "flex items-center justify-center text-white shadow-lg",
                          "border-4 border-white transition-transform duration-300 hover:scale-110"
                        )}>
                          {milestone.icon}
                        </div>
                      )}
                      
                      <div className={cn(
                        "bg-gradient-to-br from-green-100 to-blue-100 rounded-lg px-3 py-1.5",
                        "font-bold text-green-800 flex-shrink-0",
                        isMobile ? "text-xs" : "text-sm"
                      )}>
                        {milestone.year}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-bold mb-2 text-gray-900",
                          isMobile ? "text-sm" : "text-lg"
                        )}>
                          {milestone.event}
                        </h3>
                        <p className={cn(
                          "text-gray-600 leading-relaxed",
                          isMobile ? "text-xs" : "text-sm"
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

        {/* Enhanced Progress & Goals with Animated Progress Bars */}
        <motion.section
          id="progress"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={shouldReduceMotion ? {} : fadeInUp}
          className="mb-16"
        >
          <Card className="shadow-sm border-0 overflow-hidden bg-white rounded-3xl">
            <CardHeader className={cn(
              "bg-transparent",
              isMobile ? "p-4 pb-3" : "p-6 pb-4"
            )}>
              <CardTitle className={cn(
                "flex items-center gap-2",
                isMobile ? "text-base" : "text-xl"
              )}>
                <div className={cn(
                  "p-2 rounded-lg bg-blue-600 text-white",
                  isMobile ? "p-1.5" : "p-2"
                )}>
                  <Globe className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                {t('currentProgressAnd2026Goals')}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(isMobile ? "space-y-4 p-4" : "space-y-6 p-6")}>
              <p className={cn(
                "text-gray-700 leading-relaxed",
                isMobile ? "text-sm" : "text-base"
              )}>
                <strong className="text-blue-700">ZAMINAT.eco</strong> {t('currentProgressDesc')}
              </p>
              
              <div className={cn(
                "grid gap-4",
                isMobile ? "grid-cols-1" : "md:grid-cols-2"
              )}>
                {/* Current Status */}
                <div className={cn(
                  "bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200",
                  "p-5 shadow-md"
                )}>
                  <h3 className={cn(
                    "font-bold text-gray-800 mb-4 flex items-center gap-2",
                    isMobile ? "text-sm" : "text-base"
                  )}>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    {t('currentStatus2025')}
                  </h3>
                  <div className={cn("space-y-3", isMobile ? "space-y-2.5" : "space-y-3")}>
                    {[
                      { label: t('plasticRubberRecycledLabel'), value: `${globalStats.totalWasteCollected} ${t('kg')}` },
                      { label: t('activeUsersLabel'), value: globalStats.totalUsers },
                      { label: t('pilotProjectsLabel'), value: globalStats.totalProjects },
                      { label: t('treesPlantedLabel'), value: globalStats.treesPlanted }
                    ].map((stat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className={cn("text-gray-700", isMobile ? "text-xs" : "text-sm")}>
                            {stat.label}
                          </span>
                          <span className={cn(
                            "font-bold text-gray-900",
                            isMobile ? "text-xs" : "text-sm"
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
                  "bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200",
                  "p-5 shadow-md"
                )}>
                  <h3 className={cn(
                    "font-bold text-green-800 mb-4 flex items-center gap-2",
                    isMobile ? "text-sm" : "text-base"
                  )}>
                    <Target className={cn("text-green-600", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                    {t('2026Goals')}
                  </h3>
                  <div className={cn("space-y-3", isMobile ? "space-y-2.5" : "space-y-3")}>
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
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className={cn("text-green-700", isMobile ? "text-xs" : "text-sm")}>
                            {goal.label}
                          </span>
                          <span className={cn(
                            "font-bold text-green-800",
                            isMobile ? "text-xs" : "text-sm"
                          )}>
                            {goal.target.toLocaleString()}{goal.unit && ` ${goal.unit}`}
                          </span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
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
                        <div className="text-xs text-green-600 opacity-75">
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

        {/* Enhanced Technology & Innovation */}
        <motion.section
          id="technology"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={shouldReduceMotion ? {} : fadeInUp}
          className="mb-16"
        >
          <Card className="shadow-sm border-0 overflow-hidden bg-white rounded-3xl">
            <CardHeader className={cn(
              "bg-transparent",
              isMobile ? "p-4 pb-3" : "p-6 pb-4"
            )}>
              <CardTitle className={cn(
                "flex items-center gap-2",
                isMobile ? "text-base" : "text-xl"
              )}>
                <div className={cn(
                  "p-2 rounded-lg bg-purple-600 text-white",
                  isMobile ? "p-1.5" : "p-2"
                )}>
                  <Zap className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                {t('technologyAndInnovation')}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(isMobile ? "space-y-4 p-4" : "space-y-6 p-6")}>
              <p className={cn(
                "text-gray-700 leading-relaxed",
                isMobile ? "text-sm" : "text-base"
              )}>
                <strong className="text-purple-700">ZAMINAT.eco</strong> {t('technologyDesc')}
              </p>
              
              <div className={cn(
                "grid gap-4",
                isMobile ? "grid-cols-1" : "md:grid-cols-2"
              )}>
                <div
                  className={cn(
                    "bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200",
                    "card-hover-lift shadow-md p-5"
                  )}
                >
                  <h3 className={cn(
                    "font-bold mb-3 text-blue-800 flex items-center gap-2",
                    isMobile ? "text-sm" : "text-base"
                  )}>
                    <Sparkles className={cn("text-blue-600 icon-glow", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                    {t('ecoAppPlatform')}
                  </h3>
                  <ul className={cn(
                    "text-blue-700 space-y-2",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {[
                      t('gamificationWith50Levels'),
                      t('democraticVotingOnProjects'),
                      t('realTimeWasteTracking'),
                      t('socialMissionMarketplace')
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={cn("text-blue-600 flex-shrink-0 mt-0.5", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div
                  className={cn(
                    "bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200",
                    "card-hover-lift shadow-md p-5"
                  )}
                >
                  <h3 className={cn(
                    "font-bold mb-3 text-purple-800 flex items-center gap-2",
                    isMobile ? "text-sm" : "text-base"
                  )}>
                    <TrendingUp className={cn("text-purple-600 icon-glow", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                    {t('plannedFeatures')}
                  </h3>
                  <ul className={cn(
                    "text-purple-700 space-y-2",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {[
                      t('blockchainTransparency2027'),
                      t('arEducationalModules'),
                      t('communityImpactDashboards'),
                      t('integrationWithEcoKids')
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={cn("text-purple-600 flex-shrink-0 mt-0.5", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Enhanced Contact Section */}
        <motion.section
          id="contact"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={shouldReduceMotion ? {} : fadeInUp}
        >
          <Card className={cn(
            "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50",
            "border-2 border-green-200 shadow-xl overflow-hidden"
          )}>
            <CardHeader className={cn(isMobile ? "p-4 pb-3" : "p-6")}>
              <CardTitle className={cn(
                "flex items-center gap-2",
                isMobile ? "text-base" : "text-xl"
              )}>
                <div className={cn(
                  "p-2 rounded-lg bg-green-600 text-white",
                  isMobile ? "p-1.5" : "p-2"
                )}>
                  <Mail className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                {t('getInTouch')}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(isMobile ? "space-y-4 p-4" : "space-y-5 p-6")}>
              <p className={cn(
                "text-gray-700 leading-relaxed",
                isMobile ? "text-sm" : "text-base"
              )}>
                {t('joinZaminatMovement')}
              </p>
              
              <div className={cn(
                "flex gap-3",
                isMobile ? "flex-col" : "flex-col sm:flex-row"
              )}>
                <Button 
                  className={cn(
                    "bg-green-600 hover:bg-green-700 text-white shadow-lg",
                    "w-full transition-all duration-200 hover:shadow-xl",
                    "flex items-center justify-center gap-2",
                    isMobile ? "h-11 text-sm" : "h-12"
                  )}
                  style={{ touchAction: 'manipulation' }}
                  onClick={() => {
                    contactHelpers.generalInquiry();
                  }}
                >
                  <Mail className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  {t('contactUs')}
                </Button>
                <Button 
                  variant="outline"
                  className={cn(
                    "border-green-600 text-green-700 hover:bg-green-50",
                    "w-full transition-all duration-200 hover:shadow-lg",
                    "flex items-center justify-center gap-2",
                    isMobile ? "h-11 text-sm" : "h-12"
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

        {/* Enhanced Call to Action */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={shouldReduceMotion ? {} : fadeInUp}
          className={cn(
            "text-center",
            isMobile ? "py-6" : "py-10"
          )}
        >
          <h2 className={cn(
            "font-bold text-gray-900 mb-3",
            isMobile ? "text-xl" : "text-3xl md:text-4xl"
          )}>
            {t('joinTheZaminatMovement')}
          </h2>
          <p className={cn(
            "text-gray-600 leading-relaxed max-w-2xl mx-auto",
            isMobile ? "text-sm px-4" : "text-base md:text-lg"
          )}>
            {t('bePartOfTransformation')}
          </p>
        </motion.section>
      </div>
    </Layout>
  );
}
