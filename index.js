const fs = require('fs');
const dump = fs.readFileSync('./dump.json').toString();
const toMarkdown = require('to-markdown');
const getMonth = require('date-fns/get_month');
const getYear = require('date-fns/get_year');
const shelljs = require('shelljs');

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
    return Object.assign({}, acc, {
       [yearPosted]: {
           [monthPosted]: {
               posts: [
                   ...acc[yearPosted][monthPosted][posts],
                   curr
               ]
           }
       }
    });
}, {});

function prepareDirectories() {
    shelljs.exec('mkdir', '-p', `myProject/{src,doc,tools,db}`);
}

parsedPosts.forEach(post => {
    const datePosted = new Date(post.post_date);
    const yearPosted = getYear(datePosted);
    const monthPosted = months[datePosted.getMonth()];
    shelljs.exec(`mkdir ./${yearPosted}/${monthPosted}`);
    fs.writeFileSync(`${yearPosted}/${monthPosted}/${post.post_title}.md`, post.template);
});