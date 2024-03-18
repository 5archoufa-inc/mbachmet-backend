let generate6NumberID;
import('nanoid').then(({ customAlphabet }) => {
    const numbers = '0123456789';
    generate6NumberID = customAlphabet(numbers, 6);
});

class Player {
    constructor(PID, username) {
        this.PID = PID;
        this.username = username;

        this.room = null;
    }

    toString() {
        return `PLAYER[${this.username}#${this.PID}]`;
    }
}

function generatePlayerId() {
    let code = generate6NumberID();
    /*while (players.some(player => player.id === code)) {
        code = generate6NumberID(); // Generate a new code if it already exists
    }*/
    return code;
}

module.exports = { Player, generatePlayerId }