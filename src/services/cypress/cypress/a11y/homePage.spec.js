describe("HomePage 508 test", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Check a11y on Home Page", () => {
    cy.checkA11yOfPage();
  });
});
