import { reactive } from 'vue';

const storageKey = 'timequiz-lobbies';

const state = reactive({
  lobbies: {},
});

const loadState = () => {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.lobbies && typeof parsed.lobbies === 'object') {
      state.lobbies = parsed.lobbies;
    }
  } catch (err) {
    console.warn('Failed to load lobby state', err);
  }
};

const persist = () => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ lobbies: state.lobbies }));
  } catch (err) {
    console.warn('Failed to persist lobby state', err);
  }
};

loadState();

const generateLobbyId = () =>
  Math.random().toString(36).slice(2, 7).toUpperCase();

const createLobby = (quizId, hostName = 'Host') => {
  const id = generateLobbyId();
  const lobby = {
    id,
    quizId,
    status: 'waiting', // waiting | started | finished
    host: {
      id: 1,
      name: hostName || 'Host',
    },
    players: [], // players do NOT include host
    nextId: 2, // player ids start at 2
    guesses: [], // { playerId, lat, lng, year, name, ts }
    createdAt: Date.now(),
  };
  state.lobbies[id] = lobby;
  persist();
  return { lobby, playerId: 1 };
};

const getLobby = (lobbyId) => state.lobbies[lobbyId];

const joinLobby = (lobbyId, name) => {
  const lobby = state.lobbies[lobbyId];
  if (!lobby) throw new Error('Lobby not found.');
  if (lobby.players.length >= 5) throw new Error('Lobby is full (max 5 players).');

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
  persist();
  return { lobby, playerId: nextId };
};

const startLobby = (lobbyId) => {
  const lobby = state.lobbies[lobbyId];
  if (!lobby) throw new Error('Lobby not found.');
  lobby.status = 'started';
  persist();
};

const submitGuess = (lobbyId, { playerId, lat, lng, year, name }) => {
  const lobby = state.lobbies[lobbyId];
  if (!lobby) throw new Error('Lobby not found.');
  if (!playerId || lat === undefined || lng === undefined || year === undefined) {
    throw new Error('Missing guess data.');
  }
  if (!Array.isArray(lobby.guesses)) {
    lobby.guesses = [];
  }
  const playerName =
    name ||
    lobby.players.find((p) => p.id === playerId)?.name ||
    (playerId === lobby.host?.id ? lobby.host?.name : `Player ${playerId}`);

  const existingIdx = lobby.guesses.findIndex((g) => g.playerId === playerId);
  const payload = { playerId, lat, lng, year, name: playerName, ts: Date.now() };
  if (existingIdx >= 0) {
    lobby.guesses.splice(existingIdx, 1, payload);
  } else {
    lobby.guesses.push(payload);
  }
  persist();
  return payload;
};

export {
  state as lobbyState,
  createLobby,
  getLobby,
  joinLobby,
  startLobby,
  submitGuess,
};
