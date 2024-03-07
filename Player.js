class Player {
    constuctor(username, id) {
        this.username = username;
        this.id = id;
    }
}

players = []

function generatePlayerId() {
    let code = nanoid(6); // Generate a random 6-character code
    while (players.some(player => player.id === code)) {
        code = nanoid(6); // Generate a new code if it already exists
    }
    return code;
}

module.exports = {Player, players, generatePlayerId}