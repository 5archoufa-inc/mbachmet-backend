const express = require("express");
const roomRouter = express.Router();
const {log} = require("../utillities/logger.js");
const { Room, createRoom, joinRoom } = require(`../Room.js`);
const { Player } = require(`../Player`);
const { getPlayerBySID } = require(`../Session.js`);

const {
    sessions,
    loginPlayerToSession,
    removeSession
} = require('../Session.js');

// Route definitions
roomRouter.post("/room/create", (req, res) => {
    const { session, roomTitle } = req.body;
    const player = getPlayerBySID(session.SID);
    if(player == null){
        log(`Something went wrong, no records of player at session SID[${session.SID}].`);
        return;
    }

    log(`${player} is trying to create a room of title[${roomTitle}]`)
    const room = createRoom(roomTitle, player);
    if (room) {
        res.status(200).json({
            roomId: room.id
        });
        log(`${player} created ${room}`)
    } else {
        res.status(500).json({
            error: "Player is already a member of another room."
        });
        log(`${player} failed to create a room of title[${roomTitle}]`)
    }
});

roomRouter.post("/room/join", (req, res) => {
    const { player, roomId } = req.body;
    
    if (joinRoom(roomId, player.PID)) {
        res.status(200).json({ roomId });
        log(`Player ${player.username}#${player.PID} joined the room #${roomId}`)
    } else {
        res.status(500).json({
            error: "An error occured"
        });
        log(`Player ${player.username}#${player.PID} failed to join the room #${roomId}`);
    }
});

module.exports = roomRouter;