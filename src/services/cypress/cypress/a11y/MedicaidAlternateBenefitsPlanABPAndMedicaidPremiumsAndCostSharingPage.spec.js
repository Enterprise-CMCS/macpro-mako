import oneMacDevLoginPage from "../../support/pages/oneMacDevLoginPage";
const OneMacDevLoginPage = new oneMacDevLoginPage();

describe("Check a11y for Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing Page", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.xpath("//button[contains(text(),'Sign In')]").click();
    OneMacDevLoginPage.loginAsA11Y("Active", "State Submitter");

    cy.xpath("//a[contains(text(),'Dashboard')]").click();
    cy.xpath("//a[contains(text(),'New Submission')]").click();
    cy.xpath("//h2[contains(text(),'State Plan Amendment (SPA)')]").click();
    cy.xpath("//body[1]/div[1]/div[1]/main[1]/div[1]/section[1]/fieldset[1]/div[1]/div[2]/label[1]/a[1]/div[1]/div[1]").click();
    cy.xpath("//h2[contains(text(),'Medicaid Alternative Benefits Plans (ABP), and Med')]").click();
  });

  it("Check a11y for Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing Page", () => {
    cy.checkA11yOfPage();
  });
});