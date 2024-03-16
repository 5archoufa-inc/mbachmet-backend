const express = require(`express`);
const { createServer } = require(`node:http`);
const { Server } = require(`socket.io`);
const { Player, generatePlayerId } = require(`./Player`);
const { log, logSessionStart } = require("./utillities/logger");
const sessionRouter = require("./Routers/SessionRouter");
const {addSession,removeSession} = require('./Session.js');
const roomRouter = require("./Routers/RoomRouter.js");

const app = express();
const server = createServer(app);
const io = new Server(server);

logSessionStart();
app.use(express.json());

//Routers
app.use("/game", sessionRouter);
app.use("/game", roomRouter);

server.listen(3000, () => {
    log(`server running at http://localhost:3000`);
});

io.on("connection", (socket) => {
    addSession(socket.id);
    socket.join("dev");

    socket.on("input", (horizontal, vertical) => {
        //log(horizontal, vertical)
        io.to("dev").emit("input", horizontal, vertical);
    });

    socket.on("disconnecting", (reason) => {
        removeSession(socket.id);
    });
})