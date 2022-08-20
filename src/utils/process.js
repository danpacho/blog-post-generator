/**
 * @terminal Exit process on `fail`
 */
const exitOnError = () => process.exit(1)
/**
 * @terminal Exit process on `success`
 */
const exitOnSuccess = () => process.exit(0)

export { exitOnError, exitOnSuccess }
