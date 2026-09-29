import { describe, expect, it } from 'vitest'
import { INTERVALS, applyInterval, intervalBetween, intervalById, intervalByShape } from '../intervals'
import { parseNote, type Note } from '../notes'

const note = (text: string) => {
  const parsed = parseNote(text)
  if (!parsed) throw new Error(`ongeldige noot: ${text}`)
  return parsed
}

const interval = (id: string) => {
  const found = intervalById(id)
  if (!found) throw new Error(`ongeldig interval: ${id}`)
  return found
}

// Verwachte spelling als tekst, zodat dubbelkruisen/dubbelmollen zichtbaar zijn.
function spelledText(from: string, intervalId: string, direction: 'omhoog' | 'omlaag'): string | null {
  const result: Note | null = applyInterval(note(from), interval(intervalId), direction)
  if (!result) return null
  const base = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'][result.letter]
  const acc = result.accidental > 0 ? '#'.repeat(result.accidental) : 'b'.repeat(-result.accidental)
  return base + acc
}

describe('halve tonen per interval', () => {
  const expected: Record<string, number> = {
    'reine-prime': 0,
    'kleine-secunde': 1,
    'grote-secunde': 2,
    'kleine-terts': 3,
    'grote-terts': 4,
    'reine-kwart': 5,
    'reine-kwint': 7,
    'kleine-sext': 8,
    'grote-sext': 9,
    'kleine-septiem': 10,
    'grote-septiem': 11,
    'reine-octaaf': 12,
    'overmatige-prime': 1,
    'overmatige-secunde': 3,
    'overmatige-terts': 5,
    'overmatige-kwart': 6,
    'overmatige-kwint': 8,
    'overmatige-sext': 10,
    'overmatige-septiem': 12,
    'overmatige-octaaf': 13,
    'verminderde-secunde': 0,
    'verminderde-terts': 2,
    'verminderde-kwart': 4,
    'verminderde-kwint': 6,
    'verminderde-sext': 7,
    'verminderde-septiem': 9,
    'verminderde-octaaf': 11,
  }

  it('kent het juiste aantal halve tonen voor elk interval', () => {
    expect(Object.keys(expected).sort()).toEqual(INTERVALS.map(item => item.id).sort())
    for (const item of INTERVALS) {
      expect(item.semitones, item.name).toBe(expected[item.id])
    }
  })
})

describe('spelling van intervalsprongen omhoog', () => {
  const cases: [string, string, string][] = [
    ['do', 'reine-prime', 'do'],
    ['do', 'kleine-secunde', 'reb'],
    ['do', 'grote-secunde', 're'],
    ['do', 'kleine-terts', 'mib'],
    ['do', 'grote-terts', 'mi'],
    ['do', 'reine-kwart', 'fa'],
    ['do', 'reine-kwint', 'sol'],
    ['do', 'kleine-sext', 'lab'],
    ['do', 'grote-sext', 'la'],
    ['do', 'kleine-septiem', 'sib'],
    ['do', 'grote-septiem', 'si'],
    ['do', 'reine-octaaf', 'do'],
    ['do', 'overmatige-prime', 'do#'],
    ['do', 'overmatige-kwart', 'fa#'],
    ['do', 'overmatige-sext', 'la#'],
    ['do', 'verminderde-secunde', 'rebb'],
    ['do', 'verminderde-kwart', 'fab'],
    ['do', 'verminderde-kwint', 'solb'],
    ['do', 'verminderde-octaaf', 'dob'],
    ['re#', 'grote-sext', 'si#'],
    ['re#', 'grote-terts', 'fa##'],
    ['la#', 'overmatige-kwart', 're##'],
    ['sib', 'verminderde-terts', 'rebb'],
    ['do##', 'reine-prime', 'do##'],
    ['do', 'verminderde-sext', 'labb'],
  ]

  it('levert de juiste spelling, ook met dubbelkruis en dubbelmol', () => {
    for (const [from, intervalId, expectedAnswer] of cases) {
      expect(spelledText(from, intervalId, 'omhoog'), `${from} + ${intervalId}`).toBe(expectedAnswer)
    }
  })

  it('weigert een triple voorteken', () => {
    expect(spelledText('fa##', 'overmatige-septiem', 'omhoog')).toBeNull()
    expect(spelledText('sol##', 'overmatige-secunde', 'omhoog')).toBeNull()
  })
})

describe('spelling van intervalsprongen omlaag', () => {
  const cases: [string, string, string][] = [
    ['do', 'reine-prime', 'do'],
    ['do', 'kleine-secunde', 'si'],
    ['do', 'grote-secunde', 'sib'],
    ['do', 'reine-kwart', 'sol'],
    ['do', 'reine-kwint', 'fa'],
    ['do', 'reine-octaaf', 'do'],
    ['do', 'grote-sext', 'mib'],
    ['mi', 'grote-sext', 'sol'],
    ['do', 'overmatige-kwart', 'solb'],
    ['do', 'verminderde-kwint', 'fa#'],
    ['do', 'kleine-terts', 'la'],
  ]

  it('levert de juiste spelling benedenwaarts', () => {
    for (const [from, intervalId, expectedAnswer] of cases) {
      expect(spelledText(from, intervalId, 'omlaag'), `${from} - ${intervalId}`).toBe(expectedAnswer)
    }
  })
})

describe('intervalBetween', () => {
  it('herkent het interval tussen twee noten', () => {
    expect(intervalBetween(note('do'), note('si'), 'omhoog')).toEqual({ degree: 7, semitones: 11 })
    expect(intervalBetween(note('do'), note('si'), 'omlaag')).toEqual({ degree: 2, semitones: 1 })
    expect(intervalBetween(note('re#'), note('fa##'), 'omhoog')).toEqual({ degree: 3, semitones: 4 })
    const shape = intervalBetween(note('re#'), note('fa##'), 'omhoog')
    expect(shape).not.toBeNull()
    if (shape) expect(intervalByShape(shape.degree, shape.semitones)?.id).toBe('grote-terts')
  })
})

describe('onmogelijke spelling', () => {
  it('geeft null als er een triple voorteken nodig zou zijn', () => {
    expect(
      applyInterval({ letter: 6, accidental: 2 }, interval('overmatige-octaaf'), 'omhoog'),
    ).toBeNull()
  })
})
