<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useQuizSession } from '@/composables/useQuizSession'
import { EMPTY_POOL_MESSAGE } from '@/theory/constants'
import { INTERVALS } from '@/theory/intervals'
import { NOTE_LEVEL_LABELS, type NoteLevel } from '@/theory/notes'
import {
  QUIZZES,
  type HoofddrieklankenSettings,
  type IntervalstappenSettings,
  type NotenstappenSettings,
  type QuizId,
  type SleutelverwantschapSettings,
  type SprongenSettings,
  type VoortekensSettings,
} from '@/theory/quizzes'

const props = defineProps<{ quizId: QuizId }>()

const definition = QUIZZES[props.quizId]
const { settings, history, currentQuestion, answerVisible, revealAnswer, recordResult, clearHistory } =
  useQuizSession(props.quizId)

const settingsOpen = ref(false)
const emptyMessage = EMPTY_POOL_MESSAGE

const sprongen = computed(() => settings.value as SprongenSettings)
const notenstappen = computed(() => settings.value as NotenstappenSettings)
const voortekens = computed(() => settings.value as VoortekensSettings)
const sleutels = computed(() => settings.value as SleutelverwantschapSettings)

/** Quiz 1-3 delen de intervalkeuze. */
const intervalSettings = computed(
  () => settings.value as SprongenSettings | IntervalstappenSettings | NotenstappenSettings,
)

/** Quiz 4-6 delen het maximum aantal voortekens. */
const maxVoortekensSettings = computed(
  () =>
    settings.value as
      | VoortekensSettings
      | SleutelverwantschapSettings
      | HoofddrieklankenSettings,
)

const basisIntervals = INTERVALS.filter(item => item.family === 'basis')
const noteLevels: NoteLevel[] = [0, 1, 2]
const noteLevelLabels = NOTE_LEVEL_LABELS

const showIntervals = computed(() =>
  ['intervalsprongen', 'intervalstappen', 'notenstappen'].includes(props.quizId),
)
const showMaxVoortekens = computed(() =>
  ['voortekens', 'grote-kleine-sleutel', 'hoofddrieklanken'].includes(props.quizId),
)

/** Velden in het instellingenpaneel mogen hun eigen toetsen houden. */
function isFormTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)
}

/** Knoppen en links reageren al zelf op Spatie/Enter (klik bij focus). */
function isButtonOrLink(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return ['BUTTON', 'A'].includes(target.tagName)
}

/**
 * Toetsenbordbediening: Spatie/Enter toont het antwoord of bevestigt "Juist",
 * Y is altijd "Juist" en N is altijd "Fout".
 */
