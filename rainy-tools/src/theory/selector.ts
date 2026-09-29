import {
  CATEGORY_WEIGHTS,
  COOLDOWN_MAX,
  COOLDOWN_MIN,
  HISTORY_CAP,
  type CategoryKey,
} from './constants'

export type QuizResult = 'juist' | 'fout'

export interface HistoryEntry {
  questionId: string
  result: QuizResult
}

/** Injecteerbare RNG zodat de keuze deterministisch getest kan worden. */
export type Rng = () => number

/** Voeg een antwoord toe en behoud enkel de laatste HISTORY_CAP entries. */
export function appendHistory(history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  return [...history, entry].slice(-HISTORY_CAP)
}

/** Het meest recente antwoord per vraag-id. */
export function lastResults(history: HistoryEntry[]): Map<string, QuizResult> {
  const results = new Map<string, QuizResult>()
  for (const entry of history) {
    results.set(entry.questionId, entry.result)
  }
  return results
}

/**
 * Kies de volgende vraag:
 * 1. cooldown: sluit de laatste k (3 of 4) beantwoorde vragen uit; relax tot
 *    er minstens een overblijft;
 * 2. verdeel over FOUT / NIET-IN-HISTORY / JUIST en kies een categorie
 *    gewogen (0.50 / 0.30 / 0.20, lege categorieën vallen af en worden
 *    genormaliseerd);
 * 3. kies uniform binnen de categorie.
 *
 * Geeft null als de pool leeg is.
 */
export function selectQuestion<T>(
  pool: T[],
  idOf: (question: T) => string,
  history: HistoryEntry[],
  rng: Rng = Math.random,
): T | null {
  if (pool.length === 0) return null

  // 1. Cooldown
  const answered = history.map(entry => entry.questionId)
  const cooldown = COOLDOWN_MIN + Math.floor(rng() * (COOLDOWN_MAX - COOLDOWN_MIN + 1))
  let remaining: T[] = []
  for (let size = Math.min(cooldown, answered.length); size > 0; size--) {
    const excluded = new Set(answered.slice(answered.length - size))
    remaining = pool.filter(question => !excluded.has(idOf(question)))
    if (remaining.length > 0) break
  }
  if (remaining.length === 0) remaining = pool

  // 2. Categorieën
  const results = lastResults(history)
  const buckets: Record<CategoryKey, T[]> = { fout: [], nietInHistory: [], juist: [] }
  for (const question of remaining) {
    const result = results.get(idOf(question))
    if (result === 'fout') buckets.fout.push(question)
    else if (result === 'juist') buckets.juist.push(question)
    else buckets.nietInHistory.push(question)
  }

  const order: CategoryKey[] = ['fout', 'nietInHistory', 'juist']
  const nonEmpty = order.filter(category => buckets[category].length > 0)
  const totalWeight = nonEmpty.reduce((sum, category) => sum + CATEGORY_WEIGHTS[category], 0)

  let roll = rng() * totalWeight
  let chosen: CategoryKey = nonEmpty[nonEmpty.length - 1]
  for (const category of nonEmpty) {
    roll -= CATEGORY_WEIGHTS[category]
    if (roll < 0) {
      chosen = category
      break
    }
  }

  // 3. Uniform binnen de categorie
  const bucket = buckets[chosen]
  const index = Math.min(bucket.length - 1, Math.floor(rng() * bucket.length))
  return bucket[index]
}
