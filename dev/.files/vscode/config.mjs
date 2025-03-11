#!/usr/bin/env node
/**
 * VS Code config file.
 *
 * VS Code is not aware of this config file's location.
 *
 * The underlying `../../../.vscode/settings.json` file can be recompiled using:
 *
 *     $ madrun update vscode
 *     or: $ madrun update dotfiles
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @see https://code.visualstudio.com/docs/getstarted/settings
 */

import path from 'node:path';
import { $fs, $prettier } from '../../../node_modules/@clevercanyon/utilities.node/dist/index.js';
import { $path } from '../../../node_modules/@clevercanyon/utilities/dist/index.js';
import exclusions from '../bin/includes/exclusions.mjs';
import extensions from '../bin/includes/extensions.mjs';
import u from '../bin/includes/utilities.mjs';
import tailwindSettings from '../tailwind/settings.mjs';

const __dirname = $fs.imuDirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../..');
const pkgFile = path.resolve(projDir, './package.json');
const prettierConfig = { ...(await $prettier.resolveConfig(pkgFile)), parser: 'json' };

/**
 * Defines VS Code configuration.
 */
export default async () => {
    /**
     * File associations.
     */
    let fileAssociations = {}; // Initialize.
    const extsByVSCodeLang = $path.extsByVSCodeLang();

    for (const [vsCodeLang, exts] of Object.entries(extsByVSCodeLang)) {
        fileAssociations['**/*.' + extensions.asBracedGlob(exts)] = vsCodeLang;
    }
    const fileAssociationsOverrideExt = (ext) => {
        let currentExts = ''; // Initialize.
        for (const [, exts] of Object.entries(extsByVSCodeLang))
            if (exts.includes(ext)) { currentExts = exts.join(','); break; } // prettier-ignore
        return '{' + ext + ',' + '×'.repeat(Math.max(1, currentExts.length - ext.length)) + '}';
    };
    fileAssociations = {
        ...fileAssociations,

        // Overrides; for special cases.
        // Note: order of precedence is tricky.
        // For details, see: <https://o5p.me/AcvdMc>.
        // Basically, the longest matching pattern wins.

        ['**/.env.*']: 'properties', // Suffix, not extension.
        ['**/CODEOWNERS']: 'ignore', // File has no extension.

        ['**/tsconfig.' + fileAssociationsOverrideExt('json')]: 'jsonc',
        ['**/.vscode/*.' + fileAssociationsOverrideExt('json')]: 'jsonc',

        ['**/src/cargo/.well-known/**/*.' + fileAssociationsOverrideExt('json')]: 'jsonc',

        ['**/dist/_headers']: 'plaintext', // File has no extension.
        ['**/src/cargo/_headers']: 'plaintext', // File has no extension.

        ['**/dist/_redirects']: 'plaintext', // File has no extension.
        ['**/src/cargo/_redirects']: 'plaintext', // File has no extension.

        ['**/src/cargo/manifest.' + fileAssociationsOverrideExt('json')]: 'jsonc',
        ['**/src/cargo/_routes.' + fileAssociationsOverrideExt('json')]: 'jsonc',
    };

    /**
     * Base config.
     */
    const baseConfig = {
        /**
         * Editor options.
         */

        'editor.formatOnType': false,
        'editor.formatOnPaste': false,
        'editor.formatOnSave': false,

        'editor.autoIndent': 'full',
        'editor.detectIndentation': false,
        'editor.tabSize': prettierConfig.tabWidth,
        'editor.insertSpaces': !prettierConfig.useTabs,

        'editor.wordWrap': 'off',
        'editor.wrappingIndent': 'indent',
        'editor.wordWrapColumn': prettierConfig.printWidth,

        // Customizations: removed `$` (we use it a lot), added ` ─‘’“”`.
        'editor.wordSeparators': '`~!@#%^&*()-=+[{]}\\|;:\'",.<>/? ─‘’“”',
        // Ensure terminal configuration matches that of `editor.wordSeparators`.
        'terminal.integrated.wordSeparators': '`~!@#%^&*()-=+[{]}\\|;:\'",.<>/? ─‘’“”',

        /**
         * File and search options.
         */

        'files.eol': '\n',
        'files.encoding': 'utf8',

        'files.trimFinalNewlines': true,
        'files.insertFinalNewline': true,
        'files.trimTrailingWhitespace': true,

        'files.associations': fileAssociations,
        'files.exclude': {
            ...exclusions.asBoolProps(
                [...exclusions.localIgnores] //
                    .filter((ignore) => !['**/.#*/**'].includes(ignore)),
                { tailGreedy: false },
            ),
            ...exclusions.asBoolProps(
                [...exclusions.editorIgnores] //
                    .filter((ignore) => !['**/*.code-*/**'].includes(ignore)),
                { tailGreedy: false },
            ),
            ...exclusions.asBoolProps([...exclusions.toolingIgnores], { tailGreedy: false }),
            ...exclusions.asBoolProps([...exclusions.vcsIgnores], { tailGreedy: false }),
            ...exclusions.asBoolProps([...exclusions.osIgnores], { tailGreedy: false }),

            // Plus these additional hidden files we control using ext: `PeterSchmalfeldt.explorer-exclude`.
            // These work together with the additional setting below for the extension: `explorerExclude.backup`.

            ...(!(await u.isPkgName('@clevercanyon/skeleton'))
                ? {
                      ...exclusions.asBoolProps(
                          exclusions.asRelativeGlobs(
                              projDir,
                              [
                                  ...exclusions.dotIgnores, //
                                  ...exclusions.configIgnores //
                                      .filter((ignore) => !['**/package.json/**'].includes(ignore)),
                                  ...exclusions.devDotFileIgnores,
                                  ...exclusions.pkgIgnores,
                                  ...exclusions.lockIgnores,
                              ],
                              { forceRelative: true, forceNoLeadingSlash: true },
                          ),
                          { headGreedy: false, tailGreedy: false },
                      ),
                      'LICENSE.txt': true,
                  }
                : {}),
        },
        'explorer.excludeGitIgnore': false, // No, only `files.exclude`.
        'explorerExclude.backup': {}, // Reset each time we regenerate settings.

        'search.useIgnoreFiles': true,
        'search.useGlobalIgnoreFiles': false,
        'search.useParentIgnoreFiles': false,
        'search.exclude': {
            // Inherits everything in `files.exclude`.
            // Plus everything in `../../../.gitignore`.
            // ... plus these additional search ignores.

            ...(!(await u.isPkgName('@clevercanyon/skeleton'))
                ? {
                      ...exclusions.asBoolProps(
                          exclusions.asRootedRelativeGlobs(
                              projDir,
                              [
                                  ...exclusions.dotIgnores, //
                                  ...exclusions.configIgnores,
                                  ...exclusions.devDotFileIgnores,
                              ],
                              { forceRelative: true },
                          ),
                          { tailGreedy: false },
                      ),
                      '/LICENSE.txt': true,
                  }
                : {}),
            ...exclusions.asBoolProps([...exclusions.lockIgnores], { tailGreedy: false }),
        },

        /**
         * Comment anchor options.
         *
         * @see https://coolors.co/fff0b5-8a826d-6d718a-696969
         */
        'commentAnchors.tags.anchors': {
            '@todo': {
                scope: 'workspace',
                iconColor: '#fff0b5',
                highlightColor: '#fff0b5',
                behavior: 'anchor',
                styleMode: 'tag',
            },
            '@review': {
                scope: 'workspace',
                iconColor: '#8a826d',
                highlightColor: '#8a826d',
                behavior: 'anchor',
                styleMode: 'tag',
            },
            '@someday': {
                scope: 'workspace',
                iconColor: '#6d718a',
                highlightColor: '#6d718a',
                behavior: 'anchor',
                styleMode: 'tag',
            },
            '@anchor': {
                scope: 'hidden',
                iconColor: '#696969',
                highlightColor: '#696969',
                behavior: 'anchor',
                styleMode: 'tag',
            },
            '@see-anchor': {
                scope: 'hidden',
                iconColor: '#696969',
                highlightColor: '#696969',
                behavior: 'link',
                styleMode: 'tag',
            },
        },
        'commentAnchors.tags.matchCase': true,
        'commentAnchors.tags.separators': [' ', ': '],

        // Comment Anchors uses minimatch, with `{ dot: false }`.
        'commentAnchors.workspace.excludeFiles': exclusions.asBracedGlob(
            [
                ...(!(await u.isPkgName('@clevercanyon/skeleton')) //
                    ? [...exclusions.devDotFileIgnores]
                    : []),
                ...exclusions.logIgnores,
                ...exclusions.backupIgnores,
                ...exclusions.patchIgnores,
                ...exclusions.editorIgnores,
                ...exclusions.toolingIgnores,
                ...exclusions.pkgIgnores,
                ...exclusions.vcsIgnores,
                ...exclusions.osIgnores,
                ...exclusions.lockIgnores,
                ...exclusions.distIgnores,
            ],
            { dropExistingNegations: true, maybeDropExistingRelatives: true },
        ),
        /**
         * Comment Anchors uses two things under the hood:
         *
         * 1. `workspace.findFiles()` from VS Code API; {@see https://o5p.me/wTHsX1}.
         * 2. Minimatch with default `{ dot: false }` option; {@see https://o5p.me/l6XWRg}.
         *
         * VS Code doesn’t support extglob patterns, unfortunately, so we can’t use dotGlobstars. For that reason, an
         * adhoc and highly imperfect solution is used to get Comment Anchors at least working well inside of
         * `clevercanyon/skeleton/dev/.files`. Outside of `.` dirs/files, Comment Anchors work fine.
         *
         * @see https://github.com/StarlaneStudios/vscode-comment-anchors/issues/209
         */
        'commentAnchors.workspace.matchFiles': (await u.isPkgName('@clevercanyon/skeleton'))
            ? '{**/,**/dev/.files/,**/dev/.files/**/}*.' + extensions.asBracedGlob([...extensions.commentAnchorsContent])
            : '**/*.' + extensions.asBracedGlob([...extensions.commentAnchorsContent]),

        /**
         * Extension options.
         */

        'extensions.ignoreRecommendations': true, // Let’s not nag ourselves.

        /**
         * Native lint options.
         */

        'css.validate': false,
        'scss.validate': false,
        'less.validate': false,

        'json.validate.enable': true,
        'javascript.validate.enable': true,
        'typescript.validate.enable': true,

        // <https://stackoverflow.com/a/52397123>.
        'javascript.suggestionActions.enabled': false,

        /**
         * ESLint options.
         */

        'eslint.enable': true,
        'eslint.format.enable': true,
        'eslint.lintTask.enable': false,

        'eslint.run': 'onType',
        'eslint.runtime': 'node',
        'eslint.useESLintClass': true,

        'eslint.useFlatConfig': true,
        'eslint.codeActionsOnSave.mode': 'all',
        'eslint.workingDirectories': [{ 'mode': 'auto' }],

        'eslint.probe': [
            // For now, disabling eslint for markdown.

            // MDX eslint plugin not compatible with MDX v3 yet.
            // Outdated package: `eslint-plugin-mdx`.

            // Additionally, the formatter for MDX/markdown has been changed
            // from eslint to prettier, for now. See langauge settings below.

            // 'mdx',
            // 'markdown',

            'javascript',
            'javascriptreact',
            'typescript',
            'typescriptreact',
        ],
        'eslint.validate': [
            // For now, disabling eslint for markdown.

            // MDX eslint plugin not compatible with MDX v3 yet.
            // Outdated package: `eslint-plugin-mdx`.

            // Additionally, the formatter for MDX/markdown has been changed
            // from eslint to prettier, for now. See langauge settings below.

            // 'mdx',
            // 'markdown',

            'javascript',
            'javascriptreact',
            'typescript',
            'typescriptreact',
        ],
        'eslint.options': {
            overrideConfigFile: './eslint.config.mjs',
        },

        /**
         * Stylelint options.
         */

        'stylelint.validate': ['scss', 'css'],

        /**
         * Tailwind CSS options.
         *
         * This extension adds a `tailwindcss` language to VS Code that we don’t use. Not sure why it even exists,
         * because the language mapping that this extension does already covers CSS files.
         */

        'tailwindCSS.validate': true,
        'tailwindCSS.experimental.configFile': './tailwind.config.mjs',
        'tailwindCSS.classAttributes': tailwindSettings.classAttributes,
        'tailwindCSS.includeLanguages': {}, // Defaults ok; {@see https://o5p.me/kaPo3F}.
        'tailwindCSS.files.exclude': [
            ...(!(await u.isPkgName('@clevercanyon/skeleton')) ? [...exclusions.devDotFileIgnores] : []),
            ...exclusions.logIgnores, //
            ...exclusions.backupIgnores,
            ...exclusions.patchIgnores,
            ...exclusions.editorIgnores,
            ...exclusions.toolingIgnores,
            ...exclusions.pkgIgnores,
            ...exclusions.vcsIgnores,
            ...exclusions.osIgnores,
            ...exclusions.lockIgnores,
            ...exclusions.distIgnores,
        ],

        /**
         * Markdown/MDX options.
         */

        'markdown.styles': [],
        'markdown.preview.fontSize': 16,
        'markdown.preview.lineHeight': 1.5,
        'markdown.preview.typographer': true,
        'markdown.preview.fontFamily': "Georama, sans-serif, 'Apple Color Emoji'",

        'markdown.validate.enabled': false, // For a different markdown flavor.
        // Disabling because we use remark, a different flavor than VSCode, and several plugins.

        'mdx.server.enable': false, // Experimental, so disabling.
        // MDX intellisense has trouble validating links in frontmatter, footnotes.

        /**
         * Prettier options.
         */

        // By default, prettier ignores everything in `.gitignore` also,
        // which we don’t want, so explicitly listed here; {@see https://o5p.me/nfS7UF}.
        'prettier.ignorePath': '.prettierignore',

        /**
         * TOML formatting options.
         */
        'evenBetterToml.formatter.indentString': ' '.repeat(prettierConfig.tabWidth),

        /**
         * Documents.
         */

        '[mdx]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,
            'files.trimTrailingWhitespace': false,
            'editor.wordWrap': 'on',

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            // Change this back to `dbaeumer.vscode-eslint` when `eslint-plugin-mdx` is compatible with MDX v3.
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[markdown]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,
            'files.trimTrailingWhitespace': false,
            'editor.wordWrap': 'on',

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            // Change this back to `dbaeumer.vscode-eslint` when `eslint-plugin-mdx` is compatible with MDX v3.
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[html]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },

        /**
         * Backend code.
         */

        '[php]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[ruby]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[python]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'ms-python.black-formatter',
        },
        '[shellscript]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[dockerfile]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },

        /**
         * Frontend code (most of the time).
         */

        '[javascript]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'dbaeumer.vscode-eslint',
        },
        '[javascriptreact]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'dbaeumer.vscode-eslint',
        },
        '[typescript]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'dbaeumer.vscode-eslint',
        },
        '[typescriptreact]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'dbaeumer.vscode-eslint',
        },
        '[css]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[scss]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[less]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },

        /**
         * Data|config files.
         */

        '[sql]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[json]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[jsonc]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[toml]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'tamasfe.even-better-toml',
        },
        '[yaml]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[ini]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[properties]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[xml]': {
            'editor.tabSize': prettierConfig.tabWidth,
            'editor.insertSpaces': !prettierConfig.useTabs,

            'editor.codeActionsOnSave': {
                'source.fixAll': 'explicit',
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
    };

    /**
     * Composition.
     */
    return {
        ...baseConfig,
    };
};
