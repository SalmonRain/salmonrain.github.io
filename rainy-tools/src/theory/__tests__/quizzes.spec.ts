import { describe, expect, it } from 'vitest'
import { parseNote } from '../notes'
import {
  QUIZZES,
  buildHoofddrieklanken,
  buildIntervalstappen,
  buildNotenstappen,
  buildSprongen,
  buildSleutelverwantschap,
  buildVoortekens,
  type IntervalstappenSettings,
  type NotenstappenSettings,
  type SprongenSettings,
  type VoortekensSettings,
} from '../quizzes'

const ALL_INTERVALS = [
  'reine-prime',
  'kleine-secunde',
  'grote-secunde',
  'kleine-terts',
  'grote-terts',
  'reine-kwart',
  'reine-kwint',
  'kleine-sext',
  'grote-sext',
  'kleine-septiem',
  'grote-septiem',
  'reine-octaaf',
]

function sprongenSettings(overrides: Partial<SprongenSettings> = {}): SprongenSettings {
  return {
    questionNoteLevel: 1,
    answerNoteLevel: 1,
    intervalIds: [...ALL_INTERVALS],
    includeAugmented: false,
    includeDiminished: false,
    direction: 'beide',
    ...overrides,
  }
}

describe('quizregister', () => {
  it('heeft zes quizzen in twee groepen', () => {
    const all = Object.values(QUIZZES)
    expect(all).toHaveLength(6)
    expect(all.filter(quiz => quiz.group === 'intervallen')).toHaveLength(3)
    expect(all.filter(quiz => quiz.group === 'sleutels')).toHaveLength(3)
  })

  it('levert een niet-lege pool met unieke id\'s voor de standaardinstellingen', () => {
    for (const quiz of Object.values(QUIZZES)) {
      const pool = quiz.buildPool(quiz.defaultSettings())
      expect(pool.length, quiz.id).toBeGreaterThan(0)
      const ids = pool.map(question => question.id)
      expect(new Set(ids).size, quiz.id).toBe(ids.length)
      for (const question of pool) {
        expect(question.id.startsWith(`q`), question.id).toBe(true)
        expect(question.text.length, question.id).toBeGreaterThan(0)
        expect(question.answer.length, question.id).toBeGreaterThan(0)
      }
    }
  })

  it('geeft telkens een verse settings-object', () => {
    for (const quiz of Object.values(QUIZZES)) {
      expect(quiz.defaultSettings()).not.toBe(quiz.defaultSettings())
    }
  })
})

describe('intervalsprongen', () => {
  it('bouwt de pool volgens niveau, interval en richting', () => {
    const settings = sprongenSettings({
      questionNoteLevel: 0,
      answerNoteLevel: 0,
      intervalIds: ['reine-prime'],
      direction: 'omhoog',
    })
    const pool = buildSprongen(settings)
    expect(pool).toHaveLength(7)
    expect(pool.map(question => question.id)).toEqual([
      'q1:do|reine-prime|omhoog',
      'q1:re|reine-prime|omhoog',
      'q1:mi|reine-prime|omhoog',
      'q1:fa|reine-prime|omhoog',
      'q1:sol|reine-prime|omhoog',
      'q1:la|reine-prime|omhoog',
      'q1:si|reine-prime|omhoog',
    ])
    expect(pool[0].text).toBe('do + reine prime omhoog')
    expect(pool[0].answer).toBe('do')
  })

  it('gebruikt een minteken voor omlaag', () => {
    const pool = buildSprongen(
      sprongenSettings({ intervalIds: ['grote-sext'], direction: 'omlaag' }),
    )
    expect(pool.length).toBeGreaterThan(0)
    for (const question of pool) {
      expect(question.text).toMatch(/ - grote sext omlaag$/)
      expect(question.id.endsWith('|omlaag')).toBe(true)
    }
    const mi = pool.find(question => question.id === 'q1:mi|grote-sext|omlaag')
    expect(mi?.text).toBe('mi - grote sext omlaag')
    expect(mi?.answer).toBe('sol')
  })

  it('sluit vragen uit die het notenniveau overschrijden', () => {
    const naturel = buildSprongen(
      sprongenSettings({ questionNoteLevel: 0, answerNoteLevel: 0, direction: 'omhoog' }),
    )
    for (const question of naturel) {
      const [noteText, , direction] = question.id.slice(3).split('|')
      expect(direction).toBe('omhoog')
      const note = parseNote(noteText ?? '')
      expect(note).not.toBeNull()
      if (note) expect(note.accidental).toBe(0)
      const answer = parseNote(question.answer)
      expect(answer).not.toBeNull()
      if (answer) expect(answer.accidental).toBe(0)
    }

    const doubles = buildSprongen(
      sprongenSettings({ questionNoteLevel: 2, answerNoteLevel: 2, direction: 'omhoog' }),
    )
    expect(doubles.length).toBeGreaterThan(naturel.length)
    for (const question of doubles) {
      const answer = parseNote(question.answer)
      if (answer) expect(Math.abs(answer.accidental)).toBeLessThanOrEqual(2)
    }
  })

  it('heeft een lege pool als geen enkel interval gekozen is', () => {
    expect(
      buildSprongen(sprongenSettings({ intervalIds: [], includeAugmented: false })),
    ).toEqual([])
  })
})

