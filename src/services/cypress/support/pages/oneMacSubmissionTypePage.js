//Element is Xpath use cy.xpath instead of cy.get
const statePlanAmendmentSPA = '//*[text()="State Plan Amendment (SPA)"]';
//Element is Xpath use cy.xpath instead of cy.get
const waiverAction = "//*[text()='Waiver Action']";
const waiverActions1915b =
  "//*[text()='1915(b) Waiver Actions']";
//Element is Xpath use cy.xpath instead of cy.get
const medicaidSPA = ':contains("Medicaid SPA")';
//Element is Xpath use cy.xpath instead of cy.get
const medicaidEligibility =
  ':contains("Medicaid Eligibility, Enrollment, Administration, and Health Homes")';
//Element is Xpath use cy.xpath instead of cy.get
const medicaidAlternative =
  ':contains("Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing")';
//Element is Xpath use cy.xpath instead of cy.get
const allOtherMedicaid = ':contains("All Other Medicaid SPA Submissions")';
//Element is Xpath use cy.xpath instead of cy.get
const chipSPA = ':contains("CHIP SPA")';
//Element is Xpath use cy.xpath instead of cy.get
const chipEligibility = ':contains("CHIP Eligibility")';
//Element is Xpath use cy.xpath instead of cy.get
const allOtherChip = ':contains("All Other CHIP SPA Submissions")';
//Element is Xpath use cy.xpath instead of cy.get
const ffsSelectiveAuthority =
  ":contains('1915(b)(4) FFS Selective Contracting Waivers')";
const comprehensiveCapitatedWaiverAuthority =
  ":contains((text(),'1915(b) Comprehensive (Capitated) Waiver Authority')";
//Element is Xpath use cy.xpath instead of cy.get
const RequestTemporaryExtension = '//*[text()="Request Temporary Extension"]';
//Element is Xpath use cy.xpath instead of cy.get
const AppendixKAmendment = '//*[text()="1915(c) Appendix K Amendment"]';
//Element is Xpath use cy.xpath instead of cy.get
const respondToMedicaidSPARAI =
  '//*[text()="Respond to Formal Medicaid SPA RAI"]';
//Element is Xpath use cy.xpath instead of cy.get
const initialWaiver1915b4 =
  ":contains('1915(b)(4) FFS Selective Contracting New Initial Waiver')";
//Element is Xpath use cy.xpath instead of cy.get
const comprehensiveInitialWaiver =
  ":contains('1915(b) Comprehensive (Capitated) New Initial Waiver')";
//Element is Xpath use cy.xpath instead of cy.get
const RequestExtensionBtn = '//button[text()="Request Extension"]';
//Element is Xpath use cy.xpath instead of cy.get
const appendixK = ':contains("1915(c) Appendix K Amendment")';
//Element is Xpath use cy.xpath instead of cy.get
const amendment1915b4 =
  ':contains("1915(b)(4) FFS Selective Contracting Waiver Amendment")';
const comprehensiveWaiverAmendment =
  ':contains("1915(b) Comprehensive (Capitated) Waiver Amendment")';
//Element is Xpath use cy.xpath instead of cy.get
const renewalWaiver1915b4 =
  ':contains("1915(b)(4) FFS Selective Contracting Renewal Waiver")';
const comprehensiveRenewalWaiver =':contains("1915(b) Comprehensive (Capitated) Renewal Waiver")';
const cardLink = "[data-testid='card-inner-wrapper']";

