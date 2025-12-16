<template>
   <header class="app-header">
      <h1 class="logo-title">
        <span class="logo-short">TJ</span>
        <span class="logo-full">TOAJMGUÄSSÄR</span>
      </h1>
    </header>

  <main class="layout">
    <!-- Vänster panel: år -->
    <aside class="sidebar">
        <h2>Bild</h2>
        <img :src="currentQuestion.imageUrl" :alt="currentQuestion.prompt" class="picture"/>
    </aside>

    <section class="map-section">
        <h2>Player Guess Map</h2>
        <div class="map-container ">
        <LeafletMap
          :center="initialCenter"
          :zoom="4"
          clickable
          allowGuessMarker
          :guessMarker="playerGuess"
          @map-click="onPlayerMapClick"
        />
        </div>
        
        <p class="map-info">
          Current guess:
          <span v-if="playerGuess">
            {{ playerGuess.lat.toFixed(3) }}, {{ playerGuess.lng.toFixed(3) }}
          </span>
          <span v-else>Click on the map to make a guess.</span>
        </p>

        <div class="year-guess">
          <div class="year-guess__label">
            <span>Year guess</span>
            <strong>{{ yearGuess }}</strong>
          </div>
          <input
            type="range"
            :min="minYear"
            :max="maxYear"
            v-model.number="yearGuess"
            class="slider"
          />
          <div class="year-guess__scale">
            <span>{{ minYear }}</span>
            <span>{{ maxYear }}</span>
          </div>
        </div>
  
        <button
          class="submit-button"
          :disabled="!playerGuess"
          @click="submitGuess"
        >
          Make My Guess
        </button>
      </section>
</main>

</template>

<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';
import LeafletMap from '@/components/LeafletMap.vue';
import io from 'socket.io-client';
import quizesData from '../../server/data/quizes.json';
const socket = io("localhost:3000");

export default {
  name: 'GameView',
  components: { ResponsiveNav, LeafletMap },
  data() {
    const quiz = quizesData.quizes && quizesData.quizes[0] ? quizesData.quizes[0] : { questions: [] };
    const firstQuestion = quiz.questions[0] || { year: 1960, location: { lat: 54, lng: 15 } };
    return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      quiz,
      qIndex: 0,
      yearGuess: firstQuestion.year || 1960,
      feedback: null,
      minYear: 1900,
      maxYear: 2025,
      initialCenter: firstQuestion.location ? [firstQuestion.location.lat, firstQuestion.location.lng] : [54, 15],
      playerGuess: null,
      hideNav: true
    };
  },
  computed: {
    currentQuestion() {
      return (this.quiz && this.quiz.questions && this.quiz.questions[this.qIndex]) || { imageUrl: '', prompt: '', year: 1960, location: { lat: 54, lng: 15 } };
    }
  },
  created() {
    socket.on("uiLabels", labels => this.uiLabels = labels);
    socket.emit("getUILabels", this.lang);
  },
  methods: {
    onPlayerMapClick(payload) {
      // förväntar { lat, lng }
      this.playerGuess = payload;
    },
    submitGuess() {
      if (!this.playerGuess) return;
      console.log('Submitting guess:', this.playerGuess, 'year', this.yearGuess);
      alert(`Guess sent:
Location: ${this.playerGuess.lat.toFixed(3)}, ${this.playerGuess.lng.toFixed(3)}
Year: ${this.yearGuess}`);
    },
    switchLanguage() {
      this.lang = this.lang === 'en' ? 'sv' : 'en';
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    },
    toggleNav() {
      this.hideNav = !this.hideNav;
    }
  }
};
</script>
<style scoped>
.app-header {
  grid-area: header;
  margin-bottom: 1rem;
}

.logo-title {
  font-size: 5rem;
  font-weight: 900;
  color: var(--primary);
  letter-spacing: -0.05em;
  text-transform: uppercase;
  margin: 0;
}

@media screen and (max-width:50em) {
  .logo {
    font-size: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}


/* === Layouten runt kartan och deltagare === */
.layout {
    display: grid;
    grid-template-columns: 50% 50%;
    gap: 2em;
    padding: 2em;
}

/* === Vänster sida: deltagare === */
.sidebar {
    background: lightblue;
    padding: 2em;
    border-radius: 1em;
}

.picture {
    width: 100%;
    border-radius: 1em;
    display: block;
}

/* === Höger sida: karta === */
.map-section {
    background: #18181b;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  .map-container{
    height: 400px;
    width: 100%;
  }
  .map-container :deep(.leaflet-container) {
  height: 100%;
  width: 100%;
}

#map {
    width: 100%;
    height: 30em;
    background: red;
    border-radius: 1em;
}

.year-guess {
  margin: 1rem 0 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: #e5e7eb;
}

.year-guess__label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}

.year-guess__label strong {
  font-size: 1.2rem;
  color: #fde68a;
  font-variant-numeric: tabular-nums;
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 10px;
  margin: 0.65rem 0 0.35rem;
  border-radius: 999px;
  background: linear-gradient(90deg, #6366f1, #22d3ee);
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #0f172a;
  border: 3px solid #22d3ee;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 18px rgba(34, 211, 238, 0.35);
}

.slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #0f172a;
  border: 3px solid #22d3ee;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 18px rgba(34, 211, 238, 0.35);
}

.year-guess__scale {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #9ca3af;
}

.submit-button {
  width: 100%;
  padding: 0.9rem 1rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(120deg, #22d3ee, #6366f1 55%, #a855f7);
  color: #0b1021;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.35);
  transition: transform 0.12s ease, box-shadow 0.15s ease, filter 0.15s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 38px rgba(168, 85, 247, 0.35);
  filter: brightness(1.02);
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  box-shadow: none;
}

/* Responsiv fix */
@media (max-width: 60em) {
    .layout {
        grid-template-columns: 1fr;
    }

    #map {
        height: 30em;
    }
}

</style>
