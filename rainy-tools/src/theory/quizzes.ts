import {
  INTERVALS,
  activeIntervals,
  intervalBetween,
  intervalByShape,
  intervalQuestionText,
  applyInterval,
  type Direction,
} from './intervals'
import { fitsLevel, formatNote, notesForLevel, type NoteLevel } from './notes'
import {
  GROTE_KEYS,
  KEYS,
  KLEINE_KEYS,
  SIGNATURES,
  formatVoortekens,
  keyForSignature,
  keyName,
  relativeKey,
  triadAnswer,
} from './keys'

export interface QuizQuestion {
  /** Stabiele string uit de vraaginhoud, inclusief richting. */
  id: string
  text: string
  answer: string
}

export type NoteDirectionSetting = 'omhoog' | 'omlaag' | 'beide'
export type VoortekensDirection = 'sleutel-naar-voortekens' | 'voortekens-naar-sleutel' | 'beide'
export type SleutelDirection = 'grote-naar-kleine' | 'kleine-naar-grote' | 'beide'

/** Quiz 1: Intervalsprongen */
export interface SprongenSettings {
  questionNoteLevel: NoteLevel
  answerNoteLevel: NoteLevel
  intervalIds: string[]
  includeAugmented: boolean
  includeDiminished: boolean
  direction: NoteDirectionSetting
}

/** Quiz 2: Intervalstappen (geen noten in vraag of antwoord) */
export interface IntervalstappenSettings {
  intervalIds: string[]
  includeAugmented: boolean
  includeDiminished: boolean
}

/** Quiz 3: Notenstappen (het antwoord is een getal, dus geen antwoordniveau) */
export interface NotenstappenSettings {
  questionNoteLevel: NoteLevel
  intervalIds: string[]
  includeAugmented: boolean
  includeDiminished: boolean
  direction: NoteDirectionSetting
}

/** Quiz 4: Voortekens */
export interface VoortekensSettings {
  maxVoortekens: number
  direction: VoortekensDirection
}

/** Quiz 5: Grote/kleine sleutel */
export interface SleutelverwantschapSettings {
  maxVoortekens: number
  direction: SleutelDirection
}

/** Quiz 6: Hoofddrieklanken */
export interface HoofddrieklankenSettings {
  maxVoortekens: number
}

export type QuizSettings =
  | SprongenSettings
  | IntervalstappenSettings
  | NotenstappenSettings
  | VoortekensSettings
  | SleutelverwantschapSettings
  | HoofddrieklankenSettings

export type QuizId =
  | 'intervalsprongen'
  | 'intervalstappen'
  | 'notenstappen'
  | 'voortekens'
  | 'grote-kleine-sleutel'
  | 'hoofddrieklanken'

const BASIS_INTERVAL_IDS = INTERVALS.filter(item => item.family === 'basis').map(item => item.id)

function directionsOf(direction: NoteDirectionSetting): Direction[] {
  if (direction === 'omhoog') return ['omhoog']
  if (direction === 'omlaag') return ['omlaag']
  return ['omhoog', 'omlaag']
}

/** Quiz 1: noot + interval + richting -> resulterende noot. */
export function buildSprongen(settings: SprongenSettings): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  const active = activeIntervals(settings)
  for (const note of notesForLevel(settings.questionNoteLevel)) {
    for (const item of active) {
      for (const direction of directionsOf(settings.direction)) {
        const answer = applyInterval(note, item, direction)
        if (!answer || !fitsLevel(answer, settings.answerNoteLevel)) continue
        const sign = direction === 'omhoog' ? '+' : '-'
        questions.push({
          id: `q1:${formatNote(note)}|${item.id}|${direction}`,
          text: `${formatNote(note)} ${sign} ${item.name} ${direction}`,
          answer: formatNote(answer),
        })
      }
    }
  }
  return questions
}

/** Quiz 2: interval -> aantal halve tonen. */
export function buildIntervalstappen(settings: IntervalstappenSettings): QuizQuestion[] {
  return activeIntervals(settings).map(item => ({
    id: `q2:${item.id}`,
    text: intervalQuestionText(item),
    answer: `${item.semitones} halve tonen`,
  }))
}

/** Quiz 3: twee noten -> aantal halve tonen ertussen. */
export function buildNotenstappen(settings: NotenstappenSettings): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  const activeIds = new Set(activeIntervals(settings).map(item => item.id))
  const notes = notesForLevel(settings.questionNoteLevel)
  for (const from of notes) {
    for (const to of notes) {
      if (from.letter === to.letter && from.accidental === to.accidental) continue
      for (const direction of directionsOf(settings.direction)) {
        const shape = intervalBetween(from, to, direction)
        if (!shape) continue
        const item = intervalByShape(shape.degree, shape.semitones)
        if (!item || !activeIds.has(item.id)) continue
        questions.push({
          id: `q3:${formatNote(from)}|${formatNote(to)}|${direction}`,
          text: `Hoeveel halve tonen van ${formatNote(from)} naar ${formatNote(to)} ${direction}?`,
          answer: `${item.semitones} halve tonen`,
        })
      }
    }
  }
  return questions
}

