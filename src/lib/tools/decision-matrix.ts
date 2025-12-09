/**
 * Decision Matrix Utility
 * -----------------------
 * A comprehensive decision-making tool for quantifying and comparing options
 * against multiple criteria.
 *
 * Usage:
 *   import { makeDecision } from '../lib/tools/decision-matrix';
 *
 *   const result = makeDecision({
 *     options: ["Option A", "Option B", "Option C"],
 *     criteria: ["Cost", "Speed", "Quality"],
 *     scores: {
 *       "Option A": [7, 8, 6],
 *       "Option B": [9, 5, 7],
 *       "Option C": [6, 9, 8]
 *     },
 *     weights: [0.3, 0.2, 0.5]  // Optional: importance of each criterion
 *   });
 *
 *   console.log(result.toString());  // Shows ranking and analysis
 */

import { debug } from '../debug';

const MODULE = 'decision-matrix';

// Types
export type AnalysisMethod = 'weighted' | 'normalized' | 'ranking' | 'best_worst';

export interface DecisionMatrixInput {
  options: string[];
  criteria: string[];
  scores: Record<string, number[]>;
  weights?: number[];
  method?: AnalysisMethod;
}

export interface MakeDecisionOptions extends DecisionMatrixInput {
  showAllMethods?: boolean;
  topN?: number;
}

export interface DecisionResultData {
  winner: string;
  rankings: Array<[string, number]>;
  scoresBreakdown: Record<string, Record<string, number>>;
  analysisMethod: string;
  totalScore: Record<string, number>;
  normalizedScores: Record<string, number>;
  confidenceScore: number;
  recommendation: string;
  warnings: string[];
  strengths: Record<string, Array<[string, number]>>;
  weaknesses: Record<string, Array<[string, number]>>;
  whyWinnerWon: string;
  topN?: number;
}

/**
 * Results from a decision matrix analysis.
 */
export class DecisionResult implements DecisionResultData {
  winner: string;
  rankings: Array<[string, number]>;
  scoresBreakdown: Record<string, Record<string, number>>;
  analysisMethod: string;
  totalScore: Record<string, number>;
  normalizedScores: Record<string, number>;
  confidenceScore: number;
  recommendation: string;
  warnings: string[];
  strengths: Record<string, Array<[string, number]>>;
  weaknesses: Record<string, Array<[string, number]>>;
  whyWinnerWon: string;
  topN?: number;

  constructor(data: Partial<DecisionResultData>) {
    this.winner = data.winner ?? '';
    this.rankings = data.rankings ?? [];
    this.scoresBreakdown = data.scoresBreakdown ?? {};
    this.analysisMethod = data.analysisMethod ?? '';
    this.totalScore = data.totalScore ?? {};
    this.normalizedScores = data.normalizedScores ?? {};
    this.confidenceScore = data.confidenceScore ?? 0;
    this.recommendation = data.recommendation ?? '';
    this.warnings = data.warnings ?? [];
    this.strengths = data.strengths ?? {};
    this.weaknesses = data.weaknesses ?? {};
    this.whyWinnerWon = data.whyWinnerWon ?? '';
    this.topN = data.topN;
  }

