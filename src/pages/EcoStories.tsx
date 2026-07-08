import React, { useState, useMemo, useRef, useCallback } from 'react';
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
  Share2,
  MoreHorizontal,
  Bookmark,
  Send,
  Smile
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { useSEO } from '../hooks/useSEO';
import { useEcoSocial, timeAgo } from '../hooks/useEcoSocial';
import { useToast } from '../hooks/use-toast';
import '../styles/mobile-responsive.css';

// Sample story data with translation keys
const stories = [
  {
    id: 1,
    emoji: '🎉',
    image: '/images/zaminat-pilot-program.png',
    iconPath: '/images/zaminat-pilot-program.png',
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
    image: '/images/recycling-future.png',
    iconPath: '/images/recycling-future.png',
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
    image: '/images/eco-education-classroom.png',
    iconPath: '/images/eco-education-classroom.png',
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
    images: ['/images/landfill-cleanup.png', '/images/playground-recycled.png', '/images/community-celebration.png'],
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
    images: ['/images/kids-eco-education.png', '/images/kids-planting-trees.png', '/images/eco-workshop-kids.png'],
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
  const { t, i18n } = useTranslation(['stories', 'translation']);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<typeof videos[0] | null>(null);
  const [selectedStory, setSelectedStory] = useState<{ type: 'featured' | 'community'; data: any } | null>(null);
  const [activeImageIndices, setActiveImageIndices] = useState<Record<number, number>>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [doubleTapHeart, setDoubleTapHeart] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [dialogCommentInput, setDialogCommentInput] = useState('');
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);
  const lastTapTime = useRef<Record<string, number>>({});
  const dialogInputRef = useRef<HTMLInputElement>(null);
  const cardInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Common emoji set
  const emojiList = ['😊', '❤️', '🔥', '👏', '💪', '🌱', '♻️', '🎉', '👍', '😍', '🙏', '💚', '🌍', '✨', '😂', '🤩', '💯', '🙌', '🌿', '💕'];

  // Centralized social state
  const social = useEcoSocial();
  const { toast } = useToast();

  // Insert emoji into the correct input
  const handleEmojiInsert = useCallback((emoji: string, targetKey: string) => {
    if (targetKey === 'dialog') {
      setDialogCommentInput(prev => prev + emoji);
      dialogInputRef.current?.focus();
    } else {
      setCommentInputs(prev => ({ ...prev, [targetKey]: (prev[targetKey] || '') + emoji }));
      cardInputRefs.current[targetKey]?.focus();
    }
    setEmojiPickerFor(null);
  }, []);

  // Reply to comment — prefill @username and focus the input
  const handleReply = useCallback((authorName: string, targetKey: string) => {
    const mention = `@${authorName.toLowerCase().replace(/\s+/g, '_')} `;
    if (targetKey === 'dialog') {
      setDialogCommentInput(prev => mention + prev);
      setTimeout(() => dialogInputRef.current?.focus(), 50);
    } else {
      setCommentInputs(prev => ({ ...prev, [targetKey]: mention + (prev[targetKey] || '') }));
      setTimeout(() => cardInputRefs.current[targetKey]?.focus(), 50);
    }
  }, []);

  // Double-tap to like handler
  const handleDoubleTap = useCallback((storyKey: string) => {
    const now = Date.now();
    const lastTap = lastTapTime.current[storyKey] || 0;
    if (now - lastTap < 350) {
      // Double tap detected
      social.setLiked(storyKey);
      setDoubleTapHeart(prev => ({ ...prev, [storyKey]: true }));
      setTimeout(() => {
        setDoubleTapHeart(prev => ({ ...prev, [storyKey]: false }));
      }, 1000);
      lastTapTime.current[storyKey] = 0;
    } else {
      lastTapTime.current[storyKey] = now;
    }
  }, [social]);

  // Share handler with toast
  const handleShareAction = useCallback((storyId: number | string) => {
    navigator.clipboard.writeText(window.location.origin + `/stories?id=${storyId}`);
    toast({
      description: '✓ ' + t('common.linkCopied', { ns: 'stories', defaultValue: 'Link copied to clipboard' }),
    });
  }, [toast, t]);

  // Bookmark handler with toast
  const handleBookmarkAction = useCallback((storyKey: string) => {
    const newVal = social.toggleBookmark(storyKey);
    toast({
      description: newVal
        ? '🔖 ' + t('common.postSaved', { ns: 'stories', defaultValue: 'Post saved' })
        : t('common.postUnsaved', { ns: 'stories', defaultValue: 'Removed from saved' }),
    });
  }, [social, toast, t]);

  // Submit comment
  const handleSubmitComment = useCallback((storyKey: string, inputKey?: string) => {
    const text = inputKey ? (commentInputs[inputKey] || '').trim() : dialogCommentInput.trim();
    if (!text) return;
    social.addComment(storyKey, text);
    if (inputKey) {
      setCommentInputs(prev => ({ ...prev, [inputKey]: '' }));
    } else {
      setDialogCommentInput('');
    }
  }, [social, commentInputs, dialogCommentInput]);

  const currentLang = i18n.language || 'en';
  
  const fullArticles = useMemo<Record<string, { title: string; subtitle: string; content: string[]; location?: string; impact?: string }>>(() => {
    if (currentLang.startsWith('uz')) {
      return {
        'featured-1': {
          title: "ZAMINAT.eco Toshkent maktablarida pilot dasturini boshladi",
          subtitle: "Ekologik harakat yoshlar uchun yashil kelajakni yaratib, plastik va rezina qayta ishlash tashabbuslari bilan o'z yo'lini boshlamoqda.",
          content: [
            "Biz Toshkent maktablarida ZAMINAT.eco maktab qayta ishlash pilot dasturining rasmiy ishga tushirilishini e'lon qilishdan faxrlanamiz. Ushbu tashabbus O'zbekistonda chiqindilarni boshqarishni yangi avloddan boshlab o'zgartirish bo'yicha missiyamizdagi muhim bosqichdir.",
            "Mahalliy ta'lim organlari bilan hamkorlikda ZAMINAT.eco Toshkentning beshta yetakchi maktabida, jumladan, Chilonzor tumanidagi 45-maktabda maxsus rangli saralash qutilarini o'rnatdi. Ko'k rangli qutilar plastik ('PLASTIK'), sariq rangli qutilar esa rezina ('REZINA') uchun mo'ljallangan.",
            "O'quvchilar plastik butilkalar va eski shinalarni saralashda faol ishtirok etmoqdalar. Chiqindilarni shunchaki yig'ish o'rniga, bolalar saralash algoritmlari va aylanma iqtisodiyot tamoyillarini o'rganmoqdalar. Yig'ilgan materiallar zavodimizga yetkazilib, u yerda maydalanadi, eritiladi va maktab hovlilari uchun bardoshli rezina plitkalar hamda o'rindiqlarga aylantiriladi.",
            "Birinchi oyning o'zida o'quvchilar 1250 kg dan ortiq plastik va rezina chiqindilarini poligonlarga borishini oldini olishdi. Ushbu dastur jamiyatlar birgalikda barqaror muhit yaratishi mumkinligini isbotlamoqda."
          ],
          location: "Tashkent, O'zbekiston",
          impact: "1,250 kg plastik va rezina qayta ishlandi"
        },
        'featured-2': {
          title: "O'zbekistonda plastik va rezina qayta ishlash kelajagi",
          subtitle: "ZAMINAT.eco yuqori texnologiyali qayta ishlash zavodlari va aylanma iqtisodiyot modellari orqali butun mamlakat bo'ylab chiqindilarni boshqarishni qanday o'zgartirishni rejalashtirmoqda.",
          content: [
            "O'zbekistonda shahar markazlari kengayishi bilan qattiq maishiy chiqindilar muammosi tobora dolzarb bo'lib bormoqda. ZAMINAT.eco plastik va rezina chiqindilari uchun maxsus ishlab chiqilgan ilg'or, avtomatlashtirilgan infratuzilmani joriy etish orqali buni hal qilmoqda.",
            "Toshkentning sanoat zonalarida joyhazlangan qayta ishlash majmuamiz eng so'nggi saralash va qayta ishlash liniyalaridan foydalanadi. Bu yerda iste'mol qilingan plastik chiqindilar tozalanadi, donadorlanadi va eski shinalardan olingan maydalangan rezina bilan birlashtiriladi.",
            "Yuqori bosimli qoliplash orqali ushbu kombinatsiya juda bardoshli plitkalar, toshlar va o'rindiqlarga aylantiriladi. Ushbu mahsulotlar ob-havoga chidamli, toksik bo'lmagan va Toshkentning yozgi jaziramasi va qishki sovuqlariga juda mos keladi. Ular bog'lar va maktab o'yin maydonchalarida darhol qo'llaniladi.",
            "Bizning uzoq muddatli rejamiz 2027-yilgacha ushbu modelni O'zbekistonning barcha yirik hududiy markazlariga kengaytirishga qaratilgan. Qayta ishlangan plastik mahsulotlar an'anaviy beton va yog'och bilan bevosita raqobatlasha olishini ko'rsatib, ZAMINAT.eco Markaziy Osiyoda barqaror qurilishni qayta belgilamoqda."
          ],
          location: "Tashkent sanoat zonasi",
          impact: "2027-yilgacha chiqindisiz zavod maqsadi"
        },
        'featured-3': {
          title: "Ta'lim dasturlari: Yangi avlodni o'rgatish",
          subtitle: "Interaktiv o'quv dasturlari va aqlli o'yinlar orqali bolalarga plastik va rezina qayta ishlash muhimligini qanday o'rgatmoqdamiz.",
          content: [
            "Haqiqiy o'zgarishlar ta'limdan boshlanadi. ZAMINAT.eco maktablarda sinf mashg'ulotlarining keng qamrovli seriyasini boshladi.",
            "Tajribali ekologik o'qituvchilar tomonidan olib boriladigan ushbu seminarlar yuqori interaktivdir. Shunchaki ma'ruza o'qish o'rniga, o'qituvchilar bolalarga qayta ishlangan plastik taxtalar, rezina plitkalar va xomashyo namunalarini ko'rsatishadi. Bolalar o'zlarining qayta ishlash harakatlarining jismoniy natijasini ko'rishlari va ushlab ko'rishlari mumkin.",
            "O'quv dasturi ekologik odatlarni o'yinga aylantiruvchi aqlli yo'ldosh — ZAMI Bot tomonidan qo'llab-quvvatlanadi. Ilovada o'zlarining qayta ishlash ko'rsatkichlarini tekshirish orqali o'quvchilar ballar to'plashlari, darajalarini oshirishlari va maktablari uchun sovrinlar yutib olishlari mumkin.",
            "Pedagoglarning fikricha, bolalarga barqarorlik haqida erta o'rgatish ularda umrbod yashil odatlarni shakllantiradi. ZAMINAT.eco ushbu interaktiv dasturni joriy o'quv yili oxirigacha 100 dan ortiq maktabga yetkazishni rejalashtirilgan."
          ],
          location: "Tashkent, O'zbekiston",
          impact: "5000 dan ortiq o'quvchilar o'qitildi"
        },
        'community-1': {
          title: "Chiqindixonadan o'yin maydonchasiga: mahallamiz transformatsiyasi",
          subtitle: "Sergeli tumanidagi mahalliy aholi noqonuniy chiqindixonani qanday tozalagani va qayta ishlangan materiallardan chiroyli o'yin maydonchasi qurgani haqida.",
          content: [
            "Olti oy oldin Sergeli tumanidagi mahallamizda chiqindi bilan bog'liq jiddiy muammo bor edi. Bo'sh yer maydoni plastik, eski shinalar va qurilish chiqindilari bilan to'lib, noqonuniy chiqindixonaga aylanib qolgandi.",
            "O'zgarish qilishga qaror qibly, biz ZAMINAT.eco bilan hamkorlik qildik. Uch hafta oxiri davomida 80 dan ortiq mahalla ko'ngillilari — jumladan oqsoqollar va bolalar — yirik tozalash ishlariga qo'shilishdi. Biz 1250 kg dan ortiq plastik va rezina chiqindilarini yig'dik.",
            "ZAMINAT.eco ushbu chiqindilarni qayta ishlab, ularni rangli rezina xavfsizlik plitkalari va o'rindiqlar ko'rinishida bizga qaytarib berdi. O'yin maydonchasi jihozlari bilan birgalikda biz bolalarimiz uchun chiroyli va xavfsiz joy qurdik.",
            "Bugun o'sha chiqindixona bo'lgan joy bolalar xavfsiz o'ynaydigan jonli maydonchaga aylandi. Bu jamoaviy harakat va qayta ishlash kuchining yorqin isbotidir."
          ],
          location: "Sergeli tumani, Tashkent",
          impact: "1250 kg chiqindi o'yin maydonchasiga aylantirildi"
        },
        'community-2': {
          title: "Bolalarga o'rgatish: Yosh ongni tarbiyalash",
          subtitle: "Sinfxona seminarlari va ochiq havodagi mashg'ulotlar orqali yosh bolalarga plastik va rezina qayta ishlash qiymatini tushuntirish.",
          content: [
            "Yangi avlodga atrof-muhit haqida o'rgatish — biz kiritishimiz mumkin bo'lgan eng muhim sarmoyadir. Maktabimizda ZAMINAT.eco darslarini bevosita tabiiy fanlar o'quv dasturiga integratsiya qildik.",
            "O'quvchilar qayta ishlash ilmini, plastik qanday tasniflanishini va rezina qanday qayta ishlanishini o'rganadilar. Shuningdek, biz bolalar uydan plastik butilkalar olib keladigan amaliy saralash seminarlarini o'tkazamiz.",
            "Biz sinf darslarini daraxt ekish tadbirlari bilan birlashtirdik. Maktab hovlisida o'quvchilar 15 ta yangi soya beruvchi daraxt ekishdi va ularni ZAMINAT eko-plitkalari bilan o'rashdi.",
            "Bolalarning g'ayrati ajoyib bo'ldi. Hozirda ular ota-onalariga qayta ishlash haqida o'rgatmoqdalar va butun mahalla bo'ylab yashil ongning zanjirli ta'sirini yaratmoqdalar."
          ],
          location: "Yunusobod tumani, Tashkent",
          impact: "15 ta daraxt ekildi va muntazam qayta ishlash darslari"
        }
      };
    }
    
    if (currentLang.startsWith('ru')) {
      return {
        'featured-1': {
          title: "ZAMINAT.eco запускает пилотную программу в школах Ташкента",
          subtitle: "Экологическое движение начинает свой путь с инициатив по переработке пластика и резины, создавая зеленое будущее для молодежи.",
          content: [
            "Мы рады объявить об официальном запуске пилотной программы ZAMINAT.eco по переработке отходов в школах Ташкента. Эта инициатива знаменует собой важную веху в нашей миссии по изменению управления отходами в Узбекистане, начиная с нового поколения.",
            "В сотрудничестве с местными органами образования ZAMINAT.eco установила специализированные контейнеры для сортировки в пяти пионерских школах Ташкента, включая школу №45 в Чиланзарском районе. Контейнеры синего цвета предназначены для пластика ('PLASTIK'), а желтые — для резины ('REZINA').",
            "Ученики активно участвуют в сортировке пластиковых бутылок и старых шин. Вместо того чтобы просто собирать мусор, дети изучают алгоритмы сортировки и принципы циклической экономики. Собранные материалы транспортируются на наше современное предприятие, где они измельчаются, плавятся и превращаются в прочные экологически чистые резиновые плитки и скамейки для школьных дворов.",
            "Только за первый месяц учащиеся спасли более 1250 кг пластиковых и резиновых отходов от попадания на свалки. Эта пилотная программа доказывает, что благодаря простым изменениям и непосредственному участию сообщества могут вместе создавать устойчивую среду."
          ],
          location: "Ташкент, Узбекистан",
          impact: "Собрано и переработано 1250 кг пластика и резины"
        },
        'featured-2': {
          title: "Будущее переработки пластика и резины в Узбекистане",
          subtitle: "Как ZAMINAT.eco планирует трансформировать управление отходами по всей стране с помощью высокотехнологичных перерабатывающих заводов и моделей циклической экономики.",
          content: [
            "По мере расширения городских центров в Узбекистане проблема твердых бытовых отходов становится все более острой. ZAMINAT.eco решает эту проблему путем внедрения передовой автоматизированной инфраструктуры для переработки пластиковых и резиновых отходов.",
            "Наш перерабатывающий комплекс, расположенный в промышленных зонах Ташкента, использует современные линии сортировки и переработки. Здесь использованные пластиковые отходы очищаются, гранулируются и смешиваются с измельченной резиновой крошкой от старых шин.",
            "Путем формования под высоким давлением эта комбинация превращается в чрезвычайно прочные плитки, брусчатку и скамейки. Эти продукты устойчивы к атмосферным воздействиям, нетоксичны и идеально подходят для летней жары и зимних холодов Ташкента. Они сразу находят применение в парках и на детских площадках.",
            "Наша долгосрочная программа направлена на расширение этой модели во все крупные региональные центры Узбекистана к 2027 году. Показывая, что изделия из переработанного пластика могут конкурировать с традиционным бетоном и деревом, ZAMINAT.eco меняет представление об экологичном строительстве в Центральной Азии."
          ],
          location: "Промышленная зона Ташкента",
          impact: "Цель — завод с нулевым уровнем отходов к 2027 году"
        },
        'featured-3': {
          title: "Образовательные программы: Обучение следующего поколения",
          subtitle: "Как мы обучаем детей важности переработки пластика и резины с помощью интерактивных учебных программ и игровой механики.",
          content: [
            "Истинные изменения начинаются с образования. Команда разработчиков учебных программ ZAMINAT.eco запустила серию интерактивных семинаров в школах Ташкента.",
            "Эти семинары, проводимые опытными преподавателями-экологами, очень интерактивны. Вместо скучных лекций преподаватели показывают детям реальные образцы переработанных пластиковых досок, резиновой плитки и сырья. Дети могут потрогать и увидеть физический результат своих усилий по переработке.",
            "Учебная программа поддерживается ZAMI Bot — умным компаньоном, который превращает эко-привычки в игру. Проверяя свои показатели переработки в приложении, учащиеся могут накапливать баллы, повышать свой уровень и выигрывать призы для своей школы.",
            "Педагоги считают, что раннее обучение детей устойчивому развитию формирует у них экологические привычки на всю жизнь. ZAMINAT.eco планирует внедрить эту программу более чем в 100 школах к концу этого учебного года."
          ],
          location: "Ташкент, Узбекистан",
          impact: "Обучено более 5000 учащихся"
        },
        'community-1': {
          title: "От свалки к игровой площадке: трансформация нашей махалли",
          subtitle: "Как жители Сергелийского района очистили пустырь от незаконной свалки и построили красивую детскую площадку из переработанных материалов.",
          content: [
            "Шесть месяцев назад в нашей махалле в Сергелийском районе была серьезная проблема с отходами. Пустующий участок земли постепенно превратился в незаконную свалку пластика, старых шин и строительного мусора.",
            "Решив изменить ситуацию, мы объединились с ZAMINAT.eco. В течение трех выходных более 80 добровольцев махалли, включая старейшин и детей, вышли на генеральную уборку. Мы собрали более 1250 кг отходов.",
            "ZAMINAT.eco переработала эти отходы и вернула их нам в виде цветной резиновой плитки и скамеек. Вместе с игровым оборудованием мы построили красивое и безопасное пространство для наших детей.",
            "Сегодня место, где когда-то была свалка, превратилось в живую детскую площадку. Это яркое доказательство силы коллективных действий и вторичной переработки."
          ],
          location: "Сергелийский район, Ташкент",
          impact: "1250 кг отходов превращены в детскую площадку"
        },
        'community-2': {
          title: "Обучение детей: Воспитание молодых умов",
          subtitle: "Обучение детей младшего возраста ценности переработки пластика и резины посредством школьных семинаров и игр на свежем воздухе.",
          content: [
            "Обучение следующего поколения заботе об окружающей среде — это самая важная инвестиция, которую мы можем сделать. В нашей школе мы интегрировали уроки ZAMINAT.eco прямо в программу естественных наук.",
            "Ученики узнают науку переработки, классификацию пластика и способы переработки резины. Мы также проводим практические семинары по сортировке, куда дети приносят пластиковые бутылки из дома.",
            "Мы объединили уроки в классе с посадкой деревьев. Во дворе школы ученики посадили 15 новых тенистых деревьев, окружив их эко-плиткой ZAMINAT.",
            "Энтузиазм детей был невероятным. Теперь они учат своих родителей переработке отходов, распространяя экологическую культуру по всему району."
          ],
          location: "Юнусабадский район, Ташкент",
          impact: "Посажено 15 деревьев и проводятся регулярные уроки"
        }
      };
    }
    
    // Default to English
    return {
      'featured-1': {
        title: "ZAMINAT.eco Launches Pilot Program in Tashkent Schools",
        subtitle: "The ecological movement begins its journey with plastic and rubber recycling initiatives, setting up a green future for the youth.",
        content: [
          "We are proud to announce the official launch of the ZAMINAT.eco school recycling pilot program in Tashkent. This initiative marks a major milestone in our mission to transform waste management across Uzbekistan, starting with the next generation.",
          "In cooperation with local educational authorities, ZAMINAT.eco has installed specialized color-coded recycling stations at five pioneering schools in Tashkent, including School #45 in the Chilonzor district. The stations feature blue bins clearly labeled 'PLASTIK' and yellow bins labeled 'REZINA' (rubber).",
          "Students are actively participating in sorting plastic bottles and old tires. Rather than just collecting waste, children are learning sorting algorithms and circular economy principles. The collected materials are transported to our state-of-the-art facility, where they are shredded, melted, and molded into durable eco-friendly rubber safety tiles and outdoor benches for schoolyards.",
          "In the first month alone, students diverted over 1,250 kg of plastic and rubber waste from landfills. This pilot program is proving that with simple changes and direct engagement, communities can build sustainable environments together."
        ],
        location: "Tashkent, Uzbekistan",
        impact: "1,250kg plastic & rubber recycled"
      },
      'featured-2': {
        title: "The Future of Plastic and Rubber Recycling in Uzbekistan",
        subtitle: "How ZAMINAT.eco plans to transform waste management across the country through high-tech processing plants and circular economy models.",
        content: [
          "As urban centers in Uzbekistan expand, the challenge of municipal solid waste becomes increasingly pressing. ZAMINAT.eco is stepping up to address this by introducing advanced, automated recycling infrastructure tailored specifically for plastic and rubber waste.",
          "Located in the industrial zones of Tashkent, our recycling facility uses state-of-the-art sorting and processing lines. Here, post-consumer plastic waste is cleaned, pelletized, and combined with processed rubber crumb derived from scrap tires.",
          "Through high-pressure molding, this combination is transformed into extremely durable tiles, pavers, and benches. These products are weather-resistant, non-toxic, and highly suitable for Tashkent's summer heat and cold winters. They find immediate utility in residential parks and school playgrounds.",
          "Our long-term roadmap aims to expand this model to all major regional centers of Uzbekistan by 2027. By showing that recycled plastic products can compete directly with traditional concrete and wood, ZAMINAT.eco is redefining sustainable construction in Central Asia."
        ],
        location: "Tashkent industrial zone",
        impact: "Zero waste facility target by 2027"
      },
      'featured-3': {
        title: "Educational Programs: Teaching the Next Generation",
        subtitle: "How we're educating children about the importance of plastic and rubber recycling through interactive curricula and smart gamification.",
        content: [
          "True change starts with education. ZAMINAT.eco's dedicated curriculum team has launched a comprehensive series of classroom workshops across Tashkent elementary and middle schools.",
          "Led by experienced environmental educators, these workshops are highly interactive. Instead of just lecturing, instructors show children real samples of recycled plastic lumber, rubber tiles, and raw materials. Kids can touch and see the physical result of their recycling efforts.",
          "The curriculum is supported by the ZAMI Bot, a smart companion that gamifies eco-habits. By checking their recycling metrics in the app, students can earn points, level up, and win prizes for their school.",
          "Educators believe that teaching children early about sustainability creates lifelong green habits. ZAMINAT.eco plans to bring this interactive curriculum to over 100 schools by the end of this academic year."
        ],
        location: "Tashkent, Uzbekistan",
        impact: "Over 5,000 students educated"
      },
      'community-1': {
        title: "From Landfill to Playground: Our Mahalla's Transformation",
        subtitle: "How a local community in Sergeli District cleaned up an illegal dump site and built a beautiful playground using recycled materials.",
        content: [
          "Six months ago, our mahalla in Sergeli District had a terrible waste problem. An empty plot of land had slowly turned into an illegal landfill, filled with piles of plastic, old tires, and construction debris.",
          "Determined to make a change, we partnered with ZAMINAT.eco. Over three weekends, more than 80 mahalla volunteers—including elders and children—joined forces for a massive clean-up drive. We collected over 1,250 kg of plastic and rubber waste.",
          "ZAMINAT.eco took this waste, processed it, and returned it to us in the form of colorful rubber safety tiles and outdoor benches. Together with playground equipment, we built a beautiful, safe play space for our children.",
          "Today, the site that once was a landfill is now a lively playground where kids play safely. It stands as a testament to the power of community action and recycling."
        ],
        location: "Sergeli District, Tashkent",
        impact: "1,250kg of waste recycled into a playground"
      },
      'community-2': {
        title: "Teaching Kids About Plastic and Rubber Recycling",
        subtitle: "Educating young children about the value of plastic and rubber recycling through classroom workshops and outdoor activities.",
        content: [
          "Teaching the next generation about the environment is the most important investment we can make. In our school, we've integrated ZAMINAT.eco's interactive lessons directly into the science curriculum.",
          "Students learn the science of recycling, how plastic is cataloged, and how rubber can be processed. We also do practical sorting workshops where kids bring plastic bottles from home.",
          "We've combined classroom lessons with tree-planting events. In our school yard, students have planted 15 new shade trees, surrounding them with ZAMINAT eco-tiles.",
          "The enthusiasm from children has been incredible. They are now teaching their parents about recycling, creating a ripple effect of green awareness throughout the neighborhood."
        ],
        location: "Yunusabad District, Tashkent",
        impact: "15 trees planted & regular recycling classes"
      }
    };
  }, [currentLang]);

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
      <div className="relative min-h-screen bg-slate-50/40 pb-36">
        
        {/* Dynamic Glow Orbs for visual depth */}
        <div className="absolute top-0 left-1/4 w-[450px] h-[450px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[140px] pointer-events-none -z-10" />

        {/* Hero Header Section */}
        <div className="relative overflow-hidden py-12 md:py-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4 relative">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight"
            >
              {t('discoverOur', { ns: 'stories' })}{' '}
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
          <div className="flex md:justify-center justify-start overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <div className="flex p-1.5 bg-white shadow-md rounded-full border border-slate-200/50 min-w-max gap-1">
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
                      onClick={() => setSelectedStory({ type: 'featured', data: story })}
                      className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200/40 transition-all duration-500 overflow-hidden flex flex-col md:flex-row cursor-pointer"
                    >
                      {/* Left image container */}
                      <div className="relative w-full md:w-64 md:shrink-0 bg-slate-100 overflow-hidden aspect-video md:aspect-auto min-h-[160px] md:min-h-0">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                        <img 
                          src={story.image || story.iconPath || story.emoji} 
                          alt={t(story.titleKey, { ns: 'stories' })} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStory({ type: 'featured', data: story });
                            }}
                            className="text-xs font-bold rounded-full border-slate-200 hover:text-emerald-700 hover:border-emerald-600/40 hover:bg-emerald-50/20 px-5 transition-all shadow-sm"
                          >
                            {t('buttons.readMore', { ns: 'stories' })}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Social community story feed */}
                  {filteredCommunityStories.map((story, index) => {
                    const activeImageIdx = activeImageIndices[story.id] || 0;
                    const images = story.images || [];
                    const activeImage = images[activeImageIdx] || '/logo.webp';
                    const storyKey = `community-${story.id}`;
                    const liked = social.isLiked(storyKey);
                    const bookmarked = social.isBookmarked(storyKey);
                    const baseLikes = parseInt(t(story.likesKey, { ns: 'stories' })) || 0;
                    const likeCount = social.getLikeCount(storyKey, baseLikes);
                    const commentCount = social.getCommentCount(storyKey, parseInt(t(story.commentsKey, { ns: 'stories' })) || 0);
                    const showHeartBurst = doubleTapHeart[storyKey];
                    const inputKey = `card-${storyKey}`;
                    
                    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
                      const container = e.currentTarget;
                      const width = container.offsetWidth;
                      if (width <= 0) return;
                      const scrollLeft = container.scrollLeft;
                      const nextIdx = Math.round(scrollLeft / width);
                      if (nextIdx !== activeImageIdx && nextIdx >= 0 && nextIdx < images.length) {
                        setActiveImageIndices(prev => ({ ...prev, [story.id]: nextIdx }));
                      }
                    };

                    const handleImageClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleDoubleTap(storyKey);
                      if (images.length > 1) {
                        setTimeout(() => {
                          if (lastTapTime.current[storyKey] !== 0) {
                            const target = e.target as HTMLElement;
                            const container = target.closest('.carousel-snap-container') as HTMLDivElement;
                            if (container) {
                              const nextIdx = (activeImageIdx + 1) % images.length;
                              container.scrollTo({
                                left: nextIdx * container.offsetWidth,
                                behavior: 'smooth'
                              });
                            }
                            lastTapTime.current[storyKey] = 0;
                          }
                        }, 360);
                      }
                    };

                    const handlePrevClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      const btn = e.currentTarget as HTMLButtonElement;
                      const container = btn.parentElement?.querySelector('.carousel-snap-container') as HTMLDivElement;
                      if (container) {
                        const nextIdx = (activeImageIdx - 1 + images.length) % images.length;
                        container.scrollTo({
                          left: nextIdx * container.offsetWidth,
                          behavior: 'smooth'
                        });
                      }
                    };

                    const handleNextClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      const btn = e.currentTarget as HTMLButtonElement;
                      const container = btn.parentElement?.querySelector('.carousel-snap-container') as HTMLDivElement;
                      if (container) {
                        const nextIdx = (activeImageIdx + 1) % images.length;
                        container.scrollTo({
                          left: nextIdx * container.offsetWidth,
                          behavior: 'smooth'
                        });
                      }
                    };

                    return (
                      <motion.div
                        key={`community-${story.id}`}
                        id={`community-story-card-${story.id}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="bg-white w-full max-w-[480px] mx-auto border-y border-slate-200/60 sm:border sm:rounded-lg sm:shadow-sm mb-6 flex flex-col overflow-hidden text-left"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-white">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8 border border-slate-200/60 shadow-sm shrink-0">
                              {story.avatarImage ? (
                                <img src={story.avatarImage} alt={t(story.nameKey, { ns: 'stories' })} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-850 font-extrabold text-[11px]">{story.avatar}</AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900 text-[13px]">{t(story.nameKey, { ns: 'stories' }).toLowerCase().replace(/\s+/g, '_')}</span>
                                <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0 rounded-full bg-emerald-50 border-emerald-500/10 text-emerald-700 scale-90 origin-left">Lvl {story.level}</Badge>
                              </div>
                              <span className="text-[10px] text-slate-500 font-normal">{t(story.locationKey, { ns: 'stories' })}</span>
                            </div>
                          </div>
                          <button onClick={() => setSelectedStory({ type: 'community', data: story })} className="text-slate-550 hover:text-slate-800 p-1.5 hover:bg-slate-50 rounded-full transition-colors">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Image with double-tap heart and mobile swipe */}
                        <div className="relative aspect-square w-full bg-slate-950 overflow-hidden group select-none cursor-pointer">
                          <div 
                            onScroll={handleScroll}
                            className="carousel-snap-container flex overflow-x-auto snap-x snap-mandatory h-full w-full scrollbar-none scroll-smooth"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                          >
                            {images.map((img: string, idx: number) => (
                              <div 
                                key={idx} 
                                className="w-full h-full shrink-0 snap-start snap-always relative"
                                onClick={handleImageClick}
                              >
                                <img 
                                  src={img} 
                                  alt={`story-media-${idx}`} 
                                  className="w-full h-full object-cover pointer-events-none select-none" 
                                />
                              </div>
                            ))}
                          </div>
                          <AnimatePresence>
                            {showHeartBurst && (
                              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                <Heart className="h-24 w-24 text-white fill-white drop-shadow-2xl" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {images.length > 1 && <span className="absolute top-3 right-3 bg-slate-950/75 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider z-10 pointer-events-none select-none">{activeImageIdx + 1}/{images.length}</span>}
                          <button onClick={(e) => { e.stopPropagation(); setLightboxImage(activeImage); }} className="absolute top-3 left-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md"><Eye className="h-4 w-4" /></button>
                          {images.length > 1 && (
                            <>
                              <button onClick={handlePrevClick} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-slate-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                              </button>
                              <button onClick={handleNextClick} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-slate-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                              </button>
                            </>
                          )}
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center justify-between px-3.5 pt-3 pb-2 bg-white">
                          <div className="flex items-center space-x-3.5">
                            <button onClick={(e) => { e.stopPropagation(); social.toggleLike(storyKey); }} className="hover:scale-105 transition-all duration-200">
                              <Heart className={`h-6 w-6 stroke-[1.8] ${liked ? 'fill-red-500 text-red-500 animate-[bounce_0.4s_ease-in-out]' : 'text-slate-850'}`} />
                            </button>
                            <button onClick={() => setSelectedStory({ type: 'community', data: story })} className="text-slate-800 hover:text-emerald-600 transition-all duration-200 hover:scale-105">
                              <MessageCircle className="h-6 w-6 stroke-[1.8]" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleShareAction(story.id); }} className="text-slate-800 hover:text-blue-500 transition-all duration-200 hover:scale-105">
                              <Send className="h-5 w-5 stroke-[1.8] -rotate-12 mt-0.5" />
                            </button>
                          </div>
                          {images.length > 1 && (
                            <div className="flex justify-center gap-1">
                              {images.map((_, idx) => (<span key={idx} className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${idx === activeImageIdx ? 'bg-sky-500 scale-110' : 'bg-slate-200 scale-90'}`} />))}
                            </div>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleBookmarkAction(storyKey); }} className="hover:scale-105 transition-all duration-200">
                            <Bookmark className={`h-6 w-6 stroke-[1.8] ${bookmarked ? 'fill-slate-800 text-slate-800' : 'text-slate-850'}`} />
                          </button>
                        </div>

                        {/* Likes */}
                        <div className="px-3.5 pb-1 text-[13px] font-semibold text-slate-900 bg-white">
                          <motion.span key={likeCount} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>{likeCount.toLocaleString()}</motion.span>
                          {' '}{t('common.likesCount', { ns: 'stories', defaultValue: 'likes' })}
                        </div>

                        {/* Caption */}
                        <div className="px-3.5 pb-2 text-[13px] text-slate-900 bg-white space-y-1.5">
                          <div className="leading-relaxed">
                            <span className="font-semibold text-slate-900 mr-2">{t(story.nameKey, { ns: 'stories' }).toLowerCase().replace(/\s+/g, '_')}</span>
                            <span className="font-medium text-slate-900 mr-1.5">{t(story.titleKey, { ns: 'stories' })}</span>
                            <span className="text-slate-650 font-normal">{t(story.descriptionKey, { ns: 'stories' })}</span>
                          </div>
                          {story.environmentalImpactKey && (
                            <div className="bg-emerald-50/40 border border-emerald-100/50 p-2.5 rounded-xl flex items-start gap-2 shadow-sm">
                              <span className="text-sm shrink-0">🌱</span>
                              <p className="text-xs text-emerald-950 leading-normal font-medium"><strong>{t(story.environmentalImpactKey, { ns: 'stories' })}</strong> {t(story.impactDescriptionKey, { ns: 'stories' })}</p>
                            </div>
                          )}
                          <button onClick={() => setSelectedStory({ type: 'community', data: story })} className="text-xs text-slate-400 font-semibold hover:text-emerald-700 transition-colors block">
                            {t('common.viewComments', { ns: 'stories', count: commentCount, defaultValue: `View all ${commentCount} comments` })}
                          </button>
                          <div className="flex flex-wrap gap-1.5">
                            {story.hashtags.map((hashtag: string, idx: number) => (<span key={idx} className="text-xs font-semibold text-[#00376b] hover:underline cursor-pointer">{hashtag}</span>))}
                          </div>
                        </div>

                        {/* Inline Comment Input */}
                        <div className="relative flex items-center px-3.5 pb-3 pt-1 border-t border-slate-50 bg-white gap-2">
                          <button onClick={() => setEmojiPickerFor(emojiPickerFor === inputKey ? null : inputKey)} className="shrink-0">
                            <Smile className={`h-5 w-5 transition-colors ${emojiPickerFor === inputKey ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`} />
                          </button>
                          {emojiPickerFor === inputKey && (
                            <div className="absolute bottom-full left-2 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 grid grid-cols-10 gap-1 z-30 w-[280px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                              {emojiList.map((emoji) => (
                                <button key={emoji} onClick={() => handleEmojiInsert(emoji, inputKey)} className="text-lg hover:bg-slate-100 rounded-lg p-1 transition-colors text-center leading-none">{emoji}</button>
                              ))}
                            </div>
                          )}
                          <input
                            ref={(el) => { cardInputRefs.current[inputKey] = el; }}
                            type="text"
                            value={commentInputs[inputKey] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [inputKey]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitComment(storyKey, inputKey); }}
                            placeholder={t('common.addComment', { ns: 'stories', defaultValue: 'Add a comment...' })}
                            className="flex-1 text-[13px] text-slate-700 placeholder:text-slate-350 bg-transparent border-none outline-none"
                          />
                          {(commentInputs[inputKey] || '').trim() && (
                            <button onClick={() => handleSubmitComment(storyKey, inputKey)} className="text-sky-500 font-semibold text-[13px] hover:text-sky-700 transition-colors shrink-0">
                              {t('common.post', { ns: 'stories', defaultValue: 'Post' })}
                            </button>
                          )}
                        </div>

                        {/* Date */}
                        <div className="px-3.5 pb-3 bg-white">
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest">{t(story.dateKey, { ns: 'stories' })}</span>
                        </div>
                      </motion.div>
                    );
                  })}
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
                <DialogTitle className="text-white font-extrabold text-sm sm:text-base line-clamp-1 flex items-center gap-2 pr-6">
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
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Video Player for Zaminat Eco Stories
                </DialogDescription>
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

      {/* Dynamic Story / Blog Post Modal */}
      <Dialog open={selectedStory !== null} onOpenChange={(open) => { if (!open) setSelectedStory(null); }}>
        <DialogContent className="max-w-[760px] w-[95%] p-0 overflow-y-auto max-h-[90vh] border border-slate-150 bg-white rounded-3xl shadow-2xl z-50">
          <DialogTitle className="sr-only">Article Detail</DialogTitle>
          {selectedStory && (() => {
            const isFeatured = selectedStory.type === 'featured';
            const story = selectedStory.data;
            const articleKey = `${selectedStory.type}-${story.id}`;
            const article = fullArticles[articleKey] || {
              title: t(story.titleKey, { ns: 'stories' }),
              subtitle: t(story.descriptionKey, { ns: 'stories' }),
              content: [t(story.descriptionKey, { ns: 'stories' })]
            };
            
            // Get cover image(s)
            const images = isFeatured ? [story.image] : (story.images || []);
            const mainImage = images[0] || '/logo.webp';

            return (
              <div className="flex flex-col text-left">
                {/* Header Cover Image */}
                <div 
                  className="relative w-full aspect-video md:aspect-[21/9] bg-slate-100 overflow-hidden cursor-pointer"
                  onClick={() => setLightboxImage(mainImage)}
                >
                  <img 
                    src={mainImage} 
                    alt={article.title} 
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                    <Badge className={`text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider border ${
                      isFeatured ? getBadgeStyle(story.badgeType) : 'bg-blue-500/25 text-blue-300 border-blue-500/30'
                    }`}>
                      {isFeatured ? t(`badges.${story.badgeType}`, { ns: 'stories' }) : t('badges.communityStory', { ns: 'stories' })}
                    </Badge>
                    <h2 className="font-extrabold text-lg sm:text-2xl lg:text-3xl text-white tracking-tight leading-tight">
                      {article.title}
                    </h2>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Meta Row: Author, Date, Location */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                        {story.avatarImage ? (
                          <img src={story.avatarImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-800 text-xs font-bold uppercase">
                            {isFeatured ? (t(story.authorKey, { ns: 'stories' }) || 'ZE').slice(0, 2) : story.avatar}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="text-xs">
                        <span className="block font-bold text-slate-800">{isFeatured ? t(story.authorKey, { ns: 'stories' }) : t(story.nameKey, { ns: 'stories' })}</span>
                        <span className="block text-slate-400 text-[10px] mt-0.5">{isFeatured ? t(story.dateKey, { ns: 'stories' }) : t(story.dateKey, { ns: 'stories' })}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {article.location && (
                        <span className="flex items-center gap-1 bg-slate-50 text-slate-600 px-3 py-1 rounded-full border border-slate-100 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-slate-450" />
                          {article.location}
                        </span>
                      )}
                      {story.readTimeKey && (
                        <span className="flex items-center gap-1 bg-slate-50 text-slate-600 px-3 py-1 rounded-full border border-slate-100 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-slate-450" />
                          {t(story.readTimeKey, { ns: 'stories' })} {t('readTime.minRead', { ns: 'stories' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subtitle */}
                  <p className="text-slate-600 font-semibold text-sm sm:text-base leading-relaxed italic border-l-2 border-emerald-500 pl-4 bg-emerald-50/20 py-1.5 rounded-r-lg">
                    {article.subtitle}
                  </p>

                  {/* Environmental Impact highlight */}
                  {(story.environmentalImpactKey || article.impact) && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4 rounded-2xl shadow-sm flex items-start gap-3">
                      <span className="text-lg shrink-0">🌱</span>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{t('common.environmentalImpact', { ns: 'stories', defaultValue: 'Environmental Impact' })}</div>
                        <div className="text-sm text-emerald-950 font-medium leading-relaxed">
                          {isFeatured 
                            ? article.impact 
                            : `${t(story.environmentalImpactKey, { ns: 'stories' })} ${t(story.impactDescriptionKey, { ns: 'stories' })}`
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Article Content */}
                  <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed font-light">
                    {article.content.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  {/* Additional Images (if any, e.g. for community stories) */}
                  {!isFeatured && images.length > 1 && (
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Gallery</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {images.slice(1).map((img, i) => (
                          <div 
                            key={i} 
                            className="aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50 cursor-pointer group/gallery"
                            onClick={() => setLightboxImage(img)}
                          >
                            <img 
                              src={img} 
                              alt={`Gallery ${i + 1}`} 
                              className="w-full h-full object-cover group-hover/gallery:scale-105 transition-transform duration-500" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Action Bar */}
                  {(() => {
                    const dialogStoryKey = `${selectedStory.type}-${story.id}`;
                    const dialogLiked = social.isLiked(dialogStoryKey);
                    const dialogBookmarked = social.isBookmarked(dialogStoryKey);
                    const dialogBaseLikes = parseInt(t(story.likesKey || '', { ns: 'stories' })) || 150;
                    const dialogLikeCount = social.getLikeCount(dialogStoryKey, dialogBaseLikes);
                    const dialogComments = social.getComments(dialogStoryKey);
                    
                    return (
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        {/* Action row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button onClick={() => social.toggleLike(dialogStoryKey)} className="hover:scale-110 transition-transform">
                              <Heart className={`h-6 w-6 ${dialogLiked ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
                            </button>
                            <button className="text-slate-700 hover:text-emerald-600 transition-colors">
                              <MessageCircle className="h-6 w-6" />
                            </button>
                            <button onClick={() => handleShareAction(story.id)} className="text-slate-700 hover:text-blue-500 transition-colors">
                              <Send className="h-5 w-5 -rotate-12" />
                            </button>
                          </div>
                          <button onClick={() => handleBookmarkAction(dialogStoryKey)} className="hover:scale-110 transition-transform">
                            <Bookmark className={`h-6 w-6 ${dialogBookmarked ? 'fill-slate-800 text-slate-800' : 'text-slate-700'}`} />
                          </button>
                        </div>

                        {/* Likes count */}
                        <div className="text-sm font-bold text-slate-900">
                          {dialogLikeCount.toLocaleString()} {t('common.likesCount', { ns: 'stories', defaultValue: 'likes' })}
                        </div>

                        {/* Comments Section */}
                        {dialogComments.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              {t('common.comments', { ns: 'stories', defaultValue: 'Comments' })} ({dialogComments.length})
                            </h4>
                            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
                              {dialogComments.map((comment) => (
                                <div key={comment.id} className="flex gap-2.5 group/comment">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0 mt-0.5">
                                    {comment.avatar}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[13px] leading-snug">
                                      <span className="font-semibold text-slate-900 mr-1.5">{comment.author.toLowerCase().replace(/\s+/g, '_')}</span>
                                      <span className="text-slate-700">{comment.text}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                                      <span>{timeAgo(comment.timestamp)}</span>
                                      {comment.likes > 0 && <span className="font-semibold">{comment.likes} {t('common.likesCount', { ns: 'stories', defaultValue: 'likes' })}</span>}
                                      <button onClick={() => handleReply(comment.author, 'dialog')} className="font-semibold hover:text-slate-600 transition-colors">{t('common.reply', { ns: 'stories', defaultValue: 'Reply' })}</button>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => social.toggleCommentLike(dialogStoryKey, comment.id)}
                                    className="shrink-0 self-center opacity-0 group-hover/comment:opacity-100 transition-opacity"
                                  >
                                    <Heart className={`h-3 w-3 ${comment.isLiked ? 'fill-red-500 text-red-500' : 'text-slate-300'}`} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Comment Input */}
                        <div className="relative flex items-center gap-2 pt-3 border-t border-slate-100">
                          <button onClick={() => setEmojiPickerFor(emojiPickerFor === 'dialog' ? null : 'dialog')} className="shrink-0">
                            <Smile className={`h-5 w-5 transition-colors ${emojiPickerFor === 'dialog' ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`} />
                          </button>
                          {emojiPickerFor === 'dialog' && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 grid grid-cols-10 gap-1 z-30 w-[280px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                              {emojiList.map((emoji) => (
                                <button key={emoji} onClick={() => handleEmojiInsert(emoji, 'dialog')} className="text-lg hover:bg-slate-100 rounded-lg p-1 transition-colors text-center leading-none">{emoji}</button>
                              ))}
                            </div>
                          )}
                          <input
                            ref={dialogInputRef}
                            type="text"
                            value={dialogCommentInput}
                            onChange={(e) => setDialogCommentInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitComment(dialogStoryKey); }}
                            placeholder={t('common.addComment', { ns: 'stories', defaultValue: 'Add a comment...' })}
                            className="flex-1 text-sm text-slate-700 placeholder:text-slate-350 bg-transparent border-none outline-none"
                          />
                          {dialogCommentInput.trim() && (
                            <button
                              onClick={() => handleSubmitComment(dialogStoryKey)}
                              className="text-sky-500 font-semibold text-sm hover:text-sky-700 transition-colors shrink-0"
                            >
                              {t('common.post', { ns: 'stories', defaultValue: 'Post' })}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
      
      {/* Lightbox Image Preview Modal */}
      <Dialog open={lightboxImage !== null} onOpenChange={(open) => { if (!open) setLightboxImage(null); }}>
        <DialogContent className="max-w-[90vw] md:max-w-[70vw] w-fit p-1 bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-[60] [&>button:last-child]:text-white [&>button:last-child]:bg-black/50 [&>button:last-child]:rounded-full [&>button:last-child]:p-1.5 [&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:opacity-80 [&>button:last-child]:hover:opacity-100">
          <DialogDescription className="sr-only">
            Image Lightbox Viewer
          </DialogDescription>
          {lightboxImage && (
            <div className="relative flex items-center justify-center p-0">
              <img 
                src={lightboxImage} 
                alt="Enlarged view" 
                className="max-h-[80vh] object-contain rounded-2xl shadow-2xl select-none"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

    </Layout>
  );
}
