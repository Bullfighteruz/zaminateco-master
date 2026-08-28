import { UserMessageInterpreter } from './user-message-interpreter';

describe('UserMessageInterpreter Unit Tests', () => {
  describe('Language Detection', () => {
    it('should detect Russian language', () => {
      expect(UserMessageInterpreter.detectLanguage('Привет, как дела?')).toBe('ru');
      expect(UserMessageInterpreter.detectLanguage('какой сегодня уровень воздуха в ташкенте')).toBe('ru');
    });

    it('should detect Uzbek Latin language', () => {
      expect(UserMessageInterpreter.detectLanguage('Toshkentda bugun havo sifati qanday?')).toBe('uz');
      expect(UserMessageInterpreter.detectLanguage('plastik qanday saralanadi?')).toBe('uz');
    });

    it('should detect English language', () => {
      expect(UserMessageInterpreter.detectLanguage('What is the current air quality in Tashkent?')).toBe('en');
      expect(UserMessageInterpreter.detectLanguage('How to recycle plastic bottles?')).toBe('en');
    });
  });

  describe('Phonetic & Typo Tolerance', () => {
    it('should normalize malformed Russian air quality questions', () => {
      const res = UserMessageInterpreter.interpret('какой севодня уровен воздуха ташкент');
      expect(res.isAirQualityQuery).toBe(true);
      expect(res.hasTimeTrigger).toBe(true);
      expect(res.location).toBe('Tashkent');
    });

    it('should normalize severe typo Russian air query ("ташкент возух шас")', () => {
      const res = UserMessageInterpreter.interpret('ташкент возух шас');
      expect(res.isAirQualityQuery).toBe(true);
      expect(res.hasTimeTrigger).toBe(true);
      expect(res.location).toBe('Tashkent');
    });

    it('should normalize pollution typo ("уровен загрезнение ташк")', () => {
      const res = UserMessageInterpreter.interpret('уровен загрезнение ташк');
      expect(res.isAirQualityQuery).toBe(true);
      expect(res.location).toBe('Tashkent');
    });

    it('should normalize research typo ("поищи матриалы переробка пластик")', () => {
      const res = UserMessageInterpreter.interpret('поищи матриалы переробка пластик');
      expect(res.isExplicitSearch).toBe(true);
      expect(res.isResearchQuery).toBe(true);
    });

    it('should normalize source challenge typo ("найд источинк")', () => {
      const res = UserMessageInterpreter.interpret('найд источинк');
      expect(res.isSourceChallenge).toBe(true);
    });

    it('should normalize Uzbek informal query ("toshkent havo hozr qana")', () => {
      const res = UserMessageInterpreter.interpret('toshkent havo hozr qana');
      expect(res.isAirQualityQuery).toBe(true);
      expect(res.hasTimeTrigger).toBe(true);
      expect(res.location).toBe('Tashkent');
    });

    it('should normalize English informal query ("what tashkent air rn")', () => {
      const res = UserMessageInterpreter.interpret('what tashkent air rn');
      expect(res.isAirQualityQuery).toBe(true);
      expect(res.hasTimeTrigger).toBe(true);
      expect(res.location).toBe('Tashkent');
    });
  });
});
