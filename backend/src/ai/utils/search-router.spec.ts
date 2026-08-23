import { SearchRouter } from './search-router';

describe('SearchRouter Unit Tests', () => {
  describe('Gate 4 Mandatory Negative Test Matrix (must NOT trigger search)', () => {
    it.each([
      ['why?', 'FOLLOW_UP_OR_CLARIFICATION'],
      ['почему?', 'FOLLOW_UP_OR_CLARIFICATION'],
      ['nimaga?', 'FOLLOW_UP_OR_CLARIFICATION'],
      ['What is EcoScan?', 'ZAMINAT_PLATFORM_CONCEPT'],
      ['Что такое PET?', 'STATIC_EDUCATIONAL_CONCEPT'],
    ])('should NOT search for negative prompt: "%s"', (msg, expectedReason) => {
      const result = SearchRouter.evaluate(msg);
      expect(result.shouldSearch).toBe(false);
      expect(result.reason).toBe(expectedReason);
    });
  });

  describe('Conversational Greetings (should NOT trigger search)', () => {
    it.each([
      'hello',
      'hi',
      'hey',
      'salom',
      'assalomu alaykum',
      'привет',
      'здравствуйте',
      'добрый день',
      'thanks',
      'rahmat',
      'спасибо',
      'ok',
      'yaxshi',
      'хорошо',
    ])('should NOT search for greeting: "%s"', (msg) => {
      const result = SearchRouter.evaluate(msg);
      expect(result.shouldSearch).toBe(false);
      expect(result.reason).toBe('CONVERSATIONAL_GREETING');
    });
  });

  describe('Follow-up and Clarification (should NOT trigger search)', () => {
    it.each([
      'why?',
      'why',
      'почему?',
      'почему',
      'зачем',
      'nimaga?',
      'nega?',
      'sababi nima',
      'что это значит?',
      'bu nima degani?',
      'explain more',
      'подробнее',
      'tushuntirib ber',
    ])('should NOT search for follow-up: "%s"', (msg) => {
      const result = SearchRouter.evaluate(msg);
      expect(result.shouldSearch).toBe(false);
      expect(result.reason).toBe('FOLLOW_UP_OR_CLARIFICATION');
    });
  });

  describe('Internal ZAMINAT Concepts & User Profile (should NOT trigger search)', () => {
    it.each([
      'how many EcoCoins do I have?',
      'mening nechta tangam bor?',
      'сколько у меня очков?',
      'what is my level in zaminat?',
      'Tell me about EcoScan and EcoMap',
      'EcoTile mahsulotlari nima?',
      'How does EcoVote work?',
    ])('should NOT search for internal concepts: "%s"', (msg) => {
      const result = SearchRouter.evaluate(msg);
      expect(result.shouldSearch).toBe(false);
    });
  });

  describe('Static Educational Concepts & Definitions (should NOT trigger search)', () => {
    it.each([
      'What is PET plastic?',
      'Что такое HDPE?',
      'How to recycle plastic bottles?',
      'Как перерабатывать макулатуру?',
      'Plastik qanday saralanadi?',
      'What is circular economy?',
    ])('should NOT search for static educational definition: "%s"', (msg) => {
      const result = SearchRouter.evaluate(msg);
      expect(result.shouldSearch).toBe(false);
    });
  });

  describe('Gate 4 Mandatory Positive Test Matrix (SHOULD trigger search)', () => {
    it.each([
      'AQI in Tashkent right now',
      'Latest environmental news today',
      'current Uzbekistan environmental regulation',
      'Bugun Toshkentda havo sifati qanday?',
      'Какое качество воздуха сейчас в Ташкенте?',
      'What is the current AQI in Tashkent today?',
      'последние новости экологии сегодня',
      'AQI in Samarkand right now',
    ])('SHOULD search for real-time/current query: "%s"', (msg) => {
      const result = SearchRouter.evaluate(msg);
      expect(result.shouldSearch).toBe(true);
      expect(result.searchQuery).toBeDefined();
    });
  });
});
