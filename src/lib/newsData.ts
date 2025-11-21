import { NewsItem } from '@/types';

export const getNewsItems = (t: (key: string) => string): NewsItem[] => [
  {
    id: '1',
    title: t('pilotProgramTitle'),
    summary: t('pilotProgramDesc'),
    content: t('pilotProgramDesc'),
    image: '🎉',
    author: t('zaminatTeam'),
    publishedAt: new Date('2024-09-18'),
    category: t('update'),
    readTime: 3
  },
  {
    id: '2',
    title: t('futureRecyclingTitle'),
    summary: t('futureRecyclingDesc'),
    content: t('futureRecyclingDesc'),
    image: '🏫',
    author: t('sukhrobjonRikhsiboev'),
    publishedAt: new Date('2024-09-16'),
    category: t('successStory'),
    readTime: 5
  },
  {
    id: '3',
    title: t('educationalProgramsTitle'),
    summary: t('educationalProgramsDesc'),
    content: t('educationalProgramsDesc'),
    image: '🎤',
    author: t('educationTeam'),
    publishedAt: new Date('2024-09-14'),
    category: t('education'),
    readTime: 7
  }
];