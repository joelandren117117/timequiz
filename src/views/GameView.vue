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
        <div class="game-status error" v-if="!lobby">
          Lobby not found.
        </div>
        <div class="game-status done" v-else-if="isFinished">
          Game finished. Thanks for playing!
          <button class="results-btn" @click="goToResults">View Results</button>
        </div>
        <div class="game-status waiting" v-else-if="!isGameActive">
          Waiting for host to start the game...
        </div>

        <p class="question-progress" v-if="questionCount">
          Question {{ questionNumber }} of {{ questionCount }}
        </p>

        <div class="map-container ">
        <LeafletMap
          :center="mapCenter"
          :zoom="4"
          :clickable="isGameActive"
          :allowGuessMarker="isGameActive"
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
            :disabled="!isGameActive || isFinished"
          />
          <div class="year-guess__scale">
            <span>{{ minYear }}</span>
            <span>{{ maxYear }}</span>
          </div>
        </div>
  
        <button
          class="submit-button"
          :disabled="!playerGuess || !isGameActive || isFinished"
          @click="submitGuess"
        >
          Make My Guess
        </button>

        <p v-if="feedback" class="feedback">{{ feedback }}</p>
      </section>
</main>

</template>

<script>
import LeafletMap from '@/components/LeafletMap.vue';
import quizesData from '../../server/data/quizes.json';
import socket from '@/services/socketService';
import { fetchLobby, getLobby, submitGuess } from '@/stores/lobbyStore';

const fallbackQuestion = {
  imageUrl: '',
  prompt: '',
  year: 1960,
  location: { lat: 54, lng: 15 },
};

export default {
  name: 'GameView',
  components: { LeafletMap },
  data() {
    return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      yearGuess: 1900,
      feedback: null,
      minYear: 1900,
      maxYear: 2025,
      playerGuess: null,
      hasSubmitted: false,
      hideNav: true
    };
  },
  computed: {
    lobbyId() {
      return this.$route.query.lobby;
    },
    playerId() {
      return Number(this.$route.query.player);
    },
    lobby() {
      return getLobby(this.lobbyId);
    },
    quizId() {
      return this.lobby?.quizId || this.$route.query.quiz;
    },
    quiz() {
      return (
        quizesData.quizes?.find((q) => q.id === this.quizId) ||
        quizesData.quizes?.[0] ||
        { questions: [] }
      );
    },
    currentQuestionIndex() {
      return this.lobby?.currentQuestionIndex ?? 0;
    },
    currentQuestion() {
      return this.quiz?.questions?.[this.currentQuestionIndex] || fallbackQuestion;
    },
    questionCount() {
      return this.quiz?.questions?.length ?? 0;
    },
    questionNumber() {
      return this.currentQuestionIndex + 1;
    },
    isLastQuestion() {
      return this.questionCount > 0 && this.currentQuestionIndex >= this.questionCount - 1;
    },
    mapCenter() {
      return this.currentQuestion.location
        ? [this.currentQuestion.location.lat, this.currentQuestion.location.lng]
        : [54, 15];
    },
    isGameActive() {
      return this.lobby?.status === 'started';
    },
    isFinished() {
      return this.lobby?.status === 'finished';
    }
  },
  created() {
    socket.on("uiLabels", labels => this.uiLabels = labels);
    socket.emit("getUILabels", this.lang);
  },
  watch: {
    lobbyId: {
      handler(newId) {
        if (!newId) return;
        fetchLobby(newId).catch((err) => {
          console.warn("Failed to load lobby", err);
        });
      },
      immediate: true
    },
    currentQuestionIndex: {
      handler() {
        this.playerGuess = null;
        this.hasSubmitted = false;
        this.feedback = null;
        if (this.currentQuestion?.year) {
          this.yearGuess = this.currentQuestion.year;
        }
      },
      immediate: true
    },
    isFinished: {
      handler(isFinished) {
        if (isFinished) {
          this.feedback = null;
        }
      }
    }
  },
  methods: {
    onPlayerMapClick(payload) {
      if (!this.isGameActive || this.isFinished) return;
      this.playerGuess = payload;
    },
<<<<<<< HEAD
    submitGuess() {
      if (!this.playerGuess) return;
      console.log('Submitting guess:', this.playerGuess, 'year', this.yearGuess);
      alert(`Guess sent:
Location: ${this.playerGuess.lat.toFixed(3)}, ${this.playerGuess.lng.toFixed(3)}
Year: ${this.yearGuess}`);
socket.emit('playerGuess', {
        pollId,
        playerId,
        name: this.$route.query.name || null,
        lat: this.playerGuess.lat,
        lng: this.playerGuess.lng,
        year: this.yearGuess
      });
    
=======
    async submitGuess() {
      if (!this.playerGuess || !this.isGameActive || this.isFinished) return;
      try {
        await submitGuess(this.lobbyId, {
          playerId: this.playerId,
          lat: this.playerGuess.lat,
          lng: this.playerGuess.lng,
          year: this.yearGuess,
        });
        this.hasSubmitted = true;
        this.feedback = this.isLastQuestion
          ? null
          : "Guess submitted! Waiting for next question.";
      } catch (err) {
        this.feedback = err.message || "Failed to submit guess.";
      }
    },
    goToResults() {
      this.$router.push({
        path: '/result',
        query: {
          lobby: this.lobbyId,
          quiz: this.quizId,
        },
      });
>>>>>>> ea3d2b26bb8beb822697febf4b3630ad9a38112e
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
  .game-status {
    margin-bottom: 0.75rem;
    padding: 0.6rem 0.9rem;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.95rem;
  }
  .game-status.waiting {
    background: rgba(234, 179, 8, 0.12);
    color: #fde68a;
    border: 1px solid rgba(234, 179, 8, 0.4);
  }
  .game-status.done {
    background: rgba(34, 197, 94, 0.12);
    color: #86efac;
    border: 1px solid rgba(34, 197, 94, 0.4);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }
  .game-status.error {
    background: rgba(239, 68, 68, 0.12);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.4);
  }
  .question-progress {
    margin: 0 0 0.75rem;
    color: #e5e7eb;
    font-weight: 600;
  }
  .feedback {
    margin-top: 0.75rem;
    color: #a5f3fc;
    font-weight: 600;
  }
  .results-btn {
    background: #22c55e;
    color: #0f172a;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
    font-weight: 700;
    cursor: pointer;
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
  color: white;
  font-variant-numeric: tabular-nums;
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 10px;
  margin: 0.65rem 0 0.35rem;
  border-radius: 999px;
  background: red;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #0f172a;
  border: 3px solid white;
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
  border: 3px solid white;
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
  background: green;
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
