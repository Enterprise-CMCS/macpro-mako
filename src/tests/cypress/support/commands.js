// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

before(() => {
  // root-level hook
  // runs once before all tests

  // generate waiver numbers to be used across tests
  // cy.task("generateWaiverNumber", {
  //   filename: "sharedWaiverNumber4",
  //   digits: 4,
  // });
  // cy.task("generateWaiverNumber", {
  //   filename: "sharedWaiverNumber5",
  //   digits: 5,
  // });
  // cy.task("generateWaiverNumber", { filename: "raiWaiverNumber4", digits: 4 });
  // cy.task("generateWaiverNumber", { filename: "raiWaiverNumber5", digits: 5 });

  // waits up to 5 mins for serverless to boot up all services and web page
  cy.visit("/", { timeout: 60000 * 5 });
});

Cypress.Commands.add("waitForSpinners", () => {
  cy.get(".loader__container", { timeout: 30_000 }).should("not.exist");
});

// Define at the top of the spec file or just import it
function terminalLog(violations) {
  cy.task(
    "log",
    `${violations.length} accessibility violation${
      violations.length === 1 ? "" : "s"
    } ${violations.length === 1 ? "was" : "were"} detected`
  );
  // pluck specific keys to keep the table readable
  const violationData = violations.map(
    ({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.length,
    })
  );

  cy.task("table", violationData);
}

// axe api documentation: https://www.deque.com/axe/core-documentation/api-documentation/
Cypress.Commands.add("checkA11yOfPage", () => {
  cy.wait(3000);
  cy.injectAxe();
  cy.checkA11y(
    null,
    {
      values: ["wcag2a", "wcag2aa"],
      includedImpacts: ["minor", "moderate", "serious", "critical"], // options: "minor", "moderate", "serious", "critical"
    },
    terminalLog
    // (err) => {
    //   console.log("Accessibility violations:");
    //   console.log({ err });
    // },
    // defaults to false... // true // does not fail tests for ally violations
  );
});

import "cypress-file-upload";
