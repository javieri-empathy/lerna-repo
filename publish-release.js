const { execSync } = require('child_process');

const changedPackages = JSON.parse(execSync('lerna changed --json', { encoding: 'utf-8' }));
execSync(`lerna publish from-package --yes`);
execSync(`git add packages/`);
execSync(`git commit -m "chore(release): publish release"`);
changedPackages.forEach(changed => {
  execSync(`git tag ${ changed.name }@${ changed.version }`);
});
