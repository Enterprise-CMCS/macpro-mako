import oneMacDevLoginPage from "../../support/pages/oneMacDevLoginPage";
const OneMacDevLoginPage = new oneMacDevLoginPage();

describe("Dashboard first entry 508 test", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.xpath("//button[contains(text(),'Sign In')]").click();
    OneMacDevLoginPage.loginAsA11Y("Active", "State Submitter");

    cy.xpath("//a[contains(text(),'Dashboard')]").click();
    cy.xpath("/html[1]/body[1]/div[1]/div[1]/main[1]/div[1]/div[2]/div[1]/div[2]/section[1]/div[2]/table[1]/tbody[1]/tr[1]/td[2]/a[1]").click();
  });

  it("Check a11y on first entry on dashboard page", () => {
    cy.checkA11yOfPage();
  });
});