  /**
   * Format results for display.
   */
  toString(): string {
    const lines: string[] = [
      '='.repeat(70),
      `DECISION MATRIX RESULTS (${this.analysisMethod})`,
      '='.repeat(70),
      `\n🏆 WINNER: ${this.winner}`,
      `   Confidence: ${this.confidenceScore.toFixed(1)}%`,
    ];

    if (this.warnings.length > 0) {
      lines.push('\n⚠️  Warnings:');
      for (const warning of this.warnings) {
        lines.push(`   - ${warning}`);
      }
    }

    // Add "why winner won" explanation if available
    if (this.whyWinnerWon) {
      lines.push(`\n✨ WHY ${this.winner.toUpperCase()} WON:`);
      lines.push(`   ${this.whyWinnerWon}`);
    }

    lines.push('\n📊 RANKINGS:');

    // Show top N if specified, otherwise show all
    const displayRankings = this.topN
      ? this.rankings.slice(0, this.topN)
      : this.rankings;

    displayRankings.forEach(([option, score], i) => {
      const normalized = this.normalizedScores[option] ?? 0;
      lines.push(
        `   ${i + 1}. ${option.padEnd(20)} ` +
        `Score: ${score.toFixed(2).padStart(6)} (${normalized.toFixed(1).padStart(5)}%)`
      );

      // Show strengths and weaknesses if available
      if (this.strengths[option]?.length) {
        const topStrengths = this.strengths[option].slice(0, 2);
        const strengthStr = topStrengths
          .map(([c, s]) => `${c} (${s.toFixed(1)})`)
          .join(', ');
        lines.push(`      💪 Strengths: ${strengthStr}`);
      }

      if (this.weaknesses[option]?.length) {
        const topWeaknesses = this.weaknesses[option].slice(0, 2);
        const weaknessStr = topWeaknesses
          .map(([c, w]) => `${c} (${w.toFixed(1)})`)
          .join(', ');
        lines.push(`      ⚠️  Weaknesses: ${weaknessStr}`);
      }
    });

    if (this.topN && this.rankings.length > this.topN) {
      lines.push(`   ... and ${this.rankings.length - this.topN} more options`);
    }

    lines.push(
      '\n💡 RECOMMENDATION:',
      `   ${this.recommendation}`,
      '\n📋 DETAILED BREAKDOWN:'
    );

    for (const [option, criteriaScores] of Object.entries(this.scoresBreakdown)) {
      lines.push(`\n   ${option}:`);
      for (const [criterion, score] of Object.entries(criteriaScores)) {
        lines.push(`      ${criterion.padEnd(20)}: ${score.toFixed(2).padStart(6)}`);
      }
    }

    lines.push('='.repeat(70));
    return lines.join('\n');
  }

  /**
   * Generate a side-by-side comparison table.
   */
  comparisonTable(): string {
    if (Object.keys(this.scoresBreakdown).length === 0) {
      return 'No breakdown available for comparison table.';
    }

    // Get all criteria from the first option
    const firstOption = Object.keys(this.scoresBreakdown)[0];
    const criteria = Object.keys(this.scoresBreakdown[firstOption]);

    // Determine column widths
    const optionWidth = Math.max(...Object.keys(this.scoresBreakdown).map(opt => opt.length)) + 2;
    const criterionWidth = Math.max(...criteria.map(c => c.length)) + 2;

    // Build table
    const lines: string[] = ['\n📊 COMPARISON TABLE:', '='.repeat(70)];

    // Header row
    let header = 'Criterion'.padEnd(criterionWidth) + ' | ';
    for (const option of Object.keys(this.scoresBreakdown)) {
      header += option.padStart(Math.floor((optionWidth + option.length) / 2))
                      .padEnd(optionWidth) + ' | ';
    }
    header += 'Winner';
    lines.push(header);
    lines.push('-'.repeat(header.length));

    // Data rows
    for (const criterion of criteria) {
      // Extract just the criterion name (remove weight info)
      const cleanCriterion = criterion.split(' (')[0];

      let row = cleanCriterion.padEnd(criterionWidth) + ' | ';

      // Get scores for this criterion across all options
      const scores: Record<string, number> = {};
      for (const option of Object.keys(this.scoresBreakdown)) {
        const score = this.scoresBreakdown[option][criterion] ?? 0;
        scores[option] = score;
        row += score.toFixed(1).padStart(Math.floor(optionWidth / 2))
                              .padEnd(optionWidth) + ' | ';
      }

      // Find winner for this criterion
      const winner = Object.entries(scores).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0];
      row += winner;
      lines.push(row);
    }

