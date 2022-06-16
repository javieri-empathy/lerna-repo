const fs = require("fs");
const { execSync } = require("child_process");

(async function downloadDistFiles() {
    const artifacts = await github.actions.listWorkflowRunArtifacts({
        owner: context.repo.owner,
        repo: context.repo.repo,
        run_id: github.event.workflow_run.id,
    });
    const matchArtifact = artifacts.data.artifacts.find(
        (artifact) => artifact.name === "dist-files"
    );
    const download = await github.actions.downloadArtifact({
        owner: context.repo.owner,
        repo: context.repo.repo,
        artifact_id: matchArtifact.id,
        archive_format: "zip",
    });
    fs.writeFileSync(
        `${github.workspace}/dist-files.zip`,
        Buffer.from(download.data)
    );
    execSync("unzip dist-files.zip");
})();
