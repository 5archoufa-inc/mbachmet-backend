const { Player } = require("./Player");
const { sessionsEvent } = require("./Session");
const { log } = require('./utillities/logger');

class Room {
    constructor(title, owner) {
        this.id = owner.PID;
        this.title = title;
        this.players = [];
        this.addPlayer(owner);
        this.ownerIndex = 0;
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

    setOwner(playerIndex) {
        this.ownerIndex = playerIndex;
    }

    getOwner(){
        return this.players[this.ownerIndex];
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
        this.ownerIndex = -1;
        this.title = null;
        //Allert players
    }
}

///ROOMS
let rooms = []

///EVENTS
sessionsEvent.on("logout", (session, player) => {
    if (player.room == null)
        return;

    removePlayerFromRoom(player.room.id, player.PID);
});


///LOGIC
/**
 * Can only create a room of the owner exists and does not belong to any other room.
 */
function createRoom(title, owner) {
    if(owner.room != null)
        return null;
    if (rooms.some(room => room.hasPlayer(owner.PID)))
        return null;

    const room = new Room(title, owner);
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

function removePlayerFromRoom(roomId, PID) {
    const room = getRoomOfId(roomId);
    if (room == null || !room.hasPlayer(PID))
        return false;

    if (room.getOwner().PID === PID)//Trying to remove the room owner
    {
        if (room.players.length > 1) //Change the room owner
        {
            for (let i = 0; i < room.players.length; i++) {
                if (room.players[i].PID !== PID) {
                    room.setOwner(i);
                    log(`Owner of ${room} logged out. New owner is ${room.players[i]}`);
                    break;
                }
            }
            room.removePlayer(PID);
        } else //Destroy the room
        {
            log(`Owner of ${room} logged out. No players left.`);
            destroyRoom(roomId);
        }
    } else {
        room.removePlayer(PID);
    }
    return true;
}

function getRoomOfId(id) {
    for (const room of rooms) {
        if (room.id === id) {
            return room;
        }
    }
}

module.exports = { Room, createRoom }