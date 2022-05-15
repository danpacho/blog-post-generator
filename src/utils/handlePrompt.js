import chalk from "chalk";
import inquirer from "inquirer";

import {
    TAB,
    D_TAB,
    logClear,
    logSlectMessage,
    logErrorMessage,
    logUserTypeMessage,
    exitOnError,
} from "./index.js";

async function getUserInputValue({ key, inputType = "TYPE", inputMessage }) {
    try {
        while (true) {
            const userInput = await inquirer.prompt({
                name: key,
                type: "input",
                message: `${TAB}${chalk.bgYellow(
                    ` ${inputType} `
                )} ${inputMessage}:`,
            });

            const userInputValue = userInput[key]?.trim();
            if (userInputValue !== "" && userInputValue) {
                logUserTypeMessage(userInputValue);
                return userInputValue;
            }
            logClear();
            logErrorMessage("Don't Type empty string");
        }
    } catch (e) {
        logErrorMessage(`${inputType} ${key} error\n\n${D_TAB}${e}`);
        exitOnError();
    }
}

async function getUserSlectValue({
    key,
    choices,
    inputType = "SLECT",
    inputMessage,
    customeErrorMessage = "",
}) {
    if (!Array.isArray(choices) || choices.length === 0) {
        logErrorMessage(
            `No ${inputMessage} in your blog\n\n${D_TAB}Check ${inputMessage} is correctly exisiting`
        );
        exitOnError();
        return;
    }
    try {
        const userSlect = await inquirer.prompt({
            name: key,
            type: "list",
            message: `${TAB}${chalk.bgCyan(` ${inputType} `)} ${inputMessage}:`,
            choices,
            default: () => choices[0],
        });

        const userSlectValue = userSlect[key];
        logSlectMessage(userSlectValue);

        return userSlectValue;
    } catch (e) {
        logErrorMessage(
            `${
                customeErrorMessage ? `${customeErrorMessage}\n${D_TAB}` : ""
            }${inputType} ${key} error\n\n${e}`
        );
        exitOnError();
    }
}

function removeErrorParam(inputString) {
    const errorParam = /[\/|?|=]/g;
    return inputString.replace(errorParam, "");
}

export { getUserInputValue, getUserSlectValue, removeErrorParam };
