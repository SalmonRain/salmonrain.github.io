import { mod, naturalSemitone, noteSemitone, type Note } from './notes'

export type IntervalFamily = 'basis' | 'overmatig' | 'verminderd'

export interface Interval {
  id: string
  /** Flemish Dutch naam, bv. "grote sext". */
  name: string
  /** Aantal letterstappen + 1 (do=1 t/m octaaf=8). */
  degree: number
  semitones: number
  family: IntervalFamily
}

export type Direction = 'omhoog' | 'omlaag'

function interval(
  id: string,
  name: string,
  degree: number,
  semitones: number,
  family: IntervalFamily,
): Interval {
  return { id, name, degree, semitones, family }
}

/**
 * Volledige catalogus: reine prime t/m reine octaaf, aangevuld met de
 * overmatige en verminderde varianten. Er is geen verminderde prime
 * (kan niet stijgend voorgesteld worden).
 */
export const INTERVALS: Interval[] = [
  interval('reine-prime', 'reine prime', 1, 0, 'basis'),
  interval('kleine-secunde', 'kleine secunde', 2, 1, 'basis'),
  interval('grote-secunde', 'grote secunde', 2, 2, 'basis'),
  interval('kleine-terts', 'kleine terts', 3, 3, 'basis'),
  interval('grote-terts', 'grote terts', 3, 4, 'basis'),
  interval('reine-kwart', 'reine kwart', 4, 5, 'basis'),
  interval('reine-kwint', 'reine kwint', 5, 7, 'basis'),
  interval('kleine-sext', 'kleine sext', 6, 8, 'basis'),
  interval('grote-sext', 'grote sext', 6, 9, 'basis'),
  interval('kleine-septiem', 'kleine septiem', 7, 10, 'basis'),
  interval('grote-septiem', 'grote septiem', 7, 11, 'basis'),
  interval('reine-octaaf', 'reine octaaf', 8, 12, 'basis'),

  interval('overmatige-prime', 'overmatige prime', 1, 1, 'overmatig'),
  interval('overmatige-secunde', 'overmatige secunde', 2, 3, 'overmatig'),
  interval('overmatige-terts', 'overmatige terts', 3, 5, 'overmatig'),
  interval('overmatige-kwart', 'overmatige kwart', 4, 6, 'overmatig'),
  interval('overmatige-kwint', 'overmatige kwint', 5, 8, 'overmatig'),
  interval('overmatige-sext', 'overmatige sext', 6, 10, 'overmatig'),
  interval('overmatige-septiem', 'overmatige septiem', 7, 12, 'overmatig'),
  interval('overmatige-octaaf', 'overmatige octaaf', 8, 13, 'overmatig'),

  interval('verminderde-secunde', 'verminderde secunde', 2, 0, 'verminderd'),
  interval('verminderde-terts', 'verminderde terts', 3, 2, 'verminderd'),
  interval('verminderde-kwart', 'verminderde kwart', 4, 4, 'verminderd'),
  interval('verminderde-kwint', 'verminderde kwint', 5, 6, 'verminderd'),
  interval('verminderde-sext', 'verminderde sext', 6, 7, 'verminderd'),
  interval('verminderde-septiem', 'verminderde septiem', 7, 9, 'verminderd'),
  interval('verminderde-octaaf', 'verminderde octaaf', 8, 11, 'verminderd'),
]

const INTERVAL_BY_ID = new Map(INTERVALS.map(item => [item.id, item]))
const INTERVAL_BY_SHAPE = new Map(
  INTERVALS.map(item => [`${item.degree}:${item.semitones}`, item]),
)

export function intervalById(id: string): Interval | undefined {
  return INTERVAL_BY_ID.get(id)
}

/** Zoek het interval dat hoort bij een letterafstand en een aantal halve tonen. */
export function intervalByShape(degree: number, semitones: number): Interval | undefined {
  return INTERVAL_BY_SHAPE.get(`${degree}:${semitones}`)
}

export function activeIntervals(settings: {
  intervalIds: string[]
  includeAugmented: boolean
  includeDiminished: boolean
}): Interval[] {
  return INTERVALS.filter(item => {
    if (item.family === 'basis') return settings.intervalIds.includes(item.id)
    if (item.family === 'overmatig') return settings.includeAugmented
    return settings.includeDiminished
  })
}

/**
 * Pas een interval toe op een noot en lever de juiste spelling.
 * Letter en voorteken worden afgeleid, dus fa## boven re# wordt geen sol.
 * Geeft null als de uitkomst niet binnen dubbelkruis/dubbelmol past.
 */
export function applyInterval(note: Note, item: Interval, direction: Direction): Note | null {
  const letterDelta = direction === 'omhoog' ? item.degree - 1 : -(item.degree - 1)
  const targetLetter = mod(note.letter + letterDelta, 7)
  const semitones = direction === 'omhoog' ? item.semitones : -item.semitones
  const targetSemitone = mod(noteSemitone(note) + semitones, 12)
  // Kleinste voorteken dat de juiste klank geeft, in het bereik -6..5.
  const accidental = mod(targetSemitone - naturalSemitone(targetLetter) + 6, 12) - 6
  if (Math.abs(accidental) > 2) return null
  return { letter: targetLetter, accidental }
}

/**
 * Het interval tussen twee noten in een bepaalde richting.
 * Voor omlaag wordt de afstand benedenwaarts gemeten.
 */
export function intervalBetween(
  from: Note,
  to: Note,
  direction: Direction,
): { degree: number; semitones: number } | null {
  const degree =
    direction === 'omhoog'
      ? mod(to.letter - from.letter, 7) + 1
      : mod(from.letter - to.letter, 7) + 1
  const semitones =
    direction === 'omhoog'
      ? mod(noteSemitone(to) - noteSemitone(from), 12)
      : mod(noteSemitone(from) - noteSemitone(to), 12)
  return { degree, semitones }
}

/** "Hoeveel halve tonen zit er in een grote sext?" */
export function intervalQuestionText(item: Interval): string {
  return `Hoeveel halve tonen zit er in een ${item.name}?`
}
