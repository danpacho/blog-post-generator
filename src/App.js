#!/usr/bin/env node

import chalk from "chalk";
import figlet from "figlet";
import { createSpinner } from "nanospinner";

import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";

import { BLOG_FOLDER_NAME, POSTING_TYPE } from "./constant/index.js";

import {
    D_TAB,
    TAB,
    exitOnError,
    exitOnSuccess,
    generateHEX,
    sleep,
    log,
    logClear,
    logErrorMessage,
    getUserInputValue,
    getUserSlectValue,
    getAllCategoryName,
    getBlogDirectoryName,
    getBlogFilePath,
} from "./utils/index.js";

const generateMetaData = (postTitle) => {
    const formatDate = () => {
        const addZeroForDate = (date) => (date.length <= 2 ? `0${date}` : date);

        const CurrentDate = new Date();
        const year = CurrentDate.getFullYear();
        const month = addZeroForDate(String(CurrentDate.getMonth() + 1));
        const date = addZeroForDate(String(CurrentDate.getDate()));

        return `${year}/${month}/${date}`;
    };
    const update = formatDate();

    return `---
title: ${postTitle}
preview: PREVIEW
author: AUTHOR
update: ${update}
color: "${generateHEX()}"
tags: TAG1, TAG2
---`;
};

async function generatePost() {
    const userTitle = await getUserInputValue({
        key: "post_title",
        inputMessage: "Post Title",
        inputType: "TYPE",
    });
    return {
        post: `${generateMetaData(userTitle)}\n\n# Post Title
        `,
        titleUrlString:
            typeof userTitle === "string"
                ? userTitle?.replace(/ /g, "-")
                : userTitle,
    };
}

async function setStartMessage() {
    logClear();
    await log(
        `${D_TAB}${chalk.bgCyan(
            `${chalk.bold(
                ` Blog Post Generator By ${chalk.black("@ danpacho")} `
            )}`
        )}`
    );
    const welcomeMessage = `${TAB}E A S Y  P O S T`;
    figlet(
        welcomeMessage,
        {
            font: "Straight",
            font: "Efti Robot",
            horizontalLayout: "default",
            verticalLayout: "default",
            whitespaceBreak: true,
            width: 100,
        },
        (err, figletText) => {
            if (err) {
                logErrorMessage("E a s y  P o s t, oops error");
                return;
            }
            log(`${chalk.cyanBright(figletText)}`);
        }
    );
    await sleep(200);

    await log(
        `${D_TAB}${chalk.bgCyan(
            `${chalk.bold(
                ` Visit repo ${chalk.black(
                    "@ https://github.com/danpa725/blog-post-generator"
                )}`
            )}`
        )}`
    );
    await sleep(200);
}

async function getPostingType() {
    const postingType = await getUserSlectValue({
        key: "posting_type",
        choices: Object.values(POSTING_TYPE),
        inputMessage: "Post Generation Type",
    });

    return {
        postingType,
    };
}

async function getUserCategoryInput() {
    const userCategory = await getUserInputValue({
        key: "category",
        inputMessage: "New Category",
    });

    return userCategory;
}

