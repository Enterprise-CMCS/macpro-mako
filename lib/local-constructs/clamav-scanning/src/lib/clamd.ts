import fs from "fs";
import pino from "pino";
const logger = pino();

import { exec, spawn } from "child_process";

const CLAMD_SOCKET = "/tmp/clamd.ctl";
const MAX_WAIT_TIME = 30000; // 30 seconds
const SLEEP_INTERVAL = 1000; // 1 second

export async function startClamd() {
  return new Promise<void>((resolve, reject) => {
    // Check if clamd is already running
    if (fs.existsSync(CLAMD_SOCKET)) {
      logger.info("clamd is already running.");
      resolve();
      return;
    }

    logger.info("Starting clamd...");
    const clamd = spawn("/usr/sbin/clamd");

    clamd.on("error", (err) => {
      logger.error(`Failed to start clamd: ${err.message}`);
      reject(err);
    });

    clamd.stdout.on("data", (data) => {
      logger.info(`clamd stdout: ${data}`);
    });

    clamd.stderr.on("data", (data) => {
      logger.error(`clamd stderr: ${data}`);
    });

    let timePassed = 0;

    const checkClamdReady = setInterval(() => {
      if (fs.existsSync(CLAMD_SOCKET)) {
        logger.info("clamd socket found, verifying clamd is ready...");

        // Test if clamd is ready by scanning a small file
        const testFilePath = "/tmp/testfile.txt";
        fs.writeFileSync(testFilePath, "SCAN ME");

        exec(`clamdscan --fdpass ${testFilePath}`, (error, stdout, stderr) => {
          if (error) {
            logger.error(`clamdscan error: ${stderr}`);
          } else if (stdout.includes("OK")) {
            clearInterval(checkClamdReady);
            fs.unlinkSync(testFilePath);
            logger.info("clamd is up and running!");
            resolve();
          } else {
            logger.info("clamd is not ready yet.");
          }
        });
      }

      timePassed += SLEEP_INTERVAL;

      if (timePassed >= MAX_WAIT_TIME) {
        clearInterval(checkClamdReady);
        reject(
          new Error(
            "clamd did not become fully operational within 30 seconds.",
          ),
        );
      }
    }, SLEEP_INTERVAL);
  });
}
