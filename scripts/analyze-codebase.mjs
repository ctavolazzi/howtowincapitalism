#!/usr/bin/env node

/**
 * @fileoverview Codebase Analysis Script
 * @description Analyzes the codebase to provide metrics for documentation efforts
 *
 * Usage: node scripts/analyze-codebase.mjs [--json] [--verbose]
 *
 * Outputs:
 * - File inventory by category
 * - Line counts and complexity metrics
 * - Documentation coverage analysis
 * - Technical debt indicators
 * - Priority scoring for documentation efforts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // File extensions to analyze
  extensions: {
    typescript: ['.ts', '.tsx'],
    javascript: ['.js', '.mjs'],
    astro: ['.astro'],
    markdown: ['.mdx', '.md'],
  },

  // Directories to scan
  includeDirs: ['src', 'scripts', 'tests'],

  // Directories to exclude
  excludeDirs: ['node_modules', 'dist', '.git', '.astro', 'coverage'],

  // File patterns to exclude
  excludePatterns: [/\.d\.ts$/, /\.min\.js$/],

  // Documentation indicators
  docPatterns: {
    fileHeader: /^\/\*\*[\s\S]*?@fileoverview/m,
    jsdoc: /\/\*\*[\s\S]*?\*\//g,
    inlineComment: /\/\/.*$/gm,
    todoComment: /\/\/\s*(TODO|FIXME|HACK|XXX|BUG):/gi,
  },

  // Code quality indicators
  codePatterns: {
    functions: /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>|\w+\s*=>))/g,
    exports: /export\s+(?:default\s+)?(?:function|const|let|var|class|interface|type)/g,
    imports: /import\s+.*?from\s+['"][^'"]+['"]/g,
    tryCatch: /try\s*\{/g,
    consoleLog: /console\.(log|warn|error|info|debug)/g,
    anyType: /:\s*any\b/g,
    asyncFunctions: /async\s+(?:function|\([^)]*\)\s*=>)/g,
  },
};

// ============================================================================
// FILE DISCOVERY
// ============================================================================

/**
 * Recursively find all files matching criteria
 */
function findFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(ROOT_DIR, fullPath);

    // Skip excluded directories
    if (entry.isDirectory()) {
      if (CONFIG.excludeDirs.includes(entry.name)) continue;
      findFiles(fullPath, files);
      continue;
    }

    // Check file extension
    const ext = path.extname(entry.name);
    const allExtensions = [
      ...CONFIG.extensions.typescript,
      ...CONFIG.extensions.javascript,
      ...CONFIG.extensions.astro,
    ];

    if (!allExtensions.includes(ext)) continue;

    // Check exclude patterns
    if (CONFIG.excludePatterns.some(p => p.test(entry.name))) continue;

    files.push({
      path: fullPath,
      relativePath,
      name: entry.name,
      ext,
    });
  }

  return files;
}

// ============================================================================
// FILE ANALYSIS
// ============================================================================

/**
 * Analyze a single file for metrics
 */