async function generatePostInCurrentCategory({ category, blogDirectoryName }) {
    const slectedCategory = await getUserSlectValue({
        key: "slected_category",
        choices: category,
        inputMessage: "Category",
    });

    try {
        const { post, titleUrlString } = await generatePost();

        const saveDirectoryPath = `${blogDirectoryName}/${BLOG_FOLDER_NAME.CONTENTS}/${slectedCategory}/${BLOG_FOLDER_NAME.POSTS}`;
        if (!existsSync(saveDirectoryPath))
            await mkdir(saveDirectoryPath, { recursive: true });

        const saveUrl = getBlogFilePath(
            `${saveDirectoryPath}/${titleUrlString}.mdx`
        );
        await writeFile(saveUrl, post, "utf-8");
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
            isPostGenerationError: false,
            saveUrl,
        };
    } catch (e) {
        return {
            isPostGenerationError: true,
            saveUrl: getBlogFilePath(
                `${blogDirectoryName}/${BLOG_FOLDER_NAME.CONTENTS}/${slectedCategory}/${BLOG_FOLDER_NAME.POSTS}/`
            ),
        };
    }
}
async function generatePostInNewCategory({
    userInputCategory,
    blogDirectoryName,
}) {
    try {
        let category = userInputCategory;
        const saveCategoryDirectory = `${blogDirectoryName}/${BLOG_FOLDER_NAME.CONTENTS}/${category}`;
        while (existsSync(saveCategoryDirectory)) {
            logClear();
            const fileSpinner = createSpinner(
                `${TAB}${chalk.bgBlue(
                    `${chalk.bold(
                        ` Generating ${category}/${BLOG_FOLDER_NAME.POSTS}... `
                    )}`
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

            const newCategoryDirectory = `${blogDirectoryName}/${BLOG_FOLDER_NAME.CONTENTS}/${newCategory}`;
            if (!existsSync(newCategoryDirectory)) break;
        }

        const savePostDirectoryPath = `${saveCategoryDirectory}/${BLOG_FOLDER_NAME.POSTS}`;
        const fileSpinner = createSpinner(
            `${TAB}${chalk.bgBlue(
                `${chalk.bold(
                    ` Generating ${category}/${BLOG_FOLDER_NAME.POSTS}... `
                )}`
            )}`
        ).start();
        await sleep(1000);
        await mkdir(savePostDirectoryPath, { recursive: true });
        fileSpinner.success({
            text: `${TAB}${chalk.bgGreen(" SUCCESS ")} ${chalk.bold(
                `${category} Generated\n`
            )}`,
        });

        const { post, titleUrlString } = await generatePost();
        const saveUrl = getBlogFilePath(
            `${savePostDirectoryPath}/${titleUrlString}.mdx`
        );
        await sleep(500);
        const postSpinner = createSpinner(
            `${TAB}${chalk.bgBlue(
                `${chalk.bold(` Generating Bulk Post... `)}`
            )}`
        ).start();

        await sleep(1000);
        await writeFile(saveUrl, post, "utf-8");
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
            saveUrl: getBlogFilePath(
                `${blogDirectoryName}/${BLOG_FOLDER_NAME.CONTENTS}/${userInputCategory}/${BLOG_FOLDER_NAME.POSTS}/`
            ),
        };
    }
}

async function BlogPostGenerator() {
    await setStartMessage();

    const { blogDirectoryName, isError } = await getBlogDirectoryName();
    if (isError) {
        logErrorMessage("No Suitable Blog Folder Found");
        exitOnError();
    }

    const { postingType } = await getPostingType();

    switch (postingType) {
        case POSTING_TYPE.CURRENT:
            const { category, isError } = await getAllCategoryName(
                blogDirectoryName
            );
            if (isError || !Array.isArray(category)) {
                logErrorMessage(
                    `Directory Read Error, Might be no category folder at ${blogDirectoryName} folder`
                );
                exitOnError();
            }

            const { isPostGenerationError, saveUrl: currentSaveUrl } =
                await generatePostInCurrentCategory({
                    category,
                    blogDirectoryName,
                });

            if (isPostGenerationError) {
                logErrorMessage(
                    `Post Genenration Error in\n\n${D_TAB}${currentSaveUrl}`
                );
                exitOnError();
            }
            break;
        case POSTING_TYPE.NEW:
            const userInputCategory = await getUserCategoryInput();

            const { isGenerationError, saveUrl: newSaveUrl } =
                await generatePostInNewCategory({
                    userInputCategory,
                    blogDirectoryName,
                });

            if (isGenerationError) {
                logErrorMessage(
                    `Post Genenration Error in\n\n${D_TAB}${newSaveUrl}`
                );
                exitOnError();
            }
            break;
        default:
            break;
    }
    exitOnSuccess();
}

await BlogPostGenerator();
