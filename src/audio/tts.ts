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
 * 2. Si falla o no existe, usa speakJa(japaneseText).
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
      // Audio MP3 estático reproducido con éxito
    })
    .catch(() => {
      // Si el archivo MP3 no se encontró o el navegador bloqueó la ruta, usar Fallback TTS
      speakJa(japaneseText);
    });
}

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}
