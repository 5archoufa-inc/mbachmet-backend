let generate6NumerID;
import('nanoid').then(({ customAlphabet }) => {
    const numbers = '0123456789';
    generate6NumerID = customAlphabet(numbers, 6);
});

class Player {
    constuctor(username, id) {
        this.username = username;
        this.id = id;
    }
}

players = []

function generatePlayerId() {
    let code = generate6NumerID();
    while (players.some(player => player.id === code)) {
        code = nanoid(6); // Generate a new code if it already exists
    }
    return code;
}

module.exports = {Player, players, generatePlayerId}