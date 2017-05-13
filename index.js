#!/usr/bin/env node
const fs = require('fs');
const chalk = require('chalk');
const toMarkdown = require('to-markdown');
const getYear = require('date-fns/get_year');
const shelljs = require('shelljs');
const dashify = require('dashify');
const rawOutputDir = process.argv.find(arg => arg.includes('--output'));
const outputDir = rawOutputDir.slice(rawOutputDir.indexOf('=') + 1);

const theFile = process.argv.find(arg => arg.includes('.json'));
if (!theFile) {
    console.error(chalk.bgRed.white('Could not detect a json file name in command. Use the command like this: wordpress-to-markdown [input] (e.g. fileName.json)'));
    return;
}
const dumpPath = `${process.cwd()}/${theFile}`;
let dumpContents;

try {
    dumpContents = fs.readFileSync(dumpPath).toString();
} catch(e) {
    console.error(chalk.bgRed.white(`Could not find file '${theFile}' in ${dumpPath}, please check the fileName/path and try again.`));
    return;
}

const posts = JSON.parse(dumpContents.slice(dumpContents.indexOf('[')));

const parsedPosts = posts.reduce((acc, curr) => {
    if (curr.post_content.length > 0) {
        const postContent = Object.assign({}, curr, {
            template: `
# ${curr.post_title}

Posted on ${curr.post_date}

${toMarkdown(curr.post_content)}
        `
        });

        if (acc.includes(curr)) {
            return acc.splice(acc.indexOf(curr), 1, [postContent]);
        } else {
            acc.push(postContent);
            return acc;
        }
    } else {
        return acc;
    }
}, []);

parsedPosts.forEach(post => {
    const datePosted = new Date(post.post_date);
    const yearPosted = getYear(datePosted);
    const monthPosted = datePosted.getMonth() + 1;
    shelljs.mkdir('-p', `${process.cwd()}/${outputDir || 'archive'}/${yearPosted}`);
    shelljs.mkdir('-p', `${process.cwd()}/${outputDir || 'archive'}/${yearPosted}/${monthPosted}`);
    fs.writeFileSync(`${process.cwd()}/${outputDir || 'archive'}/${yearPosted}/${monthPosted}/${dashify(post.post_title)}.md`, post.template);
}, {});