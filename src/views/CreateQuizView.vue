src/views/CreateQuizView.vues<template>
  <div class="create-quiz-container">
    <!-- Logo style title -->
    <header class="app-header">
      <h1 class="logo-title">
        <span class="logo-short">TJ</span>
        <span class="logo-full">TOAJMGUÄSSÄR</span>
      </h1>
    </header>

    <!-- Quiz section (left column) -->
    <section class="quiz-section">
      <div class="quiz-name">Quiz Name</div>

      <div class="question-list">
        <div class="question-item">
          <span>Question 1</span>
          <button class="edit-btn">Edit</button>
        </div>
        <div class="question-item">
          <span>Question 2</span>
          <button class="edit-btn">Edit</button>
        </div>
        <div class="question-item">
          <span>Question 3</span>
          <button class="edit-btn">Edit</button>
        </div>
        <div class="question-item">
          <span>Question 4</span>
          <button class="edit-btn">Edit</button>
        </div>
      </div>

      <button class="add-question-btn">+ Add Question</button>
      <button class="save-btn">Save Quiz</button>
    </section>

    <section class="question-editor">
      <div class="map-panel">
        <div class="map-container">
          <LeafletMap :center="[correctLocation.lat, correctLocation.lng]" :zoom="5" :markers="[
            {
              id: 'correct',
              lat: correctLocation.lat,
              lng: correctLocation.lng,
              label: 'Correct location',
            },
          ]" />
        </div>
        <div class="year-control">
          <div class="year-label">Year</div>

          <div class="year-input-row">
            <input class="year-display" type="number" v-model.number="yearGuess" min="1900" max="2025" max-length="4" />

          </div>

          <input class="year-slider" type="range" id="yearRange" v-model.number="yearGuess" min="1900" max="2025"
            value="1920" />

          <div class="year-range">1900 – 2025</div>
        </div>
        <div class="submitGuess">
          <button class="save-btn" id="saveQuestionBtn">
            Save Question
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import LeafletMap from "../components/LeafletMap.vue";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default {
  name: "CreateQuizView",
  components: {
    LeafletMap,
  },
  data() {
    return {
      uiLabels: {},
      newPollId: "",
      lang: localStorage.getItem("lang") || "en",
      hideNav: true,

      yearGuess: 1960,

      correctLocation: {
        lat: 48.8584,
        lng: 2.2945,
      },
    };
  },
  computed: {
    correctMarkers() {
      return [
        {
          id: "correct",
          lat: this.correctLocation.lat,
          lng: this.correctLocation.lng,
          label: "Correct location",
        },
      ];
    },
  },
  created() {
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.emit("getUILabels", this.lang);
  },
  beforeUnmount() {
    socket.off("uiLabels");
  },
  methods: {
    switchLanguage() {
      this.lang = this.lang === "en" ? "sv" : "en";
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    },
    toggleNav() {
      this.hideNav = !this.hideNav;
    },
  },
};
</script>

<style scoped>
/* ========== Theme Tokens ========== */
.create-quiz-container {
  --bg: #f3feef;
  --surface: #ffffff;
  --text: #1D1C1B;


  --primary: #39643a;
  /* main logo green */
  --primary-dark: #225b24;
  /* hover/active */
  --primary-soft: rgba(41, 77, 25, 0.08);
  --primary-soft-strong: rgba(128, 200, 96, 0.16);

  background-color: var(--bg);
  min-height: 100vh;
  padding: 3rem 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);

  /* GRID LAYOUT */
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "header"
    "quiz"
    "editor";
  row-gap: 2rem;
}

.logo-full {
  display: none;
}

.logo-short {
  display: inline;
}

/* Larger screens: quiz in left third, right side empty for now */
@media (min-width: 900px) {
  .create-quiz-container {
    grid-template-columns: 1fr 2fr;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "header header"
      "quiz   editor";
    column-gap: 8rem;
    align-items: flex-start;
  }

  .logo-short {
    display: none;
  }

  .logo-full {
    display: inline;
  }
}

