#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import figlet from "figlet";
import { createSpinner } from "nanospinner";

import { join } from "path";
import { existsSync } from "fs";
import { mkdir, readdir, writeFile } from "fs/promises";

//* CONSTANTS
const MAC_OS_FILE_EXCEPTION = ".DS_Store";

//* TAB Separator
const TAB = "  ";
const D_TAB = `${TAB}${TAB}`;

//* sleep scripts
const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

//* exit utils
const exitOnError = () => process.exit(1);
const exitOnSuccess = () => process.exit(0);

//* log utils
const log = (message) => console.log(`${message}\n`);
const logClear = () => console.clear();
const logChooseMessage = (choosen) =>
    log(
        `\n${D_TAB}You choose ${chalk.greenBright(
            `[ ${chalk.bold(choosen)} ]`
        )}`
    );
const logErrorMessage = (errorDescription) =>
    log(
        `${D_TAB}${chalk.bgRed(" ERROR ")} ${chalk.bold(
            errorDescription
        )}\n\n${D_TAB}Please Restart 🙏`
    );

//* generate random property
const generateID = () => (Math.random() + 1).toString(36).slice(7);
const generateHEX = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}`;

//* blog directory
const getBlogDirectory = (blogContentsDirectoryName) =>
    join(process.cwd(), blogContentsDirectoryName);

const generateMetaData = () => {
    const formatDate = () => {
        const addZeroForDate = (date) => (date.length <= 2 ? `0${date}` : date);

        const CurrentDate = new Date();
        const year = CurrentDate.getFullYear();
        const month = addZeroForDate(String(CurrentDate.getMonth() + 1));
        const date = addZeroForDate(String(CurrentDate.getDate()));

        return `${year}${month}${date}`;
    };
    const update = formatDate();

    return `---
