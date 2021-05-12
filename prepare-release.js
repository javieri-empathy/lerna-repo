const { exec } = require('./utils');


// removeReleaseBranchIfExists('release');
execLernaVersion();


function removeReleaseBranchIfExists(branchName) {
  const branchesOutput = exec('git branch -r').trim();
  const remoteBranches = branchesOutput.split('\n').map(branch => branch.trim());
  if (remoteBranches.includes(`origin/${branchName}`)) {
    exec(`git push --delete origin ${ branchName }`);
  }
}

function execLernaVersion() {
  const [releaseKind = 'stable'] = process.argv.slice(2);
  const releaseKindArgument = releaseKind === 'alpha' ? '--conventional-prerelease' : '--conventional-graduate';
  exec(`lerna version --conventional-commits --no-git-tag-version --yes ${ releaseKindArgument }`);
}