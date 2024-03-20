async function createNumberGenerator(length) {
    let generator = null;
    await import('nanoid').then(({ customAlphabet }) => {
        const numbers = '0123456789';
        generator = customAlphabet(numbers, length);
    });
    return generator;
}

module.exports = { createNumberGenerator };