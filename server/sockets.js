import {
  createLobby,
  getLobby,
  joinLobby,
  startLobby,
  advanceQuestion,
  submitGuess,
} from "./lobbyStore.js";

function sockets(io, socket, data) {
  socket.on("lobby:create", (payload, ack) => {
    try {
      const { quizId, hostName } = payload || {};
      const { lobby, playerId } = createLobby(quizId, hostName);
      socket.join(lobby.id);
      io.to(lobby.id).emit("lobby:update", lobby);
      if (typeof ack === "function") {
        ack({ ok: true, lobby, playerId });
      }
    } catch (err) {
      if (typeof ack === "function") {
        ack({ ok: false, error: err.message || "Failed to create lobby." });
      }
    }
  });

  socket.on("lobby:get", (payload, ack) => {
    try {
      const lobbyId = typeof payload === "string" ? payload : payload?.lobbyId;
      const lobby = getLobby(lobbyId);
      if (!lobby) {
        throw new Error("Lobby not found.");
      }
      socket.join(lobby.id);
      if (typeof ack === "function") {
        ack({ ok: true, lobby });
      }
    } catch (err) {
      if (typeof ack === "function") {
        ack({ ok: false, error: err.message || "Failed to load lobby." });
      }
    }
  });

  socket.on("lobby:join", (payload, ack) => {
    try {
      const lobbyId = payload?.id || payload?.lobbyId;
      const name = payload?.name;
      const { lobby, playerId } = joinLobby(lobbyId, name);
      socket.join(lobby.id);
      io.to(lobby.id).emit("lobby:update", lobby);
      if (typeof ack === "function") {
        ack({ ok: true, lobby, playerId });
      }
    } catch (err) {
      if (typeof ack === "function") {
        ack({ ok: false, error: err.message || "Failed to join lobby." });
      }
    }
  });

  socket.on("lobby:start", (payload, ack) => {
    try {
      const lobbyId = payload?.lobbyId || payload?.id || payload;
      const lobby = startLobby(lobbyId);
      io.to(lobby.id).emit("lobby:update", lobby);
      if (typeof ack === "function") {
        ack({ ok: true, lobby });
      }
    } catch (err) {
      if (typeof ack === "function") {
        ack({ ok: false, error: err.message || "Failed to start lobby." });
      }
    }
  });

  socket.on("lobby:previous", (payload, ack) => {
    try {
      const lobbyId = payload?.lobbyId || payload?.id || payload;
      const lobby = advanceQuestion(lobbyId, -1);
      io.to(lobby.id).emit("lobby:update", lobby);
      if (typeof ack === "function") {
        ack({ ok: true, lobby });
      }
    } catch (err) {
      if (typeof ack === "function") {
        ack({ ok: false, error: err.message || "Failed to move question." });
      }
    }
  });

  socket.on("lobby:next", (payload, ack) => {
    try {
      const lobbyId = payload?.lobbyId || payload?.id || payload;
      const lobby = advanceQuestion(lobbyId, 1);
      io.to(lobby.id).emit("lobby:update", lobby);
      if (typeof ack === "function") {
        ack({ ok: true, lobby });
      }
    } catch (err) {
      if (typeof ack === "function") {
        ack({ ok: false, error: err.message || "Failed to move question." });
      }
    }
  });

  socket.on("lobby:submitGuess", (payload, ack) => {
    try {
      const lobbyId = payload?.lobbyId || payload?.id;
      const { lobby, guess } = submitGuess(lobbyId, payload);
      io.to(lobby.id).emit("lobby:update", lobby);
      if (typeof ack === "function") {
        ack({ ok: true, lobby, guess });
      }
    } catch (err) {
      if (typeof ack === "function") {
        ack({ ok: false, error: err.message || "Failed to submit guess." });
      }
    }
  });
  
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  socket.on('createPoll', function(d) {
    data.createPoll(d.pollId, d.lang)
    socket.emit('pollData', data.getPoll(d.pollId));
  });

  socket.on('addQuestion', function(d) {
    data.addQuestion(d.pollId, {q: d.q, a: d.a});
    socket.emit('questionUpdate', data.activateQuestion(d.pollId));
  });

  socket.on('playerGuess', function(d) {
  if (!d || !d.pollId) return;
  io.to(d.pollId).emit('playerGuess', d);
});

  socket.on('joinPoll', function(pollId) {
    socket.join(pollId);
    socket.emit('questionUpdate', data.activateQuestion(pollId))
    socket.emit('submittedAnswersUpdate', data.getSubmittedAnswers(pollId));
  });

  socket.on('participateInPoll', function(d) {
    data.participateInPoll(d.pollId, d.name);
    io.to(d.pollId).emit('participantsUpdate', data.getParticipants(d.pollId));
  });
  socket.on('startPoll', function(pollId) {
    io.to(pollId).emit('startPoll');
  })
  socket.on('runQuestion', function(d) {
    let question = data.activateQuestion(d.pollId, d.questionNumber);
    io.to(d.pollId).emit('questionUpdate', question);
    io.to(d.pollId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.pollId));
  });

  socket.on('submitAnswer', function(d) {
    data.submitAnswer(d.pollId, d.answer);
    io.to(d.pollId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.pollId));
  }); 
}

export { sockets };
