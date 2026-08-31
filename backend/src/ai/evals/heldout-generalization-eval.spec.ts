import { SearchRouter, SearchMode, SearchReason } from '../utils/search-router';

interface HeldOutTestCase {
  id: string;
  category: string;
  query: string;
  expectedSearch: boolean;
  expectedMode: SearchMode;
  notes?: string;
  history?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
}

const HELDOUT_TEST_CASES: HeldOutTestCase[] = [
  // 1. Current Public People / Leaders (10 cases)
  { id: 'H01', category: 'current_public_people', query: 'кто сейчас президент Франции', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H02', category: 'current_public_people', query: 'who is the current CEO of Apple?', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H03', category: 'current_public_people', query: 'Fransiya prezidenti kim hozir', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H04', category: 'current_public_people', query: 'кто сейчас мэр Лондона', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H05', category: 'current_public_people', query: 'who is the prime minister of UK right now', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H06', category: 'current_public_people', query: 'kim hozir BMT bosh kotibi', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H07', category: 'current_public_people', query: 'кто сейчас глава OpenAI', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H08', category: 'current_public_people', query: 'who runs Google at the moment', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H09', category: 'current_public_people', query: 'O\'zbekiston ekologiya vaziri kim hozir', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H10', category: 'current_public_people', query: 'who is leading the UN climate summit this year', expectedSearch: true, expectedMode: SearchMode.REQUIRED },

  // 2. Markets, Crypto & Commodity Prices (10 cases)
  { id: 'H11', category: 'markets_prices', query: 'биток сегодня сколько', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H12', category: 'markets_prices', query: 'how much is Bitcoin today in USD', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H13', category: 'markets_prices', query: 'dollar kursi bugun qancha', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H14', category: 'markets_prices', query: 'какая сейчас цена золота за грамм', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H15', category: 'markets_prices', query: 'current price of crude oil per barrel', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H16', category: 'markets_prices', query: 'сколько сейчас стоит тонна PET пластика', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H17', category: 'markets_prices', query: 'bugungi oltin narxi qancha', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H18', category: 'markets_prices', query: 'scrap copper price per kg today', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H19', category: 'markets_prices', query: 'курс евро к суму на сегодня', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H20', category: 'markets_prices', query: 'what is the current Ethereum price live', expectedSearch: true, expectedMode: SearchMode.REQUIRED },

  // 3. Company Operating & Active Status (8 cases)
  { id: 'H21', category: 'companies_status', query: 'эта компания еще работает?', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H22', category: 'companies_status', query: 'is this company still operating in 2026?', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H23', category: 'companies_status', query: 'bu kompaniya hali ham ishlayaptimi', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H24', category: 'companies_status', query: 'закрылась ли сеть магазинов?', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H25', category: 'companies_status', query: 'is the local recycling plant still open today', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H26', category: 'companies_status', query: 'haliyam faoliyat yurityaptimi bu tashkilot', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H27', category: 'companies_status', query: 'все еще работает этот сервис?', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H28', category: 'companies_status', query: 'did this startup go bankrupt recently?', expectedSearch: true, expectedMode: SearchMode.REQUIRED },

  // 4. Sports & Live Match Results (8 cases)
  { id: 'H29', category: 'sports_events', query: 'когда следующий матч сборной Узбекистана', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H30', category: 'sports_events', query: 'who won yesterday\'s Champions League match', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H31', category: 'sports_events', query: 'keyingi o\'yin qachon bo\'ladi', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H32', category: 'sports_events', query: 'кто выиграл вчера в финале', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H33', category: 'sports_events', query: 'kechagi o\'yin natijasi qanday bo\'ldi', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H34', category: 'sports_events', query: 'what is the current score of the match live', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H35', category: 'sports_events', query: 'какой счет в матче прямо сейчас', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H36', category: 'sports_events', query: 'next World Cup qualifiers schedule', expectedSearch: true, expectedMode: SearchMode.REQUIRED },

  // 5. Travel & Live Flight Schedules (6 cases)
  { id: 'H37', category: 'travel_flights', query: 'есть сегодня рейсы в Стамбул?', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H38', category: 'travel_flights', query: 'are there direct flights to Dubai today', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H39', category: 'travel_flights', query: 'bugun Toshkentdan parvozlar bormi', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H40', category: 'travel_flights', query: 'расписание самолетов из Ташкента на сегодня', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H41', category: 'travel_flights', query: 'train schedule to Samarkand for tomorrow', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H42', category: 'travel_flights', query: 'ertaga Samarqandga poyezd bormi', expectedSearch: true, expectedMode: SearchMode.REQUIRED },

  // 6. Grants & Funding Opportunities (6 cases)
  { id: 'H43', category: 'grants_opportunities', query: 'какие гранты сейчас принимают заявки', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H44', category: 'grants_opportunities', query: 'open climate startup grants in Central Asia', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H45', category: 'grants_opportunities', query: 'hozir qaysi ekologik grantlar ochiq', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H46', category: 'grants_opportunities', query: 'зеленые гранты для стартапов в Узбекистане 2026', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H47', category: 'grants_opportunities', query: 'latest European youth environmental grant deadlines', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H48', category: 'grants_opportunities', query: 'yoshlar uchun yangi grantlar bormi', expectedSearch: true, expectedMode: SearchMode.REQUIRED },

  // 7. Technology Updates & Recent Releases (6 cases)
  { id: 'H49', category: 'technology_updates', query: 'что изменилось у Google недавно', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H50', category: 'technology_updates', query: 'what changed recently in Node.js LTS releases', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H51', category: 'technology_updates', query: 'Google tizimida nima o\'zgardi yaqinda', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H52', category: 'technology_updates', query: 'свежая инфа про новые аккумуляторы', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H53', category: 'technology_updates', query: 'latest updates on solid state battery commercialization', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H54', category: 'technology_updates', query: 'sun\'iy intellekt sohasidagi so\'nggi o\'zgarishlar', expectedSearch: true, expectedMode: SearchMode.REQUIRED },

  // 8. Public Software Documentation Inquiries (6 cases)
  { id: 'H55', category: 'public_software_docs', query: 'найди документацию Supabase по RLS', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H56', category: 'public_software_docs', query: 'find Postgres documentation on B-tree indexes', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H57', category: 'public_software_docs', query: 'какая последняя версия PostgreSQL?', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H58', category: 'public_software_docs', query: 'PostgreSQL oxirgi versiyasi qaysi', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H59', category: 'public_software_docs', query: 'React 19 Server Actions official documentation guide', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H60', category: 'public_software_docs', query: 'Supabase RLS hujjatlarini top', expectedSearch: true, expectedMode: SearchMode.REQUIRED },

  // 9. Novel Misspellings & Slang (Not in static dictionary) (8 cases)
  { id: 'H61', category: 'novel_misspellings', query: 'кто сичас призидент франции', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H62', category: 'novel_misspellings', query: 'паследний закон аб экологии узб', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H63', category: 'novel_misspellings', query: 'haliyam ishlayabdimi bu korxona', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H64', category: 'novel_misspellings', query: 'qatta poyezd reyslari bor ertagaga', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H65', category: 'novel_misspellings', query: 'скока сиводня стоит барель нефти', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H66', category: 'novel_misspellings', query: 'wot is curent bitcon prize rn', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H67', category: 'novel_misspellings', query: 'найди дакуминтацию по постгрес', expectedSearch: true, expectedMode: SearchMode.REQUIRED },
  { id: 'H68', category: 'novel_misspellings', query: 'bugungi havo darajasini kursat', expectedSearch: true, expectedMode: SearchMode.REQUIRED },

  // 10. Contextual Source Provenance Challenges (6 cases)
  {
    id: 'H69',
    category: 'contextual_source_provenance',
    query: 'откуда эта информация?',
    expectedSearch: false,
    expectedMode: SearchMode.INTERNAL_ONLY,
    notes: 'Prior turn was user account EcoCoins',
    history: [
      { role: 'user', parts: [{ text: 'Сколько у меня EcoCoins?' }] },
      { role: 'model', parts: [{ text: 'В вашем профиле сейчас 250 EcoCoins.' }] },
    ],
  },
  {
    id: 'H70',
    category: 'contextual_source_provenance',
    query: 'qayerdan olding bu ma\'lumotni?',
    expectedSearch: false,
    expectedMode: SearchMode.INTERNAL_ONLY,
    notes: 'Prior turn was user profile level',
    history: [
      { role: 'user', parts: [{ text: 'Mening darajam qanday?' }] },
      { role: 'model', parts: [{ text: 'Siz 3-darajali Eco-Hero siz, 450 ballingiz bor.' }] },
    ],
  },
  {
    id: 'H71',
    category: 'contextual_source_provenance',
    query: 'где это написано?',
    expectedSearch: false,
    expectedMode: SearchMode.INTERNAL_ONLY,
    notes: 'Prior turn was ZAMINAT platform EcoScan guide',
    history: [
      { role: 'user', parts: [{ text: 'Как работает EcoScan?' }] },
      { role: 'model', parts: [{ text: 'EcoScan распознает пластик, стекло и бумагу по фотографии.' }] },
    ],
  },
  {
    id: 'H72',
    category: 'contextual_source_provenance',
    query: 'откуда ты это взял?',
    expectedSearch: true,
    expectedMode: SearchMode.REQUIRED,
    notes: 'Prior turn was external AQI factual claim',
    history: [
      { role: 'user', parts: [{ text: 'Какой сейчас AQI в Ташкенте?' }] },
      { role: 'model', parts: [{ text: 'В Ташкенте сейчас индекс качества воздуха составляет 112 (PM2.5).' }] },
    ],
  },
  {
    id: 'H73',
    category: 'contextual_source_provenance',
    query: 'show me the official source for this',
    expectedSearch: true,
    expectedMode: SearchMode.REQUIRED,
    notes: 'Prior turn was external environmental law claim',
    history: [
      { role: 'user', parts: [{ text: 'Tell me about the new single-use plastic ban' }] },
      { role: 'model', parts: [{ text: 'A new decree was passed banning thin plastic bags.' }] },
    ],
  },
  {
    id: 'H74',
    category: 'contextual_source_provenance',
    query: 'manbasini ko\'rsat',
    expectedSearch: true,
    expectedMode: SearchMode.REQUIRED,
    notes: 'Prior turn was external tyre recycling research',
    history: [
      { role: 'user', parts: [{ text: 'Shinalarni asfaltga qo\'shish samaralimi?' }] },
      { role: 'model', parts: [{ text: 'Tadqiqotlar shuni ko\'rsatadiki, rezina qo\'shilgan asfalt 30% uzoqroq xizmat qiladi.' }] },
    ],
  },

  // 11. Static Concepts, Definitions & Conversational Greetings (Held-out Negatives) (12 cases)
  { id: 'H75', category: 'static_and_greetings', query: 'Assalomu alaykum Zami Bot', expectedSearch: false, expectedMode: SearchMode.NOT_NEEDED },
  { id: 'H76', category: 'static_and_greetings', query: 'Привет, как настроение?', expectedSearch: false, expectedMode: SearchMode.NOT_NEEDED },
  { id: 'H77', category: 'static_and_greetings', query: 'Good morning coach!', expectedSearch: false, expectedMode: SearchMode.NOT_NEEDED },
  { id: 'H78', category: 'static_and_greetings', query: 'Что такое полиэтилен высокого давления LDPE?', expectedSearch: false, expectedMode: SearchMode.NOT_NEEDED },
  { id: 'H79', category: 'static_and_greetings', query: 'Polipropilen (PP) plastigi nima?', expectedSearch: false, expectedMode: SearchMode.NOT_NEEDED },
  { id: 'H80', category: 'static_and_greetings', query: 'Explain the difference between HDPE and PVC', expectedSearch: false, expectedMode: SearchMode.NOT_NEEDED },
  { id: 'H81', category: 'static_and_greetings', query: 'Как правильно мыть пластиковые бутылки перед сдачей?', expectedSearch: false, expectedMode: SearchMode.NOT_NEEDED },
  { id: 'H82', category: 'static_and_greetings', query: 'Plastik idishlarni topshirishdan oldin qanday yuvish kerak?', expectedSearch: false, expectedMode: SearchMode.NOT_NEEDED },
  { id: 'H83', category: 'static_and_greetings', query: 'Why is composting good for soil quality?', expectedSearch: false, expectedMode: SearchMode.NOT_NEEDED },
  { id: 'H84', category: 'static_and_greetings', query: 'Спасибо за полезный совет!', expectedSearch: false, expectedMode: SearchMode.NOT_NEEDED },
  { id: 'H85', category: 'static_and_greetings', query: 'Katta rahmat yordamingiz uchun', expectedSearch: false, expectedMode: SearchMode.NOT_NEEDED },
  { id: 'H86', category: 'static_and_greetings', query: 'What is the concept of closed-loop recycling?', expectedSearch: false, expectedMode: SearchMode.NOT_NEEDED },
];

describe('Held-Out Generalization Evaluation (86 Unseen Test Cases)', () => {
  it(`should evaluate all ${HELDOUT_TEST_CASES.length} held-out cases with >= 98% accuracy`, () => {
    let passedCount = 0;
    const failures: Array<{ id: string; query: string; expected: boolean; actual: boolean; mode: string }> = [];

    for (const testCase of HELDOUT_TEST_CASES) {
      const result = SearchRouter.evaluate(testCase.query, testCase.history as any);

      const matchesSearch = result.shouldSearch === testCase.expectedSearch;
      const matchesMode = testCase.expectedMode === SearchMode.REQUIRED || testCase.expectedMode === SearchMode.PREFERRED
        ? (result.searchMode === SearchMode.REQUIRED || result.searchMode === SearchMode.PREFERRED)
        : (result.searchMode === SearchMode.NOT_NEEDED || result.searchMode === SearchMode.INTERNAL_ONLY);

      if (matchesSearch && matchesMode) {
        passedCount++;
      } else {
        failures.push({
          id: testCase.id,
          query: testCase.query,
          expected: testCase.expectedSearch,
          actual: result.shouldSearch,
          mode: result.searchMode,
        });
      }
    }

    const accuracyPct = ((passedCount / HELDOUT_TEST_CASES.length) * 100).toFixed(2);
    // eslint-disable-next-line no-console
    console.log(`\n========================================`);
    // eslint-disable-next-line no-console
    console.log(`HELD-OUT EVALUATION SUMMARY:`);
    // eslint-disable-next-line no-console
    console.log(`Total Cases: ${HELDOUT_TEST_CASES.length}`);
    // eslint-disable-next-line no-console
    console.log(`Passed: ${passedCount}/${HELDOUT_TEST_CASES.length} (${accuracyPct}%)`);
    if (failures.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`Failures:\n`, JSON.stringify(failures, null, 2));
    }
    // eslint-disable-next-line no-console
    console.log(`========================================\n`);

    expect(failures).toEqual([]);
    expect(passedCount).toBe(HELDOUT_TEST_CASES.length);
  });
});
