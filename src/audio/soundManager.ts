// ════════════════════════════════════════════════════════════════
// SOUND MANAGER — infraestructura de audio.
// Si un archivo todavía no existe en /public/sounds/, falla en
// silencio: nunca rompe la experiencia ni ensucia la consola.
// ════════════════════════════════════════════════════════════════

export type SoundName = 'open' | 'correct' | 'wrong' | 'levelUp' | 'examPass' | 'examFail';

// Coloca aquí los archivos (mp3/ogg/wav) con estos nombres exactos.
const SOUND_FILES: Record<SoundName, string> = {
  open: '/sounds/open.mp3',
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  levelUp: '/sounds/level-up.mp3',
  examPass: '/sounds/exam-pass.mp3',
  examFail: '/sounds/exam-fail.mp3',
};

const MUTE_KEY = 'sakura_sound_muted';
const cache: Partial<Record<SoundName, HTMLAudioElement>> = {};
let enabled = true;

/** Llamar una vez al montar la app: carga la preferencia guardada. */
export function initSound(): void {
  try {
    enabled = localStorage.getItem(MUTE_KEY) !== '1';
  } catch {
    enabled = true;
  }
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? '0' : '1');
  } catch {
    // localStorage puede fallar en modo privado — no es crítico.
  }
}

/** Reproduce un sonido por nombre. Silencioso si está muteado, ausente o bloqueado. */
export function playSound(name: SoundName, volume = 0.55): void {
  if (!enabled) return;
  try {
    let audio = cache[name];
    if (!audio) {
      audio = new Audio(SOUND_FILES[name]);
      audio.volume = volume;
      cache[name] = audio;
    }
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Autoplay bloqueado por el navegador o archivo aún no agregado — no es un error real.
    });
  } catch {
    // El audio nunca debe romper el juego.
  }
}
