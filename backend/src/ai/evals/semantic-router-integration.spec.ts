import { SearchRouter, SearchMode } from '../utils/search-router';
import { SemanticClassifier } from '../utils/semantic-classifier';

describe('Layer 2 Semantic Router Integration Suite', () => {
  const UNCERTAIN_CANDIDATE_QUERIES = [
    { query: 'кто нынче рулит NVIDIA?', intent: 'current_public_fact', requiresFresh: true, expectedMode: SearchMode.REQUIRED },
    { query: 'почём нынче серебро?', intent: 'current_public_fact', requiresFresh: true, expectedMode: SearchMode.REQUIRED },
    { query: 'у них руководство не поменялось?', intent: 'current_public_fact', requiresFresh: true, expectedMode: SearchMode.REQUIRED },
    { query: 'что там теперь с этим сервисом?', intent: 'current_public_fact', requiresFresh: true, expectedMode: SearchMode.REQUIRED },
    { query: 'можно сегодня туда улететь?', intent: 'current_public_fact', requiresFresh: true, expectedMode: SearchMode.REQUIRED },
    { query: 'кто в итоге вчера победил?', intent: 'current_public_fact', requiresFresh: true, expectedMode: SearchMode.REQUIRED },
    { query: 'эта технология уже вышла или ещё нет?', intent: 'current_public_fact', requiresFresh: true, expectedMode: SearchMode.REQUIRED },
    { query: 'их программа заявок ещё открыта?', intent: 'current_public_fact', requiresFresh: true, expectedMode: SearchMode.REQUIRED },
    { query: 'расскажи философскую притчу о воде', intent: 'opinion_or_creative', requiresFresh: false, expectedMode: SearchMode.NOT_NEEDED },
  ];

  it('Layer 1 Fast check should report isUncertain=true for unseen idiomatic queries', () => {
    for (const item of UNCERTAIN_CANDIDATE_QUERIES) {
      const fastResult = SearchRouter.evaluateFast(item.query);
      // Demonstrates that Layer 1 does NOT rely on hardcoding these exact phrases
      expect(fastResult.isUncertain).toBe(true);
    }
  });

  it('Layer 2 Semantic Evaluation should route correctly via structured model classification', async () => {
    for (const item of UNCERTAIN_CANDIDATE_QUERIES) {
      // Spy on SemanticClassifier.classify to mock structured LLM response
      jest.spyOn(SemanticClassifier as any, 'classifyWithModel').mockResolvedValueOnce({
        intent: item.intent as any,
        searchMode: item.expectedMode,
        requiresFreshExternalData: item.requiresFresh,
        normalizedMeaning: `Semantic analysis of: ${item.query}`,
        searchQuery: `${item.query} verified facts`,
        confidence: 0.95,
      });

      const result = await SearchRouter.evaluateSemantic(item.query, undefined, undefined, 'mock-valid-gemini-key');

      expect(result.searchMode).toBe(item.expectedMode);
      expect(result.shouldSearch).toBe(item.expectedMode === SearchMode.REQUIRED || item.expectedMode === SearchMode.PREFERRED);
      expect(result.layer).toBe('layer2_semantic');
    }
  });

  it('Layer 2 should fall back to heuristic semantic routing when model API fails or returns malformed response', async () => {
    // Force classifyWithModel to reject or return null
    jest.spyOn(SemanticClassifier as any, 'classifyWithModel').mockRejectedValueOnce(new Error('Network Timeout'));

    const result = await SearchRouter.evaluateSemantic(
      'почём нынче серебро?',
      undefined,
      undefined,
      'mock-valid-gemini-key',
    );

    // Heuristic fallback should still recognize live commodity price query
    expect(result.shouldSearch).toBe(true);
    expect(result.searchMode).toBe(SearchMode.REQUIRED);
    expect(result.layer).toBe('layer2_semantic');
  });
});
