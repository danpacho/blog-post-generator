#!/usr/bin/env node

import chalk from "chalk"
import figlet from "figlet"

import { existsSync } from "fs"

import { BLOG_FOLDER_NAME, POSTING_TYPE } from "./constant/index.js"

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
 * @log App boot message
 */
async function setStartMessage() {
    logClear()
    await log(
        `${D_TAB}${chalk.bgCyan(
            `${chalk.bold(
                ` Blog Post Generator By ${chalk.black("@ danpacho")} `
            )}`
        )}`
    )
    const welcomeMessage = `${TAB}E A S Y  P O S T`
    figlet(
        welcomeMessage,
        {
            // font: "Avatar",
            // font: "Epic",
            font: "ASCII New Roman",
            horizontalLayout: "default",
            verticalLayout: "default",
            whitespaceBreak: true,
            width: 100,
        },
        (err, figletText) => {
            if (err) {
                logErrorMessage("E a s y  P o s t, oops error")
                return
            }
            log(`${chalk.cyanBright(figletText)}`)
        }
    )
    await sleep(200)

    await log(
        `${D_TAB}${chalk.bgCyan(
            `${chalk.bold(
                ` Visit repo ${chalk.black(
                    "@ https://github.com/danpacho/blog-post-generator "
                )} `
            )}`
        )}`
    )
    await sleep(200)
}

/**
 * @returns {Promise<{postingType: "Current Category" | "New Category"}>} post generation type
 */
async function getPostingType() {
    const postingType = /** @type {"Current Category" | "New Category"} */ (
        await getUserSlectValue({
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
 * @generate Post within exsisted category
 * @param {{categoryChoice: string[]; blogDirectoryName: string}} CurrentCtegoryGenerationOption
 */
async function generatePostInCurrentCategory({
    categoryChoice,
    blogDirectoryName,
}) {
    const slectedCategory = await getUserSlectValue({
        key: "slected_category",
        choices: categoryChoice,
        inputMessage: "Category",
    })

    const { post, titleUrlString } = await generatePost()

    const saveDirectoryPath = `${blogDirectoryName}/${BLOG_FOLDER_NAME.CONTENTS}/${slectedCategory}/${BLOG_FOLDER_NAME.POSTS}`
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
            )} is already exsisted\n\n${D_TAB}Please Type Another Category Name 🙏`
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
            logErrorMessage("Posting Type Slection is wrong")
            exitOnError()
            return
    }
    exitOnSuccess()
}

BlogPostGenerator()
