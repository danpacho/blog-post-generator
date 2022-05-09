import chalk from "chalk";

import { D_TAB } from "./handleTab.js";

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
    log(
        `${D_TAB}${chalk.bgRed(" ERROR ")} ${chalk.bold(
            errorDescription
        )}\n\n${D_TAB}Please Restart 🙏`
    );

export {
    log,
    logClear,
    logSlectMessage as logChooseMessage,
    logUserTypeMessage,
    logErrorMessage,
};
