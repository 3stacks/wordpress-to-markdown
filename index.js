#!/usr/bin/env node
const fs = require('fs');
const allege = require('allege');
const chalk = require('chalk');
const TurndownService = require('turndown');
const turndownService = new TurndownService();
const getYear = require('date-fns/get_year');
const shelljs = require('shelljs');
const dashify = require('dashify');
const rawOutputDir = process.argv.find(arg => arg.includes('--output'));
const outputDir = !!rawOutputDir ? rawOutputDir.slice(rawOutputDir.indexOf('=') + 1) : '';

const theFile = process.argv.find(arg => arg.includes('.json'));
if (!theFile) {
    console.error(chalk.bgRed.black('Could not detect a json file name in command. Use the command like this: wordpress-to-markdown [input] (e.g. fileName.json)'));
    return;
}
const dumpPath = `${process.cwd()}/${theFile}`;
let dumpContents;

try {
    dumpContents = fs.readFileSync(dumpPath).toString();
} catch(e) {
    console.error(chalk.bgRed.black(`Could not find file '${theFile}' in ${dumpPath}, please check the fileName/path and try again.`));
    return;
}

const posts = JSON.parse(dumpContents.slice(dumpContents.indexOf('[')));
const typesToFilter = process.argv.find(arg => arg.includes('--filter-type'));

const parsedPosts = posts.reduce((acc, curr) => {
    if (!!typesToFilter) {
        const types = typesToFilter.replace('--filter-type=', '').split(',');

        if (allege(curr.post_type).isAnyOf(...types)) {
            return acc;
        }
    }
    if (curr.post_content.length > 0) {
        const postContent = Object.assign({}, curr, {
            template: `
# ${curr.post_title}\n

| Metadata name | Value |
| --------- | ------ |
| post_title | ${curr.post_title} | 
| post_date | ${curr.post_date} | 
| post_modified | ${curr.post_modified} | 
| post_status | ${curr.post_status} | 
| post_type | ${curr.post_type} |

${turndownService.turndown(curr.post_content)}
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
    const monthPosted = `${datePosted.getMonth() + 1}`.padStart(2, '0');
    shelljs.mkdir('-p', `${process.cwd()}/${outputDir || 'archive'}/${yearPosted}`);
    shelljs.mkdir('-p', `${process.cwd()}/${outputDir || 'archive'}/${yearPosted}/${monthPosted}`);
    fs.writeFileSync(`${process.cwd()}/${outputDir || 'archive'}/${yearPosted}/${monthPosted}/${dashify(post.post_title)}.md`, post.template);
}, {});