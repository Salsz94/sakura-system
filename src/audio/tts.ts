// ════════════════════════════════════════════════════════════════
// REPRODUCTOR DE AUDIO & PRONUNCIACIÓN (MP3 Estático + Fallback TTS)
// Intenta reproducir los MP3 en /audio/kana/ o /audio/vocab/.
// Si el archivo no existe o falla, usa Web Speech API (TTS nativo).
// ════════════════════════════════════════════════════════════════

function pickJaVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.startsWith('ja') && v.localService) ||
    voices.find((v) => v.lang.startsWith('ja')) ||
    null
  );
}

export function ttsSupported(): boolean {
  return typeof speechSynthesis !== 'undefined';
}

/** Reproduce mediante Web Speech API (TTS). */
export function speakJa(text: string, rate = 0.8): boolean {
  try {
    if (!ttsSupported()) return false;
    const voice = pickJaVoice();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    if (voice) u.voice = voice;
    u.rate = rate;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reproduce la pronunciación de un Kana o palabra.
 * 1. Intenta reproducir el archivo estático /audio/kana/[romaji].mp3 o /audio/vocab/[romaji].mp3.
 * 2. Si falla o no existe, intenta variantes comunes de nombres (ej. oishii vs oishi).
 * 3. Si falla, usa speakJa(japaneseText).
 */
export function playPronunciation(
  romajiOrKey: string,
  japaneseText: string,
  type: 'kana' | 'vocab' = 'kana'
): void {
  if (!romajiOrKey) {
    speakJa(japaneseText);
    return;
  }

  const cleanKey = romajiOrKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const audioPath = `/audio/${type}/${cleanKey}.mp3`;

  const audio = new Audio(audioPath);
  audio.volume = 0.9;

  audio
    .play()
    .then(() => {
      // Éxito con el nombre exacto
    })
    .catch(() => {
      // Intentar variante sin vocales dobles (ej. oishii -> oishi)
      const altKey = cleanKey.replace(/(.)\1+/g, '$1');
      if (altKey !== cleanKey) {
        const altAudio = new Audio(`/audio/${type}/${altKey}.mp3`);
        altAudio.volume = 0.9;
        altAudio
          .play()
          .then(() => {})
          .catch(() => {
            speakJa(japaneseText);
          });
      } else {
        speakJa(japaneseText);
      }
    });
}

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}
