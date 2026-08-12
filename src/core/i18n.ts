// ════════════════════════════════════════════════════════════════
// I18N — SakiGo (Saki = Sakura + Go = 語 Idioma Japonés)
// Sistema de localización dual Español / English
// ════════════════════════════════════════════════════════════════

export type AppLang = 'es' | 'en';

const STORAGE_KEY = 'sakigo_lang';

export function getSavedLang(): AppLang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'es') return saved;
  } catch {}
  return 'es';
}

export function saveLang(lang: AppLang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
}

export const T = {
  es: {
    appName: 'SakiGo',
    appTagline: 'Aprende Japonés con Estética Cyberpunk',
    home: 'Inicio',
    map: 'Mapa de Lecciones',
    profile: 'Perfil Cyberpunk',
    review: 'Repaso Diario (SRS)',
    speedReview: 'Reto 46 Gojūon',
    streak: 'Racha Diaria',
    days: 'días',
    lessons: 'Lecciones',
    passedModules: 'Módulos Aprobados',
    nextRank: 'Próximo Rango',
    dailyGoals: 'Objetivos Diarios',
    goalsDone: 'Objetivos Completados',
    unlockedVocab: 'Vocabulario Desbloqueado',
    learnedWords: 'Palabras Aprendidas',
    startLesson: 'Iniciar Lección',
    continueLearning: 'CONTINUAR APRENDIZAJE',
    language: 'Idioma / Language',
    roninLicense: 'Licencia Ronin',
    unlimitedAccess: 'Acceso Total al Curso',
  },
  en: {
    appName: 'SakiGo',
    appTagline: 'Learn Japanese with Cyberpunk Aesthetics',
    home: 'Home',
    map: 'Lesson Map',
    profile: 'Cyberpunk Profile',
    review: 'Daily Review (SRS)',
    speedReview: '46 Gojūon Challenge',
    streak: 'Daily Streak',
    days: 'days',
    lessons: 'Lessons',
    passedModules: 'Passed Modules',
    nextRank: 'Next Rank',
    dailyGoals: 'Daily Goals',
    goalsDone: 'Goals Completed',
    unlockedVocab: 'Unlocked Vocabulary',
    learnedWords: 'Learned Words',
    startLesson: 'Start Lesson',
    continueLearning: 'CONTINUE LEARNING',
    language: 'Language / Idioma',
    roninLicense: 'Ronin License',
    unlimitedAccess: 'Full Course Unlock',
  },
};
