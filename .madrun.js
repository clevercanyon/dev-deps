/**
 * Mad Run config file.
 */
/* eslint-env es2021, node */

export default {
	'update:project': async (args) => {
		const cmds = ['npm update --save'];

		if (args.repos) {
			const repoUpdateCMD =
				'if git rev-parse --is-inside-work-tree &>/dev/null; then' +
				(args.pkgs
					? '	if [[ -n "$(git status --short 2>/dev/null)" ]]; then' +
					  "		git add --all && git commit --message 'Project update. [p][robotic]';" +
					  '	fi;' +
					  '	if [[ "$(git symbolic-ref --short --quiet HEAD)" == main ]]; then' +
					  '		npm version patch;' +
					  '		npm publish;' +
					  '	fi;'
					: '') +
				'	if [ -n "$(git status --short 2>/dev/null)" ]; then' +
				"		git add --all && git commit --message 'Project update. [p][robotic]';" +
				'	fi;' +
				'	git push --set-upstream origin "$(git symbolic-ref --short --quiet HEAD)";' +
				'	git push origin --tags;' +
				'fi';
			cmds.push(repoUpdateCMD);
		}
		return cmds;
	},
};
