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

  <main class="layout">
    <!-- Vänster panel: år -->
    <aside class="sidebar">
        <h2>Bild</h2>
        <img src="https://images.citybreakcdn.com/image.aspx?ImageId=8661679" class="picture"/>
    </aside>

    <section class="map-container">
        <h2>Karta</h2>
        <div id="map"></div>
        <div class="yearSlider">
        <label for="yearRange">År: <strong>{{ yearGuess }}</strong></label>
        <input 
            type="range" 
            id ="yearRange"
            v-model.number="yearGuess"
            min="1900" 
            max="2024" 
            step ="1"
        >
        <div class="slider-labels">
            <span>1900</span>
            <span>2025</span>
        </div>
        </div>
      <div class="submitGuess">
        <button class="button">
          Submit Guess
        </button>
      </div>
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
  data: function () {
    return {
      uiLabels: {},
      newPollId: "",
      lang: localStorage.getItem("lang") || "en",
      hideNav: true,
      yearGuess: 1960
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
