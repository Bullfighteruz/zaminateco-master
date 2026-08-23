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
});
