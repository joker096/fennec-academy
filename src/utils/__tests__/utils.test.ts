/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveFromRoot(...segments: string[]) {
  return path.resolve(__dirname, '..', '..', ...segments);
}

describe('utils file existence', () => {
  it('audio.ts exists', () => {
    const p = resolveFromRoot('utils', 'audio.ts');
    expect(() => readFileSync(p)).not.toThrow();
  });

  it('speech.ts exists', () => {
    const p = resolveFromRoot('utils', 'speech.ts');
    expect(() => readFileSync(p)).not.toThrow();
  });

  it('sounds.ts exists', () => {
    const p = resolveFromRoot('utils', 'sounds.ts');
    expect(() => readFileSync(p)).not.toThrow();
  });
});