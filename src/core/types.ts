// ════════════════════════════════════════════════════════════════
// TIPOS DEL DOMINIO — Sakura System
// Núcleo puro: sin dependencias de React ni de Supabase.
// ════════════════════════════════════════════════════════════════

// ── CONTENIDO ───────────────────────────────────────────────────

/** Par de vocabulario contextual mostrado en una lección. */
export interface VocabItem {
  jp: string;
  es: string;
}

/** Una lección: introduce un set de caracteres/palabras con sus lecturas. */
export interface Lesson {
  id: string;
  /** Título corto (ej. "あ行"). */
  t: string;
  /** Subtítulo / lecturas resumidas (ej. "a · i · u · e · o"). */
  s: string;
  /** XP que otorga completar la lección. */
  xp: number;
  /** Caracteres o palabras objetivo. */
  chars: string[];
  /** Lecturas romaji paralelas a `chars` (mismo índice). */
  reads: string[];
  /** Nota didáctica mostrada en la intro. */
  note: string;
  /** Vocabulario contextual opcional (lecciones de gramática). */
  vocab?: VocabItem[];
}

/**
 * Lección en curso: la `Lesson` de contenido más los campos que
 * `openLesson`/`openReview` agregan en runtime (ejercicios generados,
 * módulo al que pertenece, si es una sesión de repaso SRS).
 */
export interface ActiveLesson extends Lesson {
  exercises: Exercise[];
  modId?: string | null;
  modTitle?: string;
  isReview?: boolean;
}

/** Un módulo agrupa lecciones + un examen final. */
export interface Module {
  id: string;
  /** Bloque temático (ej. "I", "II"). */
  block: string;
  /** Etiqueta del bloque (ej. "Alfabetización y Fonética"). */
  bLabel: string;
  title: string;
  sub: string;
  /** Color de acento del módulo. */
  color: string;
  /** XP que otorga aprobar el examen del módulo. */
  xpE: number;
  /** Id del módulo previo requerido para desbloquear (opcional para m1). */
  req?: string;
  lessons: Lesson[];
}

/** Mnemotecnias: caracter → frase mnemónica. */
export type Mnemonics = Record<string, string>;

/** Dato cultural mostrado durante las cargas. */
export interface Fact {
  t: string;
  b: string;
}

// ── EJERCICIOS ──────────────────────────────────────────────────

export type ExerciseType =
  | 'kana_hero'
  | 'type_romaji'
  | 'pick_kana'
  | 'true_false'
  | 'order'
  | 'pair_match'
  | 'build_sentence'
  | 'listen';

export interface PairItem {
  left: string;
  right: string;
}

/** Ejercicio generado por el motor. Campos según `type`. */
export interface Exercise {
  id: number;
  type: ExerciseType;
  q: string;
  hint: string;
  /** Caracter objetivo (para alimentar maestría/SRS). Ausente en order/pair_match. */
  char?: string;
  kana?: string;
  romaji?: string;
  opts?: string[];
  ans?: number | string | boolean | string[];
  claim?: string;
  items?: string[];
  pairs?: PairItem[];
}

// ── PROGRESO Y MAESTRÍA ─────────────────────────────────────────

/** Vidas Dark Souls por módulo. */
export type ModuleLives = Record<string, number>;

/** Progreso general del usuario (tabla user_progress). */
export interface Progress {
  xp: number;
  streak: number;
  doneLs: string[];
  passedEx: string[];
  moduleLives: ModuleLives;
  /** Fecha (YYYY-MM-DD) de la última sesión de entrenamiento. */
  lastTrainedOn?: string | null;
  /** Segundos totales acumulados entrenando (todas las sesiones). */
  studySeconds?: number;
  /** Alias público mostrado en el leaderboard (nunca el email). */
  displayName?: string | null;
}

/** Tarjeta de maestría/SRS por caracter (tabla mastery). */
export interface MasteryCard {
  /** 0–100, indicador visual de dominio. */
  score: number;
  attempts: number;
  lastResult: 'correct' | 'incorrect' | '';
  /** Caja de Leitner (0 = nueva, 1..5). */
  box: number;
  /** ISO date de próximo repaso. */
  nextReview?: string | null;
}

export type MasteryMap = Record<string, MasteryCard>;