    lines.push('='.repeat(70));
    return lines.join('\n');
  }

  /**
   * Convert to plain object for serialization.
   */
  toObject(): DecisionResultData {
    return {
      winner: this.winner,
      rankings: this.rankings.map(([opt, score]) => [opt, Math.round(score * 100) / 100]),
      scoresBreakdown: Object.fromEntries(
        Object.entries(this.scoresBreakdown).map(([opt, critScores]) => [
          opt,
          Object.fromEntries(
            Object.entries(critScores).map(([crit, score]) => [crit, Math.round(score * 100) / 100])
          )
        ])
      ),
      analysisMethod: this.analysisMethod,
      totalScore: Object.fromEntries(
        Object.entries(this.totalScore).map(([opt, score]) => [opt, Math.round(score * 100) / 100])
      ),
      normalizedScores: Object.fromEntries(
        Object.entries(this.normalizedScores).map(([opt, score]) => [opt, Math.round(score * 100) / 100])
      ),
      confidenceScore: Math.round(this.confidenceScore * 100) / 100,
      recommendation: this.recommendation,
      warnings: this.warnings,
      strengths: Object.fromEntries(
        Object.entries(this.strengths).map(([opt, strengths]) => [
          opt,
          strengths.map(([c, s]) => [c, Math.round(s * 100) / 100] as [string, number])
        ])
      ),
      weaknesses: Object.fromEntries(
        Object.entries(this.weaknesses).map(([opt, weaknesses]) => [
          opt,
          weaknesses.map(([c, w]) => [c, Math.round(w * 100) / 100] as [string, number])
        ])
      ),
      whyWinnerWon: this.whyWinnerWon,
      topN: this.topN,
    };
  }

  /**
   * Convert to JSON string.
   */
  toJSON(indent = 2): string {
    return JSON.stringify(this.toObject(), null, indent);
  }
}

/**
 * A flexible decision matrix for evaluating options against criteria.
 *
 * Supports multiple analysis methods:
 * - weighted: Traditional weighted score (default)
 * - normalized: Normalized scores (0-100 scale)
 * - ranking: Convert scores to rankings per criterion
 * - best_worst: Best-worst scaling method
 */
export class DecisionMatrix {
  private options: string[];
  private criteria: string[];
  private scores: Record<string, number[]>;
  private weights: number[];
  private method: AnalysisMethod;

  constructor(input: DecisionMatrixInput) {
    debug.group(MODULE, 'DecisionMatrix Constructor');
    debug.log(MODULE, 'Input received', {
      optionCount: input.options.length,
      criteriaCount: input.criteria.length,
      method: input.method ?? 'weighted',
      hasCustomWeights: !!input.weights,
    });

    this.options = input.options;
    this.criteria = input.criteria;
    this.scores = input.scores;
    this.method = input.method ?? 'weighted';

    // Validate inputs
    this.validateInputs();
    debug.success(MODULE, 'Input validation passed');

    // Set weights (equal if not provided)
    if (!input.weights) {
      this.weights = Array(this.criteria.length).fill(1.0 / this.criteria.length);
      debug.log(MODULE, 'Using equal weights', this.weights);
    } else {
      // Normalize weights to sum to 1
      const total = input.weights.reduce((a, b) => a + b, 0);
      this.weights = input.weights.map(w => w / total);
      debug.log(MODULE, 'Normalized weights', {
        original: input.weights,
        normalized: this.weights,
        total,
      });
    }
    debug.groupEnd();
  }

  private validateInputs(): void {
    debug.log(MODULE, 'Validating inputs...');

    if (this.options.length === 0) {
      debug.error(MODULE, 'Validation failed: no options provided');
      throw new Error('Must provide at least one option');
    }

    if (this.criteria.length === 0) {
      debug.error(MODULE, 'Validation failed: no criteria provided');
      throw new Error('Must provide at least one criterion');
    }

    if (Object.keys(this.scores).length === 0) {
      debug.error(MODULE, 'Validation failed: no scores provided');
      throw new Error('Must provide scores');
    }

    // Check all options have scores
    for (const option of this.options) {
      if (!(option in this.scores)) {
        debug.error(MODULE, `Validation failed: missing scores for "${option}"`);
        throw new Error(`Missing scores for option: ${option}`);
      }

      if (this.scores[option].length !== this.criteria.length) {
        debug.error(MODULE, `Validation failed: score count mismatch for "${option}"`, {
          scoresProvided: this.scores[option].length,
          criteriaCount: this.criteria.length,
        });
        throw new Error(
          `Option '${option}' has ${this.scores[option].length} ` +
          `scores but ${this.criteria.length} criteria`
        );
      }
    }
  }