function analyzeFile(file) {
  const content = fs.readFileSync(file.path, 'utf-8');
  const lines = content.split('\n');

  // Basic metrics
  const totalLines = lines.length;
  const blankLines = lines.filter(l => l.trim() === '').length;
  const codeLines = totalLines - blankLines;

  // Documentation metrics
  const hasFileHeader = CONFIG.docPatterns.fileHeader.test(content);
  const jsdocMatches = content.match(CONFIG.docPatterns.jsdoc) || [];
  const inlineComments = content.match(CONFIG.docPatterns.inlineComment) || [];
  const todoComments = content.match(CONFIG.docPatterns.todoComment) || [];

  // Code metrics
  const functions = content.match(CONFIG.codePatterns.functions) || [];
  const exports = content.match(CONFIG.codePatterns.exports) || [];
  const imports = content.match(CONFIG.codePatterns.imports) || [];
  const tryCatchBlocks = content.match(CONFIG.codePatterns.tryCatch) || [];
  const consoleLogs = content.match(CONFIG.codePatterns.consoleLog) || [];
  const anyTypes = content.match(CONFIG.codePatterns.anyType) || [];
  const asyncFunctions = content.match(CONFIG.codePatterns.asyncFunctions) || [];

  // Calculate documentation coverage
  const documentedFunctions = jsdocMatches.length;
  const totalFunctions = functions.length;
  const docCoverage = totalFunctions > 0
    ? Math.round((documentedFunctions / totalFunctions) * 100)
    : 100;

  // Calculate complexity score (simplified)
  const complexityScore = Math.round(
    (functions.length * 2) +
    (asyncFunctions.length * 1.5) +
    (imports.length * 0.5) +
    (tryCatchBlocks.length * 1)
  );

  // Calculate technical debt score
  const debtScore = Math.round(
    (todoComments.length * 5) +
    (consoleLogs.length * 2) +
    (anyTypes.length * 3) +
    (hasFileHeader ? 0 : 10) +
    (docCoverage < 50 ? 10 : 0)
  );

  // Priority score (higher = needs more attention)
  const priorityScore = Math.round(
    (debtScore * 2) +
    (100 - docCoverage) +
    (complexityScore * 0.5) +
    (codeLines > 200 ? 20 : 0) +
    (codeLines > 500 ? 30 : 0)
  );

  return {
    ...file,
    metrics: {
      lines: {
        total: totalLines,
        code: codeLines,
        blank: blankLines,
      },
      documentation: {
        hasFileHeader,
        jsdocCount: jsdocMatches.length,
        inlineComments: inlineComments.length,
        todoCount: todoComments.length,
        coverage: docCoverage,
      },
      code: {
        functions: functions.length,
        asyncFunctions: asyncFunctions.length,
        exports: exports.length,
        imports: imports.length,
        tryCatchBlocks: tryCatchBlocks.length,
      },
      quality: {
        consoleLogs: consoleLogs.length,
        anyTypes: anyTypes.length,
      },
      scores: {
        complexity: complexityScore,
        technicalDebt: debtScore,
        priority: priorityScore,
      },
    },
  };
}

// ============================================================================
// CATEGORIZATION
// ============================================================================

/**
 * Categorize files by their location/purpose
 */
function categorizeFile(file) {
  const rel = file.relativePath;

  if (rel.startsWith('src/lib/auth/')) {
    if (rel.includes('.test.')) return 'lib/auth/tests';
    return 'lib/auth';
  }
  if (rel.startsWith('src/lib/api/')) return 'lib/api';
  if (rel.startsWith('src/lib/email/')) return 'lib/email';
  if (rel.startsWith('src/lib/tools/')) {
    if (rel.includes('.test.')) return 'lib/tools/tests';
    return 'lib/tools';
  }
  if (rel.startsWith('src/lib/config/')) return 'lib/config';
  if (rel.startsWith('src/lib/')) return 'lib/other';

  if (rel.startsWith('src/pages/api/auth/')) return 'api/auth';
  if (rel.startsWith('src/pages/api/admin/')) return 'api/admin';
  if (rel.startsWith('src/pages/api/')) return 'api/other';
  if (rel.startsWith('src/pages/')) return 'pages';

  if (rel.startsWith('src/components/atoms/')) return 'components/atoms';
  if (rel.startsWith('src/components/molecules/')) return 'components/molecules';
  if (rel.startsWith('src/components/organisms/')) return 'components/organisms';
  if (rel.startsWith('src/components/auth/')) return 'components/auth';
  if (rel.startsWith('src/components/guards/')) return 'components/guards';
  if (rel.startsWith('src/components/utilities/')) return 'components/utilities';
  if (rel.startsWith('src/components/simple/')) return 'components/simple';
  if (rel.startsWith('src/components/search/')) return 'components/search';
  if (rel.startsWith('src/components/trade/')) return 'components/trade';
  if (rel.startsWith('src/components/')) return 'components/other';

  if (rel.startsWith('src/layouts/')) return 'layouts';
  if (rel.startsWith('src/')) return 'src/other';

  if (rel.startsWith('scripts/')) return 'scripts';
  if (rel.startsWith('tests/')) return 'tests';

  return 'other';
}

