import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateEggocoins, calculateAdjustedKg } from '../src/services/points.service.js';

describe('EGGOCOINS calculation', () => {
  it('calculates correctly for clean delivery (Grade A)', () => {
    const result = calculateEggocoins({ kg_brutos: 80, pct_impropios: 5 }, 5);
    assert.strictEqual(result.quality_grade, 'A');
    assert.strictEqual(result.factor_calidad, 1.2);
    assert.strictEqual(result.factor_alianza, 1.1);
    assert.strictEqual(result.eggocoins, 100.32);
  });

  it('calculates correctly for dirty delivery (Grade C)', () => {
    const result = calculateEggocoins({ kg_brutos: 60, pct_impropios: 25 }, 2);
    assert.strictEqual(result.quality_grade, 'C');
    assert.strictEqual(result.factor_calidad, 0.8);
    assert.strictEqual(result.factor_alianza, 1.0);
    assert.strictEqual(result.eggocoins, 36);
  });
});

describe('Carbon credit accumulation', () => {
  it('applies 70% conservative factor', () => {
    const adjusted = calculateAdjustedKg(100, 0.70);
    assert.strictEqual(adjusted, 70);
  });
});
