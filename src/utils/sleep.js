/**
 * Sleep Terminal process
 * @param {number} sleepTime
 */
const sleep = (sleepTime = 2000) =>
    // eslint-disable-next-line no-promise-executor-return
    new Promise((r) => setTimeout(r, sleepTime))

// eslint-disable-next-line import/prefer-default-export
export { sleep }
