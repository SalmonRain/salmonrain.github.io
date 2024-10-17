<template>
  <div>
    <h2>Current Interval: {{ interval }}</h2>
  </div>
</template>


<script>
export default {
  name: 'YourComponent',
  data() {
    return {
      notes: [
        { letter: 'A', solfege: 'La', chromaticKey: 0 },
        { letter: 'B', solfege: 'Si', chromaticKey: 2 },
        { letter: 'C', solfege: 'Do', chromaticKey: 3 },
        { letter: 'D', solfege: 'Re', chromaticKey: 5 },
        { letter: 'E', solfege: 'Me', chromaticKey: 7 },
        { letter: 'F', solfege: 'Fa', chromaticKey: 8 },
        { letter: 'G', solfege: 'Sol', chromaticKey: 10 }
      ],
      intervalQuestion : ""
      intervalAnswer : ""
    };
  },
  methods: {
    getRandomInterval() {

      var first_note = this.notes[Math.floor(Math.random() * this.notes.length)]
      var second_note = this.notes[Math.floor(Math.random() * this.notes.length)]
      var going_up = Math.random() < 0.5;
      var direction = going_up ? "up" : "down"

      var resultString = `From ${first_note.letter} ${direction} to ${second_note.letter}`;
      var chromaticInterval = going_up ? 
        (((second_note.chromaticKey - first_note.chromaticKey) % 12 + 12) % 12) : (((first_note.chromaticKey - second_note.chromaticKey) % 12 + 12) % 12)

      this.intervalQuestion = resultString
      this.intervalAnswer = this.determineIntervalQuality
    }

    determineIntervalQuality(chromaticSteps) {
      switch (chromaticSteps) {
      case 0: return 'Perfect Unison'; // Same note
      case 1: return 'Minor Second';
      case 2: return 'Major Second';
      case 3: return 'Minor Third';
      case 4: return 'Major Third';
      case 5: return 'Perfect Fourth';
      case 6: return 'Tritone | Diminished Fifth | Augmented Fourth';
      case 7: return 'Perfect Fifth';
      case 8: return 'Minor Sixth'; // Ascending
      case 9: return 'Major Sixth';  // Ascending
      case 10: return 'Minor Seventh'; // Ascending
      case 11: return 'Major Seventh'; // Ascending
      case 12: return 'Perfect Octave'; // Ascending
      default: return 'Unknown Interval';
    }

  }
};
}
</script>


<style scoped>
.item {
  margin-top: 2rem;
  display: flex;
  position: relative;
}

.details {
  flex: 1;
  margin-left: 1rem;
}

i {
  display: flex;
  place-items: center;
  place-content: center;
  width: 32px;
  height: 32px;

  color: var(--color-text);
}

h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: var(--color-heading);
}

@media (min-width: 1024px) {
  .item {
    margin-top: 0;
    padding: 0.4rem 0 1rem calc(var(--section-gap) / 2);
  }

  i {
    top: calc(50% - 25px);
    left: -26px;
    position: absolute;
    border: 1px solid var(--color-border);
    background: var(--color-background);
    border-radius: 8px;
    width: 50px;
    height: 50px;
  }

  .item:before {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    bottom: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:after {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    top: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:first-of-type:before {
    display: none;
  }

  .item:last-of-type:after {
    display: none;
  }
}
</style>
