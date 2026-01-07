<template>
  <div class="game-container">
    <header class="app-header">
      <h1 class="logo-title">
        <span class="logo-short">TJ</span>
        <span class="logo-full">TOAJMGUÄSSÄR</span>
      </h1>
    </header>

    <main class="layout">
      <!-- Left panel: image -->
      <aside class="card sidebar">
        <h2 class="card-title">Bild</h2>
        <img :src="currentQuestion.imageUrl" :alt="currentQuestion.prompt" class="picture" />
      </aside>

      <section class="card map-section">
        <h2 class="card-title">Player Guess Map</h2>
        <div class="game-status error" v-if="!lobby">
          Lobby not found.
        </div>
        <div class="game-status done" v-else-if="isFinished">
          Game finished. Thanks for playing!
          <button class="btn btn-secondary results-btn" @click="goToResults">View Results</button>
        </div>
        <div class="game-status waiting" v-else-if="!isGameActive">
          Waiting for host to start the game...
        </div>

        <p class="question-progress" v-if="questionCount">
          Question {{ questionNumber }} of {{ questionCount }}
        </p>

        <div class="map-container">
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
          class="btn btn-primary submit-button"
          :disabled="!playerGuess || !isGameActive || isFinished"
          @click="submitGuess"
        >
          Make My Guess
        </button>

        <p v-if="feedback" class="feedback">{{ feedback }}</p>
      </section>
    </main>
  </div>
</template>

<script>
import LeafletMap from '@/components/LeafletMap.vue';
import socket from '@/services/socketService';
import { fetchLobby, getLobby, submitGuess } from '@/stores/lobbyStore';
import { quizState, fetchQuizes } from '@/stores/quizStore';

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
        quizState.quizes?.find((q) => q.id === this.quizId) ||
        quizState.quizes?.[0] ||
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
    fetchQuizes().catch((err) => {
      console.warn("Failed to load quizzes", err);
    });
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

.game-container {
  background-color: var(--bg);
  min-height: 100vh;
  padding: 3rem 2rem;
  color: var(--text);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.layout {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 2rem;
  align-items: start;
}

.card {
  background-color: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(128, 200, 96, 0.28);
  text-align: left;
}

.card-title {
  margin: 0 0 1rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
}

.picture {
  width: 100%;
  border-radius: 12px;
  display: block;
  border: 1px solid rgba(41, 77, 25, 0.15);
}

.game-status {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  background: var(--primary-soft);
  border: 1px solid rgba(41, 77, 25, 0.18);
  color: var(--primary-dark-dark);
}

.game-status.waiting {
  color: var(--primary-dark);
}

.game-status.done {
  background: var(--primary-soft-strong);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.game-status.error {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.25);
  color: #b91c1c;
}

.question-progress {
  margin: 0 0 1rem;
  font-weight: 600;
}

.map-container {
  height: 420px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(41, 77, 25, 0.18);
}

.map-container :deep(.leaflet-container) {
  height: 100%;
  width: 100%;
}

.map-info {
  margin: 0.75rem 0 0;
  font-size: 0.95rem;
}

.year-guess {
  margin: 1.2rem 0 1rem;
  background: var(--primary-soft);
  border: 1px solid rgba(41, 77, 25, 0.18);
  border-radius: 12px;
  padding: 0.9rem 1rem;
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
  color: var(--primary);
  font-variant-numeric: tabular-nums;
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 10px;
  margin: 0.65rem 0 0.35rem;
  border-radius: 999px;
  background: var(--primary-soft-strong);
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--surface);
  border: 3px solid var(--primary);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.06);
  box-shadow: 0 8px 18px rgba(128, 200, 96, 0.22);
}

.slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--surface);
  border: 3px solid var(--primary);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.06);
  box-shadow: 0 8px 18px rgba(128, 200, 96, 0.22);
}

.year-guess__scale {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: rgba(29, 28, 27, 0.7);
}

.submit-button {
  width: 100%;
  display: block;
}

.results-btn {
  padding: 0.45rem 0.9rem;
}

.feedback {
  margin-top: 0.9rem;
  color: var(--primary-dark);
  font-weight: 700;
}

.submit-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 60em) {
  .game-container {
    padding: 2rem 1.25rem;
  }

  .layout {
    grid-template-columns: 1fr;
  }

  .map-container {
    height: 380px;
  }
}

</style>
