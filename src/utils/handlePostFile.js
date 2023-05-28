import chalk from "chalk"

import { mkdir, readdir, writeFile } from "fs/promises"
import { join } from "path"

import { GENERATION_TIME, MAC_OS_FILE_EXCEPTION } from "../constant/index.js"

import { D_TAB } from "./tab.js"
import { sleep } from "./sleep.js"
import { log, logErrorMessage, logGenProcess } from "./logger.js"
import { exitOnError } from "./process.js"
import { getUserSelectValue } from "./handlePromptAction.js"

/**
 * @description Blog current working file directory path
 * @param {string} inputPath
 * @returns {string} `cwd()` + `inputPath`
 */
const getBlogFilePath = (inputPath) => join(process.cwd(), inputPath)

/**
 * @description Blog directory name from project `ROOT` dir
 * @returns {Promise<{blogDirectoryName: string}>} blogDirectoryName
 */
async function getBlogDirectoryName() {
    const NON_DIR_CANDIDATE_ARRAY = [
        "app",
        "rc",
        "info",
        "config",
        "build",
        "scripts",
        "attributes",
        "ignore",
        "node_modules",
        "src",
        "public",
        "LICENSE",
        "Dockerfile",
        "github",
    ]
    const blogPathCandidate = (await readdir(process.cwd(), "utf-8")).filter(
        (file) =>
            NON_DIR_CANDIDATE_ARRAY.map((NON_DIR) =>
                file.includes(NON_DIR)
            ).includes(true) === false && file.includes(".") === false
    )

    const isBlogDirectoryNameUnique = blogPathCandidate.length === 1
    if (isBlogDirectoryNameUnique) {
        log(
            `${D_TAB}Your Blog Directory: ${chalk.bgWhiteBright(
                ` ${chalk.bold(blogPathCandidate[0])} `
            )}`
        )
        return {
            blogDirectoryName: blogPathCandidate[0],
        }
    }

    const blogDirectoryName = await getUserSelectValue({
        key: "directory_name",
        choices: blogPathCandidate,
        inputMessage: "Blog Post Directory Name",
        customErrorMessage: "No Suitable Blog Folder Found",
    })

    return {
        blogDirectoryName,
    }
}

/**
 * @description All category name from `blogDirectoryName`/contents
 * @param {string} blogDirectoryName
 * @returns {Promise<{category: string[]}>} all category
 */
async function getAllCategoryName(blogDirectoryName) {
    try {
        const allCategory = (
            await readdir(
                await getBlogFilePath(`${blogDirectoryName}/contents`),
                "utf-8"
            )
        ).filter((category) => category !== MAC_OS_FILE_EXCEPTION)
        if (!Array.isArray(allCategory)) throw Error()

        return {
            category: allCategory,
        }
    } catch (err) {
        logErrorMessage(
            `Directory Read Error, Might be no category folder at ${blogDirectoryName} folder`
        )
        exitOnError()
        return {
            category: [],
        }
    }
}

/**
 * @description Directory with `path` and named it as `generatingObjectName`
 * @param {{path: string; generatingObjectName: string }} directoryOption
 */
async function makeDirectory({ path, generatingObjectName }) {
    const { start, success, error } = logGenProcess({
        generatingObjectName,
        savePath: path,
    })

    try {
        start()
        await sleep(GENERATION_TIME)
        await mkdir(path, { recursive: true })
        success()
    } catch (e) {
        error()
        logErrorMessage(`\n\n${D_TAB}${e}`)
        exitOnError()
    }
}

/**
 * @description File with `path` and named it as `generatingObjectName`
 * @param {{path: string; fileType: "json" | "mdx"; data: string; generatingObjectName: string}} fileOption
 */
async function makeFile({ path, fileType, data, generatingObjectName }) {
    const { start, success, error } = logGenProcess({
        generatingObjectName,
        savePath: path,
    })

    try {
        start()
        await sleep(GENERATION_TIME)
        const filePath = `${path}.${fileType}`
        await writeFile(filePath, data, "utf-8")
        success()
    } catch (e) {
        error()
        logErrorMessage(`\n\n${D_TAB}${e}`)
        exitOnError()
    }
}

export {
    getBlogDirectoryName,
    getAllCategoryName,
    getBlogFilePath,
    makeDirectory,
    makeFile,
}
