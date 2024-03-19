const { Player } = require("./Player");
const { sessionsEvent } = require("./Session");
const { log } = require('./utillities/logger');

class Room {
    constructor(title, hostSession) {
        this.id = hostSession.SID;
        this.title = title;
        this.players = [];
        this.hostSession = hostSession;
    }

    addPlayer(player) {
        if (this.players.some(player => player.PID === player.PID)) {//Player doesn't exist
            return false;
        }
        //Add player
        this.players.push(player);
        player.room = this;
        return true;
    }

    removePlayer(PID) {
        const index = this.players.findIndex(player => player.PID === PID);
        if (index === -1) {
            return false;
        }

        //Remove existing player
        this.players.splice(index);

        return true;
    }

    hasPlayer(PID) {
        return this.players.some(player => player.PID === PID);
    }

    toString() {
        return `ROOM[${this.title}#${this.id}<(${this.players.length})players>]`;
    }

    /**
     * Is called when a room is destroyed and removed from the list of rooms.
     * Kicks out all players from the room
     */
    destroy() {
        this.players.forEach(player => {
            this.removePlayer(player.PID);
        })
        this.id = null;
        this.hostSession = null;
        this.title = null;
    }
}

///ROOMS
let rooms = []

///EVENTS
sessionsEvent.on("logout", (session, player) => {
    if (player.room == null)
        return;

    player.room.removePlayer(player.PID);
});

sessionsEvent.on("terminate", (session) => {
    for (const room of rooms) {
        if (room.hostSession.SID === session.SID) {
            destroyRoom(room.id);
            break;
        }
    }
})


///LOGIC
/**
 * Can only create a room of the owner exists and does not belong to any other room.
 */
function createRoom(title, hostSession) {
    for(const room of rooms){
        if(room.hostSession.SID === hostSession.SID){
            throw new Error(`${hostSession} is already hosting ${room}.`);
        }
    }

    const room = new Room(title, hostSession);
    rooms.push(room);
    return room;
}

function destroyRoom(roomId) {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].id === roomId) {
            log(`Destroyed ${rooms[i]}.`);
            rooms[i].destroy();
            rooms.splice(i);
            break;
        }
    }
}

function getRoomOfId(id) {
    for (const room of rooms) {
        if (room.id === id) {
            return room;
        }
    }
}

module.exports = { Room, createRoom }