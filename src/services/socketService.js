import { io } from "socket.io-client";
import { SOCKET_SERVER_URL } from "./socketConfig";

const socket = io(SOCKET_SERVER_URL, { autoConnect: true });

const emitWithAck = (event, payload, timeout = 5000) =>
  new Promise((resolve, reject) => {
    socket.timeout(timeout).emit(event, payload, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });

export { socket, emitWithAck };
export default socket;
