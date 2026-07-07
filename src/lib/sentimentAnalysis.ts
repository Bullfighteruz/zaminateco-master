/**
 * ZAMINAT.eco — Sentiment Analysis Engine
 * 
 * Analyzes text for sentiment (positive/neutral/negative) using
 * keyword-based scoring with multi-language support (EN/UZ/RU).
 * Works fully offline — no API calls needed.
 */

// ============================================
// Types
// ============================================

export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export interface SentimentResult {
  label: SentimentLabel;
  score: number;      // -1 to 1
  confidence: number;  // 0 to 100
  emoji: string;
  color: string;
}

// ============================================
// Keyword Dictionaries (multi-language)
// ============================================

const POSITIVE_WORDS: Set<string> = new Set([
  // English
  'great', 'good', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
  'love', 'like', 'best', 'perfect', 'beautiful', 'helpful', 'useful', 'brilliant',
  'super', 'nice', 'cool', 'impressive', 'incredible', 'outstanding', 'recommend',
  'thank', 'thanks', 'happy', 'glad', 'pleased', 'enjoy', 'enjoyed', 'clean',
  'green', 'eco', 'recycle', 'sustainable', 'bravo', 'congratulations', 'well done',
  // Uzbek
  'ajoyib', 'yaxshi', 'zo\'r', 'mukammal', 'a\'lo', 'chiroyli', 'foydali',
  'rahmat', 'tashakkur', 'barakalla', 'juda', 'maroqli', 'qiziq', 'mamnun',
  'sevaman', 'yoqadi', 'oliy', 'eng', 'tozza', 'ekologik',
  // Russian  
  'отлично', 'хорошо', 'замечательно', 'прекрасно', 'супер', 'круто', 'класс',
  'спасибо', 'благодарю', 'молодец', 'здорово', 'красиво', 'полезно', 'нравится',
  'люблю', 'рекомендую', 'чисто', 'экологично', 'зеленый', 'браво',
]);

const NEGATIVE_WORDS: Set<string> = new Set([
  // English
  'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'ugly', 'useless',
  'waste', 'dirty', 'pollution', 'polluted', 'destroy', 'destroyed', 'damage',
  'sad', 'angry', 'disappointed', 'poor', 'broken', 'fail', 'failed',
  'problem', 'issue', 'bug', 'wrong', 'annoying', 'toxic', 'disgusting',
  // Uzbek
  'yomon', 'dahshatli', 'foydasiz', 'xunuk', 'iflos', 'buzilgan', 'xato',
  'muammo', 'qattiq', 'afsus', 'achinarli', 'zaharli', 'tushkunlik',
  // Russian
  'плохо', 'ужасно', 'отвратительно', 'грязно', 'загрязнение', 'мусор',
  'проблема', 'ошибка', 'сломано', 'разочарован', 'ненавижу', 'грустно',
  'токсичный', 'вредный', 'опасный',
]);

const INTENSIFIERS: Set<string> = new Set([
  'very', 'really', 'so', 'extremely', 'incredibly', 'absolutely', 'totally',
  'juda', 'o\'ta', 'nihoyatda', 'butunlay',
  'очень', 'крайне', 'невероятно', 'абсолютно',
]);

// ============================================
// Analysis
// ============================================

/**
 * Analyze the sentiment of a text string.
 * Uses keyword scoring with intensifier boosting.
 */
export function analyzeSentiment(text: string): SentimentResult {
  if (!text || text.trim().length === 0) {
    return { label: 'neutral', score: 0, confidence: 0, emoji: '😐', color: '#94a3b8' };
  }

  const words = text.toLowerCase()
    .replace(/[^\w\s\u0400-\u04FF\u0600-\u06FFа-яА-ЯёЁ']/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);

  let positiveCount = 0;
  let negativeCount = 0;
  let intensifierActive = false;

  for (const word of words) {
    if (INTENSIFIERS.has(word)) {
      intensifierActive = true;
      continue;
    }

    const multiplier = intensifierActive ? 1.5 : 1;
    intensifierActive = false;

    if (POSITIVE_WORDS.has(word)) {
      positiveCount += multiplier;
    } else if (NEGATIVE_WORDS.has(word)) {
      negativeCount += multiplier;
    }
  }

  const total = positiveCount + negativeCount;
  
  if (total === 0) {
    return { label: 'neutral', score: 0, confidence: 30, emoji: '😐', color: '#94a3b8' };
  }

  const rawScore = (positiveCount - negativeCount) / total; // -1 to 1
  const confidence = Math.min(Math.round((total / words.length) * 100 * 3), 100);

  let label: SentimentLabel;
  let emoji: string;
  let color: string;

  if (rawScore > 0.2) {
    label = 'positive';
    emoji = rawScore > 0.6 ? '😊' : '🙂';
    color = '#22c55e';
  } else if (rawScore < -0.2) {
    label = 'negative';
    emoji = rawScore < -0.6 ? '😞' : '😕';
    color = '#ef4444';
  } else {
    label = 'neutral';
    emoji = '😐';
    color = '#eab308';
  }

  return {
    label,
    score: Math.round(rawScore * 100) / 100,
    confidence,
    emoji,
    color,
  };
}

/**
 * Analyze an array of texts and return aggregate sentiment.
 */
export function analyzeBatchSentiment(texts: string[]): {
  results: SentimentResult[];
  aggregate: SentimentResult;
  distribution: { positive: number; neutral: number; negative: number };
} {
  const results = texts.map(t => analyzeSentiment(t));
  
  const distribution = {
    positive: results.filter(r => r.label === 'positive').length,
    neutral: results.filter(r => r.label === 'neutral').length,
    negative: results.filter(r => r.label === 'negative').length,
  };

  const avgScore = results.length > 0
    ? results.reduce((sum, r) => sum + r.score, 0) / results.length
    : 0;

  const avgConfidence = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.confidence, 0) / results.length)
    : 0;

  let label: SentimentLabel;
  let emoji: string;
  let color: string;

  if (avgScore > 0.15) {
    label = 'positive';
    emoji = '😊';
    color = '#22c55e';
  } else if (avgScore < -0.15) {
    label = 'negative';
    emoji = '😞';
    color = '#ef4444';
  } else {
    label = 'neutral';
    emoji = '😐';
    color = '#eab308';
  }

  return {
    results,
    aggregate: { label, score: Math.round(avgScore * 100) / 100, confidence: avgConfidence, emoji, color },
    distribution,
  };
}
