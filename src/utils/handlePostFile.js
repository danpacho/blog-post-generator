import { readdir } from "fs/promises";
import { join } from "path";

import { MAC_OS_FILE_EXCEPTION } from "../constant/index.js";
import { getUserSlectValue } from "./handlePrompt.js";

const getBlogFilePath = (path) => join(process.cwd(), path);

async function getBlogDirectoryName() {
    try {
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
        });

        return {
            blogDirectoryName,
            isError: false,
        };
    } catch (e) {
        return {
            isError: true,
        };
    }
}
async function getAllCategoryName(blogDirectoryName) {
    try {
        return {
            category: (
                await readdir(
                    await getBlogFilePath(`${blogDirectoryName}/contents`),
                    "utf-8"
                )
            ).filter((category) => category !== MAC_OS_FILE_EXCEPTION),
            isError: false,
        };
    } catch (err) {
        return {
            isError: true,
        };
    }
}

export { getBlogDirectoryName, getAllCategoryName, getBlogFilePath };
