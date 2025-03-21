import { exec } from "child_process";

export function openUrl(url) {
  const start = "open";
  exec(`${start} ${url}`, (error) => {
    if (error) {
      console.error(`Error opening URL: ${error}`);
    }
  });
}