  /**
   * Perform decision matrix analysis.
   */
  analyze(): DecisionResult {
    const endTimer = debug.time(MODULE, `analyze(${this.method})`);

    let result: DecisionResult;
    switch (this.method) {
      case 'weighted':
        result = this.analyzeWeighted();
        break;
      case 'normalized':
        result = this.analyzeNormalized();
        break;
      case 'ranking':
        result = this.analyzeRanking();
        break;
      case 'best_worst':
        result = this.analyzeBestWorst();
        break;
      default:
        debug.error(MODULE, `Unknown analysis method: ${this.method}`);
        throw new Error(`Unknown analysis method: ${this.method}`);
    }

    endTimer();
    debug.success(MODULE, 'Analysis complete', {
      winner: result.winner,
      confidence: result.confidenceScore.toFixed(1) + '%',
      rankings: result.rankings.map(([opt, score]) => `${opt}: ${score.toFixed(2)}`),
    });

    return result;
  }

  private analyzeWeighted(): DecisionResult {
    debug.log(MODULE, 'Running weighted analysis...');
    const totalScores: Record<string, number> = {};
    const breakdown: Record<string, Record<string, number>> = {};

    // Calculate weighted scores
    for (const option of this.options) {
      const optionScores = this.scores[option];
      const weightedTotal = optionScores.reduce(
        (sum, score, i) => sum + score * this.weights[i],
        0
      );
      totalScores[option] = weightedTotal;
      debug.log(MODULE, `Weighted total for "${option}"`, {
        rawScores: optionScores,
        weightedTotal: weightedTotal.toFixed(2),
      });

      // Build breakdown
      breakdown[option] = {};
      for (let i = 0; i < this.criteria.length; i++) {
        const weightedScore = optionScores[i] * this.weights[i];
        breakdown[option][`${this.criteria[i]} (w=${this.weights[i].toFixed(2)})`] = weightedScore;
      }
    }

    // Rank options
    const rankings = Object.entries(totalScores)
      .sort((a, b) => b[1] - a[1]) as Array<[string, number]>;

    // Normalize scores to percentages
    const maxScore = Math.max(...Object.values(totalScores));
    const normalized: Record<string, number> = {};
    for (const [opt, score] of Object.entries(totalScores)) {
      normalized[opt] = (score / maxScore) * 100;
    }

    // Calculate improved confidence (gap between 1st and 2nd)
    let confidence: number;
    if (rankings.length > 1) {
      const gap = rankings[0][1] - rankings[1][1];
      const normalizedGap = normalized[rankings[0][0]] - normalized[rankings[1][0]];
      confidence = this.improveConfidenceScore(gap, rankings[0][1], normalizedGap);
    } else {
      confidence = 100.0;
    }

    // Calculate strengths and weaknesses
    const { strengths, weaknesses } = this.calculateStrengthsWeaknesses(breakdown);

    // Calculate why winner won
    const whyWinnerWon = this.calculateWhyWinnerWon(rankings[0][0], rankings, breakdown);

    // Generate recommendation
    const recommendation = this.generateRecommendation(rankings, normalized, confidence);
    const warnings = this.generateWarnings(rankings, normalized);

    return new DecisionResult({
      winner: rankings[0][0],
      rankings,
      scoresBreakdown: breakdown,
      analysisMethod: 'Weighted Score',
      totalScore: totalScores,
      normalizedScores: normalized,
      confidenceScore: confidence,
      recommendation,
      warnings,
      strengths,
      weaknesses,
      whyWinnerWon,
    });
  }

