const express = require(`express`);
const { createServer } = require(`node:http`);
const { Server } = require(`socket.io`);
const { log, logSessionStart } = require("./utillities/logger");
const sessionRouter = require("./routers/SessionRouter.js");
const { addSession, removeSession } = require('./Session.js');
const roomRouter = require("./routers/RoomRouter.js");

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});
io.use((socket, next) => {
    const nature = socket.handshake.query.nature;
    if (nature === "MBACHMET" || nature === "MBACHMET-REMOTE") {
        next();
    } else {
        log(`AUTHENTIFICATION ERROR. NATURE PROVIDED WAS: ${nature}`);
        return next(new Error(`Authentication error: invalid nature(${nature})`));
    }
});

app.use(require("cors")());
app.use(express.json());

//Middleware to check if database is connected.
const { getDb } = require("./database/Database.js");
app.use((req, res, next) => {
    const db = getDb();
    if (db) {
        next();
    } else {
        res.status(500).json({ error: "Error connecting to the database." });
    }
});

//Routers
app.use("/game", sessionRouter);
app.use("/game", roomRouter);

io.on("connection", (socket) => {
    addSession(socket);
    socket.join("dev");

    socket.on("input", (horizontal, vertical) => {
        //log(horizontal, vertical)
        io.to("dev").emit("input", horizontal, vertical);
    });

    socket.on("disconnecting", (reason) => {
        removeSession(socket.id);
    });
})

const { connectToFirestore } = require('./database/Database.js');
async function startServer() {
    logSessionStart();
    connectToFirestore();
    server.listen(3000, () => {
        log(`server running at http://localhost:3000`);
    });
}

startServer();