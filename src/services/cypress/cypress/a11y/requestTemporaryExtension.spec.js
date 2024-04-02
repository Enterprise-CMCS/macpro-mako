import oneMacDevLoginPage from "../../support/pages/oneMacDevLoginPage";
const OneMacDevLoginPage = new oneMacDevLoginPage();

describe("Check a11y for Request Temporary Extention Page", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.xpath("//button[contains(text(),'Sign In')]").click();
    OneMacDevLoginPage.loginAsA11Y("Active", "State Submitter");

    cy.xpath("//a[contains(text(),'Dashboard')]").click();
    cy.xpath("//a[contains(text(),'New Submission')]").click();
    cy.xpath("//h2[contains(text(),'Waiver Action')]").click();
    cy.xpath("//h2[contains(text(),'Request Temporary Extension')]").click();
  });

  it("Check a11y for Request Temporary Extention Page", () => {
    cy.checkA11yOfPage();
  });
});