title: TITLE
preview: PREVIEW
author: AUTHOR
update: ${update}
color: "${generateHEX()}"
tags: TAG1, TAG2
---`;
};

async function setStartMessage() {
    const welcomeMessage = `${TAB}F a s t   P o s t`;
    figlet(
        welcomeMessage,
        {
            font: "Straight",
            horizontalLayout: "default",
            verticalLayout: "default",
            whitespaceBreak: true,
            width: 90,
        },
        (err, data) => {
            if (err) return;
            log(data);
        }
    );
    await sleep(200);
    await log(
        `${D_TAB}${chalk.bgGreenBright(
            `${chalk.bold(" Blog Post Generator ")}`
        )}`
    );
    await sleep(200);
}

//* directory name utils
async function getPostDirectoryName() {
    try {
        const NONE_DIR_TYPE = [
            MAC_OS_FILE_EXCEPTION,
            "node_modules",
            ".vscode",
            ".next",
            "public",
            "src",
            ".eslint.json",
            ".gitnore",
            ".prettierrc",
            "blog.config.ts",
            "mdx.d.ts",
            "next-env.d.ts",
            "next.config.js",
            "package-lock.json",
            "package.json",
            "READEME.md",
            "tsconfig.json",
            "tsconfig.path.json",
            "yarn.lock",
            ".git",
            ".gitignore",
            "index.js",
        ];
        const postLocation = await (
            await readdir(process.cwd(), "utf-8")
        ).filter((file) => !NONE_DIR_TYPE.includes(file));

        if (postLocation.length === 0) throw Error();

        const userInput = await inquirer.prompt({
            name: "directory_name",
            type: "list",
            message: `${TAB}${chalk.bgCyan(
                " SLECT "
            )} Blog Post Directory Name `,
            choices: postLocation,
        });
        logChooseMessage(userInput.directory_name);
        return {
            blogContentsDirectoryName: userInput.directory_name,
            isError: false,
        };
    } catch (e) {
        return {
            isError: true,
        };
    }
}
async function getAllCategoryName(blogContentsDirectoryName) {
    try {
        return {
            category: (
                await readdir(
                    getBlogDirectory(`${blogContentsDirectoryName}/contents`),
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

async function selectPostType() {
    const POST_TYPE = ["Current Category", "New Category"];
    const userInput = await inquirer.prompt({
        name: "post_type",
        type: "list",
        message: `${TAB}${chalk.bgCyan(" SLECT ")} Post generation type:`,
        choices: POST_TYPE,
        default: () => POST_TYPE[0],
    });
    logChooseMessage(userInput.post_type);

    return {
        isCurrentCategoryMode: userInput.post_type === "Current Category",
    };
}

async function generatePostInCurrentCategory({
    category,
    blogContentsDirectoryName,
}) {
    const userInput = await inquirer.prompt({
        name: "category",
        type: "list",
        message: `${TAB}${chalk.bgCyan(" SLECT ")} Category:`,
        choices: category,
        default: () => category[0],
    });
    const userCategory = userInput.category;
    logChooseMessage(userCategory);

    try {
        const generatedMeta = generateMetaData();
        const bulkPost = `${generatedMeta}\n\n# Post Title
        `;
        const saveDirectory = `${blogContentsDirectoryName}/contents/${userCategory}/posts`;
        if (!existsSync(saveDirectory)) {
            await mkdir(saveDirectory, { recursive: true });
        }
        const saveUrl = getBlogDirectory(
            `${saveDirectory}/GEN_POST_${generateID()}.mdx`
        );
        await writeFile(saveUrl, bulkPost, "utf-8");
        const spinner = createSpinner(
            `${TAB}${chalk.bgBlue(
                `${chalk.bold(` Generating Bulk Post... `)}`
            )}`
        ).start();
        await sleep(1000);

        spinner.success({
            text: `${TAB}${chalk.bgGreen(" SUCCESS ")} ${chalk.bold(
                `Post Generated at\n\n${D_TAB}${saveUrl}`
            )}`,
        });

        return {
            isGenerationError: false,
            saveUrl,
        };
    } catch (e) {
        return {
            isGenerationError: true,
            saveUrl: getBlogDirectory(
                `${blogContentsDirectoryName}/contents/${userCategory}/posts/`
            ),
        };
    }
}
async function getUserCategoryInput() {
    const userInput = await inquirer.prompt({
        name: "category",
        type: "input",
        message: `${TAB}${chalk.bgYellow(" ADD ")} New Category:`,
    });
    const userCategory = userInput.category;
    logChooseMessage(userCategory);

    return userCategory;
}
async function generatePostInNewCategory({
    userInputCategory,
    blogContentsDirectoryName,
}) {
    try {
        let category = userInputCategory;
        const saveCategoryDirectory = `${blogContentsDirectoryName}/contents/${category}`;
        while (existsSync(saveCategoryDirectory)) {
            logClear();
            const fileSpinner = createSpinner(
                `${TAB}${chalk.bgBlue(
                    `${chalk.bold(` Generating ${category}/posts... `)}`
                )}`
            ).start();
            await sleep(500);
            fileSpinner.error({
                text: `${TAB}${chalk.bgRed(" ERROR ")} ${chalk.bold(
                    `${category} is already exsisted`
                )}\n\n${D_TAB}Please Choose Another Name 🙏\n`,
            });
            const newCategory = await getUserCategoryInput();
            category = newCategory;

            const newCategoryDirectory = `${blogContentsDirectoryName}/contents/${newCategory}`;
            if (!existsSync(newCategoryDirectory)) break;
        }

        const savePostDirectory = `${saveCategoryDirectory}/posts`;
        const fileSpinner = createSpinner(
            `${TAB}${chalk.bgBlue(
                `${chalk.bold(` Generating ${category}/posts... `)}`
            )}`
        ).start();
        await mkdir(saveCategoryDirectory, { recursive: true });
        await mkdir(savePostDirectory, { recursive: true });
        await sleep(1000);
        fileSpinner.success({
            text: `${TAB}${chalk.bgGreen(" SUCCESS ")} ${chalk.bold(
                `${category} Generated\n`
            )}`,
        });

        const generatedMeta = generateMetaData();
        const bulkPost = `${generatedMeta}\n\n# Post Title
        `;
        const saveUrl = getBlogDirectory(
            `${savePostDirectory}/GEN_POST_${generateID()}.mdx`
        );
        await sleep(500);

        await writeFile(saveUrl, bulkPost, "utf-8");
        const postSpinner = createSpinner(
            `${TAB}${chalk.bgBlue(
                `${chalk.bold(` Generating Bulk Post... `)}`
            )}`
        ).start();
        await sleep(1000);

        postSpinner.success({
            text: `${TAB}${chalk.bgGreen(" SUCCESS ")} ${chalk.bold(
                `Post Generated at\n\n${D_TAB}${saveUrl}`
            )}`,
        });

        return {
            isGenerationError: false,
            saveUrl,
        };
    } catch (e) {
        return {
            isGenerationError: true,
            saveUrl: getBlogDirectory(
                `${blogContentsDirectoryName}/contents/${category}/posts/`
            ),
        };
    }
}

async function BlogPostGenerator() {
    logClear();
    await setStartMessage();
    const { blogContentsDirectoryName, isError } = await getPostDirectoryName();
    if (isError) {
        logErrorMessage("No suitable blog folder found");
        exitOnError();
    }

    const { isCurrentCategoryMode } = await selectPostType();

    if (isCurrentCategoryMode) {
        const { category, isError } = await getAllCategoryName(
            blogContentsDirectoryName
        );
        if (isError || !Array.isArray(category)) {
            logErrorMessage("Directory Read Error");
            exitOnError();
        }

        const { isGenerationError, saveUrl } =
            await generatePostInCurrentCategory({
                category,
                blogContentsDirectoryName,
            });

        if (isGenerationError) {
            logErrorMessage(`Post Genenration Error in\n\n${D_TAB}${saveUrl}`);
            exitOnError();
        }

        exitOnSuccess();
    }

    if (!isCurrentCategoryMode) {
        const userInputCategory = await getUserCategoryInput();

        const { isGenerationError, saveUrl } = await generatePostInNewCategory({
            userInputCategory,
            blogContentsDirectoryName,
        });

        if (isGenerationError) {
            logErrorMessage(`Post Genenration Error in\n\n${D_TAB}${saveUrl}`);
            exitOnError();
        }

        exitOnSuccess();
    }
}

await BlogPostGenerator();
