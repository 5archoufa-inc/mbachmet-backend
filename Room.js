const { Player } = "./Player";

class Room {
    constructor(title, owner) {
        this.id = owner.PID;
        this.title = title;
        this.owner = owner;
        this.players = [owner];
    }

    addPlayer(player) {
        if (this.players.some(player => player.PID === player.PID)) {//Player doesn't exist
            return false;
        }

        //Add player
        this.players.push(player);
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

    hasPlayer(target) {
        return this.players.some(player => player.PID === target.PID);
    }

    toString(){
        return `ROOM[${this.title}#${this.id}<(${this.players.length})players>]`;
    }
}

let rooms = []

/**
 * Can only create a room of the owner exists and does not belong to any other room.
 */
function createRoom(title, owner) {
    if (rooms.some(room => room.hasPlayer(owner)))
        return null;

    const room = new Room(title, owner);
    rooms.push(room);
    return room;
}

function joinRoom(roomId, playerId) {
    const targetRoom = getRoomOfId(roomId);
    if (targetRoom == null)
        return false;

    if (targetRoom.playerIds.some(id => id === playerId))
        return false;

    targetRoom.playerIds.push(playerId);
    return true;
}

function getRoomOfId(id) {
    rooms.forEach(room => {
        if (room.id === id) {
            return room;
        }
    });
}

module.exports = { Room, createRoom, joinRoom }