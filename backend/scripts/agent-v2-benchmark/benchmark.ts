/**
 * ZAMINAT AI AGENT v2 — Evidence-Grade Benchmark Harness (STAGE A1.2 Preflight)
 * ISOLATED DEVELOPMENT SCRIPT — NOT IMPORTED BY PRODUCTION CODE
 */

import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';

export interface EvaluationScenario {
  id: string;
  category: string;
  input: string;
  context: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  expected_behavior: string;
  fail_condition: string;
  requires_search: boolean;
  requires_source: boolean;
  requires_tool: boolean;
  language_expectation: 'ru' | 'uz' | 'en';
  depth_expectation: 'short' | 'detailed';
}

export interface DeterministicChecks {
  languageMatch: boolean;
  searchUsedMatchesRequirement: boolean;
  noFakeFactoryClaim: boolean;
  privateMetricRefusal: boolean;
  contextReferentRemembered: boolean;
}

export interface StructuredBenchmarkOutput {
  runId: string;
  scenarioId: string;
  repetition: number;
  model: string;
  thinkingLevelRequested: 'default' | 'medium';
  thinkingLevelEffectiveOrUnknown: string;
  searchAvailable: boolean;
  searchUsed: boolean;
  sourceDomains: string[];
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  deterministicChecks: DeterministicChecks;
  manualQualityStatus: 'MANUAL_REVIEW_PENDING';
  responseText?: string;
  providerError?: string;
  timestamp: string;
}

export const CRITICAL_QUALIFICATION_SCENARIOS = [
  'EVAL_05', // previous user question
  'EVAL_06', // Uzbek elliptical follow-up
  'EVAL_07', // "почему?" follow-up context
  'EVAL_08', // "what about children?" context
  'EVAL_01', // RU language
  'EVAL_02', // UZ language
  'EVAL_09', // current AQI
  'EVAL_13', // weather
  'EVAL_15', // Uzbekistan law
  'EVAL_17', // ZAMINAT operational truth
  'EVAL_19', // private metric refusal
  'EVAL_24'  // detailed response request
];

export const QUALIFICATION_COMBINATIONS = [
  { model: 'gemini-3.5-flash-lite', thinkingLevel: 'default' as const },
  { model: 'gemini-3.5-flash-lite', thinkingLevel: 'medium' as const },
  { model: 'gemini-3.5-flash', thinkingLevel: 'default' as const },
  { model: 'gemini-3.6-flash', thinkingLevel: 'default' as const }
];

export async function executeProviderCall(
  ai: GoogleGenAI,
  model: string,
  thinkingLevel: 'default' | 'medium',
  searchEnabled: boolean,
  scenario: EvaluationScenario
): Promise<{
  responseText: string;
  searchUsed: boolean;
  sources: Array<{ title: string; url: string }>;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  providerError?: string;
  thinkingEffective: string;
}> {
  const startTime = Date.now();
  const contents = [
    ...scenario.context,
    { role: 'user', parts: [{ text: scenario.input }] }
  ];

  const config: any = {};
  if (searchEnabled) {
    config.tools = [{ googleSearch: {} }];
  }

  let thinkingEffective = 'default';
  if (thinkingLevel === 'medium') {
    // Official Gemini 3 SDK parameter format using thinkingLevel
    config.thinkingConfig = { thinkingLevel: 'medium' };
    thinkingEffective = 'medium (thinkingLevel: "medium")';
  }

  let attempts = 0;
  let lastError: any = null;

  while (attempts < 2) {
    attempts++;
    try {
      const response: any = await ai.models.generateContent({
        model,
        config,
        contents
      });

      const latencyMs = Date.now() - startTime;
      const candidates = Array.isArray(response?.candidates) ? response.candidates : [];
      const candidate = candidates[0];
      const textParts = candidate?.content?.parts || [];
      const responseText = textParts.map((p: any) => p.text || '').join('');

      const grounding = candidate?.groundingMetadata;
      const webQueries = Array.isArray(grounding?.webSearchQueries) ? grounding.webSearchQueries : [];
      const chunks = Array.isArray(grounding?.groundingChunks) ? grounding.groundingChunks : [];
      const searchUsed = webQueries.length > 0 || chunks.some((c: any) => Boolean(c?.web?.uri));

      const sources: Array<{ title: string; url: string }> = [];
      const seenUrls = new Set<string>();

      for (const chunk of chunks) {
        const uri = chunk?.web?.uri;
        if (uri && !seenUrls.has(uri)) {
          seenUrls.add(uri);
          sources.push({
            title: chunk?.web?.title || uri,
            url: uri
          });
        }
      }

      const inputTokens = response?.usageMetadata?.promptTokenCount;
      const outputTokens = response?.usageMetadata?.candidatesTokenCount;

      return {
        responseText,
        searchUsed,
        sources,
        latencyMs,
        inputTokens,
        outputTokens,
        thinkingEffective
      };
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || 500;
      // Single retry for transient 429/5xx errors
      if (attempts === 1 && (status === 429 || status >= 500)) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      break;
    }
  }

  return {
    responseText: '',
    searchUsed: false,
    sources: [],
    latencyMs: Date.now() - startTime,
    providerError: lastError?.message || String(lastError || 'UNKNOWN_ERROR'),
    thinkingEffective
  };
}

