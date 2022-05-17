/**
 * Sleep Terminal process
 * @param {number} sleepTime
 */
const sleep = (sleepTime = 2000) =>
    new Promise((r) => setTimeout(r, sleepTime));

export { sleep };
