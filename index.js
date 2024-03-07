const express = require(`express`);
const { createServer } = require(`node:http`);
const { Server } = require(`socket.io`);
const { Room, createRoom, joinRoom} = require(`./Rooms`);
const { Player, generatePlayerId } = require(`./Player`);

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
server.listen(3000, () => {
    console.log(`server running at http://localhost:3000`);
});

app.post("/room/create", (req, res) => {
    const {player, roomName} = req.body;
    const roomId = createRoom(player.id, roomName);
    if(roomId != -1){
        res.status(200).json({
            roomId
        });
        console.log(`Player ${player.username}#${player.id} created the room ${roomName}#${roomId}`)
    }else{
        res.status(500).json({
            error: "Player is already a member of another room."
        });
        console.log(`Player ${player.username}#${player.id} failed to create a room named \"${roomName}\"`)
    }
});

app.post("/room/join", (req, res)=>{
    const {player, roomId} = req.body;
    if(joinRoom(roomId, player.id)){
        res.status(200).json({roomId});
        console.log(`Player ${player.username}#${player.id} joined the room #${roomId}`)
    }else{
        res.status(500).json({
            error: "An error occured"
        });
        console.log(`Player ${player.username}#${player.id} failed to join the room #${roomId}`)
    }
});

app.post("/player/login", (req, res)=>{
    const {username} = req.body;
    res.status(200).json({id: generatePlayerId()});
});

io.on("connection", (socket) => {
    console.log(`Player <${socket.id}> connected`);
    socket.join("dev");

    socket.on("input", (horizontal, vertical) => {
        //console.log(horizontal, vertical)
        io.to("dev").emit("input", horizontal, vertical);
    });

    socket.on("disconnecting", (reason) => {
        console.log(socket.id, "Player <", socket.id, "disconnected. Reason:", reason)
    });
})