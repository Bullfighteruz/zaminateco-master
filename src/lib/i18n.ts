import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all translation files
import enTranslation from '../locales/en/translation.json';
import ruTranslation from '../locales/ru/translation.json';
import uzTranslation from '../locales/uz/translation.json';

import enCommon from '../locales/en/common.json';
import ruCommon from '../locales/ru/common.json';
import uzCommon from '../locales/uz/common.json';

import enProfile from '../locales/en/profile.json';
import ruProfile from '../locales/ru/profile.json';
import uzProfile from '../locales/uz/profile.json';

import enActions from '../locales/en/actions-translations.json';
import ruActions from '../locales/ru/actions-translations.json';
import uzActions from '../locales/uz/actions-translations.json';

import enShop from '../locales/en/shop-translations.json';
import ruShop from '../locales/ru/shop-translations.json';
import uzShop from '../locales/uz/shop-translations.json';

import enStories from '../locales/en/stories-translations.json';
import ruStories from '../locales/ru/stories-translations.json';
import uzStories from '../locales/uz/stories-translations.json';

import enTeam from '../locales/en/team-translations.json';
import ruTeam from '../locales/ru/team-translations.json';
import uzTeam from '../locales/uz/team-translations.json';

export const translations = {
  en: {
    // Main translations (includes home page keys)
    ...enTranslation,
    // Common translations
    ...enCommon,
    // Profile translations
    ...enProfile,
    // Actions translations
    ...enActions,
    // Shop translations
    ...enShop,
    // Stories translations
    ...enStories,
    // Team translations
    ...enTeam,

    // Additional home page specific translations that might be missing
    welcomeBackUser: 'Welcome back',
    continueImpactMessage: 'Continue making an impact in your community',
    climateHero: 'Climate Hero',
    levelFifteen: 'Level',
    sustainabilityExpert: 'Sustainability Expert',
    ecoCoinsLabel: 'Eco Coins',
    ecoPointsLabel: 'Eco Points',
    aboutZaminatProject: 'About ZAMINAT project',
    aboutZaminatDescription: 'ZAMINAT.eco transforms plastic and rubber recycling into a mass social movement. We unite citizens, schools, neighborhoods, volunteers, investors, and government structures into one ecosystem that turns waste into visible contributions for our communities.',
    ourGoalsFor2026: 'Our Goals for 2026',
    currentProgressStatus: 'Current Progress Status',
    recycle1000Tons: 'Recycle 1,000 tons of plastic and rubber waste',
    engage50000Users: 'Engage 50,000 active users in the movement',
    complete100Projects: 'Complete 100 community infrastructure projects',
    plant10000Trees: 'Plant 10,000 trees across Uzbekistan',
    recycled2500kg: 'Recycled 2.5K kg of plastic and rubber',
    active1250Members: 'Active 1,250 community members',
    launched3Projects: 'Launched 3 pilot projects',
    planted156Trees: 'Planted 156 trees',
    readFullStoryButton: 'Read Full Story',
    latestNewsEducation: 'Latest News & Education',
    minReadTime: 'min read',
    byAuthor: 'by',
    viewAllNews: 'View All News',
    yourEnvironmentalImpact: 'Your Environmental Impact',
    wasteCollectedLabel: 'Waste Collected',
    badgesEarnedLabel: 'Badges Earned',
    ecoCoinsProgress: 'Eco Coins',
    keepItUpMessage: 'Keep it up! You\'re truly making a difference in your community. Your efforts contribute to plastic and rubber recycling, creating eco-tiles and sustainable infrastructure for Uzbekistan.',
    readyForBiggerImpact: 'Ready for a bigger impact?',
    joinVolunteerCampaigns: 'Join volunteer eco-campaigns across Uzbekistan and help build a transparent, sustainable future through plastic and rubber recycling.',
    joinNextCleanupEvent: 'Join Next Cleanup Event',
    learnAboutZaminatProject: 'Learn About ZAMINAT Project',
    exploreMore: 'Explore More',
    ourPartnersLink: 'Our Partners',
    discoverExclusiveDiscounts: 'Discover exclusive discounts from eco-conscious partners supporting the ZAMINAT movement.',
    viewPartners: 'View Partners',
    meetOurTeam: 'Meet Our Team',
    passionatePeopleBehind: 'The passionate people behind the ZAMINAT movement',
    meetTeam: 'Meet Team',
    contactUsButton: 'Contact Us',
    getInTouchPartnerships: 'Get in touch for partnerships and collaborations',
    plasticRubberRecycledTitle: 'Plastic & Rubber Recycled',
    transformedIntoEcoTiles: 'Transformed into eco-tiles and construction materials',
    ecoWarriorsActiveTitle: 'Eco Warriors Active',
    citizensSchoolsUnited: 'Citizens, schools, and volunteers united for change',
    communityProjectsTitle: 'Community Projects',
    pilotProjectsTransforming: 'Pilot projects transforming communities',
    treesPlantedTitle: 'Trees Planted',
    growingGreenSpaces: 'Growing green spaces across Uzbekistan',
    eventsButton: 'Events',
    shopButton: 'Shop'
  },
  ru: {
    // Main translations (includes home page keys)
    ...ruTranslation,
    // Common translations
    ...ruCommon,
    // Profile translations
    ...ruProfile,
    // Actions translations
    ...ruActions,
    // Shop translations
    ...ruShop,
    // Stories translations
    ...ruStories,
    // Team translations
    ...ruTeam,

    // Additional home page specific translations that might be missing
    welcomeBackUser: 'Добро пожаловать',
    continueImpactMessage: 'Продолжайте влиять на ваше сообщество',
    climateHero: 'Герой климата',
    levelFifteen: 'Уровень',
    sustainabilityExpert: 'Эксперт по устойчивости',
    ecoCoinsLabel: 'Эко-монеты',
    ecoPointsLabel: 'Эко-баллы',
    aboutZaminatProject: 'О проекте ZAMINAT',
    aboutZaminatDescription: 'ZAMINAT.eco превращает переработку пластика и резины в массовое социальное движение. Мы объединяем граждан, школы, районы, волонтеров, инвесторов и государственные структуры в одну экосистему, которая превращает отходы в видимый вклад для наших сообществ.',
    ourGoalsFor2026: 'Наши цели на 2026 год',
    currentProgressStatus: 'Текущий статус прогресса',
    recycle1000Tons: 'Переработать 1000 тонн пластиковых и резиновых отходов',
    engage50000Users: 'Привлечь 50 000 активных пользователей в движение',
    complete100Projects: 'Завершить 100 проектов инфраструктуры сообщества',
    plant10000Trees: 'Посадить 10 000 деревьев по всему Узбекистану',
    recycled2500kg: 'Переработано 2,5К кг пластика и резины',
    active1250Members: 'Активно 1250 членов сообщества',
    launched3Projects: 'Запущено 3 пилотных проекта',
    planted156Trees: 'Посажено 156 деревьев',
    readFullStoryButton: 'Читать полную историю',
    latestNewsEducation: 'Последние новости и образование',
    minReadTime: 'мин чтения',
    byAuthor: 'автор',
    viewAllNews: 'Посмотреть все новости',
    yourEnvironmentalImpact: 'Ваше экологическое влияние',
    wasteCollectedLabel: 'Собрано отходов',
    badgesEarnedLabel: 'Получено значков',
    ecoCoinsProgress: 'Эко-монеты',
    keepItUpMessage: 'Продолжайте! Вы действительно меняете свое сообщество к лучшему. Ваши усилия способствуют переработке пластика и резины, создавая эко-плитку и устойчивую инфраструктуру для Узбекистана.',
    readyForBiggerImpact: 'Готовы к большему влиянию?',
    joinVolunteerCampaigns: 'Присоединяйтесь к волонтерским эко-кампаниям по всему Узбекистану и помогите построить прозрачное, устойчивое будущее через переработку пластика и резины.',
    joinNextCleanupEvent: 'Присоединиться к следующей уборке',
    learnAboutZaminatProject: 'Узнать о проекте ZAMINAT',
    exploreMore: 'Исследовать больше',
    ourPartnersLink: 'Наши партнеры',
    discoverExclusiveDiscounts: 'Откройте для себя эксклюзивные скидки от экологически сознательных партнеров, поддерживающих движение ZAMINAT.',
    viewPartners: 'Посмотреть партнеров',
    meetOurTeam: 'Встретьте нашу команду',
    passionatePeopleBehind: 'Увлеченные люди за движением ZAMINAT',
    meetTeam: 'Встретить команду',
    contactUsButton: 'Связаться с нами',
    getInTouchPartnerships: 'Свяжитесь для партнерства и сотрудничества',
    plasticRubberRecycledTitle: 'Переработано пластика и резины',
    transformedIntoEcoTiles: 'Превращено в эко-плитку и строительные материалы',
    ecoWarriorsActiveTitle: 'Активных эко-воинов',
    citizensSchoolsUnited: 'Граждане, школы и волонтеры объединились для изменений',
    communityProjectsTitle: 'Проекты сообщества',
    pilotProjectsTransforming: 'Пилотные проекты, преобразующие сообщества',
    treesPlantedTitle: 'Посажено деревьев',
    growingGreenSpaces: 'Растущие зеленые пространства по всему Узбекистану',
    eventsButton: 'События',
    shopButton: 'Магазин'
  },
  uz: {
    // Main translations (includes home page keys)
    ...uzTranslation,
    // Common translations
    ...uzCommon,
    // Profile translations
    ...uzProfile,
    // Actions translations
    ...uzActions,
    // Shop translations
    ...uzShop,
    // Stories translations
    ...uzStories,
    // Team translations
    ...uzTeam,

    // Additional home page specific translations that might be missing
    welcomeBackUser: 'Xush kelibsiz',
    continueImpactMessage: 'Jamiyatingizni yaxshilashda davom eting',
    climateHero: 'Iqlim qahramoni',
    levelFifteen: 'Daraja',
    sustainabilityExpert: 'Barqarorlik eksperti',
    ecoCoinsLabel: 'Eko-tangalar',
    ecoPointsLabel: 'Eko-ballar',
    aboutZaminatProject: 'ZAMINAT loyihasi haqida',
    aboutZaminatDescription: 'ZAMINAT.eco plastik va rezina qayta ishlashni ommaviy ijtimoiy harakatga aylantiradi. Biz fuqarolar, maktablar, mahallalar, ko\'ngillilar, investorlar va davlat tuzilmalarini chiqindilarni jamiyatlarimiz uchun ko\'rinadigan hissaga aylantiradigan bitta ekotizimga birlashtiramiz.',
    ourGoalsFor2026: 'Bizning 2026 yil uchun maqsadlarimiz',
    currentProgressStatus: 'Joriy taraqqiyot holati',
    recycle1000Tons: '1000 tonna plastik va rezina chiqindisini qayta ishlash',
    engage50000Users: '50 000 faol foydalanuvchini harakatga jalb qilish',
    complete100Projects: '100 ta jamiyat infratuzilma loyihasini yakunlash',
    plant10000Trees: 'Butun O\'zbekiston bo\'ylab 10 000 daraxt ekish',
    recycled2500kg: '2,5K kg plastik va rezina qayta ishlandi',
    active1250Members: '1250 faol jamiyat a\'zolari',
    launched3Projects: '3 ta pilot loyiha ishga tushirildi',
    planted156Trees: '156 daraxt ekildi',
    readFullStoryButton: 'To\'liq hikoyani o\'qish',
    latestNewsEducation: 'So\'nggi yangiliklar va ta\'lim',
    minReadTime: 'daq o\'qish',
    byAuthor: 'tomonidan',
    viewAllNews: 'Barcha yangiliklarni ko\'rish',
    yourEnvironmentalImpact: 'Sizning ekologik ta\'siringiz',
    wasteCollectedLabel: 'Yig\'ilgan chiqindilar',
    badgesEarnedLabel: 'Olingan nishonlar',
    ecoCoinsProgress: 'Eko-tangalar',
    keepItUpMessage: 'Davom eting! Siz haqiqatan ham jamiyatingizni yaxshilash uchun harakat qilyapsiz. Sizning sa\'y-harakatlaringiz plastik va rezina qayta ishlashga yordam beradi, O\'zbekiston uchun eko-kafel va barqaror infratuzilma yaratadi.',
    readyForBiggerImpact: 'Kattaroq ta\'sirga tayyormisiz?',
    joinVolunteerCampaigns: 'Butun O\'zbekiston bo\'ylab ko\'ngillilar eko-kampaniyalariga qo\'shiling va plastik va rezina qayta ishlash orqali shaffof, barqaror kelajak qurishga yordam bering.',
    joinNextCleanupEvent: 'Keyingi tozalash tadbiriga qo\'shilish',
    learnAboutZaminatProject: 'ZAMINAT loyihasi haqida bilish',
    exploreMore: 'Ko\'proq o\'rganish',
    ourPartnersLink: 'Bizning hamkorlarimiz',
    discoverExclusiveDiscounts: 'ZAMINAT harakatini qo\'llab-quvvatlovchi ekologik ongga ega hamkorlardan eksklyuziv chegirmalarni kashf eting.',
    viewPartners: 'Hamkorlarni ko\'rish',
    meetOurTeam: 'Bizning jamoa bilan tanishing',
    passionatePeopleBehind: 'ZAMINAT harakati ortidagi ishtiyoqli odamlar',
    meetTeam: 'Jamoa bilan tanishish',
    contactUsButton: 'Biz bilan bog\'lanish',
    getInTouchPartnerships: 'Hamkorlik va hamkorlik uchun bog\'laning',
    plasticRubberRecycledTitle: 'Qayta ishlangan plastik va rezina',
    transformedIntoEcoTiles: 'Eko-kafel va qurilish materiallariga aylantirildi',
    ecoWarriorsActiveTitle: 'Faol eko-jangchilar',
    citizensSchoolsUnited: 'Fuqarolar, maktablar va ko\'ngillilar o\'zgarish uchun birlashdi',
    communityProjectsTitle: 'Jamiyat loyihalari',
    pilotProjectsTransforming: 'Jamiyatlarni o\'zgartiradigan pilot loyihalar',
    treesPlantedTitle: 'Ekilgan daraxtlar',
    growingGreenSpaces: 'Butun O\'zbekiston bo\'ylab o\'sib borayotgan yashil zonalar',
    eventsButton: 'Tadbirlar',
    shopButton: 'Do\'kon'
  }
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: translations,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;