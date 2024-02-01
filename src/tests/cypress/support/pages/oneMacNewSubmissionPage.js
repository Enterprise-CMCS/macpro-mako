const cardLink = "//a[@data-testid='link-wrapper']";

export class oneMacNewSubmissionPage {
  verifyChoiceGoesTo(choiceText, destinationUrl) {
    cy.xpath(cardLink)
      .filter(`:contains("${choiceText}")`)
      .should("have.attr", "href", destinationUrl);
  }
  clickChoice(choiceText) {
    cy.xpath(cardLink).filter(`:contains("${choiceText}")`).click();
  }
}
export default oneMacNewSubmissionPage;
