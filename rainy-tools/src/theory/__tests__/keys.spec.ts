import { describe, expect, it } from 'vitest'
import {
  FLAT_ORDER,
  GROTE_KEYS,
  KEYS,
  KLEINE_KEYS,
  SHARP_ORDER,
  findSignature,
  formatVoortekens,
  keyName,
  keyScale,
  relativeKey,
  triadAnswer,
  voortekensLetters,
} from '../keys'
import { LETTERS } from '../notes'

type SignatureRow = [number, 'geen' | 'kruisen' | 'mollen', string[], string, string]

const SIGNATURE_TABLE: SignatureRow[] = [
  [0, 'geen', [], 'Do groot', 'La klein'],
  [1, 'kruisen', ['fa'], 'Sol groot', 'Mi klein'],
  [2, 'kruisen', ['fa', 'do'], 'Re groot', 'Si klein'],
  [3, 'kruisen', ['fa', 'do', 'sol'], 'La groot', 'Fa# klein'],
  [4, 'kruisen', ['fa', 'do', 'sol', 're'], 'Mi groot', 'Do# klein'],
  [5, 'kruisen', ['fa', 'do', 'sol', 're', 'la'], 'Si groot', 'Sol# klein'],
  [6, 'kruisen', ['fa', 'do', 'sol', 're', 'la', 'mi'], 'Fa# groot', 'Re# klein'],
  [7, 'kruisen', ['fa', 'do', 'sol', 're', 'la', 'mi', 'si'], 'Do# groot', 'La# klein'],
  [1, 'mollen', ['si'], 'Fa groot', 'Re klein'],
  [2, 'mollen', ['si', 'mi'], 'Sib groot', 'Sol klein'],
  [3, 'mollen', ['si', 'mi', 'la'], 'Mib groot', 'Do klein'],
  [4, 'mollen', ['si', 'mi', 'la', 're'], 'Lab groot', 'Fa klein'],
  [5, 'mollen', ['si', 'mi', 'la', 're', 'sol'], 'Reb groot', 'Sib klein'],
  [6, 'mollen', ['si', 'mi', 'la', 're', 'sol', 'do'], 'Solb groot', 'Mib klein'],
  [7, 'mollen', ['si', 'mi', 'la', 're', 'sol', 'do', 'fa'], 'Dob groot', 'Lab klein'],
]

describe('orde van de voortekens', () => {
  it('kruisen: fa do sol re la mi si', () => {
    expect(SHARP_ORDER.map(letter => LETTERS[letter])).toEqual([
      'fa',
      'do',
      'sol',
      're',
      'la',
      'mi',
      'si',
    ])
  })

  it('mollen: si mi la re sol do fa', () => {
    expect(FLAT_ORDER.map(letter => LETTERS[letter])).toEqual([
      'si',
      'mi',
      'la',
      're',
      'sol',
      'do',
      'fa',
    ])
  })
})

describe('de 15 sleuteltekens', () => {
  it('kent de voortekens en namen van elke grote en kleine sleutel', () => {
    for (const [count, type, letters, grootName, kleinName] of SIGNATURE_TABLE) {
      expect(voortekensLetters(count, type), `${count} ${type}`).toEqual(letters)
      const signature = findSignature(count, type)
      expect(keyName({ mode: 'groot', tonic: signature.groot, voortekenCount: count, voortekenType: type })).toBe(grootName)
      expect(keyName({ mode: 'klein', tonic: signature.klein, voortekenCount: count, voortekenType: type })).toBe(kleinName)
    }
  })

  it('heeft exact 15 grote en 15 kleine sleutels', () => {
    expect(KEYS).toHaveLength(30)
    expect(GROTE_KEYS).toHaveLength(15)
    expect(KLEINE_KEYS).toHaveLength(15)
    for (const key of KEYS) expect(key.voortekenCount).toBeLessThanOrEqual(7)
  })

  it('formatteert de voortekens met correct enkelvoud', () => {
    expect(formatVoortekens(0, 'geen')).toBe('0 voortekens')
    expect(formatVoortekens(1, 'kruisen')).toBe('1 kruis: fa')
    expect(formatVoortekens(1, 'mollen')).toBe('1 mol: si')
    expect(formatVoortekens(3, 'kruisen')).toBe('3 kruisen: fa do sol')
    expect(formatVoortekens(6, 'kruisen')).toBe('6 kruisen: fa do sol re la mi')
    expect(formatVoortekens(7, 'mollen')).toBe('7 mollen: si mi la re sol do fa')
  })
})

describe('verwante sleutels', () => {
  const pairs: [string, string][] = [
    ['Do groot', 'La klein'],
    ['Sol groot', 'Mi klein'],
    ['Re groot', 'Si klein'],
    ['La groot', 'Fa# klein'],
    ['Mi groot', 'Do# klein'],
    ['Si groot', 'Sol# klein'],
    ['Fa# groot', 'Re# klein'],
    ['Do# groot', 'La# klein'],
    ['Fa groot', 'Re klein'],
    ['Sib groot', 'Sol klein'],
    ['Mib groot', 'Do klein'],
    ['Lab groot', 'Fa klein'],
    ['Reb groot', 'Sib klein'],
    ['Solb groot', 'Mib klein'],
    ['Dob groot', 'Lab klein'],
  ]

  const findKey = (name: string) => {
    const key = KEYS.find(candidate => keyName(candidate) === name)
    if (!key) throw new Error(`onbekende sleutel: ${name}`)
    return key
  }

  it('gaat van groot naar klein en terug voor alle 15 paren', () => {
    expect(pairs).toHaveLength(15)
    for (const [grootName, kleinName] of pairs) {
      expect(keyName(relativeKey(findKey(grootName))), grootName).toBe(kleinName)
      expect(keyName(relativeKey(findKey(kleinName))), kleinName).toBe(grootName)
    }
  })
})

