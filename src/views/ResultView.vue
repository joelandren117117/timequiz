<template>
  <div class="create-quiz-container">
    <header class="app-header">
      <h1 class="logo-title">TIMEGUESSR</h1>
    </header>

    <div class="results-wrapper">
      <h2 class="section-title">Final Results</h2>
      
      <div class="player-list">
        <div class="player-rank-item" v-for="(player, idx) in players" :key="player.id">
          
          <div class="rank-medal" :class="getRankClass(idx)">
            {{ idx + 1 }}
          </div>
          
          <div class="player-info">
            <span class="player-name">{{ player.namn }}</span>
            <span class="player-points">{{ player.points }} Points</span>
          </div>

        </div>
      </div>
      
      <div class="button-row">
        <button class="action-btn secondary-action-btn" @click="goHome">
          Go Home
        </button>
        <button class="action-btn primary-action-btn" @click="showAnswers">
          Show Answers
        </button>
        <button class="action-btn primary-action-btn" @click="playAgain">
          Play Again
        </button>
      </div>
      
    </div>
  </div>
</template>

<script>
import { getLobby } from '@/stores/lobbyStore.js'; 
import { computed } from 'vue';


export default {
  name: 'ResultView',
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

        const participants = [
            { id: lobby.host.id, namn: lobby.host.name, points: lobby.host.points || 0 },
            ...lobby.players.map(p => ({ id: p.id, namn: p.name, points: p.points || 0 }))
        ];

        return participants.sort((a, b) => b.points - a.points);
    }
  },
  created() {
    this.lobbyId = this.$route.params.id;
  },
  methods:{
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
    }
  }
}
</script>

<style scoped>
.create-quiz-container {
  background-color: #FEFCEF;
  min-height: 100vh;
  padding: 3rem 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1D1C1B;
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
    color: #EA3E34;
    letter-spacing: -0.05em;
    text-transform: uppercase;
    margin: 0 auto;
}

/* results */
.results-wrapper {
    background-color: #FFFFFF;
    border-radius: 12px;
    padding: 2.5rem;
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    max-width: 600px;
    width: 100%;
    margin-top: 20px;
}

.section-title {
    font-size: 2.5rem;
    text-align: center;
    color: #EA3E34;
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
    background-color: #F8F8F8;
    border-radius: 15px;
    padding: 15px 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
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
    color: #1D1C1B;
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
    color: #1D1C1B; 
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
    color: #FEFCEF; 
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
  transition: transform 0.1s ease, box-shadow 0.2s ease;
}

.primary-action-btn {
  background: #ea3e34;
  color: #fefcef;
  box-shadow: 0 8px 16px rgba(234, 62, 52, 0.25);
}

.primary-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(234, 62, 52, 0.32);
}

.secondary-action-btn {
  background-color: transparent;
  color: #EA3E34;
  border: 2px solid #EA3E34;
  box-shadow: none;
}

.secondary-action-btn:hover{
  background-color: rgba(234, 62, 52, 0.1);
  transform: translateY(-1px);
}
</style>