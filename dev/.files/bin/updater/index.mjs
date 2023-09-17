/**
 * Dotfiles updater.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { $chalk, $fs, $prettier } from '../../../../node_modules/@clevercanyon/utilities.node/dist/index.js';
import { $is, $json, $obj, $obp, $str } from '../../../../node_modules/@clevercanyon/utilities/dist/index.js';
import customRegExp from './data/custom-regexp.mjs';

export default async ({ projDir }) => {
	/**
	 * Initializes vars.
	 */
	const { log } = console;
	const __dirname = $fs.imuDirname(import.meta.url);
	const skeletonDir = path.resolve(__dirname, '../../../..');

	/**
	 * Gets current `./package.json`.
	 *
	 * @returns {object} Parsed `./package.json`.
	 */
	const getPkg = async () => {
		const pkgFile = path.resolve(projDir, './package.json');

		if (!fs.existsSync(pkgFile)) {
			throw new Error('updater.getPkg: Missing `./package.json`.');
		}
		const pkg = $json.parse(fs.readFileSync(pkgFile).toString());

		if (!$is.plainObject(pkg)) {
			throw new Error('updater.getPkg: Unable to parse `./package.json`.');
		}
		return pkg;
	};

	/**
	 * Gets properties from `./package.json` file.
	 */
	const { pkgRepository, pkgDotfileLocks } = await (async () => {
		const pkg = await getPkg();
		const pkgRepository = pkg.repository || '';

		let pkgDotfileLocks = $obp.get(pkg, 'config.c10n.&.dotfiles.lock', []);
		pkgDotfileLocks = pkgDotfileLocks.map((relPath) => path.resolve(projDir, relPath));

		return { pkgRepository, pkgDotfileLocks };
	})();

	/**
	 * Tests `pkgRepository` against an `owner/repo` string.
	 *
	 * @param   {string}  ownerRepo An `owner/repo` string.
	 *
	 * @returns {boolean}           True if current package repo is `ownerRepo`.
	 */
	const isPkgRepo = async (ownerRepo) => {
		return new RegExp('[:/]' + $str.escRegExp(ownerRepo) + '(?:\\.git)?$', 'iu').test(pkgRepository);
	};

	/**
	 * Checks dotfile locks.
	 *
	 * @param   {string}  relPath Relative dotfile path.
	 *
	 * @returns {boolean}         True if relative path is locked by `package.json`.
	 */
	const isLocked = async (relPath) => {
		// Compares absolute paths to each other.
		const absPath = path.resolve(projDir, relPath);

		for (let i = 0; i < pkgDotfileLocks.length; i++) {
			if (absPath === pkgDotfileLocks[i]) {
				return true; // Locked 🔒.
			}
		}
		return false;
	};

	/**
	 * Updates immutable directories.
	 */
	for (const relPath of ['./dev/.files']) {
		await fsp.rm(path.resolve(projDir, relPath), { recursive: true, force: true });
		await fsp.mkdir(path.resolve(projDir, relPath), { recursive: true });
		await fsp.cp(path.resolve(skeletonDir, relPath), path.resolve(projDir, relPath), { recursive: true });
	}
	await fsp.chmod(path.resolve(projDir, './dev/.files/bin/envs.mjs'), 0o700);
	await fsp.chmod(path.resolve(projDir, './dev/.files/bin/install.mjs'), 0o700);
	await fsp.chmod(path.resolve(projDir, './dev/.files/bin/update.mjs'), 0o700);

	/**
	 * Deletes outdated dotfiles no longer in use.
	 */
	for (const relPath of ['./.madrun.mjs', './tsconfig.d.ts']) {
		if (await isLocked(relPath)) {
			continue; // Locked 🔒.
		}
		await fsp.rm(path.resolve(projDir, relPath), { recursive: true, force: true });
	}

	/**
	 * Updates semi-immutable dotfiles.
	 */
	for (const relPath of [
		'./.npmrc',
		'./.npmignore',

		'./.gitignore',
		'./.gitattributes',

		'./.github/CODEOWNERS',
		'./.github/dependabot.yml',
		'./.github/workflows/ci.yml',

		'./.editorconfig',
		'./.vscode/settings.json',
		'./.vscode/extensions.json',

		'./ts-types.d.ts',
		'./tsconfig.json',
		'./tsconfig.mjs',

		'./wrangler.toml',
		'./wrangler.mjs',

		'./.browserslistrc',
		'./.prettierignore',
		'./.remarkrc.mjs',
		'./.shellcheckrc',
		'./eslint.config.mjs',
		'./jest.config.mjs',
		'./madrun.config.mjs',
		'./postcss.config.mjs',
		'./prettier.config.mjs',
		'./stylelint.config.mjs',
		'./tailwind.config.mjs',
		'./vite.config.mjs',
	]) {
		if (await isLocked(relPath)) {
			continue; // Locked 🔒.
		}
		let newFileContents = ''; // Initialize.

		if (fs.existsSync(path.resolve(projDir, relPath))) {
			const oldFileContents = (await fsp.readFile(path.resolve(projDir, relPath))).toString();
			const oldFileMatches = customRegExp.exec(oldFileContents); // See: `./data/custom-regexp.js`.
			const oldFileCustomCode = oldFileMatches ? oldFileMatches[2] : ''; // We'll preserve any custom code.
			newFileContents = (await fsp.readFile(path.resolve(skeletonDir, relPath))).toString().replace(customRegExp, ($_, $1, $2, $3) => $1 + oldFileCustomCode + $3);
		} else {
			newFileContents = (await fsp.readFile(path.resolve(skeletonDir, relPath))).toString();
		}
		await fsp.mkdir(path.dirname(path.resolve(projDir, relPath)), { recursive: true });
		await fsp.writeFile(path.resolve(projDir, relPath), newFileContents);
	}

	/**
	 * Adds up-to-date copies of missing mutable files.
	 */
	for (const relPath of [
		'./LICENSE.txt', //
		'./README.md',
	]) {
		if (await isLocked(relPath)) {
			continue; // Locked 🔒.
		}
		if (!fs.existsSync(path.resolve(projDir, relPath))) {
			await fsp.cp(path.resolve(skeletonDir, relPath), path.resolve(projDir, relPath));
		}
	}

	/**
	 * Adds and/or updates updateable JSON files.
	 */
	for (const relPath of [
		'./package.json', //
	]) {
		if (await isLocked(relPath)) {
			continue; // Locked 🔒.
		}
		if (!fs.existsSync(path.resolve(projDir, relPath))) {
			await fsp.cp(path.resolve(skeletonDir, relPath), path.resolve(projDir, relPath));
		}
		let json = $json.parse((await fsp.readFile(path.resolve(projDir, relPath))).toString());
		const jsonUpdatesRelPath = relPath.replace(/(^|\/)([^/]+\.[^.]+)$/u, '$1_$2'); // Leading underscore in basename.
		const jsonUpdatesFile = path.resolve(skeletonDir, './dev/.files/bin/updater/data', jsonUpdatesRelPath, './updates.json');

		if (!$is.plainObject(json)) {
			throw new Error('updater: Unable to parse `' + relPath + '`.');
		}
		if (fs.existsSync(jsonUpdatesFile)) {
			const jsonUpdates = $json.parse((await fsp.readFile(jsonUpdatesFile)).toString());

			if (!$is.plainObject(jsonUpdates)) {
				throw new Error('updater: Unable to parse `' + jsonUpdatesFile + '`.');
			}
			if ('./package.json' === relPath && (await isPkgRepo('clevercanyon/dev-deps'))) {
				if (jsonUpdates.$ꓺdefaults?.['devDependenciesꓺ@clevercanyon/dev-deps']) {
					delete jsonUpdates.$ꓺdefaults['devDependenciesꓺ@clevercanyon/dev-deps'];
				}
				if ($is.array(jsonUpdates.$ꓺunset)) {
					jsonUpdates.$ꓺunset.push('devDependenciesꓺ@clevercanyon/dev-deps');
				} else {
					jsonUpdates.$ꓺunset = ['devDependenciesꓺ@clevercanyon/dev-deps'];
				}
			}
			$obj.patchDeep(json, jsonUpdates); // Potentially declarative ops.
			const prettierConfig = { ...(await $prettier.resolveConfig(path.resolve(projDir, relPath))), parser: 'json' };
			await fsp.writeFile(path.resolve(projDir, relPath), await $prettier.format($json.stringify(json, { pretty: true }), prettierConfig));
		}
	}

	/**
	 * Recompiles `./.gitattributes`; i.e., following update.
	 */
	log($chalk.green('Recompiling `./.gitattributes` using latest dotfiles.'));
	await (await import(path.resolve(projDir, './dev/.files/bin/gitattributes/index.mjs'))).default({ projDir });

	/**
	 * Recompiles `./.gitignore`; i.e., following update.
	 */
	log($chalk.green('Recompiling `./.gitignore` using latest dotfiles.'));
	await (await import(path.resolve(projDir, './dev/.files/bin/gitignore/index.mjs'))).default({ projDir });

	/**
	 * Recompiles `./.npmignore`; i.e., following update.
	 */
	log($chalk.green('Recompiling `./.npmignore` using latest dotfiles.'));
	await (await import(path.resolve(projDir, './dev/.files/bin/npmignore/index.mjs'))).default({ projDir });

	/**
	 * Recompiles `./.prettierignore`; i.e., following update.
	 */
	log($chalk.green('Recompiling `./.prettierignore` using latest dotfiles.'));
	await (await import(path.resolve(projDir, './dev/.files/bin/prettierignore/index.mjs'))).default({ projDir });

	/**
	 * Recompiles `./tsconfig.json`; i.e., following update.
	 */
	log($chalk.green('Recompiling `./tsconfig.json` using latest dotfiles.'));
	await (await import(path.resolve(projDir, './dev/.files/bin/tsconfig/index.mjs'))).default({ projDir });

	/**
	 * Recompiles `./wrangler.toml`; i.e., following update.
	 */
	log($chalk.green('Recompiling `./wrangler.toml` using latest dotfiles.'));
	await (await import(path.resolve(projDir, './dev/.files/bin/wrangler/index.mjs'))).default({ projDir });
};
