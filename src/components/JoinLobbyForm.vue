<script setup>
    import { ref, onMounted, onUnmounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { joinLobby, onLobbyJoined } from '@/services/socketService';
    
    const router = useRouter();
    
    // Variabler för formulär-input
    const lobbyId = ref('');
    const playerName = ref('');
    const errorMessage = ref('');
    const isJoining = ref(false);
    
    // --- Hantera anslutningssvar från Servern ---
    
    // Vi sätter upp en lyssnare när komponenten skapas (mounted)
    onMounted(() => {
        // onLobbyJoined anropas när servern bekräftar att spelaren är i lobbyn
        onLobbyJoined(handleLobbyJoined);
        
        // Servern bör också svara med ett fel om anslutningen misslyckas (t.ex. lobby finns inte)
        // socket.on('lobby:error', handleLobbyError); // Lägg till denna logik senare
    });
    
    // Vi städar upp lyssnaren när komponenten förstörs (unmounted)
    onUnmounted(() => {
        // socket.off('lobby:joined', handleLobbyJoined);
        // socket.off('lobby:error', handleLobbyError);
    });
    
    // Metod som körs när servern bekräftar att vi är anslutna
    const handleLobbyJoined = (data) => {
        isJoining.value = false;
        // Servern skickar troligen tillbaka det riktiga Lobby ID
        const actualLobbyId = data.id || lobbyId.value; 
        
        // Navigera till Lobby-vyn (/lobby/:id)
        router.push({ name: 'LobbyView', params: { id: actualLobbyId } });
    };
    
    
    // --- Hantera formulärets Submit ---
    
    const handleJoinLobby = () => {
        // Validering
        if (!lobbyId.value || !playerName.value) {
            errorMessage.value = "Både Lobby ID och Spelarnamn måste anges.";
            return;
        }
        
        errorMessage.value = '';
        isJoining.value = true;
        
        // 1. Skicka anslutningsförfrågan via tjänsten
        joinLobby(lobbyId.value, playerName.value);
        
        // 2. Vi väntar nu på svaret i handleLobbyJoined som är kopplad till onLobbyJoined
        // Om servern inte svarar snabbt, kan vi lägga in en timeout-logik här.
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
        background-color: #EA3E34;
        color: #FEFCEF;
        margin-top: 1.5rem;
    }
    .primary-action-btn:hover:not(:disabled) {
        background-color: #D7382F;
        box-shadow: 0 4px 10px rgba(234, 62, 52, 0.25);
    }
    .primary-action-btn:disabled {
        background-color: #f7a9a9;
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