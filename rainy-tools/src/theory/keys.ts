import { LETTERS, capitalizeNote, formatNote, mod, type Note } from './notes'

export type KeyMode = 'groot' | 'klein'
export type VoortekenType = 'geen' | 'kruisen' | 'mollen'

export interface Signature {
  count: number
  type: VoortekenType
  groot: Note
  klein: Note
}

export interface Key {
  mode: KeyMode
  tonic: Note
  voortekenCount: number
  voortekenType: VoortekenType
}

const n = (letter: number, accidental = 0): Note => ({ letter, accidental })

/** Volgorde van de voortekens: fa do sol re la mi si / si mi la re sol do fa. */
export const SHARP_ORDER = [3, 0, 4, 1, 5, 2, 6]
export const FLAT_ORDER = [6, 2, 5, 1, 4, 0, 3]

/**
 * De 15 sleuteltekens: 15 grote en 15 kleine sleutels, elk met 0 tot 7
 * voortekens. Do groot/La klein = geen voortekens.
 */
export const SIGNATURES: Signature[] = [
  { count: 0, type: 'geen', groot: n(0), klein: n(5) },
  { count: 1, type: 'kruisen', groot: n(4), klein: n(2) },
  { count: 2, type: 'kruisen', groot: n(1), klein: n(6) },
  { count: 3, type: 'kruisen', groot: n(5), klein: n(3, 1) },
  { count: 4, type: 'kruisen', groot: n(2), klein: n(0, 1) },
  { count: 5, type: 'kruisen', groot: n(6), klein: n(4, 1) },
  { count: 6, type: 'kruisen', groot: n(3, 1), klein: n(1, 1) },
  { count: 7, type: 'kruisen', groot: n(0, 1), klein: n(5, 1) },
  { count: 1, type: 'mollen', groot: n(3), klein: n(1) },
  { count: 2, type: 'mollen', groot: n(6, -1), klein: n(4) },
  { count: 3, type: 'mollen', groot: n(2, -1), klein: n(0) },
  { count: 4, type: 'mollen', groot: n(5, -1), klein: n(3) },
  { count: 5, type: 'mollen', groot: n(1, -1), klein: n(6, -1) },
  { count: 6, type: 'mollen', groot: n(4, -1), klein: n(2, -1) },
  { count: 7, type: 'mollen', groot: n(0, -1), klein: n(5, -1) },
]

function keyFrom(mode: KeyMode, tonic: Note, signature: Signature): Key {
  return {
    mode,
    tonic,
    voortekenCount: signature.count,
    voortekenType: signature.type,
  }
}

/** Alle 30 sleutels (15 grote + 15 kleine), per teken eerst groot dan klein. */
export const KEYS: Key[] = SIGNATURES.flatMap(signature => [
  keyFrom('groot', signature.groot, signature),
  keyFrom('klein', signature.klein, signature),
])

export const GROTE_KEYS: Key[] = KEYS.filter(key => key.mode === 'groot')
export const KLEINE_KEYS: Key[] = KEYS.filter(key => key.mode === 'klein')

export function findSignature(count: number, type: VoortekenType): Signature {
  const found = SIGNATURES.find(sig => sig.count === count && sig.type === type)
  return found ?? SIGNATURES[0]
}

/** De (grote of kleine) sleutel bij een bepaald sleutelteken. */
export function keyForSignature(signature: Signature, mode: KeyMode): Key {
  return keyFrom(mode, mode === 'groot' ? signature.groot : signature.klein, signature)
}

/** "Fa# groot", "Mib groot", "Re# klein" */
export function keyName(key: Key): string {
  return `${capitalizeNote(formatNote(key.tonic))} ${key.mode}`
}

/** De letters die het voortekenteken bepalen, in de juiste volgorde. */
export function voortekensLetters(count: number, type: VoortekenType): string[] {
  if (count <= 0 || type === 'geen') return []
  const order = type === 'kruisen' ? SHARP_ORDER : FLAT_ORDER
  return order.slice(0, count).map(letter => LETTERS[letter])
}

/** "6 kruisen: fa do sol re la mi", "1 mol: si", "0 voortekens" */
export function formatVoortekens(count: number, type: VoortekenType): string {
  if (count <= 0 || type === 'geen') return '0 voortekens'
  const noun =
    count === 1
      ? type === 'kruisen'
        ? 'kruis'
        : 'mol'
      : type === 'kruisen'
        ? 'kruisen'
        : 'mollen'
  return `${count} ${noun}: ${voortekensLetters(count, type).join(' ')}`
}

/** Letter -> voorteken uit het sleutelteken. */
export function voortekensAltering(count: number, type: VoortekenType): Map<number, number> {
  const altering = new Map<number, number>()
  if (count <= 0 || type === 'geen') return altering
  const order = type === 'kruisen' ? SHARP_ORDER : FLAT_ORDER
  const value = type === 'kruisen' ? 1 : -1
  for (let i = 0; i < count && i < order.length; i++) {
    altering.set(order[i], value)
  }
  return altering
}

/**
 * De toonladder van een sleutel, in spelling volgens het sleutelteken.
 * Kleine sleutels gebruiken de harmonische vorm (leidtoon: 7e graad omhoog).
 */
export function keyScale(key: Key): Note[] {
  const altering = voortekensAltering(key.voortekenCount, key.voortekenType)
  const harmonicMinor = key.mode === 'klein'
  const scale: Note[] = []
  for (let i = 0; i < 7; i++) {
    const letter = mod(key.tonic.letter + i, 7)
    let accidental = altering.get(letter) ?? 0
    if (harmonicMinor && i === 6) accidental += 1
    scale.push({ letter, accidental })
  }
  return scale
}

/** De verwante sleutel (groot <-> klein) met hetzelfde sleutelteken. */
export function relativeKey(key: Key): Key {
  const signature = findSignature(key.voortekenCount, key.voortekenType)
  if (key.mode === 'groot') return keyFrom('klein', signature.klein, signature)
  return keyFrom('groot', signature.groot, signature)
}

export interface Triad {
  notes: Note[]
  quality: KeyMode
}

export interface Triads {
  I: Triad
  IV: Triad
  V: Triad
}

/**
 * De hoofddrieklanken I, IV en V.
 * Kleine sleutels: harmonische vorm, dus V is groot met leidtoon.
 */
export function triads(key: Key): Triads {
  const scale = keyScale(key)
  const at = (start: number): Note[] => [
    scale[start],
    scale[(start + 2) % 7],
    scale[(start + 4) % 7],
  ]
  return {
    I: { notes: at(0), quality: key.mode },
    IV: { notes: at(3), quality: key.mode },
    V: { notes: at(4), quality: 'groot' },
  }
}

/** "la-do-mi (klein)" */
export function formatTriad(triad: Triad): string {
  return `${triad.notes.map(note => formatNote(note)).join('-')} (${triad.quality})`
}

/** "I = la-do-mi (klein), IV = re-fa-la (klein), V = mi-sol#-si (groot)" */
export function triadAnswer(key: Key): string {
  const set = triads(key)
  return `I = ${formatTriad(set.I)}, IV = ${formatTriad(set.IV)}, V = ${formatTriad(set.V)}`
}
