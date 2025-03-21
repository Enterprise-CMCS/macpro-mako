import * as readlineSync from "readline-sync";

export function confirmDestroyCommand(stack) {
  const orange = "\x1b[38;5;208m";
  const reset = "\x1b[0m";

  const confirmation = readlineSync.question(`
${orange}********************************* STOP *******************************
You've requested a destroy for: 

    ${stack}

Continuing will irreversibly delete all data and infrastructure
associated with ${stack} and its nested stacks.

Do you really want to destroy it?
Re-enter the stack name (${stack}) to continue:
**********************************************************************${reset}
`);

  if (confirmation !== stack) {
    throw new Error(`
${orange}**********************************************************************
The destroy operation has been aborted.
**********************************************************************${reset}
`);
  }
}
