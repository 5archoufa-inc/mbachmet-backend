const express = require("express");
const roomRouter = express.Router();
const { log } = require("../utillities/logger.js");
const { createRoom, joinRoom } = require(`../Room.js`);
const { getSessionBySID } = require(`../Session.js`);
const { db } = require(`../database/Database.js`);

const {
    sessions,
    loginPlayerToSession,
    removeSession
} = require('../Session.js');

// Route definitions
roomRouter.post("/room/create", (req, res) => {
    const { sessionInfo, roomTitle } = req.body;

    const session = getSessionBySID(sessionInfo.SID);
    if(session == null){
        res.status(500).json({
            error: `No records of a session with SID:${sessionInfo.SID}`
        });
        log(`Failed to create a room: No records of a session with SID:${sessionInfo.SID}`);
        return;
    }

    log(`${session} is trying to create a room of title[${roomTitle}]`)
    try{
        const room = createRoom(roomTitle, session);
        res.status(200).json({
            roomId: room.id
        });
        log(`${session} successfully created ${room}`)
    }catch(error){
        res.status(500).json({
            error
        });
        log(`${session} failed to create a room: ${error}`)
    };
});

roomRouter.post("/room/join", (req, res) => {
    const { playerInfo, roomId } = req.body;

    if (joinRoom(roomId, playerInfo.PID)) {
        res.status(200).json({ roomId });
        log(`Player ${playerInfo.username}#${playerInfo.PID} joined the room #${roomId}`)
    } else {
        res.status(500).json({
            error: "An error occured"
        });
        log(`Player ${playerInfo.username}#${playerInfo.PID} failed to join the room #${roomId}`);
    }
});

module.exports = roomRouter;