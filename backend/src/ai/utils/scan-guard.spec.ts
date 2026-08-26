import { ScanGuard } from './scan-guard';
import { ScanResult } from '../interfaces/ai-provider.interface';

describe('ScanGuard Semantic Consistency & Weight Sanity Guard (Phase 18 Test Matrix)', () => {
  describe('Case A: PET bottle only', () => {
    it('should sanitize single PET bottle and produce plausible light mass band', () => {
      const input: Partial<ScanResult> = {
        items: [
          {
            name: 'Прозрачная пластиковая бутылка (ПЭТ)',
            quantity: 1,
            wasteType: 'Plastic',
            status: 'Accepted',
            instructions: 'Сполосните и сомните. Проверьте правила выбранного пункта приёма.',
          },
        ],
        totalEstimatedWeightKg: '0.03 – 0.05 кг',
        estimatedEcoCoins: 50, // LLM hallucinated coins
        moatImpact: 'Возврат ПЭТ в переработку',
        suggestedProduct: 'Подготовка вторичного сырья',
        confidence: 95,
      };

      const result = ScanGuard.sanitize(input, 'ru');

      expect(result.items.length).toBe(1);
      expect(result.estimatedEcoCoins).toBe(0); // Server-owned zero governance
      expect(result.totalEstimatedWeightKg).toBe('0.03 – 0.05 кг');
      expect(result.confidence).toBe(95);
    });
  });

  describe('Case B: PET + multiple caps', () => {
    it('should calculate plausible combined lightweight mass band', () => {
      const input: Partial<ScanResult> = {
        items: [
          { name: 'Бутылки ПЭТ', quantity: 2, wasteType: 'Plastic', status: 'Accepted', instructions: 'Сполоснуть' },
          { name: 'Пластиковые крышки', quantity: 10, wasteType: 'Plastic', status: 'Accepted', instructions: 'Сдать отдельно' },
        ],
        totalEstimatedWeightKg: '0.1 – 0.2 кг',
        confidence: 90,
      };

      const result = ScanGuard.sanitize(input, 'ru');
      expect(result.items.length).toBe(2);
      expect(result.estimatedEcoCoins).toBe(0);
      expect(result.confidence).toBe(90);
    });
  });

  describe('Case C: Flexible multilayer packaging', () => {
    it('should preserve mixed wasteType and format safe instructions', () => {
      const input: Partial<ScanResult> = {
        items: [
          {
            name: 'Мягкая упаковка от снеков (многослойная)',
            quantity: 4,
            wasteType: 'Mixed',
            status: 'Needs sorting',
            instructions: 'Проверьте маркировку C/PP или C/LDPE. Проверьте правила выбранного пункта приёма.',
          },
        ],
        totalEstimatedWeightKg: '0.04 – 0.08 кг',
        confidence: 85,
      };

      const result = ScanGuard.sanitize(input, 'ru');
      expect(result.items[0].wasteType).toBe('Mixed');
      expect(result.items[0].status).toBe('Needs sorting');
    });
  });

  describe('Case D & G: Full Automotive Tire vs Light Scene', () => {
    it('should recognize high mass for genuine full tire and enforce heavy weight band', () => {
      const input: Partial<ScanResult> = {
        items: [
          {
            name: 'Автомобильная шина с протектором',
            quantity: 1,
            wasteType: 'Rubber',
            status: 'Accepted',
            instructions: 'Сдать на специализированный пункт переработки шин.',
          },
        ],
        totalEstimatedWeightKg: '0.1 кг', // Severe underestimate anomaly from LLM
        confidence: 95,
      };

      const result = ScanGuard.sanitize(input, 'ru');
      // Guard detects severe underestimate anomaly and corrects to realistic tire band (~5-12 kg)
      expect(result.totalEstimatedWeightKg).toContain('≈');
      expect(result.totalEstimatedWeightKg).toContain('5');
    });
  });

  describe('Case E & F: Rubber inner tube (ECOSCAN-VISION-001 Regression Ground Truth)', () => {
    it('should correct severe weight anomaly (e.g. 2.5-4.0 kg) down to realistic lightweight/medium range (≈ 0.3-1.3 kg)', () => {
      // Exact Live Failure Payload from Regression Case #1
      const failureInput: Partial<ScanResult> = {
        items: [
          { name: 'Пластиковые бутылки', quantity: 2, wasteType: 'Plastic', status: 'Accepted', instructions: 'Сполоснуть' },
          { name: 'Крышки от бутылок', quantity: 10, wasteType: 'Plastic', status: 'Accepted', instructions: 'Собрать вместе' },
          { name: 'Мягкая упаковка', quantity: 4, wasteType: 'Mixed', status: 'Needs sorting', instructions: 'Проверить маркировку' },
          { name: 'Резиновая камера / трубчатый элемент', quantity: 1, wasteType: 'Rubber', status: 'Accepted', instructions: 'Очистить от пыли' },
        ],
        totalEstimatedWeightKg: '2.5–4.0 kg', // LIVE MODEL ANOMALY (overestimated as tire)
        estimatedEcoCoins: 45, // LIVE MODEL INVENTED REWARD
        moatImpact: 'Saves 0.5 kg CO2', // UNVERIFIED METRIC
        suggestedProduct: 'ZAMINAT will turn this tire into playground tiles', // UNSUPPORTED FACTORY CLAIM
        confidence: 91, // OVERCONFIDENCE
      };

      const result = ScanGuard.sanitize(failureInput, 'ru');

      // 1. Weight anomaly corrected to plausible mass range (~0.3 - 1.3 kg)
      expect(result.totalEstimatedWeightKg).not.toBe('2.5–4.0 kg');
      expect(result.totalEstimatedWeightKg).toContain('≈');
      expect(result.totalEstimatedWeightKg).toContain('кг');

      // 2. EcoCoins zeroed (governed server-side)
      expect(result.estimatedEcoCoins).toBe(0);

      // 3. Overconfidence calibrated down due to rubber ambiguity
      expect(result.confidence).toBeLessThanOrEqual(85);

      // 4. Qualitative impact claim without fake metrics
      expect(result.moatImpact).not.toContain('0.5 kg CO2');
      expect(result.moatImpact).toContain('хозяйственный цикл');

      // 5. Suggested product pathway rather than guaranteed factory production
      expect(result.suggestedProduct).toContain('Возможное направление');
    });

    it('should handle plausible 3-bottle count (2 visible + 1 partially occluded) within the same plausible mass range', () => {
      const input3Bottles: Partial<ScanResult> = {
        items: [
          { name: 'Пластиковые бутылки (включая частично перекрытую)', quantity: 3, wasteType: 'Plastic', status: 'Accepted', instructions: 'Сполоснуть' },
          { name: 'Крышки от бутылок', quantity: 10, wasteType: 'Plastic', status: 'Accepted', instructions: 'Собрать вместе' },
          { name: 'Мягкая упаковка', quantity: 4, wasteType: 'Mixed', status: 'Needs sorting', instructions: 'Проверить маркировку' },
          { name: 'Резиновая камера / трубчатый элемент', quantity: 1, wasteType: 'Rubber', status: 'Accepted', instructions: 'Очистить от пыли' },
        ],
        totalEstimatedWeightKg: '0.4 – 1.2 кг',
        confidence: 82,
      };

      const result = ScanGuard.sanitize(input3Bottles, 'ru');
      expect(result.items[0].quantity).toBe(3);
      expect(result.estimatedEcoCoins).toBe(0);
      expect(result.confidence).toBeLessThanOrEqual(85);
    });
  });

  describe('Case L, M, N: Multilingual Terminology', () => {
    it('should generate natural Uzbek wording for UZ language', () => {
      const input: Partial<ScanResult> = {
        items: [
          { name: 'Plastik idish', quantity: 1, wasteType: 'Plastic', status: 'Accepted', instructions: 'Yuvish' },
        ],
        totalEstimatedWeightKg: '', // Empty weight trigger
      };

      const result = ScanGuard.sanitize(input, 'uz');
      expect(result.totalEstimatedWeightKg).toContain('kg');
      expect(result.totalEstimatedWeightKg).toContain('taxminiy');
      expect(result.moatImpact).toContain('iqtisodiy muomalaga');
    });

    it('should generate natural English wording for EN language', () => {
      const input: Partial<ScanResult> = {
        items: [
          { name: 'Plastic bottle', quantity: 1, wasteType: 'Plastic', status: 'Accepted', instructions: 'Rinse' },
        ],
        totalEstimatedWeightKg: '',
      };

      const result = ScanGuard.sanitize(input, 'en');
      expect(result.totalEstimatedWeightKg).toContain('visual estimate');
      expect(result.moatImpact).toContain('economic cycle');
    });
  });

  describe('Case O: Overconfidence Prevention', () => {
    it('should cap confidence when ambiguous rubber ring / tube is detected', () => {
      const input: Partial<ScanResult> = {
        items: [
          { name: 'Резиновая камера / кольцеобразный резиновый элемент', quantity: 1, wasteType: 'Rubber', status: 'Accepted', instructions: 'Очистить' },
        ],
        confidence: 98,
      };

      const result = ScanGuard.sanitize(input, 'ru');
      expect(result.confidence).toBe(82);
    });
  });

  describe('Environmental Impact Claim Sanitization (Bidirectional Metrics & Live Regression)', () => {
    const defaultItem = [{ name: 'Бутылка ПЭТ', quantity: 1, wasteType: 'Plastic', status: 'Accepted' as const, instructions: 'Сполоснуть' }];

    it('MANDATORY LIVE REGRESSION: should sanitize live Russian reversed-order CO₂ claim', () => {
      const liveInput: Partial<ScanResult> = {
        items: defaultItem,
        moatImpact: 'Предотвращает загрязнение почвы пластиком и сокращает выбросы CO₂ на 0.1 кг.',
      };

      const result = ScanGuard.sanitize(liveInput, 'ru');

      expect(result.moatImpact).not.toContain('0.1');
      expect(result.moatImpact).not.toContain('CO₂');
      expect(result.moatImpact).toBe(
        'Передача распознанных материалов в подходящие потоки сбора может помочь вернуть часть ресурсов в хозяйственный цикл и уменьшить объём материалов, направляемых на захоронение.',
      );
    });

    it('Order A: should sanitize Metric -> Term order ("Saves 0.5 kg CO2")', () => {
      const input: Partial<ScanResult> = {
        items: defaultItem,
        moatImpact: 'Saves 0.5 kg CO2',
      };
      const result = ScanGuard.sanitize(input, 'en');
      expect(result.moatImpact).not.toContain('0.5');
      expect(result.moatImpact).toContain('economic cycle');
    });

    it('Order B: should sanitize Term -> Metric order ("CO2 reduced by 0.5 kg")', () => {
      const input: Partial<ScanResult> = {
        items: defaultItem,
        moatImpact: 'CO2 reduced by 0.5 kg',
      };
      const result = ScanGuard.sanitize(input, 'en');
      expect(result.moatImpact).not.toContain('0.5');
      expect(result.moatImpact).toContain('economic cycle');
    });

    it('should sanitize decimal comma Russian expressions ("сокращает выбросы CO₂ на 0,1 кг", "примерно 1,2 кг CO₂")', () => {
      const input1 = ScanGuard.sanitize({ items: defaultItem, moatImpact: 'сокращает выбросы CO₂ на 0,1 кг' }, 'ru');
      expect(input1.moatImpact).not.toContain('0,1');
      expect(input1.moatImpact).toContain('хозяйственный цикл');

      const input2 = ScanGuard.sanitize({ items: defaultItem, moatImpact: 'примерно 1,2 кг CO₂' }, 'ru');
      expect(input2.moatImpact).not.toContain('1,2');
      expect(input2.moatImpact).toContain('хозяйственный цикл');
    });

    it('should sanitize percentage emission and diversion claims ("carbon footprint reduced 12%", "landfill diversion: 25%")', () => {
      const input1 = ScanGuard.sanitize({ items: defaultItem, moatImpact: 'carbon footprint reduced 12%' }, 'en');
      expect(input1.moatImpact).not.toContain('12%');
      expect(input1.moatImpact).toContain('economic cycle');

      const input2 = ScanGuard.sanitize({ items: defaultItem, moatImpact: '12% reduction in emissions' }, 'en');
      expect(input2.moatImpact).not.toContain('12%');
      expect(input2.moatImpact).toContain('economic cycle');

      const input3 = ScanGuard.sanitize({ items: defaultItem, moatImpact: 'landfill diversion: 25%' }, 'en');
      expect(input3.moatImpact).not.toContain('25%');
      expect(input3.moatImpact).toContain('economic cycle');
    });

    it('should sanitize approximate prefixes and metric variants ("CO₂ ≈ 0,8 кг", "снижение выбросов на 250 г", "avoids approximately 2 kg CO2e")', () => {
      const input1 = ScanGuard.sanitize({ items: defaultItem, moatImpact: 'CO₂ ≈ 0,8 кг' }, 'ru');
      expect(input1.moatImpact).not.toContain('0,8');
      expect(input1.moatImpact).toContain('хозяйственный цикл');

      const input2 = ScanGuard.sanitize({ items: defaultItem, moatImpact: 'снижение выбросов на 250 г' }, 'ru');
      expect(input2.moatImpact).not.toContain('250');
      expect(input2.moatImpact).toContain('хозяйственный цикл');

      const input3 = ScanGuard.sanitize({ items: defaultItem, moatImpact: 'avoids approximately 2 kg CO2e' }, 'en');
      expect(input3.moatImpact).not.toContain('2');
      expect(input3.moatImpact).toContain('economic cycle');
    });

    it('should PRESERVE qualitative safe educational impact text without modification', () => {
      const safeRussian = 'Передача пластика в подходящий поток сбора помогает возвращать материалы в хозяйственный цикл.';
      const resultRu = ScanGuard.sanitize({ items: defaultItem, moatImpact: safeRussian }, 'ru');
      expect(resultRu.moatImpact).toBe(safeRussian);

      const safeEnglish = 'Proper collection and sorting of secondary raw materials helps support regional circular economy initiatives.';
      const resultEn = ScanGuard.sanitize({ items: defaultItem, moatImpact: safeEnglish }, 'en');
      expect(resultEn.moatImpact).toBe(safeEnglish);

      const safeUzbek = 'Materiallarni to‘g‘ri saralash va qayta ishlashga topshirish tabiiy resurslarni tejashga xizmat qiladi.';
      const resultUz = ScanGuard.sanitize({ items: defaultItem, moatImpact: safeUzbek }, 'uz');
      expect(resultUz.moatImpact).toBe(safeUzbek);
    });

    it('PERMANENT FALSE-POSITIVE REGRESSION SUITE: should NOT sanitize non-impact numbers, years, counts, resin codes, material masses, or unrelated lexical matches', () => {
      const falsePositiveCases = [
        { label: 'A. Resin code without impact metric', text: 'PET 01 bottle identified.' },
        { label: 'B. Historical year without impact metric', text: 'This material was introduced in 2024.' },
        { label: 'C. CO2 climate educational statement without metric', text: 'CO2 is an important greenhouse gas discussed in climate education.' },
        { label: 'D. CO2 campaign with calendar year', text: 'CO2 awareness campaign launched in 2024.' },
        { label: 'E. Object count instruction', text: 'Separate 2 bottle caps before collection.' },
        { label: 'F. Location / Point identifier', text: 'Use collection point number 12.' },
        { label: 'G. Qualitative environmental impact statement', text: 'Recycling can help reduce environmental impact.' },
        { label: 'H. Action word with packaging weight without climate term', text: 'Reduce package weight by 5 kg.' },
        { label: 'I. Raw production material mass', text: 'Production batch uses 25 kg of PET.' },
        { label: 'J. CO2 module version number', text: 'CO2 education module version 2.' },
        { label: 'K. Carbonated beverage metric sample', text: 'Carbonated beverage sample weighs 5 kg.' },
        { label: 'L. Metric preceding carbonated beverage', text: '5 kg of carbonated beverage was identified.' },
        { label: 'M. Diversionary traffic route percentage', text: 'Diversionary route moved 25% of traffic.' },
        { label: 'N. Emissionless prototype mass', text: 'Emissionless engine prototype weighs 25 kg.' },
        { label: 'O. Carbonation test material mass', text: 'Carbonation test used 2 kg of material.' },
      ];

      for (const { label, text } of falsePositiveCases) {
        const result = ScanGuard.sanitize({ items: defaultItem, moatImpact: text }, 'en');
        expect(result.moatImpact).toBe(text);
      }
    });
  });
});
