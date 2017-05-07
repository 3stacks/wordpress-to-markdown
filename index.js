const fs = require('fs');
const dump = fs.readFileSync('./dump.json').toString();

const REGEX = {
    DUMP_SECTION_HEADINGS: /(--\n-- Dumping data for table `.*`\n--)/igm,
    POSTS_SECTION_DATA: /(--\n-- Dumping data for table `wp_posts`\n--)/igm,
    STRUCTURE_SECTION_HEADINGS: /(--\n-- Table structure for table `.*`\n--)/igm
};

const posts = JSON.parse(dump.slice(dump.indexOf('[')));

const out = [];

const parsedPosts = posts.map((post, index) => {
    if (index === 25) {
        out.push(JSON.stringify(post));
    }
    return post
});

fs.writeFileSync('dump.md', parsedPosts);
fs.writeFileSync('out.md', out);