const core = require('@actions/core');
const github = require('@actions/github');
const pulls = await github.paginate('GET /repos/:owner/:repo/pulls', {
    owner: context.repo.owner,
    repo: context.repo.repo
});
let branchesAndPRStrings = [];
let baseBranch = null;
let baseBranchSHA = null;
for (const pull of pulls) {
    const branch = pull['head']['ref'];
    console.log('Pull for branch: ' + branch);
    if (branch.startsWith(core.getInput('branchPrefix'))) {
        console.log('Branch matched prefix: ' + branch);
        let statusOK = true;
        if (core.getInput('mustBeGreen')) {
            console.log('Checking green status: ' + branch);
            const stateQuery = `query($owner: String!, $repo: String!, $pull_number: Int!) {
                    repository(owner: $owner, name: $repo) {
                      pullRequest(number:$pull_number) {
                        commits(last: 1) {
                          nodes {
                            commit {
                              statusCheckRollup {
                                state
                              }
                            }
                          }
                        }
                      }
                    }
                  }`;
            const vars = {
                owner: context.repo.owner,
                repo: context.repo.repo,
                pull_number: pull['number']
            };
            const result = await github.graphql(stateQuery, vars);
            const [{ commit }] = result.repository.pullRequest.commits.nodes;
            const state = commit.statusCheckRollup.state;
            console.log('Validating status: ' + state);
            if (state != 'SUCCESS') {
                console.log('Discarding ' + branch + ' with status ' + state);
                statusOK = false;
            }
        }
        console.log('Checking labels: ' + branch);
        const labels = pull['labels'];
        for (const label of labels) {
            const labelName = label['name'];
            console.log('Checking label: ' + labelName);
            if (labelName == core.getInput('ignoreLabel')) {
                console.log('Discarding ' + branch + ' with label ' + labelName);
                statusOK = false;
            }
        }
        if (statusOK) {
            console.log('Adding branch to array: ' + branch);
            const prString = '#' + pull['number'] + ' ' + pull['title'];
            branchesAndPRStrings.push({ branch, prString });
            baseBranch = pull['base']['ref'];
            baseBranchSHA = pull['base']['sha'];
        }
    }
}
if (branchesAndPRStrings.length == 0) {
    core.setFailed('No PRs/branches matched criteria');
    return;
}
try {
    await github.rest.git.createRef({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: 'refs/heads/' + core.getState('combineBranchName'),
        sha: baseBranchSHA
    });
} catch (error) {
    console.log(error);
    core.setFailed('Failed to create combined branch - maybe a branch by that name already exists?');
    return;
}

let combinedPRs = [];
let mergeFailedPRs = [];
for (const { branch, prString } of branchesAndPRStrings) {
    try {
        await github.rest.repos.merge({
            owner: context.repo.owner,
            repo: context.repo.repo,
            base: core.getInput('combineBranchName'),
            head: branch
        });
        console.log('Merged branch ' + branch);
        combinedPRs.push(prString);
    } catch (error) {
        console.log('Failed to merge branch ' + branch);
        mergeFailedPRs.push(prString);
    }
}

console.log('Creating combined PR');
const combinedPRsString = combinedPRs.join('\n');
let body =
    '✅ This PR was created by the Combine PRs action by combining the following PRs:\n' +
    combinedPRsString;
if (mergeFailedPRs.length > 0) {
    const mergeFailedPRsString = mergeFailedPRs.join('\n');
    body += '\n\n⚠️ The following PRs were left out due to merge conflicts:\n' + mergeFailedPRsString;
}
await github.rest.pulls.create({
    owner: context.repo.owner,
    repo: context.repo.repo,
    title: 'Combined PR',
    head: core.getInput('combineBranchName'),
    base: baseBranch,
    body: body
});
