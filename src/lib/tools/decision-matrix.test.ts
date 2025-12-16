/**
 * @fileoverview Decision matrix tool unit tests.
 *
 * Comprehensive tests for the quantitative decision-making tool:
 * - DecisionMatrix class construction and validation
 * - Analysis methods (weighted, normalized, ranking, best_worst)
 * - DecisionResult output formatting (toString, toJSON)
 * - makeDecision() convenience function
 * - compareMethods() multi-method comparison
 * - Real-world scenarios and edge cases
 * - Strengths/weaknesses identification
 * - Winner explanation generation
 *
 * @module lib/tools/decision-matrix.test
 * @see {@link module:lib/tools/decision-matrix} - Implementation
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  DecisionMatrix,
  DecisionResult,
  makeDecision,
  compareMethods,
  type DecisionMatrixInput,
  type AnalysisMethod,
} from './decision-matrix';

// =============================================================================
// Test Data
// =============================================================================

const basicInput: DecisionMatrixInput = {
  options: ['Option A', 'Option B', 'Option C'],
  criteria: ['Cost', 'Speed', 'Quality'],
  scores: {
    'Option A': [7, 8, 6],
    'Option B': [9, 5, 7],
    'Option C': [6, 9, 8],
  },
};

const weightedInput: DecisionMatrixInput = {
  ...basicInput,
  weights: [0.5, 0.3, 0.2], // Cost is most important
};

const programmingLanguages: DecisionMatrixInput = {
  options: ['Python', 'JavaScript', 'Go', 'Rust'],
  criteria: ['Learning Curve', 'Performance', 'Community', 'Job Market'],
  scores: {
    Python: [9, 6, 10, 9],
    JavaScript: [8, 5, 9, 10],
    Go: [6, 9, 7, 7],
    Rust: [4, 10, 6, 6],
  },
  weights: [0.2, 0.3, 0.25, 0.25],
};

// =============================================================================
// DecisionMatrix Class Tests
// =============================================================================

describe('DecisionMatrix', () => {
  describe('constructor', () => {
    it('creates a valid matrix with basic input', () => {
      const matrix = new DecisionMatrix(basicInput);
      expect(matrix).toBeInstanceOf(DecisionMatrix);
    });

    it('creates a matrix with custom weights', () => {
      const matrix = new DecisionMatrix(weightedInput);
      expect(matrix).toBeInstanceOf(DecisionMatrix);
    });

    it('throws error for empty options', () => {
      expect(() => {
        new DecisionMatrix({
          options: [],
          criteria: ['Cost'],
          scores: {},
        });
      }).toThrow('Must provide at least one option');
    });

    it('throws error for empty criteria', () => {
      expect(() => {
        new DecisionMatrix({
          options: ['Option A'],
          criteria: [],
          scores: { 'Option A': [] },
        });
      }).toThrow('Must provide at least one criterion');
    });

    it('throws error for missing scores', () => {
      expect(() => {
        new DecisionMatrix({
          options: ['Option A', 'Option B'],
          criteria: ['Cost'],
          scores: { 'Option A': [5] },
        });
      }).toThrow('Missing scores for option: Option B');
    });

    it('throws error for mismatched score/criteria count', () => {
      expect(() => {
        new DecisionMatrix({
          options: ['Option A'],
          criteria: ['Cost', 'Speed'],
          scores: { 'Option A': [5] }, // Only 1 score, 2 criteria
        });
      }).toThrow("Option 'Option A' has 1 scores but 2 criteria");
    });
  });

  describe('analyze()', () => {
    it('returns a DecisionResult', () => {
      const matrix = new DecisionMatrix(basicInput);
      const result = matrix.analyze();
      expect(result).toBeInstanceOf(DecisionResult);
    });

    it('identifies a winner', () => {
      const matrix = new DecisionMatrix(basicInput);
      const result = matrix.analyze();
      expect(result.winner).toBeTruthy();
      expect(basicInput.options).toContain(result.winner);
    });

    it('produces rankings for all options', () => {
      const matrix = new DecisionMatrix(basicInput);
      const result = matrix.analyze();
      expect(result.rankings).toHaveLength(basicInput.options.length);
    });

    it('rankings are sorted by score descending', () => {
      const matrix = new DecisionMatrix(basicInput);
      const result = matrix.analyze();
      for (let i = 1; i < result.rankings.length; i++) {
        expect(result.rankings[i - 1][1]).toBeGreaterThanOrEqual(result.rankings[i][1]);
      }
    });

    it('winner is first in rankings', () => {
      const matrix = new DecisionMatrix(basicInput);
      const result = matrix.analyze();
      expect(result.rankings[0][0]).toBe(result.winner);
    });
  });

  describe('weighted method', () => {
    it('uses default equal weights when not provided', () => {
      const matrix = new DecisionMatrix(basicInput);
      const result = matrix.analyze();
      expect(result.analysisMethod).toBe('Weighted Score');
    });

    it('applies custom weights correctly', () => {
      // With high weight on Cost (0.5), Option B (cost=9) should win
      const matrix = new DecisionMatrix(weightedInput);
      const result = matrix.analyze();
      expect(result.winner).toBe('Option B');
    });

    it('produces scores breakdown', () => {
      const matrix = new DecisionMatrix(basicInput);
      const result = matrix.analyze();
      expect(Object.keys(result.scoresBreakdown)).toHaveLength(3);
    });
  });

  describe('normalized method', () => {
    it('produces normalized analysis', () => {
      const matrix = new DecisionMatrix({ ...basicInput, method: 'normalized' });
      const result = matrix.analyze();
      expect(result.analysisMethod).toBe('Normalized Score (0-100)');
    });

    it('scales scores to 0-100 range', () => {
      const matrix = new DecisionMatrix({ ...basicInput, method: 'normalized' });
      const result = matrix.analyze();
      for (const [, scores] of Object.entries(result.scoresBreakdown)) {
        for (const score of Object.values(scores)) {
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('ranking method', () => {
    it('produces ranking analysis', () => {
      const matrix = new DecisionMatrix({ ...basicInput, method: 'ranking' });
      const result = matrix.analyze();
      expect(result.analysisMethod).toBe('Ranking Method');
    });

    it('converts scores to ranks', () => {
      const matrix = new DecisionMatrix({ ...basicInput, method: 'ranking' });
      const result = matrix.analyze();
      // Ranks should be 1, 2, 3 for each criterion
      for (const [, scores] of Object.entries(result.scoresBreakdown)) {
        for (const rank of Object.values(scores)) {
          expect(rank).toBeGreaterThanOrEqual(1);
          expect(rank).toBeLessThanOrEqual(basicInput.options.length);
        }
      }
    });
  });

  describe('best_worst method', () => {
    it('produces best-worst analysis', () => {
      const matrix = new DecisionMatrix({ ...basicInput, method: 'best_worst' });
      const result = matrix.analyze();
      expect(result.analysisMethod).toBe('Best-Worst Scaling');
    });
  });
});

// =============================================================================
// DecisionResult Class Tests
// =============================================================================

describe('DecisionResult', () => {
  let result: DecisionResult;

  beforeEach(() => {
    const matrix = new DecisionMatrix(basicInput);
    result = matrix.analyze();
  });

  describe('toString()', () => {
    it('returns a formatted string', () => {
      const str = result.toString();
      expect(typeof str).toBe('string');
      expect(str.length).toBeGreaterThan(0);
    });

    it('includes winner', () => {
      const str = result.toString();
      expect(str).toContain('WINNER');
      expect(str).toContain(result.winner);
    });

    it('includes confidence', () => {
      const str = result.toString();
      expect(str).toContain('Confidence');
    });

    it('includes rankings', () => {
      const str = result.toString();
      expect(str).toContain('RANKINGS');
    });

    it('includes recommendation', () => {
      const str = result.toString();
      expect(str).toContain('RECOMMENDATION');
    });
  });

  describe('comparisonTable()', () => {
    it('returns a formatted table', () => {
      const table = result.comparisonTable();
      expect(typeof table).toBe('string');
      expect(table).toContain('COMPARISON TABLE');
    });

    it('includes all criteria', () => {
      const table = result.comparisonTable();
      expect(table).toContain('Cost');
      expect(table).toContain('Speed');
      expect(table).toContain('Quality');
    });
  });

  describe('toObject()', () => {
    it('returns a plain object', () => {
      const obj = result.toObject();
      expect(typeof obj).toBe('object');
      expect(obj.winner).toBe(result.winner);
    });

    it('rounds scores to 2 decimal places', () => {
      const obj = result.toObject();
      for (const [, score] of obj.rankings) {
        const decimalPlaces = (score.toString().split('.')[1] || '').length;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('toJSON()', () => {
    it('returns valid JSON', () => {
      const json = result.toJSON();
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('parses back to equivalent object', () => {
      const json = result.toJSON();
      const parsed = JSON.parse(json);
      expect(parsed.winner).toBe(result.winner);
    });
  });
});

// =============================================================================
// makeDecision() Function Tests
// =============================================================================

describe('makeDecision()', () => {
  it('returns DecisionResult for single method', () => {
    const result = makeDecision(basicInput);
    expect(result).toBeInstanceOf(DecisionResult);
  });

  it('returns all methods when showAllMethods is true', () => {
    const results = makeDecision({ ...basicInput, showAllMethods: true });
    expect(results).not.toBeInstanceOf(DecisionResult);
    expect(typeof results).toBe('object');
    expect(results).toHaveProperty('weighted');
    expect(results).toHaveProperty('normalized');
    expect(results).toHaveProperty('ranking');
    expect(results).toHaveProperty('best_worst');
  });

  it('respects topN parameter', () => {
    const result = makeDecision({ ...basicInput, topN: 2 }) as DecisionResult;
    expect(result.topN).toBe(2);
  });

  it('allows specifying analysis method', () => {
    const result = makeDecision({ ...basicInput, method: 'normalized' }) as DecisionResult;
    expect(result.analysisMethod).toContain('Normalized');
  });
});

// =============================================================================
// compareMethods() Function Tests
// =============================================================================

describe('compareMethods()', () => {
  it('returns a formatted comparison string', () => {
    const comparison = compareMethods(
      basicInput.options,
      basicInput.criteria,
      basicInput.scores
    );
    expect(typeof comparison).toBe('string');
    expect(comparison).toContain('METHOD COMPARISON');
  });

  it('includes all four methods', () => {
    const comparison = compareMethods(
      basicInput.options,
      basicInput.criteria,
      basicInput.scores
    );
    expect(comparison).toContain('WEIGHTED');
    expect(comparison).toContain('NORMALIZED');
    expect(comparison).toContain('RANKING');
    expect(comparison).toContain('BEST_WORST');
  });

  it('shows consensus winner', () => {
    const comparison = compareMethods(
      basicInput.options,
      basicInput.criteria,
      basicInput.scores
    );
    expect(comparison).toContain('CONSENSUS');
  });
});

// =============================================================================
// Real-World Scenario Tests
// =============================================================================

describe('Real-world scenarios', () => {
  it('programming language decision', () => {
    const result = makeDecision(programmingLanguages) as DecisionResult;
    expect(result.winner).toBeTruthy();
    expect(result.confidenceScore).toBeGreaterThan(0);
  });

  it('handles ties gracefully', () => {
    const tiedInput: DecisionMatrixInput = {
      options: ['A', 'B'],
      criteria: ['X', 'Y'],
      scores: {
        A: [5, 5],
        B: [5, 5],
      },
    };
    const result = makeDecision(tiedInput) as DecisionResult;
    expect(result.winner).toBeTruthy();
    // Should have a warning about close scores
  });

  it('single option returns that option as winner', () => {
    const singleOption: DecisionMatrixInput = {
      options: ['Only Choice'],
      criteria: ['Any'],
      scores: { 'Only Choice': [5] },
    };
    const result = makeDecision(singleOption) as DecisionResult;
    expect(result.winner).toBe('Only Choice');
    expect(result.confidenceScore).toBe(100);
  });

  it('extreme weight distribution', () => {
    const extremeWeights: DecisionMatrixInput = {
      options: ['A', 'B', 'C'],
      criteria: ['Important', 'Ignored1', 'Ignored2'],
      scores: {
        A: [1, 10, 10],  // Low on important
        B: [10, 1, 1],   // High on important
        C: [5, 5, 5],    // Balanced
      },
      weights: [0.98, 0.01, 0.01], // Almost all weight on first criterion
    };
    const result = makeDecision(extremeWeights) as DecisionResult;
    expect(result.winner).toBe('B'); // Should win due to high "Important" score
  });

  it('many options performance', () => {
    const manyOptions: DecisionMatrixInput = {
      options: Array.from({ length: 20 }, (_, i) => `Option ${i + 1}`),
      criteria: ['A', 'B', 'C'],
      scores: Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => [
          `Option ${i + 1}`,
          [Math.random() * 10, Math.random() * 10, Math.random() * 10],
        ])
      ),
    };
    const start = performance.now();
    const result = makeDecision(manyOptions) as DecisionResult;
    const duration = performance.now() - start;

    expect(result.rankings).toHaveLength(20);
    expect(duration).toBeLessThan(100); // Should complete in < 100ms
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('Edge cases', () => {
  it('handles decimal scores', () => {
    const decimalInput: DecisionMatrixInput = {
      options: ['A', 'B'],
      criteria: ['X'],
      scores: {
        A: [7.5],
        B: [7.4],
      },
    };
    const result = makeDecision(decimalInput) as DecisionResult;
    expect(result.winner).toBe('A');
  });

  it('handles zero scores', () => {
    const zeroInput: DecisionMatrixInput = {
      options: ['A', 'B'],
      criteria: ['X', 'Y'],
      scores: {
        A: [0, 5],
        B: [5, 0],
      },
    };
    const result = makeDecision(zeroInput) as DecisionResult;
    expect(result.winner).toBeTruthy();
  });

  it('handles negative scores', () => {
    const negativeInput: DecisionMatrixInput = {
      options: ['A', 'B'],
      criteria: ['X'],
      scores: {
        A: [-5],
        B: [-10],
      },
    };
    const result = makeDecision(negativeInput) as DecisionResult;
    expect(result.winner).toBe('A'); // -5 > -10
  });

  it('handles very large scores', () => {
    const largeInput: DecisionMatrixInput = {
      options: ['A', 'B'],
      criteria: ['X'],
      scores: {
        A: [1000000],
        B: [999999],
      },
    };
    const result = makeDecision(largeInput) as DecisionResult;
    expect(result.winner).toBe('A');
  });

  it('handles special characters in names', () => {
    const specialInput: DecisionMatrixInput = {
      options: ['Option (A)', 'Option "B"', "Option 'C'"],
      criteria: ['Cost & Speed', 'Quality/Value'],
      scores: {
        'Option (A)': [5, 5],
        'Option "B"': [6, 6],
        "Option 'C'": [7, 7],
      },
    };
    const result = makeDecision(specialInput) as DecisionResult;
    expect(result.winner).toBe("Option 'C'");
  });
});

// =============================================================================
// Strengths & Weaknesses Tests
// =============================================================================

describe('Strengths and Weaknesses', () => {
  it('identifies strengths for each option', () => {
    const matrix = new DecisionMatrix(programmingLanguages);
    const result = matrix.analyze();

    expect(result.strengths).toBeTruthy();
    expect(Object.keys(result.strengths)).toHaveLength(4);
  });

  it('identifies weaknesses for each option', () => {
    const matrix = new DecisionMatrix(programmingLanguages);
    const result = matrix.analyze();

    expect(result.weaknesses).toBeTruthy();
    expect(Object.keys(result.weaknesses)).toHaveLength(4);
  });

  it('strengths and weaknesses do not overlap', () => {
    const matrix = new DecisionMatrix(programmingLanguages);
    const result = matrix.analyze();

    for (const option of programmingLanguages.options) {
      const strengthCriteria = new Set(result.strengths[option]?.map(([c]) => c) || []);
      const weaknessCriteria = result.weaknesses[option]?.map(([c]) => c) || [];

      for (const weakness of weaknessCriteria) {
        expect(strengthCriteria.has(weakness)).toBe(false);
      }
    }
  });
});

// =============================================================================
// Why Winner Won Tests
// =============================================================================

describe('Why Winner Won', () => {
  it('provides explanation for winner', () => {
    const matrix = new DecisionMatrix(programmingLanguages);
    const result = matrix.analyze();

    expect(result.whyWinnerWon).toBeTruthy();
    expect(result.whyWinnerWon.length).toBeGreaterThan(0);
  });

  it('explanation mentions criteria', () => {
    const matrix = new DecisionMatrix(weightedInput);
    const result = matrix.analyze();

    // The explanation should mention at least one criterion
    const hasCriterion = weightedInput.criteria.some(
      c => result.whyWinnerWon.includes(c)
    );
    // Or it should have a generic explanation
    expect(hasCriterion || result.whyWinnerWon.includes('performance')).toBe(true);
  });
});
