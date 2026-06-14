import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Heart, 
  MessageCircle, 
  BookOpen, 
  Play, 
  Youtube, 
  Instagram, 
  ExternalLink, 
  Eye, 
  Film, 
  Sparkles,
  Search,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { useTranslation } from 'react-i18next';
import { getIconForProductOrCategory } from '../lib/iconMatcher';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useSEO } from '../hooks/useSEO';
import '../styles/mobile-responsive.css';

// Sample story data with translation keys
const stories = [
  {
    id: 1,
    emoji: '🎉',
    image: '/images/community_16119903.webp',
    iconPath: '/images/community_16119903.webp',
    badgeType: 'update',
    titleKey: 'stories.pilotProgram.title',
    descriptionKey: 'stories.pilotProgram.description',
    authorKey: 'stories.pilotProgram.author',
    dateKey: 'stories.pilotProgram.date',
    readTimeKey: 'stories.pilotProgram.readTime',
    englishTitle: 'ZAMINAT.eco Launches Pilot Program in Tashkent Schools'
  },
  {
    id: 2,
    emoji: '🏫',
    image: '/images/school.webp',
    iconPath: '/images/Future of Plastic.webp',
    badgeType: 'successStory',
    titleKey: 'stories.futureRecycling.title',
    descriptionKey: 'stories.futureRecycling.description',
    authorKey: 'stories.futureRecycling.author',
    dateKey: 'stories.futureRecycling.date',
    readTimeKey: 'stories.futureRecycling.readTime',
    englishTitle: 'The Future of Plastic and Rubber Recycling in Uzbekistan'
  },
  {
    id: 3,
    emoji: '🎤',
    image: '/images/community_16119903.webp',
    iconPath: '/images/Malika.webp',
    badgeType: 'education',
    titleKey: 'stories.educationalPrograms.title',
    descriptionKey: 'stories.educationalPrograms.description',
    authorKey: 'stories.educationalPrograms.author',
    dateKey: 'stories.educationalPrograms.date',
    readTimeKey: 'stories.educationalPrograms.readTime',
    englishTitle: 'Educational Programs: Teaching the Next Generation'
  }
];

// Community stories data
const communityStories = [
  {
    id: 1,
    avatar: '👨‍🎓',
    avatarImage: '/images/Bobur.webp',
    nameKey: 'stories.mahallTransformation.author',
    englishName: 'Bobur Rahimov',
    level: 8,
    titleKey: 'stories.mahallTransformation.title',
    descriptionKey: 'stories.mahallTransformation.description',
    dateKey: 'stories.mahallTransformation.date',
    locationKey: 'stories.mahallTransformation.location',
    environmentalImpactKey: 'stories.mahallTransformation.environmentalImpact',
    impactDescriptionKey: 'stories.mahallTransformation.impactDescription',
    emojis: ['🏗️', '♻️', '🏞️'],
    images: ['/images/art-tiles.webp', '/images/ECOBUSSTOP.webp', '/images/forest_10089053.webp'],
    likesKey: 'stories.mahallTransformation.likes',
    commentsKey: 'stories.mahallTransformation.comments',
    hashtags: ['#transformation', '#playground']
  },
  {
    id: 2,
    avatar: '👩‍🏫',
    avatarImage: '/images/Malika.webp',
    nameKey: 'stories.teachingKids.author',
    englishName: 'Malika Tursunova',
    level: 15,
    titleKey: 'stories.teachingKids.title',
    descriptionKey: 'stories.teachingKids.description',
    dateKey: 'stories.teachingKids.date',
    locationKey: 'stories.teachingKids.location',
    emojis: ['👨‍👩‍👧‍👦', '📚', '🌱'],
    images: ['/images/community_16119903.webp', '/images/book_649180.webp', '/images/plant-a-tree_6675353.webp'],
    likesKey: 'stories.teachingKids.likes',
    commentsKey: 'stories.teachingKids.comments',
    hashtags: ['#education', '#children']
  }
];

