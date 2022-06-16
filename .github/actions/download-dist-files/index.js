const fs = require("fs");
const core = require("@actions/core");
const github = require("@actions/github");
const { execSync } = require("child_process");

(async function downloadDistFiles() {
  const githubToken = core.getInput("token");
  const octokit = github.getOctokit(githubToken);
  const artifacts = await octokit.rest.actions.listWorkflowRunArtifacts({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    run_id: github.context.payload.workflow_run.id,
  });
  const matchArtifact = artifacts.data.artifacts.find(
    (artifact) => artifact.name === "dist-files"
  );
  const download = await octokit.rest.actions.downloadArtifact({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    artifact_id: matchArtifact.id,
    archive_format: "zip",
  });
  fs.writeFileSync(`dist-files.zip`, Buffer.from(download.data));
  execSync("unzip dist-files.zip");
  console.log("FILES");
  console.log(require("directory-tree")("."));
})();
