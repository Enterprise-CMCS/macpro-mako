import yargs from "yargs";

import {
  deploy,
  destroy,
  docs,
  e2e,
  emails,
  getCost,
  install,
  logs,
  openApp,
  openKibana,
  storybook,
  test,
  ui,
  watch,
} from "./commands";

yargs
  .fail((msg, err) => {
    if (err) throw err;
    if (msg) console.error(msg);
    process.exit(1);
  })
  .command(deploy)
  .command(destroy)
  .command(docs)
  .command(e2e)
  .command(emails)
  .command(getCost)
  .command(install)
  .command(logs)
  .command(openApp)
  .command(openKibana)
  .command(storybook)
  .command(test)
  .command(ui)
  .command(watch)
  .strict()
  .scriptName("run")
  .demandCommand(1, "")
  .parse();
