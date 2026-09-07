import { describe, it, expect } from 'vitest';
import {
  HIRAGANA_TRAPS,
  KATAKANA_TRAPS,
  ROMAJI_TRAPS,
  getTrapKanaOptions,
  getTrapReadingOptions,
} from '../trapKana';

describe('Trap Kana Matrix & Generator', () => {
  const hiraganaFallback = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ'];
  const katakanaFallback = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ'];
  const readingFallback = ['a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko'];

  it('incluye trampas específicas solicitadas: し vs じ / shi vs ji', () => {
    expect(HIRAGANA_TRAPS['し']).toContain('じ');
    expect(HIRAGANA_TRAPS['じ']).toContain('し');
    expect(ROMAJI_TRAPS['shi']).toContain('ji');
    expect(ROMAJI_TRAPS['ji']).toContain('shi');
  });

  it('incluye trampas de Katakana clásicas: シ vs ツ vs ソ vs ン', () => {
    expect(KATAKANA_TRAPS['シ']).toContain('ツ');
    expect(KATAKANA_TRAPS['ツ']).toContain('シ');
    expect(KATAKANA_TRAPS['ソ']).toContain('ン');
    expect(KATAKANA_TRAPS['ン']).toContain('ソ');
  });

  it('getTrapKanaOptions genera 4 opciones únicas que contienen la respuesta correcta y trampas prioritarias', () => {
    for (let i = 0; i < 20; i++) {
      const opts = getTrapKanaOptions('し', 'hiragana', hiraganaFallback, 4);
      expect(opts).toHaveLength(4);
      // Debe contener la opción correcta
      expect(opts).toContain('し');
      // No debe tener duplicados
      const unique = new Set(opts);
      expect(unique.size).toBe(4);
      // Al menos una de las trampas visuales/fonéticas debe estar presente
      const hasTrap = opts.some((o) => ['じ', 'ち', 'ぢ', 'い', 'つ'].includes(o));
      expect(hasTrap).toBe(true);
    }
  });

  it('getTrapKanaOptions para Katakana genera trampas correctas (ej. シ genera ツ, ソ o ン)', () => {
    for (let i = 0; i < 20; i++) {
      const opts = getTrapKanaOptions('シ', 'katakana', katakanaFallback, 4);
      expect(opts).toHaveLength(4);
      expect(opts).toContain('シ');
      const unique = new Set(opts);
      expect(unique.size).toBe(4);
      const hasTrap = opts.some((o) => ['ツ', 'ソ', 'ン', 'ジ'].includes(o));
      expect(hasTrap).toBe(true);
    }
  });

  it('getTrapReadingOptions para "shi" prioriza "ji", "chi" o "tsu"', () => {
    for (let i = 0; i < 20; i++) {
      const opts = getTrapReadingOptions('shi', readingFallback, 4);
      expect(opts).toHaveLength(4);
      expect(opts).toContain('shi');
      const unique = new Set(opts.map((o) => o.toLowerCase()));
      expect(unique.size).toBe(4);
      const hasTrap = opts.some((o) => ['ji', 'chi', 'tsu'].includes(o.toLowerCase()));
      expect(hasTrap).toBe(true);
    }
  });

  it('rellena con fallback sin fallar si el caracter no tiene trampas registradas', () => {
    const opts = getTrapKanaOptions('？', 'hiragana', hiraganaFallback, 4);
    expect(opts).toHaveLength(4);
    expect(opts).toContain('？');
    const unique = new Set(opts);
    expect(unique.size).toBe(4);
  });
});
