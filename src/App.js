#!/usr/bin/env node

import chalk from "chalk"
import figlet from "figlet"

import { existsSync } from "fs"

import {
    BLOG_FOLDER_NAME,
    GENERATION_TIME,
    POSTING_TYPE,
} from "./constant/index.js"

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
    getUserSelectValue,
    removeErrorParam,
    getAllCategoryName,
    getBlogDirectoryName,
    getBlogFilePath,
    makeDirectory,
    makeFile,
} from "./utils/index.js"

/**
 * @param {string} postTitle
 */
const generateMetaData = (postTitle) => {
    const formatDate = () => {
        const addZeroForDate = (date) => (date.length < 2 ? `0${date}` : date)

        const CurrentDate = new Date()
        const year = CurrentDate.getFullYear()
        const month = addZeroForDate(String(CurrentDate.getMonth() + 1))
        const date = addZeroForDate(String(CurrentDate.getDate()))

        return `${year}/${month}/${date}`
    }
    const update = formatDate()

    return `---
title: ${postTitle.replace(/:/g, "")}
preview: PREVIEW
author: AUTHOR
update: ${update}
color: "${generateHEX()}"
tags: TAG1, TAG2
---`
}

async function generatePost() {
    const userTitle = await getUserInputValue({
        key: "post_title",
        inputMessage: "Post Title",
        inputType: "TYPE",
    })
    return {
        post: `${generateMetaData(userTitle)}\n\n# Post Title
        `,
        titleUrlString:
            typeof userTitle === "string"
                ? userTitle.replace(/:/g, "").replace(/ /g, "-")
                : userTitle,
    }
}

/**
 * @description App boot message
 */
async function setStartMessage() {
    logClear()

    log(
        `${D_TAB}${chalk.bgGreenBright.bold(
            `${TAB}${TAB}${TAB}${TAB}${TAB}${TAB} Easy blog post generator ${TAB}${TAB}${TAB}${TAB}${TAB}${TAB}`
        )}`
    )

    const welcomeMessage = `${TAB}Blog Post`

    figlet(
        welcomeMessage,
        {
            horizontalLayout: "default",
            verticalLayout: "default",
            whitespaceBreak: true,
            width: 100,
        },
        (err, figletText) => {
            if (err) {
                log("Blog Post")
                return
            }
            log(`${chalk.greenBright(figletText)}`)
        }
    )
    await sleep(GENERATION_TIME)

    log(
        `${D_TAB}${chalk.bgGreenBright.bold.black(
            " https://github.com/danpacho/blog-post-generator "
        )}`
    )

    await sleep(GENERATION_TIME)
}

/**
 * @returns {Promise<{postingType: "Current Category" | "New Category"}>} post generation type
 */
async function getPostingType() {
    const postingType = /** @type {"Current Category" | "New Category"} */ (
        await getUserSelectValue({
            key: "posting_type",
            choices: Object.values(POSTING_TYPE),
            inputMessage: "Post Generation Type",
        })
    )

    return {
        postingType,
    }
}

async function getUserCategoryInput() {
    const userCategory = await getUserInputValue({
        key: "category",
        inputMessage: "New Category",
    })

    return userCategory
}

async function getCategoryDescriptionFile() {
    try {
        const userCategoryDescription = await getUserInputValue({
            key: "category_description",
            inputMessage: "Category Description",
        })
        const color = generateHEX()

        const descriptionJSON = JSON.stringify({
            emoji: "🌏",
            description: userCategoryDescription,
            color,
        })
        return {
            descriptionFile: descriptionJSON,
        }
    } catch (e) {
        logErrorMessage("Description File Generation Failed")
        exitOnError()
    }
}

/**
 * @generate Post within existed category
 * @param {{categoryChoice: string[]; blogDirectoryName: string}} CurrentCategoryGenerationOption
 */
async function generatePostInCurrentCategory({
    categoryChoice,
    blogDirectoryName,
}) {
    const selectedCategory = await getUserSelectValue({
        key: "selected_category",
        choices: categoryChoice,
        inputMessage: "Category",
    })

    const { post, titleUrlString } = await generatePost()

    const saveDirectoryPath = `${blogDirectoryName}/${BLOG_FOLDER_NAME.CONTENTS}/${selectedCategory}/${BLOG_FOLDER_NAME.POSTS}`
    if (!existsSync(saveDirectoryPath))
        await makeDirectory({
            path: getBlogFilePath(saveDirectoryPath),
            generatingObjectName: saveDirectoryPath,
        })

    const saveFilePath = `${saveDirectoryPath}/${removeErrorParam(
        titleUrlString
    )}`
    await makeFile({
        path: getBlogFilePath(saveFilePath),
        data: post,
        fileType: "mdx",
        generatingObjectName: saveFilePath,
    })
}
/**
 * @generate Post in new category, Not same category name
 * @param {{userInputCategory: string; blogDirectoryName: string}} NewCategoryGenerationOption
 */
async function generatePostInNewCategory({
    userInputCategory,
    blogDirectoryName,
}) {
    let category = userInputCategory
    const initialSaveCategoryPath = `${blogDirectoryName}/${
        BLOG_FOLDER_NAME.CONTENTS
    }/${removeErrorParam(category)}`

    while (existsSync(initialSaveCategoryPath)) {
        logClear()
        logErrorMessage(
            `${chalk.underline(
                chalk.redBright(category)
            )} is already existed\n\n${D_TAB}Please Type Another Category Name 🙏`
        )
        category = await getUserCategoryInput()

        const updatedSaveCategoryPath = `${blogDirectoryName}/${
            BLOG_FOLDER_NAME.CONTENTS
        }/${removeErrorParam(category)}`

        if (!existsSync(updatedSaveCategoryPath)) break
    }

    const { descriptionFile } = await getCategoryDescriptionFile()
    await makeDirectory({
        path: getBlogFilePath(initialSaveCategoryPath),
        generatingObjectName: initialSaveCategoryPath,
    })
    const filePath = `${initialSaveCategoryPath}/description`
    await makeFile({
        path: getBlogFilePath(filePath),
        fileType: "json",
        data: descriptionFile,
        generatingObjectName: filePath,
    })

    const savePostDirectoryPath = `${initialSaveCategoryPath}/${BLOG_FOLDER_NAME.POSTS}`
    await makeDirectory({
        path: getBlogFilePath(savePostDirectoryPath),
        generatingObjectName: savePostDirectoryPath,
    })

    const { post, titleUrlString } = await generatePost()
    const savePostPath = `${savePostDirectoryPath}/${removeErrorParam(
        titleUrlString
    )}`
    await makeFile({
        path: getBlogFilePath(savePostPath),
        fileType: "mdx",
        data: post,
        generatingObjectName: savePostPath,
    })
}

async function BlogPostGenerator() {
    await setStartMessage()

    const { blogDirectoryName } = await getBlogDirectoryName()
    const { postingType } = await getPostingType()

    switch (postingType) {
        case POSTING_TYPE.CURRENT:
            await generatePostInCurrentCategory({
                categoryChoice: await (
                    await getAllCategoryName(blogDirectoryName)
                ).category,
                blogDirectoryName,
            })
            break
        case POSTING_TYPE.NEW:
            await generatePostInNewCategory({
                userInputCategory: await getUserCategoryInput(),
                blogDirectoryName,
            })
            break
        default:
            logErrorMessage("Posting Type is wrong")
            exitOnError()
            return
    }
    exitOnSuccess()
}

BlogPostGenerator()
