import * as fs from "fs/promises";
import * as path from "path";
import * as extract from "extract-zip";
import * as glob from "glob";
import * as zip from "bestzip";

async function repackFunctions(this: any, archives: string[]): Promise<void> {
  const serverlessDir = this.serverless.serviceDir;
  const dotServerlessDir = path.join(serverlessDir, ".serverless");
  const repackDir = path.join(serverlessDir, ".repack");

  // Tell the zip command to forego creating directory entries in the archive, via the ZIPOPT variable.
  // See:  https://linux.die.net/man/1/zip
  process.env.ZIPOPT = "-D";

  // Arbitrary, fixed time, used later when setting atime and mtime on files.
  const time = new Date(1990, 1, 1);

  // Make sure the temp dir for repacking is recreated cleanly.
  try {
    await fs.rmdir(repackDir, { recursive: true });
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
  await fs.mkdir(repackDir, { recursive: true });

  // Iterate over each zip. Using a for loop since we need to await inside of it.
  for (let index = 0; index < archives.length; index++) {
    console.log(archives[0]);

    const archive = path.join(dotServerlessDir, archives[index]);
    const funcName = path.basename(archives[index], ".zip");
    const extractDir = path.join(repackDir, funcName);

    await extract(archive, { dir: extractDir });

    // Find all files in the archive, and reset last accessed and modified timestamps.
    // These timestamps affect the archive's commit hash, and setting them to a fixed
    // value is key to achieving idempotency.
    const files = glob.sync(`${extractDir}/**/*`, {
      dot: true,
      silent: true,
      follow: true,
    });

    files.forEach((file) => {
      fs.utimes(file, time, time);
    });

    // Repack the zip file.
    // Note: The env variable ZIPOPT, set near the top of this file, will take affect
    // and will not include directory entries in the zip.
    const zipArgs = {
      source: ".",
      cwd: extractDir,
      destination: `../${funcName}.zip.new`,
    };
    await zip(zipArgs).catch((err: Error) => {
      console.error(err.stack);
      process.exit(1);
    });

    // Copy the repacked zip file to the .serverless directory.
    await fs.copyFile(path.join(repackDir, `${funcName}.zip.new`), archive);
    fs.utimes(archive, time, time);
  }

  // Remove the .repack directory
  await fs.rmdir(repackDir, { recursive: true });
}

// Assuming 'this.serverless' is defined somewhere else
repackFunctions(["custom-resources.zip"]);
