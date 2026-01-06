<script setup>
  import { RouterLink } from 'vue-router';
</script>
   
      
      <template>
      <div class="home-container">
          <header class="app-header">
              <h1 class="logo-title">TIMEGUESSR</h1>
          </header>
  
          <div class="action-buttons">
              <p class="tagline">Guess time &amp; place: Challenge your friends!</p>
  
              <RouterLink to="/play" class="button-link">
                  <button class="btn btn-primary">
                      Play
                  </button>
              </RouterLink>
  
              <RouterLink to="/create" class="button-link">
                  <button class="btn btn-thirdary">
                      Create
                  </button>
              </RouterLink>
        </div>
      </div>
  </template>
<style scoped>

  .home-container {
      background-color: var(--bg);
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: var(--text);
  
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
  }    
  
  .app-header {
      margin-bottom: 2rem;
  }
  
  .logo-title {
      font-size: 5rem;
      font-weight: 900;
      color: var(--primary);
      letter-spacing: -0.05em;
      text-transform: uppercase;
      margin: 0;
  }
  
  .tagline {
      font-size: 1.4rem;
      color: var(--text);
      margin-bottom: 2.5rem;
      white-space: nowrap;
      align-self: center;
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
  
  .btn {
      width: 100%;
      font-size: 1.4rem;
      padding: 1.5rem;
  }

  </style>