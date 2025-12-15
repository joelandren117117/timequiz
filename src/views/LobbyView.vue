<template>
  <div id="containerdiv">

    <div id="maindiv">
    
      <h1>Game Lobby</h1>
      <h1>{{lobbyID}}</h1>
  
      <div class="playerbox" v-for="player in nonHostPlayers" :key="player.id">
          {{ player.namn }} - {{ player.ready ? 'Ready' : 'Not Ready' }} <!-- Frågetecken är som en if-else-->
      </div>
      
      <div class="buttonrow">
        <div class="readyb" @click="handleAction">
          <p>{{ isHost ? 'Start' : 'Ready' }}</p>
        </div>
      </div>
      
    </div>

  </div>
</template>

<script>
// @ is an alias to /src
import QuestionComponent from '@/components/QuestionComponent.vue';
import io from 'socket.io-client';
import {RouterLink} from 'vue-router';
const socket = io("localhost:3000");

export default {
  name: 'Lobbyview',

  data() {
    return {
      players: [
        { id: 1, namn: "host", ready: true, points: 0, isHost: true },
        { id: 2, namn: "Alexander", ready: true, points: 0, isHost: false },
        { id: 3, namn: "David", ready: true, points: 0, isHost: false }
      ],
      myID: 1,          // ← THIS is how the window knows who it is
      lobbyID: "lAH912"
    }
  },

  computed: {
    currentUser() {
      return this.players.find(p => p.id === this.myID)
    },
    isHost() {
      return this.currentUser?.isHost === true
    },
      nonHostPlayers() {
    return this.players.filter(player => !player.isHost);
    }
  },

  methods: {
    handleAction() {
      if (this.isHost && this.allReady()) {
        this.startGame()
      } else {
        this.toggleReady()
      }
    },
    startGame() {
      console.log("start")
        this.$router.push("/host")
    },
    allReady(){
      for (const player of this.players){
        if (!player.isHost && !player.ready){
          return false
        }
      }
      return true
    },
    toggleReady() {
      if (this.currentUser) {
        this.currentUser.ready = !this.currentUser.ready
      }
    }
  }
}

</script>

<style>

#containerdiv {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: rgb(175, 255, 172);
}

#maindiv {
  width: 70%;
  height: 80%;
  background-color: rgb(145, 145, 145);
  border-radius: 20px;
  display: flex;
  flex-direction:column;
  gap: 12px;
  padding: 2%;
  box-sizing: border-box;
}

.playerbox{
  background-color: rgb(255, 255, 255);
  border-radius: 20px;
  padding: 15px;
}

.readyb{
  background-color: white;
  width: 10%;
  border-radius: 10px;
  transition: background-color 0.2s ease;
}
.readyb:hover{
  background-color: rgb(230, 230, 230);
}
.buttonrow {
  display: flex;
  gap: 12px;        
  justify-content: center;
  margin-top: auto;
}

</style>
