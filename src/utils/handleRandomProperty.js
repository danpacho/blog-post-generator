//* generate random property
const generateID = () => (Math.random() + 1).toString(36).slice(7);

const generateHEX = () =>
    `#${Math.floor(Math.random() * (0xffffff + 1))
        .toString(16)
        .padStart(6, "0")}`;

export { generateID, generateHEX };
