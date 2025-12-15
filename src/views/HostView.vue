<template>
  <header class="app-header">
      <h1 class="logo-title">
        <span class="logo-short">TJ</span>
        <span class="logo-full">TOAJMGUÄSSÄR</span>
      </h1>
    </header>

  <main class="layout">
    <!-- Left column: stacked boxes (host controls + participants) -->
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
        <h2>Deltagare</h2>
        <ul class="players">
          <li v-for="player in players" :key="player.id">
            <span class="pname">{{ player.namn }}</span>
            <span class="pscore">{{ player.points }} poäng</span>
          </li>
        </ul>
      </section>
    </div>

    <!-- Right column: large map -->
    <section class="map-container">
      <div class="map-wrapper">
        <LeafletMap :center="initialCenter" :zoom="3" :markers="adminMarkers" />
      </div>
      <div class="map-info">
        <ul class="map-info-list">
          <li v-for="m in adminMarkers" :key="m.id">{{ m.label }} – {{ m.lat.toFixed(3) }}, {{ m.lng.toFixed(3) }}</li>
        </ul>
      </div>
    </section>
  </main>

</template>

<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';
import io from 'socket.io-client';
import { ref, computed } from 'vue';
import LeafletMap from '../components/LeafletMap.vue';
const socket = io("localhost:3000");


export default {
  name: 'StartView',
  components: {
    ResponsiveNav,
    LeafletMap
  },

  data() {
    return {
      initialCenter: [54, 15],
      uiLabels: {},
      newPollId: "",
      hideNav: true,
      lang: localStorage.getItem("lang") || "en",
      players: [
        { id: 1, namn: "Alexander", ready: true, points: 100000 },
        { id: 2, namn: "David", ready: true, points: 5 },
        { id: 3, namn: "Elliot", ready: true, points: -3 }
      ]
      ,
      adminMarkers: []
    }
  },
  created: function () {
    socket.on("uiLabels", labels => this.uiLabels = labels);
    socket.emit("getUILabels", this.lang);
  },
  methods: {
    switchLanguage: function () {
      if (this.lang === "en") {
        this.lang = "sv"
      }
      else {
        this.lang = "en"
      }
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    },
    toggleNav: function () {
      this.hideNav = !this.hideNav;
    }
  },
  mounted() {
    this.players.sort((a, b) => b.points - a.points)
  }
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
/* === Vänster sida: deltagare === */
.sidebar {
  background: lightblue;
  padding: 2em;
  border-radius: 1em;
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
  background-color: black; 
}

.map-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}


/* Responsiv fix */
@media (max-width: 60em) {
  .layout {
    grid-template-columns: 1fr;
  }

}
</style>