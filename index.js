const fs = require('fs');
const dump = fs.readFileSync('./dump.json').toString();
const toMarkdown = require('to-markdown');
const getMonth = require('date-fns/get_month');
const getYear = require('date-fns/get_year');
const shelljs = require('shelljs');
const safeGet = require('lodash/get');

const REGEX = {
    DUMP_SECTION_HEADINGS: /(--\n-- Dumping data for table `.*`\n--)/igm,
    POSTS_SECTION_DATA: /(--\n-- Dumping data for table `wp_posts`\n--)/igm,
    STRUCTURE_SECTION_HEADINGS: /(--\n-- Table structure for table `.*`\n--)/igm
};

const posts = JSON.parse(dump.slice(dump.indexOf('[')));

const parsedPosts = posts.reduce((acc, curr) => {
    const postContent = Object.assign({}, curr, {
        template: `
            # ${curr.post_title}
            
            Posted on ${curr.post_date}
            
            ${toMarkdown(curr.post_content)}
        `
    });
    if (acc.filter(item => curr.post_title === item.post_title).length > 1) {
        return acc.splice(acc.indexOf(curr), 1, [postContent])
    } else {
        acc.push(postContent);
        return acc;
    }
}, []);

console.log(parsedPosts);

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

parsedPosts.forEach(post => {
    parsedPosts.forEach(post => {
        const datePosted = new Date(post.post_date);
        const yearPosted = getYear(datePosted);
        const monthPosted = months[datePosted.getMonth()];
        shelljs.mkdir('-p', `./archive/${yearPosted}`);
        shelljs.mkdir('-p', `./archive/${yearPosted}/${monthPosted}`);
        fs.writeFileSync(`${yearPosted}/${monthPosted}/${post.post_title}.md`, post.template);
    }, {});
});