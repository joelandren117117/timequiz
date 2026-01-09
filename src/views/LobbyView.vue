<template>
  <div class="lobby-shell">
  <div class="wrapper">
    <AppHeader />
    <div class="lobby-card" v-if="lobby">

      <header class="lobby-header">
        <div>
          <p class="eyebrow">{{ getLabel('lobbyIdLabel', 'Lobby ID') }}</p>
          <h1 class="lobby-id">{{ lobby.id }}</h1>
        </div>
        <span class="badge">
          {{ lobby.status === 'started' ? getLabel('lobbyStatusStarted', 'Started') : getLabel('lobbyStatusWaiting', 'Waiting') }}
        </span>
      </header>

      <section class="players">
        <h2>{{ getLabel('lobbyPlayers', 'Players') }} ({{ lobby.players.length }}/5)</h2>
        <div class="host-row">
          <span class="name">{{ lobby.host.name }}</span>
          <span class="role">{{ getLabel('lobbyHostRole', 'Host') }}</span>
        </div>
        <ul>
          <li
            v-for="player in lobby.players"
            :key="player.id"
          >
            <span class="name">{{ player.name }}</span>
            <span class="role">{{ getLabel('lobbyPlayerRole', 'Player') }}</span>
          </li>
        </ul>
      </section>

      <footer class="actions">
        <button
          v-if="isHost"
          class="cta"
          :disabled="lobby.players.length < 1 || lobby.status === 'started'"
          @click="startGame"
        >
          {{ getLabel('lobbyStartGame', 'Start Game') }}
        </button>
        <button
          v-else
          class="cta ghost btn-thirdary"
          :disabled="lobby.status !== 'started'"
          @click="goToGame"
        >
          {{ getLabel('lobbyGoToGame', 'Go to Game') }}
        </button>
      </footer>
    </div>

    <div v-else class="lobby-missing">
      <p>{{ getLabel('lobbyNotFound', 'Lobby not found.') }}</p>
      <router-link to="/play">{{ getLabel('lobbyBackToPlay', 'Back to Play') }}</router-link>
    </div>
  </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import { getLobby, startLobby, fetchLobby } from '@/stores/lobbyStore';
import { getLabel } from '@/stores/uiStore';

const route = useRoute();
const router = useRouter();

const lobbyId = computed(() => route.query.lobby);
const playerId = computed(() => Number(route.query.player));

const lobby = computed(() => getLobby(lobbyId.value));
const isHost = computed(() => playerId.value === 1);

const goToGame = () => {
  if (!lobby.value) return;
  const nextQuery = {
    ...route.query,
    quiz: lobby.value?.quizId || route.query.quiz,
  };
  router.push({ path: isHost.value ? '/host' : '/game', query: nextQuery });
};

const startGame = async () => {
  if (!lobby.value) return;
  try {
    await startLobby(lobby.value.id);
    goToGame();
  } catch (err) {
    console.warn('Failed to start lobby', err);
  }
};

// Auto-route non-hosts when host starts
watch(
  () => lobby.value?.status,
  (status) => {
    if (status === 'started' && !isHost.value) {
      goToGame();
    }
  }
);

onMounted(() => {
  if (lobbyId.value) {
    fetchLobby(lobbyId.value).catch((err) => {
      console.warn('Failed to load lobby', err);
    });
  }
});

watch(lobbyId, (id) => {
  if (id) {
    fetchLobby(id).catch((err) => {
      console.warn('Failed to load lobby', err);
    });
  }
});
</script>

<style scoped>
.lobby-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
  padding: 2rem;
}

.lobby-card {
  width: 500px;
  max-width: 80vw;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  padding: 1.5rem;
  display: grid;
  gap: 1.25rem;
}

.lobby-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.lobby-id {
  margin: 0;
  font-size: 2rem;
  letter-spacing: 0.08em;
}

.badge {
  background: #e5e7eb;
  color: #374151;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
}

.players h2 {
  margin: 0 0 0.5rem 0;
}

.players ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.host-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
  background: #fff;
  margin-bottom: 0.5rem;
}

.players li {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fafafa;
}

.name {
  font-weight: 600;
}

.role {
  color: #6b7280;
  font-size: 0.95rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cta {
  padding: 0.85rem 1.4rem;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  background: var(--primary-dark);
  color: #fff;
  transition: transform 0.1s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.cta.ghost {
  background: #fff;
  color: var(--primary-dark-dark);
  border: 1px solid var(--primary-dark-dark);
}

.cta:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.cta:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px var(--primary-dark-dark);
}

.lobby-missing {
  text-align: center;
  color: #374151;
}

.wrapper {
  display: flex;
  flex-direction: row;   
  gap: 1rem;
  display:flex;
}

@media (max-width: 900px) {
  .wrapper {
    flex-direction: column;
  }
}

</style>
