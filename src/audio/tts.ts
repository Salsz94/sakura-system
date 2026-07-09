// ════════════════════════════════════════════════════════════════
// TTS — pronunciación japonesa vía Web Speech API (nativa del
// navegador/OS: gratis, sin archivos de audio, sin licencias de
// terceros). En móvil las voces suelen ser locales (funcionan
// offline); en desktop depende del OS. Por eso el ejercicio de
// escucha SIEMPRE ofrece un fallback visual ("ver romaji").
// ════════════════════════════════════════════════════════════════

function pickJaVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  const voices = speechSynthesis.getVoices();
  // Preferir voces locales (funcionan sin red).
  return (
    voices.find((v) => v.lang.startsWith('ja') && v.localService) ||
    voices.find((v) => v.lang.startsWith('ja')) ||
    null
  );
}

/** ¿Hay soporte de síntesis de voz (aunque la voz ja pueda tardar en cargar)? */
export function ttsSupported(): boolean {
  return typeof speechSynthesis !== 'undefined';
}

/**
 * Pronuncia texto en japonés. Devuelve false si no se pudo hablar
 * (sin soporte / sin voz ja) para que la UI muestre el fallback.
 * Nunca lanza.
 */
export function speakJa(text: string, rate = 0.8): boolean {
  try {
    if (!ttsSupported()) return false;
    const voice = pickJaVoice();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    if (voice) u.voice = voice;
    u.rate = rate;
    speechSynthesis.cancel(); // no encolar repeticiones
    speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

// Algunos navegadores cargan las voces async — precalentar la lista.
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}