// ============================================================================
// REPORTING
// ============================================================================

/**
 * Generate summary statistics
 */
function generateSummary(analyzedFiles) {
  const categories = {};
  let totals = {
    files: 0,
    lines: 0,
    codeLines: 0,
    functions: 0,
    withFileHeader: 0,
    todoComments: 0,
    consoleLogs: 0,
    anyTypes: 0,
  };

  for (const file of analyzedFiles) {
    const category = categorizeFile(file);

    if (!categories[category]) {
      categories[category] = {
        files: [],
        totals: {
          files: 0,
          lines: 0,
          codeLines: 0,
          functions: 0,
          withFileHeader: 0,
          avgDocCoverage: 0,
          avgPriority: 0,
        },
      };
    }

    categories[category].files.push(file);
    categories[category].totals.files++;
    categories[category].totals.lines += file.metrics.lines.total;
    categories[category].totals.codeLines += file.metrics.lines.code;
    categories[category].totals.functions += file.metrics.code.functions;
    if (file.metrics.documentation.hasFileHeader) {
      categories[category].totals.withFileHeader++;
    }

    totals.files++;
    totals.lines += file.metrics.lines.total;
    totals.codeLines += file.metrics.lines.code;
    totals.functions += file.metrics.code.functions;
    totals.todoComments += file.metrics.documentation.todoCount;
    totals.consoleLogs += file.metrics.quality.consoleLogs;
    totals.anyTypes += file.metrics.quality.anyTypes;
    if (file.metrics.documentation.hasFileHeader) totals.withFileHeader++;
  }

  // Calculate averages per category
  for (const cat of Object.keys(categories)) {
    const files = categories[cat].files;
    categories[cat].totals.avgDocCoverage = Math.round(
      files.reduce((sum, f) => sum + f.metrics.documentation.coverage, 0) / files.length
    );
    categories[cat].totals.avgPriority = Math.round(
      files.reduce((sum, f) => sum + f.metrics.scores.priority, 0) / files.length
    );
  }

  return { categories, totals };
}

/**
 * Format report for console output
 */
