import oneMacDevLoginPage from "../../support/pages/oneMacDevLoginPage";
const OneMacDevLoginPage = new oneMacDevLoginPage();

describe("Check a11y for 1915c Appendix K Ammendment Page", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.xpath("//button[contains(text(),'Sign In')]").click();
    OneMacDevLoginPage.loginAsA11Y("Active", "State Submitter");

    cy.xpath("//a[contains(text(),'Dashboard')]").click();
    cy.xpath("//a[contains(text(),'New Submission')]").click();
    cy.xpath("//h2[contains(text(),'Waiver Action')]").click();
    cy.xpath("//h2[contains(text(),'1915(c) Appendix K Amendment')]").click();
  });

  it("Check a11y for 1915c Appendix K Ammendment Page", () => {
    cy.checkA11yOfPage();
  });
});