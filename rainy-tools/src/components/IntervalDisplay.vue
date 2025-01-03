<template>
  <div class="interval-display-content">
    <h2>What's the interval?</h2>
    <img id="notewheel" :src="NoteWheelSimple" alt="A wheel showing the notes C, D, E, F, G, A, B and C in relation to one another." />

    <!-- Settings Modal (hidden by default) -->
    <div v-if="settingsVisible" class="settings-modal-overlay" @click.self="toggleSettings">
      <div class="settings-modal">
        <button class="close-button" @click="toggleSettings">✖️</button>
        <div class="settings-container">
          <!-- Images Option -->
<!--           <div class="setting-item">
            <div class="options-row">

              <p :class="{ selected: selectedImage === 'none' }">No Images</p>
              <p :class="{ selected: selectedImage === 'diatonic' }">Diatonic Notewheel</p>
              <p :class="{ selected: selectedImage === 'chromatic' }">Chromatic Notewheel</p>
            </div>
            <div class="slider">
              <input type="range" min="0" max="2" v-model="imageOption" @input="updateImage">
            </div>
          </div> -->

          <!-- Language Option -->
<!--           <div class="setting-item">
            <div class="options-row">

              <p :class="{ selected: selectedLanguage === 'en' }">English</p>
              <p :class="{ selected: selectedLanguage === 'nl' }">Nederlands</p>
            </div>
            
            <div class="slider">
              <input type="range" min="0" max="1" v-model="languageOption" @input="updateLanguage">
            </div>
          </div>
 -->
          <!-- Octave Option -->
          <div class="setting-item">
            <div class="options-row">

              <p :class="{ selected: includeOctaves }">Include Octaves</p>
              <p :class="{ selected: !includeOctaves }">Skip Octaves</p>
            </div>

            <div class="slider">
              <input type="range" min="0" max="1" v-model="octaveOption" @input="toggleOctaves">
            </div>
          </div>

          <!-- Notation Option -->
          <div class="setting-item">
            <div class="options-row">

              <p :class="{ selected: !useSolfege }">Letters</p>
              <p :class="{ selected: useSolfege }">Solfege</p>
            </div>
            
            <div class="slider">
              <input type="range" min="0" max="1" v-model="notationOption" @input="toggleNotation">
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="mode-toggle" @click="toggleSettings">
      Click!
    </button>

    <p>{{ intervalQuestion }}</p>

    <!-- Space reserved for answer -->
    <div class="answer-container">
      <p v-if="answerVisible">{{ intervalAnswer }}</p>
    </div>

    <button @click="toggleAnswer">{{ answerVisible ? 'Next Interval' : 'Reveal Answer' }}</button>
  </div>
</template>



<style scoped>
h2 {
  margin-bottom: 0.5rem;
}

button {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

button.active {
  background-color: #007BFF;
  color: white;
}

.mode-toggle, .settings-button {
  margin-top: 20px;
}

.answer-container {
  min-height: 1.9rem;
}

.mode-toggle {
  position: absolute;
  top: -1rem;
  right: 0rem;
  padding: 0.5rem;
  border-color: #37c07b73;
  border-radius: 50%;
  background-color: #11a00473;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.5s;
  width: 80px;
}

.mode-toggle:hover {
  background-color: #00610573;
}

p {
  font-size: 1.2rem;
}

.interval-display-content {
  min-height: 220px;
  min-width: 370px;
  position: relative;
  padding: 1rem;
}

#notewheel {
  display: none;
}

/* Modal Overlay */
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal */
.settings-modal {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 400px;
  width: 90%;
  position: relative;
}

/* Close Button */
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
}

/* Setting Styles */
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-item {
  display: flex;
  flex-direction: column; /* Keep elements in column layout */
  align-items: center;
}

.options-row {
  display: flex;
  gap: 1rem; /* Adds space between the paragraph items */
  justify-content: center; /* Center the items horizontally */
}

.options-row p {
  margin: 0; /* Remove any default margin */
  font-size: 14px;
  cursor: pointer;
}

.slider {
  margin-top: 0.5rem; /* Space above slider */
  width: 100%;
}


.slider {
  margin-top: 0.5rem;
}

