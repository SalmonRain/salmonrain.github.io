import { describe, expect, it } from 'vitest'
import { CATEGORY_WEIGHTS, COOLDOWN_MAX, COOLDOWN_MIN, HISTORY_CAP } from '../constants'
import {
  appendHistory,
  selectQuestion,
  type HistoryEntry,
  type QuizResult,
} from '../selector'

/** Deterministische RNG voor herhaalbare tests. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const id = (question: string) => question

function poolOf(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `v${index}`)
}

function historyOf(entries: [string, QuizResult][]): HistoryEntry[] {
  return entries.map(([questionId, result]) => ({ questionId, result }))
}

describe('historiek', () => {
  it('bewaart maximum 10 antwoorden', () => {
    let history: HistoryEntry[] = []
    for (let i = 0; i < 25; i++) {
      history = appendHistory(history, { questionId: `v${i}`, result: i % 2 ? 'juist' : 'fout' })
      expect(history.length).toBeLessThanOrEqual(HISTORY_CAP)
    }
    expect(history).toHaveLength(HISTORY_CAP)
    expect(history[history.length - 1].questionId).toBe('v24')
    expect(history[0].questionId).toBe('v15')
  })
})

describe('selectQuestion', () => {
  it('geeft null bij een lege pool', () => {
    expect(selectQuestion([], id, [], mulberry32(1))).toBeNull()
    expect(selectQuestion([], id, historyOf([['v0', 'fout']]), mulberry32(1))).toBeNull()
  })

  it('is deterministisch met dezelfde seed', () => {
    const pool = poolOf(20)
    const history = historyOf([
      ['v0', 'fout'],
      ['v1', 'juist'],
    ])
    const draw = (seed: number) => {
      const rng = mulberry32(seed)
      return Array.from({ length: 10 }, () => selectQuestion(pool, id, history, rng))
    }
    expect(draw(42)).toEqual(draw(42))
    expect(draw(42).length).toBe(10)
  })

  it('herhaalt de laatst beantwoorde vraag onmiddellijk nooit (cooldown)', () => {
    const pool = poolOf(10)
    for (let seed = 1; seed <= 200; seed++) {
      const rng = mulberry32(seed)
      const history = historyOf([['v9', 'fout']])
      const picked = selectQuestion(pool, id, history, rng)
      expect(picked).not.toBe('v9')
    }
  })

  it('bevat de laatst beantwoorde vraag niet, zelfs na een fout', () => {
    // Cooldown + willekeurigheid zijn de enige mechanismen: meet over vele draws.
    const pool = poolOf(8)
    const history = historyOf([
      ['v0', 'fout'],
      ['v7', 'fout'],
    ])
    const counts = new Map<string, number>()
    const rng = mulberry32(7)
    for (let i = 0; i < 2000; i++) {
      const picked = selectQuestion(pool, id, history, rng)
      expect(picked).not.toBeNull()
      if (picked) counts.set(picked, (counts.get(picked) ?? 0) + 1)
    }
    expect(counts.get('v7') ?? 0).toBe(0)
    expect(counts.size).toBeGreaterThan(1)
  })

  it('relaxte de cooldown tot er een vraag overblijft', () => {
    const rng = mulberry32(3)
    // Enkel de laatst beantwoorde vraag zit nog in de pool.
    expect(selectQuestion(['v9'], id, historyOf([['v9', 'fout']]), rng)).toBe('v9')
  })

  it('trekt cooldown 3 én 4 (beide komen voor)', () => {
    // Pool {v0..v4}, historiek: v0..v3 beantwoord.
    // k=3 -> overblijvers {v0, v4}; k=4 -> {v4}.
    const pool = ['v0', 'v1', 'v2', 'v3', 'v4']
    const history = historyOf([
      ['v0', 'juist'],
      ['v1', 'juist'],
      ['v2', 'juist'],
      ['v3', 'juist'],
    ])
    const rng = mulberry32(11)
    let pickedV0 = 0
    let pickedV4 = 0
    const draws = 20000
    for (let i = 0; i < draws; i++) {
      const picked = selectQuestion(pool, id, history, rng)
      if (picked === 'v0') pickedV0++
      if (picked === 'v4') pickedV4++
    }
    // Verwacht: P(v0) = P(k=3) * juist/(juist+nieuw) = 0.5 * 0.2/0.5 = 0.2
    const weightJuist = CATEGORY_WEIGHTS.juist
    const weightNiet = CATEGORY_WEIGHTS.nietInHistory
    const expectedV0 = 0.5 * (weightJuist / (weightJuist + weightNiet))
    expect(pickedV0 / draws).toBeGreaterThan(expectedV0 - 0.05)
    expect(pickedV0 / draws).toBeLessThan(expectedV0 + 0.05)
    // Beide cooldown's moeten voorkomen: v0 (enkel bij k=3) én v4 (ook bij k=4).
    expect(pickedV0 / draws).toBeGreaterThan(0.05)
    expect(pickedV4 / draws).toBeGreaterThan(0.5)
    expect(COOLDOWN_MIN).toBe(3)
    expect(COOLDOWN_MAX).toBe(4)
  })
})

describe('categoriegewichten', () => {
  // De laatste 4 historiek-id's zitten niet in de pool, zodat de cooldown
  // geen echte poolvragen uitsluit en de gewichten puur gemeten worden.
  const phantomTail: [string, QuizResult][] = [
    ['x1', 'fout'],
    ['x2', 'fout'],
    ['x3', 'fout'],
    ['x4', 'fout'],
  ]

  it('trekt ongeveer 50% fout, 30% nieuw en 20% juist', () => {
    const pool = [
      'f0',
      'f1',
      'f2',
      'j0',
      'j1',
      ...Array.from({ length: 95 }, (_, index) => `n${index}`),
    ]
    const history = historyOf([
      ['f0', 'fout'],
      ['f1', 'fout'],
      ['f2', 'fout'],
      ['j0', 'juist'],
      ['j1', 'juist'],
      ...phantomTail,
    ])
    const rng = mulberry32(2024)
    const counts = { fout: 0, nietInHistory: 0, juist: 0 }
    const draws = 20000
    for (let i = 0; i < draws; i++) {
      const picked = selectQuestion(pool, id, history, rng)
      expect(picked).not.toBeNull()
      if (picked?.startsWith('f')) counts.fout++
      else if (picked?.startsWith('j')) counts.juist++
      else counts.nietInHistory++
    }
    expect(counts.fout / draws).toBeGreaterThan(CATEGORY_WEIGHTS.fout - 0.03)
    expect(counts.fout / draws).toBeLessThan(CATEGORY_WEIGHTS.fout + 0.03)
    expect(counts.nietInHistory / draws).toBeGreaterThan(CATEGORY_WEIGHTS.nietInHistory - 0.03)
    expect(counts.nietInHistory / draws).toBeLessThan(CATEGORY_WEIGHTS.nietInHistory + 0.03)
    expect(counts.juist / draws).toBeGreaterThan(CATEGORY_WEIGHTS.juist - 0.03)
    expect(counts.juist / draws).toBeLessThan(CATEGORY_WEIGHTS.juist + 0.03)
  })

  it('normaliseert gewichten wanneer categorieën leeg zijn', () => {
    // Enkel fout (3 echt + 4 fantoom) en nieuw: categorie juist valt af.
    const pool = ['f0', 'f1', 'f2', ...Array.from({ length: 95 }, (_, i) => `n${i}`)]
    const history = historyOf([['f0', 'fout'], ['f1', 'fout'], ['f2', 'fout'], ...phantomTail])
    const rng = mulberry32(5)
    let fout = 0
    const draws = 20000
    for (let i = 0; i < draws; i++) {
      const picked = selectQuestion(pool, id, history, rng)
      if (picked?.startsWith('f')) fout++
    }
    const expected = CATEGORY_WEIGHTS.fout / (CATEGORY_WEIGHTS.fout + CATEGORY_WEIGHTS.nietInHistory)
    expect(fout / draws).toBeGreaterThan(expected - 0.03)
    expect(fout / draws).toBeLessThan(expected + 0.03)
  })

  it('kiest altijd uit de enige lege-overschrijdende categorie', () => {
    const allFout = ['f0', 'f1', 'f2', 'f3', 'f4']
    const history = historyOf([
      ['f0', 'fout'],
      ['f1', 'fout'],
      ['f2', 'fout'],
      ['f3', 'fout'],
      ['f4', 'fout'],
    ])
    const rng = mulberry32(9)
    for (let i = 0; i < 500; i++) {
      const picked = selectQuestion(allFout, id, history, rng)
      expect(picked).not.toBeNull()
      expect(allFout).toContain(picked)
    }
  })
})
