<template>
  <div class="timeline-container">
    <h3 class="timeline-title">{{ getLabel('timelineTitle', 'Timeline of Guesses') }}</h3>
    <div class="timeline">
      <!-- Timeline line -->
      <div class="timeline-line"></div>

      <!-- Correct answer marker -->
      <div class="timeline-marker correct-marker" :style="{ left: `${correctPosition}%` }">
        <svg class="pin-icon correct-pin" viewBox="0 0 24 24" width="28" height="28">
          <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="#999999"/>
          <circle cx="12" cy="10" r="2.6" fill="#ffffff"/>
        </svg>
        <span class="marker-label">{{ correctYear }}</span>
      </div>

      <!-- Player guesses -->
      <div
        v-for="guess in sortedGuesses"
        :key="guess.playerId"
        class="timeline-marker player-marker"
        :style="{ left: `${guess.position}%` }"
      >
        <svg class="pin-icon player-pin" viewBox="0 0 24 24" width="28" height="28">
          <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" :fill="guess.playerColor"/>
          <circle cx="12" cy="10" r="2.6" fill="#ffffff"/>
        </svg>
        <span class="marker-label">{{ guess.year }}</span>
      </div>
    </div>

    <!-- Timeline axis -->
    <div class="timeline-axis">
      <span class="axis-label">1900</span>
      <span class="axis-label">2025</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getLabel } from '@/stores/uiStore';

const props = defineProps({
  guesses: {
    type: Array,
    default: () => []
  },
  correctYear: {
    type: Number,
    required: true
  }
});

// Calculate min and max years for the timeline
const years = computed(() => {
  return {
    min: 1900,
    max: 2025
  };
});

const minYear = computed(() => years.value.min);
const maxYear = computed(() => years.value.max);

// Calculate position percentage for each guess
const calculatePosition = (year) => {
  const range = maxYear.value - minYear.value;
  return ((year - minYear.value) / range) * 100;
};

const correctPosition = computed(() => calculatePosition(props.correctYear));

// Sort guesses by year for better visualization
const sortedGuesses = computed(() => {
  return props.guesses
    .map(guess => ({
      ...guess,
      position: calculatePosition(guess.year)
    }))
    .sort((a, b) => a.year - b.year);
});
</script>

<style scoped>
.timeline-container {
  background-color: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  grid-area: timeline;
}

.timeline-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
}

.timeline {
  position: relative;
  height: 60px;
  margin-bottom: 0.5rem;
}

.timeline-line {
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e5e7eb;
}

.timeline-marker {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.pin-icon {
  margin-bottom: 0.25rem;
}

.correct-pin,
.player-pin {
  /* SVG styling handled inline */
}

.marker-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text);
  background-color: var(--surface);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  white-space: nowrap;
}

.timeline-axis {
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
}

.axis-label {
  font-size: 0.8rem;
  color: var(--text-secondary, #666);
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 60em) {
  .timeline-container {
    padding: 1rem;
  }

  .timeline {
    height: 50px;
  }

  .timeline-line {
    top: 25px;
  }

  .pin-icon {
    width: 24px !important;
    height: 24px !important;
  }

  .marker-label {
    font-size: 0.7rem;
  }
}
</style>