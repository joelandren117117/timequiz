<template>
  <header>
    <div v-bind:class="['hamburger', { 'close': !hideNav }]" v-on:click="toggleNav">
    </div>
    <div class="logo">
      <img src="/quizpic.png">
      Timequiz
      <img src="../assets/logo.svg">
    </div>
  </header>

  <!--meny från micke-->
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
  <!--meny från micke-->

 <!-- <h1>{{ uiLabels.heading }}</h1>
  <h2>{{ uiLabels.subHeading }}</h2>
  <label>
    Write poll id:
    <input type="text" v-model="newPollId">
  </label>
  <router-link v-bind:to="'/lobby/' + newPollId">
    {{ uiLabels.participatePoll }}
  </router-link> -->

  <section class="hostMenu">
    <button class="button">
      Previous Question
    </button>
    
    <button class="button">
      Edit players
    </button>

    <button class="button">
      Back to menu
    </button>

    <button class="button">
      Next Question
    </button>

  </section>
    
  <main class="layout">
    <!-- Vänster panel: deltagare -->
    <aside class="sidebar">
        <h2>Deltagare</h2>
        <ul class="players">
            <li v-for="player in players" :key="player.name">
                <span class="pname">{{ player.namn }}</span>
                <span class="pscore">{{ player.points }} poäng</span>
            </li>
        </ul>
    </aside>

    <section class="map-container">
        <h2>Karta</h2>
        <div id="map"></div>
    </section>
</main>

</template>

<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'StartView',
  components: {
    ResponsiveNav
  },
  data() {
    return {
      uiLabels: {},
      newPollId: "",
      hideNav: true,
      lang: localStorage.getItem("lang") || "en",
      players: [
        {id: 1, namn: "Alexander", ready: true, points: 100000},
        {id: 2, namn: "David", ready: true, points: 5},
        {id: 3, namn: "Elliot", ready: true, points: -3}
      ]
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
header {
  background-color: gray;
  width: 100%;
  display: grid;
  grid-template-columns: 2em auto;
}

.logo {
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 2.5rem;
  color: white;
  padding-top: 0.2em;
}

.logo img {
  height: 2.5rem;
  vertical-align: bottom;
  margin-right: 0.5rem;
}

.hamburger {
  color: white;
  width: 1em;
  display: flex;
  align-items: center;
  justify-content: left;
  padding: 0.5rem;
  top: 0;
  left: 0;
  height: 2rem;
  cursor: pointer;
  font-size: 1.5rem;
}

@media screen and (max-width:50em) {
  .logo {
    font-size: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hamburger::before {
    content: "☰";
  }

  .close::before {
    content: "✕";
  }

  .hide {
    left: -12em;
  }
}

.hostMenu{
  display: flex;
  gap: 2em;
  padding: 2em;
  justify-content: center;
  align-items: center;
}

.button{
  height: 7em;
  width: 10em;
  border-radius: 1em;
}


/* === Layouten runt kartan och deltagare === */
.layout {
    display: grid;
    grid-template-columns: 27% 1fr;
    gap: 2em;
    padding: 2em;
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
.map-container {
    background: lightblue;
    padding: 1em;
    border-radius: 1em;
}

#map {
    width: 100%;
    height: 30em;
    background: red;
    border-radius: 1em;
}

/* Responsiv fix */
@media (max-width: 60em) {
    .layout {
        grid-template-columns: 1fr;
    }

    #map {
        height: 30em;
    }
}

</style>
