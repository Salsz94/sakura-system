import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { supabase } from './data/supabaseClient';
import { MN, FACTS, MODULES, CHAR_READS, ALL_CHARS, ALL_READS, getSpeedReviewPool } from './core/content';
import { rng, shuffle, genExercises, uniqueBy } from './core/engine';
import { getRank, DEFAULT_LIVES, bumpStreak, displayStreak, todayKey, dynamicPassThreshold } from './core/progression';
import { reviewCard, dueChars } from './core/srs';
import { computeProfileStats } from './core/stats';
import { loadProgress, saveProgress, loadMastery, saveMastery, submitScore } from './data/repositories';
import type { KanaSet } from './data/repositories/leaderboardRepo';
import { queueProgress, queueMastery, flushOfflineQueue, hasPendingSync, snapshotProgress, snapshotMastery, loadSnapshot } from './data/offlineQueue';
import type { Module } from './core/types';
import { initSound, playSound } from './audio/soundManager';
import { C } from './styles/tokens';
import { HomeScreen } from './screens/HomeScreen';
import { MapScreen } from './screens/MapScreen';
import { ModuleLessonsScreen } from './screens/ModuleLessonsScreen';
import { IntroScreen } from './screens/IntroScreen';
import { BattleScreen } from './screens/BattleScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { FailScreen } from './screens/FailScreen';
import { ExamPhaseScreen } from './screens/ExamPhaseScreen';
import { ExamResScreen } from './screens/ExamResScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SpeedSelectScreen } from './screens/SpeedSelectScreen';
import { SpeedReviewScreen } from './screens/SpeedReviewScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { LevelUpOverlay } from './components/LevelUpOverlay';


// ── NAVEGACIÓN ───────────────────────────────────────────────────
const SCR = {
  HOME: 'home',
  MAP: 'map',
  INTRO: 'intro',
  BATTLE: 'battle',
  SUMMARY: 'summary',
  FAIL: 'fail',
  EXAM_RES: 'exam_res',
  EXAM_PHASE: 'exam_phase',
  REVIEW: 'review',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  SPEED_SELECT: 'speed_select',
  SPEED_REVIEW: 'speed_review',
  LEADERBOARD: 'leaderboard',
  MODULE_LESSONS: 'module_lessons',
};

