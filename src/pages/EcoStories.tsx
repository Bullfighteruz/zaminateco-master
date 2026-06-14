import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, MapPin, Heart, MessageCircle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { useTranslation } from 'react-i18next';
import { getIconForProductOrCategory } from '../lib/iconMatcher';
import '../styles/mobile-responsive.css';

// Sample story data with translation keys
// IMPORTANT: iconPath is set explicitly to ensure icons remain consistent across languages
const stories = [
  {
    id: 1,
    emoji: '🎉',
    image: '/images/community_16119903.webp',
    iconPath: '/images/community_16119903.webp', // Explicit icon path - same for all languages
    badgeType: 'update',
    titleKey: 'stories.pilotProgram.title',
    descriptionKey: 'stories.pilotProgram.description',
    authorKey: 'stories.pilotProgram.author',
    dateKey: 'stories.pilotProgram.date',
    readTimeKey: 'stories.pilotProgram.readTime',
    // English title for icon matching (fallback)
    englishTitle: 'ZAMINAT.eco Launches Pilot Program in Tashkent'
  },
  {
    id: 2,
    emoji: '🏫',
    image: '/images/school.webp',
    iconPath: '/images/Future of Plastic.webp', // Explicit icon path - same for all languages
    badgeType: 'successStory',
    titleKey: 'stories.futureRecycling.title',
    descriptionKey: 'stories.futureRecycling.description',
    authorKey: 'stories.futureRecycling.author',
    dateKey: 'stories.futureRecycling.date',
    readTimeKey: 'stories.futureRecycling.readTime',
    // English title for icon matching (fallback)
    englishTitle: 'The Future of Plastic and Rubber Recycling in Uzbekistan'
  },
  {
    id: 3,
    emoji: '🎤',
    image: '/images/community_16119903.webp',
    iconPath: '/images/Malika.webp', // Explicit icon path - same for all languages
    badgeType: 'education',
    titleKey: 'stories.educationalPrograms.title',
    descriptionKey: 'stories.educationalPrograms.description',
    authorKey: 'stories.educationalPrograms.author',
    dateKey: 'stories.educationalPrograms.date',
    readTimeKey: 'stories.educationalPrograms.readTime',
    // English title for icon matching (fallback)
    englishTitle: 'Educational Programs: Teaching the Next Generation'
  }
];

