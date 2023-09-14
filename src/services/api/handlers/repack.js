/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");
const extract = require("extract-zip");
const glob = require("glob");
var zip = require("bestzip");

async function repackFunctions(archives) {
  let serverlessDir = this.serverless.serviceDir;
  let dotServerlessDir = `${serverlessDir}/.serverless`;
  let repackDir = `${serverlessDir}/.repack`;
  // Tell the zip command to forego creating directory entries in the archive, via the ZIPOPT variable.
  // See:  https://linux.die.net/man/1/zip
  process.env.ZIPOPT = "-D";
  // Arbitrary, fixed time, used later when setting atime and mtime on files.
  const time = new Date(1990, 1, 1);
  // Make sure the temp dir for repacking is recreated cleanly.
  try {
    await fs.rmdirSync(repackDir, { recursive: true });
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
  await fs.mkdirSync(repackDir, { recursive: true });
  // Iterate over each zip.  Using a for loop since we need to await inside of it.
  for (let index = 0; index < archives.length; index++) {
    console.log(archives[0]);
    let archive = `${dotServerlessDir}/${archives[index]}`;
    let funcName = path.basename(archives[index], ".zip");
    let extractDir = `${repackDir}/${funcName}`;
    await extract(archive, { dir: extractDir });

    //   // Find all files in the archive, and reset last accessed and modified timestamps.
    //   // These timestamps affect the archive's commit hash, and setting them to a fixed
    //   // value is key to achieving idempotency.
    let files = glob.sync(`${extractDir}/**/*`, {
      dot: true,
      silent: true,
      follow: true,
    });
    files.forEach((file) => {
      fs.utimesSync(file, time, time);
    });

    //   // Repack the zip file.
    //   // Note:  The env variable ZIPOPT, set near the top of this file, will take affect
    //   // and will not include direcory entries in the zip.
    var zipArgs = {
      source: ".",
      cwd: extractDir,
      destination: `../${funcName}.zip.new`,
    };
    await zip(zipArgs).catch(function (err) {
      console.error(err.stack);
      process.exit(1);
    });

    // Copy the repacked zip file to the .serverless directory.
    fs.copyFileSync(`${repackDir}/${funcName}.zip.new`, archive);
    fs.utimesSync(archive, time, time);
  }

  // Remove the .repack directory
  fs.rmdirSync(repackDir, { recursive: true });
}

repackFunctions(["custom-resources.zip"]);
