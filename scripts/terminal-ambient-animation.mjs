#!/usr/bin/env node
/**
 * Ambient terminal animation for How To Win Capitalism.
 * Manual trigger: npm run terminal:ambient
 */

import readline from 'node:readline';
import process from 'node:process';

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

if (!process.stdout.isTTY) {
  console.log('Ambient animation needs an interactive terminal (TTY).');
  process.exit(0);
}

const spinnerFrames = ['|', '/', '-', '\\'];
const waveFrames = buildWaveFrames();
const phrases = [
  'Letting the terminal breathe',
  'Sharpening the invisible hand',
  'Running the quiet arbitrage',
  'Cooling the CPU, warming the ideas',
  'Plotting the next market grab',
];

let frameIndex = 0;
let cleaned = false;
let firstRender = true;

const stopAt = options.loop ? Number.POSITIVE_INFINITY : Date.now() + options.durationSec * 1000;
const width = 64;

process.stdout.write('\u001B[?25l'); // hide cursor to reduce flicker
process.stdout.write('Ambient mode (Ctrl+C to stop)\n');
process.stdout.write('\n');
process.stdout.write('\n');

renderFrame();

const interval = setInterval(() => {
  renderFrame();

  if (!options.loop && Date.now() >= stopAt) {
    cleanup('Ambient animation finished.', true);
  }
}, options.speedMs);

process.on('SIGINT', () => cleanup('Ambient animation stopped (Ctrl+C).', true));
process.on('SIGTERM', () => cleanup('Ambient animation stopped.', true));
process.on('exit', () => {
  if (!cleaned) {
    process.stdout.write('\u001B[?25h');
  }
});

function renderFrame() {
  const wave = waveFrames[frameIndex % waveFrames.length];
  const phrase = phrases[frameIndex % phrases.length];
  const spin = spinnerFrames[frameIndex % spinnerFrames.length];

  if (!firstRender) {
    readline.moveCursor(process.stdout, 0, -2);
  } else {
    firstRender = false;
  }

  readline.clearLine(process.stdout, 0);
  process.stdout.write(`${pad(wave, width)}\n`);

  readline.clearLine(process.stdout, 0);
  process.stdout.write(`${spin} ${pad(phrase, width - 2)}\n`);

  frameIndex += 1;
}

function cleanup(note, exitAfter = false) {
  if (cleaned) {
    return;
  }

  cleaned = true;
  clearInterval(interval);
  readline.moveCursor(process.stdout, 0, 1);
  process.stdout.write('\u001B[?25h');
  process.stdout.write(`${note}\n`);

  if (exitAfter) {
    process.exit(0);
  }
}

function buildWaveFrames() {
  const width = 54;
  const base = '[htwc]>----';
  const steps = [0, 4, 8, 12, 16, 20, 24, 28];
  const travel = [...steps, ...steps.slice(1, -1).reverse()];

  return travel.map(offset => {
    const padding = Math.max(width - offset - base.length, 0);
    return `${' '.repeat(offset)}${base}${' '.repeat(padding)}`;
  });
}

function parseArgs(argv) {
  const defaults = {
    durationSec: clamp(numberFrom(process.env.HTWC_AMBIENT_DURATION), 8, 300) ?? 18,
    speedMs: clamp(numberFrom(process.env.HTWC_AMBIENT_SPEED), 50, 500) ?? 120,
    loop: false,
    help: false,
  };

  const options = { ...defaults };

  for (const arg of argv) {
    if (arg === '--loop') {
      options.loop = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg.startsWith('--duration=')) {
      const value = clamp(numberFrom(arg.split('=')[1]), 8, 300);
      if (value) {
        options.durationSec = value;
      }
    } else if (arg.startsWith('--speed=')) {
      const value = clamp(numberFrom(arg.split('=')[1]), 50, 500);
      if (value) {
        options.speedMs = value;
      }
    }
  }

  return options;
}

function numberFrom(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function clamp(value, min, max) {
  if (typeof value !== 'number') {
    return undefined;
  }

  return Math.min(Math.max(value, min), max);
}

function pad(value, target) {
  if (value.length >= target) {
    return value.slice(0, target);
  }

  return `${value}${' '.repeat(target - value.length)}`;
}

function printHelp() {
  console.log(`
Ambient terminal animation

Usage:
  npm run terminal:ambient [--duration=seconds] [--speed=ms] [--loop]

Options:
  --duration  Total time in seconds (default: 18)
  --speed     Frame speed in milliseconds (default: 120)
  --loop      Run until you press Ctrl+C
  --help      Show this help text

Env overrides:
  HTWC_AMBIENT_DURATION   Duration in seconds
  HTWC_AMBIENT_SPEED      Frame speed in milliseconds
`);
}
