import { InterpretedMessage } from './search-types';

export class SearchQueryBuilder {
  /**
   * Constructs an optimized external web search query from the interpreted message.
   */
  static build(
    interpreted: InterpretedMessage,
    defaultLocation?: string,
    historyContext?: string,
  ): string {
    const loc = interpreted.location || defaultLocation || (historyContext ? this.extractLocationFromHistory(historyContext) : undefined);

    // 1. Air Quality / AQI / Pollution
    if (interpreted.isAirQualityQuery) {
      const targetCity = loc || 'Tashkent';
      if (interpreted.raw.toLowerCase().includes('завтра') || interpreted.raw.toLowerCase().includes('ertaga') || interpreted.raw.toLowerCase().includes('tomorrow')) {
        return `${targetCity} air quality AQI forecast tomorrow`;
      }
      return `${targetCity} air quality AQI PM2.5 monitoring current today`;
    }

    // 2. Weather
    if (interpreted.isWeatherQuery) {
      const targetCity = loc || 'Tashkent';
      if (interpreted.raw.toLowerCase().includes('завтра') || interpreted.raw.toLowerCase().includes('ertaga') || interpreted.raw.toLowerCase().includes('tomorrow')) {
        return `${targetCity} weather forecast tomorrow`;
      }
      return `${targetCity} weather current today`;
    }

    // 3. Source Challenge (User challenges source of prior response)
    if (interpreted.isSourceChallenge && historyContext) {
      const cleanHistory = historyContext.replace(/^(?:user|model|assistant|system):\s*/gi, '').slice(0, 150);
      return `${cleanHistory} official source facts verification`;
    }

    // 4. News / Regulation / Law
    if (interpreted.isNewsOrRegulationQuery) {
      const rawCleaned = this.stripSearchCommands(interpreted.normalized);
      const geography = loc || (interpreted.normalized.includes('узб') || interpreted.normalized.includes('uzb') ? 'Uzbekistan' : 'Uzbekistan');
      return `${geography} ${rawCleaned} official legislation news`;
    }

    // 5. Research & Technology
    if (interpreted.isResearchQuery || interpreted.isExplicitSearch) {
      const coreTopic = this.stripSearchCommands(interpreted.normalized);
      if (coreTopic.length > 3) {
        return `${coreTopic} research study technology facts`;
      }
    }

    // Default fallback: clean message stripped of conversational command prefixes
    const stripped = this.stripSearchCommands(interpreted.normalized);
    return stripped.length > 0 ? stripped : interpreted.raw.slice(0, 150);
  }

  /**
   * Strips conversational search command phrases to isolate the core entity.
   */
  private static stripSearchCommands(text: string): string {
    let s = text.toLowerCase();
    const commandPhrases = [
      'найди в интернете', 'поищи в интернете', 'проверь в интернете', 'что пишут в интернете',
      'найди информацию по', 'найди информацию о', 'найди информацию про', 'найди информацию',
      'найди последние материалы по', 'найди материалы по', 'найди материалы про', 'найди материалы',
      'найди исследования по', 'найди исследования о', 'найди исследование по', 'найди исследование',
      'поищи исследования по', 'поищи исследования о', 'поищи исследование', 'поищи материалы по',
      'найди источники по', 'найди источник', 'найди источники', 'найди статьи по', 'найди статью про',
      'найди статью', 'покажи источник', 'покажи источники', 'дай источник', 'дай ссылки',
      'search online for', 'look up online', 'find studies on', 'find research about', 'find sources for',
      'internetdan top', 'manbalarni top', 'tadqiqotlarni top',
    ];

    for (const phrase of commandPhrases) {
      s = s.replace(phrase, '').trim();
    }

    return s.replace(/^[!?,.;:\s]+|[!?,.;:\s]+$/g, '').trim();
  }

  private static extractLocationFromHistory(history: string): string | undefined {
    const lower = history.toLowerCase();
    if (lower.includes('ташкент') || lower.includes('tashkent') || lower.includes('toshkent')) return 'Tashkent';
    if (lower.includes('самарканд') || lower.includes('samarkand') || lower.includes('samarqand')) return 'Samarkand';
    if (lower.includes('бухара') || lower.includes('bukhara') || lower.includes('buxoro')) return 'Bukhara';
    if (lower.includes('наманган') || lower.includes('namangan')) return 'Namangan';
    return undefined;
  }
}
