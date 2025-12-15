import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = "http://localhost:3000"; 
const socket = io(SOCKET_SERVER_URL);

export const joinLobby = (lobbyId, playerName) => {
    socket.emit('lobby:join', { 
        id: lobbyId, 
        name: playerName 
    });
};

export const onLobbyJoined = (callback) => {
    socket.on('lobby:joined', callback);
};

export default socket;