// Localized Video Hub Data (matching user provided links)
const videos = [
  {
    id: 'f6U_rK1-jWM',
    platform: 'youtube',
    url: 'https://www.youtube.com/shorts/f6U_rK1-jWM',
    thumbnail: 'https://img.youtube.com/vi/f6U_rK1-jWM/hqdefault.jpg',
    duration: '0:45',
    category: 'education',
    likes: '1.2K',
    views: '12.5K',
    viewsKey: 'views',
    lang: 'RU'
  },
  {
    id: '92y0oClestY',
    platform: 'youtube',
    url: 'https://www.youtube.com/shorts/92y0oClestY',
    thumbnail: 'https://img.youtube.com/vi/92y0oClestY/hqdefault.jpg',
    duration: '0:58',
    category: 'news',
    likes: '948',
    views: '8.2K',
    viewsKey: 'views',
    lang: 'EN'
  },
  {
    id: 'MgSB_vJjKGg',
    platform: 'youtube',
    url: 'https://www.youtube.com/shorts/MgSB_vJjKGg',
    thumbnail: 'https://img.youtube.com/vi/MgSB_vJjKGg/hqdefault.jpg',
    duration: '0:58',
    category: 'education',
    likes: '3.4K',
    views: '24.8K',
    viewsKey: 'views',
    lang: 'RU'
  },
  {
    id: 'zhaxX4Pl3ME',
    platform: 'youtube',
    url: 'https://www.youtube.com/shorts/zhaxX4Pl3ME',
    thumbnail: 'https://img.youtube.com/vi/zhaxX4Pl3ME/hqdefault.jpg',
    duration: '0:58',
    category: 'education',
    likes: '2.9K',
    views: '19.5K',
    viewsKey: 'views',
    lang: 'UZ'
  },
  {
    id: '8UGAjoiKmio',
    platform: 'youtube',
    url: 'https://www.youtube.com/shorts/8UGAjoiKmio',
    thumbnail: 'https://img.youtube.com/vi/8UGAjoiKmio/hqdefault.jpg',
    duration: '0:45',
    category: 'community',
    likes: '1.8K',
    views: '12.2K',
    viewsKey: 'views',
    lang: 'RU'
  },
  {
    id: 'a2e8CqGXMJE',
    platform: 'youtube',
    url: 'https://www.youtube.com/shorts/a2e8CqGXMJE',
    thumbnail: 'https://img.youtube.com/vi/a2e8CqGXMJE/hqdefault.jpg',
    duration: '0:45',
    category: 'community',
    likes: '2.2K',
    views: '14.5K',
    viewsKey: 'views',
    lang: 'UZ'
  },
  {
    id: '8q3chEM1GNQ',
    platform: 'youtube',
    url: 'https://www.youtube.com/shorts/8q3chEM1GNQ',
    thumbnail: 'https://img.youtube.com/vi/8q3chEM1GNQ/hqdefault.jpg',
    duration: '0:30',
    category: 'news',
    likes: '4.1K',
    views: '28.3K',
    viewsKey: 'views',
    lang: 'RU'
  },
  {
    id: 'JdAvQThA26Y',
    platform: 'youtube',
    url: 'https://youtu.be/JdAvQThA26Y',
    thumbnail: 'https://img.youtube.com/vi/JdAvQThA26Y/hqdefault.jpg',
    duration: '3:14',
    category: 'education',
    likes: '4.8K',
    views: '35.2K',
    viewsKey: 'views',
    lang: 'RU'
  },
  {
    id: 'NmNCxsrOFhU',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=NmNCxsrOFhU',
    thumbnail: 'https://img.youtube.com/vi/NmNCxsrOFhU/hqdefault.jpg',
    duration: '3:14',
    category: 'education',
    likes: '4.2K',
    views: '28.9K',
    viewsKey: 'views',
    lang: 'UZ'
  }
];

