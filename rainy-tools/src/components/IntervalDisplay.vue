<template>
  <div class="interval-display-content">
    <h2>What's the interval?</h2>

    <button class="mode-toggle" @click="toggleMode">
      {{ useLetters ? 'Letters'  :'Solfège' }}
    </button>

    <p>{{ intervalQuestion }}</p>
    


    <button @click="toggleAnswer">{{ answerVisible ? 'Next Interval' : 'Reveal Answer' }}</button>
    
    <p v-if="answerVisible">{{ intervalAnswer }}</p>


  </div>
</template>

<style scoped>


h2{
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

.mode-toggle {
  position: absolute; /* Position the button absolutely within the parent */
  top: -1rem;         /* Distance from the top */
  right: 0rem;       /* Distance from the right */
  padding: 0.5rem;   /* Add some padding */
  border-color: #37c07b73;      /* Remove default border */
  border-radius: 50%; /* Make the button round */
  background-color: #11a00473; /* Background color */
  color: white;      /* Text color */
  font-size: 1rem;   /* Font size */
  cursor: pointer;    /* Change cursor on hover */
  transition: background-color 0.5s; /* Smooth transition for hover effect */
  width: 80px;
}

.mode-toggle:hover {
  background-color: #00610573; /* Darken the background on hover */
}

p {
  font-size: 1.2rem;
}

.interval-display-content {
  min-height: 220px;
  min-width: 370px;
  position: relative; /* Set position relative for absolute positioning of the toggle button */
  padding: 1rem; /* Add some padding to avoid content touching edges */
}
</style>


<script>

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
      useLetters: true   // Default to Letters checked
    };
  },
  methods: {
    generateInterval() {
      // Generate two random notes
      this.firstNote = this.notes[Math.floor(Math.random() * this.notes.length)];
      this.secondNote = this.notes[Math.floor(Math.random() * this.notes.length)];
      this.ascending = Math.random() < 0.5;

      // Generate interval question string
      this.setQuestion()

      // Calculate chromatic interval
      const chromaticInterval = this.ascending
        ? (((this.secondNote.chromaticKey - this.firstNote.chromaticKey) % 12 + 12) % 12)
        : (((this.firstNote.chromaticKey - this.secondNote.chromaticKey) % 12 + 12) % 12);

      // Calculate diatonic interval
      this.noteDistance = this.ascending
        ? (this.notes.indexOf(this.firstNote) - this.notes.indexOf(this.secondNote) %7 +7) %7
        : (this.notes.indexOf(this.secondNote) - this.notes.indexOf(this.firstNote) %7 +7) %7


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
    
  },
  mounted() {
    this.generateInterval(); // Generate the first interval on mount
  }
};
</script>

