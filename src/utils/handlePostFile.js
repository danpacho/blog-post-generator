import { mkdir, readdir, writeFile } from "fs/promises";
import { join } from "path";

import { MAC_OS_FILE_EXCEPTION } from "../constant/index.js";

import {
    logErrorMessage,
    logGenProcess,
    exitOnError,
    getUserSlectValue,
    sleep,
    D_TAB,
} from "./index.js";

const getBlogFilePath = (path) => join(process.cwd(), path);

async function getBlogDirectoryName() {
    const NOT_DIR_CANDIDATE_ARRAY = [
        MAC_OS_FILE_EXCEPTION,
        "node_modules",
        ".vscode",
        ".next",
        "public",
        "src",
        ".eslintrc.json",
        ".gitnore",
        ".prettierrc",
        "blog.config.ts",
        "mdx.d.ts",
        "next-env.d.ts",
        "next.config.js",
        "package-lock.json",
        "package.json",
        "README.md",
        "tsconfig.json",
        "tsconfig.path.json",
        "yarn.lock",
        ".git",
        ".gitignore",
        "index.js",
    ];
    const pathCandidate = await (
        await readdir(process.cwd(), "utf-8")
    ).filter((file) => !NOT_DIR_CANDIDATE_ARRAY.includes(file));

    const blogDirectoryName = await getUserSlectValue({
        key: "directory_name",
        choices: pathCandidate,
        inputMessage: "Blog Post Directory Name",
        customeErrorMessage: "No Suitable Blog Folder Found",
    });

    return {
        blogDirectoryName,
    };
}
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

async function makeDirectory({ path, generatingObjectName }) {
    const { start, success, error } = logGenProcess({
        generatingObjectName,
        savePath: path,
    });

    try {
        start();
        await sleep(1000);
        await mkdir(path, { recursive: true });
        success();
    } catch (e) {
        error();
        logErrorMessage(`\n\n${D_TAB}${e}`);
        exitOnError();
        return;
    }
}

async function makeFile({ path, fileType, data, generatingObjectName }) {
    const { start, success, error } = logGenProcess({
        generatingObjectName,
        savePath: path,
    });

    try {
        start();
        await sleep(1000);
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
