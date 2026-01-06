import { reactive } from "vue";
import { emitWithAck, socket } from "@/services/socketService";

const state = reactive({
  lobbies: {},
});

const upsertLobby = (lobby) => {
  if (!lobby?.id) return;
  state.lobbies[lobby.id] = lobby;
};

socket.on("lobby:update", (lobby) => {
  upsertLobby(lobby);
});

const getLobby = (lobbyId) => state.lobbies[lobbyId];

const createLobby = async (quizId, hostName = "Host") => {
  const response = await emitWithAck("lobby:create", { quizId, hostName });
  if (!response?.ok) {
    throw new Error(response?.error || "Could not create lobby.");
  }
  upsertLobby(response.lobby);
  return { lobby: response.lobby, playerId: response.playerId };
};

const joinLobby = async (lobbyId, name) => {
  const response = await emitWithAck("lobby:join", { id: lobbyId, name });
  if (!response?.ok) {
    throw new Error(response?.error || "Could not join lobby.");
  }
  upsertLobby(response.lobby);
  return { lobby: response.lobby, playerId: response.playerId };
};

const fetchLobby = async (lobbyId) => {
  if (!lobbyId) return null;
  const response = await emitWithAck("lobby:get", { lobbyId });
  if (!response?.ok) {
    throw new Error(response?.error || "Could not load lobby.");
  }
  upsertLobby(response.lobby);
  return response.lobby;
};

const startLobby = async (lobbyId) => {
  const response = await emitWithAck("lobby:start", { lobbyId });
  if (!response?.ok) {
    throw new Error(response?.error || "Could not start lobby.");
  }
  upsertLobby(response.lobby);
  return response.lobby;
};

const previousQuestion = async (lobbyId) => {
  const response = await emitWithAck("lobby:previous", { lobbyId });
  if (!response?.ok) {
    throw new Error(response?.error || "Could not move to previous question.");
  }
  upsertLobby(response.lobby);
  return response.lobby;
};

const nextQuestion = async (lobbyId) => {
  const response = await emitWithAck("lobby:next", { lobbyId });
  if (!response?.ok) {
    throw new Error(response?.error || "Could not move to next question.");
  }
  upsertLobby(response.lobby);
  return response.lobby;
};

const submitGuess = async (lobbyId, payload) => {
  const response = await emitWithAck("lobby:submitGuess", {
    lobbyId,
    ...payload,
  });
  if (!response?.ok) {
    throw new Error(response?.error || "Could not submit guess.");
  }
  upsertLobby(response.lobby);
  return response.guess;
};

export {
  state as lobbyState,
  getLobby,
  createLobby,
  joinLobby,
  fetchLobby,
  startLobby,
  previousQuestion,
  nextQuestion,
  submitGuess,
};