describe('hoofddrieklanken van alle 30 sleutels', () => {
  // Kleine sleutels: harmonische vorm, dus V is groot met leidtoon.
  const expected: Record<string, string> = {
    'Do groot': 'I = do-mi-sol (groot), IV = fa-la-do (groot), V = sol-si-re (groot)',
    'Sol groot': 'I = sol-si-re (groot), IV = do-mi-sol (groot), V = re-fa#-la (groot)',
    'Re groot': 'I = re-fa#-la (groot), IV = sol-si-re (groot), V = la-do#-mi (groot)',
    'La groot': 'I = la-do#-mi (groot), IV = re-fa#-la (groot), V = mi-sol#-si (groot)',
    'Mi groot': 'I = mi-sol#-si (groot), IV = la-do#-mi (groot), V = si-re#-fa# (groot)',
    'Si groot': 'I = si-re#-fa# (groot), IV = mi-sol#-si (groot), V = fa#-la#-do# (groot)',
    'Fa# groot': 'I = fa#-la#-do# (groot), IV = si-re#-fa# (groot), V = do#-mi#-sol# (groot)',
    'Do# groot': 'I = do#-mi#-sol# (groot), IV = fa#-la#-do# (groot), V = sol#-si#-re# (groot)',
    'Fa groot': 'I = fa-la-do (groot), IV = sib-re-fa (groot), V = do-mi-sol (groot)',
    'Sib groot': 'I = sib-re-fa (groot), IV = mib-sol-sib (groot), V = fa-la-do (groot)',
    'Mib groot': 'I = mib-sol-sib (groot), IV = lab-do-mib (groot), V = sib-re-fa (groot)',
    'Lab groot': 'I = lab-do-mib (groot), IV = reb-fa-lab (groot), V = mib-sol-sib (groot)',
    'Reb groot': 'I = reb-fa-lab (groot), IV = solb-sib-reb (groot), V = lab-do-mib (groot)',
    'Solb groot': 'I = solb-sib-reb (groot), IV = dob-mib-solb (groot), V = reb-fa-lab (groot)',
    'Dob groot': 'I = dob-mib-solb (groot), IV = fab-lab-dob (groot), V = solb-sib-reb (groot)',
    'La klein': 'I = la-do-mi (klein), IV = re-fa-la (klein), V = mi-sol#-si (groot)',
    'Mi klein': 'I = mi-sol-si (klein), IV = la-do-mi (klein), V = si-re#-fa# (groot)',
    'Si klein': 'I = si-re-fa# (klein), IV = mi-sol-si (klein), V = fa#-la#-do# (groot)',
    'Fa# klein': 'I = fa#-la-do# (klein), IV = si-re-fa# (klein), V = do#-mi#-sol# (groot)',
    'Do# klein': 'I = do#-mi-sol# (klein), IV = fa#-la-do# (klein), V = sol#-si#-re# (groot)',
    'La# klein': 'I = la#-do#-mi# (klein), IV = re#-fa#-la# (klein), V = mi#-sol##-si# (groot)',
    'Re# klein': 'I = re#-fa#-la# (klein), IV = sol#-si-re# (klein), V = la#-do##-mi# (groot)',
    'Sol# klein': 'I = sol#-si-re# (klein), IV = do#-mi-sol# (klein), V = re#-fa##-la# (groot)',
    'Re klein': 'I = re-fa-la (klein), IV = sol-sib-re (klein), V = la-do#-mi (groot)',
    'Sol klein': 'I = sol-sib-re (klein), IV = do-mib-sol (klein), V = re-fa#-la (groot)',
    'Do klein': 'I = do-mib-sol (klein), IV = fa-lab-do (klein), V = sol-si-re (groot)',
    'Fa klein': 'I = fa-lab-do (klein), IV = sib-reb-fa (klein), V = do-mi-sol (groot)',
    'Sib klein': 'I = sib-reb-fa (klein), IV = mib-solb-sib (klein), V = fa-la-do (groot)',
    'Mib klein': 'I = mib-solb-sib (klein), IV = lab-dob-mib (klein), V = sib-re-fa (groot)',
    'Lab klein': 'I = lab-dob-mib (klein), IV = reb-fab-lab (klein), V = mib-sol-sib (groot)',
  }

  it('levert I, IV en V voor elke sleutel', () => {
    expect(Object.keys(expected)).toHaveLength(30)
    for (const key of KEYS) {
      const name = keyName(key)
      expect(expected[name], name).toBeDefined()
      expect(triadAnswer(key), name).toBe(expected[name])
    }
  })

  it('volgt het voorbeeld uit de opdracht voor La klein', () => {
    const laKlein = KEYS.find(key => keyName(key) === 'La klein')
    expect(laKlein).toBeDefined()
    if (laKlein) {
      expect(triadAnswer(laKlein)).toBe(
        'I = la-do-mi (klein), IV = re-fa-la (klein), V = mi-sol#-si (groot)',
      )
    }
  })

  it('start de toonladder op de grondtoon van de sleutel', () => {
    for (const key of KEYS) {
      const scale = keyScale(key)
      expect(scale, keyName(key)).toHaveLength(7)
      expect(scale[0], keyName(key)).toEqual(key.tonic)
    }
  })
})
