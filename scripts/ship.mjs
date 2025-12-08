#!/usr/bin/env node
/**
 * SHIP SCRIPT
 *
 * One command to rule them all:
 *   npm run ship
 *   npm run ship "commit message"
 *
 * Sequence: Build → Commit → Push → Deploy
 *
 * Safeguards:
 * - Stops immediately if any step fails
 * - Verifies git status before starting
 * - Checks branch is main
 * - Validates build before committing
 */

import { execSync } from 'child_process';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(msg, color = 'reset') {
  console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

function fail(msg) {
  log(`\n✗ ${msg}`, 'red');
  log('\nShip aborted. No changes were deployed.', 'yellow');
  process.exit(1);
}

function run(cmd, options = {}) {
  try {
    return execSync(cmd, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...options
    });
  } catch (error) {
    if (!options.ignoreError) {
      fail(`Command failed: ${cmd}`);
    }
    return null;
  }
}

function runSilent(cmd) {
  return run(cmd, { silent: true })?.trim() || '';
}

function preflight() {
  log('Preflight checks...', 'dim');

  // Check we're in a git repo
  const isGitRepo = runSilent('git rev-parse --is-inside-work-tree');
  if (isGitRepo !== 'true') {
    fail('Not a git repository');
  }

  // Check we're on main branch
  const branch = runSilent('git branch --show-current');
  if (branch !== 'main') {
    fail(`Not on main branch (currently on: ${branch}). Switch to main first.`);
  }

  // Check remote exists
  const remote = runSilent('git remote get-url origin');
  if (!remote) {
    fail('No git remote configured');
  }

  log('✓ Preflight passed\n', 'green');
}

function getGitStatus() {
  return runSilent('git status --porcelain');
}

async function main() {
  const commitMessage = process.argv[2] || `update: ${new Date().toISOString().split('T')[0]}`;

  console.log('\n' + '='.repeat(50));
  log('🚀 SHIP: Build → Commit → Push → Deploy', 'cyan');
  console.log('='.repeat(50) + '\n');

  // Preflight checks
  preflight();

  // Step 1: Build (verify code works)
  log('1/4 Building...', 'yellow');
  run('npm run build');
  log('✓ Build passed\n', 'green');

  // Step 2: Git commit (if changes exist)
  log('2/4 Committing changes...', 'yellow');
  const status = getGitStatus();

  if (status) {
    log(`   Changes:\n${status.split('\n').map(l => '   ' + l).join('\n')}`, 'dim');
    run('git add -A');

    // Verify staging worked
    const staged = runSilent('git diff --cached --name-only');
    if (!staged) {
      fail('git add failed - nothing staged');
    }

    run(`git commit -m "${commitMessage}"`);
    log(`✓ Committed: "${commitMessage}"\n`, 'green');
  } else {
    log('✓ No changes to commit (deploying existing code)\n', 'green');
  }

  // Step 3: Push to GitHub (backup source of truth)
  log('3/4 Pushing to GitHub...', 'yellow');
  run('git push');

  // Verify push succeeded
  const localHash = runSilent('git rev-parse HEAD');
  const remoteHash = runSilent('git rev-parse origin/main');
  if (localHash !== remoteHash) {
    fail('Push verification failed - local and remote hashes do not match');
  }
  log('✓ Pushed to GitHub\n', 'green');

  // Step 4: Deploy to Cloudflare (production)
  log('4/4 Deploying to Cloudflare...', 'yellow');
  run('npm run deploy');
  log('✓ Deployed to Cloudflare\n', 'green');

  // Done
  console.log('='.repeat(50));
  log('✓ SHIP COMPLETE', 'green');
  log(`  Commit:  ${localHash.slice(0, 7)}`, 'dim');
  log('  GitHub:  https://github.com/ctavolazzi/howtowincapitalism', 'dim');
  log('  Live:    https://howtowincapitalism.com', 'cyan');
  console.log('='.repeat(50) + '\n');
}

main().catch((err) => {
  fail(err.message || 'Unknown error');
});