function formatReport(summary, analyzedFiles, verbose = false) {
  const lines = [];

  lines.push('');
  lines.push('╔══════════════════════════════════════════════════════════════════════════════╗');
  lines.push('║                         CODEBASE ANALYSIS REPORT                             ║');
  lines.push('╚══════════════════════════════════════════════════════════════════════════════╝');
  lines.push('');

  // Overall summary
  lines.push('┌──────────────────────────────────────────────────────────────────────────────┐');
  lines.push('│ OVERALL SUMMARY                                                              │');
  lines.push('├──────────────────────────────────────────────────────────────────────────────┤');
  lines.push(`│ Total Files:           ${String(summary.totals.files).padStart(6)}                                            │`);
  lines.push(`│ Total Lines:           ${String(summary.totals.lines).padStart(6)}                                            │`);
  lines.push(`│ Code Lines:            ${String(summary.totals.codeLines).padStart(6)}                                            │`);
  lines.push(`│ Total Functions:       ${String(summary.totals.functions).padStart(6)}                                            │`);
  lines.push(`│ Files with Header:     ${String(summary.totals.withFileHeader).padStart(6)} (${Math.round(summary.totals.withFileHeader / summary.totals.files * 100)}%)                                     │`);
  lines.push(`│ TODO Comments:         ${String(summary.totals.todoComments).padStart(6)}                                            │`);
  lines.push(`│ Console.log calls:     ${String(summary.totals.consoleLogs).padStart(6)}                                            │`);
  lines.push(`│ 'any' types:           ${String(summary.totals.anyTypes).padStart(6)}                                            │`);
  lines.push('└──────────────────────────────────────────────────────────────────────────────┘');
  lines.push('');

  // Category breakdown
  lines.push('┌──────────────────────────────────────────────────────────────────────────────┐');
  lines.push('│ BREAKDOWN BY CATEGORY                                                        │');
  lines.push('├────────────────────────┬───────┬────────┬──────────┬─────────┬──────────────┤');
  lines.push('│ Category               │ Files │ Lines  │ Func     │ Doc %   │ Priority     │');
  lines.push('├────────────────────────┼───────┼────────┼──────────┼─────────┼──────────────┤');

  const sortedCategories = Object.entries(summary.categories)
    .sort((a, b) => b[1].totals.avgPriority - a[1].totals.avgPriority);

  for (const [category, data] of sortedCategories) {
    const cat = category.padEnd(22).slice(0, 22);
    const files = String(data.totals.files).padStart(5);
    const codeLines = String(data.totals.codeLines).padStart(6);
    const functions = String(data.totals.functions).padStart(8);
    const docCov = String(data.totals.avgDocCoverage + '%').padStart(7);
    const priority = String(data.totals.avgPriority).padStart(12);
    lines.push(`│ ${cat} │ ${files} │ ${codeLines} │ ${functions} │ ${docCov} │ ${priority} │`);
  }

  lines.push('└────────────────────────┴───────┴────────┴──────────┴─────────┴──────────────┘');
  lines.push('');

  // Top priority files
  lines.push('┌──────────────────────────────────────────────────────────────────────────────┐');
  lines.push('│ TOP 20 PRIORITY FILES (Need Most Documentation Work)                         │');
  lines.push('├──────────────────────────────────────────────────────────────────────────────┤');

  const topPriority = [...analyzedFiles]
    .sort((a, b) => b.metrics.scores.priority - a.metrics.scores.priority)
    .slice(0, 20);

  for (const file of topPriority) {
    const relPath = file.relativePath.padEnd(50).slice(0, 50);
    const priority = String(file.metrics.scores.priority).padStart(4);
    const lines_count = String(file.metrics.lines.code).padStart(5);
    const docCov = String(file.metrics.documentation.coverage + '%').padStart(4);
    const hasHeader = file.metrics.documentation.hasFileHeader ? '✓' : '✗';
    lines.push(`│ ${relPath} P:${priority} L:${lines_count} D:${docCov} H:${hasHeader} │`);
  }

  lines.push('└──────────────────────────────────────────────────────────────────────────────┘');
  lines.push('');

  // Files missing file headers
  const missingHeaders = analyzedFiles.filter(f => !f.metrics.documentation.hasFileHeader);
  lines.push('┌──────────────────────────────────────────────────────────────────────────────┐');
  lines.push(`│ FILES MISSING @fileoverview HEADER (${missingHeaders.length} files)                               │`);
  lines.push('├──────────────────────────────────────────────────────────────────────────────┤');

  for (const file of missingHeaders.slice(0, 30)) {
    const relPath = file.relativePath.padEnd(74).slice(0, 74);
    lines.push(`│ ${relPath} │`);
  }

  if (missingHeaders.length > 30) {
    lines.push(`│ ... and ${missingHeaders.length - 30} more files                                                      │`);
  }

  lines.push('└──────────────────────────────────────────────────────────────────────────────┘');
  lines.push('');

  // Technical debt hotspots
  const debtHotspots = [...analyzedFiles]
    .filter(f => f.metrics.scores.technicalDebt > 10)
    .sort((a, b) => b.metrics.scores.technicalDebt - a.metrics.scores.technicalDebt)
    .slice(0, 15);

  lines.push('┌──────────────────────────────────────────────────────────────────────────────┐');
  lines.push('│ TECHNICAL DEBT HOTSPOTS                                                      │');
  lines.push('├──────────────────────────────────────────────────────────────────────────────┤');

  for (const file of debtHotspots) {
    const relPath = file.relativePath.padEnd(45).slice(0, 45);
    const debt = String(file.metrics.scores.technicalDebt).padStart(3);
    const todos = String(file.metrics.documentation.todoCount).padStart(2);
    const logs = String(file.metrics.quality.consoleLogs).padStart(2);
    const any = String(file.metrics.quality.anyTypes).padStart(2);
    lines.push(`│ ${relPath} Debt:${debt} TODO:${todos} Log:${logs} Any:${any} │`);
  }

  lines.push('└──────────────────────────────────────────────────────────────────────────────┘');
  lines.push('');

  // Execution plan
  lines.push('┌──────────────────────────────────────────────────────────────────────────────┐');
  lines.push('│ RECOMMENDED EXECUTION ORDER                                                  │');
  lines.push('├──────────────────────────────────────────────────────────────────────────────┤');
  lines.push('│ Phase 1: lib/auth        - Core authentication (HIGH PRIORITY)              │');
  lines.push('│ Phase 2: lib/tools       - Business logic tools                             │');
  lines.push('│ Phase 3: api/auth        - Auth API endpoints                               │');
  lines.push('│ Phase 4: api/admin       - Admin API endpoints                              │');
  lines.push('│ Phase 5: lib/api         - API utilities                                    │');
  lines.push('│ Phase 6: lib/email       - Email services                                   │');
  lines.push('│ Phase 7: components/auth - Auth UI components                               │');
  lines.push('│ Phase 8: components/atoms - Base UI components                              │');
  lines.push('│ Phase 9: components/*    - Remaining components                             │');
  lines.push('│ Phase 10: pages          - Page templates                                   │');
  lines.push('│ Phase 11: scripts        - Build scripts                                    │');
  lines.push('│ Phase 12: tests          - Test files                                       │');
  lines.push('└──────────────────────────────────────────────────────────────────────────────┘');
  lines.push('');

  // Verbose: Full file list
  if (verbose) {
    lines.push('┌──────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│ COMPLETE FILE LIST                                                           │');
    lines.push('├──────────────────────────────────────────────────────────────────────────────┤');

    for (const [category, data] of sortedCategories) {
      lines.push(`│                                                                              │`);
      lines.push(`│ ═══ ${category.toUpperCase()} ═══                                            │`);

      const sortedFiles = data.files.sort((a, b) =>
        b.metrics.scores.priority - a.metrics.scores.priority
      );

      for (const file of sortedFiles) {
        const name = file.name.padEnd(35).slice(0, 35);
        const codeLines = String(file.metrics.lines.code).padStart(5);
        const funcs = String(file.metrics.code.functions).padStart(3);
        const docCov = String(file.metrics.documentation.coverage + '%').padStart(4);
        const priority = String(file.metrics.scores.priority).padStart(4);
        const header = file.metrics.documentation.hasFileHeader ? '✓' : '✗';
        lines.push(`│   ${name} L:${codeLines} F:${funcs} D:${docCov} P:${priority} H:${header}  │`);
      }
    }

    lines.push('└──────────────────────────────────────────────────────────────────────────────┘');
  }

  return lines.join('\n');
}

