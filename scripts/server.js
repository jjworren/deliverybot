const fs = require("fs");
const path = require("path");

require("dotenv").config();

const prefix = path.resolve(__dirname, "..", "packages");
const state = {
  server: null,
  sockets: [],
};

function start() {
  state.server = require("../packages/run").express.listen(3000, () => {
    console.log("Listening on 3000");
  });
  state.server.on("connection", (socket) => {
    state.sockets.push(socket);
  });
}

function stop(cb) {
  state.sockets.forEach((socket) => {
    if (!socket.destroyed) socket.destroy();
  });
  state.sockets = [];
  state.server.close(() => {
    cb();
  });
}

function clearCache() {
  Object.keys(require.cache).forEach((id) => {
    if (id.startsWith(prefix)) {
      delete require.cache[id];
    }
  });
}

function shutdown() {
  ["SIGINT", "SIGTERM", "SIGQUIT"].forEach((sig) =>
    process.on(sig, () => stop(() => process.exit(0))),
  );
}

function restart() {
  console.log("Restarting");
  stop(() => {
    clearCache();
    start();
  });
}

fs.watchFile("tmp/restart.txt", () => {
  restart();
});

start();
shutdown();