// ════════════════════════════════════════════════════════════════
// APP
// ════════════════════════════════════════════════════════════════
export default function App() {
  // ── AUTH STATE ──────────────────────────────────
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLd] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // "login"|"register"
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [offline, setOffline] = useState(false);

  // ── GAME STATE ──────────────────────────────────
  const [scr, setScr] = useState(SCR.HOME);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastTrainedOn, setLastTrainedOn] = useState(null);
  const [studySeconds, setStudySeconds] = useState(0);
  const [displayName, setDisplayName] = useState(null);
  const [speedKanaSet, setSpeedKanaSet] = useState<KanaSet>('hiragana');
  const [viewingModule, setViewingModule] = useState(null);
  const sessionStartRef = useRef(null);
  const [doneLs, setDoneLs] = useState([]);
  const [passedEx, setPassedEx] = useState([]);
  const [mastery, setMastery] = useState({});
  const [moduleLives, setModLives] = useState({ ...DEFAULT_LIVES }); // Dark Souls lives
  const [lesson, setLesson] = useState(null);
  const [examData, setExamData] = useState(null);
  const [exIdx, setExIdx] = useState(0);
  const [hp, setHp] = useState(5);
  const [sesXp, setSesXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errs, setErrs] = useState(0);
  const [sel, setSel] = useState(null);
  const [answered, setAns] = useState(false);
  const [timer, setTimer] = useState(20);
  const [timerOn, setTimerOn] = useState(false);
  const [orderSel, setOSel] = useState([]);
  const [romajiInput, setRomaji] = useState('');
  const [shaking, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const [errFlash, setErrFlash] = useState(false);
  const [toast, setToast] = useState(null);
  const [particles, setPtcl] = useState([]);
  const [scanline, setScanline] = useState(false);
  const [examRes, setExamRes] = useState(null);
  const [awardedXp, setAwardedXp] = useState(0); // XP realmente otorgada (Summary honesto)
  const [examPhase, setExamPhase] = useState(0);
  const [examPhaseXp, setExPhXp] = useState(0);
  const [showDeath, setShowDeath] = useState(null); // {modId, modTitle}
  const timerRef = useRef(null);
  const openedRef = useRef(false);
  // Último userId visto por el auth listener (para ignorar TOKEN_REFRESHED).
  const lastUserIdRef = useRef<string | null>(null);
  // false = no hubo NINGUNA carga válida (ni servidor ni snapshot):
  // escribir pisaría el progreso real con ceros. Se activa en pullProgress.
  const canWriteRef = useRef(false);

  // ── SONIDO — cargar preferencia guardada ────────
  useEffect(() => {
    initSound();
  }, []);

  // ── OFFLINE — detectar conexión y sincronizar pendientes ────────
  useEffect(() => {
    setOffline(typeof navigator !== 'undefined' && navigator.onLine === false);
    if (hasPendingSync()) flushOfflineQueue();
    const handleOnline = () => {
      setOffline(false);
      flushOfflineQueue();
      // Si seguimos en modo solo-lectura (nunca hubo carga válida),
      // reintentar la carga ahora que hay red.
      if (!canWriteRef.current && lastUserIdRef.current) {
        pullProgress(lastUserIdRef.current);
      }
    };
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ── AUTH LISTENER ───────────────────────────────
  // Solo reacciona a cambios REALES de usuario (login/logout/carga
  // inicial). TOKEN_REFRESHED dispara ~cada hora y antes re-descargaba
  // el progreso pisando el estado local a mitad de sesión. Además el
  // trabajo async se saca del callback (patrón anti-deadlock de
  // supabase-js v2: nunca await dentro de onAuthStateChange).
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setAuthLd(false);
      const prevId = lastUserIdRef.current;
      if (u?.id === prevId) return; // refresh de token / re-focus: ignorar
      lastUserIdRef.current = u?.id ?? null;
      setUser(u);
      if (u) {
        setTimeout(() => {
          pullProgress(u.id);
          if (!openedRef.current) {
            openedRef.current = true;
            playSound('open');
          }
        }, 0);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── TIMER ───────────────────────────────────────
  useEffect(() => {
    if (scr !== SCR.BATTLE || !timerOn || answered) return;
    if (timer <= 0) {
      doAnswer(-1);
      return;
    }
    timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [scr, timerOn, timer, answered]);

  // Cancelar timer si el usuario sale de la batalla a cualquier otra pantalla
  useEffect(() => {
    if (scr !== SCR.BATTLE) {
      setTimerOn(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [scr]);

  // ── PULL PROGRESS FROM SUPABASE ─────────────────
  const pullProgress = async (userId) => {
    setSyncing(true);
    const { row: data, failed } = await loadProgress(userId);
    if (data) {
      setXp(data.xp || 0);
      setDoneLs(data.done_lessons || []);
      setPassedEx(data.passed_exams || []);
      setModLives(data.module_lives || { ...DEFAULT_LIVES });
      setLastTrainedOn(data.last_trained_on || null);
      // Racha viva: si la última sesión fue hoy o ayer se mantiene; si no, 0.
      setStreak(displayStreak(data.streak || 0, data.last_trained_on));
      setStudySeconds(data.study_seconds || 0);
      setDisplayName(data.display_name || null);
      const m = await loadMastery(userId);
      setMastery(m);
      // Espejo local: el último estado bueno queda disponible offline.
      snapshotProgress(userId, {
        xp: data.xp || 0,
        streak: data.streak || 0,
        doneLs: data.done_lessons || [],
        passedEx: data.passed_exams || [],
        moduleLives: data.module_lives || { ...DEFAULT_LIVES },
        lastTrainedOn: data.last_trained_on || null,
        studySeconds: data.study_seconds || 0,
        displayName: data.display_name || null,
      });
      snapshotMastery(userId, m);
      setOffline(false);
      canWriteRef.current = true;
    } else if (!failed) {
      // Usuario genuinamente nuevo (sin fila, confirmado por el servidor).
      const m = await loadMastery(userId);
      setMastery(m);
      canWriteRef.current = true;
    } else {
      // FALLO REAL de carga (sin red, RLS, migración). Si hay snapshot
      // local de ESTE usuario, arrancar con él — modo offline (tren,
      // parque): es su estado real, escribir sobre él es seguro.
      const snap = loadSnapshot(userId);
      if (snap.progress) {
        const p = snap.progress;
        setXp(p.xp || 0);
        setDoneLs(p.doneLs || []);
        setPassedEx(p.passedEx || []);
        setModLives(p.moduleLives || { ...DEFAULT_LIVES });
        setLastTrainedOn(p.lastTrainedOn || null);
        setStreak(displayStreak(p.streak || 0, p.lastTrainedOn));
        setStudySeconds(p.studySeconds || 0);
        setDisplayName(p.displayName || null);
        setMastery(snap.mastery || {});
        setOffline(true);
        canWriteRef.current = true;
      } else {
        // Sin datos del servidor NI snapshot: el estado en memoria son
        // defaults (xp=0). Escribir ahora PISARÍA el progreso real con
        // ceros — modo solo-lectura hasta lograr una carga válida.
        setOffline(true);
        canWriteRef.current = false;
      }
    }
    setSyncing(false);
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 600);
  };

  // ── REGISTRAR SESIÓN DE HOY (racha) ─────────────
  // Llamar al completar una lección/examen/repaso. Devuelve el nuevo estado.
  const markTrainedToday = useCallback(() => {
    const { streak: newStreak, lastTrainedOn: newDate } = bumpStreak(
      streak,
      lastTrainedOn
    );
    setStreak(newStreak);
    setLastTrainedOn(newDate);
    return { streak: newStreak, lastTrainedOn: newDate };
  }, [streak, lastTrainedOn]);

  // ── ACUMULAR TIEMPO DE ESTUDIO ──────────────────
  // Llamar al terminar una sesión (lección/repaso/examen). Devuelve el total.
  const accumulateStudyTime = useCallback(() => {
    const start = sessionStartRef.current;
    sessionStartRef.current = null;
    if (!start) return studySeconds;
    const elapsed = Math.round((Date.now() - start) / 1000);
    // Tope de cordura por sesión (pestaña olvidada abierta, etc.)
    const clamped = Math.min(Math.max(elapsed, 0), 7200);
    const newTotal = studySeconds + clamped;
    setStudySeconds(newTotal);
    return newTotal;
  }, [studySeconds]);

  // ── PUSH PROGRESS TO SUPABASE ───────────────────
  const pushProgress = useCallback(
    async (overrides = {}) => {
      // canWriteRef: sin una carga válida previa, escribir pisaría el
      // progreso real del servidor con el estado default (xp=0).
      if (!user || !canWriteRef.current) return;
      const state = {
        xp,
        streak,
        doneLs,
        passedEx,
        moduleLives,
        lastTrainedOn,
        studySeconds,
        displayName,
        ...overrides,
      };
      // Espejo local SIEMPRE (haya red o no): si el usuario cierra la
      // app sin señal, al reabrirla ve su progreso más reciente.
      snapshotProgress(user.id, state);
      const okSaved = await saveProgress(user.id, state);
      if (!okSaved) {
        queueProgress(user.id, state);
        setOffline(true);
      } else {
        setOffline(false);
      }
    },
    [user, xp, streak, doneLs, passedEx, moduleLives, lastTrainedOn, studySeconds, displayName]
  );

  // changedKeys: si se pasa, solo se suben ESAS tarjetas (una respuesta
  // toca 1 tarjeta; antes se subía el mapa completo — cientos de filas
  // por cada tap con usuarios avanzados). El snapshot y la cola siempre
  // guardan el mapa completo (son "estado", no eventos).
  const pushMastery = useCallback(
    async (newMastery, changedKeys = null) => {
      if (!user || !canWriteRef.current) return;
      snapshotMastery(user.id, newMastery);
      const subset =
        changedKeys && changedKeys.length
          ? Object.fromEntries(
              changedKeys.filter((k) => newMastery[k]).map((k) => [k, newMastery[k]])
            )
          : newMastery;
      const okSaved = await saveMastery(user.id, subset);
      if (!okSaved) {
        queueMastery(user.id, newMastery);
        setOffline(true);
      } else {
        setOffline(false);
      }
    },
    [user]
  );

  // ── SRS para ejercicios sin char único (pair_match) ──
  // Cada par emparejado correctamente avanza su kana en Leitner.
  const recordPairs = useCallback(
    (chars, allCorrect) => {
      if (!chars || chars.length === 0) return;
      const newM = { ...mastery };
      chars.forEach((ch) => {
        if (ch) newM[ch] = reviewCard(newM[ch], allCorrect);
      });
      setMastery(newM);
      pushMastery(newM, chars.filter(Boolean));
    },
    [mastery, pushMastery]
  );

  // ── AUTH ACTIONS ────────────────────────────────
  const handleAuth = async () => {
    setAuthBusy(true);
    setAuthError('');
    try {
      if (authMode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setAuthError('✓ Revisa tu email para confirmar la cuenta');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (e) {
      setAuthError(e.message || 'Error de autenticación');
    }
    setAuthBusy(false);
  };

  // Recuperación de contraseña — sin esto, contraseña olvidada
  // significaba progreso inaccesible para siempre.
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setAuthError('Escribe tu email arriba y vuelve a tocar el enlace.');
      return;
    }
    setAuthBusy(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setAuthError('✓ Te enviamos un correo para restablecer la contraseña');
    } catch (e) {
      setAuthError(e.message || 'No se pudo enviar el correo');
    }
    setAuthBusy(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setXp(0);
    setDoneLs([]);
    setPassedEx([]);
    setModLives({ ...DEFAULT_LIVES });
    setMastery({});
    setStreak(0);
    setLastTrainedOn(null);
    setStudySeconds(0);
    setDisplayName(null); // el alias NO se hereda entre cuentas del mismo dispositivo
    canWriteRef.current = false; // el próximo usuario necesita su propia carga válida
    setScr(SCR.HOME);
  };

  // ── SETTINGS ACTIONS ────────────────────────────
  const syncNow = async () => {
    if (!user) return;
    await flushOfflineQueue();
    await pullProgress(user.id);
    showToast('✓ Sincronizado');
  };

  const exportProgress = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      email: user?.email || null,
      progress: { xp, streak, doneLs, passedEx, moduleLives, lastTrainedOn, studySeconds },
      mastery,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sakura-progreso-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Progreso exportado');
  };

  const resetProgress = async () => {
    const ok = window.confirm(
      '¿Reiniciar TODO tu progreso? Se perderán XP, lecciones, exámenes, racha, tiempo entrenado y maestría. Esta acción no se puede deshacer.'
    );
    if (!ok) return;
    setXp(0);
    setDoneLs([]);
    setPassedEx([]);
    setModLives({ ...DEFAULT_LIVES });
    setMastery({});
    setStreak(0);
    setLastTrainedOn(null);
    setStudySeconds(0);
    if (user) {
      await saveProgress(user.id, {
        xp: 0,
        streak: 0,
        doneLs: [],
        passedEx: [],
        moduleLives: { ...DEFAULT_LIVES },
        lastTrainedOn: null,
        studySeconds: 0,
      });
      // Borrar maestría del usuario en Supabase.
      const { error: delErr } = await supabase
        .from('mastery')
        .delete()
        .eq('user_id', user.id);
      if (delErr) console.error('[resetProgress] borrar maestría falló:', delErr.message);
      // Borrar también las marcas del leaderboard ("TODO" es TODO).
      // Requiere la policy DELETE de la migración 004.
      const { error: srsErr } = await supabase
        .from('speed_review_scores')
        .delete()
        .eq('user_id', user.id);
      if (srsErr) console.error('[resetProgress] borrar scores falló:', srsErr.message);
    }
    setScr(SCR.HOME);
    showToast('Progreso reiniciado');
  };

  // ── HELPERS ─────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };
  const spawnP = (type) => {
    if (type === 'err') return; // err usa shake + flash en la card, no partículas
    // Burst de fragmentos de energía (shards) en abanico — estilo HUD.
    const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    const ps = angles.map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const dist = 40 + Math.random() * 55;
      return {
        id: Date.now() + i,
        x: 50,
        y: 30,
        dx: Math.cos(rad) * dist,
        dy: Math.sin(rad) * dist,
        angle,
        len: 8 + Math.random() * 10,
        type,
      };
    });
    setPtcl(ps);
    setScanline(true);
    setTimeout(() => setPtcl([]), 550);
    setTimeout(() => setScanline(false), 450);
  };
  const startEx = () => {
    setSel(null);
    setAns(false);
    setOSel([]);
    setRomaji('');
    setTimer(20);
    setTimerOn(true);
  };

  // ── DARK SOULS — perder vida en módulo ──────────
  const loseModuleLife = async (modId, modTitle, extra = {}) => {
    const current = moduleLives[modId] ?? 3;
    const newLives = current - 1;
    let newModLives;
    if (newLives <= 0) {
      // Reset módulo completo
      const mod = MODULES.find((m) => m.id === modId);
      const modLessonIds = mod ? mod.lessons.map((l) => l.id) : [];
      const newDoneLs = doneLs.filter((id) => !modLessonIds.includes(id));
      newModLives = { ...moduleLives, [modId]: 3 };
      setDoneLs(newDoneLs);
      setModLives(newModLives);
      setShowDeath({ modId, modTitle });
      playSound('examFail');
      await pushProgress({ doneLs: newDoneLs, moduleLives: newModLives, ...extra });
    } else {
      newModLives = { ...moduleLives, [modId]: newLives };
      setModLives(newModLives);
      await pushProgress({ moduleLives: newModLives, ...extra });
    }
  };

  // ── OPEN LESSON ─────────────────────────────────
  const openLesson = (les) => {
    sessionStartRef.current = Date.now();
    const seed = Date.now() % 999999;
    const mod = MODULES.find((m) => m.lessons.find((l) => l.id === les.id));
    const allC = mod ? mod.lessons.flatMap((l) => l.chars || []) : [];
    const allR = mod ? mod.lessons.flatMap((l) => l.reads || []) : [];
    const exs = genExercises(
      les.chars || [],
      les.reads || [],
      seed,
      allC,
      allR,
      les.id,
      les.vocab || []
    );
    setLesson({ ...les, exercises: exs, modId: mod?.id, modTitle: mod?.sub });
    setExamData(null);
    setExIdx(0);
    setHp(5);
    setSesXp(0);
    setCombo(0);
    setCorrect(0);
    setErrs(0);
    setScr(SCR.INTRO);
  };

  // ── OPEN EXAM ───────────────────────────────────
  const openExam = (mod: Module) => {
    sessionStartRef.current = Date.now();
    const seed = Date.now() % 99999;
    const r = rng(seed);
    const sh = <T,>(a: T[]): T[] => shuffle(a, r);
    // Dedupe por carácter Y por lectura: el pool del módulo repite
    // caracteres entre lecciones (は en m3l1 y m3l2) — sin esto había
    // opciones duplicadas idénticas y pares imposibles de distinguir.
    const all = uniqueBy(
      uniqueBy(
        mod.lessons.flatMap((l) =>
          (l.chars || [])
            .map((c, i) => ({ ch: c, rd: (l.reads || [])[i] }))
            .filter((p) => p.rd)
        ),
        (p) => p.ch
      ),
      (p) => p.rd
    );
    const rapidQ = sh(all)
      .slice(0, 10)
      .map((item) => {
        const wrong = sh(all.filter((p) => p.rd !== item.rd))
          .slice(0, 3)
          .map((p) => p.rd);
        const opts = sh([item.rd, ...wrong]).slice(0, 4);
        return {
          kana: item.ch,
          ans: item.rd,
          opts,
          hint: MN[item.ch] || `${item.ch} = "${item.rd}"`,
        };
      });
    const matchPairs = sh(all)
      .slice(0, 5)
      .map((p) => ({ left: p.rd, right: p.ch }));
    const memPairs = sh(all)
      .slice(0, 6)
      .map((p) => ({ a: p.ch, b: p.rd }));
    const bossQ = sh(all)
      .slice(0, 5)
      .map((item) => {
        const wrong = sh(all.filter((p) => p.rd !== item.rd))
          .slice(0, 3)
          .map((p) => p.rd);
        const opts = sh([item.rd, ...wrong]).slice(0, 4);
        return {
          kana: item.ch,
          q: '¿Cómo se lee?',
          ans: item.rd,
          opts,
          hint: MN[item.ch] || `${item.ch} = "${item.rd}"`,
          char: item.ch,
        };
      });
    const bossIdx = ['m1', 'm2'].includes(mod.id)
      ? 0
      : ['m3', 'm4'].includes(mod.id)
      ? 1
      : ['m5', 'm6'].includes(mod.id)
      ? 2
      : 3;
    setExamData({ mod, rapidQ, matchPairs, memPairs, bossQ, bossIdx });
    setExamPhase(0);
    setExPhXp(0);
    setLesson(null);
    setExIdx(0);
    setSesXp(0);
    setCorrect(0);
    setErrs(0);
    setScr(SCR.EXAM_PHASE);
  };

  // ── REPASO DIARIO (SRS) ─────────────────────────
  // Caracteres vencidos hoy según las cajas de Leitner.
  // Memoizado: no recalcular en cada tick del timer de batalla (1x/seg).
  const dueReviewChars = useMemo(
    () => dueChars(mastery).filter((c) => CHAR_READS[c]),
    [mastery]
  );
  const dueCount = dueReviewChars.length;

  const openReview = () => {
    if (dueCount === 0) return;
    sessionStartRef.current = Date.now();
    const chars = dueReviewChars.slice(0, 12);
    const reads = chars.map((c) => CHAR_READS[c]);
    const seed = Date.now() % 999999;
    // Pool global de distractores para que las opciones sean variadas.
    const exs = genExercises(chars, reads, seed, ALL_CHARS, ALL_READS, 'review');
    setLesson({
      id: 'review',
      isReview: true,
      t: 'Repaso diario',
      s: `${chars.length} ${chars.length === 1 ? 'carácter' : 'caracteres'}`,
      xp: 0,
      chars,
      reads,
      note: 'Repaso espaciado: estos caracteres están a punto de olvidarse. Acertar los aleja en el tiempo; fallar los trae de vuelta pronto.',
      exercises: exs,
      modId: null,
      modTitle: 'Repaso',
    });
    setExamData(null);
    setExIdx(0);
    setHp(5);
    setSesXp(0);
    setCombo(0);
    setCorrect(0);
    setErrs(0);
    setScr(SCR.BATTLE);
    startEx();
  };

  // ── MAPA — abrir lecciones de un solo módulo ────
  const openModuleView = (mod) => {
    setViewingModule(mod);
    setScr(SCR.MODULE_LESSONS);
  };

  // ── REPASO CRONOMETRADO (leaderboard global) ────
  const openSpeedSelect = () => setScr(SCR.SPEED_SELECT);
  const selectSpeedSet = (set: KanaSet) => {
    setSpeedKanaSet(set);
    setScr(SCR.SPEED_REVIEW);
  };
  const speedPool = getSpeedReviewPool(speedKanaSet, doneLs);
  // Pool mínimo para rankear: con 5 caracteres desbloqueados las corridas
  // son estructuralmente más rápidas que con 46 — compararlas premiaría
  // haber avanzado MENOS. Bajo el mínimo se puede jugar, pero no rankea.
  const SPEED_MIN_POOL = 20;
  const finishSpeedReview = async (timeMs: number, errors: number) => {
    if (!user) return;
    if (speedPool.chars.length < SPEED_MIN_POOL) return;
    await submitScore(user.id, speedKanaSet, timeMs, errors, displayName || 'Anónimo');
  };
  const saveDisplayName = async (name: string) => {
    setDisplayName(name);
    await pushProgress({ displayName: name });
  };

  // ── FALLO INMEDIATO POR HP=0 ────────────────────
  // Los corazones eran decorativos: llegar a 0 no tenía consecuencia.
  // Ahora quedarse sin HP falla la lección al instante (no aplica a
  // repasos SRS, que no se aprueban ni se reprueban).
  const failLessonNow = async (les) => {
    const totalStudySeconds = accumulateStudyTime();
    await loseModuleLife(les.modId, les.modTitle, {
      studySeconds: totalStudySeconds,
    });
    setScr(SCR.FAIL);
  };

  // Normalización de romaji: espacios colapsados + minúsculas, para que
  // "masen  deshita" no falle por un doble espacio.
  const normRomaji = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');

  // ── ANSWER HANDLER ──────────────────────────────
  const doAnswer = useCallback(
    (idx, textInput = '') => {
      if (answered) return;
      clearTimeout(timerRef.current);
      setTimerOn(false);
      setAns(true);
      setSel(idx);
      const ex = lesson.exercises[exIdx];
      let ok = false;
      if (ex.type === 'order' || ex.type === 'build_sentence')
        ok = JSON.stringify(orderSel) === JSON.stringify(ex.ans);
      else if (ex.type === 'true_false') ok = (idx === 1) === ex.ans;
      else if (ex.type === 'type_romaji')
        ok = normRomaji(textInput) === normRomaji(ex.ans);
      else if (ex.type === 'pair_match') ok = false;
      else ok = idx === ex.ans;

      // Actualizar maestría + SRS Leitner — solo la tarjeta tocada.
      if (ex.char) {
        const newM = {
          ...mastery,
          [ex.char]: reviewCard(mastery[ex.char], ok),
        };
        setMastery(newM);
        pushMastery(newM, [ex.char]);
      }

      if (ok) {
        // XP de sesión solamente: la XP global se otorga al APROBAR la
        // lección (nextEx), y solo la primera vez — sin farmeo por
        // repetir ni por salir a mitad con XP bancada.
        const g = 10 + (combo >= 2 ? 5 : 0);
        setSesXp((s) => s + g);
        setCombo((c) => c + 1);
        setCorrect((c) => c + 1);
        setFlash(true);
        setTimeout(() => setFlash(false), 500);
        spawnP('ok');
        playSound('correct');
      } else {
        const newHp = Math.max(0, hp - 1);
        setHp(newHp);
        setCombo(0);
        setErrs((e) => e + 1);
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setErrFlash(true);
        setTimeout(() => setErrFlash(false), 400);
        playSound('wrong');
        if (newHp === 0 && lesson && !lesson.isReview) {
          // Deja ver el feedback del error antes de la pantalla de fallo.
          setTimeout(() => failLessonNow(lesson), 1100);
        }
      }
    },
    [answered, exIdx, lesson, combo, orderSel, mastery, hp]
  );

  // Nota: la lógica NO debe vivir dentro del callback funcional de setOSel
  // (React StrictMode lo invoca dos veces en dev, duplicando XP/aciertos/sonido).
  const tapOrder = (char) => {
    if (answered) return;
    if (orderSel.includes(char)) {
      setOSel(orderSel.filter((c) => c !== char));
      return;
    }
    const next = [...orderSel, char];
    setOSel(next);
    const ex = lesson.exercises[exIdx];
    if (next.length === ex.ans.length) {
      clearTimeout(timerRef.current);
      setTimerOn(false);
      setAns(true);
      const ok = JSON.stringify(next) === JSON.stringify(ex.ans);
      if (ok) {
        const g = 10 + (combo >= 2 ? 5 : 0);
        setSesXp((s) => s + g);
        setCombo((c) => c + 1);
        setCorrect((c) => c + 1);
        setFlash(true);
        setTimeout(() => setFlash(false), 500);
        spawnP('ok');
        playSound('correct');
      } else {
        const newHp = Math.max(0, hp - 1);
        setHp(newHp);
        setCombo(0);
        setErrs((e) => e + 1);
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setErrFlash(true);
        setTimeout(() => setErrFlash(false), 400);
        playSound('wrong');
        if (newHp === 0 && lesson && !lesson.isReview) {
          setTimeout(() => failLessonNow(lesson), 1100);
        }
      }
    }
  };

  // ── NEXT EXERCISE ───────────────────────────────
  const nextEx = async () => {
    const exs = lesson.exercises;
    if (exIdx < exs.length - 1) {
      setExIdx((i) => i + 1);
      startEx();
      return;
    }

    // Nota: los exámenes NO pasan por aquí — usan el flujo de 3 fases
    // (ExamPhaseScreen → finishExam/failExamRun más abajo).
    if (lesson.isReview) {
      // Repaso diario: el SRS ya se actualizó por respuesta. No toca
      // doneLs ni vidas; solo cuenta como sesión del día. La XP de
      // sesión SÍ se otorga (acotada por las tarjetas vencidas — no
      // es farmeable a voluntad).
      const trained = markTrainedToday();
      const totalStudySeconds = accumulateStudyTime();
      const newXp = xp + sesXp;
      setXp(newXp);
      setAwardedXp(sesXp);
      await pushProgress({
        xp: newXp,
        streak: trained.streak,
        lastTrainedOn: trained.lastTrainedOn,
        studySeconds: totalStudySeconds,
      });
      setScr(SCR.SUMMARY);
    } else {
      const dynamicPass = dynamicPassThreshold(lesson.exercises?.length || 0);
      if (correct >= dynamicPass) {
        // Lección aprobada. XP global SOLO la primera vez (respuestas +
        // bono de lección) — repetir sirve para practicar, no para farmear.
        const trained = markTrainedToday();
        const totalStudySeconds = accumulateStudyTime();
        const firstTime = !doneLs.includes(lesson.id);
        let newDone = doneLs;
        let newXp = xp;
        if (firstTime) {
          newDone = [...doneLs, lesson.id];
          newXp = xp + sesXp + lesson.xp;
          setDoneLs(newDone);
          setXp(newXp);
        }
        setAwardedXp(firstTime ? sesXp + lesson.xp : 0);
        await pushProgress({
          doneLs: newDone,
          xp: newXp,
          streak: trained.streak,
          lastTrainedOn: trained.lastTrainedOn,
          studySeconds: totalStudySeconds,
        });
        setScr(SCR.SUMMARY);
      } else {
        // Lección fallada — perder vida Dark Souls
        const modId = lesson.modId;
        const modTitle = lesson.modTitle;
        const totalStudySeconds = accumulateStudyTime();
        await loseModuleLife(modId, modTitle, { studySeconds: totalStudySeconds });
        setScr(SCR.FAIL);
      }
    }
  };

  // ── FIN DE EXAMEN (3 fases) — persistir el aprobado ─────────────
  // La XP de TODAS las fases se otorga aquí, al aprobar — fallar el
  // boss ya no "banca" la XP de Rapid/Match (farmeo cerrado).
  const finishExam = async (gainedXp: number) => {
    const mod = examData.mod;
    const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
    playSound('examPass');
    const trained = markTrainedToday();
    const totalStudySeconds = accumulateStudyTime();
    const firstTime = !passedEx.includes(mod.id);
    const bonus = firstTime ? mod.xpE || 200 : 0;
    const newXp = xp + examPhaseXp + gainedXp + bonus;
    setXp(newXp);
    let newPassed = passedEx;
    let newModLives = moduleLives;
    if (firstTime) {
      newPassed = [...passedEx, mod.id];
      newModLives = { ...moduleLives, [mod.id]: 3 }; // vidas restauradas
      setPassedEx(newPassed);
      setModLives(newModLives);
    }
    // Un solo push atómico: evita que un segundo guardado con estado
    // viejo del closure pise passedEx/xp/vidas recién actualizados.
    await pushProgress({
      passedEx: newPassed,
      xp: newXp,
      moduleLives: newModLives,
      streak: trained.streak,
      lastTrainedOn: trained.lastTrainedOn,
      studySeconds: totalStudySeconds,
    });
    setExamRes({
      pass: true,
      score: 0,
      total: 0,
      fact,
      mod,
      totalXp: examPhaseXp + gainedXp + bonus,
    });
    setScr(SCR.EXAM_RES);
  };

  const failExamRun = async () => {
    playSound('examFail');
    const trained = markTrainedToday();
    const totalStudySeconds = accumulateStudyTime();
    await pushProgress({
      streak: trained.streak,
      lastTrainedOn: trained.lastTrainedOn,
      studySeconds: totalStudySeconds,
    });
    setExamPhase(0);
    setExPhXp(0);
    setScr(SCR.MAP);
  };

  // ── VOLVER AL CONTEXTO DE LECCIÓN ────────────────
  // Tras terminar/salir de una lección: repaso → Home; lección de un
  // módulo → sus lecciones (no el mapa mundial), estilo videojuego.
  const backToLessonContext = () => {
    if (lesson?.isReview) setScr(SCR.HOME);
    else if (viewingModule) setScr(SCR.MODULE_LESSONS);
    else setScr(SCR.MAP);
  };

  // ── SALIR DE UN EJERCICIO A MITAD DE SESIÓN ──────
  // Sin penalidad: no toca vidas, XP ni progreso de la lección; solo
  // conserva el tiempo de estudio ya acumulado.
  const exitBattle = async () => {
    setTimerOn(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    const totalStudySeconds = accumulateStudyTime();
    await pushProgress({ studySeconds: totalStudySeconds });
    backToLessonContext();
  };

  // ── HELPERS DE MÓDULO ───────────────────────────
  const isModUnlocked = (mod) => !mod.req || passedEx.includes(mod.req);
  const isExamUnlocked = (mod) =>
    mod.lessons.length > 0 &&
    mod.lessons.every((l) => doneLs.includes(l.id)) &&
    !passedEx.includes(mod.id);
  const isExamPassed = (mod) => passedEx.includes(mod.id);
  const getModLives = (modId) => moduleLives[modId] ?? 3;

  const rank = getRank(xp);
  const prevRankRef = useRef<{ uid: string | null; min: number } | null>(null);
  const isRestoringRef = useRef(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  useEffect(() => {
    if (authLoading) return;
    // Mientras la app esté restaurando datos o en carga inicial, NO mostrar animación
    if (isRestoringRef.current) {
      prevRankRef.current = { uid: user?.id ?? null, min: rank.min };
      return;
    }
    const prev = prevRankRef.current;
    // Celebrar SOLO subidas reales del MISMO usuario producidas jugando en vivo
    if (prev && prev.uid === (user?.id ?? null) && rank.min > prev.min) {
      playSound('levelUp');
      setShowLevelUp(true);
    }
    prevRankRef.current = { uid: user?.id ?? null, min: rank.min };
  }, [rank.min, user?.id, authLoading]);
  const totalLs = MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const activeExs = lesson?.exercises || [];
  const curEx = activeExs[exIdx];

  // El timer de 20 s no aplica a pair_match: mide otra habilidad y su
  // expiración a mitad del emparejado producía doble contabilidad
  // (error por timeout + acierto al completar la grilla).
  useEffect(() => {
    if (curEx?.type === 'pair_match') setTimerOn(false);
  }, [curEx]);

  // ── LOADING ─────────────────────────────────────
  if (authLoading) {
    return (
      <div
        style={{
          background: C.bg,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: C.mono,
            fontSize: 11,
            color: C.t2,
            letterSpacing: 3,
          }}
        >
          CARGANDO...
        </div>
      </div>
    );
  }

  // ── AUTH SCREEN ─────────────────────────────────
  if (!user) {
    return (
      <div
        style={{
          fontFamily: "'Outfit',sans-serif",
          background: C.bg,
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div
              style={{
                fontFamily: C.title,
                fontSize: 10,
                letterSpacing: 4,
                color: C.t3,
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              SAKURA SYSTEM
            </div>
            <div
              className="glow-kanji"
              style={{
                fontFamily: C.jp,
                fontSize: 48,
                color: C.accent,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              桜
            </div>
            <div style={{ fontSize: 13, color: C.t2, marginTop: 8 }}>
              Aprende japonés. Una batalla a la vez.
            </div>
          </div>

          <div
            className="corner-frame"
            style={{
              background: C.s1,
              border: `1px solid ${C.b1}`,
              borderRadius: 16,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 0,
                background: C.s2,
                borderRadius: 10,
                padding: 3,
              }}
            >
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setAuthMode(m);
                    setAuthError('');
                  }}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    background: authMode === m ? C.accent : 'transparent',
                    color: authMode === m ? '#04000D' : C.t2,
                    transition: 'all .2s',
                  }}
                >
                  {m === 'login' ? 'Entrar' : 'Registrarse'}
                </button>
              ))}
            </div>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              aria-label="Email"
              type="email"
              autoComplete="email"
              style={{
                background: C.s2,
                border: `1px solid ${C.b2}`,
                borderRadius: 10,
                padding: '13px 16px',
                fontSize: 13,
                color: C.t1,
                outline: 'none',
                caretColor: C.accent,
              }}
              onFocus={(e) => (e.target.style.border = `1px solid ${C.accent}`)}
              onBlur={(e) => (e.target.style.border = `1px solid ${C.b2}`)}
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              aria-label="Contraseña"
              type="password"
              autoComplete="current-password"
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              style={{
                background: C.s2,
                border: `1px solid ${C.b2}`,
                borderRadius: 10,
                padding: '13px 16px',
                fontSize: 13,
                color: C.t1,
                outline: 'none',
                caretColor: C.accent,
              }}
              onFocus={(e) => (e.target.style.border = `1px solid ${C.accent}`)}
              onBlur={(e) => (e.target.style.border = `1px solid ${C.b2}`)}
            />

            {authError && (
              <div
                style={{
                  fontSize: 11,
                  color: authError.startsWith('✓') ? C.ok : C.err,
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                {authError}
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={authBusy || !email || !password}
              style={{
                background: C.accent,
                color: '#04000D',
                border: 'none',
                borderRadius: 10,
                padding: '14px',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                opacity: authBusy || !email || !password ? 0.6 : 1,
                transition: 'opacity .2s',
              }}
            >
              {authBusy
                ? '...'
                : authMode === 'login'
                ? 'ENTRAR AL DOJO'
                : 'CREAR CUENTA'}
            </button>

            {authMode === 'login' && (
              <button
                onClick={handleForgotPassword}
                disabled={authBusy}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: C.t2,
                  fontSize: 11,
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                  padding: 4,
                  alignSelf: 'center',
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>

          <div
            style={{
              textAlign: 'center',
              fontSize: 10,
              color: C.t3,
              lineHeight: 1.7,
            }}
          >
            Tu progreso se guarda en la nube.
            <br />
            Puedes continuar desde cualquier dispositivo.
          </div>
        </div>
      </div>
    );
  }

  // ── DEATH SCREEN — Dark Souls reset ─────────────
  if (showDeath) {
    const handleDeathRestart = () => {
      const modId = showDeath.modId;
      setShowDeath(null);
      if (modId) {
        const mod = MODULES.find((m) => m.id === modId);
        if (mod && mod.lessons.length > 0) {
          openLesson(mod.lessons[0]);
          return;
        }
      }
      setScr(SCR.MAP);
    };

    return (
      <div
        style={{
          fontFamily: "'Outfit',sans-serif",
          background: C.bg,
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 430,
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: C.title,
              fontSize: 11,
              color: C.err,
              letterSpacing: 4,
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            YOU DIED
          </div>
          <div
            style={{
              fontFamily: C.jp,
              fontSize: 80,
              color: 'rgba(255,59,92,.15)',
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            死
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: C.t1,
              marginTop: -16,
            }}
          >
            Has perdido todas las vidas
          </div>
          <div
            style={{
              fontSize: 13,
              color: C.t2,
              lineHeight: 1.8,
              maxWidth: 320,
            }}
          >
            El módulo{' '}
            <span style={{ color: C.accent, fontWeight: 700 }}>
              {showDeath.modTitle}
            </span>{' '}
            ha sido reseteado. Todas las lecciones vuelven a estar bloqueadas.
            El XP ganado se mantiene.
          </div>
          <div
            style={{
              background: C.s1,
              border: `1px solid rgba(255,59,92,.2)`,
              borderRadius: 14,
              padding: '16px 20px',
              width: '100%',
            }}
          >
            <div style={{ fontSize: 11, color: C.t2, marginBottom: 8 }}>
              Recuerda para la próxima:
            </div>
            <div style={{ fontSize: 13, color: C.t1, lineHeight: 1.8 }}>
              Tienes 3 vidas por módulo. Si fallas una lección pierdes 1 vida.
              Llega al examen final antes de perderlas todas.
            </div>
          </div>
          <button
            onClick={handleDeathRestart}
            style={{
              background: C.err,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              width: '100%',
              textTransform: 'uppercase',
              marginTop: 8,
              cursor: 'pointer',
            }}
          >
            REINICIAR MÓDULO (LECCIÓN 1)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Outfit',sans-serif",
        background: C.bg,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'fixed',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle,${C.aG} 0%,transparent 68%)`,
          pointerEvents: 'none',
          animation: 'glow 7s ease-in-out infinite',
          zIndex: 0,
        }}
      />

      {/* Particles — shards de energía, estilo HUD */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={
            {
              position: 'fixed',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: 2.5,
              height: p.len,
              borderRadius: 1,
              background: 'linear-gradient(180deg,#8CF244,#98D96A)',
              transform: `rotate(${p.angle + 90}deg)`,
              transformOrigin: 'center',
              animation: `burst .5s cubic-bezier(.16,1,.3,1) forwards`,
              '--px': `${p.dx}px`,
              '--py': `${p.dy}px`,
              pointerEvents: 'none',
              zIndex: 200,
              boxShadow: '0 0 8px 1px rgba(140,242,68,.7)',
            } as CSSProperties & Record<'--px' | '--py', string>
          }
        />
      ))}

      {/* Level up — overlay motivacional al subir de rango */}
      {showLevelUp && (
        <LevelUpOverlay rank={rank} onDismiss={() => setShowLevelUp(false)} />
      )}

      {/* Scanline — barrido de confirmación al acertar */}
      {scanline && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            top: 0,
            height: 2,
            background:
              'linear-gradient(90deg,transparent,#8CF244 20%,#8CF244 80%,transparent)',
            boxShadow: '0 0 16px 2px rgba(140,242,68,.65)',
            animation: 'scanSweep .45s cubic-bezier(.22,1,.36,1) forwards',
            pointerEvents: 'none',
            zIndex: 199,
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 18,
            left: '50%',
            background: C.s1,
            border: `1px solid ${C.accent}`,
            color: C.accent,
            borderRadius: 10,
            padding: '9px 18px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            animation: 'toast .3s cubic-bezier(.22,1,.36,1)',
            zIndex: 300,
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}

      {/* Syncing indicator */}
      {syncing && (
        <div
          style={{
            position: 'fixed',
            top: 18,
            right: 18,
            fontSize: 9,
            color: C.t2,
            fontFamily: C.mono,
            letterSpacing: 1,
            zIndex: 300,
          }}
        >
          SYNC...
        </div>
      )}

      {/* Offline indicator */}
      {offline && (
        <div
          style={{
            position: 'fixed',
            top: 18,
            left: 18,
            fontSize: 9,
            color: C.err,
            fontFamily: C.mono,
            letterSpacing: 1,
            zIndex: 300,
          }}
        >
          SIN CONEXIÓN — se sincronizará
        </div>
      )}

      <div
        style={{
          width: '100%',
          maxWidth: 430,
          minHeight: '100vh',
          padding: '44px 18px 60px',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* Logout button — siempre visible */}
        {scr === SCR.HOME && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: `1px solid ${C.b2}`,
                color: C.t2,
                borderRadius: 8,
                padding: '5px 10px',
                fontSize: 9,
                letterSpacing: 1,
                textTransform: 'uppercase',
                fontFamily: C.mono,
              }}
            >
              SALIR
            </button>
          </div>
        )}

        {scr === SCR.HOME && (
          <HomeScreen
            xp={xp}
            streak={streak}
            rank={rank}
            doneLs={doneLs}
            passedEx={passedEx}
            totalL={totalLs}
            moduleLives={moduleLives}
            dueCount={dueCount}
            trainedToday={lastTrainedOn === todayKey()}
            onReview={openReview}
            onMap={() => setScr(SCR.MAP)}
            onProfile={() => setScr(SCR.PROFILE)}
            onSpeedReview={openSpeedSelect}
          />
        )}
        {scr === SCR.SPEED_SELECT && (
          <SpeedSelectScreen
            onSelect={selectSpeedSet}
            onViewLeaderboard={() => setScr(SCR.LEADERBOARD)}
            onBack={() => setScr(SCR.HOME)}
          />
        )}
        {scr === SCR.SPEED_REVIEW && (
          <SpeedReviewScreen
            kanaSet={speedKanaSet}
            pool={speedPool}
            displayName={displayName}
            onSetDisplayName={saveDisplayName}
            onFinish={finishSpeedReview}
            onBack={() => setScr(SCR.SPEED_SELECT)}
            onViewLeaderboard={() => setScr(SCR.LEADERBOARD)}
          />
        )}
        {scr === SCR.LEADERBOARD && user && (
          <LeaderboardScreen
            userId={user.id}
            initialSet={speedKanaSet}
            onBack={() => setScr(SCR.HOME)}
          />
        )}
        {scr === SCR.PROFILE && (
          <ProfileScreen
            xp={xp}
            rank={rank}
            streak={streak}
            stats={computeProfileStats(mastery, doneLs, passedEx, MODULES)}
            studySeconds={studySeconds}
            email={user?.email}
            onBack={() => setScr(SCR.HOME)}
            onReview={dueCount > 0 ? openReview : null}
            onSettings={() => setScr(SCR.SETTINGS)}
            onLogout={handleLogout}
          />
        )}
        {scr === SCR.SETTINGS && (
          <SettingsScreen
            email={user?.email}
            syncing={syncing}
            onBack={() => setScr(SCR.PROFILE)}
            onSync={syncNow}
            onExport={exportProgress}
            onReset={resetProgress}
            onLogout={handleLogout}
          />
        )}
        {scr === SCR.MAP && (
          <MapScreen
            modules={MODULES}
            doneLs={doneLs}
            passedEx={passedEx}
            mastery={mastery}
            moduleLives={moduleLives}
            isModUnlocked={isModUnlocked}
            isExamUnlocked={isExamUnlocked}
            isExamPassed={isExamPassed}
            getModLives={getModLives}
            onOpenModule={openModuleView}
            onExam={openExam}
            onBack={() => setScr(SCR.HOME)}
          />
        )}
        {scr === SCR.MODULE_LESSONS && viewingModule && (
          <ModuleLessonsScreen
            mod={viewingModule}
            doneLs={doneLs}
            mastery={mastery}
            isExamUnlocked={isExamUnlocked}
            isExamPassed={isExamPassed}
            onSelect={openLesson}
            onExam={openExam}
            onBack={() => setScr(SCR.MAP)}
          />
        )}
        {scr === SCR.INTRO && lesson && (
          <IntroScreen
            lesson={lesson}
            modLives={getModLives(lesson.modId)}
            onStart={() => {
              setScr(SCR.BATTLE);
              startEx();
            }}
            onBack={backToLessonContext}
          />
        )}
        {scr === SCR.BATTLE && curEx && (
          <BattleScreen
            ex={curEx}
            idx={exIdx}
            total={activeExs.length}
            hp={hp}
            maxHp={5}
            sesXp={sesXp}
            combo={combo}
            correct={correct}
            minPass={dynamicPassThreshold(activeExs.length)}
            isReview={!!lesson?.isReview}
            sel={sel}
            answered={answered}
            timer={timer}
            shake={shaking}
            flash={flash}
            errFlash={errFlash}
            orderSel={orderSel}
            romajiInput={romajiInput}
            setRomaji={setRomaji}
            onAns={doAnswer}
            onTap={tapOrder}
            onNext={nextEx}
            onExit={exitBattle}
            onPairs={recordPairs}
            setSesXp={setSesXp}
            setCorrect={setCorrect}
            setErrs={setErrs}
          />
        )}
        {scr === SCR.SUMMARY && lesson && (
          <SummaryScreen
            lesson={lesson}
            awardedXp={awardedXp}
            errs={errs}
            correct={correct}
            rank={rank}
            streak={streak}
            modules={MODULES}
            onMap={backToLessonContext}
            onRepeat={() => (lesson.isReview ? openReview() : openLesson(lesson))}
          />
        )}
        {scr === SCR.FAIL && lesson && (
          <FailScreen
            lesson={lesson}
            correct={correct}
            minPass={dynamicPassThreshold(lesson.exercises?.length || 0)}
            total={lesson.exercises?.length || 5}
            modLives={getModLives(lesson.modId)}
            onRetry={() => {
              const mod = MODULES.find((m) => m.id === lesson.modId);
              const currentLives = getModLives(lesson.modId);
              if (currentLives <= 0 && mod && mod.lessons.length > 0) {
                openLesson(mod.lessons[0]);
              } else {
                openLesson(lesson);
              }
            }}
            onMap={backToLessonContext}
          />
        )}
        {scr === SCR.EXAM_PHASE && examData && (
          <ExamPhaseScreen
            examData={examData}
            phase={examPhase}
            phaseXp={examPhaseXp}
            xp={xp}
            rank={rank}
            passedEx={passedEx}
            onPhaseComplete={(gainedXp) => {
              if (examPhase < 2) {
                // Solo acumula: la XP real se otorga en finishExam al
                // aprobar el examen completo (sin bancar por fase).
                setExPhXp((p) => p + gainedXp);
                setExamPhase((p) => p + 1);
              } else {
                // Fase final: finishExam suma la XP restante, aplica el
                // bono del módulo y PERSISTE el aprobado (passedEx,
                // vidas restauradas, racha, tiempo) en un solo push.
                finishExam(gainedXp);
              }
            }}
            onFail={failExamRun}
            onRetry={() => openExam(examData.mod)}
          />
        )}
        {scr === SCR.EXAM_RES && examRes && (
          <ExamResScreen
            res={examRes}
            rank={rank}
            onMap={() => {
              setExamRes(null);
              setScr(SCR.MAP);
            }}
          />
        )}
      </div>
    </div>
  );
}

