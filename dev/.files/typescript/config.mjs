#!/usr/bin/env node
/**
 * TypeScript config file.
 *
 * TypeScript is not aware of this config file's location.
 *
 * The underlying `../../../tsconfig.json` file can be recompiled using:
 *
 *     $ madrun update tsconfig
 *     or: $ madrun update dotfiles
 *
 * The underlying `../../../tsconfig.json` file can be tested using:
 *
 *     $ npx tsc --showConfig
 *     $ npx tsc --emitDeclarationOnly --explainFiles
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @see https://www.typescriptlang.org/tsconfig
 * @see https://www.typescriptlang.org/docs/handbook/module-resolution.html
 * @see https://vitejs.dev/guide/features.html#typescript-compiler-options
 */

import path from 'node:path';
import { $fs } from '../../../node_modules/@clevercanyon/utilities.node/dist/index.js';
import esVersion from '../bin/includes/es-version.mjs';
import exclusions from '../bin/includes/exclusions.mjs';
import importAliases from '../bin/includes/import-aliases.mjs';

const __dirname = $fs.imuDirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../..');
const srcDir = path.resolve(projDir, './src');

/**
 * Prepares relative import aliases.
 */
const relativeImportAliases = {}; // Initializes relative aliases.
for (const [aliasPath, realPath] of Object.entries(importAliases.asGlobs)) {
    let realRelativePath = path.relative(srcDir, realPath); // i.e., Relative to `compilerOptions.baseUrl`.
    relativeImportAliases[aliasPath] = [realRelativePath.startsWith('.') ? realRelativePath : './' + realRelativePath];
}

/**
 * Defines TypeScript configuration.
 */
export default async () => {
    /**
     * Base config.
     */
    const baseConfig = {
        include: [
            './' + path.relative(projDir, srcDir) + '/**/*', //
            './' + path.relative(projDir, path.resolve(projDir, './dev-types.d.ts')),
        ],
        exclude: exclusions.asRelativeGlobs(projDir, [
            ...new Set(
                [
                    ...exclusions.localIgnores,
                    ...exclusions.logIgnores,
                    ...exclusions.backupIgnores,
                    ...exclusions.patchIgnores,
                    ...exclusions.editorIgnores,
                    ...exclusions.toolingIgnores,
                    ...exclusions.pkgIgnores,
                    ...exclusions.vcsIgnores,
                    ...exclusions.osIgnores,
                    ...exclusions.dotIgnores,
                    ...exclusions.configIgnores,
                    ...exclusions.lockIgnores,
                    ...exclusions.devIgnores,
                    ...exclusions.distIgnores,
                    ...exclusions.docIgnores,
                ].filter((excl) => '**/dev-types.d.ts/**' !== excl),
            ),
        ]),
        compilerOptions: {
            noEmit: true,
            declaration: true,
            declarationMap: false,

            baseUrl: './' + path.relative(projDir, srcDir),
            rootDir: './' + path.relative(projDir, srcDir),

            outDir: './' + path.relative(projDir, path.resolve(projDir, './dist')),
            declarationDir: './' + path.relative(projDir, path.resolve(projDir, './dist/types')),

            strict: true,
            skipLibCheck: true,

            target: esVersion.lcnYear,
            lib: [esVersion.lcnYear],
            types: [
                'vite/client', // Ambient modules provided by Vite build system.
                '@cloudflare/vitest-pool-workers', // Ambient `cloudflare:test` module.
                'unplugin-icons/types/preact', // Ambient modules for preact icons.
                '@types/mdx', // Ambient modules for MDX imports.

                'dayjs/plugin/advancedFormat', // DayJS types.
                'dayjs/plugin/customParseFormat',
                'dayjs/plugin/localizedFormat',
                'dayjs/plugin/relativeTime',
                'dayjs/plugin/timezone',
                'dayjs/plugin/toObject',
                'dayjs/plugin/utc',
            ],
            jsx: 'react-jsx',
            jsxImportSource: 'preact',

            module: 'node16',
            moduleResolution: 'node16',

            esModuleInterop: true,
            isolatedModules: true,
            resolveJsonModule: true,
            noErrorTruncation: true,
            verbatimModuleSyntax: true,
            allowImportingTsExtensions: true,

            paths: relativeImportAliases, // Relative to `baseUrl`.
        },
        // This is needed by the VSCode extension for MDX.
        mdx: (await (await import(path.resolve(projDir, './mdx.config.mjs'))).default()).vsCodeTSConfig,
    };

    /**
     * Composition.
     */
    return { ...baseConfig };
};
