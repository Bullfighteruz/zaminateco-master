import { ScanResult, DetectedItem, WasteStatus } from '../interfaces/ai-provider.interface';

export class ScanGuard {
  private static readonly VALID_STATUSES: Set<WasteStatus> = new Set([
    'Accepted',
    'Needs sorting',
    'Not accepted',
    'Needs cleaning',
  ]);

  /**
   * Applies server-side deterministic sanity checks, weight consistency bounding,
   * EcoCoin governance (set to 0 until authoritative formula is approved),
   * and confidence calibration.
   */
  static sanitize(raw: Partial<ScanResult>, lang: string = 'ru'): ScanResult {
    // 1. Sanitize & Normalize Items
    const rawItems = Array.isArray(raw.items) ? raw.items : [];
    const items: DetectedItem[] = rawItems.map(item => {
      const name = String(item.name || '').trim() || (lang.startsWith('uz') ? 'Ikkilamchi material' : lang.startsWith('en') ? 'Secondary material' : 'Вторичный материал');
      const quantity = typeof item.quantity === 'number' && item.quantity > 0
        ? Math.floor(item.quantity)
        : 1;
      const wasteType = String(item.wasteType || 'Unknown').trim();
      const status: WasteStatus = ScanGuard.VALID_STATUSES.has(item.status as WasteStatus)
        ? (item.status as WasteStatus)
        : 'Accepted';
      const instructions = String(item.instructions || '').trim();

      return { name, quantity, wasteType, status, instructions };
    });

    // 2. Deterministic EcoCoins Governance (Server-Owned, AI reward generation disabled)
    const estimatedEcoCoins = 0;

    // 3. Weight Consistency Anomaly Detection & Correction
    const totalEstimatedWeightKg = ScanGuard.guardWeight(raw.totalEstimatedWeightKg, items, lang);

    // 4. Confidence Calibration
    const confidence = ScanGuard.calibrateConfidence(raw.confidence, items);

    // 5. Impact & Suggested Product Sanitization
    const moatImpact = ScanGuard.sanitizeImpact(raw.moatImpact, lang);
    const suggestedProduct = ScanGuard.sanitizeSuggestedProduct(raw.suggestedProduct, items, lang);

    return {
      items,
      totalEstimatedWeightKg,
      estimatedEcoCoins,
      moatImpact,
      suggestedProduct,
      confidence,
    };
  }

