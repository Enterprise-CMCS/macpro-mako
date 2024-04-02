describe("FAQ Page 508 test", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.xpath('//a[contains(text(),"FAQ")]').click();
  });

  it("Check a11y on FAQ Page", () => {
    cy.checkA11yOfPage();
  });
});
