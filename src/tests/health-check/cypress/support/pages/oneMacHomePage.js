//css, use cy.get

//xpath, use cy.xpath
const FAQLink = "//a[text()='FAQ']";
const HomeLink = "//a[contains(text(),'Home')]";
const signInBtn = "//button[contains(text(),'Sign In')]";
const registerBtn = "//button[contains(text(),'Register')]";

export class oneMacHomePage {
  launch() {
    cy.visit("/");
  }
  pageHasLoaded() {
    cy.xpath(HomeLink).should("be.visible");
    cy.xpath(FAQLink).should("be.visible");
  }
  verifyUserIsNotLoggedInOnHomePage() {
    cy.xpath(HomeLink).should("have.class", "underline");
    cy.xpath(signInBtn).should("be.visible");
    cy.xpath(registerBtn).should("be.visible");
  }

  clickSignInBtn() {
    cy.xpath(signInBtn).click();
  }

  clickFAQLink() {
    cy.xpath(FAQLink)
      .invoke("attr", "href")
      .then((href) => {
        cy.visit(href);
      });
  }
}
export default oneMacHomePage;
