import oneMacDevLoginPage from "../../support/pages/oneMacDevLoginPage";
const OneMacDevLoginPage = new oneMacDevLoginPage();

describe("Check a11y for view profile Page", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.xpath("//button[contains(text(),'Sign In')]").click();
    OneMacDevLoginPage.loginAsA11Y();

    cy.xpath("//a[contains(text(),'Dashboard')]").click();
    cy.xpath("//body/div[@id='root']/div[1]/nav[1]/div[1]/div[1]/button[1]/*[1]").click();
    cy.xpath("//button[contains(text(),'View Profile')]").click();
  });

  it("Check a11y for view profile Page", () => {
    cy.checkA11yOfPage();
  });
});