//* generate random property
const generateID = () => (Math.random() + 1).toString(36).slice(7);
const generateHEX = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}`;

export { generateID, generateHEX };
