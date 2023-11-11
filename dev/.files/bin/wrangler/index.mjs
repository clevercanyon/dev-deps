/**
 * `./wrangler.toml` generator.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */

import toml from '@iarna/toml';
import fs from 'node:fs';
import path from 'node:path';
import { $str, $time } from '../../../../node_modules/@clevercanyon/utilities/dist/index.js';

export default async ({ projDir }) => {
    /**
     * Initializes vars.
     */
    const wranglerFile = path.resolve(projDir, './wrangler.toml');

    /**
     * Defines `./wrangler.toml` file comments.
     */
    const wranglerFileComments = $str.dedent(`
        ##
        # Auto-generated Wrangler config file.
        #
        # Wrangler is aware of this config file's location.
        #
        # @note PLEASE DO NOT EDIT THIS FILE!
        # @note This entire file will be updated automatically.
        # @note Instead of editing here, please review \`./wrangler.mjs\`.
        #
        # Last generated using \`./wrangler.mjs\` ${$time.now().toProse()}.
        ##
    `);

    /**
     * Defines `./wrangler.toml` file contents.
     */
    const wranglerFileObj = (await import(path.resolve(projDir, './wrangler.mjs'))).default;
    const wranglerFileContents = toml.stringify(wranglerFileObj);

    /**
     * Compiles `./wrangler.toml` file contents.
     */
    fs.writeFileSync(wranglerFile, wranglerFileComments + '\n\n' + wranglerFileContents);
};