describe('intervalstappen', () => {
  const base: IntervalstappenSettings = {
    intervalIds: [...ALL_INTERVALS],
    includeAugmented: false,
    includeDiminished: false,
  }

  it('toont elk gekozen interval met het juiste aantal halve tonen', () => {
    const pool = buildIntervalstappen(base)
    expect(pool).toHaveLength(12)
    expect(pool[0]?.text).toBe('Hoeveel halve tonen zit er in een reine prime?')
    expect(pool[0]?.answer).toBe('0 halve tonen')
    for (const question of pool) {
      expect(question.id.startsWith('q2:')).toBe(true)
      expect(question.answer).toMatch(/^\d+ halve tonen$/)
    }
  })

  it('voegt overmatig en verminderd toe aan de pool', () => {
    const pool = buildIntervalstappen({
      intervalIds: [...ALL_INTERVALS],
      includeAugmented: true,
      includeDiminished: true,
    })
    expect(pool).toHaveLength(12 + 8 + 7)
  })
})

describe('notenstappen', () => {
  const base: NotenstappenSettings = {
    questionNoteLevel: 1,
    intervalIds: [...ALL_INTERVALS],
    includeAugmented: false,
    includeDiminished: false,
    direction: 'beide',
  }

  it('toont twee noten en bevat de richting in id en tekst', () => {
    const pool = buildNotenstappen(base)
    expect(pool.length).toBeGreaterThan(0)
    for (const question of pool) {
      expect(question.id.startsWith('q3:')).toBe(true)
      expect(question.id).toMatch(/\|(omhoog|omlaag)$/)
      expect(question.text).toMatch(/^Hoeveel halve tonen van \S+ naar \S+ (omhoog|omlaag)\?$/)
      expect(question.answer).toMatch(/^\d+ halve tonen$/)
    }
    expect(pool.some(question => question.id === 'q3:do|re|omhoog')).toBe(true)
    expect(pool.some(question => question.id === 'q3:do|re|omlaag')).toBe(true)
  })

  it('houdt rekening met het notenniveau van de vraagnoten', () => {
    const pool = buildNotenstappen({ ...base, questionNoteLevel: 0, direction: 'omhoog' })
    expect(pool.length).toBeGreaterThan(0)
    for (const question of pool) {
      const [fromText, toText] = question.id.slice(3).split('|')
      const from = parseNote(fromText ?? '')
      const to = parseNote(toText ?? '')
      expect(from).not.toBeNull()
      expect(to).not.toBeNull()
      if (from) expect(from.accidental).toBe(0)
      if (to) expect(to.accidental).toBe(0)
    }
  })

  it('respecteert de gekozen intervalset', () => {
    const pool = buildNotenstappen({
      ...base,
      intervalIds: ['grote-secunde'],
      direction: 'omhoog',
    })
    expect(pool.length).toBeGreaterThan(0)
    for (const question of pool) {
      expect(question.answer).toBe('2 halve tonen')
    }
    expect(buildNotenstappen({ ...base, intervalIds: [] })).toEqual([])
  })
})

