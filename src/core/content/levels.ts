import type { LevelInfo } from '../types';

/**
 * RUTA MAESTRA DE ADQUISICIÓN DE LA LENGUA JAPONESA (0 A 100)
 * 8 Niveles pedagógicos integrados con la ciencia cognitiva del lenguaje.
 *
 * moduleIds deben coincidir con los IDs reales en modules.ts.
 * Módulos actuales: m1, m2, m3, m4, m5, m6, m7, m8.
 * A medida que se añadan módulos nuevos (ej. m1_2, m3_2…), actualizar aquí.
 */
export const LEVELS: LevelInfo[] = [
  {
    id: 1,
    title: 'Nivel 1: Fundamentos Absolutos',
    sub: 'Ortografía Fonética, Prosodia y Fonología Temprana',
    description: 'Dominio de Hiragana, Katakana, ritmo moraico isocrónico y sensibilización inicial al Pitch Accent.',
    color: '#8CF244',
    moduleIds: ['m1', 'm2'],
  },
  {
    id: 2,
    title: 'Nivel 2: Gramática Elemental I',
    sub: 'Sintaxis S.O.V., Deícticos, Marcadores y Léxico Inicial',
    description: 'Estructura SOV, Cópula desu, partículas wa/no/mo/ka, sistema Kosoado 3D y números.',
    color: '#38BDF8',
    moduleIds: ['m3', 'm4'],
  },
  {
    id: 3,
    title: 'Nivel 3: Gramática Elemental II',
    sub: 'Sistema Verbal, Adjetivos I y Espacio-Tiempo',
    description: 'Verbos Godan/Ichidan/Irregulares, Masu-kei, Jisho-kei, partículas de tiempo/espacio y Adjetivos I.',
    color: '#A855F7',
    moduleIds: ['m5'],
  },
  {
    id: 4,
    title: 'Nivel 4: Adquisición Sinográfica',
    sub: 'Decodificación del Kanji y Métodos Mnemotécnicos',
    description: 'Anatomía del Kanji, lecturas Onyomi/Kunyomi, radicales y métodos Heisig/RTK, WaniKani y KKLC.',
    color: '#EC4899',
    moduleIds: ['m6'],
  },
  {
    id: 5,
    title: 'Nivel 5: Gramática Intermedia I',
    sub: 'Transitividad, Sintaxis -te, Voz y Procesabilidad',
    description: 'Parejas Jidoushi/Tadoushi, encadenamiento V-te, Pasiva, Causativa y Causativa-Pasiva.',
    color: '#F59E0B',
    moduleIds: ['m7'],
  },
  {
    id: 6,
    title: 'Nivel 6: Lectura e Inmersión',
    sub: 'Adquisición Contextual, Input Comprensible y Tadoku',
    description: 'KiC (Kanji in Context), Sentence Mining, rutinas de inmersión y lectura extensiva Tadoku.',
    color: '#10B981',
    moduleIds: ['m8'],
  },
  {
    id: 7,
    title: 'Nivel 7: Auditivo y Oralidad',
    sub: 'Shadowing Prosódico y Fluidez Monolingüe',
    description: 'Protocolo de Shadowing en 4 Pasos, podcasts intermedios y transición a diccionarios monolingües.',
    color: '#6366F1',
    moduleIds: [], // Módulos aún no creados — se añadirán al expandir contenido
  },
  {
    id: 8,
    title: 'Nivel 8: Maestría Avanzada',
    sub: 'Lectura Crítica, Keigo y Pragmática Profesional',
    description: 'Shin Kanzen Master N2/N1, EJU, lenguaje honorífico Keigo (Sonkeigo/Kenjougo) y pragmática.',
    color: '#E11D48',
    moduleIds: [], // Módulos aún no creados — se añadirán al expandir contenido
  },
];
