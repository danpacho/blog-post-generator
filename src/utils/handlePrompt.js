import chalk from "chalk";
import inquirer from "inquirer";

import {
    TAB,
    logChooseMessage,
    logErrorMessage,
    logUserTypeMessage,
} from "./index.js";

async function getUserInputValue({ key, inputType = "TYPE", inputMessage }) {
    const userInput = await inquirer.prompt({
        name: key,
        type: "input",
        message: `${TAB}${chalk.bgYellow(` ${inputType} `)} ${inputMessage}:`,
    });
    const userInputValue = userInput[key]?.trim();
    logUserTypeMessage(userInputValue);

    return userInputValue;
}

async function getUserSlectValue({
    key,
    choices,
    inputType = "SLECT",
    inputMessage,
}) {
    if (!Array.isArray(choices)) {
        logErrorMessage("Invalid Slect Input");
        return;
    }
    const userSlect = await inquirer.prompt({
        name: key,
        type: "list",
        message: `${TAB}${chalk.bgCyan(` ${inputType} `)} ${inputMessage}:`,
        choices,
        default: () => choices[0],
    });

    const userSlectValue = userSlect[key];
    logChooseMessage(userSlectValue);

    return userSlectValue;
}

export { getUserInputValue, getUserSlectValue };
