import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const corsOrigin = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
  : true;

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ["GET"],
    credentials: true,
  },
});

// Read in the "class" to store all our data on the server side
// If you need to change how data is handled, check the Data.js file!

import { Data } from "./Data.js";

//
import { sockets } from "./sockets.js";

let data = new Data();

io.on('connection', function (socket) {
  sockets(this, socket, data);
});

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 3000;

let hasRetried = false;

const startServer = (port = PORT) => {
  httpServer.listen(port, HOST, () => {
    const actualPort = httpServer.address().port;
    console.log(`Socket.io server running on http://${HOST}:${actualPort}`);
  });
};

httpServer.on("error", (err) => {
  if (["EACCES", "EADDRINUSE", "EPERM"].includes(err.code) && !hasRetried) {
    hasRetried = true;
    console.warn(
      `Port ${PORT} unavailable (${err.code}). Retrying on a random available port...`
    );
    startServer(0); // 0 = let OS choose an open port
  } else {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
});

startServer();
