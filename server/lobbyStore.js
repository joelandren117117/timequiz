import { readFileSync } from "fs";

const quizesPath = new URL("./data/quizes.json", import.meta.url);
const quizesData = JSON.parse(readFileSync(quizesPath, "utf-8"));
const quizes = quizesData?.quizes ?? [];

const state = {
  lobbies: {},
};

const getQuizById = (quizId) =>
  quizes.find((quiz) => quiz.id === quizId);

const toRadians = (value) => (value * Math.PI) / 180;

const haversineDistanceKm = (from, to) => {
  const R = 6371;
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const dLat = lat2 - lat1;
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculatePoints = (question, guess) => {
  if (!question?.location || typeof question?.year !== "number") {
    return 0;
  }
  const distanceKm = haversineDistanceKm(question.location, guess);
  const distanceScore = Math.max(
    0,
    Math.round(1000 / (1 + distanceKm / 200))
  );
  const yearDiff = Math.abs(question.year - Number(guess.year));
  const yearScore = Math.max(0, 500 - yearDiff * 10);
  return distanceScore + yearScore;
};

const generateLobbyId = () =>
  Math.random().toString(36).slice(2, 7).toUpperCase();

const createLobby = (quizId, hostName = "Host") => {
  const quiz = getQuizById(quizId);
  if (!quiz) {
    throw new Error("Quiz not found.");
  }

  let id = generateLobbyId();
  while (state.lobbies[id]) {
    id = generateLobbyId();
  }

  const lobby = {
    id,
    quizId,
    status: "waiting", // waiting | started | finished
    host: {
      id: 1,
      name: hostName || "Host",
      points: 0,
    },
    players: [], // players do NOT include host
    nextId: 2,
    guesses: [], // guesses for the current question
    currentQuestionIndex: 0,
    questionCount: quiz.questions?.length ?? 0,
    roundGuesses: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  state.lobbies[id] = lobby;
  return { lobby, playerId: 1 };
};

const getLobby = (lobbyId) => state.lobbies[lobbyId];

const joinLobby = (lobbyId, name) => {
  const lobby = state.lobbies[lobbyId];
  if (!lobby) throw new Error("Lobby not found.");
  if (lobby.players.length >= 5) {
    throw new Error("Lobby is full (max 5 players).");
  }

  const nextId = lobby.nextId;
  lobby.nextId += 1;
  const player = {
    id: nextId,
    name: name || `Player ${nextId}`,
    isHost: false,
    ready: false,
    points: 0,
  };

  lobby.players.push(player);
  lobby.updatedAt = Date.now();
  return { lobby, playerId: nextId };
};

const startLobby = (lobbyId) => {
  const lobby = state.lobbies[lobbyId];
  if (!lobby) throw new Error("Lobby not found.");

  lobby.status = lobby.questionCount > 0 ? "started" : "finished";
  lobby.currentQuestionIndex = 0;
  lobby.guesses = [];
  lobby.roundGuesses = Array.from(
    { length: lobby.questionCount },
    () => ({})
  );
  lobby.host.points = 0;
  lobby.players.forEach((player) => {
    player.points = 0;
  });
  lobby.updatedAt = Date.now();
  return lobby;
};

const advanceQuestion = (lobbyId, delta) => {
  const lobby = state.lobbies[lobbyId];
  if (!lobby) throw new Error("Lobby not found.");

  if (lobby.questionCount === 0) {
    lobby.status = "finished";
    lobby.updatedAt = Date.now();
    return lobby;
  }

  const nextIndex = lobby.currentQuestionIndex + delta;

  if (delta > 0 && nextIndex >= lobby.questionCount) {
    lobby.status = "finished";
    lobby.updatedAt = Date.now();
    return lobby;
  }

  lobby.currentQuestionIndex = Math.max(
    0,
    Math.min(nextIndex, lobby.questionCount - 1)
  );
  lobby.status = "started";
  lobby.guesses = [];
  lobby.updatedAt = Date.now();
  return lobby;
};

const submitGuess = (lobbyId, { playerId, lat, lng, year, name }) => {
  const lobby = state.lobbies[lobbyId];
  if (!lobby) throw new Error("Lobby not found.");
  if (!playerId || lat === undefined || lng === undefined || year === undefined) {
    throw new Error("Missing guess data.");
  }

  if (!Array.isArray(lobby.guesses)) {
    lobby.guesses = [];
  }
  if (!Array.isArray(lobby.roundGuesses)) {
    lobby.roundGuesses = Array.from(
      { length: lobby.questionCount },
      () => ({})
    );
  }

  const playerName =
    name ||
    lobby.players.find((p) => p.id === playerId)?.name ||
    (playerId === lobby.host?.id ? lobby.host?.name : `Player ${playerId}`);

  const quiz = getQuizById(lobby.quizId);
  const question = quiz?.questions?.[lobby.currentQuestionIndex];
  const points = calculatePoints(question, { lat, lng, year });

  const roundIndex = lobby.currentQuestionIndex;
  const roundGuesses = lobby.roundGuesses[roundIndex] || {};
  const previous = roundGuesses[playerId];

  const playerRef =
    playerId === lobby.host?.id
      ? lobby.host
      : lobby.players.find((p) => p.id === playerId);

  if (playerRef) {
    if (previous?.points) {
      playerRef.points = Math.max(0, (playerRef.points || 0) - previous.points);
    }
    playerRef.points = (playerRef.points || 0) + points;
  }

  const existingIdx = lobby.guesses.findIndex((g) => g.playerId === playerId);
  const payload = {
    playerId,
    lat,
    lng,
    year,
    name: playerName,
    points,
    ts: Date.now(),
  };

  if (existingIdx >= 0) {
    lobby.guesses.splice(existingIdx, 1, payload);
  } else {
    lobby.guesses.push(payload);
  }

  roundGuesses[playerId] = payload;
  lobby.roundGuesses[roundIndex] = roundGuesses;

  lobby.updatedAt = Date.now();
  return { lobby, guess: payload };
};

export {
  createLobby,
  getLobby,
  joinLobby,
  startLobby,
  advanceQuestion,
  submitGuess,
};