function handleKeydown(event: KeyboardEvent): void {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return
  if (isFormTarget(event.target)) return

  const key = event.key.toLowerCase()
  const isAdvance = event.key === ' ' || event.key === 'Enter'
  if (isAdvance && isButtonOrLink(event.target)) return

  if (isAdvance) {
    event.preventDefault() // voorkomt dat de pagina scrollt
    if (!currentQuestion.value) return
    if (!answerVisible.value) revealAnswer()
    else recordResult('juist')
    return
  }
  if (!currentQuestion.value || !answerVisible.value) return
  if (key === 'y') recordResult('juist')
  else if (key === 'n') recordResult('fout')
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <main class="quiz-container">
    <div class="quiz-header">
      <div>
        <h2>{{ definition.title }}</h2>
        <p class="instruction">{{ definition.instruction }}</p>
      </div>
      <button
        class="gear"
        type="button"
        aria-label="Instellingen"
        :aria-expanded="settingsOpen"
        @click="settingsOpen = !settingsOpen"
      >
        ⚙
      </button>
    </div>

    <div v-if="settingsOpen" class="settings-panel">
      <h3>Instellingen</h3>

      <!-- Quiz 1: Intervalsprongen -->
      <template v-if="props.quizId === 'intervalsprongen'">
        <div class="setting-item">
          <span class="setting-label">Niveau van de noten in de vraag</span>
          <select v-model="sprongen.questionNoteLevel">
            <option v-for="level in noteLevels" :key="'vraag' + level" :value="level">
              {{ noteLevelLabels[level] }}
            </option>
          </select>
        </div>
        <div class="setting-item">
          <span class="setting-label">Niveau van de noten in het antwoord</span>
          <select v-model="sprongen.answerNoteLevel">
            <option v-for="level in noteLevels" :key="'antwoord' + level" :value="level">
              {{ noteLevelLabels[level] }}
            </option>
          </select>
        </div>
        <div class="setting-item">
          <span class="setting-label">Richting</span>
          <div class="options-row">
            <label><input v-model="sprongen.direction" type="radio" value="omhoog" /> omhoog</label>
            <label><input v-model="sprongen.direction" type="radio" value="omlaag" /> omlaag</label>
            <label><input v-model="sprongen.direction" type="radio" value="beide" /> beide</label>
          </div>
        </div>
      </template>

      <!-- Quiz 3: Notenstappen -->
      <template v-if="props.quizId === 'notenstappen'">
        <div class="setting-item">
          <span class="setting-label">Niveau van de noten in de vraag</span>
          <select v-model="notenstappen.questionNoteLevel">
            <option v-for="level in noteLevels" :key="'vraag' + level" :value="level">
              {{ noteLevelLabels[level] }}
            </option>
          </select>
        </div>
        <div class="setting-item">
          <span class="setting-label">Richting</span>
          <div class="options-row">
            <label>
              <input v-model="notenstappen.direction" type="radio" value="omhoog" /> omhoog
            </label>
            <label>
              <input v-model="notenstappen.direction" type="radio" value="omlaag" /> omlaag
            </label>
            <label><input v-model="notenstappen.direction" type="radio" value="beide" /> beide</label>
          </div>
        </div>
      </template>

      <!-- Quiz 1-3: intervalkeuze -->
      <fieldset v-if="showIntervals" class="setting-item">
        <legend class="setting-label">Welke intervals komen voor?</legend>
        <div class="option-grid">
          <label v-for="item in basisIntervals" :key="item.id">
            <input v-model="intervalSettings.intervalIds" type="checkbox" :value="item.id" />
            {{ item.name }}
          </label>
          <label>
            <input v-model="intervalSettings.includeAugmented" type="checkbox" />
            overmatig toestaan
          </label>
          <label>
            <input v-model="intervalSettings.includeDiminished" type="checkbox" />
            verminderd toestaan
          </label>
        </div>
      </fieldset>

      <!-- Quiz 4: Voortekens -->
      <div v-if="props.quizId === 'voortekens'" class="setting-item">
        <span class="setting-label">Richting</span>
        <div class="options-row">
          <label>
            <input v-model="voortekens.direction" type="radio" value="sleutel-naar-voortekens" />
            sleutel → voortekens
          </label>
          <label>
            <input v-model="voortekens.direction" type="radio" value="voortekens-naar-sleutel" />
            voortekens → sleutel
          </label>
          <label><input v-model="voortekens.direction" type="radio" value="beide" /> beide</label>
        </div>
      </div>

      <!-- Quiz 5: Grote/kleine sleutel -->
      <div v-if="props.quizId === 'grote-kleine-sleutel'" class="setting-item">
        <span class="setting-label">Richting</span>
        <div class="options-row">
          <label>
            <input v-model="sleutels.direction" type="radio" value="grote-naar-kleine" />
            grote → kleine sleutel
          </label>
          <label>
            <input v-model="sleutels.direction" type="radio" value="kleine-naar-grote" />
            kleine → grote sleutel
          </label>
          <label><input v-model="sleutels.direction" type="radio" value="beide" /> beide</label>
        </div>
      </div>

      <!-- Quiz 4-6: maximum voortekens -->
      <div v-if="showMaxVoortekens" class="setting-item">
        <span class="setting-label">Maximum aantal voortekens</span>
        <select v-model.number="maxVoortekensSettings.maxVoortekens">
          <option v-for="count in 8" :key="count - 1" :value="count - 1">{{ count - 1 }}</option>
        </select>
      </div>

      <div class="setting-footer">
        <button type="button" class="secondary" @click="clearHistory">
          Wis historiek ({{ history.length }})
        </button>
      </div>
    </div>

    <p v-if="!currentQuestion" class="empty-message">{{ emptyMessage }}</p>
    <template v-else>
      <p class="question">{{ currentQuestion.text }}</p>
      <div class="answer-container">
        <p v-if="answerVisible" class="answer">{{ currentQuestion.answer }}</p>
      </div>
      <div class="actions">
        <button v-if="!answerVisible" type="button" @click="revealAnswer">Toon antwoord</button>
        <template v-else>
          <button type="button" class="juist" @click="recordResult('juist')">Juist</button>
          <button type="button" class="fout" @click="recordResult('fout')">Fout</button>
        </template>
      </div>
      <p class="keyboard-hint">
        Spatie/Enter: antwoord tonen of juist · Y: juist · N: fout
      </p>
    </template>
  </main>
</template>

<style scoped>
.quiz-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  padding: 1rem;
}

.quiz-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  max-width: 480px;
}

h2 {
  margin-bottom: 0.25rem;
}

h3 {
  margin-bottom: 0.5rem;
}

.instruction {
  opacity: 0.75;
  font-size: 0.95rem;
}

.gear {
  border: 1px solid var(--color-border);
  background: none;
  border-radius: 50%;
  width: 2.4rem;
  height: 2.4rem;
  font-size: 1.2rem;
  cursor: pointer;
}

.gear:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
}

.settings-panel {
  width: 100%;
  max-width: 480px;
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-align: left;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.9rem;
  border: 0;
  padding: 0;
}

.setting-label {
  font-weight: 600;
  font-size: 0.9rem;
}

.options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.options-row label,
.option-grid label {
  cursor: pointer;
  font-size: 0.95rem;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.3rem;
}

.setting-footer {
  margin-top: 0.5rem;
}

.question {
  font-size: 1.4rem;
  margin: 1.4rem 0 0.6rem;
}

.answer-container {
  min-height: 2.2rem;
}

.answer {
  font-size: 1.3rem;
  font-weight: 600;
}

.actions button {
  margin: 0.4rem;
  padding: 0.55rem 1.4rem;
  font-size: 1rem;
  cursor: pointer;
}

button.juist {
  background-color: hsla(160, 60%, 45%, 0.25);
  border-color: hsla(160, 60%, 35%, 0.6);
}

button.fout {
  background-color: hsla(0, 70%, 50%, 0.15);
  border-color: hsla(0, 70%, 45%, 0.5);
}

button.secondary {
  font-size: 0.85rem;
  padding: 0.35rem 0.8rem;
  cursor: pointer;
}

.empty-message {
  margin-top: 2rem;
  color: #b54a4a;
  font-weight: 600;
}

.keyboard-hint {
  margin-top: 1.2rem;
  font-size: 0.8rem;
  opacity: 0.55;
}
</style>
