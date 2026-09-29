/** Toonmodel met letter + voorteken (geen enkele pitch-class 0-11). */

export const LETTERS = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'] as const

export const NATURAL_SEMITONES = [0, 2, 4, 5, 7, 9, 11]

export interface Note {
  /** Index in LETTERS: do=0, re=1, mi=2, fa=3, sol=4, la=5, si=6 */
  letter: number
  /** -2..2 = dubbelmol .. dubbelkruis; buiten dit bereik niet voorstelbaar */
  accidental: number
}

/** Voortekenniveau's voor de instellingen. */
export type NoteLevel = 0 | 1 | 2

export const NOTE_LEVEL_LABELS: Record<NoteLevel, string> = {
  0: 'naturel',
  1: 'met kruisen en mollen',
  2: 'met dubbelkruisen en dubbelmollen',
}

export function mod(value: number, base: number): number {
  return ((value % base) + base) % base
}

export function naturalSemitone(letter: number): number {
  return NATURAL_SEMITONES[mod(letter, 7)]
}

export function noteSemitone(note: Note): number {
  return mod(naturalSemitone(note.letter) + note.accidental, 12)
}

function accidentalText(accidental: number): string {
  if (accidental > 0) return '#'.repeat(accidental)
  if (accidental < 0) return 'b'.repeat(-accidental)
  return ''
}

/** "do##", "sib", "sol" */
export function formatNote(note: Note): string {
  return LETTERS[mod(note.letter, 7)] + accidentalText(note.accidental)
}

/** "Do##", "Sib", "Sol" — voor sleutelnamen. */
export function capitalizeNote(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** "do##" -> { letter: 0, accidental: 2 }; ongeldig -> null */
export function parseNote(text: string): Note | null {
  const match = /^(do|re|mi|fa|sol|la|si)(#+|b+)?$/.exec(text.trim().toLowerCase())
  if (!match) return null
  const letter = LETTERS.indexOf(match[1] as (typeof LETTERS)[number])
  const symbols = match[2] ?? ''
  const accidental = symbols === '' ? 0 : symbols[0] === '#' ? symbols.length : -symbols.length
  return { letter, accidental }
}

/** Past de toon in het gekozen niveau (en is ze voorstelbaar)? */
export function fitsLevel(note: Note, level: NoteLevel): boolean {
  return Math.abs(note.accidental) <= level
}

/** Alle 35 voorstelbare noten (7 letters x dubbelmol..dubbelkruis). */
export function allNotes(): Note[] {
  const notes: Note[] = []
  for (let letter = 0; letter < 7; letter++) {
    for (let accidental = -2; accidental <= 2; accidental++) {
      notes.push({ letter, accidental })
    }
  }
  return notes
}

/** Alle noten die in het niveau passen. */
export function notesForLevel(level: NoteLevel): Note[] {
  return allNotes().filter(note => fitsLevel(note, level))
}
