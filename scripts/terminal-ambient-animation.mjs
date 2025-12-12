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

const defaultPhrases = [
  'Quiet aurora over late capitalism',
  'Signals pulsing under the radar',
  'Graph paper dreaming of freedom',
  'Liquidity breathing in neon',
  'Night shift at the idea factory',
];

const palettes = {
  night: {
    aurora: [30, 36, 42, 48, 84, 120, 84, 48, 42, 36],
    ember: [202, 208, 214, 220, 214, 208],
    tide: [37, 38, 44, 80, 44, 38],
  },
  dawn: {
    aurora: [182, 217, 224, 223, 187, 180, 174, 173, 216, 219],
    ember: [209, 215, 221, 223, 221, 215],
    tide: [116, 117, 152, 189, 152, 117],
  },
};

const palette = palettes[options.palette] ?? palettes.night;
const phrases = options.phrases.length ? options.phrases : defaultPhrases;

let frameWidth = clampWidth(process.stdout.columns ?? 80);
const stopAt = typeof options.durationSec === 'number' ? Date.now() + options.durationSec * 1000 : Number.POSITIVE_INFINITY;
const lineCount = 4;

let frameIndex = 0;
let cleaned = false;
let firstRender = true;
let keyListener;
let rawWasEnabled = false;

process.stdout.write('\u001B[?25l'); // hide cursor to reduce flicker
process.stdout.write('Ambient mode (press any key to surface)\n');
process.stdout.write('\n'.repeat(lineCount));

startKeypressListener();
renderFrame();

const interval = setInterval(() => {
  renderFrame();

  if (Date.now() >= stopAt) {
    cleanup('Ambient animation finished.', true);
  }
}, options.speedMs);

process.stdout.on('resize', () => {
  frameWidth = clampWidth(process.stdout.columns ?? frameWidth);
});

process.on('SIGINT', () => cleanup('Ambient animation stopped (Ctrl+C).', true));
process.on('SIGTERM', () => cleanup('Ambient animation stopped.', true));
process.on('exit', () => {
  if (!cleaned) {
    cleanup('', false);
  }
});

function renderFrame() {
  const sky = tint(buildSky(frameIndex, frameWidth), palette.aurora, frameIndex);
  const wave = tint(buildWave(frameIndex, frameWidth), palette.tide, frameIndex + 6);
  const undercurrent = tint(buildUndercurrent(frameIndex, frameWidth), palette.ember, frameIndex * 2);
  const phraseIndex = Math.floor((frameIndex * options.speedMs) / options.phraseMs) % phrases.length;
  const phrase = tint(centerText(`[ ${phrases[phraseIndex]} ]`, frameWidth), palette.ember, frameIndex * 3);

  if (!firstRender) {
    readline.moveCursor(process.stdout, 0, -lineCount);
  } else {
    firstRender = false;
  }

  writeLine(sky);
  writeLine(wave);
  writeLine(undercurrent);
  writeLine(phrase);

  frameIndex += 1;
}

function writeLine(line) {
  readline.clearLine(process.stdout, 0);
  process.stdout.write(`${line}\n`);
}

function cleanup(note, exitAfter = false) {
  if (cleaned) {
    return;
  }

  cleaned = true;
  clearInterval(interval);

  if (keyListener) {
    process.stdin.off('keypress', keyListener);
  }

  if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
    process.stdin.setRawMode(rawWasEnabled);
  }

  readline.moveCursor(process.stdout, 0, 1);
  process.stdout.write('\u001B[?25h');

  if (note) {
    process.stdout.write(`${note}\n`);
  }

  if (exitAfter) {
    process.exit(0);
  }
}

function buildSky(frame, width) {
  const chars = new Array(width).fill(' ');
  for (let i = 0; i < width; i++) {
    const flicker = pseudoRandom(frame * 17 + i * 23);
    if (flicker > 0.92) {
      chars[i] = '*';
    } else if (flicker > 0.82) {
      chars[i] = '.';
    }
  }

  const cometPos = (frame * 2) % width;
  chars[cometPos] = '>';
  if (cometPos - 1 >= 0) chars[cometPos - 1] = '-';
  if (cometPos - 2 >= 0) chars[cometPos - 2] = '-';

  return chars.join('');
}

function buildWave(frame, width) {
  let line = '';
  for (let i = 0; i < width; i++) {
    const height = Math.sin((i + frame * 0.8) * 0.18);
    if (height > 0.55) {
      line += '^';
    } else if (height > 0.2) {
      line += '~';
    } else if (height > -0.2) {
      line += '-';
    } else {
      line += '.';
    }
  }

  const marker = '[htwc]';
  const markerPos = (frame * 2) % Math.max(width - marker.length, 1);
  line = line
    .slice(0, markerPos)
    + marker
    + line.slice(markerPos + marker.length, width);

  return line.slice(0, width);
}

