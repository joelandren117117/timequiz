<template>
  <div class="host-container">
    <header class="app-header">
      <h1 class="logo-title">
        <span class="logo-short">TJ</span>
        <span class="logo-full">TOAJMGUÄSSÄR</span>
      </h1>
    </header>

    <main class="layout" v-if="lobby">
      <!-- Left column: host controls + participants -->
      <div class="left-column">
        <section class="host-box">
          <div class="host-grid" role="group" aria-label="Host controls">
            <button class="btn btn-secondary host-btn">Previous</button>
            <button class="btn btn-secondary host-btn">Edit players</button>
            <button class="btn btn-secondary host-btn">Back</button>
            <button class="btn btn-secondary host-btn">Next</button>
          </div>
        </section>

        <section class="players-box">
          <h2>Players</h2>
          <ul class="players">
            <li v-for="player in players" :key="player.id">
              <span class="pname">{{ player.name }}</span>
              <span class="pscore">Player</span>
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
      <p>Lobby not found.</p>
      <router-link to="/play">Back to Play</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LeafletMap from '../components/LeafletMap.vue';
import { getLobby } from '@/stores/lobbyStore';

const route = useRoute();
const router = useRouter();

const lobbyId = computed(() => route.query.lobby);
const lobby = computed(() => getLobby(lobbyId.value));

const players = computed(() => lobby.value?.players || []);
const adminMarkers = computed(() =>
  (lobby.value?.guesses || []).map((g) => ({
    id: `g-${g.playerId}`,
    lat: g.lat,
    lng: g.lng,
    label: `${g.name} (${g.year})`,
  }))
);

const initialCenter = [54, 15];

if (!lobby.value) {
  // If no lobby found, you can redirect or show a message
  console.warn('Lobby not found');
}
</script>

<style scoped>
.host-container {
  background-color: var(--bg);
  min-height: 100vh;
  padding: 3rem 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "header"
    "content";
  row-gap: 2rem;
}

.app-header {
  grid-area: header;
}

/* Left column: stacked boxes */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.host-box {
  background-color: var(--surface);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.host-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
}

.host-btn {
  height: 5.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0;
  border-radius: 12px; /* override pill radius from .btn-secondary */
  font-size: 1.05rem;
  font-weight: 800;
}

.players-box {
  background-color: var(--surface);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.players-box h2 {
  margin: 0 0 1rem;
  font-size: 1.2rem;
  letter-spacing: 0.02em;
  color: var(--primary);
}

/* === Layouten runt kartan och deltagare === */
.layout {
  grid-area: content;
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 2rem;
  align-items: flex-start;
}

.players {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.players li {
  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: var(--surface);
  border: 2px solid var(--primary);
  color: var(--text);

  padding: 1rem 1.5rem;
  border-radius: 10px;
  font-size: 1.1rem;

  transition: background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.players li:hover {
  background-color: var(--primary-soft);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pname {
  font-weight: bold;
}

.pscore {
  opacity: 0.75;
  font-weight: 700;
}

/* === Right side: map === */
.map-container {
  background-color: var(--surface);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 0;
}

.map-wrapper {
  height: 60vh;
  min-height: 480px;
  border-radius: 12px;
  border: 2px solid var(--primary, #4C9A4E);
  background: #F7FAF5;
  overflow: hidden;
}

.map-wrapper :deep(.leaflet-container) {
  height: 100%;
  width: 100%;
}

.map-info {
  font-size: 0.95rem;
  opacity: 0.8;
}

.map-info-list {
  margin: 0;
  padding-left: 1.2rem;
}

/* Responsiv fix */
@media (max-width: 60em) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.lobby-missing {
  grid-area: content;
  background-color: var(--surface);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