input[type="range"] {
  width: 100%;
  appearance: none;
  background: #ddd;
  height: 8px;
  border-radius: 5px;
  outline: none;
  transition: background 0.2s ease-in-out;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 25px;
  height: 25px;
  background: #4CAF50;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}

.selected {
  font-weight: bold;
  color: #4CAF50;
}

.setting-item p {
  margin: 5px 0;
  font-size: 14px;
}

.setting-item p:hover {
  cursor: pointer;
}

</style>


<script>
import NoteWheelSimple from '@/assets/NotewheelSimple.png';  

export default {
  name: 'IntervalPractice',
  data() {
    return {
      notes: [
        { letter: 'A', solfege: 'La', chromaticKey: 0 },
        { letter: 'B', solfege: 'Si', chromaticKey: 2 },
        { letter: 'C', solfege: 'Do', chromaticKey: 3 },
        { letter: 'D', solfege: 'Re', chromaticKey: 5 },
        { letter: 'E', solfege: 'Mi', chromaticKey: 7 },
        { letter: 'F', solfege: 'Fa', chromaticKey: 8 },
        { letter: 'G', solfege: 'Sol', chromaticKey: 10 }
      ],
      intervalQuestion: "",
      intervalAnswer: "",
      firstNote: "",
      secondNote: "",
      answerVisible: false,
      ascending: true,
      noteDistance: true,
      useLetters: true,   // Default to Letters checked
      NoteWheelSimple: NoteWheelSimple,
      // Settings
      settingsVisible: false,
      imageOption: 0, // 0: No images, 1: Diatonic, 2: Chromatic
      selectedImage: 'none',
      languageOption: 0, // 0: English, 1: Nederlands
      selectedLanguage: 'en',
      octaveOption: 0, // 0: Skip Octaves, 1: Show Octaves
      includeOctaves: true,
      notationOption: 0, // 0: Letters, 1: Solfege
      useSolfege: false,
      settingsVisible: false,


    };
  },
  methods: {
    generateInterval() {
      // Generate two random notes
      this.firstNote = this.notes[Math.floor(Math.random() * this.notes.length)];
      do {
        this.secondNote = this.notes[Math.floor(Math.random() * this.notes.length)];
      } while (!this.includeOctaves && this.secondNote === this.firstNote);
      this.ascending = Math.random() < 0.5;

      // Generate interval question string
      this.setQuestion()

      // Calculate chromatic interval
      const chromaticInterval = this.ascending
        ? (((this.secondNote.chromaticKey - this.firstNote.chromaticKey) % 12 + 12) % 12)
        : (((this.firstNote.chromaticKey - this.secondNote.chromaticKey) % 12 + 12) % 12);

      if (this.ascending) {
        // Calculate distance when ascending
        this.noteDistance = (this.notes.indexOf(this.secondNote) - this.notes.indexOf(this.firstNote) + this.notes.length) % this.notes.length;
      } else {
        // Calculate distance when descending
        this.noteDistance = (this.notes.indexOf(this.firstNote) - this.notes.indexOf(this.secondNote) + this.notes.length) % this.notes.length;
      }
      this.noteDistance = this.noteDistance+ 1

      // Set the interval answer
      this.intervalAnswer = this.determineIntervalQuality(chromaticInterval);
      
      // Initially hide the answer
      this.answerVisible = false;
    },
    setQuestion(){
      const direction = this.ascending ? 'up' : 'down';
      this.intervalQuestion =  this.useLetters ?
        `From ${this.firstNote.letter} ${direction} to ${this.secondNote.letter}` :
        `From ${this.firstNote.solfege} ${direction} to ${this.secondNote.solfege}`;

    },
    // Settings Management
    updateImage() {
      const options = ['none', 'diatonic', 'chromatic'];
      this.selectedImage = options[this.imageOption];
    },
    updateLanguage() {
      const languages = ['en', 'nl'];
      this.selectedLanguage = languages[this.languageOption];
    },
    toggleOctaves() {
      this.includeOctaves = this.octaveOption == 0;
    },
    toggleNotation() {
      this.useSolfege = this.notationOption == 1;
      this.useLetters = !this.useLetters;

      this.setQuestion()

    },
    determineIntervalQuality(chromaticSteps) {

      switch (chromaticSteps) {
        
        case 0: return 'Perfect Unison / Perfect Octave';
        case 1: return 'Minor Second';
        case 2: return 'Major Second';
        case 3: return 'Minor Third';
        case 4: return 'Major Third';
        case 5: return 'Perfect Fourth';
        case 6:

          if (this.noteDistance === 4) {

            return 'Augmented Fourth';  // 4 letter names apart
          } else if (this.noteDistance === 5) {

            return 'Diminished Fifth';  // 5 letter names apart
          } else {

            return 'Tritone';  // Generic tritone fallback
          }        
        case 7: return 'Perfect Fifth';
        case 8: return 'Minor Sixth';
        case 9: return 'Major Sixth';
        case 10: return 'Minor Seventh';
        case 11: return 'Major Seventh';
        case 12: return 'Perfect Octave';
        default: return 'Unknown Interval';
      }
    },
    toggleAnswer() {
      if (this.answerVisible) {
        // If answer is already visible, generate a new interval
        this.generateInterval();
        this.answerVisible = false
      } else {
        this.answerVisible = true
        // Show the answer
      }
    },    
    toggleMode() {
      this.useLetters = !this.useLetters;
      this.setQuestion()
    },
    toggleSettings() {
      this.settingsVisible = !this.settingsVisible;
    }
    
  },
  mounted() {
    this.generateInterval(); // Generate the first interval on mount
  }
};
</script>

