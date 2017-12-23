# WordPress to Markdown

This package takes the a `json` database dump of the `wp_posts` table.
Future versions may support parsing of entire WordPress databases, but until then, it covers the most standard case.

## Getting Started

- `npm install @lukeboyle/wordpress-to-markdown -g`
- Get a json dump of the `wp_posts` table and save it in the directory you want to generate an archive (as a `.json` file)
- `wordpress-to-markdown <your-json-file>.json [--output=wordpress-archive]`
- Note, if you don't define an output option, it will default to `./archive/**`

## Options

### `filter-type`

`--filter-type=acf-field,nav_menu_item`

You can filter out `post_type`s, meaning they won't result in a md file being 
output. Your values should be comma separated.

Example *in situ* `wordpress-to-markdown <your-json-file>.json --filter-type=acf-field,nav_menu_item`