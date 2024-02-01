describe("Warning Message on Package Details Page", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.xpath("//button[contains(text(),'Sign In')]").click();
    cy.get("#email").type("statesubmitter@nightwatch.test");
    cy.get("#password").type("Passw0rd!");
    cy.get("#loginDevUserBtn").click();
  });

  it("Check if warning message displays properly", () => {
    cy.get("#componentId-0 > a").scrollIntoView().click({ force: true });
    cy.get(".choice-container > .choice-info")
      .first()
      .should(
        "have.text",
        "Documents available on this page may not reflect the actual documents that were approved by CMS. Please refer to your CMS Point of Contact for the approved documents."
      );
    cy.get(
      ".read-only-submission > :nth-child(2) > .choice-container > .choice-info"
    ).should(
      "have.text",
      "Documents available on this page may not reflect the actual documents that were approved by CMS. Please refer to your CMS Point of Contact for the approved documents."
    );
  });
});
