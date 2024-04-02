import oneMacDevLoginPage from "../../support/pages/oneMacDevLoginPage";
const OneMacDevLoginPage = new oneMacDevLoginPage();

describe("Check a11y for New Waiver Action 1915(b) Comprehensive (Capitated) New Initial Waiver Page", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.xpath("//button[contains(text(),'Sign In')]").click();
    OneMacDevLoginPage.loginAsA11Y("Active", "State Submitter");

    cy.xpath("//a[contains(text(),'Dashboard')]").click();
    cy.xpath("//a[contains(text(),'New Submission')]").click();
    cy.xpath("//h2[contains(text(),'Waiver Action')]").click();
    cy.xpath("//h2[contains(text(),'1915(b) Waiver Actions')]").click();
    cy.xpath("//h2[contains(text(),'1915(b) Comprehensive (Capitated) Waiver Authority')]").click();
    cy.xpath("//h2[contains(text(),'1915(b) Comprehensive (Capitated) New Initial Waiv')]").click();
  });

  it("Check a11y for New Waiver Action 1915(b) Comprehensive (Capitated) New Initial Waiver Page", () => {
    cy.checkA11yOfPage();
  });
});