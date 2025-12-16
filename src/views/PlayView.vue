<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import JoinLobbyForm from '@/components/JoinLobbyForm.vue';
import QuizList from '@/components/QuizList.vue';
import quizesData from '../../server/data/quizes.json';
import { createLobby as createLobbyInStore } from '@/stores/lobbyStore';

const currentMode = ref('join');
const selectedQuizId = ref('');
const hostName = ref('');
const quizes = quizesData.quizes ?? [];
const router = useRouter();

const selectedQuizName = computed(
  () => quizes.find((q) => q.id === selectedQuizId.value)?.name || ''
);

const onSelectQuiz = (id) => {
  selectedQuizId.value = id;
};

const createLobby = () => {
  if (!selectedQuizId.value) return;
  const { lobby, playerId } = createLobbyInStore(selectedQuizId.value, hostName.value || 'Host');
  router.push({
    path: '/lobby',
    query: { lobby: lobby.id, player: playerId, quiz: selectedQuizId.value },
  });
};
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
                      class="mode-btn"
                  >
                      Join Lobby
                  </button>
                  
                  <button 
                      @click="currentMode = 'host'"
                      :class="{ 'active-mode': currentMode === 'host' }"
                      class="mode-btn"
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
                        class="action-btn primary-action-btn"
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
    background-color: #FEFCEF;
    min-height: 100vh;
    padding: 3rem 2rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #1D1C1B;
  }

  .app-header {
      text-align: center;
      margin-bottom: 2rem;
  }
  .logo-title {
      font-size: 5rem;
      font-weight: 900;
      color: #EA3E34;
      letter-spacing: -0.05em;
      text-transform: uppercase;
      margin: 0 auto;
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
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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
      background-color: transparent;
      color: #EA3E34;
      border: 2px solid #EA3E34;
      padding: 0.8rem 1.5rem;
      border-radius: 999px;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease;
  }
  
  .mode-btn:hover {
      background-color: rgba(234, 62, 52, 0.1);
  }
  
  .mode-btn.active-mode {
      background-color: #EA3E34;
      color: #FEFCEF;
      border-color: #EA3E34;
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
  border-radius: 12px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.primary-action-btn {
  background: #ea3e34;
  color: #fefcef;
  box-shadow: 0 8px 16px rgba(234, 62, 52, 0.25);
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.action-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(234, 62, 52, 0.32);
}
  </style>
