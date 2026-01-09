<template>
  <AppHeader />

  <main class="layout" v-if="lobby">
    <div class="host-banner finished" v-if="isFinished">
      <span>{{ getLabel('hostGameFinished', 'Game finished.') }}</span>
      <button class="host-banner-btn" @click="goToResults">
        {{ getLabel('hostViewResults', 'View Results') }}
      </button>
    </div>
    <!-- Left column: host controls + participants -->
    <div class="left-column">
      <section class="host-box">
        <div class="host-grid" role="group" aria-label="Host controls">
          <button class="host-btn btn btn-primary" :disabled="!canPrevious" @click="handlePrevious">
            {{ getLabel('hostPrevious', 'Previous') }}
          </button>
          <button class="host-btn btn btn-primary" :disabled="!canNext" @click="handleNext">
            {{ getLabel('hostNext', 'Next') }}
          </button>
          <button class="big-host-btn btn btn-primary" @click="goToResults">
            {{ getLabel('hostEndGame', 'End Game') }}
          </button>
        </div>
      </section>

      <section class="players-box">
        <h2>{{ getLabel('hostPlayersTitle', 'Players') }}</h2>
        <ul class="players">
          <li v-for="player in players" :key="player.id">
            <span class="pname">{{ player.name }}</span>
            <span class="pscore">{{ player.points }} {{ getLabel('pointsShort', 'pts') }}</span>
          </li>
        </ul>
      </section>
    </div>

    <!-- Right column: large map -->
    <section class="map-container">
      <div class="map-wrapper">
        <LeafletMap :center="initialCenter" :zoom="3" :markers="adminMarkers" />
      </div>
      <div class="map-info" v-if="adminMarkers.length">
        <ul class="map-info-list">
          <li v-for="m in adminMarkers" :key="m.id">
            {{ m.label }} – {{ m.lat.toFixed(3) }}, {{ m.lng.toFixed(3) }}
          </li>
        </ul>
      </div>
    </section>
  </main>

  <div v-else class="lobby-missing">
    <p>{{ getLabel('hostLobbyNotFound', 'Lobby not found.') }}</p>
    <router-link to="/play">{{ getLabel('hostBackToPlay', 'Back to Play') }}</router-link>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import LeafletMap from '../components/LeafletMap.vue';
import { getLabel } from '@/stores/uiStore';
import {
  fetchLobby,
  getLobby,
  nextQuestion,
  previousQuestion,
} from '@/stores/lobbyStore';
import { quizState, fetchQuizes } from '@/stores/quizStore';

const route = useRoute();
const router = useRouter();
const lobbyId = computed(() => route.query.lobby);
const lobby = computed(() => getLobby(lobbyId.value));
const quizId = computed(() => lobby.value?.quizId || route.query.quiz);
const quiz = computed(
  () => quizState.quizes?.find((q) => q.id === quizId.value) || null
);
const currentQuestionIndex = computed(
  () => lobby.value?.currentQuestionIndex ?? 0
);
const questionCount = computed(
  () => quiz.value?.questions?.length ?? 0
);
const isFinished = computed(() => lobby.value?.status === 'finished');

const players = computed(() => {
  if (!lobby.value) return [];
  return (lobby.value.players || []).map(p => ({
    id: p.id,
    name: p.name,
    points: p.points || 0,
  }))
  .sort((a, b) => b.points - a.points);
});
const adminMarkers = computed(() =>
  (lobby.value?.guesses || []).map((g) => ({
    id: `g-${g.playerId}`,
    lat: g.lat,
    lng: g.lng,
    label: `${g.name} (${g.year})`,
  }))
);

const initialCenter = [54, 15];

const canPrevious = computed(() => currentQuestionIndex.value > 0);
const canNext = computed(
  () =>
    lobby.value?.status !== 'finished' &&
    (questionCount.value === 0 || currentQuestionIndex.value < questionCount.value)
);

const handlePrevious = async () => {
  if (!lobby.value) return;
  try {
    await previousQuestion(lobby.value.id);
  } catch (err) {
    console.warn('Failed to go to previous question', err);
  }
};

const handleNext = async () => {
  if (!lobby.value) return;
  try {
    await nextQuestion(lobby.value.id);
  } catch (err) {
    console.warn('Failed to go to next question', err);
  }
};

const goToResults = () => {
  if (!lobby.value) return;
  router.push({
    path: '/result',
    query: { lobby: lobby.value.id, quiz: lobby.value.quizId },
  });
};

onMounted(() => {
  fetchQuizes().catch((err) => {
    console.warn('Failed to load quizzes', err);
  });
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

if (!lobby.value) {
  console.warn('Lobby not found');
}
</script>
<style scoped>
@media screen and (max-width:50em) {
  .logo {
    font-size: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}


/* Left column: stacked boxes */
/* Sida */
.host-container {
  background-color: var(--bg);
  min-height: 100vh;
  padding: 3rem 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
}

.layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 2rem;
  align-items: start;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

:deep(.app-header) {
  margin-bottom: 1rem;
}

.host-box,
.players-box,
.map-card {
  background-color: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.host-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.host-action {
  height: 5.25rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.host-end {
  grid-column: span 2;
}

.players {
  list-style: none;
  padding: 0;
  margin: 0;
}

.players li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
  padding: 1rem 1.25rem;
  margin-top: 0.75rem;
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.08);
}

.pname {
  font-weight: 800;
}

.pscore {
  opacity: 0.85;
}

.map-container {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #0f172a;
  border-radius: 0.75rem;
  gap: 0.75rem;
}

.map-wrapper {
  height: 60vh;
  border-radius: 12px;
  border: 2px solid var(--primary);
  overflow: hidden;
  background: #F7FAF5;
}

.map-wrapper :deep(.leaflet-container),
.map-wrapper :deep(.leaflet-map) {
  height: 100%;
  width: 100%;
}

.host-banner {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;

  background: var(--primary-soft-strong);
  border: 2px solid var(--primary);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-weight: 800;
}

.host-banner-btn {
  padding: 0.4rem 0.85rem;
}

/* Responsivt */
@media (max-width: 60em) {
  .layout {
    grid-template-columns: 1fr;
  }
  .map-wrapper {
    height: 50vh;
  }
}
</style>