describe('voortekens', () => {
  const settings = (overrides: Partial<VoortekensSettings> = {}): VoortekensSettings => ({
    maxVoortekens: 7,
    direction: 'beide',
    ...overrides,
  })

  it('bouwt beide richtingen op met de richting in het id', () => {
    const pool = buildVoortekens(settings())
    expect(pool).toHaveLength(30 + 15)
    expect(pool.filter(question => question.id.includes('sleutel-naar-voortekens'))).toHaveLength(30)
    expect(pool.filter(question => question.id.includes('voortekens-naar-sleutel'))).toHaveLength(15)
  })

  it('respecteert de richtingsinstelling', () => {
    expect(buildVoortekens(settings({ direction: 'sleutel-naar-voortekens' }))).toHaveLength(30)
    expect(buildVoortekens(settings({ direction: 'voortekens-naar-sleutel' }))).toHaveLength(15)
  })

  it('respecteert het maximum aantal voortekens', () => {
    expect(
      buildVoortekens(settings({ maxVoortekens: 0, direction: 'sleutel-naar-voortekens' })),
    ).toHaveLength(2)
    expect(
      buildVoortekens(settings({ maxVoortekens: 1, direction: 'sleutel-naar-voortekens' })),
    ).toHaveLength(6)
    expect(buildVoortekens(settings({ maxVoortekens: 0, direction: 'beide' }))).toHaveLength(3)
    expect(buildVoortekens(settings({ maxVoortekens: 2, direction: 'beide' }))).toHaveLength(15)
  })

  it('toont de juiste vragen en antwoorden', () => {
    const pool = buildVoortekens(settings({ direction: 'sleutel-naar-voortekens' }))
    const faSharp = pool.find(question => question.id === 'q4:sleutel-naar-voortekens:Fa# groot')
    expect(faSharp?.answer).toBe('6 kruisen: fa do sol re la mi')
    const doGroot = pool.find(question => question.id === 'q4:sleutel-naar-voortekens:Do groot')
    expect(doGroot?.answer).toBe('0 voortekens')

    const reversed = buildVoortekens(settings({ direction: 'voortekens-naar-sleutel' }))
    const twoSharps = reversed.find(
      question => question.id === 'q4:voortekens-naar-sleutel:kruisen:2',
    )
    expect(twoSharps?.text).toBe('2 kruisen: fa do')
    expect(twoSharps?.answer).toBe('Re groot, Si klein')
    const none = reversed.find(question => question.id === 'q4:voortekens-naar-sleutel:geen:0')
    expect(none?.text).toBe('0 voortekens')
    expect(none?.answer).toBe('Do groot, La klein')
  })
})

describe('grote/kleine sleutel', () => {
  const settings = (
    overrides: Partial<{ maxVoortekens: number; direction: 'grote-naar-kleine' | 'kleine-naar-grote' | 'beide' }> = {},
  ) => ({
    maxVoortekens: 7,
    direction: 'beide' as const,
    ...overrides,
  })

  it('kent alle verwantschappen in beide richtingen', () => {
    expect(buildSleutelverwantschap(settings())).toHaveLength(30)
    expect(buildSleutelverwantschap(settings({ direction: 'grote-naar-kleine' }))).toHaveLength(15)
    expect(buildSleutelverwantschap(settings({ direction: 'kleine-naar-grote' }))).toHaveLength(15)
  })

  it('vindt de verwante sleutel en respecteert het maximum', () => {
    const pool = buildSleutelverwantschap(settings({ direction: 'grote-naar-kleine' }))
    const faSharp = pool.find(question => question.id === 'q5:grote-naar-kleine:Fa# groot')
    expect(faSharp?.answer).toBe('Re# klein')

    const none = buildSleutelverwantschap(settings({ maxVoortekens: 0 }))
    expect(none).toHaveLength(2)
    expect(none.find(question => question.id === 'q5:grote-naar-kleine:Do groot')?.answer).toBe(
      'La klein',
    )
    expect(none.find(question => question.id === 'q5:kleine-naar-grote:La klein')?.answer).toBe(
      'Do groot',
    )
  })
})

describe('hoofddrieklanken', () => {
  it('toont alle sleutels met I, IV en V', () => {
    const pool = buildHoofddrieklanken({ maxVoortekens: 7 })
    expect(pool).toHaveLength(30)
    const laKlein = pool.find(question => question.id === 'q6:La klein')
    expect(laKlein?.answer).toBe(
      'I = la-do-mi (klein), IV = re-fa-la (klein), V = mi-sol#-si (groot)',
    )
  })

  it('respecteert het maximum aantal voortekens', () => {
    const pool = buildHoofddrieklanken({ maxVoortekens: 0 })
    expect(pool).toHaveLength(2)
    expect(pool.map(question => question.text).sort()).toEqual(['Do groot', 'La klein'])
  })
})
