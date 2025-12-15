<script setup>
  import { RouterLink } from 'vue-router';
  </script>
  
  <template>
      <div class="home-container">
          <header class="app-header">
              <h1 class="logo-title">TIMEGUESSR</h1>
          </header>
  
          <div class="action-buttons">
              <p class="tagline">Guess time &amp; place — Challenge your friends!</p>
  
              <RouterLink to="/play" class="button-link">
                  <button class="action-btn primary-action-btn">
                      Play
                  </button>
              </RouterLink>
  
              <RouterLink to="/create" class="button-link">
                  <button class="action-btn secondary-action-btn">
                      Create
                  </button>
              </RouterLink>
          </div>
      </div>
  </template>
  
  <style scoped>

  .home-container {
      background-color: #FEFCEF;
      min-height: 100vh;
      padding: 3rem 2rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1D1C1B;
  
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: cente
  }    
  
  .app-header {
      margin-bottom: 2rem;
  }
  
  .logo-title {
      font-size: 5rem;
      font-weight: 900;
      color: #EA3E34;
      letter-spacing: -0.05em;
      text-transform: uppercase;
      margin: 0;
  }
  
  .tagline {
      font-size: 1.4rem;
      color: #1D1C1B;
      margin-bottom: 2.5rem;
  }
  
  .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
      max-width: 400px;
  }
  
  .button-link {
      text-decoration: none;
  }
  
  .action-btn {
      width: 100%;
      font-size: 1.4rem;
      font-weight: bold;
      padding: 1.5rem;
      border: 3px solid transparent; 
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  
  .primary-action-btn {
      background-color: #EA3E34;
      color: #FEFCEF;
  }
  
  .primary-action-btn:hover {
      background-color: #D7382F;
      box-shadow: 0 4px 10px rgba(234, 62, 52, 0.25);
  }
  

  .secondary-action-btn {
      background-color: transparent;
      color: #EA3E34;
      border-color: #EA3E34;
  }
  
  .secondary-action-btn:hover {
      background-color: rgba(234, 62, 52, 0.1);
  }
  </style>