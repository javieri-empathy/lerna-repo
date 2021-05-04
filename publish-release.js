const { execSync } = require('child_process');

const changedPackages = JSON.parse(execSync('lerna changed --json', { encoding: 'utf-8' }));
// execSync(`git commit -m "chore(release): publish release" -a`);
changedPackages.forEach(changed => {
  execSync(`git tag ${ changed.name }@${ changed.version }`);
});
execSync(`lerna publish from-package --yes`);