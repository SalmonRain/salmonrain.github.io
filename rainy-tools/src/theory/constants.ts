/** Tunable parameters voor de vragenkeuze — op één plek. */

/** Aantal laatst beantwoorde vragen dat in de historiek bewaard wordt. */
export const HISTORY_CAP = 10

/** Cooldown: het aantal laatste vragen dat uit de pool wordt gesloten (3 of 4). */
export const COOLDOWN_MIN = 3
export const COOLDOWN_MAX = 4

/** Gewichten per CATEGORIE (niet per vraag). */
export const CATEGORY_WEIGHTS = {
  fout: 0.5,
  nietInHistory: 0.3,
  juist: 0.2,
} as const

export type CategoryKey = keyof typeof CATEGORY_WEIGHTS

export const EMPTY_POOL_MESSAGE =
  'Geen vragen beschikbaar met deze instellingen. Pas de instellingen aan.'
