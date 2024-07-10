import yargs from "yargs";
import {
  deploy,
  destroy,
  docs,
  e2e,
  install,
  openApp,
  openKibana,
  securityHubSync,
  testGui,
  test,
  ui,
  getCost,
} from "./commands";

yargs
  .command(deploy)
  .command(destroy)
  .command(docs)
  .command(e2e)
  .command(install)
  .command(openApp)
  .command(openKibana)
  .command(securityHubSync)
  .command(testGui)
  .command(test)
  .command(ui)
  .command(getCost)
  .strict()
  .scriptName("run")
  .demandCommand(1, "").argv;