/** Quiz 4: sleutel -> voortekens of voortekens -> sleutels. */
export function buildVoortekens(settings: VoortekensSettings): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  const max = settings.maxVoortekens
  if (settings.direction !== 'voortekens-naar-sleutel') {
    for (const key of KEYS) {
      if (key.voortekenCount > max) continue
      questions.push({
        id: `q4:sleutel-naar-voortekens:${keyName(key)}`,
        text: keyName(key),
        answer: formatVoortekens(key.voortekenCount, key.voortekenType),
      })
    }
  }
  if (settings.direction !== 'sleutel-naar-voortekens') {
    for (const signature of SIGNATURES) {
      if (signature.count > max) continue
      questions.push({
        id: `q4:voortekens-naar-sleutel:${signature.type}:${signature.count}`,
        text: formatVoortekens(signature.count, signature.type),
        answer: `${keyName(keyForSignature(signature, 'groot'))}, ${keyName(keyForSignature(signature, 'klein'))}`,
      })
    }
  }
  return questions
}

/** Quiz 5: grote -> kleine sleutel of omgekeerd. */
export function buildSleutelverwantschap(settings: SleutelverwantschapSettings): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  const max = settings.maxVoortekens
  if (settings.direction !== 'kleine-naar-grote') {
    for (const key of GROTE_KEYS) {
      if (key.voortekenCount > max) continue
      questions.push({
        id: `q5:grote-naar-kleine:${keyName(key)}`,
        text: keyName(key),
        answer: keyName(relativeKey(key)),
      })
    }
  }
  if (settings.direction !== 'grote-naar-kleine') {
    for (const key of KLEINE_KEYS) {
      if (key.voortekenCount > max) continue
      questions.push({
        id: `q5:kleine-naar-grote:${keyName(key)}`,
        text: keyName(key),
        answer: keyName(relativeKey(key)),
      })
    }
  }
  return questions
}

/** Quiz 6: sleutel -> I, IV en V (klein: harmonische vorm). */
export function buildHoofddrieklanken(settings: HoofddrieklankenSettings): QuizQuestion[] {
  return KEYS.filter(key => key.voortekenCount <= settings.maxVoortekens).map(key => ({
    id: `q6:${keyName(key)}`,
    text: keyName(key),
    answer: triadAnswer(key),
  }))
}

export interface QuizDefinition {
  id: QuizId
  menuLabel: string
  group: 'intervallen' | 'sleutels'
  title: string
  instruction: string
  defaultSettings: () => QuizSettings
  buildPool: (settings: QuizSettings) => QuizQuestion[]
}

export const QUIZZES: Record<QuizId, QuizDefinition> = {
  intervalsprongen: {
    id: 'intervalsprongen',
    menuLabel: 'Intervalsprongen',
    group: 'intervallen',
    title: 'Intervalsprongen',
    instruction: 'Bereken de noot na de sprong.',
    defaultSettings: (): SprongenSettings => ({
      questionNoteLevel: 1,
      answerNoteLevel: 1,
      intervalIds: [...BASIS_INTERVAL_IDS],
      includeAugmented: false,
      includeDiminished: false,
      direction: 'beide',
    }),
    buildPool: settings => buildSprongen(settings as SprongenSettings),
  },
  intervalstappen: {
    id: 'intervalstappen',
    menuLabel: 'Intervalstappen',
    group: 'intervallen',
    title: 'Intervalstappen',
    instruction: 'Hoeveel halve tonen zitten er in het interval?',
    defaultSettings: (): IntervalstappenSettings => ({
      intervalIds: [...BASIS_INTERVAL_IDS],
      includeAugmented: false,
      includeDiminished: false,
    }),
    buildPool: settings => buildIntervalstappen(settings as IntervalstappenSettings),
  },
  notenstappen: {
    id: 'notenstappen',
    menuLabel: 'Notenstappen',
    group: 'intervallen',
    title: 'Notenstappen',
    instruction: 'Hoeveel halve tonen zitten er tussen beide noten?',
    defaultSettings: (): NotenstappenSettings => ({
      questionNoteLevel: 1,
      intervalIds: [...BASIS_INTERVAL_IDS],
      includeAugmented: false,
      includeDiminished: false,
      direction: 'beide',
    }),
    buildPool: settings => buildNotenstappen(settings as NotenstappenSettings),
  },
  voortekens: {
    id: 'voortekens',
    menuLabel: 'Voortekens',
    group: 'sleutels',
    title: 'Voortekens',
    instruction: 'Ken de voortekens van elke sleutel en omgekeerd.',
    defaultSettings: (): VoortekensSettings => ({
      maxVoortekens: 7,
      direction: 'beide',
    }),
    buildPool: settings => buildVoortekens(settings as VoortekensSettings),
  },
  'grote-kleine-sleutel': {
    id: 'grote-kleine-sleutel',
    menuLabel: 'Grote/kleine sleutel',
    group: 'sleutels',
    title: 'Grote/kleine sleutel',
    instruction: 'Vind de verwante grote of kleine sleutel.',
    defaultSettings: (): SleutelverwantschapSettings => ({
      maxVoortekens: 7,
      direction: 'beide',
    }),
    buildPool: settings => buildSleutelverwantschap(settings as SleutelverwantschapSettings),
  },
  hoofddrieklanken: {
    id: 'hoofddrieklanken',
    menuLabel: 'Hoofddrieklanken',
    group: 'sleutels',
    title: 'Hoofddrieklanken',
    instruction: 'Ken de I, IV en V van elke sleutel.',
    defaultSettings: (): HoofddrieklankenSettings => ({
      maxVoortekens: 7,
    }),
    buildPool: settings => buildHoofddrieklanken(settings as HoofddrieklankenSettings),
  },
}