export class oneMacSubmissionTypePage {
  clickStatePlanAmendmentSPA() {
    cy.xpath(statePlanAmendmentSPA).click();
  }
  verifyNewInitialWaiverPage() {
    cy.url().should("include", "/initial/create");
  }
  verifyNewWaiverRenewalPage() {
    cy.url().should("include", "/renewal/create");
  }
  verifyNewWaiverAmendmentPage() {
    cy.url().should("include", "/amendment/create");
  }
  verifyNewAppendixKPage() {
    cy.url().should("include", "/waiver/app-k");
  }
  clickwaiverAction() {
    cy.xpath(waiverAction).click();
  }
  click1915bWaiverActions() {
    cy.xpath(waiverActions1915b).click();
  }
  clickFssSelectiveAuthority() {
    cy.get(cardLink).filter(ffsSelectiveAuthority).click();
  }
  clickMedicaidSPA() {
    cy.get(cardLink).filter(medicaidSPA).click();
  }
  clickChipSPA() {
    cy.get(cardLink).filter(chipSPA).click();
  }
  clickWaiverActionUnderWaiverAction() {
    cy.xpath(waiverActionWaiverAction).click();
  }
  clickRequestTemporaryExtension() {
    cy.xpath(RequestTemporaryExtension).click();
  }
  clickAppendixKAmendment() {
    cy.xpath(AppendixKAmendment).click();
  }
  clickRespondToMedicaidSPARAI() {
    cy.xpath(respondToMedicaidSPARAI).click();
  }
  clickInitialWaiver() {
    cy.get(cardLink).filter(initialWaiver1915b4).click();
  }
  click1915b4WaiverRenewal() {
    cy.get(cardLink).filter(renewalWaiver1915b4).click();
  }
  clickWaiverAmendment1915b4() {
    cy.get(cardLink).filter(amendment1915b4).click();
  }
  clickComprehensiveWaiverAmendmentWaiverAmendment() {
    cy.get(cardLink).filter(comprehensiveWaiverAmendment).click();
  }
  verifyFFSNewInitialWaiverIsClickable() {
    cy.get(cardLink)
      .filter(initialWaiver1915b4)
      .should("have.attr", "href", "/initial-waiver-b-4");
  }
  verifyAppendixKIsClickable() {
    cy.get(cardLink)
      .filter(appendixK)
      .parent("a").should("have.attr", "href");
  }
  verify1915b4WaiverRenewalIsClickable() {
    cy.get(cardLink)
      .filter(renewalWaiver1915b4)
      .should("have.attr", "href", "/waiver-renewal-b-4");
  }
  verifyCompreheniveCapitatedRenewalWaiverIsClickable() {
    cy.get(cardLink)
      .filter(comprehensiveRenewalWaiver)
      .should("have.attr", "href", "/waiver-renewal-b-other");
  }
  verifyFFSWaiverAmendmentIsClickable() {
    cy.get(cardLink)
      .filter(amendment1915b4)
      .should("have.attr", "href", "/waiver-amendment-b-4");
  }
  verifyComprehensiveWaiverAmendmentIsClickable() {
    cy.get(cardLink)
      .filter(comprehensiveWaiverAmendment)
      .should("have.attr", "href", "/waiver-amendment-b-other");
  }
  verifyChipSPAIsClickable() {
    cy.get(cardLink)
      .filter(chipSPA)
      .should("have.attr", "href", "/choices/spa/chip");
  }
  verifyMedicaidSPAIsClickable() {
    cy.get(cardLink)
      .filter(medicaidSPA)
      .should("have.attr", "href", "/choices/spa/medicaid");
  }
  clickMedicaidEligibility() {
    cy.get(cardLink).filter(medicaidEligibility).click();
  }
  verifyAllOtherMedicaidIsClickable() {
    cy.get(cardLink)
      .filter(allOtherMedicaid)
      .should("have.attr", "href", "/medicaid-spa");
  }
  clickAllOtherMedicaid() {
    cy.get(cardLink).filter(allOtherMedicaid).click();
  }
  verifyChipEligibilityIsClickable() {
    cy.get(cardLink)
      .filter(chipEligibility)
      .should("have.attr", "href", "/chip-eligibility");
  }
  clickChipEligibility() {
    cy.get(cardLink).filter(chipEligibility).click();
  }
  verifyAllOtherChip() {
    cy.get(cardLink)
      .filter(allOtherChip)
      .should("have.attr", "href", "/chip-spa");
  }
  clickAllOtherChip() {
    cy.get(cardLink).filter(allOtherChip).click();
  }
  verifyChoiceGoesTo(choiceText, destinationUrl) {
    cy.get(cardLink)
      .filter(`:contains("${choiceText}")`)
      .parents("a")
      .should("have.attr", "href").and('contain', destinationUrl);
  }
  clickChoice(choiceText) {
    cy.get(cardLink).filter(`:contains("${choiceText}")`).click();
  }
}
export default oneMacSubmissionTypePage;
