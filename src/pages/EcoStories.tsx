import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, MapPin, Heart, MessageCircle, BookOpen, Play, Youtube, Instagram, ExternalLink, Eye, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { useTranslation } from 'react-i18next';
import { getIconForProductOrCategory } from '../lib/iconMatcher';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../components/ui/dialog';
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
    thumbnail: '/images/EPDM Tiles.webp',
    duration: '0:45',
    category: 'education',
    likes: '1.2K',
    views: '12.5K',
    viewsKey: 'views'
  },
  {
    id: '92y0oClestY',
    platform: 'youtube',
    url: 'https://www.youtube.com/shorts/92y0oClestY',
    thumbnail: '/images/eco-bench-page/eco-bench-environment.webp',
    duration: '0:58',
    category: 'news',
    likes: '948',
    views: '8.2K',
    viewsKey: 'views'
  },
  {
    id: 'DY6X1D7trG2',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/DY6X1D7trG2/',
    thumbnail: '/images/gaming.webp',
    duration: '0:30',
    category: 'community',
    likes: '2.5K',
    views: '15.4K',
    viewsKey: 'plays'
  },
  {
    id: 'DY63syINDkM',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/DY63syINDkM/',
    thumbnail: '/images/school.webp',
    duration: '0:42',
    category: 'education',
    likes: '1.8K',
    views: '9.8K',
    viewsKey: 'plays'
  },
  {
    id: 'DVV0CsWDW1-',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/DVV0CsWDW1-/',
    thumbnail: '/images/River Cleanup.webp',
    duration: '0:55',
    category: 'community',
    likes: '3.1K',
    views: '18.2K',
    viewsKey: 'plays'
  },
  {
    id: 'DS671KvDYbe',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/DS671KvDYbe/',
    thumbnail: '/images/park.webp',
    duration: '0:38',
    category: 'community',
    likes: '1.4K',
    views: '11.1K',
    viewsKey: 'plays'
  },
  {
    id: 'DS0KcTHDSER',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/DS0KcTHDSER/',
    thumbnail: '/images/EPDM-free Tiles.webp',
    duration: '0:25',
    category: 'news',
    likes: '4.2K',
    views: '24.5K',
    viewsKey: 'plays'
  },
  {
    id: 'DSeoprIDW50',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/DSeoprIDW50/',
    thumbnail: '/images/community-garden-benches.webp',
    duration: '1:00',
    category: 'community',
    likes: '2.1K',
    views: '14.2K',
    viewsKey: 'plays'
  },
  {
    id: 'DSIDS24gsBI',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/DSIDS24gsBI/',
    thumbnail: '/images/green-city_5994274.webp',
    duration: '0:47',
    category: 'education',
    likes: '1.6K',
    views: '13.6K',
    viewsKey: 'plays'
  }
];

