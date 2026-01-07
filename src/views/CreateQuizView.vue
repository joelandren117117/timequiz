<template>
  <div class="create-quiz-container">
    <!-- Logo style title -->
    <header class="app-header">
      <h1 class="logo-title">
        <span class="logo-short">TJ</span>
        <span class="logo-full">TOAJMGUÄSSÄR</span>
      </h1>
    </header>
    <section class="quiz-section">
      <div class="quiz-name">
        <input
          class="quiz-name-input"
          v-model.trim="quizName"
          placeholder="Quiz name"
          maxlength="64"
        />
      </div>

      <div class="quiz-description">
        <label class="quiz-description-label" for="quiz-description">Quiz description</label>
        <input
          id="quiz-description"
          class="quiz-description-input"
          v-model.trim="quizDescription"
          placeholder="Optional description"
          maxlength="120"
        />
      </div>

      <div class="question-list">
        <div v-if="!questions.length" class="question-item empty">
          <span>No questions yet. Save your first question below.</span>
        </div>
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="question-item"
        >
          <span>Question {{ index + 1 }}: {{ question.prompt || `Question ${index + 1}` }}</span>
          <button class="btn btn-secondary" type="button" @click="removeQuestion(index)">
            Remove
          </button>
        </div>
      </div>

      <button class="btn btn-secondary" type="button" @click="resetQuestionEditor">
        New Question
      </button>
      <button class="btn btn-primary" type="button" @click="saveQuiz">
        Save Quiz
      </button>

      <div v-if="quizSaveError" class="upload-status upload-error">
        {{ quizSaveError }}
      </div>
      <div v-if="quizSaveSuccess" class="upload-status">
        {{ quizSaveSuccess }}
      </div>
    </section>

    <section class="question-editor">
      <div class="photo">
        <div class="question-prompt">
          <label class="prompt-label" for="question-prompt">Question prompt</label>
          <input
            id="question-prompt"
            class="prompt-input"
            v-model.trim="questionPrompt"
            placeholder="Describe the moment in the photo"
            maxlength="120"
          />
        </div>
        <div class="map-placeholder">
          <template v-if="imageUrl">
            <img
              class="photo-preview-img"
              :src="imageUrl"
              alt="Question image preview"
            />
          </template>
          <template v-else>
            Image preview will appear here
          </template>
        </div>
        
        <div class="photo-actions">
          <label class="prompt-label" for="image-url">Image URL</label>
          <input
            id="image-url"
            class="prompt-input"
            v-model.trim="imageUrl"
            placeholder="https://example.com/photo.jpg"
            maxlength="500"
          />
        </div>
      </div>
      <div class="map-panel">
        <div class="map-container">
          <!-- Use the interactive "guess" map so the admin can click to set/clear the correct location -->
          <LeafletMap
            :center="mapCenter"
            :zoom="4"
            clickable
            allowGuessMarker
            :guessMarker="correctLocation"
            @map-click="onCorrectMapClick"
          />
        </div>

        <div class="upload-status" style="margin-top: 0.75rem;">
          Correct location:
          <span v-if="correctLocation">
            {{ correctLocation.lat.toFixed(3) }}, {{ correctLocation.lng.toFixed(3) }}
          </span>
          <span v-else>Click on the map to set the correct location.</span>
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
          <button
            class="btn btn-primary"
            id="saveQuestionBtn"
            @click="saveQuestion"
          >
            Save Question
          </button>

          <div v-if="questionSaveError" class="upload-status upload-error" style="margin-top: 0.75rem;">
            {{ questionSaveError }}
          </div>
          <div v-if="questionSaveSuccess" class="upload-status" style="margin-top: 0.75rem;">
            {{ questionSaveSuccess }}
          </div>
        </div>
      </div>

    </section>
  </div>
</template>