  /**
   * Anomaly check on weight estimate against detected object mass categories.
   */
  private static guardWeight(rawWeight: any, items: DetectedItem[], lang: string): string {
    let rawStr = typeof rawWeight === 'string' ? rawWeight.trim() : '';

    // Calculate approximate expected plausible mass band
    let minExpectedKg = 0;
    let maxExpectedKg = 0;

    for (const item of items) {
      const lower = item.name.toLowerCase();
      const type = item.wasteType.toLowerCase();
      const q = Math.max(1, item.quantity);

      if (lower.includes('шина') || lower.includes('tire') || lower.includes('avtomobil shina') || lower.includes('автомобильн')) {
        // Full automotive tire (heavy)
        minExpectedKg += 5.0 * q;
        maxExpectedKg += 12.0 * q;
      } else if (lower.includes('камера') || lower.includes('tube') || lower.includes('кольцеобразн') || lower.includes('ring') || lower.includes('kamera') || type.includes('rubber') || lower.includes('резин')) {
        // Rubber inner tube or ring (medium)
        minExpectedKg += 0.25 * q;
        maxExpectedKg += 0.9 * q;
      } else if (lower.includes('бутылк') || lower.includes('bottle') || lower.includes('idish') || lower.includes('flakon') || lower.includes('banka') || lower.includes('канистр')) {
        // Rigid bottle/jug/canister
        minExpectedKg += 0.03 * q;
        maxExpectedKg += 0.15 * q;
      } else if (lower.includes('крышк') || lower.includes('cap') || lower.includes('qopqoq') || lower.includes('probk')) {
        // Bottle caps
        minExpectedKg += 0.003 * q;
        maxExpectedKg += 0.008 * q;
      } else if (lower.includes('упаковк') || lower.includes('wrapper') || lower.includes('пакет') || lower.includes('paket') || lower.includes('snack') || lower.includes('пленк')) {
        // Flexible wrappers/films
        minExpectedKg += 0.005 * q;
        maxExpectedKg += 0.03 * q;
      } else {
        // General default item
        minExpectedKg += 0.05 * q;
        maxExpectedKg += 0.25 * q;
      }
    }

    if (items.length === 0) {
      return lang.startsWith('uz') ? '0.0 kg' : lang.startsWith('en') ? '0.0 kg' : '0.0 кг';
    }

    // Try to extract numbers from rawWeight
    const matches = rawStr.match(/(\d+(?:[.,]\d+)?)/g);
    let rawMin = 0;
    let rawMax = 0;
    if (matches && matches.length >= 2) {
      rawMin = parseFloat(matches[0].replace(',', '.'));
      rawMax = parseFloat(matches[1].replace(',', '.'));
    } else if (matches && matches.length === 1) {
      rawMin = parseFloat(matches[0].replace(',', '.'));
      rawMax = rawMin;
    }

    // Check for severe anomaly:
    // e.g. Model claimed 2.5 - 4.0 kg for a scene without tires where expected max is ~1.4 kg
    const isSevereOverestimate = rawMin > maxExpectedKg * 1.3 || rawMax > maxExpectedKg * 1.8;
    const isSevereUnderestimate = (rawMax < minExpectedKg * 0.5 && minExpectedKg > 0.5) || (rawMin <= 0);

    if (isSevereOverestimate || isSevereUnderestimate || !rawStr || rawMin <= 0) {
      const minRounded = Math.max(0.1, Math.round(minExpectedKg * 10) / 10);
      const maxRounded = Math.max(minRounded + 0.1, Math.round(maxExpectedKg * 10) / 10);
      if (lang.startsWith('uz')) {
        return `≈ ${minRounded} – ${maxRounded} kg (taxminiy)`;
      } else if (lang.startsWith('en')) {
        return `≈ ${minRounded} – ${maxRounded} kg (visual estimate)`;
      }
      return `≈ ${minRounded} – ${maxRounded} кг (визуальная оценка)`;
    }

    return rawStr;
  }

  /**
   * Calibrates confidence: lowers score if ambiguous terms or complex overlapping objects are present.
   */
  private static calibrateConfidence(rawConf: any, items: DetectedItem[]): number {
    let conf = typeof rawConf === 'number' ? Math.round(rawConf) : 80;
    conf = Math.min(100, Math.max(10, conf));

    // If ambiguous rubber tube / mixed wrapper items are present, cap overconfidence
    const hasAmbiguousItem = items.some(item => {
      const name = item.name.toLowerCase();
      return name.includes('камера') || name.includes('трубчат') || name.includes('кольцеобразн') || name.includes('tube') || name.includes('ring') || name.includes('mixed') || name.includes('неопределен') || name.includes('taxmin');
    });

    if (hasAmbiguousItem && conf > 85) {
      conf = 82;
    }

    return conf;
  }

  /**
   * Ensures impact description is qualitative, conservative, and educational.
   * Strips all quantitative environmental, carbon, emission, and diversion metrics.
   */
  private static sanitizeImpact(rawImpact: any, lang: string): string {
    const raw = typeof rawImpact === 'string' ? rawImpact.trim() : '';
    if (raw && !ScanGuard.isQuantitativeImpactClaim(raw)) {
      return raw;
    }

    if (lang.startsWith('uz')) {
      return "Aniqlangan materiallarni tegishli qabul qilish punktlariga topshirish resurslarni iqtisodiy muomalaga qaytarishga va poligonlarga tushadigan yukni kamaytirishga yordam beradi.";
    } else if (lang.startsWith('en')) {
      return "Directing identified materials to appropriate collection streams helps return resources into the economic cycle and reduce landfill burden.";
    }
    return "Передача распознанных материалов в подходящие потоки сбора может помочь вернуть часть ресурсов в хозяйственный цикл и уменьшить объём материалов, направляемых на захоронение.";
  }

