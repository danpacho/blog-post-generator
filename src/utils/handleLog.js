import chalk from "chalk";
import { createSpinner } from "nanospinner";

import { D_TAB, TAB } from "./index.js";

/**
 * @log Message
 * @param {string} message
 */
const log = (message) => console.log(`${message}\n`);
/**
 * @log Clear Message
 */
const logClear = () => console.clear();
/**
 * @log `slectedInput` message
 * @param {string} slectedInput
 */
const logSlectMessage = (slectedInput) =>
    log(
        `\n${D_TAB}You Slect ${chalk.greenBright(
            `[ ${chalk.bold(slectedInput)} ]`
        )}`
    );
/**
 * @log `typingInput` message
 * @param {string} typingInput
 */
const logUserTypeMessage = (typingInput) =>
    log(
        `\n${D_TAB}You Type ${chalk.yellowBright(
            `[ ${chalk.bold(typingInput)} ]`
        )}`
    );
/**
 * @log Error with `errorDescription`
 * @param {string} errorDescription
 */
const logErrorMessage = (errorDescription) =>
    log(`\n${D_TAB}${chalk.bgRed(" ERROR ")} ${chalk.bold(errorDescription)}`);

/**
 * @log `dir` or `file` Generation process message
 * @param {{generatingObjectName: string; savePath?: string}} generationProcessOption
 * @returns {{start: () => import("nanospinner").Spinner; success: () => import("nanospinner").Spinner; error: () => import("nanospinner").Spinner}}
 */
const logGenProcess = ({ generatingObjectName, savePath = undefined }) => {
    const genProcess = createSpinner();

    const savePathMessage = savePath
        ? `at\n\n${D_TAB}${chalk.greenBright(savePath)}\n`
        : "";
    return {
        start: () =>
            genProcess.start({
                text: `${TAB}${chalk.bgCyanBright(
                    ` ${chalk.bold("CREATING")} `
                )} ${chalk.bold(`[ ${generatingObjectName} ]`)}\n`,
            }),
        success: () =>
            genProcess.success({
                text: `${TAB}${chalk.bgGreenBright(
                    ` ${chalk.bold("SUCCESS")} `
                )} ${chalk.bold(
                    `[ ${generatingObjectName} ] generated ${savePathMessage}`
                )}`,
            }),
        error: () =>
            genProcess.error({
                text: `${TAB}${chalk.bgRed(
                    ` ${chalk.bold("FAILED")} `
                )} ${chalk.redBright(
                    `${chalk.bold(
                        `[ ${generatingObjectName} ] generation failed ${savePathMessage}`
                    )}`
                )}`,
            }),
    };
};

export {
    log,
    logClear,
    logSlectMessage,
    logUserTypeMessage,
    logErrorMessage,
    logGenProcess,
};