  private analyzeNormalized(): DecisionResult {
    const normalizedScores: Record<string, number[]> = {};
    const breakdown: Record<string, Record<string, number>> = {};

    // Normalize each criterion to 0-100
    for (let criterionIdx = 0; criterionIdx < this.criteria.length; criterionIdx++) {
      const criterionScores = this.options.map(opt => this.scores[opt][criterionIdx]);
      const minScore = Math.min(...criterionScores);
      const maxScore = Math.max(...criterionScores);
      const scoreRange = maxScore > minScore ? maxScore - minScore : 1;

      for (const option of this.options) {
        const rawScore = this.scores[option][criterionIdx];
        const normalized = ((rawScore - minScore) / scoreRange) * 100;

        if (!normalizedScores[option]) {
          normalizedScores[option] = [];
        }
        normalizedScores[option].push(normalized);
      }
    }

    // Calculate weighted totals
    const totalScores: Record<string, number> = {};
    for (const option of this.options) {
      const weightedTotal = normalizedScores[option].reduce(
        (sum, score, i) => sum + score * this.weights[i],
        0
      );
      totalScores[option] = weightedTotal;

      // Build breakdown
      breakdown[option] = {};
      for (let i = 0; i < this.criteria.length; i++) {
        breakdown[option][`${this.criteria[i]} (normalized)`] = normalizedScores[option][i];
      }
    }

    // Rank options
    const rankings = Object.entries(totalScores)
      .sort((a, b) => b[1] - a[1]) as Array<[string, number]>;

    // Scores already normalized to 100
    const normalized: Record<string, number> = {};
    for (const [opt, score] of Object.entries(totalScores)) {
      normalized[opt] = (score / 100) * 100;
    }

    // Calculate confidence
    let confidence: number;
    if (rankings.length > 1) {
      const gap = rankings[0][1] - rankings[1][1];
      confidence = Math.min(100, gap);
    } else {
      confidence = 100.0;
    }

    const recommendation = this.generateRecommendation(rankings, normalized, confidence);
    const warnings = this.generateWarnings(rankings, normalized);

    return new DecisionResult({
      winner: rankings[0][0],
      rankings,
      scoresBreakdown: breakdown,
      analysisMethod: 'Normalized Score (0-100)',
      totalScore: totalScores,
      normalizedScores: normalized,
      confidenceScore: confidence,
      recommendation,
      warnings,
    });
  }

  private analyzeRanking(): DecisionResult {
    const totalRanks: Record<string, number> = {};
    for (const option of this.options) {
      totalRanks[option] = 0;
    }
    const breakdown: Record<string, Record<string, number>> = {};

    // Convert scores to rankings for each criterion
    for (let criterionIdx = 0; criterionIdx < this.criteria.length; criterionIdx++) {
      const criterion = this.criteria[criterionIdx];
      const criterionScores: Record<string, number> = {};
      for (const opt of this.options) {
        criterionScores[opt] = this.scores[opt][criterionIdx];
      }

      const ranked = Object.entries(criterionScores)
        .sort((a, b) => b[1] - a[1]);

      ranked.forEach(([option, _score], rank) => {
        const weightedRank = (rank + 1) * this.weights[criterionIdx];
        totalRanks[option] += weightedRank;

        if (!breakdown[option]) {
          breakdown[option] = {};
        }
        breakdown[option][`${criterion} (rank)`] = rank + 1;
      });
    }

    // Lower rank is better, so sort ascending
    const rankings = Object.entries(totalRanks)
      .sort((a, b) => a[1] - b[1]) as Array<[string, number]>;

    // Normalize (invert since lower is better)
    const maxRank = Math.max(...Object.values(totalRanks));
    const normalized: Record<string, number> = {};
    for (const [opt, rank] of Object.entries(totalRanks)) {
      normalized[opt] = ((maxRank - rank) / maxRank) * 100;
    }

    let confidence: number;
    if (rankings.length > 1) {
      const gap = rankings[1][1] - rankings[0][1];
      confidence = Math.min(100, (gap / maxRank) * 100);
    } else {
      confidence = 100.0;
    }

    const normalizedRankings = rankings.map(([opt, _]) =>
      [opt, normalized[opt]] as [string, number]
    );

    const recommendation = this.generateRecommendation(normalizedRankings, normalized, confidence);
    const warnings = this.generateWarnings(rankings, normalized);

    return new DecisionResult({
      winner: rankings[0][0],
      rankings: normalizedRankings,
      scoresBreakdown: breakdown,
      analysisMethod: 'Ranking Method',
      totalScore: Object.fromEntries(normalizedRankings),
      normalizedScores: normalized,
      confidenceScore: confidence,
      recommendation,
      warnings,
    });
  }

