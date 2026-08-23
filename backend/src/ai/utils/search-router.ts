export interface SearchRouteResult {
  shouldSearch: boolean;
  reason: string;
  searchQuery?: string;
}

export class SearchRouter {
  /**
   * Evaluates whether a user message strictly requires real-time / external web search.
   * Conservative policy: Defaults to false for greetings, definitions, follow-ups, internal concepts, and user profile queries.
   */
  static evaluate(message: string): SearchRouteResult {
    const raw = (message || '').trim();
    if (!raw) {
      return { shouldSearch: false, reason: 'EMPTY_MESSAGE' };
    }

    // Strip leading/trailing punctuation and whitespace for pattern matching
    const cleaned = raw.replace(/^[!?,.;:\s]+|[!?,.;:\s]+$/g, '').toLowerCase();

    // 1. Simple Greetings & Conversational pleasantries
    const exactGreetings = new Set([
      'hello', 'hi', 'hey', 'salom', 'assalomu alaykum', 'assalom',
      'привет', 'здравствуйте', 'здравствуй', 'добрый день', 'добрый вечер', 'доброе утро', 'хай',
      'thanks', 'thank you', 'rahmat', 'tashakkur', 'спасибо', 'благодарю',
      'ok', 'okay', 'yaxshi', 'tushunarli', 'хорошо', 'понятно', 'ладно',
      'bye', 'goodbye', 'xayr', "ko'rishguncha", 'пока', 'до свидания',
    ]);

    if (exactGreetings.has(cleaned)) {
      return { shouldSearch: false, reason: 'CONVERSATIONAL_GREETING' };
    }

    // 2. Short follow-up / clarification queries
    const exactFollowUps = new Set([
      'why', 'why so', 'почему', 'зачем', 'отчего', 'nimaga', 'nega', 'sababi nima', 'bu nimaga',
      'what does that mean', 'what does this mean', 'что это значит', 'bu nima degani',
      'explain', 'explain more', 'подробнее', 'объясни', 'tushuntirib ber', 'batafsil',
      'where did you get that', 'откуда информация', 'откуда эта информация', 'qayerdan olding',
    ]);

    if (exactFollowUps.has(cleaned)) {
      return { shouldSearch: false, reason: 'FOLLOW_UP_OR_CLARIFICATION' };
    }

    const lower = raw.toLowerCase();

    // 3. User profile / Progress / Coins / Points
    const profileKeywords = [
      'ecocoin', 'eco-coin', 'ecocoins', 'tangalarim', 'ballarim', 'ochko', 'ochkolarim',
      'my level', 'мой уровень', 'mening darajam', 'my coins', 'сколько у меня', 'nechta tangam',
      'my profile', 'мой профиль', 'profilim', 'user info'
    ];
    if (profileKeywords.some(kw => lower.includes(kw))) {
      return { shouldSearch: false, reason: 'INTERNAL_USER_PROFILE' };
    }

    // 4. Internal ZAMINAT Platform Knowledge & Features (Static Domain)
    const platformConcepts = [
      'ecoscan', 'ecomap', 'ecovote', 'ecoactions', 'ecokids', 'ecotile', 'ecobench',
      'production planner', 'zaminat.eco', 'zaminat platform', 'zaminat haqida', 'о проекте zaminat'
    ];
    const containsPlatform = platformConcepts.some(p => lower.includes(p));

    // 5. Static Educational Concepts & Definitions (unless explicit current-time marker is present)
    const staticDefinitions = [
      'what is', 'что такое', 'nima bu', 'qanday ishlaydi', 'как работает', 'how does',
      'how to recycle', 'как перерабатывать', 'qanday qayta ishlanadi', 'kak pererabatyvat',
      'sortirovka', 'saralash', 'sorting', 'pet', 'hdpe', 'pp', 'ldpe', 'ps', 'pvc',
      'pyrolysis', 'upcycling', 'circular economy', 'tsirkulyar iqtisodiyot', 'циркулярная экономика'
    ];
    const isStaticConcept = staticDefinitions.some(sd => lower.includes(sd));

    // 6. Current / Real-time Temporal Triggers
    const timeTriggers = [
      'today', 'now', 'current', 'latest', 'breaking', 'real-time', 'realtime', 'live', 'recent',
      'сегодня', 'сейчас', 'текущий', 'текущее', 'последний', 'последние', 'свежие', 'актуальный', 'прямо сейчас',
      'bugun', 'hozir', 'hozirgi', "so'nggi", 'oxirgi', 'yangiliklar', 'jonli'
    ];
    const hasTimeTrigger = timeTriggers.some(tt => {
      return lower.includes(tt);
    });

    // 7. Real-Time External Domains (AQI, Weather, Breaking Environmental News, Recent Laws / Regulations)
    const externalRealTimeTopics = [
      'aqi', 'air quality', 'pm2.5', 'pm10', 'pollution', 'weather', 'smog', 'air pollution', 'news',
      'regulation', 'regulations', 'law', 'laws', 'decree', 'policy',
      'качество воздуха', 'загрязнение', 'погода', 'смог', 'индекс воздуха', 'новости', 'закон', 'указ', 'регламент',
      'havo sifati', 'ifloslanish', 'ob-havo', 'qonun', 'qaror', 'yangilik'
    ];
    const hasRealTimeTopic = externalRealTimeTopics.some(topic => lower.includes(topic));

    // Decision Logic:
    // Only search if there is a real-time topic combined with current time markers, or explicit news/law search
    if (hasTimeTrigger && hasRealTimeTopic) {
      return {
        shouldSearch: true,
        reason: 'REAL_TIME_TOPIC_WITH_TEMPORAL_TRIGGER',
        searchQuery: raw.slice(0, 150),
      };
    }

    // Explicit request for latest news/recent statistics
    if (
      lower.includes('latest') && (lower.includes('news') || lower.includes('stats') || lower.includes('data')) ||
      lower.includes('последние новости') ||
      lower.includes('oxirgi yangiliklar') ||
      lower.includes('breaking news') ||
      lower.includes('recent statistics') ||
      lower.includes('статистика за')
    ) {
      return {
        shouldSearch: true,
        reason: 'EXPLICIT_NEWS_OR_STATS_SEARCH',
        searchQuery: raw.slice(0, 150),
      };
    }

    // Explicit request for current AQI/pollution in specific city
    if ((lower.includes('aqi') || lower.includes('качество воздуха') || lower.includes('havo sifati')) && (lower.includes('tashkent') || lower.includes('ташкент') || lower.includes('toshkent') || lower.includes('samarkand') || lower.includes('самарканд'))) {
      return {
        shouldSearch: true,
        reason: 'SPECIFIC_CITY_AQI_QUERY',
        searchQuery: raw.slice(0, 150),
      };
    }

    // If it's a static concept or platform concept without explicit real-time intent -> No search
    if (containsPlatform) {
      return { shouldSearch: false, reason: 'ZAMINAT_PLATFORM_CONCEPT' };
    }

    if (isStaticConcept && !hasTimeTrigger) {
      return { shouldSearch: false, reason: 'STATIC_EDUCATIONAL_CONCEPT' };
    }

    // Default policy: Conservative, no search
    return { shouldSearch: false, reason: 'DEFAULT_CONSERVATIVE_NO_SEARCH' };
  }
}
