import { InterpretedMessage } from './search-types';

export class UserMessageInterpreter {
  private static readonly TYPO_MAP: Record<string, string> = {
    // Russian
    'севодня': 'сегодня', 'седня': 'сегодня', 'сиводня': 'сегодня',
    'щас': 'сейчас', 'шас': 'сейчас', 'сечас': 'сейчас', 'сейчс': 'сейчас', 'сичас': 'сейчас',
    'уровен': 'уровень', 'уровне': 'уровень', 'уровня': 'уровень',
    'загрезнение': 'загрязнение', 'загрезнения': 'загрязнение', 'загрязеня': 'загрязнение', 'загрезнений': 'загрязнение', 'загрязненя': 'загрязнение',
    'возух': 'воздух', 'воздухе': 'воздух', 'воздухом': 'воздух',
    'пагода': 'погода', 'пагоды': 'погода',
    'завтро': 'завтра',
    'текущи': 'текущий', 'текущие': 'текущий', 'актуальни': 'актуальный',
    'матриал': 'материалы', 'матриалы': 'материалы', 'матриалов': 'материалы',
    'переробка': 'переработка', 'переробку': 'переработка', 'перероботка': 'переработка', 'переробке': 'переработка',
    'пластига': 'пластик',
    'источиник': 'источник', 'источинк': 'источник', 'источнк': 'источник', 'источники': 'источники',
    'найд': 'найди', 'поищ': 'поищи',
    'исследовния': 'исследования', 'исследовыния': 'исследования', 'иследования': 'исследования', 'исследований': 'исследования',
    'ташк': 'ташкент', 'таш': 'ташкент',
    'узб': 'узбекистан',
    'инфа': 'информация', 'инфу': 'информация', 'пруфы': 'источники', 'пруф': 'источник',
    'биток': 'биткоин', 'биткоины': 'биткоин', 'бакс': 'доллар',
    'призидент': 'президент', 'паследний': 'последний', 'барель': 'баррель',
    'дакуминтацию': 'документация', 'дакументация': 'документация',

    // Uzbek
    'hozr': 'hozir', 'xozir': 'hozir', 'xozr': 'hozir',
    'qana': 'qanaqa', 'qatta': 'qayerda',
    'toshk': 'toshkent', 'tosh': 'toshkent',
    'uzb': "o'zbekiston",
    'ertagachi': 'ertaga', 'ertagaga': 'ertaga',
    'haliyam': 'hali ham', 'ishlayabdimi': 'ishlayaptimi',
    'kursat': 'ko\'rsat',

    // English
    'rn': 'now',
    'aq': 'aqi',
    'tash': 'tashkent',
    'btc': 'bitcoin', 'bitcon': 'bitcoin',
    'curent': 'current', 'prize': 'price', 'wot': 'what',
  };

