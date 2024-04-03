import oneMacDevLoginPage from "../../support/pages/oneMacDevLoginPage";
const OneMacDevLoginPage = new oneMacDevLoginPage();

describe("dashboard waivers page 508 test", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.xpath("//button[contains(text(),'Sign In')]").click();
    OneMacDevLoginPage.loginAsA11Y();

    cy.xpath("//a[contains(text(),'Dashboard')]").click();
    cy.xpath("//h2[contains(text(),'Waivers')]").click();
  });

  it("Check a11y on dashboard waivers page", () => {
    cy.checkA11yOfPage();
  });
});