const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
server.listen(3000, () => {
    console.log("server running at http://localhost:3000");
});

app.get("/rooms/:id/", (req, res) => {
    console.log("User attempted to join room:", req.params.id);
});

io.on("connection", (socket) => {
    console.log("Player <", socket.id, "> connected");
    socket.join("dev");

    socket.on("chat", (msg) => {
        console.log("Essayed sent a message:", msg);
    });

    socket.on("input", (horizontal, vertical) => {
        //console.log(horizontal, vertical)
        io.to("dev").emit("input", horizontal, vertical);
    });

    socket.on("disconnecting", (reason) => {
        console.log(socket.id, "Player <", socket.id, "disconnected. Reason:", reason)
    });
})