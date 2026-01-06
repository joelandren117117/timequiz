<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { joinLobby } from '@/stores/lobbyStore';
    
    const router = useRouter();
    
    const lobbyId = ref('');
    const playerName = ref('');
    const errorMessage = ref('');
    const isJoining = ref(false);
    
    const handleJoinLobby = async () => {
        if (!lobbyId.value || !playerName.value) {
            errorMessage.value = "Both Lobby ID and player name are required.";
            return;
        }
        
        errorMessage.value = '';
        isJoining.value = true;
    
        try {
            const id = lobbyId.value.trim().toUpperCase();
            const name = playerName.value.trim();
            const { lobby, playerId } = await joinLobby(id, name);
            router.push({
                path: '/lobby',
                query: { lobby: id, player: playerId, quiz: lobby?.quizId },
            });
        } catch (err) {
            errorMessage.value = err.message || 'Could not join lobby.';
        } finally {
            isJoining.value = false;
        }
    };
    </script>
    
    <template>
        <div class="join-lobby-form">
            <form @submit.prevent="handleJoinLobby">
                
                <div class="form-group">
                    <label for="lobby-id">Lobby ID</label>
                    <input id="lobby-id" type="text" v-model="lobbyId" placeholder="Enter ID" required>
                </div>
    
                <div class="form-group">
                    <label for="player-name">Your name</label>
                    <input id="player-name" type="text" v-model="playerName" placeholder="Maximum 12 characters " maxlength="12" required>
                </div>
                
                <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
                
                <button 
                    type="submit" 
                    class="action-btn primary-action-btn"
                    :disabled="isJoining"
                >
                    {{ isJoining ? 'Connecting...' : 'Join Lobby' }}
                </button>
                
            </form>
        </div>
    </template>
    
    <style scoped>
    /* Återanvänd knappar och färger för konsekvens */
    .action-btn {
        width: 100%;
        font-size: 1.4rem;
        font-weight: bold;
        padding: 1rem;
        border: 3px solid transparent; 
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.2s ease, box-shadow 0.2s ease;
    }
    .primary-action-btn {
        background-color: var(--primary);
        color: #FEFCEF;
        margin-top: 1.5rem;
    }
    .primary-action-btn:hover:not(:disabled) {
        background-color: var(--primary-dark);
        box-shadow: 0 4px 10px var(--primary-soft);
    }
    .primary-action-btn:disabled {
        background-color: var(--surface);
        cursor: not-allowed;
    }
    
    /* Formulär stilar */
    .form-group {
        margin-bottom: 1.5rem;
        text-align: left;
    }
    
    label {
        display: block;
        font-weight: bold;
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
    }
    
    input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 6px;
        box-sizing: border-box;
        font-size: 1rem;
    }
    
    .error-message {
        color: #EA3E34;
        margin-top: 10px;
        text-align: center;
    }
    </style>