<script>
import LeafletMap from "../components/LeafletMap.vue";
import { socket } from "@/services/socketService";
import { createQuiz as createQuizInStore } from "@/stores/quizStore";

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

      quizName: "",
      quizDescription: "",
      questionPrompt: "",
      questions: [],
      imageUrl: "",

      yearGuess: 1960,

      initialCenter: [54, 15],

      correctLocation: null,

      questionSaveError: "",
      questionSaveSuccess: "",

      quizSaveError: "",
      quizSaveSuccess: "",
    };
  },
  computed: {
    mapCenter() {
      if (this.correctLocation?.lat != null && this.correctLocation?.lng != null) {
        return [this.correctLocation.lat, this.correctLocation.lng];
      }
      return this.initialCenter;
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
    resetQuestionEditor() {
      this.questionPrompt = "";
      this.imageUrl = "";
      this.correctLocation = null;
      this.yearGuess = 1960;
      this.questionSaveError = "";
    },
    removeQuestion(index) {
      this.questions.splice(index, 1);
    },

    onCorrectMapClick({ lat, lng } = {}) {
    
      if (lat == null || lng == null) {
        this.correctLocation = null;
        return;
      }

      if (this.correctLocation) {
        const eps = 1e-6; 
        const samePoint =
          Math.abs(lat - this.correctLocation.lat) < eps &&
          Math.abs(lng - this.correctLocation.lng) < eps;
        if (samePoint) {
          this.correctLocation = null;
          return;
        }
      }

      this.correctLocation = { lat, lng };
    },

    async saveQuestion() {
      this.questionSaveError = "";
      this.questionSaveSuccess = "";

      if (this.correctLocation?.lat == null || this.correctLocation?.lng == null) {
        this.questionSaveError = "Pick a correct location on the map before saving.";
        return;
      }

      if (typeof this.yearGuess !== "number" || this.yearGuess < 1900 || this.yearGuess > 2025) {
        this.questionSaveError = "Year must be between 1900 and 2025.";
        return;
      }

      const nextIndex = this.questions.length + 1;
      const questionPayload = {
        id: `q${nextIndex}`,
        prompt: this.questionPrompt || `Question ${nextIndex}`,
        year: this.yearGuess,
        location: { ...this.correctLocation },
        imageUrl: this.imageUrl || null,
      };

      this.questions.push(questionPayload);
      this.questionSaveSuccess = `Question ${nextIndex} saved!`;
      this.resetQuestionEditor();
    },
    async saveQuiz() {
      this.quizSaveError = "";
      this.quizSaveSuccess = "";

      if (!this.quizName.trim()) {
        this.quizSaveError = "Quiz name is required.";
        return;
      }

      if (!this.questions.length) {
        this.quizSaveError = "Add at least one question before saving.";
        return;
      }

      try {
        await createQuizInStore({
          name: this.quizName.trim(),
          description: this.quizDescription.trim(),
          questions: this.questions,
        });
        this.quizSaveSuccess = "Quiz saved to server/data/quizes.json!";
        this.quizName = "";
        this.quizDescription = "";
        this.questions = [];
        this.resetQuestionEditor();
      } catch (err) {
        this.quizSaveError = err?.message || "Failed to save quiz.";
      }
    },
  },
};
</script>

<style scoped>
/* ========== Layout ========== */
.create-quiz-container {
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

@media (min-width: 900px) {
  .create-quiz-container {
    grid-template-columns: 1fr 4fr;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "header header"
      "quiz   editor";
    column-gap: 8rem;
    align-items: flex-start;
  }
}

.app-header {
  grid-area: header;
  margin-bottom: 1rem;
}
.quiz-section {
  grid-area: quiz;

  display: flex;
  flex-direction: column;
  gap: 2rem;

  background-color: var(--surface);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  max-width: 600px;
  margin: 0 2rem;
}

@media (min-width: 900px) {
  .quiz-section {
    max-width: none;
    width: 100%;
    margin: 0;
  }
}

.quiz-name {
  background-color: var(--primary);
  color: var(--bg);
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  padding: 1.2rem;
  border-radius: 10px;
}

.quiz-name-input {
  width: 100%;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 1.6rem;
  font-weight: 800;
  text-align: center;
  outline: none;
}

.quiz-description {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quiz-description-label {
  font-weight: 700;
  font-size: 0.95rem;
}

.quiz-description-input {
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 1rem;
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

.question-item.empty {
  justify-content: center;
  border-style: dashed;
  opacity: 0.7;
}

.question-item:hover {
  background-color: var(--primary-soft);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.question-editor {
  grid-area: editor;
  display: block;
  background-color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

.photo {

  border-radius: 12px;
  padding: 2rem;

  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-prompt {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prompt-label {
  font-weight: 700;
}

.prompt-input {
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 1rem;
}

.file-input {
  display: none;
}

.photo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.photo-preview-img {
  width: 100%;
  height: 100%;
  max-height: 480px;
  object-fit: contain;
  border-radius: 12px;
}

.upload-status {
  font-size: 0.95rem;
  opacity: 0.8;
  word-break: break-word;
}

.upload-url {
  font-weight: 700;
}

.upload-error {
  opacity: 1;
  color: #b00020;
}

@media (min-width: 900px) {
  .question-editor {
    display: flex;
    flex-direction: row;
    gap: 2rem;
  }

  .photo, .map-panel {
    flex: 1;
  }
}

.map-panel {
  border-radius: 12px;
  padding: 2rem;

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
  height: 480px;
  border-radius: 12px;
  border: 2px solid var(--primary, #4C9A4E);
  background: #F7FAF5;

  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  opacity: 0.6;
  cursor: pointer;
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
