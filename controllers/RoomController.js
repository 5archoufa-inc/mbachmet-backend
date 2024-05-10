const { createRoom, joinRoom, getRoomOfId } = require(`../Room.js`);
const { getSessionBySID, getPlayerByPID } = require(`../Session.js`);
const { getDb } = require(`../database/Database.js`);
const { log } = require("../utillities/logger.js");

// Route definitions
async function create(req, res) {
    const { sessionInfo, roomTitle } = req.body;

    const session = getSessionBySID(sessionInfo.SID);
    if (session == null) {
        res.status(500).json({
            error: `No records of a session with SID:${sessionInfo.SID}`
        });
        log(`Failed to create a room: No records of a session with SID:${sessionInfo.SID}`);
        return;
    }

    log(`${session} is trying to create a room of title[${roomTitle}]`)
    try {
        const room = createRoom(roomTitle, session);
        res.status(200).json({
            roomId: room.id
        });
        log(`${session} successfully created ${room}`)
    } catch (error) {
        res.status(500).json({
            error
        });
        log(`${session} failed to create a room: ${error}`)
    };
}

function join(req, res) {
    const { playerInfo, roomId } = req.body;
    const player = getPlayerByPID(playerInfo.PID);
    if (player == null) {
        res.status(500).json({ error: `No records of a player with PID(${playerInfo.PID})` });
        return;
    }
    const room = getRoomOfId(roomId);
    if (room == null) {
        res.status(500).json({ error: `No records of a room with ID(${roomId})` });
        return;
    }
    log(`${player} is trying to join ${room}`)

    try {
        joinRoom(room, player);
        let networkPlayers = []
        room.players.forEach(roomPlayer=>{
            if(roomPlayer.PID == player.PID)
                return;
            networkPlayers.push(roomPlayer.getNetworkPlayerInfo());
        })
        res.status(200).json({
            title: room.title,
            players: networkPlayers,
            colorId: player.colorId
        });
    } catch (error) {
        res.status(500).json({ error });
        log(`${player} failed to join ${room}: ${error}`);
    }
}

module.exports = { create, join };