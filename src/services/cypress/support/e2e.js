

{
  require("cypress-xpath");
}

// Import commands.js using ES2015 syntax:
import "./commands";
import "cypress-axe";

//to skip the index.of errors
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