  /**
   * Deterministically detects quantitative environmental / sustainability / carbon claims
   * across bidirectional linguistic word orderings (Metric -> Term or Term -> Metric).
   * Requires BOTH a genuine environmental term (with strict lexical boundaries)
   * AND a quantitative metric with a unit.
   */
  private static isQuantitativeImpactClaim(text: string): boolean {
    if (!text || typeof text !== 'string') {
      return false;
    }

    const normalized = text.toLowerCase();

    // 1. Environmental / Climate / Emissions keywords with strict lexical boundaries
    // English terms use \b boundaries to prevent false matches inside unrelated words (e.g. "carbonated", "emissionless", "diversionary").
    // Cyrillic terms use Unicode lookarounds to support legitimate Russian inflections (e.g. "выбросы", "выбросов", "углеродный след").
    const englishEnv = '\\b(?:co2e|co2|carbon(?:\\s+footprint)?|emissions?|landfill(?:\\s+diversion)?|diversion)\\b|co₂e|co₂';
    const russianEnv = '(?<![а-яА-Яa-zA-Z])(?:углерод(?:н[а-я]+)?(?:\\s+след[а-я]*)?|выброс[а-я]*|эмисси[а-я]*|полигон[а-я]*|захоронен[а-я]*)(?![а-яА-Яa-zA-Z])';
    const envKeywords = `(?:${englishEnv}|${russianEnv})`;

    // 2. Quantitative metrics strictly WITH unit or %
    // Latin units use \b boundaries; Cyrillic units use boundary lookarounds.
    const latinUnits = '\\b(?:kg|g|t|tons?|tonnes?|percent(?:age)?)\\b|%';
    const cyrillicUnits = '(?<![а-яА-Яa-zA-Z])(?:кг|г|т|тонн[а-я]*|процент[а-я]*)(?![а-яА-Яa-zA-Z0-9])';
    const units = `(?:${latinUnits}|${cyrillicUnits})`;
    const metricWithUnit = `(?:(?:≈|~|about|around|approximately|примерно|около|taxminan|на|by|to)\\s+)*\\d+(?:[.,]\\d+)?\\s*${units}`;

    // Pattern A: Metric with unit followed within ~40 chars by Environmental Term
    // Examples: "0.5 kg CO2", "12% reduction in emissions", "25% landfill diversion", "0.5 kg CO2 saved"
    const metricFirstRegex = new RegExp(`${metricWithUnit}[\\s\\S]{0,40}${envKeywords}`, 'i');

    // Pattern B: Environmental Term followed within ~40 chars by Metric with unit
    // Examples: "сокращает выбросы CO₂ на 0.1 кг", "CO2 reduced by 0.5 kg", "CO₂ ≈ 0,8 кг", "carbon footprint reduced 12%"
    const keywordFirstRegex = new RegExp(`${envKeywords}[\\s\\S]{0,40}${metricWithUnit}`, 'i');

    return metricFirstRegex.test(normalized) || keywordFirstRegex.test(normalized);
  }

  /**
   * Ensures suggested product describes potential material pathways rather than guaranteed production.
   */
  private static sanitizeSuggestedProduct(rawProd: any, items: DetectedItem[], lang: string): string {
    const raw = typeof rawProd === 'string' ? rawProd.trim() : '';
    if (raw && !raw.toLowerCase().includes('will turn this tire') && !raw.toLowerCase().includes('гарантированно произведет')) {
      return raw;
    }

    const hasRubber = items.some(i => i.wasteType === 'Rubber' || i.name.toLowerCase().includes('резин') || i.name.toLowerCase().includes('kamera'));
    if (hasRubber) {
      if (lang.startsWith('uz')) return "Potentsial yo'nalish: elastik qoplamalar uchun rezina kırıntısı ishlab chiqarish.";
      if (lang.startsWith('en')) return "Potential pathway: rubber crumb processing for future elastic surfaces.";
      return "Возможное направление: переработка резины в крошку для будущих эластичных покрытий.";
    }

    if (lang.startsWith('uz')) return "Potentsial yo'nalish: yangi mahsulotlar uchun ikkilamchi xomashyo tayyorlash.";
    if (lang.startsWith('en')) return "Potential pathway: secondary material processing for new recycled products.";
    return "Возможное направление: подготовка вторичного сырья для производства новых изделий.";
  }
}
