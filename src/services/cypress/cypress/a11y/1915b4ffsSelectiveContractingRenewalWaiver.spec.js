import oneMacDevLoginPage from "../../support/pages/oneMacDevLoginPage";
const OneMacDevLoginPage = new oneMacDevLoginPage();

describe("Check a11y for New Waiver 1915b4 FFS Selecting Contracting Renewal Waiver Waivers page", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.xpath("//button[contains(text(),'Sign In')]").click();
    OneMacDevLoginPage.loginAsA11Y("Active", "State Submitter");

    cy.xpath("//a[contains(text(),'Dashboard')]").click();
    cy.xpath("//a[contains(text(),'New Submission')]").click();
    cy.xpath("//h2[contains(text(),'Waiver Action')]").click();
    cy.xpath("//h2[contains(text(),'1915(b) Waiver Actions')]").click();
    cy.xpath("//h2[contains(text(),'1915(b)(4) FFS Selective Contracting Waivers')]").click();
    cy.xpath("//h2[contains(text(),'1915(b)(4) FFS Selective Contracting Renewal Waive')]").click();
  });

  it("Check a11y for New Waiver 1915b4 FFS Selecting Contracting Renewal Waiver Waivers page", () => {
    cy.checkA11yOfPage();
  });
});