import { supabase } from '../supabaseClient';
import type { MasteryMap } from '../../core/types';

/** Carga el mapa de maestría/SRS del usuario (incluye caja y próximo repaso). */
export async function loadMastery(userId: string): Promise<MasteryMap> {
  const { data, error } = await supabase
    .from('mastery')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.error('[masteryRepo] loadMastery falló:', error.message);
  }
  if (!data) return {};
  return data.reduce((acc: MasteryMap, row: Record<string, unknown>) => {
    acc[row.kana as string] = {
      score: (row.score as number) ?? 0,
      attempts: (row.attempts as number) ?? 0,
      lastResult: (row.last_result as MasteryMap[string]['lastResult']) ?? '',
      box: (row.box as number) ?? 0,
      nextReview: (row.next_review as string | null) ?? null,
    };
    return acc;
  }, {});
}

/**
 * Guarda (upsert) el mapa de maestría. Persiste box y next_review (SRS).
 * Devuelve `true` si se guardó, `false` si falló — nunca lanza.
 */
export async function saveMastery(userId: string, mastery: MasteryMap): Promise<boolean> {
  const rows = Object.entries(mastery).map(([kana, card]) => ({
    user_id: userId,
    kana,
    score: card.score || 0,
    attempts: card.attempts || 0,
    last_result: card.lastResult || '',
    box: card.box ?? 0,
    next_review: card.nextReview ?? null,
  }));
  if (rows.length === 0) return true;
  try {
    const { error } = await supabase
      .from('mastery')
      .upsert(rows, { onConflict: 'user_id,kana' });
    if (error) {
      console.error('[masteryRepo] saveMastery falló:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[masteryRepo] saveMastery falló (red):', e);
    return false;
  }
}
