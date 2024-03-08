import oneMacDevLoginPage from "../../support/pages/oneMacDevLoginPage";
const OneMacDevLoginPage = new oneMacDevLoginPage();

describe("Check a11y for Chip Eligibality Page", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.xpath("//button[contains(text(),'Sign In')]").click();
    OneMacDevLoginPage.loginAsA11Y("Active", "State Submitter");

    cy.xpath("//a[contains(text(),'Dashboard')]").click();
    cy.xpath("//a[contains(text(),'New Submission')]").click();
    cy.xpath("//h2[contains(text(),'State Plan Amendment (SPA)')]").click();
    cy.xpath("//h2[contains(text(),'CHIP SPA')]").click();
    cy.xpath("//h2[contains(text(),'CHIP Eligibility')]").click();
  });

  it("Check a11y for Chip Eligibality Page", () => {
    cy.checkA11yOfPage();
  });
});