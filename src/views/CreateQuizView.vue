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
      <div class="quiz-name">Quiz Name</div>

      <div class="question-list">
        <div class="question-item">
          <span>Question 1</span>
          <button class="btn btn-secondary">Edit</button>
        </div>
        <div class="question-item">
          <span>Question 2</span>
          <button class="btn btn-secondary">Edit</button>
        </div>
        <div class="question-item">
          <span>Question 3</span>
          <button class="btn btn-secondary">Edit</button>
        </div>
        <div class="question-item">
          <span>Question 4</span>
          <button class="btn btn-secondary">Edit</button>
        </div>
      </div>

      <button class="btn btn-primary">+ Add Question</button>
      <button class="btn btn-primary">Save Quiz</button>
    </section>

    <section class="question-editor">
      <div class="photo">
        <div class="map-placeholder" @click="openPhotoPicker">
          <template v-if="photoPreviewUrl">
            <img
              class="photo-preview-img"
              :src="photoPreviewUrl"
              alt="Selected photo preview"
            />
          </template>
          <template v-else>
            Photo Upload Placeholder
          </template>
        </div>

        <!-- Hidden native file input (most compatible) -->
        <input
          ref="photoInput"
          class="file-input"
          type="file"
          accept="image/*"
          @change="onPhotoSelected"
          @click="openPhotoPicker"
        />

        <div class="photo-actions">
          <button class="btn btn-secondary" type="button" :disabled="!photoFile" @click="clearPhoto">
            Remove
          </button>
        </div>

        <div v-if="uploadedPhotoUrl" class="upload-status">
          Uploaded: <span class="upload-url">{{ uploadedPhotoUrl }}</span>
        </div>
        <div v-if="photoUploadError" class="upload-status upload-error">
          {{ photoUploadError }}
        </div>
      </div>
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
          <button class="btn btn-primary" id="saveQuestionBtn" @click="saveQuestion">
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

// Change this to your backend route (or remove the upload button if you only need local preview)
const UPLOAD_ENDPOINT = "/api/upload";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

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

      // Photo upload (native file input)
      photoFile: null,
      photoPreviewUrl: "",
      uploadedPhotoUrl: "",
      isUploadingPhoto: false,
      photoUploadError: "",

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

    // Clean up object URL if we created one
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }
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

    openPhotoPicker() {
      this.$refs.photoInput?.click();
    },

    onPhotoSelected(e) {
      const file = e.target.files?.[0];
      if (!file) return;

      // Basic validation
      if (!file.type?.startsWith("image/")) {
        this.photoUploadError = "Please choose an image file.";
        e.target.value = "";
        return;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        this.photoUploadError = "Image is too large (max 5MB).";
        e.target.value = "";
        return;
      }

      // Replace previous preview URL
      if (this.photoPreviewUrl) {
        URL.revokeObjectURL(this.photoPreviewUrl);
      }

      this.photoFile = file;
      this.photoPreviewUrl = URL.createObjectURL(file);
      this.uploadedPhotoUrl = "";
      this.photoUploadError = "";
    },

    clearPhoto() {
      if (this.photoPreviewUrl) {
        URL.revokeObjectURL(this.photoPreviewUrl);
      }
      this.photoFile = null;
      this.photoPreviewUrl = "";
      this.uploadedPhotoUrl = "";
      this.photoUploadError = "";

      // Reset the input so selecting the same file again still triggers change
      if (this.$refs.photoInput) {
        this.$refs.photoInput.value = "";
      }
    },

    async uploadPhoto() {
      if (!this.photoFile || this.isUploadingPhoto) return;

      this.isUploadingPhoto = true;
      this.photoUploadError = "";
      this.uploadedPhotoUrl = "";

      try {
        const formData = new FormData();
        formData.append("image", this.photoFile);

        const res = await fetch(UPLOAD_ENDPOINT, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Upload failed (${res.status})`);
        }

        // Expecting JSON like: { url: "https://..." }
        const data = await res.json().catch(() => ({}));
        this.uploadedPhotoUrl = data.url || "(Uploaded, but backend did not return a url)";
      } catch (err) {
        this.photoUploadError = err?.message || "Upload failed.";
      } finally {
        this.isUploadingPhoto = false;
      }
    },

    async saveQuestion() {
      // Upload photo if present
      if (this.photoFile) {
        await this.uploadPhoto();
      }
      // TODO: Implement saving the question data (e.g., yearGuess, correctLocation, uploadedPhotoUrl)
      alert('Question saved!');
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

.logo-full {
  display: none;
}

.logo-short {
  display: inline;
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

  .logo-short {
    display: none;
  }

  .logo-full {
    display: inline;
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
