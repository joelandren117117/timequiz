<template>
  <div id="containerdiv">

    <div id="maindiv">
    
      <h1>Results</h1>
  
      <div class="playerbox" v-for="player in players" :key="player.id">
        {{ player.namn }} - {{ player.points}}
      </div>
      
        <div class="buttonrow">
          <div class="readyb">
            <p>Ready</p>
          </div>
          <div class="readyb">
            <p>Start</p>
         </div>
        </div>
      
    </div>

  </div>
</template>

<script>
// @ is an alias to /src
import BarsComponent from '@/components/BarsComponent.vue';
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'ResultView',
  components: {
    BarsComponent
  },
  data() {
    return {
      players: [
        {id: 1, namn: "Alexander", ready: true, points: 2},
        {id: 2, namn: "David", ready: true, points: 5},
        {id: 3, namn: "Elliot", ready: true, points: 3}
      ]
    }
  },
  mounted() {
    this.players.sort((a, b) => b.points - a.points)
  },
  created() {
    this.pollId = this.$route.params.id
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on("submittedAnswersUpdate", update => this.submittedAnswers = update);
    socket.on("questionUpdate", update => this.question = update );
    socket.emit( "getUILabels", this.lang );
    socket.emit( "joinPoll", this.pollId );
  },
  methods:{
    



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
  width: 85%;
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
  padding: 5px;
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
