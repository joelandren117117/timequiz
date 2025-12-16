<template>
    <div class="maps-preview">
      <!-- Map 1: Player Guess Map -->
      <section class="map-section">
        <h2>Player Guess Map</h2>
        <LeafletMap
          :center="initialCenter"
          :zoom="4"
          clickable
          allowGuessMarker
          :guessMarker="playerGuess"
          @map-click="onPlayerMapClick"
        />
  
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
  
      <!-- Map 2: Correct Answer Map -->
      <section class="map-section">
        <h2>Correct Answer Map</h2>
        <LeafletMap
          :center="[correctLocation.lat, correctLocation.lng]"
          :zoom="5"
          :markers="[
            {
              id: 'correct',
              lat: correctLocation.lat,
              lng: correctLocation.lng,
              label: 'Correct location',
            },
          ]"
        />
  
        <p class="map-info">
          Correct location:
          {{ correctLocation.lat.toFixed(3) }}, {{ correctLocation.lng.toFixed(3) }}
        </p>
      </section>
  
      <!-- Map 3: Admin Map (all lobby guesses) -->
      <section class="map-section">
        <h2>Admin Map (Lobby guesses)</h2>
        <LeafletMap
          :center="initialCenter"
          :zoom="3"
          :markers="adminMarkers"
        />
  
        <ul class="map-info-list">
          <li v-for="m in adminMarkers" :key="m.id">
            {{ m.label }} – {{ m.lat.toFixed(3) }}, {{ m.lng.toFixed(3) }}
          </li>
        </ul>
      </section>
    </div>
  </template>

<script setup>
import { ref, computed } from 'vue';
import LeafletMap from '../components/LeafletMap.vue';

// Center roughly over Europe
const initialCenter = [54, 15];

// State for player's current guess (map 1)
const playerGuess = ref(null);

// Example of a correct location (Eiffel Tower)
const correctLocation = ref({
  lat: 48.8584,
  lng: 2.2945,
});

// Dummy players and their guesses (for the admin map)
const players = ref([
  {
    id: 'p1',
    name: 'Alice',
    guess: { lat: 48.86, lng: 2.35 },
  },
  {
    id: 'p2',
    name: 'Bob',
    guess: { lat: 51.5, lng: -0.12 },
  },
  {
    id: 'p3',
    name: 'Charlie',
    guess: { lat: 52.52, lng: 13.4 },
  },
]);

// Markers for the admin map based on players
const adminMarkers = computed(() =>
  players.value
    .filter((p) => p.guess)
    .map((p) => ({
      id: p.id,
      lat: p.guess.lat,
      lng: p.guess.lng,
      label: `${p.name}'s guess`,
    }))
);

// Handle clicks on the Player Guess Map
const onPlayerMapClick = ({ lat, lng }) => {
  playerGuess.value = { lat, lng };
};

// Submit guess (placeholder until wired to Socket.io)
const submitGuess = () => {
  if (!playerGuess.value) return;

  console.log('Submitting guess:', playerGuess.value);

  // Later this will submit over sockets:
  // socketService.submitGuess({
  //   lobbyId,
  //   playerName,
  //   lat: playerGuess.value.lat,
  //   lng: playerGuess.value.lng,
  //   yearGuess: selectedYear,
  // });

  alert(
    `Guess sent: ${playerGuess.value.lat.toFixed(
      3
    )}, ${playerGuess.value.lng.toFixed(3)}`
  );
};
</script>

<style scoped>
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
  background: #18181b;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.map-section h2 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.map-info {
  margin-top: 0.75rem;
  font-size: 0.9rem;
}

.map-info-list {
  margin-top: 0.75rem;
  padding-left: 1.2rem;
  font-size: 0.9rem;
}

.submit-button {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