/* ========== Header / Logo ========== */
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

/* ========== Quiz Layout (Flex inside grid) ========== */
.quiz-section {
  grid-area: quiz;

  /* FLEX LAYOUT INSIDE QUIZ SECTION */
  display: flex;
  flex-direction: column;
  gap: 2rem;

  background-color: var(--surface);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  /* On small screens, center and constrain width a bit */
  max-width: 600px;
  margin: 0 2rem;
}

/* On larger screens, let quiz fill its grid column */
@media (min-width: 900px) {
  .quiz-section {
    max-width: none;
    width: 100%;
    margin: 0;
  }
}

/* Title Bar */
.quiz-name {
  background-color: var(--primary);
  color: var(--bg);
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  padding: 1.2rem;
  border-radius: 10px;
}

/* Question Items */
.question-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-item {
  background-color: var(--surface);
  border: 2px solid var(--primary);
  color: var(--text);

  padding: 1rem 1.5rem;
  border-radius: 10px;

  font-size: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  transition: background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.question-item:hover {
  background-color: var(--primary-soft);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Edit Button - secondary style */
.edit-btn {
  background-color: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);

  padding: 0.4rem 1rem;
  border-radius: 999px;

  font-weight: bold;
  cursor: pointer;

  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.edit-btn:hover {
  background-color: var(--primary-soft-strong);
}

/* Main Buttons */
.add-question-btn,
.save-btn {
  background-color: var(--primary);
  color: var(--bg);
  font-size: 1.2rem;
  font-weight: bold;

  padding: 1rem;
  border: none;
  border-radius: 12px;

  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.08s ease;
}

.add-question-btn:hover,
.save-btn:hover {
  background-color: var(--primary-dark);
  box-shadow: 0 4px 10px rgba(128, 200, 96, 0.28);
}

.add-question-btn:active,
.save-btn:active {
  transform: translateY(1px);
}

/* ========== Right Side / Editor Placeholder ========== */
.question-editor {
  grid-area: editor;
  display: block;
}

/* Show the empty right side only on larger screens */
@media (min-width: 900px) {
  .question-editor {
    display: block;
  }
}

.map-panel {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  max-width: 900px;
  margin: 0 auto;

  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .map-panel {
    max-width: none;
    margin: 0;
  }
}

.map-container {
  height: 480px;
  border-radius: 12px;
  border: 2px solid var(--primary, #4C9A4E);
  background: #F7FAF5;

  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.map-container :deep(.leaflet-container) {
  height: 100%;
  width: 100%;
}

.map-placeholder {
  font-weight: 600;
  opacity: 0.6;
}

.year-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  padding-top: 0.25rem;
}

.year-label {
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: 0.02em;
  color: var(--primary, #3E7E40);
  text-align: center;
}

.year-input-row {
  width: 100%;
  display: flex;
  justify-content: center;
}

.year-display {
  min-width: 140px;
  text-align: center;

  padding: 0.6rem 1.1rem;
  border-radius: 14px;

  border: 2px solid var(--primary, #3E7E40);
  background: #FFFFFF;

  font-weight: 900;
  font-size: 1.6rem;
  letter-spacing: 0.04em;

  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.06),
    inset 0 0 0 1px rgba(62, 126, 64, 0.08);

  outline: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.08s ease;
}

/* Nice focus even without script */
.year-display:focus {
  border-color: var(--primary-dark, #2F6A33);
  box-shadow:
    0 0 0 4px rgba(62, 126, 64, 0.14),
    0 4px 12px rgba(0, 0, 0, 0.08);
}

.year-display:active {
  transform: translateY(1px);
}

.year-slider {
  width: 100%;
  max-width: 720px;
  accent-color: var(--primary, #3E7E40);
}

.year-range {
  font-size: 0.95rem;
  opacity: 0.65;
}


.map-section h2 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.map-info {
  margin-top: 0.75rem;
  font-size: 0.9rem;
}

</style>
