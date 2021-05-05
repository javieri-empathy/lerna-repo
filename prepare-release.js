const { exec } = require('./utils');

const [kind = 'stable'] = process.argv.slice(2);
const releaseKindArgument = kind === 'alpha' ? '--conventional-prerelease' : '--conventional-graduate';

[
  `lerna version --conventional-commits --no-git-tag-version --yes ${ releaseKindArgument }`,
  'git commit -m "chore(release): prepare release" -a'
].forEach(exec);