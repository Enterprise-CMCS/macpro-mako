import simpleGit from "simple-git";

const git = simpleGit();

export const setStageFromBranch = async () => {
  try {
    const branchName = await git.revparse(["--abbrev-ref", "HEAD"]);
    if (!branchName) {
      throw new Error();
    } else if (branchName === "HEAD") {
      throw new Error("Detached HEAD state");
    }
    console.log(`Setting stage to be the current branch, ${branchName}, `);
    return branchName;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Detached HEAD state") {
        console.error(
          "ERROR: The current branch is in a detached HEAD state, and it cannot be used as a stage name. Please checkout a branch or explicitly supply a 'stage' argument to your command.",
        );
      } else {
        console.error("Error getting current branch:", error.message);
      }
    } else {
      console.error("An unknown error occurred.");
    }
    process.exit(1);
  }
};
