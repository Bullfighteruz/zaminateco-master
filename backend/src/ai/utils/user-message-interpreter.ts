import { InterpretedMessage } from './search-types';

export class UserMessageInterpreter {
  private static readonly TYPO_MAP: Record<string, string> = {
    // Russian
    'севодня': 'сегодня', 'седня': 'сегодня', 'сиводня': 'сегодня',
    'щас': 'сейчас', 'шас': 'сейчас', 'сечас': 'сейчас', 'сейчс': 'сейчас',
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

    // Uzbek
    'hozr': 'hozir', 'xozir': 'hozir', 'xozr': 'hozir',
    'qana': 'qanaqa',
    'toshk': 'toshkent', 'tosh': 'toshkent',
    'uzb': "o'zbekiston",
    'ertagachi': 'ertaga',

    // English
    'rn': 'now',
    'aq': 'aqi',
    'tash': 'tashkent',
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
        isExplicitSearch: false,
        isSourceChallenge: false,
        isAirQualityQuery: false,
        isWeatherQuery: false,
        isNewsOrRegulationQuery: false,
        isResearchQuery: false,
        hasTimeTrigger: false,
      };
    }

    const language = this.detectLanguage(raw);
    const normalized = this.normalize(raw);
    const lowerRaw = raw.toLowerCase();
    const combined = `${normalized} ${lowerRaw}`;

    // 1. Greetings
    const isGreeting = this.checkGreeting(raw, normalized);

    // 2. Private System / Internal Infrastructure Inquiries (never web search)
    const isPrivateSystemQuery = this.checkPrivateSystemQuery(combined);

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

    // 12. Static definitions (e.g. "What is PET?", "Как сортировать стекло?", "объясни что такое AQI")
    const isStaticDefinition = this.checkStaticDefinition(combined) && !hasTimeTrigger && !isExplicitSearch && !isSourceChallenge;

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
      isExplicitSearch,
      isSourceChallenge,
      isAirQualityQuery,
      isWeatherQuery,
      isNewsOrRegulationQuery,
      isResearchQuery,
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
      .replace(/[-]/g, ' ')
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
    ]);
    return exactGreetings.has(cleaned) || exactGreetings.has(normalized);
  }

  private static checkPrivateSystemQuery(text: string): boolean {
    const privateKeywords = [
      'supabase', 'postgres', 'database url', 'database_url', 'jwt_secret', 'api_key', 'gemini_api_key',
      'openai_api_key', 'server logs', 'cloud run logs', 'backend logs', 'internal telemetry',
      'пароль базы', 'логи сервера', 'ключ api', 'секретный ключ', 'секреты', 'переменные окружения',
    ];
    return privateKeywords.some(kw => text.includes(kw));
  }

  private static checkProfileQuery(text: string): boolean {
    const profileKeywords = [
      'ecocoin', 'eco-coin', 'ecocoins', 'tangalarim', 'ballarim', 'ochko', 'ochkolarim',
      'my level', 'мой уровень', 'mening darajam', 'my coins', 'сколько у меня', 'nechta tangam',
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
      'qayerdan olding', 'manbasi nima', 'manbani ko\'rsat', 'manbalarni ko\'rsat', 'manbasini ko\'rsat',
      'manbasini', 'manbasi', 'manbalar', 'manba', 'rostmi bu',
      'найди источник', 'найди источники', 'найд источник',
    ];
    return challengePatterns.some(p => text.includes(p));
  }

  private static checkExplicitSearch(text: string): boolean {
    const searchPatterns = [
      'найди в интернете', 'поищи в интернете', 'проверь в интернете', 'поищи в сети', 'что пишут в интернете',
      'найди информацию', 'найди источники', 'найди источник', 'поищи информацию', 'поищи исследования',
      'найди исследования', 'найди исследование', 'найди статью', 'найди статьи', 'найди официальный',
      'найди последние материалы', 'найди материалы', 'поищи материалы', 'поищи новый закон',
      'поищи', 'найди', 'search online', 'look up online', 'find online', 'search the web', 'find studies',
      'find recent studies', 'find sources', 'find official document', 'look this up', 'find recent materials',
      'look up', 'search', 'internetdan top', 'qidirib ko\'r', 'manbalarni top', 'tadqiqotlarni top', 'maqola top',
    ];
    return searchPatterns.some(p => text.includes(p));
  }

  private static checkTimeTrigger(text: string): boolean {
    const timePatterns = [
      'сегодня', 'сейчас', 'текущий', 'текущее', 'текущая', 'последний', 'последние', 'свежие', 'актуальный',
      'актуальные', 'прямо сейчас', 'завтра', 'вчера', 'на этой неделе', 'в этом году', '2026', '2025',
      'today', 'now', 'current', 'latest', 'recent', 'breaking', 'real-time', 'realtime', 'live',
      'tomorrow', 'yesterday', 'this week', 'right now', 'at the moment',
      'bugun', 'hozir', 'hozirgi', 'so\'nggi', 'oxirgi', 'yangiliklar', 'jonli', 'ertaga', 'ertaga-chi',
    ];
    return timePatterns.some(p => text.includes(p));
  }

  private static checkAirQuality(text: string): boolean {
    // Air Quality keywords across RU / UZ / EN
    const aqiPatterns = [
      'aqi', 'pm2.5', 'pm10', 'pm 2.5', 'pm 10', 'air quality', 'air pollution', 'smog',
      'качество воздуха', 'уровень воздуха', 'индекс воздуха', 'загрязнение воздуха', 'чистота воздуха',
      'состояние воздуха', 'уровень загрязнения', 'воздух в', 'воздухом в', 'воздух ташкент', 'воздух',
      'havo sifati', 'havo ifloslanishi', 'havo darajasi', 'toshkent havosi', 'havo toshkent', 'havo', 'ifloslanish',
      'air', 'pollution', 'загрязнение',
    ];

    const hasAqiTerm = aqiPatterns.some(p => text.includes(p));
    if (!hasAqiTerm) return false;

    // Direct strong terms: AQI, PM2.5, "качество воздуха", "уровень воздуха", "уровень загрязнения", "air quality", "havo sifati", "ifloslanish"
    const strongAqiTerms = [
      'aqi', 'pm2.5', 'pm10', 'pm 2.5', 'pm 10', 'air quality', 'качество воздуха',
      'уровень воздуха', 'уровень загрязнения', 'индекс воздуха', 'havo sifati', 'ifloslanish',
    ];
    if (strongAqiTerms.some(st => text.includes(st))) {
      return true;
    }

    // Otherwise requires location or temporal trigger
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
      'что нового в законах', 'что нового',
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

  private static checkStaticDefinition(text: string): boolean {
    const staticPrefixes = [
      'что такое', 'что означает', 'что значит', 'объясни что такое', 'объясни что', 'как работает',
      'как правильно сортировать', 'как сортировать', 'куда выбрасывать', 'в чем разница', 'переведи это',
      'what is', 'what does', 'explain what is', 'explain what', 'how does it work', 'how to sort', 'how to recycle',
      'nima bu', 'bu nima degani', 'qanday ishlaydi', 'qanday saralanadi', 'qanday qayta ishlanadi',
    ];
    return staticPrefixes.some(p => text.includes(p));
  }

  private static extractLocation(text: string, historyContext?: string): string | undefined {
    const locations = [
      { name: 'Tashkent', variants: ['ташкент', 'ташкенте', 'ташкента', 'ташк', 'tashkent', 'toshkent', 'toshkentda'] },
      { name: 'Samarkand', variants: ['самарканд', 'самарканде', 'samarkand', 'samarqand', 'samarqandda'] },
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