export default function EcoStories() {
  const { t } = useTranslation(['stories', 'translation']);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<typeof videos[0] | null>(null);
  
  // Get stories with icons
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
  
  // Get community stories with avatars
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
    return []; // No community updates in featured articles
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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'successStory':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'education':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="p-2 sm:p-4 space-y-4 sm:space-y-8 max-w-7xl mx-auto">
        
        {/* Elegant Minimal Header */}
        <div className="text-center space-y-2 py-4">
          <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            {t('ecoHub', { ns: 'translation' })}
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-none">
            {t('title', { ns: 'stories' })}
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            {t('subtitle', { ns: 'stories' })}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-slate-100 justify-start sm:justify-center scrollbar-none">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "default" : "outline"}
              className={`whitespace-nowrap text-xs sm:text-sm py-1.5 px-4 h-9 rounded-full transition-all duration-300 font-medium ${
                activeFilter === filter.key 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20' 
                  : 'text-slate-600 hover:text-emerald-600 border-slate-200 hover:border-emerald-600/40 bg-white'
              }`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {t(filter.labelKey, { ns: 'stories' })}
            </Button>
          ))}
        </div>

        {/* Video Hub Section (Vertical Reels & Shorts Grid) */}
        {filteredVideos.length > 0 && (
          <section className="space-y-4 py-2">
            <div className="flex items-center justify-between border-l-4 border-emerald-500 pl-3">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-slate-800 flex items-center">
                  <Film className="h-5 w-5 mr-2 text-emerald-600" />
                  {t('videos.sectionTitle', { ns: 'translation', defaultValue: 'Eco Video Hub' })}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
                  {t('videos.sectionSubtitle', { ns: 'translation', defaultValue: 'Watch our latest updates and community initiatives in vertical format' })}
                </p>
              </div>
            </div>

            {/* Portraits 9:16 Video Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
              {filteredVideos.map((video) => (
                <motion.div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  whileHover={{ y: -6 }}
                  className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer select-none bg-slate-950 border border-slate-200/10 shadow-lg"
                >
                  {/* Thumbnail Cover Image */}
                  <img
                    src={video.thumbnail}
                    alt={t(`videos.${video.id}.title`, { ns: 'translation' })}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-90"
                    loading="lazy"
                  />

                  {/* Dark Gradient Overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Platform Branding Badges (Top Left) */}
                  <div className="absolute top-2 left-2 z-10">
                    {video.platform === 'youtube' ? (
                      <Badge className="bg-red-600 text-white border-none py-0.5 px-1.5 flex items-center gap-1 text-[10px] font-semibold rounded-md">
                        <Youtube className="h-3.5 w-3.5 fill-white text-red-600" />
                        Shorts
                      </Badge>
                    ) : (
                      <Badge className="bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 text-white border-none py-0.5 px-1.5 flex items-center gap-1 text-[10px] font-semibold rounded-md">
                        <Instagram className="h-3.5 w-3.5 text-white" />
                        Reels
                      </Badge>
                    )}
                  </div>

                  {/* Duration Badge (Top Right) */}
                  <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-mono">
                    {video.duration}
                  </div>

                  {/* Play Button Glow Overlay on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md border border-white/45 flex items-center justify-center text-white shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110">
                      <Play className="h-5 w-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Details Overlay (Bottom) */}
                  <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col justify-end space-y-1">
                    <h3 className="text-white font-semibold text-xs sm:text-sm leading-snug line-clamp-2 text-left drop-shadow-lg group-hover:text-emerald-300 transition-colors">
                      {t(`videos.${video.id}.title`, { ns: 'translation' })}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-3 w-3" />
                        {video.views} {t(`videos.${video.viewsKey}`, { ns: 'translation' })}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                        {video.likes}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Content & Community Articles */}
        {(filteredFeaturedStories.length > 0 || filteredCommunityStories.length > 0) && (
          <section className="space-y-4">
            <div className="flex items-center border-l-4 border-emerald-500 pl-3">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-800 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                {t('sections.featuredContent', { ns: 'stories' })}
              </h2>
            </div>
            
            <div className="space-y-4">
              {filteredFeaturedStories.map((story) => (
                <Card key={story.id} className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-6">
                      <div className="w-full md:w-48 flex-shrink-0 flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden p-4">
                        <img 
                          src={story.iconPath || story.image || story.emoji} 
                          alt={t(story.titleKey, { ns: 'stories' })} 
                          className="w-16 h-16 md:w-20 md:h-20 object-contain hover:scale-105 transition-transform duration-300" 
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs px-2.5 py-0.5 rounded-full border ${getBadgeStyle(story.badgeType)}`}>
                              {t(`badges.${story.badgeType}`, { ns: 'stories' })}
                            </Badge>
                            <span className="text-xs text-slate-400 font-medium">
                              {t(story.readTimeKey, { ns: 'stories' })} {t('readTime.minRead', { ns: 'stories' })}
                            </span>
                          </div>
                          <h3 className="font-bold text-base sm:text-xl text-slate-800">
                            {t(story.titleKey, { ns: 'stories' })}
                          </h3>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                            {t(story.descriptionKey, { ns: 'stories' })}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-50 mt-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3.5 w-3.5 text-slate-300" />
                            <span>{t(story.dateKey, { ns: 'stories' })}</span>
                            <span className="text-slate-200">|</span>
                            <span>{t('common.by', { ns: 'stories' })} {t(story.authorKey, { ns: 'stories' })}</span>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs rounded-full border-slate-200 hover:text-emerald-600 hover:border-emerald-600/40">
                            {t('buttons.readMore', { ns: 'stories' })}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredCommunityStories.map((story) => (
                <Card key={`community-${story.id}`} className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border border-emerald-500/20 shadow-sm">
                          {story.avatarImage ? (
                            <img 
                              src={story.avatarImage} 
                              alt={t(story.nameKey, { ns: 'stories' })} 
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <AvatarFallback className="bg-emerald-50 text-emerald-700">
                              {story.avatar}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-semibold text-slate-800 text-sm">
                              {t(story.nameKey, { ns: 'stories' })}
                            </h4>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md bg-emerald-50/50 border-emerald-500/10 text-emerald-700">
                              {t('badges.level', { ns: 'stories' })} {story.level}
                            </Badge>
                            <Badge className="bg-blue-500/10 text-blue-700 border border-blue-500/10 text-[10px] px-1.5 py-0 rounded-md">
                              {t('badges.communityStory', { ns: 'stories' })}
                            </Badge>
                          </div>
                          <div className="flex items-center text-[11px] text-slate-400 space-x-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {t(story.dateKey, { ns: 'stories' })}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {t(story.locationKey, { ns: 'stories' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-bold text-base sm:text-lg text-slate-800">
                        {t(story.titleKey, { ns: 'stories' })}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                        {t(story.descriptionKey, { ns: 'stories' })}
                      </p>
                      
                      {story.environmentalImpactKey && (
                        <div className="bg-emerald-50/50 border-l-4 border-emerald-500 p-3 rounded-r-xl">
                          <p className="text-xs sm:text-sm text-emerald-800">
                            <strong>{t(story.environmentalImpactKey, { ns: 'stories' })}</strong> {t(story.impactDescriptionKey, { ns: 'stories' })}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-4 flex-wrap gap-2">
                        <div className="flex items-center space-x-4 text-xs sm:text-sm text-slate-400 font-medium">
                          <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                            <Heart className="h-4 w-4 text-slate-300 hover:text-red-500" />
                            <span>{t(story.likesKey, { ns: 'stories' })}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-emerald-600 transition-colors">
                            <MessageCircle className="h-4 w-4 text-slate-300 hover:text-emerald-600" />
                            <span>{t(story.commentsKey, { ns: 'stories' })}</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {story.hashtags.map((hashtag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full border border-slate-100">
                              {hashtag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Educational Resources & Sharing Guidelines Grid */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Educational Resources */}
          <Card className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-lg sm:text-xl flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                {t('educationalResources.title', { ns: 'stories' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm text-emerald-700">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-xl p-3 border border-emerald-500/5">
                  <h4 className="font-semibold mb-1 text-emerald-800 text-xs sm:text-sm">
                    {t('educationalResources.plasticGuide.title', { ns: 'stories' })}
                  </h4>
                  <ul className="space-y-1 text-[11px] sm:text-xs">
                    {getTranslationArray('educationalResources.plasticGuide.items', [
                      'Types of recyclable plastics',
                      'Proper cleaning and sorting',
                      'Collection point locations',
                      'Environmental impact facts'
                    ]).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/50 rounded-xl p-3 border border-emerald-500/5">
                  <h4 className="font-semibold mb-1 text-emerald-800 text-xs sm:text-sm">
                    {t('educationalResources.rubberGuide.title', { ns: 'stories' })}
                  </h4>
                  <ul className="space-y-1 text-[11px] sm:text-xs">
                    {getTranslationArray('educationalResources.rubberGuide.items', [
                      'Tire recycling process',
                      'Rubber product identification',
                      'Safety guidelines',
                      'Community benefits'
                    ]).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Your Story */}
          <Card className="bg-teal-50/50 border border-teal-100/50 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-teal-800 text-lg sm:text-xl flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                {t('shareStory.title', { ns: 'stories' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-teal-700">
              <p className="leading-relaxed text-[11px] sm:text-xs">
                {t('shareStory.description', { ns: 'stories' })}
              </p>
              <div className="bg-white/50 rounded-xl p-3 border border-teal-500/5">
                <ul className="space-y-1 text-[11px] sm:text-xs">
                  {getTranslationArray('shareStory.guidelines', [
                    'Document your waste collection activities',
                    'Share before/after photos of cleanup projects',
                    'Write about community transformation stories',
                    'Include environmental impact data when possible',
                    'Use relevant hashtags: #ZaminatEco #PlasticRecycling #RubberRecycling'
                  ]).map((guideline: string, index: number) => (
                    <li key={index}>• {guideline}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-1">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xs font-semibold py-1.5 px-4 h-8 transition-colors">
                  {t('buttons.shareYourStory', { ns: 'stories' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Join the Conversation CTA */}
        <Card className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-slate-100 rounded-2xl overflow-hidden relative">
          <CardContent className="p-6 sm:p-8 text-center space-y-4">
            <h3 className="text-lg sm:text-2xl font-bold text-slate-800">
              {t('joinConversation.title', { ns: 'stories' })}
            </h3>
            <p className="text-slate-500 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
              {t('joinConversation.description', { ns: 'stories' })}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs sm:text-sm font-semibold h-9 sm:h-10 px-6 shadow-md shadow-emerald-600/15">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('buttons.readMoreStories', { ns: 'stories' })}
              </Button>
              <Link to="/about">
                <Button variant="outline" className="rounded-full text-xs sm:text-sm font-semibold h-9 sm:h-10 px-6 border-slate-200 hover:text-emerald-600 bg-white">
                  {t('buttons.learnAboutZaminat', { ns: 'stories' })}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Modal Player (Responsive Glassmorphic Portrait Dialog) */}
      <Dialog open={selectedVideo !== null} onOpenChange={(open) => { if (!open) setSelectedVideo(null); }}>
        <DialogContent className="max-w-[400px] w-[95%] p-0 overflow-hidden border border-white/20 bg-slate-950/90 backdrop-blur-xl rounded-2xl shadow-2xl z-50">
          {selectedVideo && (
            <div className="flex flex-col h-full text-left">
              <DialogHeader className="p-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-white font-bold text-base line-clamp-1 flex items-center gap-2">
                    {selectedVideo.platform === 'youtube' ? (
                      <Youtube className="h-5 w-5 text-red-500 fill-white" />
                    ) : (
                      <Instagram className="h-5 w-5 text-pink-500" />
                    )}
                    {t(`videos.${selectedVideo.id}.title`, { ns: 'translation' })}
                  </DialogTitle>
                </div>
              </DialogHeader>

              {/* Video Content */}
              <div className="relative aspect-[9/16] bg-black">
                {selectedVideo.platform === 'youtube' ? (
                  // Embed Portrait YouTube IFrame
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                    title={t(`videos.${selectedVideo.id}.title`, { ns: 'translation' })}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-none"
                  />
                ) : (
                  // Instagram Reels Fallback UI (since IG reels block direct iframe loading)
                  <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <img 
                      src={selectedVideo.thumbnail}
                      alt={t(`videos.${selectedVideo.id}.title`, { ns: 'translation' })}
                      className="absolute inset-0 w-full h-full object-cover opacity-30 filter blur-sm"
                    />
                    <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center text-white shadow-2xl">
                      <Instagram className="h-10 w-10 text-white" />
                    </div>
                    <div className="relative z-10 space-y-2">
                      <h4 className="text-white font-bold text-lg px-4 leading-snug">
                        {t(`videos.${selectedVideo.id}.title`, { ns: 'translation' })}
                      </h4>
                      <p className="text-slate-400 text-xs px-6">
                        {t('videos.sectionSubtitle', { ns: 'translation', defaultValue: 'Instagram does not allow direct embedding, click below to open in your app/browser.' })}
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        window.open(selectedVideo.url, '_blank');
                        setSelectedVideo(null);
                      }}
                      className="relative z-10 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-full font-bold px-6 py-2 shadow-lg flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t('videos.openInInstagram', { ns: 'translation', defaultValue: 'Watch on Instagram' })}
                    </Button>
                  </div>
                )}
              </div>

              {/* Modal Actions (Bottom) */}
              <div className="p-4 border-t border-slate-800 flex justify-between items-center gap-3 bg-slate-900/50">
                <div className="text-xs text-slate-400 font-medium">
                  <span className="block">{selectedVideo.likes} Likes</span>
                  <span className="block">{selectedVideo.views} Views</span>
                </div>
                {selectedVideo.platform === 'youtube' && (
                  <Button
                    onClick={() => {
                      window.open(selectedVideo.url, '_blank');
                      setSelectedVideo(null);
                    }}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs py-1.5 px-4 h-8 rounded-full flex items-center gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
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