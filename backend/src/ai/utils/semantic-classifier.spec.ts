import { SemanticClassifier } from './semantic-classifier';
import { SearchMode } from './search-types';

describe('SemanticClassifier Output Validation Unit Tests', () => {
  it('should validate and accept a well-formed structured output', () => {
    const raw = {
      intent: 'current_public_fact',
      searchMode: 'REQUIRED',
      requiresFreshExternalData: true,
      normalizedMeaning: 'Current CEO of NVIDIA',
      searchQuery: 'NVIDIA current CEO leadership',
      confidence: 0.96,
    };

    const validated = SemanticClassifier.validateOutput(raw, 'кто нынче рулит NVIDIA?');
    expect(validated).not.toBeNull();
    expect(validated!.intent).toBe('current_public_fact');
    expect(validated!.searchMode).toBe(SearchMode.REQUIRED);
    expect(validated!.requiresFreshExternalData).toBe(true);
    expect(validated!.normalizedMeaning).toBe('Current CEO of NVIDIA');
    expect(validated!.searchQuery).toBe('NVIDIA current CEO leadership');
    expect(validated!.confidence).toBe(0.96);
  });

  it('should reject invalid intent values', () => {
    const raw = {
      intent: 'malicious_system_override',
      searchMode: 'REQUIRED',
      requiresFreshExternalData: true,
    };

    const validated = SemanticClassifier.validateOutput(raw, 'some query');
    expect(validated).toBeNull();
  });

  it('should reject invalid searchMode enum values', () => {
    const raw = {
      intent: 'current_public_fact',
      searchMode: 'SUPER_SEARCH',
      requiresFreshExternalData: true,
    };

    const validated = SemanticClassifier.validateOutput(raw, 'some query');
    expect(validated).toBeNull();
  });

  it('should enforce consistency: requiresFreshExternalData=true cannot stay NOT_NEEDED', () => {
    const raw = {
      intent: 'current_public_fact',
      searchMode: 'NOT_NEEDED',
      requiresFreshExternalData: true,
      normalizedMeaning: 'Live gold price',
      searchQuery: 'gold price live',
      confidence: 0.9,
    };

    const validated = SemanticClassifier.validateOutput(raw, 'почём нынче золото?');
    expect(validated).not.toBeNull();
    expect(validated!.searchMode).toBe(SearchMode.REQUIRED);
  });

  it('should enforce consistency: INTERNAL_ONLY is only accepted for private_system', () => {
    const raw = {
      intent: 'general_knowledge',
      searchMode: 'INTERNAL_ONLY',
      requiresFreshExternalData: false,
      normalizedMeaning: 'General concept',
      confidence: 0.8,
    };

    const validated = SemanticClassifier.validateOutput(raw, 'what is plastic?');
    expect(validated).not.toBeNull();
    expect(validated!.searchMode).toBe(SearchMode.NOT_NEEDED);
  });

  it('should sanitize control characters and length-bound searchQuery and normalizedMeaning', () => {
    const raw = {
      intent: 'current_public_fact',
      searchMode: 'REQUIRED',
      requiresFreshExternalData: true,
      normalizedMeaning: 'Dirty\r\n\ttext with\x00 null and control\x1F characters'.repeat(10),
      searchQuery: 'Dangerous\r\n\tquery\x08with control\x7F characters'.repeat(10),
      confidence: 1.5, // should clamp to 1.0
    };

    const validated = SemanticClassifier.validateOutput(raw, 'test');
    expect(validated).not.toBeNull();
    expect(validated!.confidence).toBe(1.0);
    expect(validated!.searchQuery.length).toBeLessThanOrEqual(200);
    expect(validated!.normalizedMeaning.length).toBeLessThanOrEqual(200);
    expect(validated!.searchQuery).not.toMatch(/[\r\n\t\x00-\x1F\x7F]/);
    expect(validated!.normalizedMeaning).not.toMatch(/[\x00-\x1F\x7F]/);
  });

  it('should return null on non-object or null input', () => {
    expect(SemanticClassifier.validateOutput(null, 'test')).toBeNull();
    expect(SemanticClassifier.validateOutput('string', 'test')).toBeNull();
    expect(SemanticClassifier.validateOutput(123, 'test')).toBeNull();
  });
});