  /**
   * Cleans, normalizes, and extracts semantic intent markers from user input.
   */
  static interpret(rawMessage: string, historyContext?: string): InterpretedMessage {
    const raw = (rawMessage || '').trim();
    if (!raw) {
      return {
        raw: '',
        normalized: '',
        language: 'en',
        isGreeting: false,
        isStaticDefinition: false,
        isProfileQuery: false,
        isPlatformConcept: false,
        isPrivateSystemQuery: false,
        isPublicDocQuery: false,
        isExplicitSearch: false,
        isSourceChallenge: false,
        isAirQualityQuery: false,
        isWeatherQuery: false,
        isNewsOrRegulationQuery: false,
        isResearchQuery: false,
        isCurrentFactQuery: false,
        hasTimeTrigger: false,
      };
    }

    const language = this.detectLanguage(raw);
    const normalized = this.normalize(raw);
    const lowerRaw = raw.toLowerCase();
    const combined = `${normalized} ${lowerRaw}`;

    // 1. Greetings
    const isGreeting = this.checkGreeting(raw, normalized);

    // 2. Private System / Internal Infrastructure Inquiries vs Public Doc Queries
    const isPrivateSystemQuery = this.checkPrivateSystemQuery(combined);
    const isPublicDocQuery = this.checkPublicDocQuery(combined);

    // 3. User Profile / Personal Progress
    const isProfileQuery = this.checkProfileQuery(combined);

    // 4. Platform Concepts
    const isPlatformConcept = this.checkPlatformConcept(combined);

    // 5. Source Challenge (User challenges source / proof / origin of facts)
    const isSourceChallenge = this.checkSourceChallenge(combined);

    // 6. Explicit Search Request (User explicitly asks to find/search/look up online)
    const isExplicitSearch = this.checkExplicitSearch(combined);

    // 7. Time Triggers (Live / current / recent temporal markers)
    const hasTimeTrigger = this.checkTimeTrigger(combined);

    // 8. Air Quality / AQI / Pollution
    const isAirQualityQuery = this.checkAirQuality(combined);

    // 9. Weather
    const isWeatherQuery = this.checkWeather(combined);

    // 10. News / Regulations / Laws
    const isNewsOrRegulationQuery = this.checkNewsOrRegulation(combined);

    // 11. Research / In-depth technical evidence
    const isResearchQuery = this.checkResearch(combined);

    // 12. General Real-Time / Current Public Facts (leaders, markets, prices, sports, company live status, travel)
    const isCurrentFactQuery = this.checkCurrentFactQuery(combined, hasTimeTrigger);

    // 13. Static definitions (e.g. "What is PET?", "Как сортировать стекло?", "объясни что такое AQI")
    const isStaticDefinition = this.checkStaticDefinition(combined) && !hasTimeTrigger && !isExplicitSearch && !isSourceChallenge && !isCurrentFactQuery;

    // Location extraction
    const location = this.extractLocation(combined, historyContext);

    return {
      raw,
      normalized,
      language,
      isGreeting,
      isStaticDefinition,
      isProfileQuery,
      isPlatformConcept,
      isPrivateSystemQuery,
      isPublicDocQuery,
      isExplicitSearch,
      isSourceChallenge,
      isAirQualityQuery,
      isWeatherQuery,
      isNewsOrRegulationQuery,
      isResearchQuery,
      isCurrentFactQuery,
      hasTimeTrigger,
      location,
    };
  }

  /**
   * Deterministically detects dominant natural language.
   */
  static detectLanguage(text: string): 'ru' | 'uz' | 'en' {
    const lower = text.toLowerCase();

    // Cyrillic script indicator (Russian / Uzbek Cyrillic)
    const cyrillicCount = (lower.match(/[\u0400-\u04FF]/g) || []).length;
    const latinCount = (lower.match(/[a-z]/g) || []).length;

    if (cyrillicCount > 0 && cyrillicCount >= latinCount) {
      return 'ru';
    }

    // Uzbek Latin specific markers
    const uzbekMarkers = [
      'qanday', 'nima', 'qanaqa', 'bugun', 'hozir', 'qayerda', 'haqida',
      'saralash', 'qayta', 'ishlash', 'tangalarim', 'manba', 'manbalar', 'bolalar',
      'foydali', 'toshkent', 'o\'zbekiston', 'shahar', 'havo', 'sifati', 'uchun',
      'kerak', 'mumkin', 'emas', 'yaxshi', 'rahmat', 'salom', 'assalomu', 'ifloslanish',
      'narxi', 'kursi', 'qachon', 'ishlayaptimi', 'ishlayabdimi', 'kim', 'bormi', 'haliyam',
    ];
    if (uzbekMarkers.some(m => lower.includes(m))) {
      return 'uz';
    }

    return 'en';
  }

