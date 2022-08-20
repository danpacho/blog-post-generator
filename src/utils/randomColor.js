/**
 * @returns Random HEX color
 */
const generateHEX = () =>
    `#${Math.floor(Math.random() * (0xffffff + 1))
        .toString(16)
        .padStart(6, "0")}`

// eslint-disable-next-line import/prefer-default-export
export { generateHEX }
