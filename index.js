const fs = require('fs');
const dump = fs.readFileSync('./forge.sql').toString();

const REGEX = {
    DUMP_SECTION_HEADINGS: /(--\n-- Dumping data for table `.*`\n--)/igm,
    POSTS_SECTION_DATA: /(--\n-- Dumping data for table `wp_posts`\n--)/igm,
    STRUCTURE_SECTION_HEADINGS: /(--\n-- Table structure for table `.*`\n--)/igm
};

/**
 * @param {String} string
 * @param {String|RegExp} substring
 */
function getSections(string, substring) {
    const sections = string.split(substring);
    return sections;
}

const sections = getSections(dump, REGEX.DUMP_SECTION_HEADINGS);

const dumpData = sections.map(section => {
    return section.split(REGEX.STRUCTURE_SECTION_HEADINGS)[0];
});

const postSection = dumpData.filter(section => {
    const regexTestResult = REGEX.POSTS_SECTION_DATA.test(section);
    if (regexTestResult) {
        console.log(section);
    }
    return regexTestResult;
});

fs.writeFileSync('dump.md', postSection);