  private analyzeBestWorst(): DecisionResult {
    const scaledScores: Record<string, number> = {};
    const breakdown: Record<string, Record<string, number>> = {};

    // Scale each option relative to best and worst
    for (const option of this.options) {
      const optionScores = this.scores[option];

      let totalScore = 0;
      breakdown[option] = {};

      for (let i = 0; i < this.criteria.length; i++) {
        const criterion = this.criteria[i];
        const score = optionScores[i];
        const criterionScores = this.options.map(opt => this.scores[opt][i]);
        const best = Math.max(...criterionScores);
        const worst = Math.min(...criterionScores);

        let scaled: number;
        if (best > worst) {
          scaled = (score - worst) / (best - worst);
        } else {
          scaled = 1.0;
        }

        const weightedScaled = scaled * this.weights[i];
        totalScore += weightedScaled;

        breakdown[option][`${criterion} (best-worst)`] = scaled * 100;
      }

      scaledScores[option] = totalScore;
    }

    // Rank options
    const rankings = Object.entries(scaledScores)
      .sort((a, b) => b[1] - a[1]) as Array<[string, number]>;

    // Normalize to percentages
    const maxScore = Math.max(...Object.values(scaledScores));
    const normalized: Record<string, number> = {};
    for (const [opt, score] of Object.entries(scaledScores)) {
      normalized[opt] = (score / maxScore) * 100;
    }

    let confidence: number;
    if (rankings.length > 1) {
      const gap = rankings[0][1] - rankings[1][1];
      confidence = Math.min(100, (gap / rankings[0][1]) * 100);
    } else {
      confidence = 100.0;
    }

    const recommendation = this.generateRecommendation(rankings, normalized, confidence);
    const warnings = this.generateWarnings(rankings, normalized);

    return new DecisionResult({
      winner: rankings[0][0],
      rankings,
      scoresBreakdown: breakdown,
      analysisMethod: 'Best-Worst Scaling',
      totalScore: scaledScores,
      normalizedScores: normalized,
      confidenceScore: confidence,
      recommendation,
      warnings,
    });
  }

  private calculateStrengthsWeaknesses(
    breakdown: Record<string, Record<string, number>>
  ): { strengths: Record<string, Array<[string, number]>>; weaknesses: Record<string, Array<[string, number]>> } {
    const strengths: Record<string, Array<[string, number]>> = {};
    const weaknesses: Record<string, Array<[string, number]>> = {};

    for (const option of Object.keys(breakdown)) {
      // Get scores for this option
      const criterionScores: Array<[string, number]> = [];
      for (const [criterion, score] of Object.entries(breakdown[option])) {
        // Extract clean criterion name
        const cleanCriterion = criterion.split(' (')[0];
        criterionScores.push([cleanCriterion, score]);
      }

      // Sort by score
      criterionScores.sort((a, b) => b[1] - a[1]);

      const topStrengths = criterionScores.slice(0, 3);
      const strengthNames = new Set(topStrengths.map(([name]) => name));

      const bottomCandidates = [...criterionScores].reverse();
      const filteredWeaknesses: Array<[string, number]> = [];
      for (const [name, score] of bottomCandidates) {
        if (strengthNames.has(name)) continue;
        filteredWeaknesses.push([name, score]);
        if (filteredWeaknesses.length === 3) break;
      }

      strengths[option] = topStrengths;
      weaknesses[option] = filteredWeaknesses;
    }

    return { strengths, weaknesses };
  }

