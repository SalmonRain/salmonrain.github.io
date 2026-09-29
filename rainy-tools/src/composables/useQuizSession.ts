import { computed, ref, watch } from 'vue'
import {
  QUIZZES,
  type QuizId,
  type QuizQuestion,
  type QuizSettings,
} from '@/theory/quizzes'
import {
  appendHistory,
  selectQuestion,
  type HistoryEntry,
  type QuizResult,
} from '@/theory/selector'

const settingsKey = (quizId: QuizId) => `rainy-tools:instellingen:${quizId}`
const historyKey = (quizId: QuizId) => `rainy-tools:historiek:${quizId}`

function loadSettings(quizId: QuizId, defaults: QuizSettings): QuizSettings {
  try {
    const raw = localStorage.getItem(settingsKey(quizId))
    if (!raw) return defaults
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return { ...defaults, ...parsed }
  } catch {
    // Kapotte of ontoegankelijke opslag: standaardinstellingen gebruiken.
  }
  return defaults
}

function loadHistory(quizId: QuizId): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(historyKey(quizId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry): entry is HistoryEntry => {
      if (!entry || typeof entry !== 'object') return false
      const candidate = entry as Partial<HistoryEntry>
      return (
        typeof candidate.questionId === 'string' &&
        (candidate.result === 'juist' || candidate.result === 'fout')
      )
    })
  } catch {
    return []
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Volle of geblokkeerde opslag negeren.
  }
}

/**
 * De sessie van één quiz: instellingen en historiek in localStorage,
 * de pool uit de theoriemodules en de vraag-/antwoordstroom.
 */
export function useQuizSession(quizId: QuizId) {
  const definition = QUIZZES[quizId]
  const settings = ref<QuizSettings>(loadSettings(quizId, definition.defaultSettings()))
  const history = ref<HistoryEntry[]>(loadHistory(quizId))
  const currentQuestion = ref<QuizQuestion | null>(null)
  const answerVisible = ref(false)

  const pool = computed(() => definition.buildPool(settings.value))

  function selectNext(): void {
    answerVisible.value = false
    currentQuestion.value = selectQuestion(pool.value, question => question.id, history.value)
  }

  function revealAnswer(): void {
    answerVisible.value = true
  }

  /** Resultaat registreren en meteen de volgende vraag tonen. */
  function recordResult(result: QuizResult): void {
    const question = currentQuestion.value
    if (!question) return
    history.value = appendHistory(history.value, { questionId: question.id, result })
    save(historyKey(quizId), history.value)
    selectNext()
  }

  function clearHistory(): void {
    history.value = []
    save(historyKey(quizId), history.value)
  }

  watch(
    settings,
    value => {
      save(settingsKey(quizId), value)
      selectNext()
    },
    { deep: true },
  )

  selectNext()

  return {
    settings,
    history,
    pool,
    currentQuestion,
    answerVisible,
    revealAnswer,
    recordResult,
    clearHistory,
    selectNext,
  }
}
