/**
 * Wrangler settings file.
 *
 * Wrangler is not aware of this config file's location. We use the exports provided by this file to centralize a few
 * settings associated with Wrangler that are reused across various tools that integrate with Wrangler.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */

import os from 'node:os';
import path from 'node:path';
import { $fs } from '../../../node_modules/@clevercanyon/utilities.node/dist/index.js';
import { $app, $brand } from '../../../node_modules/@clevercanyon/utilities/dist/index.js';
import u from '../bin/includes/utilities.mjs';

const __dirname = $fs.imuDirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../..');

/**
 * Defines Wrangler settings.
 */
export default async () => {
    const pkg = await u.pkg();
    const pkgSlug = $app.pkgSlug(pkg.name);
    const hop = $brand.get('@clevercanyon/hop.gdn');

    return {
        // This is Clever Canyon’s account ID. ↓
        defaultAccountId: 'f1176464a976947aa5665d989814a4b1',

        compatibilityDate: '2023-12-01',
        compatibilityFlags: [], // None, for now.

        defaultLocalIP: '0.0.0.0',
        defaultLocalHostname: 'localhost',
        defaultLocalProtocol: 'https',
        defaultLocalPort: '443',

        defaultDevLogLevel: 'error',
        miniflareEnvVarAsString: 'MINIFLARE=true',
        miniflareEnvVarAsObject: { MINIFLARE: 'true' },

        defaultPagesZoneName: hop.hostname,
        defaultPagesDevZoneName: 'pages.dev',

        defaultPagesProjectName: pkgSlug,
        defaultPagesProjectShortName: pkgSlug //
            .replace(/-(?:com|net|org|gdn|hop-gdn)$/iu, ''),

        defaultPagesProductionBranch: 'production',
        defaultPagesProjectStageBranchName: 'stage',
        defaultPagesProductionEnvironment: 'production',

        defaultWorkerZoneName: hop.hostname,
        defaultWorkersDevZoneName: 'c10n.workers.dev',
        defaultWorkersDomain: 'workers.' + hop.hostname,

        defaultWorkerName: pkgSlug, // e.g., `workers-hop-gdn-utilities`.
        defaultWorkerShortName: pkgSlug.replace(/^workers-hop-gdn-/iu, ''),
        defaultWorkerStageShortName: 'stage.' + pkgSlug.replace(/^workers-hop-gdn-/iu, ''),

        osDir: path.resolve(os.homedir(), './.wrangler'),
        projDir: path.resolve(projDir, './.wrangler'),
        projStateDir: path.resolve(projDir, './.wrangler/state'),

        osSSLCertDir: path.resolve(os.homedir(), './.wrangler/local-cert'),
        osSSLKeyFile: path.resolve(os.homedir(), './.wrangler/local-cert/key.pem'),
        osSSLCertFile: path.resolve(os.homedir(), './.wrangler/local-cert/cert.pem'),

        customSSLKeyFile: path.resolve(projDir, './dev/.files/bin/ssl-certs/i10e-ca-key.pem'),
        customSSLCertFile: path.resolve(projDir, './dev/.files/bin/ssl-certs/i10e-ca-crt.pem'),
    };
};