export default function EcoStories() {
  const { t } = useTranslation(['stories', 'translation']);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<typeof videos[0] | null>(null);

  // SEO Management
  useSEO({
    title: t('title', { ns: 'stories', defaultValue: 'EcoHub Stories' }) + ' | ZAMINAT.eco',
    description: t('subtitle', { ns: 'stories', defaultValue: 'Explore educational programs, recycling news, and inspiring community updates in Uzbekistan.' }),
    keywords: 'ecohub, zaminat stories, recycling cartoon, green movement tashkent, plastic recycling community',
  });

  // Get stories with WebP paths
  const storiesWithIcons = useMemo(() => {
    return stories.map(story => {
      let iconPath = story.iconPath;
      if (!iconPath || !iconPath.startsWith('/images/')) {
        const englishTitle = story.englishTitle || '';
        iconPath = getIconForProductOrCategory(englishTitle, story.image);
      }
      if (!iconPath || !iconPath.startsWith('/images/')) {
        iconPath = story.image;
      }
      return { ...story, iconPath };
    });
  }, []);

  // Get community stories with WebP avatars
  const communityStoriesWithIcons = useMemo(() => {
    return communityStories.map(story => {
      let avatarImage = story.avatarImage;
      if (!avatarImage || !avatarImage.startsWith('/images/')) {
        const englishName = story.englishName || '';
        avatarImage = getIconForProductOrCategory(englishName, story.avatar);
      }
      if (!avatarImage || !avatarImage.startsWith('/images/')) {
        avatarImage = story.avatar;
      }
      return { ...story, avatarImage };
    });
  }, []);

  // Filter both articles and community stories
  const filteredFeaturedStories = useMemo(() => {
    if (activeFilter === 'all') return storiesWithIcons;
    if (activeFilter === 'news') return storiesWithIcons.filter(s => s.badgeType === 'update');
    if (activeFilter === 'education') return storiesWithIcons.filter(s => s.badgeType === 'education');
    return [];
  }, [activeFilter, storiesWithIcons]);

  const filteredCommunityStories = useMemo(() => {
    if (activeFilter === 'all' || activeFilter === 'community') return communityStoriesWithIcons;
    return [];
  }, [activeFilter, communityStoriesWithIcons]);

  // Filter videos
  const filteredVideos = useMemo(() => {
    if (activeFilter === 'all') return videos;
    return videos.filter(v => v.category === activeFilter);
  }, [activeFilter]);

  const filters = [
    { key: 'all', labelKey: 'filters.allContent' },
    { key: 'community', labelKey: 'filters.communityStories' },
    { key: 'education', labelKey: 'filters.education' },
    { key: 'news', labelKey: 'filters.newsUpdates' }
  ];

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'update':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'successStory':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
      case 'education':
        return 'bg-teal-500/10 text-teal-700 border-teal-500/20';
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-500/20';
    }
  };

  const getTranslationArray = (key: string, fallback: string[] = []) => {
    try {
      const result = t(key, { ns: 'stories', returnObjects: true });
      return Array.isArray(result) ? result : fallback;
    } catch (error) {
      return fallback;
    }
  };

  return (
    <Layout title={t('stories', { ns: 'translation' })}>
      <div className="relative min-h-screen bg-slate-50/40 pb-20">
        
        {/* Dynamic Glow Orbs for visual depth */}
        <div className="absolute top-0 left-1/4 w-[450px] h-[450px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[140px] pointer-events-none -z-10" />

        {/* Hero Header Section */}
        <div className="relative overflow-hidden py-12 md:py-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-emerald-600/10 text-emerald-800 hover:bg-emerald-600/15 border border-emerald-500/20 px-4 py-1 text-xs font-semibold rounded-full uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 inline text-emerald-600" />
                {t('ecoHub', { ns: 'translation' })}
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight"
            >
              Discover Our{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600">
                {t('title', { ns: 'stories' })}
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg leading-relaxed font-light"
            >
              {t('subtitle', { ns: 'stories' })}
            </motion.p>
          </div>
        </div>

        {/* Categories / Filter Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 mb-8 md:mb-12">
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 bg-white shadow-md rounded-full border border-slate-200/50 max-w-full overflow-x-auto scrollbar-none gap-1">
              {filters.map((filter) => {
                const isActive = activeFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    id={`filter-tab-${filter.key}`}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`relative py-2 px-5 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-300 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full shadow-md shadow-emerald-600/15"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{t(filter.labelKey, { ns: 'stories' })}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="max-w-7xl mx-auto px-4 space-y-12 md:space-y-20 relative">

          {/* 1. Video Hub Section */}
          {filteredVideos.length > 0 && (
            <motion.section 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-l-4 border-emerald-500 pl-4">
                <div>
                  <h2 className="text-xl sm:text-3xl font-extrabold text-slate-800 flex items-center tracking-tight">
                    <Film className="h-6 w-6 mr-2.5 text-emerald-600" />
                    {t('videos.sectionTitle', { ns: 'translation', defaultValue: 'Eco Video Hub' })}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1 hidden sm:block">
                    {t('videos.sectionSubtitle', { ns: 'translation', defaultValue: 'Watch our latest updates, guides, and community initiatives in vertical shorts format' })}
                  </p>
                </div>
              </div>

              {/* 9:16 Portrait Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredVideos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      id={`video-card-${video.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: index * 0.03 }}
                      onClick={() => setSelectedVideo(video)}
                      className="group relative aspect-[9/16] rounded-3xl overflow-hidden cursor-pointer bg-slate-900 border border-slate-200/50 shadow-md hover:shadow-2xl transition-all duration-500"
                    >
                      {/* Video Thumbnail Cover */}
                      <img
                        src={video.thumbnail}
                        alt={t(`videos.${video.id}.title`, { ns: 'translation' })}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                        loading="lazy"
                      />

                      {/* Cover Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/10 transition-opacity duration-300 opacity-80 group-hover:opacity-95" />

                      {/* Media Player Icon Centered */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/35 flex items-center justify-center text-white shadow-2xl opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out">
                          <Play className="h-6 w-6 fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Overlay Top Badges */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
                        {video.platform === 'youtube' ? (
                          <span className="bg-red-600/90 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Youtube className="h-3.5 w-3.5 fill-white text-red-600" />
                            Shorts
                          </span>
                        ) : (
                          <span className="bg-gradient-to-r from-pink-600/90 to-purple-600/90 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Instagram className="h-3.5 w-3.5 text-white" />
                            Reels
                          </span>
                        )}
                        <span className="bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-mono font-medium">
                          {video.duration}
                        </span>
                      </div>

                      {/* Details Overlay (Bottom) */}
                      <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col justify-end space-y-2 z-10">
                        <h3 className="text-white font-bold text-xs sm:text-sm leading-snug line-clamp-2 text-left group-hover:text-emerald-300 transition-colors duration-300 flex items-start gap-1.5">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0 leading-none ${
                            video.lang === 'RU' 
                              ? 'bg-blue-500/25 text-blue-300 border border-blue-500/30' 
                              : video.lang === 'UZ' 
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {video.lang}
                          </span>
                          <span>{t(`videos.${video.id}.title`, { ns: 'translation' })}</span>
                        </h3>
                        <div className="flex items-center justify-between text-[10px] text-white border-t border-white/10 pt-2.5 pointer-events-none">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5 text-white" />
                            {video.views} {t(`videos.${video.viewsKey}`, { ns: 'translation' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                            {video.likes}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          )}

          {/* 2. Featured Stories & Community News */}
          {(filteredFeaturedStories.length > 0 || filteredCommunityStories.length > 0) && (
            <section className="space-y-6">
              <div className="flex items-center border-l-4 border-emerald-500 pl-4">
                <h2 className="text-xl sm:text-3xl font-extrabold text-slate-800 flex items-center tracking-tight">
                  <TrendingUp className="h-6 w-6 mr-2.5 text-emerald-600" />
                  {t('sections.featuredContent', { ns: 'stories' })}
                </h2>
              </div>
              
              <div className="grid gap-6 sm:gap-8">
                <AnimatePresence mode="popLayout">
                  {/* Editorial featured cards */}
                  {filteredFeaturedStories.map((story, index) => (
                    <motion.div
                      key={story.id}
                      id={`featured-card-${story.id}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200/40 transition-all duration-500 overflow-hidden flex flex-col md:flex-row"
                    >
                      {/* Left icon path container */}
                      <div className="relative w-full md:w-64 md:shrink-0 bg-slate-50 flex items-center justify-center p-6 sm:p-8 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 group-hover:scale-105 transition-transform duration-700" />
                        <img 
                          src={story.iconPath || story.image || story.emoji} 
                          alt={t(story.titleKey, { ns: 'stories' })} 
                          className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 object-contain filter drop-shadow-md group-hover:scale-108 group-hover:rotate-1 transition-all duration-500 ease-out" 
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Right article description container */}
                      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge className={`text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider border ${getBadgeStyle(story.badgeType)}`}>
                              {t(`badges.${story.badgeType}`, { ns: 'stories' })}
                            </Badge>
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-slate-350" />
                              {t(story.readTimeKey, { ns: 'stories' })} {t('readTime.minRead', { ns: 'stories' })}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-lg sm:text-2xl text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors duration-300">
                            {t(story.titleKey, { ns: 'stories' })}
                          </h3>
                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 font-light">
                            {t(story.descriptionKey, { ns: 'stories' })}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8 border border-slate-100 shadow-sm">
                              <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-800 text-xs font-bold uppercase">
                                {(t(story.authorKey, { ns: 'stories' }) || 'ZE').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xs">
                              <span className="block font-semibold text-slate-700">{t(story.authorKey, { ns: 'stories' })}</span>
                              <span className="block text-slate-400 text-[10px]">{t(story.dateKey, { ns: 'stories' })}</span>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs font-bold rounded-full border-slate-200 hover:text-emerald-700 hover:border-emerald-600/40 hover:bg-emerald-50/20 px-5 transition-all shadow-sm"
                          >
                            {t('buttons.readMore', { ns: 'stories' })}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Social community story feed */}
                  {filteredCommunityStories.map((story, index) => (
                    <motion.div
                      key={`community-${story.id}`}
                      id={`community-story-card-${story.id}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden p-6 sm:p-8 space-y-6"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-3.5">
                          <Avatar className="h-12 w-12 border-2 border-emerald-500/20 shadow-md">
                            {story.avatarImage ? (
                              <img 
                                src={story.avatarImage} 
                                alt={t(story.nameKey, { ns: 'stories' })} 
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-800 font-bold">
                                {story.avatar}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-slate-800 text-sm sm:text-base leading-none">
                                {t(story.nameKey, { ns: 'stories' })}
                              </h4>
                              <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border-emerald-500/10 text-emerald-700 flex items-center gap-0.5">
                                🌟 Level {story.level}
                              </Badge>
                              <Badge className="bg-blue-500/10 text-blue-700 border border-blue-500/10 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">
                                {t('badges.communityStory', { ns: 'stories' })}
                              </Badge>
                            </div>
                            <div className="flex items-center text-xs text-slate-400 space-x-2.5 mt-1.5">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-slate-350" />
                                {t(story.dateKey, { ns: 'stories' })}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-slate-350" />
                                {t(story.locationKey, { ns: 'stories' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-extrabold text-lg sm:text-xl text-slate-800 leading-tight">
                          {t(story.titleKey, { ns: 'stories' })}
                        </h3>
                        <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-light">
                          {t(story.descriptionKey, { ns: 'stories' })}
                        </p>
                        
                        {story.environmentalImpactKey && (
                          <div className="bg-gradient-to-r from-emerald-50/70 to-teal-50/40 border-l-4 border-emerald-500 p-4 rounded-r-2xl shadow-sm">
                            <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
                              🌱 <strong>{t(story.environmentalImpactKey, { ns: 'stories' })}</strong> {t(story.impactDescriptionKey, { ns: 'stories' })}
                            </p>
                          </div>
                        )}
                        
                        {story.images && story.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 pt-2">
                            {story.images.map((img, idx) => (
                              <div key={idx} className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden shadow-sm group/img bg-slate-100 border border-slate-100">
                                <img 
                                  src={img} 
                                  alt={`story-media-${idx}`} 
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/5 group-hover/img:bg-black/0 transition-colors" />
                                {story.emojis && story.emojis[idx] && (
                                  <span className="absolute bottom-2 right-2 bg-white/85 backdrop-blur-sm shadow px-2 py-0.5 rounded-lg text-sm">
                                    {story.emojis[idx]}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6 flex-wrap gap-4">
                          <div className="flex items-center space-x-6 text-xs sm:text-sm text-slate-400 font-semibold">
                            <button className="flex items-center space-x-1.5 hover:text-red-500 transition-colors group/react">
                              <Heart className="h-4.5 w-4.5 text-slate-350 group-hover/react:text-red-500 fill-transparent group-hover/react:fill-red-500 transition-all" />
                              <span className="transition-colors group-hover/react:text-red-500">{t(story.likesKey, { ns: 'stories' })}</span>
                            </button>
                            <button className="flex items-center space-x-1.5 hover:text-emerald-600 transition-colors group/react">
                              <MessageCircle className="h-4.5 w-4.5 text-slate-350 group-hover/react:text-emerald-600 transition-all" />
                              <span className="transition-colors group-hover/react:text-emerald-600">{t(story.commentsKey, { ns: 'stories' })}</span>
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {story.hashtags.map((hashtag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-[10px] font-semibold px-3 py-1 rounded-full border border-slate-150 bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors">
                                {hashtag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* 3. Educational Guides & Sharing Guidelines */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Guide Grid */}
            <Card className="bg-gradient-to-b from-emerald-50/50 via-emerald-50/10 to-transparent border border-emerald-100/40 rounded-3xl shadow-sm">
              <CardHeader className="pb-3 px-6 pt-6 sm:px-8 sm:pt-8">
                <CardTitle className="text-emerald-950 font-extrabold text-lg sm:text-xl flex items-center">
                  <BookOpen className="h-6 w-6 mr-2.5 text-emerald-600" />
                  {t('educationalResources.title', { ns: 'stories' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm text-slate-600 px-6 pb-6 sm:px-8 sm:pb-8">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/5 shadow-sm">
                    <h4 className="font-bold mb-2 text-emerald-950 text-sm flex items-center gap-1.5">
                      <span className="text-base">♻️</span> {t('educationalResources.plasticGuide.title', { ns: 'stories' })}
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-500 font-light">
                      {getTranslationArray('educationalResources.plasticGuide.items', [
                        'Types of recyclable plastics',
                        'Proper cleaning and sorting',
                        'Collection point locations',
                        'Environmental impact facts'
                      ]).map((item: string, index: number) => (
                        <li key={index} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/5 shadow-sm">
                    <h4 className="font-bold mb-2 text-emerald-950 text-sm flex items-center gap-1.5">
                      <span className="text-base">🚗</span> {t('educationalResources.rubberGuide.title', { ns: 'stories' })}
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-500 font-light">
                      {getTranslationArray('educationalResources.rubberGuide.items', [
                        'Tire recycling process',
                        'Rubber product identification',
                        'Safety guidelines',
                        'Community benefits'
                      ]).map((item: string, index: number) => (
                        <li key={index} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sharing Guide Card */}
            <Card className="bg-gradient-to-b from-teal-50/50 via-teal-50/10 to-transparent border border-teal-100/40 rounded-3xl shadow-sm">
              <CardHeader className="pb-3 px-6 pt-6 sm:px-8 sm:pt-8">
                <CardTitle className="text-teal-950 font-extrabold text-lg sm:text-xl flex items-center">
                  <Film className="h-6 w-6 mr-2.5 text-teal-600" />
                  {t('shareStory.title', { ns: 'stories' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600 px-6 pb-6 sm:px-8 sm:pb-8">
                <p className="leading-relaxed font-light text-slate-550 text-xs sm:text-sm">
                  {t('shareStory.description', { ns: 'stories' })}
                </p>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-teal-500/5 shadow-sm">
                  <ul className="space-y-2 text-xs font-light text-slate-500">
                    {getTranslationArray('shareStory.guidelines', [
                      'Document your waste collection activities',
                      'Share before/after photos of cleanup projects',
                      'Write about community transformation stories',
                      'Include environmental impact data when possible',
                      'Use relevant hashtags: #ZaminatEco #PlasticRecycling #RubberRecycling'
                    ]).map((guideline: string, index: number) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <span className="text-teal-600 mt-0.5 shrink-0">✔</span>
                        <span>{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xs font-bold py-2.5 px-6 h-10 shadow-md shadow-teal-600/15 transition-all">
                    {t('buttons.shareYourStory', { ns: 'stories' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 4. Join the Conversation CTA */}
          <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-slate-100 rounded-3xl overflow-hidden relative shadow-sm">
            <CardContent className="p-8 sm:p-12 text-center space-y-5">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-emerald-500/5 blur-[50px] pointer-events-none" />
              <h3 className="text-xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                {t('joinConversation.title', { ns: 'stories' })}
              </h3>
              <p className="text-slate-500 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed font-light">
                {t('joinConversation.description', { ns: 'stories' })}
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs sm:text-sm font-semibold h-10 px-6 shadow-md shadow-emerald-600/15">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {t('buttons.readMoreStories', { ns: 'stories' })}
                </Button>
                <Link to="/about">
                  <Button variant="outline" className="rounded-full text-xs sm:text-sm font-semibold h-10 px-6 border-slate-200 hover:text-emerald-600 bg-white shadow-sm">
                    {t('buttons.learnAboutZaminat', { ns: 'stories' })}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Video Modal Player (Glassmorphic Portrait Dialog) */}
      <Dialog open={selectedVideo !== null} onOpenChange={(open) => { if (!open) setSelectedVideo(null); }}>
        <DialogContent className="max-w-[420px] w-[95%] p-0 overflow-hidden border border-white/10 bg-slate-950/95 backdrop-blur-2xl rounded-3xl shadow-2xl z-50">
          {selectedVideo && (
            <div className="flex flex-col h-full text-left">
              <DialogHeader className="p-4 border-b border-white/5 bg-slate-950 flex flex-row items-center justify-between">
                <div className="text-white font-extrabold text-sm sm:text-base line-clamp-1 flex items-center gap-2 pr-6">
                  {selectedVideo.platform === 'youtube' ? (
                    <Youtube className="h-5 w-5 text-red-500 fill-white" />
                  ) : (
                    <Instagram className="h-5 w-5 text-pink-500" />
                  )}
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0 tracking-wider ${
                    selectedVideo.lang === 'RU' 
                      ? 'bg-blue-500/25 text-blue-300 border border-blue-500/30' 
                      : selectedVideo.lang === 'UZ' 
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {selectedVideo.lang}
                  </span>
                  <span>{t(`videos.${selectedVideo.id}.title`, { ns: 'translation' })}</span>
                </div>
              </DialogHeader>

              {/* Video Player view container */}
              <div className="relative aspect-[9/16] bg-black shadow-inner">
                {selectedVideo.platform === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                    title={t(`videos.${selectedVideo.id}.title`, { ns: 'translation' })}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-none shadow-2xl"
                  />
                ) : (
                  <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center space-y-5">
                    <img 
                      src={selectedVideo.thumbnail}
                      alt={t(`videos.${selectedVideo.id}.title`, { ns: 'translation' })}
                      className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-md"
                    />
                    <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center text-white shadow-2xl scale-110">
                      <Instagram className="h-10 w-10 text-white" />
                    </div>
                    <div className="relative z-10 space-y-2">
                      <h4 className="text-white font-extrabold text-lg px-4 leading-snug">
                        {t(`videos.${selectedVideo.id}.title`, { ns: 'translation' })}
                      </h4>
                      <p className="text-slate-400 text-xs px-6 font-light leading-relaxed">
                        {t('videos.sectionSubtitle', { ns: 'translation', defaultValue: 'Instagram does not allow direct embedding, click below to open in your app/browser.' })}
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        window.open(selectedVideo.url, '_blank');
                        setSelectedVideo(null);
                      }}
                      className="relative z-10 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-full font-bold px-8 py-3 shadow-lg flex items-center gap-2 transition-transform duration-300 hover:scale-105"
                    >
                      <ExternalLink className="h-4.5 w-4.5" />
                      {t('videos.openInInstagram', { ns: 'translation', defaultValue: 'Watch on Instagram' })}
                    </Button>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="p-4 border-t border-white/5 flex justify-between items-center gap-3 bg-slate-900/60 backdrop-blur-md">
                <div className="text-xs text-slate-200 font-semibold">
                  <span className="block text-white font-bold">{selectedVideo.likes} Likes</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{selectedVideo.views} Views</span>
                </div>
                {selectedVideo.platform === 'youtube' && (
                  <Button
                    onClick={() => {
                      window.open(selectedVideo.url, '_blank');
                      setSelectedVideo(null);
                    }}
                    variant="outline"
                    className="border-white/10 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 text-xs font-semibold py-2 px-5 h-9 rounded-full flex items-center gap-2 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t('videos.openInYoutube', { ns: 'translation', defaultValue: 'Watch on YouTube' })}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </Layout>
  );
}