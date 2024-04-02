## MAKO Automated Testing with Cypress and Cucumber

MAKO uses the Cypress (https://cypress.io) front end testing tool with Cucumber (https://cucumber.io) as the Behavior-Driven-Development (BDD) layer. This allows the team to test the intricate details of the MAKO application in a reliable and readable way.

*Working with Node v18+ (untested with v16 and will not work with v14 or earlier)*
### Installing and using full cypress suite locally

cd ~projectDir/src/services/cypress
yarn

yarn cypress open


## Run an individual cypress test rather than whole test suite

go to test suite directory
yarn cypress run --spec "./cypress/e2e/test-name.spec.feature" --headed
