<template>
  <div class="create-quiz-container">
    <AppHeader />

    <div class="results-wrapper" v-if="currentLobby">
      <h2 class="section-title">{{ getLabel('resultTitle', 'Final Results') }}</h2>
      
      <div class="player-list">
        <div class="player-rank-item" v-for="(player, idx) in players" :key="player.id">
          
          <div class="rank-medal" :class="getRankClass(idx)">
            {{ idx + 1 }}
          </div>
          
          <div class="player-info">
            <span class="player-name">{{ player.namn }}</span>
            <span class="player-points">
              {{ player.points }} {{ getLabel('resultPoints', 'Points') }}
            </span>
          </div>

        </div>
      </div>
      
      <div class="button-row">
        <button class="action-btn secondary-action-btn" @click="goHome">
          {{ getLabel('resultGoHome', 'Go Home') }}
        </button>
        <button class="action-btn primary-action-btn" @click="showAnswers">
          {{ getLabel('resultShowAnswers', 'Show Answers') }}
        </button>
        <button class="action-btn primary-action-btn" @click="playAgain">
          {{ getLabel('resultPlayAgain', 'Play Again') }}
        </button>
      </div>
      
    </div>

    <div class="results-wrapper" v-else>
      <h2 class="section-title">{{ getLabel('resultUnavailableTitle', 'Results Unavailable') }}</h2>
      <p>{{ getLabel('lobbyNotFound', 'Lobby not found.') }}</p>
      <div class="button-row">
        <button class="action-btn primary-action-btn" @click="goHome">
          {{ getLabel('resultGoHome', 'Go Home') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue';
import { getLobby, fetchLobby } from '@/stores/lobbyStore.js'; 
import { computed } from 'vue';
import { getLabel } from '@/stores/uiStore';


export default {
  name: 'ResultView',
  components: { AppHeader },
  data() {
    return {
      lobbyId: null,
    }
  },
  computed: {
    currentLobby() {
        return getLobby(this.lobbyId);
    },
    players() {
  const lobby = this.currentLobby;
  if (!lobby) return [];
  return (lobby.players || [])
    .map(p => ({ id: p.id, namn: p.name, points: p.points || 0 }))
    .sort((a, b) => b.points - a.points);
}
  },
  created() {
    this.lobbyId = this.$route.query.lobby || this.$route.params.id || null;
    if (this.lobbyId) {
      fetchLobby(this.lobbyId).catch((err) => {
        console.warn('Failed to load lobby results', err);
      });
    }
  },
  methods:{
    getLabel,
    getRankClass(index) {
      if (index === 0) return 'rank-1'; // Gold
      if (index === 1) return 'rank-2'; // Silver
      if (index === 2) return 'rank-3'; // Bronze
      return 'rank-default';
    },
    
    goHome() {
      console.log('Sending back to homepage:');
      this.$router.push('/');
    },

    showAnswers() {
      console.log(`Sending command: Show Answers for Lobby ${this.lobbyId}`);
    },
    
    playAgain() {
      console.log(`Sending command: Play Again for Lobby ${this.lobbyId}`);
      this.$router.push('/play');
    }
  }
}
</script>

<style scoped>
.create-quiz-container {
  background-color: var(--bg);
  min-height: 100vh;
  padding: 3rem 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-header {
    text-align: center;
    margin-bottom: 2rem;
    width: 100%;
}
.logo-title {
    font-size: 5rem;
    font-weight: 900;
    color: var(--primary);
    letter-spacing: -0.05em;
    text-transform: uppercase;
    margin: 0 auto;
}

/* results */
.results-wrapper {
    background-color: var(--surface);
    border-radius: 12px;
    padding: 2.5rem;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
    max-width: 600px;
    width: 100%;
    margin-top: 20px;
}

.section-title {
    font-size: 2.5rem;
    text-align: center;
    color: var(--primary);
    margin-bottom: 2.5rem;
    font-weight: 800;
}

/* Player list*/
.player-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.player-rank-item {
    background-color: #f8f8f8;
    border-radius: 15px;
    padding: 15px 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

.player-info {
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.player-name {
    font-size: 1.3rem;
    font-weight: 600;
}

.player-points {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text);
}

/* Medal styling */
.rank-medal {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 800;
    font-size: 1.2rem;
    box-shadow: 0 3px 5px rgba(0,0,0,0.3);
    color: var(--text);
}

/* Gold */
.rank-1 {
    background: linear-gradient(145deg, #FFD700, #FFA500); 
}

/* Silver  */
.rank-2 {
    background: linear-gradient(145deg, #C0C0C0, #A9A9A9); 
}

/* Bronze  */
.rank-3 {
    background: linear-gradient(145deg, #CD7F32, #B87333); 
    color: #fff; 
}

/* Other Ranks */
.rank-default {
    background-color: #E0E0E0;
    color: #666;
    box-shadow: none;
}

/* Buttons */
.button-row {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 3rem;
}

.action-btn {
  padding: 0.9rem 1.6rem;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.primary-action-btn {
  background: var(--primary);
  color: var(--bg);
}

.primary-action-btn:hover {
  transform: translateY(-1px);
  background: var(--primary-dark);
  box-shadow: 0 10px 20px rgba(128, 200, 96, 0.28);
}

.secondary-action-btn {
  background-color: transparent;
  color: var(--text);
  border: 2px solid var(--primary);
  box-shadow: none;
}

.secondary-action-btn:hover{
  background-color: var(--primary-soft-strong);
  transform: translateY(-1px);
}
</style>
