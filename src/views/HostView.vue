<template>
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
          <button class="host-btn">Previous</button>
          <button class="host-btn">Edit players</button>
          <button class="host-btn">Back</button>
          <button class="host-btn">Next</button>
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


/* Left column: stacked boxes */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.host-box {
  background: #fff;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  background: lightblue;
}

.host-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
}

.host-btn {
  height: 5.25rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #ddd;
  cursor: pointer;
  font-weight: 600;
}

.players-box {
  background: lightblue;
  padding: 1rem;
  border-radius: 0.75rem;
}


/* === Layouten runt kartan och deltagare === */
.layout {
  display: grid;
  grid-template-columns: 360px 1fr; /* left column (stacked boxes) + large map */
  gap: 2em;
  padding: 2em;
  align-items: stretch;
}
.players {
  list-style: none;
  padding: 0;
  margin: 0;
}

.players li {
  display: flex;
  justify-content: space-between;
  background: white;
  padding: 1em;
  margin-bottom: 1em;
  border-radius: 1em;
  border: 0.1em solid lightgray;
}

.pname {
  font-weight: bold;
}

.pscore {
  color: black;
}

/* === Höger sida: karta === */


.maps-preview {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 2rem;
}

@media (min-width: 960px) {
  .maps-preview {
    grid-template-columns: repeat(3, 1fr);
  }
}

.map-section {
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.map-container  {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #0f172a;
}

.map-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  height: 60vh;
}

.map-wrapper :deep(.leaflet-map) {
  height: 100%;
}


/* Responsiv fix */
@media (max-width: 60em) {
  .layout {
    grid-template-columns: 1fr;
  }

}
</style>