function buildUndercurrent(frame, width) {
  const segments = Math.max(Math.floor(width / 6), 8);
  const unit = Math.max(Math.floor(width / segments), 2);
  const chars = new Array(width).fill(' ');

  for (let i = 0; i < segments; i++) {
    const start = (i * unit + frame) % width;
    chars[start] = '>';
    if (start + 1 < width) chars[start + 1] = '=';
    if (start + 2 < width) chars[start + 2] = '=';
  }

  return chars.join('');
}

function startKeypressListener() {
  if (!process.stdin.isTTY) {
    return;
  }

  readline.emitKeypressEvents(process.stdin);

  if (typeof process.stdin.setRawMode === 'function') {
    rawWasEnabled = Boolean(process.stdin.isRaw);
    process.stdin.setRawMode(true);
  }

  keyListener = () => cleanup('Ambient animation stopped (key press).', true);
  process.stdin.on('keypress', keyListener);
}

function tint(text, palette, offset = 0) {
  if (!supportsColor()) {
    return text;
  }

  const wrap = (code, value) => `\u001B[38;5;${code}m${value}`;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = palette[(i + offset) % palette.length];
    result += wrap(code, text[i]);
  }

  return `${result}\u001B[0m`;
}

function centerText(text, width) {
  if (text.length >= width) {
    return text.slice(0, width);
  }

  const paddingTotal = width - text.length;
  const left = Math.floor(paddingTotal / 2);
  const right = paddingTotal - left;

  return `${' '.repeat(left)}${text}${' '.repeat(right)}`;
}

function clampWidth(value) {
  return Math.min(Math.max(value, 56), 120);
}

function parsePhrases(value) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

function parseArgs(argv) {
  const defaults = {
    durationSec: clamp(numberFrom(process.env.HTWC_AMBIENT_DURATION), 4, 900),
    speedMs: clamp(numberFrom(process.env.HTWC_AMBIENT_SPEED), 40, 400) ?? 80,
    phraseMs: clamp(numberFrom(process.env.HTWC_AMBIENT_PHRASE_MS), 1000, 10000) ?? 3000,
    palette: (process.env.HTWC_AMBIENT_PALETTE || 'night').toLowerCase(),
    phrases: parsePhrases(process.env.HTWC_AMBIENT_PHRASES),
    help: false,
  };

  const options = { ...defaults };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg.startsWith('--duration=')) {
      options.durationSec = clamp(numberFrom(arg.split('=')[1]), 4, 900);
    } else if (arg.startsWith('--speed=')) {
      const value = clamp(numberFrom(arg.split('=')[1]), 40, 400);
      if (value) {
        options.speedMs = value;
      }
    } else if (arg.startsWith('--phrase=')) {
      const value = clamp(numberFrom(arg.split('=')[1]), 1000, 10000);
      if (value) {
        options.phraseMs = value;
      }
    } else if (arg.startsWith('--palette=')) {
      options.palette = arg.split('=')[1].toLowerCase();
    } else if (arg.startsWith('--phrases=')) {
      const parsed = parsePhrases(arg.split('=').slice(1).join('='));
      if (parsed.length) {
        options.phrases = parsed;
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

function pseudoRandom(seed) {
  const next = (seed * 16807) % 2147483647;
  return (next - 1) / 2147483646;
}

function supportsColor() {
  if (!process.stdout.isTTY) return false;
  if (process.env.NO_COLOR === '1') return false;
  return true;
}

function printHelp() {
  console.log(`
Ambient terminal animation (press any key to stop)

Usage:
  npm run terminal:ambient [--duration=seconds] [--speed=ms] [--phrase=ms] [--palette=name] [--phrases=a,b,c]

Options:
  --duration  Total time in seconds (default: runs until key press)
  --speed     Frame speed in milliseconds (default: 80)
  --phrase    Time per phrase in milliseconds (default: 3000)
  --palette   Color set (night | dawn)
  --phrases   Comma-separated list of phrases
  --help      Show this help text

Env overrides:
  HTWC_AMBIENT_DURATION   Duration in seconds
  HTWC_AMBIENT_SPEED      Frame speed in milliseconds
  HTWC_AMBIENT_PHRASE_MS  Time per phrase in milliseconds
  HTWC_AMBIENT_PALETTE    Palette name (night | dawn)
  HTWC_AMBIENT_PHRASES    Comma-separated list of phrases
`);
}
