<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import JoinLobbyForm from '@/components/JoinLobbyForm.vue';
import QuizList from '@/components/QuizList.vue';
import { createLobby as createLobbyInStore } from '@/stores/lobbyStore';
import { quizState, fetchQuizes } from '@/stores/quizStore';

const currentMode = ref('join');
const selectedQuizId = ref('');
const hostName = ref('');
const quizes = computed(() => quizState.quizes ?? []);
const router = useRouter();

const selectedQuizName = computed(
  () => quizes.value.find((q) => q.id === selectedQuizId.value)?.name || ''
);

const onSelectQuiz = (id) => {
  selectedQuizId.value = id;
};

const createLobby = async () => {
  if (!selectedQuizId.value) return;
  try {
    const { lobby, playerId } = await createLobbyInStore(
      selectedQuizId.value,
      hostName.value || "Host"
    );
    router.push({
      path: "/lobby",
      query: { lobby: lobby.id, player: playerId, quiz: selectedQuizId.value },
    });
  } catch (err) {
    console.warn("Failed to create lobby", err);
  }
};

onMounted(() => {
  fetchQuizes().catch((err) => {
    console.warn("Failed to load quizzes", err);
  });
});
</script>
  
  <template>
      <div class="create-quiz-container"> 
          <header class="app-header">
              <h1 class="logo-title">TIMEGUESSR</h1>
          </header>
  
          <section class="selection-section">
              <h2 class="section-title">Choose gamemode</h2>
  
              <div class="mode-selector">
                  <button 
                      @click="currentMode = 'join'"
                      :class="{ 'active-mode': currentMode === 'join' }"
                      class="btn btn-secondary mode-btn"
                  >
                      Join Lobby
                  </button>
                  
                  <button 
                      @click="currentMode = 'host'"
                      :class="{ 'active-mode': currentMode === 'host' }"
                      class="btn btn-secondary mode-btn"
                  >
                      Host Lobby
                  </button>
              </div>
  
              <div class="content-wrapper">
                  <div v-if="currentMode === 'join'">
                      <p class="description-text">Enter Lobby ID and username to connect:</p>
                      <JoinLobbyForm />
                  </div>
  
                  <div v-else-if="currentMode === 'host'">
                      <p class="description-text">Choose a quiz from the list below to create a new lobby:</p>
                      <div class="form-row">
                        <label class="text-label" for="host-name">Host name</label>
                        <input
                          id="host-name"
                          v-model="hostName"
                          placeholder="Enter your name"
                          maxlength="12"
                          class="text-input"
                        />
                      </div>
                      <QuizList
                        :quizes="quizes"
                        :selected-id="selectedQuizId"
                        @select="onSelectQuiz"
                      />
                      <p class="selected-quiz" v-if="selectedQuizName">
                        Selected quiz: <strong>{{ selectedQuizName }}</strong>
                      </p>
                      <button
                        class="action-btn btn btn-primary"
                        :disabled="!selectedQuizId"
                        @click="createLobby"
                      >
                        Create Lobby
                      </button>
                  </div>
              </div>
          </section>
      </div>
  </template>
  
  <style scoped>

  .create-quiz-container {
    background-color: var(--bg);
    min-height: 100vh;
    padding: 3rem 2rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #1D1C1B;
  }

  .app-header {
      text-align: center;
      margin-bottom: 2rem;
  }
  
  .section-title {
      font-size: 2rem;
      text-align: center;
      color: #1D1C1B;
      margin-bottom: 2rem;
      font-weight: 600;
  }
  
  .selection-section {
      background-color: #FFFFFF;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 10px rgba(128, 200, 96, 0.28);
      max-width: 600px;
      margin: 0 auto;
  }

  .mode-selector {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
  }
  
  .mode-btn {

      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease;
  }
  
  .mode-btn:hover {
      background-color: var(--primary-soft);
  }
  
  .mode-btn.active-mode {
      background-color: var(--primary);
      color: white;
      border-color: var(--primary);
  }
  
.description-text {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
}

.form-row {
  margin-bottom: 1rem;
  text-align: left;
}

.text-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.text-input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.selected-quiz {
  text-align: center;
  margin: 0.75rem 0;
}

.action-btn {
  display: block;
  margin: 1rem auto 0;
  padding: 0.9rem 1.6rem;
}


.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

  </style>
