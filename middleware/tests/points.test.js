const { calculateEggocoins, getQualityGrade } = require('../src/services/points.service');

describe('EGGOCOINS Calculation', () => {
  test('Grade A clean delivery with loyalty bonus', () => {
    const result = calculateEggocoins({
      kg_brutos: 80, pct_impropios: 5, factor_alianza: 1.1
    });
    expect(result.quality_grade).toBe('A');
    expect(result.factor_calidad).toBe(1.2);
    expect(result.eggocoins).toBeCloseTo(100.32, 1);
  });

  test('Grade C contaminated delivery, no loyalty', () => {
    const result = calculateEggocoins({
      kg_brutos: 60, pct_impropios: 25, factor_alianza: 1.0
    });
    expect(result.quality_grade).toBe('C');
    expect(result.factor_calidad).toBe(0.8);
    expect(result.eggocoins).toBeCloseTo(36.0, 1);
  });

  test('Grade D heavily contaminated', () => {
    const result = calculateEggocoins({
      kg_brutos: 100, pct_impropios: 40, factor_alianza: 1.0
    });
    expect(result.quality_grade).toBe('D');
    expect(result.eggocoins).toBeCloseTo(30.0, 1);
  });

  test('Quality grades are correct', () => {
    expect(getQualityGrade(3)).toBe('A');
    expect(getQualityGrade(10)).toBe('B');
    expect(getQualityGrade(20)).toBe('C');
    expect(getQualityGrade(35)).toBe('D');
  });
});
