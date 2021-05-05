const { execSync } = require('child_process');

const changedPackages = JSON.parse(execSync('lerna changed --json', { encoding: 'utf-8' }));
execSync(`lerna publish from-package --yes`, { encoding: 'utf-8' });
execSync(`git add packages/`, { encoding: 'utf-8' });
execSync(`git commit -m "chore(release): publish release"`, { encoding: 'utf-8' });
changedPackages.forEach(changed => {
  execSync(`git tag ${ changed.name }@${ changed.version }`);
});
