import { mkdir, readdir, writeFile } from "fs/promises";
import { join } from "path";

import { GENERATION_TIME, MAC_OS_FILE_EXCEPTION } from "../constant/index.js";

import {
    logErrorMessage,
    logGenProcess,
    exitOnError,
    getUserSlectValue,
    sleep,
    D_TAB,
} from "./index.js";

/**
 * @get Blog current working file directory path
 * @param {string} inputPath
 * @returns {string} `cwd()` + `inputPath`
 */
const getBlogFilePath = (inputPath) => join(process.cwd(), inputPath);

/**
 * @get Blog directory name from project `ROOT` dir
 * @returns {Promise<{blogDirectoryName: string}>} blogDirectoryName
 */
async function getBlogDirectoryName() {
    const NON_DIR_CANDIDATE_ARRAY = [
        MAC_OS_FILE_EXCEPTION,
        ".vscode",
        ".next",
        ".lock",
        ".json",
        ".mdx",
        ".md",
        ".txt",
        ".js",
        ".ts",
        ".git",
        ".yaml",
        ".xml",
        ".png",
        ".jpg",
        ".log",
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
    ];
    const blogPathCandidate = await (
        await readdir(process.cwd(), "utf-8")
    ).filter(
        (file) =>
            !NON_DIR_CANDIDATE_ARRAY.map((NON_DIR) =>
                file.includes(NON_DIR)
            ).includes(true)
    );

    const blogDirectoryName = await getUserSlectValue({
        key: "directory_name",
        choices: blogPathCandidate,
        inputMessage: "Blog Post Directory Name",
        customeErrorMessage: "No Suitable Blog Folder Found",
    });

    return {
        blogDirectoryName,
    };
}

/**
 * @get All category name from `blogDirectoryName`/contents
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
        ).filter((category) => category !== MAC_OS_FILE_EXCEPTION);
        if (!Array.isArray(allCategory)) throw Error();

        return {
            category: allCategory,
        };
    } catch (err) {
        logErrorMessage(
            `Directory Read Error, Might be no category folder at ${blogDirectoryName} folder`
        );
        exitOnError();
        return;
    }
}

/**
 * @make Directory with `path` and named it as `generatingObjectName`
 * @param {{path: string; generatingObjectName: string }} directoryOption
 */
async function makeDirectory({ path, generatingObjectName }) {
    const { start, success, error } = logGenProcess({
        generatingObjectName,
        savePath: path,
    });

    try {
        start();
        await sleep(GENERATION_TIME);
        await mkdir(path, { recursive: true });
        success();
    } catch (e) {
        error();
        logErrorMessage(`\n\n${D_TAB}${e}`);
        exitOnError();
        return;
    }
}

/**
 * @make File with `path` and named it as `generatingObjectName`
 * @param {{path: string; fileType: "txt" | "json" | "mdx"; data: string; generatingObjectName: string}} fileOption
 */
async function makeFile({ path, fileType, data, generatingObjectName }) {
    const { start, success, error } = logGenProcess({
        generatingObjectName,
        savePath: path,
    });

    try {
        start();
        await sleep(GENERATION_TIME);
        const filePath = `${path}.${fileType}`;
        await writeFile(filePath, data, "utf-8");
        success();
    } catch (e) {
        error();
        logErrorMessage(`\n\n${D_TAB}${e}`);
        exitOnError();
        return;
    }
}

export {
    getBlogDirectoryName,
    getAllCategoryName,
    getBlogFilePath,
    makeDirectory,
    makeFile,
};
