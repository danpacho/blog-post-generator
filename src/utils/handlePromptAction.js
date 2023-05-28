import chalk from "chalk"
import inquirer from "inquirer"

import { TAB, D_TAB } from "./tab.js"
import {
    logClear,
    logErrorMessage,
    logSelectMessage,
    logUserTypeMessage,
} from "./logger.js"
import { exitOnError } from "./process.js"

/**
 * User input prompt
 * @param {InputOption} options
 * @typedef InputOption
 * @property {string} [key]
 * @property {string?} [inputType]
 * @property {string} [inputMessage]
 * @returns {Promise<string>} userInputValue
 */
async function getUserInputValue({ key, inputType = "TYPE", inputMessage }) {
    try {
        const loopStart = true
        while (loopStart) {
            const userInput = /** @type {{[key:string]:string}} */ (
                await inquirer.prompt({
                    name: key,
                    type: "input",
                    message: `${TAB}${chalk.bgYellow(
                        ` ${inputType} `
                    )} ${inputMessage}:`,
                })
            )
            const userInputValue = userInput[key]?.trim()
            if (userInputValue !== "" && userInputValue) {
                logUserTypeMessage(userInputValue)
                return userInputValue
            }
            logClear()
            logErrorMessage("Don't Type empty string")
        }
    } catch (e) {
        logErrorMessage(`${inputType} ${key} error\n\n${D_TAB}${e}`)
        exitOnError()
    }
}

/**
 * User selected input prompt
 * @param {Option} SelectOptions
 * @typedef Option
 * @property {string} [key]
 * @property {string[]} [choices]
 * @property {string?} [inputType]
 * @property {string} [inputMessage]
 * @property {string?} [customErrorMessage]
 * @returns {Promise<string>} userSelectedValue
 */
async function getUserSelectValue({
    key,
    choices,
    inputType = "SELECT",
    inputMessage,
    customErrorMessage = "",
}) {
    if (!Array.isArray(choices) || choices.length === 0) {
        logErrorMessage(
            `No ${inputMessage} in your blog\n\n${D_TAB}Check ${inputMessage} is correctly exisiting`
        )
        exitOnError()
        return
    }
    try {
        const userSelect = /** @type {{[key:string]:string}} */ (
            await inquirer.prompt({
                name: key,
                type: "list",
                message: `${TAB}${chalk.bgCyan(
                    ` ${inputType} `
                )} ${inputMessage}:`,
                choices,
                default: () => choices[0],
            })
        )

        const userSelectValue = userSelect[key]
        logSelectMessage(userSelectValue)

        return userSelectValue
    } catch (e) {
        logErrorMessage(
            `${
                customErrorMessage ? `${customErrorMessage}\n${D_TAB}` : ""
            }${inputType} ${key} error\n\n${e}`
        )
        exitOnError()
    }
}

/**
 * @param {string} inputString
 * @returns {string} Remove `/` `?` `=` from `inputString`
 */
function removeErrorParam(inputString) {
    const errorParam = /[/|?|=]/g
    return inputString.replace(errorParam, "")
}

export { getUserInputValue, getUserSelectValue, removeErrorParam }