/**
 * Generate JSON output
 */
function generateJSON(summary, analyzedFiles) {
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totals: summary.totals,
      categories: Object.fromEntries(
        Object.entries(summary.categories).map(([cat, data]) => [
          cat,
          {
            fileCount: data.totals.files,
            codeLines: data.totals.codeLines,
            functions: data.totals.functions,
            avgDocCoverage: data.totals.avgDocCoverage,
            avgPriority: data.totals.avgPriority,
          }
        ])
      ),
    },
    files: analyzedFiles.map(f => ({
      path: f.relativePath,
      category: categorizeFile(f),
      metrics: f.metrics,
    })),
    priorityOrder: analyzedFiles
      .sort((a, b) => b.metrics.scores.priority - a.metrics.scores.priority)
      .map(f => ({
        path: f.relativePath,
        priority: f.metrics.scores.priority,
        hasHeader: f.metrics.documentation.hasFileHeader,
        docCoverage: f.metrics.documentation.coverage,
        codeLines: f.metrics.lines.code,
      })),
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const verbose = args.includes('--verbose') || args.includes('-v');

  console.log('🔍 Analyzing codebase...\n');

  // Find all files
  const files = [];
  for (const dir of CONFIG.includeDirs) {
    const dirPath = path.join(ROOT_DIR, dir);
    findFiles(dirPath, files);
  }

  // Also check root config files
  const rootFiles = fs.readdirSync(ROOT_DIR)
    .filter(f => /\.(ts|js|mjs)$/.test(f) && !f.startsWith('.'))
    .map(f => ({
      path: path.join(ROOT_DIR, f),
      relativePath: f,
      name: f,
      ext: path.extname(f),
    }));
  files.push(...rootFiles);

  console.log(`📁 Found ${files.length} files to analyze\n`);

  // Analyze each file
  const analyzedFiles = [];
  for (const file of files) {
    try {
      const analysis = analyzeFile(file);
      analyzedFiles.push(analysis);
    } catch (err) {
      console.error(`⚠️  Error analyzing ${file.relativePath}: ${err.message}`);
    }
  }

  // Generate summary
  const summary = generateSummary(analyzedFiles);

  // Output
  if (jsonOutput) {
    const json = generateJSON(summary, analyzedFiles);
    console.log(JSON.stringify(json, null, 2));

    // Also write to file
    const outputPath = path.join(ROOT_DIR, '_docs', 'codebase-analysis.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
    console.error(`\n📄 JSON written to ${outputPath}`);
  } else {
    console.log(formatReport(summary, analyzedFiles, verbose));
  }

  // Write checklist file
  const checklistPath = path.join(ROOT_DIR, '_docs', 'documentation-checklist.md');
  const checklist = generateChecklist(summary, analyzedFiles);
  fs.writeFileSync(checklistPath, checklist);
  console.log(`\n📋 Checklist written to ${checklistPath}`);
}

