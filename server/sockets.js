import { readFileSync } from "fs";
import {
  createLobby,
  getLobby,
  joinLobby,
  startLobby,
  advanceQuestion,
  submitGuess,
  listQuizes,
  addQuiz,
} from "./lobbyStore.js";

const normalizeLang = (lang) =>
  ["en", "sv"].includes(String(lang || "").trim().toLowerCase())
    ? String(lang).trim().toLowerCase()
    : "en";

const getUILabels = (lang) => {
  const safeLang = normalizeLang(lang);
  const labelsPath = new URL(`./data/labels-${safeLang}.json`, import.meta.url);
  return JSON.parse(readFileSync(labelsPath, "utf-8"));
};

function sockets(io, socket) {
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

  socket.on("quiz:list", (_payload, ack) => {
    try {
      const quizes = listQuizes();
      if (typeof ack === "function") {
        ack({ ok: true, quizes });
      }
    } catch (err) {
      if (typeof ack === "function") {
        ack({ ok: false, error: err.message || "Failed to load quizzes." });
      }
    }
  });

  socket.on("quiz:create", (payload, ack) => {
    try {
      const quiz = addQuiz(payload);
      const quizes = listQuizes();
      io.emit("quiz:updated", quizes);
      if (typeof ack === "function") {
        ack({ ok: true, quiz, quizes });
      }
    } catch (err) {
      if (typeof ack === "function") {
        ack({ ok: false, error: err.message || "Failed to create quiz." });
      }
    }
  });

  socket.on("getUILabels", (lang) => {
    socket.emit("uiLabels", getUILabels(lang));
  });
}

export { sockets };
