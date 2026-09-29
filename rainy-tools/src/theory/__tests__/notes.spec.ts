import { describe, expect, it } from 'vitest'
import { allNotes, fitsLevel, formatNote, noteSemitone, parseNote } from '../notes'

const note = (text: string) => {
  const parsed = parseNote(text)
  if (!parsed) throw new Error(`ongeldige noot: ${text}`)
  return parsed
}

describe('noten', () => {
  it('parseert fixed-do notatie met voortekens', () => {
    expect(parseNote('do')).toEqual({ letter: 0, accidental: 0 })
    expect(parseNote('Do#')).toEqual({ letter: 0, accidental: 1 })
    expect(parseNote('sib')).toEqual({ letter: 6, accidental: -1 })
    expect(parseNote('do##')).toEqual({ letter: 0, accidental: 2 })
    expect(parseNote('sibb')).toEqual({ letter: 6, accidental: -2 })
    expect(parseNote('solb')).toEqual({ letter: 4, accidental: -1 })
    expect(parseNote('rebb')).toEqual({ letter: 1, accidental: -2 })
    expect(parseNote('re##')).toEqual({ letter: 1, accidental: 2 })
  })

  it('weigert ongeldige namen', () => {
    expect(parseNote('ti')).toBeNull()
    expect(parseNote('do#b')).toBeNull()
    expect(parseNote('dox')).toBeNull()
    expect(parseNote('c')).toBeNull()
    expect(parseNote('')).toBeNull()
  })

  it('formatteert naar notatie met dubbele voortekens', () => {
    expect(formatNote({ letter: 0, accidental: 0 })).toBe('do')
    expect(formatNote({ letter: 0, accidental: 1 })).toBe('do#')
    expect(formatNote({ letter: 6, accidental: -1 })).toBe('sib')
    expect(formatNote({ letter: 0, accidental: 2 })).toBe('do##')
    expect(formatNote({ letter: 6, accidental: -2 })).toBe('sibb')
    expect(formatNote({ letter: 4, accidental: -2 })).toBe('solbb')
  })

  it('rondt parse -> format af', () => {
    for (const text of ['do', 're#', 'mib', 'fa##', 'solbb', 'la', 'sibb']) {
      expect(formatNote(note(text))).toBe(text)
    }
  })

  it('berekent de halve tonen van elke noot', () => {
    expect(noteSemitone(note('do'))).toBe(0)
    expect(noteSemitone(note('re'))).toBe(2)
    expect(noteSemitone(note('mi'))).toBe(4)
    expect(noteSemitone(note('fa'))).toBe(5)
    expect(noteSemitone(note('sol'))).toBe(7)
    expect(noteSemitone(note('la'))).toBe(9)
    expect(noteSemitone(note('si'))).toBe(11)
    expect(noteSemitone(note('do#'))).toBe(1)
    expect(noteSemitone(note('sib'))).toBe(10)
    expect(noteSemitone(note('do##'))).toBe(2)
    expect(noteSemitone(note('sibb'))).toBe(9)
    expect(noteSemitone(note('solbb'))).toBe(5)
  })

  it('controleert de notenniveaus', () => {
    expect(fitsLevel(note('do'), 0)).toBe(true)
    expect(fitsLevel(note('do#'), 0)).toBe(false)
    expect(fitsLevel(note('do#'), 1)).toBe(true)
    expect(fitsLevel(note('do##'), 1)).toBe(false)
    expect(fitsLevel(note('rebb'), 2)).toBe(true)
    expect(fitsLevel({ letter: 0, accidental: 3 }, 2)).toBe(false)
  })

  it('levert 35 voorstelbare noten', () => {
    expect(allNotes()).toHaveLength(35)
  })
})
