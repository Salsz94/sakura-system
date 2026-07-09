import { supabase } from '../supabaseClient';
import type { Progress } from '../../core/types';

/** Fila cruda de la tabla user_progress. */
export interface ProgressRow {
  xp: number;
  streak: number;
  done_lessons: string[];
  passed_exams: string[];
  module_lives: Record<string, number>;
  last_trained_on: string | null;
  study_seconds: number;
  display_name: string | null;
  updated_at?: string;
}

/** Resultado de carga que distingue "no hay fila" (usuario nuevo) de
 * "error real" (red, RLS, migración faltante). CRÍTICO: confundirlos
 * hacía que tras una carga fallida el estado quedara en ceros y el
 * siguiente guardado pisara el progreso real con un upsert vacío. */
export interface LoadProgressResult {
  row: ProgressRow | null;
  /** true = fallo real de lectura; NO escribir hasta lograr una carga válida. */
  failed: boolean;
}

/** Carga el progreso del usuario. */
export async function loadProgress(userId: string): Promise<LoadProgressResult> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    // PGRST116 = "no rows" (usuario nuevo, esperado — no es un fallo).
    if (error && error.code === 'PGRST116') return { row: null, failed: false };
    if (error) {
      console.error('[progressRepo] loadProgress falló:', error.message);
      return { row: null, failed: true };
    }
    return { row: (data as ProgressRow) ?? null, failed: !data };
  } catch (e) {
    // Red caída — supabase-js lanza en vez de devolver { error }.
    console.error('[progressRepo] loadProgress falló (red):', e);
    return { row: null, failed: true };
  }
}

/**
 * Guarda (upsert) el progreso del usuario.
 * Devuelve `true` si se guardó, `false` si falló (red caída, RLS, etc.)
 * — nunca lanza, para que el caller pueda decidir encolar sin try/catch.
 */
export async function saveProgress(userId: string, state: Progress): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_progress').upsert({
      user_id: userId,
      xp: state.xp,
      streak: state.streak,
      done_lessons: state.doneLs,
      passed_exams: state.passedEx,
      module_lives: state.moduleLives,
      last_trained_on: state.lastTrainedOn ?? null,
      study_seconds: state.studySeconds ?? 0,
      display_name: state.displayName ?? null,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error('[progressRepo] saveProgress falló:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    // Fetch/red caída — Supabase lanza en vez de devolver { error }.
    console.error('[progressRepo] saveProgress falló (red):', e);
    return false;
  }
}