/**
 * Generate markdown checklist for documentation work
 */
function generateChecklist(summary, analyzedFiles) {
  const lines = [];

  lines.push('# Documentation Checklist');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total files: ${summary.totals.files}`);
  lines.push(`- Files with headers: ${summary.totals.withFileHeader} (${Math.round(summary.totals.withFileHeader / summary.totals.files * 100)}%)`);
  lines.push(`- Files needing headers: ${summary.totals.files - summary.totals.withFileHeader}`);
  lines.push('');
  lines.push('## Progress by Category');
  lines.push('');

  const sortedCategories = Object.entries(summary.categories)
    .sort((a, b) => b[1].totals.avgPriority - a[1].totals.avgPriority);

  for (const [category, data] of sortedCategories) {
    const withHeader = data.files.filter(f => f.metrics.documentation.hasFileHeader).length;
    const total = data.files.length;
    const pct = Math.round(withHeader / total * 100);

    lines.push(`### ${category} (${withHeader}/${total} = ${pct}%)`);
    lines.push('');

    const sortedFiles = data.files.sort((a, b) =>
      b.metrics.scores.priority - a.metrics.scores.priority
    );

    for (const file of sortedFiles) {
      const checked = file.metrics.documentation.hasFileHeader ? 'x' : ' ';
      const priority = file.metrics.scores.priority;
      const codeLines = file.metrics.lines.code;
      lines.push(`- [${checked}] \`${file.relativePath}\` (P:${priority}, L:${codeLines})`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

main().catch(console.error);
