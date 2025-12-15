<script setup>
  import { ref } from 'vue';
  import JoinLobbyForm from '@/components/JoinLobbyForm.vue';
  import QuizList from '@/components/QuizList.vue';
  import { RouterLink } from 'vue-router';
  
  const currentMode = ref('join'); 
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
                      <QuizList />
                        <RouterLink to="/lobby" class="button-link">
                            <button class="action-btn primary-action-btn">
                                Create Lobby
                            </button>
                        </RouterLink>
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
  </style>