//Element is Xpath use cy.xpath instead of cy.get
const statePlanAmendmentSPA = '//*[text()="State Plan Amendment (SPA)"]';
//Element is Xpath use cy.xpath instead of cy.get
const waiverAction =
  "//a[@href='/new-submission/waiver']//*[text()='Waiver Action']";
const waiverActions1915b =
  "//a[contains(@href,'waiver-b')]//*[text()='1915(b) Waiver Actions']";
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
  "//*[contains(text(),'1915(b)(4) FFS Selective Contracting Waivers')]";
const comprehensiveCapitatedWaiverAuthority =
  "//*[contains(text(),'1915(b) Comprehensive (Capitated) Waiver Authority')]";
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
const comprehensiveRenewalWaiver =
  ':contains("1915(b) Comprehensive (Capitated) Renewal Waiver")';
const cardLink = "//*[@data-testid='card-inner-wrapper']";

export class oneMacSubmissionTypePage {
  clickStatePlanAmendmentSPA() {
    cy.xpath(statePlanAmendmentSPA).click();
  }
  verifyNewInitialWaiverPage() {
    cy.url().should("include", "/initial-waiver");
  }
  verifyNewWaiverRenewalPage() {
    cy.url().should("include", "/waiver-renewal");
  }
  verifyNewWaiverAmendmentPage() {
    cy.url().should("include", "/waiver-amendment");
  }
  verifyNewAppendixKPage() {
    cy.url().should("include", "/appendix-k-amendment");
  }
  clickwaiverAction() {
    cy.xpath(waiverAction).click();
  }
  click1915bWaiverActions() {
    cy.xpath(waiverActions1915b).click();
  }
  clickFssSelectiveAuthority() {
    cy.xpath(ffsSelectiveAuthority).click();
  }
  click1915bComprehensiveCapitatedWaiverAuthority() {
    cy.xpath(comprehensiveCapitatedWaiverAuthority).click();
  }
  clickMedicaidSPA() {
    cy.xpath(cardLink).filter(medicaidSPA).click();
  }
  clickChipSPA() {
    cy.xpath(cardLink).filter(chipSPA).click();
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
    cy.xpath(cardLink).filter(initialWaiver1915b4).click();
  }
  clickComprehensiveInitialWaiver() {
    cy.xpath(cardLink).filter(comprehensiveInitialWaiver).click();
  }
  click1915b4WaiverRenewal() {
    cy.xpath(cardLink).filter(renewalWaiver1915b4).click();
  }
  clickComprehensiveRenewalWaiver() {
    cy.xpath(cardLink).filter(comprehensiveRenewalWaiver).click();
  }
  clickWaiverAmendment1915b4() {
    cy.xpath(cardLink).filter(amendment1915b4).click();
  }
  clickComprehensiveWaiverAmendmentWaiverAmendment() {
    cy.xpath(cardLink).filter(comprehensiveWaiverAmendment).click();
  }
  verifyFFSNewInitialWaiverIsClickable() {
    cy.xpath(cardLink)
      .filter(initialWaiver1915b4)
      .should("have.attr", "href", "/initial-waiver-b-4");
  }
  verifyComprehensiveNewInitialWaiverIsClickable() {
    cy.xpath(cardLink)
      .filter(comprehensiveInitialWaiver)
      .should("have.attr", "href", "/initial-waiver-b-other");
  }
  verifyAppendixKIsClickable() {
    cy.xpath(cardLink)
      .filter(appendixK)
      .should("have.attr", "href", "/appendix-k-amendment");
  }
  verify1915b4WaiverRenewalIsClickable() {
    cy.xpath(cardLink)
      .filter(renewalWaiver1915b4)
      .should("have.attr", "href", "/waiver-renewal-b-4");
  }
  verifyCompreheniveCapitatedRenewalWaiverIsClickable() {
    cy.xpath(cardLink)
      .filter(comprehensiveRenewalWaiver)
      .should("have.attr", "href", "/waiver-renewal-b-other");
  }
  verifyFFSWaiverAmendmentIsClickable() {
    cy.xpath(cardLink)
      .filter(amendment1915b4)
      .should("have.attr", "href", "/waiver-amendment-b-4");
  }
  verifyComprehensiveWaiverAmendmentIsClickable() {
    cy.xpath(cardLink)
      .filter(comprehensiveWaiverAmendment)
      .should("have.attr", "href", "/waiver-amendment-b-other");
  }
  verifyChipSPAIsClickable() {
    cy.xpath(cardLink)
      .filter(chipSPA)
      .should("have.attr", "href", "/choices/spa/chip");
  }
  verifyMedicaidSPAIsClickable() {
    cy.xpath(cardLink)
      .filter(medicaidSPA)
      .should("have.attr", "href", "/choices/spa/medicaid");
  }
  verifyMedicaidEligibilityIsClickable() {
    cy.xpath(cardLink)
      .filter(medicaidEligibility)
      .should("have.attr", "href", "/medicaid-eligibility");
  }
  clickMedicaidEligibility() {
    cy.xpath(cardLink).filter(medicaidEligibility).click();
  }
  verifyMedicaidAlternativeIsClickable() {
    cy.xpath(cardLink)
      .filter(medicaidAlternative)
      .should("have.attr", "href", "/medicaid-abp");
  }
  clickMedicaidAlternative() {
    cy.xpath(cardLink).filter(medicaidAlternative).click();
  }
  verifyAllOtherMedicaidIsClickable() {
    cy.xpath(cardLink)
      .filter(allOtherMedicaid)
      .should("have.attr", "href", "/medicaid-spa");
  }
  clickAllOtherMedicaid() {
    cy.xpath(cardLink).filter(allOtherMedicaid).click();
  }
  verifyChipEligibilityIsClickable() {
    cy.xpath(cardLink)
      .filter(chipEligibility)
      .should("have.attr", "href", "/chip-eligibility");
  }
  clickChipEligibility() {
    cy.xpath(cardLink).filter(chipEligibility).click();
  }
  verifyAllOtherChip() {
    cy.xpath(cardLink)
      .filter(allOtherChip)
      .should("have.attr", "href", "/chip-spa");
  }
  clickAllOtherChip() {
    cy.xpath(cardLink).filter(allOtherChip).click();
  }
}
export default oneMacSubmissionTypePage;
