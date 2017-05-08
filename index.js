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

const parsedPosts = posts.map(post => {
    return Object.assign({}, post, {
        template: `
            # ${post.post_title}
            
            Posted on ${post.post_date}
            
            ${toMarkdown(post.post_content)}
        `
    })
});

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

const datedPosts = parsedPosts.reduce((acc, curr) => {
    const datePosted = new Date(curr.post_date);
    const yearPosted = getYear(datePosted);
    const monthPosted = months[datePosted.getMonth()];
    console.log(acc);
    return Object.assign({}, acc, {
       [yearPosted]: {
           [monthPosted]: {
               posts: [
                   safeGet(acc, '[yearPosted][monthPosted].posts'),
                   curr
               ]
           }
       }
    });
}, {});

console.log(datedPosts);

function prepareDirectories(datesWithPosts) {
    Object.keys(datesWithPosts).forEach(year => {
        shelljs.mkdir('-p', `./archive/${year}`);
        Object.keys(datesWithPosts[year]).forEach(month => {
            shelljs.mkdir('-p', `./archive/${year}/${month}`);
        })
    });
}

parsedPosts.forEach(post => {
    prepareDirectories(datedPosts);
    const datePosted = new Date(post.post_date);
    const yearPosted = getYear(datePosted);
    const monthPosted = months[datePosted.getMonth()];
    fs.writeFileSync(`${yearPosted}/${monthPosted}/${post.post_title}.md`, post.template);
});