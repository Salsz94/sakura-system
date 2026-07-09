import { supabase } from '../supabaseClient';

export type KanaSet = 'hiragana' | 'katakana';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  timeMs: number;
  errors: number;
  isYou?: boolean;
}

/**
 * Guarda el tiempo de una corrida SOLO si mejora el mejor tiempo previo
 * del usuario para ese set de kana (o si es su primera corrida).
 * Nunca lanza — devuelve `true` si se guardó (mejoró o era la primera vez).
 */
export async function submitScore(
  userId: string,
  kanaSet: KanaSet,
  timeMs: number,
  errors: number,
  displayName: string
): Promise<boolean> {
  try {
    const { data: existing, error: readErr } = await supabase
      .from('speed_review_scores')
      .select('time_ms')
      .eq('user_id', userId)
      .eq('kana_set', kanaSet)
      .maybeSingle();
    if (readErr) {
      console.error('[leaderboardRepo] submitScore lectura falló:', readErr.message);
      return false;
    }
    if (existing && existing.time_ms <= timeMs) {
      // El tiempo previo ya era igual o mejor — no se sobrescribe.
      return true;
    }
    const { error } = await supabase.from('speed_review_scores').upsert(
      {
        user_id: userId,
        kana_set: kanaSet,
        time_ms: timeMs,
        errors,
        display_name: displayName || 'Anónimo',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,kana_set' }
    );
    if (error) {
      console.error('[leaderboardRepo] submitScore falló:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[leaderboardRepo] submitScore falló (red):', e);
    return false;
  }
}

/**
 * Top 20 tiempos globales para un set de kana, más la posición del
 * usuario actual si no está entre los primeros 20.
 */
export async function getLeaderboard(
  kanaSet: KanaSet,
  userId?: string | null
): Promise<{ top: LeaderboardEntry[]; you: (LeaderboardEntry & { rank: number }) | null }> {
  const { data, error } = await supabase
    .from('speed_review_scores')
    .select('user_id, display_name, time_ms, errors')
    .eq('kana_set', kanaSet)
    .order('time_ms', { ascending: true })
    .order('errors', { ascending: true })
    .order('updated_at', { ascending: true })
    .limit(200);

  if (error) {
    console.error('[leaderboardRepo] getLeaderboard falló:', error.message);
    return { top: [], you: null };
  }

  const rows = data || [];
  const top = rows.slice(0, 20).map((r) => ({
    userId: r.user_id as string,
    displayName: (r.display_name as string) || 'Anónimo',
    timeMs: r.time_ms as number,
    errors: r.errors as number,
    isYou: userId ? r.user_id === userId : false,
  }));

  if (!userId) return { top, you: null };
  const idx = rows.findIndex((r) => r.user_id === userId);
  if (idx < 0) return { top, you: null };
  if (idx < 20) return { top, you: { ...top[idx], rank: idx + 1 } };
  const r = rows[idx];
  return {
    top,
    you: {
      userId: r.user_id as string,
      displayName: (r.display_name as string) || 'Anónimo',
      timeMs: r.time_ms as number,
      errors: r.errors as number,
      isYou: true,
      rank: idx + 1,
    },
  };
}