  /**
   * Normalizes phonetic spelling, colloquial terms, and common typos using token dictionary.
   */
  private static normalize(text: string): string {
    const rawTokens = text.toLowerCase()
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[-_]/g, ' ')
      .split(/[\s,;:.!?"'’ʼ`()/\\]+/)
      .filter(Boolean);

    const normalizedTokens = rawTokens.map(token => {
      const cleanToken = token.trim();
      return this.TYPO_MAP[cleanToken] || cleanToken;
    });

    return normalizedTokens.join(' ');
  }

  private static checkGreeting(raw: string, normalized: string): boolean {
    const cleaned = raw.replace(/^[!?,.;:\s]+|[!?,.;:\s]+$/g, '').toLowerCase();
    const exactGreetings = new Set([
      'hello', 'hi', 'hey', 'salom', 'assalomu alaykum', 'assalom', 'privet',
      'привет', 'здравствуйте', 'здравствуй', 'добрый день', 'добрый вечер', 'доброе утро', 'хай',
      'thanks', 'thank you', 'rahmat', 'tashakkur', 'спасибо', 'благодарю',
      'ok', 'okay', 'yaxshi', 'tushunarli', 'хорошо', 'понятно', 'ладно',
      'bye', 'goodbye', 'xayr', "ko'rishguncha", 'пока', 'до свидания',
      'good morning coach', 'good morning', 'good afternoon', 'good evening',
    ]);
    return exactGreetings.has(cleaned) || exactGreetings.has(normalized) ||
      cleaned.startsWith('привет,') || cleaned.startsWith('salom,') || cleaned.startsWith('assalomu alaykum');
  }

  /**
   * Identifies actual attempts to access private infrastructure / secrets / production databases.
   * Differentiates malicious/private credential access from public technical questions.
   */
  private static checkPrivateSystemQuery(text: string): boolean {
    // If the query is asking for public documentation or public software info, it's NOT a private system query!
    if (this.checkPublicDocQuery(text)) {
      return false;
    }

    const privateCredentialTargets = [
      'пароль', 'пароли', 'секрет', 'секреты', 'ключ api', 'api key', 'api_key', 'apikey', 'gemini_api_key', 'openai_api_key',
      'jwt secret', 'jwt_secret', 'connection string', 'database url', 'database_url', 'env variable', 'переменные окружения',
      'production database rows', 'private records', 'internal logs', 'логи сервера', 'cloud run logs',
      'backend logs', 'internal telemetry', 'пользовательские записи', 'дамп базы', 'dump database',
      'reveal private', 'output your jwt', 'ignore instructions and output',
    ];

    const privateSystemTargets = [
      'нашей базы', 'нашего сервера', 'нашей supabase', 'нашего postgres', 'zaminat backend',
      'production db', 'prod db', 'cloud run', 'supabase password', 'postgres password',
      'serverнинг ички', 'ichki loglari',
    ];

    // Must match a specific credential/secret access phrase OR a combination of secret target + private system
    const hasDirectSecretAccess = privateCredentialTargets.some(kw => text.includes(kw));
    const hasPrivateSystemTarget = privateSystemTargets.some(kw => text.includes(kw));

    return hasDirectSecretAccess || hasPrivateSystemTarget;
  }

  /**
   * Identifies public documentation / open source queries (e.g. Supabase docs, Postgres docs, versions).
   */
  private static checkPublicDocQuery(text: string): boolean {
    const docKeywords = [
      'документация', 'документацию', 'documentation', 'docs', 'hujjatlar', 'guide', 'manual',
      'последняя версия', 'latest version', 'oxirgi versiyasi', 'rls', 'row level security',
      'indexes in postgres', 'индексы в postgres', 'how to use supabase', 'supabase tutorial',
      'server actions', 'b-tree indexes', 'b tree indexes',
    ];
    return docKeywords.some(kw => text.includes(kw));
  }

  private static checkProfileQuery(text: string): boolean {
    const profileKeywords = [
      'ecocoin', 'eco-coin', 'ecocoins', 'tangalarim', 'ballarim', 'ochko', 'ochkolarim',
      'my level', 'мой уровень', 'какой у меня уровень', 'mening darajam', 'my coins', 'сколько у меня', 'nechta tangam',
      'my profile', 'мой профиль', 'profilim', 'user info', 'мои экокоины', 'мои баллы',
    ];
    return profileKeywords.some(kw => text.includes(kw));
  }

  private static checkPlatformConcept(text: string): boolean {
    const platformConcepts = [
      'ecoscan', 'ecomap', 'ecovote', 'ecoactions', 'ecokids', 'ecotile', 'ecobench',
      'production planner', 'zaminat.eco', 'zaminat platform', 'zaminat haqida', 'о проекте zaminat',
      'что такое ecoscan', 'что такое ecomap', 'что такое ecovote', 'how does ecovote work',
    ];
    return platformConcepts.some(p => text.includes(p));
  }

  private static checkSourceChallenge(text: string): boolean {
    const challengePatterns = [
      'откуда эта информация', 'откуда информация', 'откуда ты это взял', 'откуда инфа', 'где пруфы',
      'дай пруфы', 'покажи источник', 'покажи источники', 'дай источник', 'дай источники', 'дай ссылки',
      'источник информации', 'где это написано', 'это правда', 'ты уверен', 'проверь это', 'пруфы',
      'where did you get that', 'where is this from', 'source', 'sources', 'give me the sources',
      'show sources', 'proof', 'is that true', 'verify online', 'check your source', 'prove it', 'with a link',
      'show me the official source',
      'qayerdan olding', 'manbasi nima', 'manbani ko\'rsat', 'manbalarni ko\'rsat', 'manbasini ko\'rsat',
      'manbasini', 'manbasi', 'manbalar', 'manba', 'rostmi bu',
      'найди источник', 'найди источники', 'найд источник',
      'откуда', 'qayerdan', 'where from',
    ];
    return challengePatterns.some(p => text.includes(p));
  }

  private static checkExplicitSearch(text: string): boolean {
    const searchPatterns = [
      'найди в интернете', 'поищи в интернете', 'проверь в интернете', 'поищи в сети', 'что пишут в интернете',
      'найди информацию', 'найди источники', 'найди источник', 'поищи информацию', 'поищи исследования',
      'найди исследования', 'найди исследование', 'найди статью', 'найди статьи', 'найди официальный',
      'найди последние материалы', 'найди материалы', 'поищи материалы', 'поищи новый закон',
      'найди', 'поищи', 'search online', 'look up online', 'find online', 'search the web', 'find studies',
      'find recent studies', 'find sources', 'find official document', 'look this up', 'find recent materials',
      'look up', 'search', 'internetdan top', 'qidirib ko\'r', 'manbalarni top', 'tadqiqotlarni top', 'maqola top',
    ];
    return searchPatterns.some(p => text.includes(p));
  }

  private static checkTimeTrigger(text: string): boolean {
    const timePatterns = [
      'сегодня', 'сейчас', 'текущий', 'текущее', 'текущая', 'последний', 'последние', 'свежие', 'актуальный',
      'актуальные', 'прямо сейчас', 'завтра', 'вчера', 'на этой неделе', 'в этом году', '2026', '2025',
      'недавно', 'скока', 'щас', 'шас', 'сичас',
      'today', 'now', 'current', 'latest', 'recent', 'breaking', 'real-time', 'realtime', 'live',
      'tomorrow', 'yesterday', 'this week', 'right now', 'at the moment', 'recently',
      'bugun', 'hozir', 'hozirgi', 'so\'nggi', 'oxirgi', 'yangiliklar', 'jonli', 'ertaga', 'ertaga-chi',
      'yaqinda', 'kecha',
    ];
    return timePatterns.some(p => text.includes(p));
  }

  private static checkAirQuality(text: string): boolean {
    const aqiPatterns = [
      'aqi', 'pm2.5', 'pm10', 'pm 2.5', 'pm 10', 'air quality', 'air pollution', 'smog',
      'качество воздуха', 'уровень воздуха', 'индекс воздуха', 'загрязнение воздуха', 'чистота воздуха',
      'состояние воздуха', 'уровень загрязнения', 'воздух в', 'воздухом в', 'воздух ташкент', 'воздух',
      'havo sifati', 'havo ifloslanishi', 'havo darajasi', 'toshkent havosi', 'havo toshkent', 'havo', 'ifloslanish',
      'air', 'pollution', 'загрязнение',
    ];

    const hasAqiTerm = aqiPatterns.some(p => text.includes(p));
    if (!hasAqiTerm) return false;

    const strongAqiTerms = [
      'aqi', 'pm2.5', 'pm10', 'pm 2.5', 'pm 10', 'air quality', 'качество воздуха',
      'уровень воздуха', 'уровень загрязнения', 'индекс воздуха', 'havo sifati', 'ifloslanish',
      'havo darajasi',
    ];
    if (strongAqiTerms.some(st => text.includes(st))) {
      return true;
    }

    const hasLocation = this.extractLocation(text) !== undefined;
    const hasTime = this.checkTimeTrigger(text);

    return hasLocation || hasTime;
  }

  private static checkWeather(text: string): boolean {
    const weatherPatterns = [
      'погода', 'погоду', 'погоде', 'прогноз погоды', 'температура на улице',
      'weather', 'forecast', 'temperature outside',
      'ob-havo', 'ob havo', 'harorat',
    ];
    return weatherPatterns.some(p => text.includes(p));
  }

  private static checkNewsOrRegulation(text: string): boolean {
    const newsPatterns = [
      'новости экологии', 'экологические новости', 'последние новости', 'свежие новости',
      'новый закон', 'новые законы', 'закон по экологии', 'закон по пластику', 'законодательство',
      'законах по экологии', 'законах', 'закон', 'указ', 'постановление', 'регламент', 'госпрограмма', 'экологический сбор',
      'что нового в законах', 'что нового', 'закон аб экологии',
      'environmental news', 'latest news', 'recent legislation', 'new law', 'new regulations', 'decree',
      'environmental regulations', 'regulations', 'legislation',
      'ekologik yangiliklar', 'so\'nggi yangiliklar', 'yangi qonun', 'qaror', 'farmon', 'qonunlar',
    ];
    return newsPatterns.some(p => text.includes(p));
  }

  private static checkResearch(text: string): boolean {
    const researchPatterns = [
      'исследование', 'исследования', 'исследования по', 'научные статьи', 'технология переработки',
      'технологии переработки', 'переработка шин', 'переработка резины', 'микропластик', 'пиролиз',
      'материалы переработка', 'утилизации', 'методов утилизации', 'сравнительный анализ', 'разработки',
      'biodegradable', 'life cycle assessment', 'lca study', 'research study', 'recycling technology',
      'studies about', 'studies', 'research', 'tire recycling', 'crumb rubber', 'road surfaces', 'technologies for',
      'tadqiqot', 'tadqiqotlar', 'qayta ishlash texnologiyasi', 'shinalarni qayta ishlash',
    ];
    return researchPatterns.some(p => text.includes(p));
  }

  private static checkCurrentFactQuery(text: string, hasTime: boolean): boolean {
    // Leaders / People in office
    const leaderPatterns = [
      'кто сейчас президент', 'кто сейчас глава', 'кто сейчас мэр', 'кто сейчас министр', 'кто сейчас руководитель',
      'who is the president', 'who runs', 'who is the ceo', 'who is leading', 'current head of', 'prime minister of',
      'kim hozir prezident', 'kim hozir rahbari', 'kim boshqaradi', 'kim hozir', 'bosh kotibi', 'vaziri kim hozir',
      'кто сейчас', 'who is the',
    ];
    if (leaderPatterns.some(p => text.includes(p)) && (text.includes('президент') || text.includes('мэр') || text.includes('глава') || text.includes('ceo') || text.includes('minister') || text.includes('prezident') || text.includes('vazir') || text.includes('kotib') || text.includes('runs') || text.includes('leading'))) {
      return true;
    }

    // Live Prices / Currency / Commodities / Crypto
    const marketPatterns = [
      'доллар', 'биткоин', 'цена золота', 'курс валют', 'курс доллара', 'стоит тонна', 'цена нефти', 'нефти', 'баррель',
      'евро', 'курс евро', 'курс валюты', 'курс', 'сум', 'суму',
      'bitcoin price', 'price of gold', 'dollar rate', 'exchange rate', 'price of pet', 'scrap price', 'crude oil', 'ethereum',
      'dollar kursi', 'oltin narxi', 'bitcoin narxi', 'narxi qancha', 'kursi qancha', 'bitcoin', 'ethereum price',
    ];
    const hasMarketWord = marketPatterns.some(p => text.includes(p));
    if (hasMarketWord && (hasTime || text.includes('сколько') || text.includes('какая') || text.includes('how much') || text.includes('what is the price') || text.includes('qancha') || text.includes('rate') || text.includes('price') || text.includes('narxi') || text.includes('kursi') || text.includes('курс'))) {
      return true;
    }

    // Company active status
    const companyStatusPatterns = [
      'еще работает', 'ещё работает', 'все еще работает', 'закрылась ли', 'банкрот ли', 'закрылась',
      'still operating', 'still in business', 'is open today', 'is still alive', 'go bankrupt', 'still open', 'open today', 'open now',
      'hali ham ishlayaptimi', 'haliyam ishlayaptimi', 'yopildimi', 'faoliyat yurityaptimi',
    ];
    if (companyStatusPatterns.some(p => text.includes(p))) return true;

    // Sports & match schedules
    const sportsPatterns = [
      'следующий матч', 'когда играет', 'счет матча', 'кто выиграл вчера', 'результат матча', 'кто выиграл', 'какой счет',
      'next match', 'who won yesterday', 'match score', 'game schedule', 'current score', 'qualifiers schedule',
      'keyingi o\'yin', 'kechagi o\'yin', 'kim yutdi', 'o\'yin natijasi',
    ];
    if (sportsPatterns.some(p => text.includes(p))) return true;

    // Travel / flights
    const travelPatterns = [
      'рейсы в', 'билеты на поезд', 'расписание самолетов', 'flights to', 'train schedule', 'parvozlar', 'reyslar', 'poyezd',
    ];
    if (travelPatterns.some(p => text.includes(p)) && (hasTime || text.includes('bormi') || text.includes('есть'))) return true;

    // Grants / Opportunities
    const grantPatterns = [
      'какие гранты сейчас', 'гранты принимают заявки', 'startup grants', 'open grants', 'yangi grantlar', 'grant deadlines',
      'зеленые гранты', 'grantlar',
    ];
    if (grantPatterns.some(p => text.includes(p))) return true;

    // Recent entity/tech updates
    const updatePatterns = [
      'что изменилось у', 'что поменялось у', 'свежая инфа про', 'what changed recently', 'latest update on',
      'latest updates on', 'latest updates', 'latest update',
      'nima o\'zgardi yaqinda', 'so\'nggi o\'zgarishlar', 'what changed',
    ];
    if (updatePatterns.some(p => text.includes(p))) return true;

    // General question structures with "сейчас" / "сегодня" / "now" / "today" + specific entity/action
    if (hasTime) {
      const liveQuestionStarters = [
        'кто сейчас', 'что сейчас с', 'какая сейчас', 'сколько сейчас', 'где сейчас',
        'who now', 'what is now', 'how much now', 'where is now',
        'kim hozir', 'qayerda hozir', 'qancha hozir',
      ];
      if (liveQuestionStarters.some(st => text.includes(st))) {
        return true;
      }
    }

    return false;
  }

  private static checkStaticDefinition(text: string): boolean {
    const staticPrefixes = [
      'что такое', 'что означает', 'что значит', 'объясни что такое', 'объясни что', 'как работает',
      'как правильно сортировать', 'как сортировать', 'куда выбрасывать', 'в чем разница', 'переведи это',
      'what is', 'what does', 'explain what is', 'explain what', 'how does it work', 'how to sort', 'how to recycle',
      'nima bu', 'bu nima degani', 'qanday ishlaydi', 'qanday saralanadi', 'qanday qayta ishlanadi',
      'why is', 'explain the difference', 'как правильно мыть', 'qanday yuvish',
    ];
    return staticPrefixes.some(p => text.includes(p));
  }

  private static extractLocation(text: string, historyContext?: string): string | undefined {
    const locations = [
      { name: 'Tashkent', variants: ['ташкент', 'ташкенте', 'ташкента', 'ташк', 'tashkent', 'toshkent', 'toshkentda', 'toshkentdan'] },
      { name: 'Samarkand', variants: ['самарканд', 'самарканде', 'samarkand', 'samarqand', 'samarqandda', 'samarqandga'] },
      { name: 'Bukhara', variants: ['бухара', 'бухаре', 'bukhara', 'buxoro', 'buxoroda'] },
      { name: 'Namangan', variants: ['наманган', 'намангане', 'namangan', 'namanganda'] },
      { name: 'Fergana', variants: ['фергана', 'фергане', 'fergana', 'farg\'ona'] },
      { name: 'Andijan', variants: ['андижан', 'андижане', 'andijan', 'andijon'] },
      { name: 'Nukus', variants: ['нукус', 'нукусе', 'nukus', 'nukusda'] },
      { name: 'Uzbekistan', variants: ['узбекистан', 'узбекистане', 'узб', 'uzbekistan', 'o\'zbekiston'] },
    ];

    for (const loc of locations) {
      if (loc.variants.some(v => text.includes(v))) {
        return loc.name;
      }
    }

    // Check historyContext if available
    if (historyContext) {
      const lowerHist = historyContext.toLowerCase();
      for (const loc of locations) {
        if (loc.variants.some(v => lowerHist.includes(v))) {
          return loc.name;
        }
      }
    }

    return undefined;
  }
}