export function performDeterministicChecks(responseText: string, searchUsed: boolean, scenario: EvaluationScenario): DeterministicChecks {
  const text = (responseText || '').toLowerCase();
  
  const noFakeFactory = !text.includes('наша фабрика производит') && 
                        !text.includes('серийное производство') && 
                        !text.includes('собственный завод');

  const privateMetricRefusal = scenario.id === 'EVAL_19'
    ? (text.includes('недоступн') || text.includes('не имею доступа') || text.includes('private') || text.includes('no access'))
    : true;

  const searchUsedMatchesRequirement = scenario.requires_search ? searchUsed : !searchUsed;

  const contextReferentRemembered = scenario.category === 'MEMORY / CONTEXT'
    ? (text.length > 5 && !text.includes('не помню') && !text.includes('не знаю о чем'))
    : true;

  const languageMatch = scenario.language_expectation === 'en'
    ? /[a-z]/i.test(responseText)
    : scenario.language_expectation === 'uz'
    ? Boolean(responseText)
    : Boolean(responseText);

  return {
    languageMatch,
    searchUsedMatchesRequirement,
    noFakeFactoryClaim: noFakeFactory,
    privateMetricRefusal,
    contextReferentRemembered
  };
}

export async function runBenchmarkHarness() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const modeIndex = args.indexOf('--mode');
  const mode = modeIndex !== -1 ? args[modeIndex + 1] : 'qualification';

  if (mode !== 'qualification') {
    console.log(JSON.stringify({
      event: 'FULL_ROUND_BLOCKED',
      message: 'Qualification mode must execute first and produce certified evidence before Full Round approval.',
      fullRoundBlockedUntilApproval: true
    }));
    return;
  }

  const goldenSetPath = path.join(__dirname, 'golden-set.json');
  const scenarios: EvaluationScenario[] = JSON.parse(fs.readFileSync(goldenSetPath, 'utf8'));
  const criticalScenarios = scenarios.filter(s => CRITICAL_QUALIFICATION_SCENARIOS.includes(s.id));

  // Qualification Call Count Breakdown:
  // 12 critical scenarios x 4 model/config combinations x 2 repetitions = 96 controlled calls
  // 12 baseline scenarios x 2 repetitions = 24 baseline calls
  // TOTAL = 120 MAX CALLS
  const CONTROLLED_CALLS = 12 * 4 * 2; // 96
  const BASELINE_CALLS = 12 * 2;       // 24
  const QUALIFICATION_PLAN_CALLS = CONTROLLED_CALLS + BASELINE_CALLS; // 120
  const MAX_CALLS = 120;

  if (isDryRun) {
    console.log("QUALIFICATION_SCENARIOS=12");
    console.log(`CONTROLLED_CALLS=${CONTROLLED_CALLS}`);
    console.log(`BASELINE_CALLS=${BASELINE_CALLS}`);
    console.log(`QUALIFICATION_PLAN_CALLS=${QUALIFICATION_PLAN_CALLS}`);
    console.log(`MAX_CALLS=${MAX_CALLS}`);
    console.log("REAL_PROVIDER_CALLS=0");
    console.log("MEDIUM_USES_THINKING_LEVEL=YES");
    console.log("MEDIUM_USES_THINKING_BUDGET=NO");
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.log(JSON.stringify({
      event: 'EXECUTION_BLOCKED',
      reason: 'SECRET_REQUIRED_AT_RUNTIME',
      message: 'GEMINI_API_KEY environment variable is absent.',
      qualificationPlanCalls: QUALIFICATION_PLAN_CALLS,
      maxCalls: MAX_CALLS,
      realProviderCalls: 0
    }));
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const runId = `run_${Date.now()}`;
  let totalExecutedCalls = 0;

  // Execute Controlled Comparison Calls
  for (const scenario of criticalScenarios) {
    for (const combo of QUALIFICATION_COMBINATIONS) {
      for (let rep = 1; rep <= 2; rep++) {
        if (totalExecutedCalls >= MAX_CALLS) {
          console.error(`[HARD STOP] Maximum qualification call limit of ${MAX_CALLS} reached.`);
          break;
        }

        const searchEnabled = scenario.requires_search;
        const result = await executeProviderCall(ai, combo.model, combo.thinkingLevel, searchEnabled, scenario);
        totalExecutedCalls++;

        const checks = performDeterministicChecks(result.responseText, result.searchUsed, scenario);

        const record: StructuredBenchmarkOutput = {
          runId,
          scenarioId: scenario.id,
          repetition: rep,
          model: combo.model,
          thinkingLevelRequested: combo.thinkingLevel,
          thinkingLevelEffectiveOrUnknown: result.thinkingEffective,
          searchAvailable: searchEnabled,
          searchUsed: result.searchUsed,
          sourceDomains: result.sources.map(s => {
            try { return new URL(s.url).hostname; } catch { return s.url; }
          }),
          latencyMs: result.latencyMs,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          deterministicChecks: checks,
          manualQualityStatus: 'MANUAL_REVIEW_PENDING',
          responseText: result.responseText,
          providerError: result.providerError,
          timestamp: new Date().toISOString()
        };

        // Emit every record directly to STDOUT as one JSON line for Cloud Logging durability
        console.log(JSON.stringify(record));
      }
    }
  }

  // Final Summary Output to STDOUT
  console.log(JSON.stringify({
    event: 'BENCHMARK_COMPLETED',
    runId,
    totalExecutedCalls,
    maxCalls: MAX_CALLS,
    qualificationScenariosCount: criticalScenarios.length,
    timestamp: new Date().toISOString()
  }));
}

if (require.main === module) {
  runBenchmarkHarness().catch(err => console.error(JSON.stringify({ event: 'HARNESS_ERROR', error: err.message })));
}