  private calculateWhyWinnerWon(
    winner: string,
    rankings: Array<[string, number]>,
    breakdown: Record<string, Record<string, number>>
  ): string {
    if (rankings.length < 2) {
      return 'Only option available.';
    }

    const runnerUp = rankings[1][0];

    // Find criteria where winner significantly outperformed runner-up
    const winnerScores = breakdown[winner];
    const runnerUpScores = breakdown[runnerUp];

    const advantages: Array<[string, number, number | null]> = [];
    for (const criterion of Object.keys(winnerScores)) {
      const cleanCriterion = criterion.split(' (')[0];
      const winnerScore = winnerScores[criterion];
      const runnerUpScore = runnerUpScores[criterion] ?? 0;

      if (winnerScore > runnerUpScore * 1.1) {  // 10% better
        const advantage = winnerScore - runnerUpScore;
        // Extract weight if present
        let weight: number | null = null;
        if (criterion.includes('(w=')) {
          const match = criterion.match(/\(w=([0-9.]+)\)/);
          if (match) {
            weight = parseFloat(match[1]);
          }
        }
        advantages.push([cleanCriterion, advantage, weight]);
      }
    }

    if (advantages.length === 0) {
      return 'Marginally better overall performance across all criteria.';
    }

    // Sort by advantage
    advantages.sort((a, b) => b[1] - a[1]);

    // Generate explanation
    const topAdvantages = advantages.slice(0, 2);
    const parts: string[] = [];
    for (const [criterion, adv, weight] of topAdvantages) {
      if (weight !== null) {
        parts.push(`${criterion} (${(weight * 100).toFixed(0)}% weight, +${adv.toFixed(1)} points)`);
      } else {
        parts.push(`${criterion} (+${adv.toFixed(1)} points)`);
      }
    }

    return `Excelled in ${parts.join(' and ')}`;
  }

  private improveConfidenceScore(
    gap: number,
    winnerScore: number,
    normalizedGap?: number
  ): number {
    // Relative gap (original method, but scaled up)
    const relativeConf = (gap / winnerScore) * 100;

    // Normalized gap (if provided, from normalized scores)
    if (normalizedGap !== undefined) {
      // For normalized scores, a 20 point gap should be high confidence
      const normalizedConf = Math.min(100, normalizedGap * 2.5);
      // Blend the two approaches
      return (relativeConf * 0.4) + (normalizedConf * 0.6);
    } else {
      // Scale up relative confidence by 1.5x to be less conservative
      return Math.min(100, relativeConf * 1.5);
    }
  }

  private generateRecommendation(
    rankings: Array<[string, number]>,
    normalized: Record<string, number>,
    confidence: number
  ): string {
    const winner = rankings[0][0];
    const winnerScore = normalized[winner];

    // Adjusted thresholds (lowered from 70/40 to 55/30)
    if (confidence > 55) {
      return (
        `Strong recommendation: '${winner}' clearly outperforms ` +
        `other options with ${winnerScore.toFixed(1)}% score.`
      );
    } else if (confidence > 30) {
      if (rankings.length > 1) {
        const runnerUp = rankings[1][0];
        return (
          `Moderate recommendation: '${winner}' is best ` +
          `(${winnerScore.toFixed(1)}%), but '${runnerUp}' ` +
          `(${normalized[runnerUp].toFixed(1)}%) is competitive. ` +
          `Consider other factors.`
        );
      }
      return `Moderate recommendation: '${winner}' with ${winnerScore.toFixed(1)}% score.`;
    } else {
      const top3 = rankings.slice(0, 3).map(([opt]) => opt);
      return (
        `Weak recommendation: Options are closely matched. ` +
        `Top choices: ${top3.join(', ')}. ` +
        `Consider additional criteria or stakeholder input.`
      );
    }
  }

  private generateWarnings(
    rankings: Array<[string, number]>,
    normalized: Record<string, number>
  ): string[] {
    const warnings: string[] = [];

    if (rankings.length > 1) {
      const winner = rankings[0][0];
      const runnerUp = rankings[1][0];
      const winnerScore = normalized[winner] ?? rankings[0][1];
      const runnerScore = normalized[runnerUp] ?? rankings[1][1];
      const gap = winnerScore - runnerScore;

      if (gap < 5) {
        warnings.push(
          `Scores are within ${gap.toFixed(1)} points between '${winner}' and ` +
          `'${runnerUp}' — treat as a statistical tie.`
        );
      }
    }

    return warnings;
  }
}

