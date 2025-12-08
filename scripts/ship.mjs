#!/usr/bin/env node
/**
 * SHIP SCRIPT
 * 
 * One command to rule them all:
 *   npm run ship
 *   npm run ship "commit message"
 * 
 * Does: Build → Commit → Deploy → Push
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

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

function run(cmd, options = {}) {
  try {
    return execSync(cmd, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...options 
    });
  } catch (error) {
    if (!options.ignoreError) {
      log(`\n✗ Command failed: ${cmd}`, 'red');
      process.exit(1);
    }
    return null;
  }
}

function getGitStatus() {
  const status = run('git status --porcelain', { silent: true });
  return status ? status.trim() : '';
}

async function main() {
  const commitMessage = process.argv[2] || `update: ${new Date().toISOString().split('T')[0]}`;
  
  console.log('\n' + '='.repeat(50));
  log('🚀 SHIP: Build → Commit → Deploy → Push', 'cyan');
  console.log('='.repeat(50) + '\n');

  // Step 1: Build
  log('1/4 Building...', 'yellow');
  run('npm run build');
  log('✓ Build complete\n', 'green');

  // Step 2: Git commit (if changes exist)
  log('2/4 Checking git status...', 'yellow');
  const status = getGitStatus();
  
  if (status) {
    log(`   Changes detected:\n${status.split('\n').map(l => '   ' + l).join('\n')}`, 'dim');
    run('git add -A');
    run(`git commit -m "${commitMessage}"`);
    log(`✓ Committed: "${commitMessage}"\n`, 'green');
  } else {
    log('✓ No changes to commit\n', 'green');
  }

  // Step 3: Deploy to Cloudflare
  log('3/4 Deploying to Cloudflare...', 'yellow');
  run('npm run deploy');
  log('✓ Deployed to Cloudflare\n', 'green');

  // Step 4: Push to GitHub
  log('4/4 Pushing to GitHub...', 'yellow');
  run('git push', { ignoreError: true });
  log('✓ Pushed to GitHub\n', 'green');

  // Done
  console.log('='.repeat(50));
  log('✓ SHIP COMPLETE', 'green');
  log('  Live at: https://howtowincapitalism.com', 'cyan');
  console.log('='.repeat(50) + '\n');
}

main().catch(console.error);

