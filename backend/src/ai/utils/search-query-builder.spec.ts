import { SearchQueryBuilder } from './search-query-builder';
import { UserMessageInterpreter } from './user-message-interpreter';

describe('SearchQueryBuilder Unit Tests', () => {
  it('should build clean search query for Russian air quality question', () => {
    const interpreted = UserMessageInterpreter.interpret('какой сегодня уровень воздуха в ташкенте');
    const query = SearchQueryBuilder.build(interpreted);
    expect(query).toContain('Tashkent');
    expect(query).toContain('air quality AQI');
  });

  it('should build clean search query for research question with command stripped', () => {
    const interpreted = UserMessageInterpreter.interpret('найди материалы как перерабатывают резину в плитку');
    const query = SearchQueryBuilder.build(interpreted);
    expect(query).not.toContain('найди');
    expect(query).toContain('перерабатывают');
    expect(query).toContain('плитку');
  });

  it('should build clean search query for source challenge with history context', () => {
    const interpreted = UserMessageInterpreter.interpret('откуда эта информация?');
    const query = SearchQueryBuilder.build(interpreted, 'Tashkent', 'Вчера AQI в Ташкенте составил 95');
    expect(query).toContain('AQI в Ташкенте');
    expect(query).toContain('official source');
  });

  it('should build clean search query for Uzbek legislation question', () => {
    const interpreted = UserMessageInterpreter.interpret('plastik qayta ishlash bo\'yicha yangi qonun');
    const query = SearchQueryBuilder.build(interpreted);
    expect(query).toContain('Uzbekistan');
    expect(query).toContain('qonun');
  });
});
