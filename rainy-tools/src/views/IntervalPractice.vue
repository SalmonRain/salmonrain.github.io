<script setup lang="ts">
import IntervalDisplay from '../components/IntervalDisplay.vue'
</script>

<template>
  <main class="interval-practice-container">
    <IntervalDisplay />
  </main>
</template>

<style scoped>
.interval-practice-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  vertical-align: top;
}

h1 {
  margin-bottom: 20px;
}

</style>
