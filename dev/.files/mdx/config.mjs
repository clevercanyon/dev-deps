/**
 * MDX config file.
 *
 * MDX is not aware of this config file's location.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @see https://mdxjs.com/packages/mdx/#api
 */

import { visit as unistVisit } from 'unist-util-visit';
import extensions from '../bin/includes/extensions.mjs';

/**
 * Defines MDX configuration.
 */
export default async () => {
    /**
     * Composition.
     */
    return {
        jsxImportSource: 'preact',

        mdExtensions: [...extensions.byVSCodeLang.markdown],
        mdxExtensions: [...extensions.byVSCodeLang.mdx],

        remarkPlugins: [
            (await import('remark-frontmatter')).default, // Frontmatter.
            [(await import('remark-mdx-frontmatter')).default, { name: 'frontMatter' }],
            [(await import('remark-gfm')).default, { singleTilde: false }], // GFM features.
            (await import('remark-smartypants')).default, // (em dash) `--` to `—`, quotes, etc.
            (await import('remark-directive')).default, // Custom directives; {@see https://o5p.me/0fakce}.
        ],
        rehypePlugins: [
            (await import('@microflash/rehype-starry-night')).default, // Syntax highlighting.

            (/* Modifies hash-only anchors so they work well with `<base href>` in our preact apps. */) => {
                return (tree) => {
                    unistVisit(tree, 'element', (node) => {
                        if ('a' === node.tagName && node.properties.href.startsWith('#')) {
                            node.tagName = 'x-hash'; // Uses our `CustomHTMLHashElement`.
                            (node.properties.role = 'link'), (node.properties.tabIndex = 0); // A11y.
                            node.properties.className = (node.properties.className || []).concat(['link']); // Styles.
                        }
                        return node;
                    });
                };
            },
            (/* Modifies footnotes label generated by `remark-gfm` plugin. */) => {
                return (tree) => {
                    unistVisit(tree, 'element', (node) => {
                        if ('h2' === node.tagName && 'footnote-label' === node.properties.id) {
                            node.properties.className = (node.properties.className || []).filter((c) => !['sr-only'].includes(c));
                        }
                        return node;
                    });
                };
            },
        ],
        vsCodeTSConfig: {
            plugins: [
                'remark-frontmatter', // Frontmatter.
                ['remark-mdx-frontmatter', { name: 'frontMatter' }],
                ['remark-gfm', { singleTilde: false }], // GFM features.
                'remark-smartypants', // (em dash) `--` to `—`, quotes, etc.
                'remark-directive', // Custom directives; {@see https://o5p.me/0fakce}.
            ],
        },
    };
};
