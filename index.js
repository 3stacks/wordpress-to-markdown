#!/usr/bin/env node
const fs = require('fs');
const dump = fs.readFileSync(`${__dirname}/dump.json`).toString();
const toMarkdown = require('to-markdown');
const getYear = require('date-fns/get_year');
const shelljs = require('shelljs');
console.log(process);
const workingDir = process.cwd();
const baseDir = __dirname;

const posts = JSON.parse(dump.slice(dump.indexOf('[')));

const parsedPosts = posts.reduce((acc, curr) => {
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
}, []);

parsedPosts.forEach(post => {
    const datePosted = new Date(post.post_date);
    const yearPosted = getYear(datePosted);
    const monthPosted = datePosted.getMonth() + 1;
    shelljs.mkdir('-p', `${__dirname}/archive/${yearPosted}`);
    shelljs.mkdir('-p', `${__dirname}/archive/${yearPosted}/${monthPosted}`);
    fs.writeFileSync(`${__dirname}/archive/${yearPosted}/${monthPosted}/${post.post_title}.md`, post.template);
}, {});