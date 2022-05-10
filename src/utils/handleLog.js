import chalk from "chalk";
import { createSpinner } from "nanospinner";

import { D_TAB, TAB } from "./index.js";

const log = (message) => console.log(`${message}\n`);
const logClear = () => console.clear();
const logSlectMessage = (slectedInput) =>
    log(
        `\n${D_TAB}You Slect ${chalk.greenBright(
            `[ ${chalk.bold(slectedInput)} ]`
        )}`
    );
const logUserTypeMessage = (typingInput) =>
    log(
        `\n${D_TAB}You Type ${chalk.yellowBright(
            `[ ${chalk.bold(typingInput)} ]`
        )}`
    );
const logErrorMessage = (errorDescription) =>
    log(`\n${D_TAB}${chalk.bgRed(" ERROR ")} ${chalk.bold(errorDescription)}`);

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
