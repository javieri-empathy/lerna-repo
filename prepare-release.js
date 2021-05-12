const { exec } = require('./utils');

const branchName = 'release';
const [releaseKind = 'stable'] = process.argv.slice(2);
const releaseKindArgument = releaseKind === 'alpha' ? '--conventional-prerelease' : '--conventional-graduate';
const branchesOutput = exec('git branch -r').trim();
const remoteBranches = branchesOutput.split('\n').map(branch => branch.trim());
if (remoteBranches.includes(`origin/${branchName}`)) {
  exec(`git push --delete origin ${ branchName }`);
}
// exec(`git checkout -b ${ branchName }`);
exec(`lerna version --conventional-commits --no-git-tag-version --yes ${ releaseKindArgument }`);
exec(`git commit -m "chore(release): prepare ${releaseKind} release" -a`);