// Community stories data
// IMPORTANT: avatarImage is set explicitly to ensure avatars remain consistent across languages
const communityStories = [
  {
    id: 1,
    avatar: '👨‍🎓',
    avatarImage: '/images/Bobur.webp', // Explicit avatar path - same for all languages
    nameKey: 'stories.mahallTransformation.author',
    englishName: 'Bobur Rahimov', // English name for matching (fallback)
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
    avatarImage: '/images/Malika.webp', // Explicit avatar path - same for all languages
    nameKey: 'stories.teachingKids.author',
    englishName: 'Malika Tursunova', // English name for matching (fallback)
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

export default function EcoStories() {
  const { t } = useTranslation(['stories', 'translation']);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Get stories with icons - use explicit iconPath to ensure consistency across languages
  const storiesWithIcons = useMemo(() => {
    return stories.map(story => {
      // Use explicit iconPath if set, otherwise try matching with English title
      let iconPath = story.iconPath;
      
      // If no explicit iconPath, try matching with English title (language-independent)
      if (!iconPath || !iconPath.startsWith('/images/')) {
        const englishTitle = story.englishTitle || '';
        iconPath = getIconForProductOrCategory(englishTitle, story.image);
      }
      
      // Final fallback to story.image
      if (!iconPath || !iconPath.startsWith('/images/')) {
        iconPath = story.image;
      }
      
      return {
        ...story,
        iconPath
      };
    });
  }, []); // Remove 't' dependency - icons should not change with language
  
  // Get community stories with avatars - use explicit avatarImage to ensure consistency across languages
  const communityStoriesWithIcons = useMemo(() => {
    return communityStories.map(story => {
      // Use explicit avatarImage if set, otherwise try matching with English name
      let avatarImage = story.avatarImage;
      
      // If no explicit avatarImage, try matching with English name (language-independent)
      if (!avatarImage || !avatarImage.startsWith('/images/')) {
        const englishName = story.englishName || '';
        avatarImage = getIconForProductOrCategory(englishName, story.avatar);
      }
      
      // Final fallback to emoji
      if (!avatarImage || !avatarImage.startsWith('/images/')) {
        avatarImage = story.avatar;
      }
      
      return {
        ...story,
        avatarImage
      };
    });
  }, []); // Remove 't' dependency - avatars should not change with language

  const filters = [
    { key: 'all', labelKey: 'filters.allContent' },
    { key: 'community', labelKey: 'filters.communityStories' },
    { key: 'education', labelKey: 'filters.education' },
    { key: 'news', labelKey: 'filters.newsUpdates' }
  ];

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'successStory':
        return 'bg-green-100 text-green-800';
      case 'education':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to safely get array from translation
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
      <div className="p-2 sm:p-4 space-y-3 sm:space-y-6 space-y-mobile">
        {/* Header */}
        <div className="text-center space-y-1 sm:space-y-2">
          <h2 className="text-lg sm:text-2xl font-bold section-title-mobile">
            {t('title', { ns: 'stories' })}
          </h2>
          <p className="text-gray-600 text-center text-sm sm:text-base">
            {t('subtitle', { ns: 'stories' })}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "default" : "outline"}
              className={`whitespace-nowrap text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 h-7 sm:h-9 ${
                activeFilter === filter.key 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : ''
              }`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {t(filter.labelKey, { ns: 'stories' })}
            </Button>
          ))}
        </div>

        {/* Featured Content */}
        <section>
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center section-title-mobile">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600 icon-md-mobile" />
            {t('sections.featuredContent', { ns: 'stories' })}
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {storiesWithIcons.map((story) => (
              <Card key={story.id} className="eco-card-hover card-mobile">
                <CardContent className="p-3 sm:p-4 card-content-mobile">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <img 
                      src={story.iconPath || story.image || story.emoji} 
                      alt={story.title || 'Story image'} 
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain" 
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to original image or emoji if iconPath fails
                        const target = e.target as HTMLImageElement;
                        if (story.image && target.src !== story.image) {
                          target.src = story.image;
                        } else if (story.emoji && !target.src.includes('/images/')) {
                          // If image fails, show emoji as text (would need a different approach)
                          target.style.display = 'none';
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                        <Badge className={`text-xs ${getBadgeStyle(story.badgeType)}`}>
                          {t(`badges.${story.badgeType}`, { ns: 'stories' })}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {t(story.readTimeKey, { ns: 'stories' })} {t('readTime.minRead', { ns: 'stories' })}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2">
                        {t(story.titleKey, { ns: 'stories' })}
                      </h3>
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                        {t(story.descriptionKey, { ns: 'stories' })}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-2 w-2 sm:h-3 sm:w-3 icon-xs-mobile" />
                          <span>{t(story.dateKey, { ns: 'stories' })}</span>
                          <span>{t('common.by', { ns: 'stories' })} {t(story.authorKey, { ns: 'stories' })}</span>
                        </div>
                        <Button variant="outline" className="text-xs py-1 px-2 h-6 sm:h-8">
                          {t('buttons.readMore', { ns: 'stories' })}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Community Stories */}
            {communityStoriesWithIcons.map((story) => (
              <Card key={`community-${story.id}`} className="eco-card-hover card-mobile">
                <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4 card-content-mobile">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      {story.avatarImage && story.avatarImage.startsWith('/images/') ? (
                        <img 
                          src={story.avatarImage} 
                          alt={t(story.nameKey, { ns: 'stories' })} 
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            // Fallback to emoji if image fails
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.avatar-emoji-fallback')) {
                              const emojiSpan = document.createElement('span');
                              emojiSpan.className = 'avatar-emoji-fallback bg-green-100 text-green-700 text-sm sm:text-base flex items-center justify-center w-full h-full rounded-full';
                              emojiSpan.textContent = story.avatar;
                              parent.appendChild(emojiSpan);
                            }
                          }}
                        />
                      ) : (
                      <AvatarFallback className="bg-green-100 text-green-700 text-sm sm:text-base">
                        {story.avatar}
                      </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                        <h4 className="font-semibold text-xs sm:text-sm">
                          {t(story.nameKey, { ns: 'stories' })}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {t('badges.level', { ns: 'stories' })} {story.level}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {t('badges.communityStory', { ns: 'stories' })}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 space-x-1 sm:space-x-2">
                        <Calendar className="h-2 w-2 sm:h-3 sm:w-3 icon-xs-mobile" />
                        <span>{t(story.dateKey, { ns: 'stories' })}</span>
                        <MapPin className="h-2 w-2 sm:h-3 sm:w-3 icon-xs-mobile" />
                        <span>{t(story.locationKey, { ns: 'stories' })}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2">
                      {t(story.titleKey, { ns: 'stories' })}
                    </h3>
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                      {t(story.descriptionKey, { ns: 'stories' })}
                    </p>
                    
                    {story.environmentalImpactKey && (
                      <div className="bg-green-50 p-2 rounded-lg mb-2 sm:mb-3">
                        <p className="text-xs sm:text-sm text-green-700">
                          <strong>{t(story.environmentalImpactKey, { ns: 'stories' })}</strong> {t(story.impactDescriptionKey, { ns: 'stories' })}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                        <button className="flex items-center space-x-1 hover:text-red-500">
                          <Heart className="h-3 w-3 sm:h-4 sm:w-4 icon-sm-mobile" />
                          <span>{t(story.likesKey, { ns: 'stories' })}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-500">
                          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 icon-sm-mobile" />
                          <span>{t(story.commentsKey, { ns: 'stories' })}</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {story.hashtags.map((hashtag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
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

        {/* Educational Resources */}
        <Card className="bg-emerald-50 card-mobile">
          <CardHeader className="card-header-mobile">
            <CardTitle className="text-emerald-800 text-lg sm:text-2xl section-title-mobile">
              {t('educationalResources.title', { ns: 'stories' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-emerald-700 card-content-mobile">
            <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                  {t('educationalResources.plasticGuide.title', { ns: 'stories' })}
                </h4>
                <ul className="space-y-1 text-xs">
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
              <div>
                <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                  {t('educationalResources.rubberGuide.title', { ns: 'stories' })}
                </h4>
                <ul className="space-y-1 text-xs">
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
        <Card className="bg-teal-50 card-mobile">
          <CardHeader className="card-header-mobile">
            <CardTitle className="text-teal-800 text-lg sm:text-2xl section-title-mobile">
              {t('shareStory.title', { ns: 'stories' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-teal-700 card-content-mobile">
            <p>{t('shareStory.description', { ns: 'stories' })}</p>
            <ul className="space-y-1">
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
            <div className="pt-1 sm:pt-2">
              <Button className="bg-teal-600 hover:bg-teal-700 text-xs sm:text-sm py-2 px-3 h-7 sm:h-10 bottom-button-mobile">
                {t('buttons.shareYourStory', { ns: 'stories' })}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Join the Conversation */}
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 card-mobile">
          <CardContent className="p-4 sm:p-6 text-center card-content-mobile">
            <h3 className="text-lg sm:text-xl font-bold mb-2 bottom-title-mobile">
              {t('joinConversation.title', { ns: 'stories' })}
            </h3>
            <p className="text-gray-600 mb-3 sm:mb-4 text-center text-sm sm:text-base bottom-description-mobile">
              {t('joinConversation.description', { ns: 'stories' })}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6 bottom-button-mobile">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 icon-sm-mobile" />
                {t('buttons.readMoreStories', { ns: 'stories' })}
              </Button>
              <Link to="/about">
                <Button variant="outline" className="text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6 bottom-button-mobile">
                  {t('buttons.learnAboutZaminat', { ns: 'stories' })}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}