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
  test,
  ui,
  uiLocalOnly,
  watch,
} from "./commands/index.js";

yargs
  // @ts-ignore
  .fail((msg: string | null, err: Error | string | null) => {
    if (err) throw err;
    if (msg) console.error(msg);
    process.exit(1);
  })
  .command(watch)
  .command(deploy)
  .command(destroy)
  .command(docs)
  .command(e2e)
  .command(install)
  .command(logs)
  .command(openApp)
  .command(openKibana)
  .command(test)
  .command(ui)
  .command(uiLocalOnly)
  .command(emails)
  .command(getCost)
  .strict()
  .scriptName("run")
  .demandCommand(1, "")
  .parse();