/**
 * Make a decision using a decision matrix.
 *
 * @param options - Configuration options for the decision
 * @returns DecisionResult with rankings and analysis, or dict of all methods
 *
 * @example
 * ```ts
 * const result = makeDecision({
 *   options: ["Python", "JavaScript", "Go"],
 *   criteria: ["Learning Curve", "Performance", "Community"],
 *   scores: {
 *     "Python": [9, 7, 10],
 *     "JavaScript": [8, 6, 9],
 *     "Go": [6, 9, 7]
 *   },
 *   weights: [0.3, 0.4, 0.3]
 * });
 * console.log(result.toString());
 * ```
 */
export function makeDecision(
  options: MakeDecisionOptions
): DecisionResult | Record<AnalysisMethod, DecisionResult> {
  debug.group(MODULE, 'makeDecision()');
  debug.log(MODULE, 'Called with', {
    optionCount: options.options.length,
    criteriaCount: options.criteria.length,
    method: options.method ?? 'weighted',
    showAllMethods: options.showAllMethods ?? false,
    topN: options.topN,
  });

  const {
    options: opts,
    criteria,
    scores,
    weights,
    method = 'weighted',
    showAllMethods = false,
    topN,
  } = options;

  if (showAllMethods) {
    debug.log(MODULE, 'Running all 4 analysis methods...');
    const results: Record<string, DecisionResult> = {};
    const methods: AnalysisMethod[] = ['weighted', 'normalized', 'ranking', 'best_worst'];

    for (const methodName of methods) {
      const matrix = new DecisionMatrix({
        options: opts,
        criteria,
        scores,
        weights,
        method: methodName,
      });
      const result = matrix.analyze();
      result.topN = topN;
      results[methodName] = result;
    }

    debug.log(MODULE, 'All methods complete', {
      winners: Object.entries(results).map(([m, r]) => `${m}: ${r.winner}`),
    });
    debug.groupEnd();
    return results as Record<AnalysisMethod, DecisionResult>;
  } else {
    const matrix = new DecisionMatrix({
      options: opts,
      criteria,
      scores,
      weights,
      method,
    });
    const result = matrix.analyze();
    result.topN = topN;
    debug.groupEnd();
    return result;
  }
}

/**
 * Compare results across all analysis methods.
 *
 * @returns A formatted comparison of all methods
 */
export function compareMethods(
  options: string[],
  criteria: string[],
  scores: Record<string, number[]>,
  weights?: number[]
): string {
  debug.log(MODULE, 'compareMethods() called', {
    options,
    criteria,
    hasWeights: !!weights,
  });

  const results = makeDecision({
    options,
    criteria,
    scores,
    weights,
    showAllMethods: true,
  }) as Record<AnalysisMethod, DecisionResult>;

  const lines: string[] = [
    '='.repeat(70),
    'DECISION MATRIX - METHOD COMPARISON',
    '='.repeat(70),
  ];

  for (const [methodName, result] of Object.entries(results)) {
    lines.push(`\n${methodName.toUpperCase()} METHOD:`);
    lines.push(`  Winner: ${result.winner}`);
    lines.push(`  Confidence: ${result.confidenceScore.toFixed(1)}%`);
    lines.push('  Top 3:');
    for (let i = 0; i < Math.min(3, result.rankings.length); i++) {
      const [opt, score] = result.rankings[i];
      lines.push(`    ${i + 1}. ${opt}: ${score.toFixed(2)}`);
    }
  }

  // Consensus check
  lines.push('\n' + '='.repeat(70));
  const winners = Object.values(results).map(r => r.winner);
  const winnerCounts: Record<string, number> = {};
  for (const w of winners) {
    winnerCounts[w] = (winnerCounts[w] ?? 0) + 1;
  }
  const consensus = Object.entries(winnerCounts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );

  lines.push(`CONSENSUS: ${consensus[0]} (${consensus[1]}/4 methods)`);
  lines.push('='.repeat(70));

  return lines.join('\n');
}
