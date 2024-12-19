import yargs from "yargs";
import {
  deploy,
  destroy,
  docs,
  e2e,
  install,
  logs,
  openApp,
  openKibana,
  test,
  ui,
  getCost,
  watch,
  emails,
} from "./commands";

yargs(process.argv.slice(2))
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
  .command(emails)
  .command(getCost)
  .strict()
  .scriptName("run")
  .demandCommand(1, "")
  .showHelpOnFail(false, "Specify --help for available options")
  .exitProcess(true)
  .parse();
