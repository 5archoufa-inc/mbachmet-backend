const { Player } = require("./Player");
const { sessionsEvent } = require("./Session");
const { log } = require('./utillities/logger');
const { createNumberGenerator } = require("./utillities/codeGenerator");
let generateRoomId = null;
createNumberGenerator(6).then(generator => {
    generateRoomId = generator;
});

class Room {
    constructor(title, hostSession) {
        this.id = generateRoomId();
        this.title = title;
        this.players = [];
        this.hostSession = hostSession;
    }

    /**
     * Performs the necessary checks to ensure that the player can be properly added.
     */
    addPlayer(player) {
        if(player.room?.id === this.id) //Player already a member
            return;
        else if(player.room != null)
            throw new Error(`Unable to add player to room: ${player} is already a member of another room`);

        //Add player
        this.players.push(player);
        player.room = this;
        log(`${player} joined ${this.toString()}`);
        return;
    }

    removePlayer(player) {
        const index = this.players.findIndex(p => p.PID === player.PID);
        if (index === -1)
            return;

        this.players.splice(index);
        log(`${this} removed ${player}`);
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

    player.room.removePlayer(player);
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
    for (const room of rooms) {
        if (room.hostSession.SID === hostSession.SID) {
            throw new Error(`${hostSession} is already hosting ${room}.`);
        }
    }

    const room = new Room(title, hostSession);
    rooms.push(room);
    return room;
}

function joinRoom(room, player) {
    /*const room = getRoomOfId(roomId);
    if (room == null) {
        throw new Error(`No room of id(${hostSession}).`);
    }*/

    room.addPlayer(player);
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

module.exports = { Room, createRoom, joinRoom, getRoomOfId }