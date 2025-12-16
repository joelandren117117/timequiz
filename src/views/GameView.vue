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
  
        <button
          class="submit-button"
          :disabled="!playerGuess"
          @click="submitGuess"
        >
          Submit guess
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
      console.log('Submitting guess:', this.playerGuess);
      alert(`Guess sent: ${this.playerGuess.lat.toFixed(3)}, ${this.playerGuess.lng.toFixed(3)}`);
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
