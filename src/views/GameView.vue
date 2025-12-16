<template>
   <header class="app-header">
      <h1 class="logo-title">
        <span class="logo-short">TJ</span>
        <span class="logo-full">TOAJMGUÄSSÄR</span>
      </h1>
    </header>

  <!--meny från micke
  <ResponsiveNav v-bind:hideNav="hideNav">
    <button v-on:click="switchLanguage">
      {{ uiLabels.changeLanguage }}
    </button>
    <router-link to="/create/"> 
      {{ uiLabels.createPoll }}
    </router-link>
    <a href="">
      {{ uiLabels.about }}
    </a>
    <a href="">FAQ</a>
  </ResponsiveNav>
  meny från micke-->

 <!-- <h1>{{ uiLabels.heading }}</h1>
  <h2>{{ uiLabels.subHeading }}</h2>
  <label>
    Write poll id:
    <input type="text" v-model="newPollId">
  </label>
  <router-link v-bind:to="'/lobby/' + newPollId">
    {{ uiLabels.participatePoll }}
  </router-link> -->

  <main class="layout">
    <!-- Vänster panel: år -->
    <aside class="sidebar">
        <h2>Bild</h2>
        <img :src="currentQuestion.imageUrl" :alt="currentQuestion.prompt" class="picture"/>
        <!---<img src="https://images.citybreakcdn.com/image.aspx?ImageId=8661679" class="picture"/>-->
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

        <div class="slider-block">
          <SliderComponent
            v-model="yearGuess"
            :min="minYear"
            :max="maxYear"
            :step="1"
            label="Year"
          />
        </div>

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
import SliderComponent from '@/components/SliderComponent.vue';
import io from 'socket.io-client';
import quizesData from '../../server/data/quizes.json';
import { getLobby, submitGuess as submitGuessToStore } from '@/stores/lobbyStore';
const socket = io("localhost:3000");

export default {
  name: 'GameView',
  components: { ResponsiveNav, LeafletMap, SliderComponent },
  data() {
    const quiz = quizesData.quizes && quizesData.quizes[0] ? quizesData.quizes[0] : { questions: [] };
    const firstQuestion = quiz.questions[0] || { year: 1960, location: { lat: 54, lng: 15 } };
    return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      lobbyId: '',
      playerId: null,
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
    },
    lobby() {
      return this.lobbyId ? getLobby(this.lobbyId) : null;
    },
    playerName() {
      return this.lobby?.players?.find((p) => p.id === this.playerId)?.name || `Player ${this.playerId || ''}`;
    }
  },
  created() {
    this.lobbyId = this.$route.query.lobby || '';
    this.playerId = Number(this.$route.query.player) || null;
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
      if (!this.lobbyId || !this.playerId) {
        alert('Missing lobby or player information.');
        return;
      }
      try {
        submitGuessToStore(this.lobbyId, {
          playerId: this.playerId,
          lat: this.playerGuess.lat,
          lng: this.playerGuess.lng,
          year: this.yearGuess,
          name: this.playerName,
        });
        alert(
          `Guess sent: ${this.playerGuess.lat.toFixed(3)}, ${this.playerGuess.lng.toFixed(
            3
          )} • Year: ${this.yearGuess}`
        );
      } catch (err) {
        alert(err.message || 'Failed to submit guess.');
      }
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

.map-container {
  height: 400px;
  width: 100%;
}

.map-container :deep(.leaflet-container) {
  height: 100%;
  width: 100%;
}

.slider-block {
  margin-top: 1rem;
}

.submit-button {
  margin-top: 1rem;
  width: 100%;
  padding: 0.9rem 1.2rem;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  background: #ea3e34;
  color: #fefcef;
  box-shadow: 0 8px 16px rgba(234, 62, 52, 0.25);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.submit-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.submit-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(234, 62, 52, 0.32);
}

/* Responsiv fix */
@media (max-width: 60em) {
    .layout {
        grid-template-columns: 1fr;
    }

  }

</style>
