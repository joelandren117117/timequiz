<script setup>
import { RouterLink } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import { getLabel } from '@/stores/uiStore';
</script>
    
        
        <template>
        <div class="home-container">
            <AppHeader />
    
            <div class="action-buttons">
                <p class="tagline">{{ getLabel('homeTagline', 'Guess time & place: Challenge your friends!') }}</p>
    
                <RouterLink to="/play" class="button-link">
                    <button class="btn btn-primary">
                        {{ getLabel('homePlay', 'Play') }}
                    </button>
                </RouterLink>
    
                <RouterLink to="/create" class="button-link">
                    <button class="btn btn-thirdary">
                        {{ getLabel('homeCreate', 'Create') }}
                    </button>
                </RouterLink>
        </div>
        </div>
    </template>
<style scoped>

.home-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}    

.home-container :deep(.app-header) {
    margin-bottom: 2rem;
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
