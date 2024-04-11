const medicaidTopRaiRespCaret = "#medicaidsparai0_caret-button";
const medicaidTopRaiRespDownloadBtn = "#dl_medicaidsparai0";
const chipTopRaiRespCaret = "#chipsparai0_caret-button";
const chipTopRaiRespDownloadBtn = "#dl_chipsparai0";
const appKTopRaiRespCaret = "#waiverappkrai0_caret-button";
const appKTopRaiRespDownloadBtn = "#dl_waiverappkrai0";

//Elements are Xpath use cy.xpath instead of cy.xpath
const detailsPage = "//section[@id='package_overview']";
const statusHeader = "//h2[contains(text(),'Status')]";
const packageActionsHeader = "//h2[text()='Package Actions']";
const respondToRAIAction = "//a/*[text()='Respond to Formal RAI']";
const withdrawPackageAction = "//a/li[text()='Withdraw Package']";
const requestTempExtensionPackageAction =
  "//a/*[text()='Request Temporary Extension']";
const addAmendmentPackageAction = "//a/*[text()='Add Amendment']";
const withdrawFormalRAIResponseAction =
  "//a/*[text()='Withdraw Formal RAI Response']";
const enableRAIResponseWithdrawAction =
  "//a/*[text()='Enable Formal RAI Response Withdraw']";
const detailSection =
  "#package_details";
const disableRAIResponseWithdrawAction =
  "//a/*[text()='Disable Formal RAI Response Withdraw']";
const authorityHeader = "//h3[contains(text(),'Authority')]";
const parentWaiverNumberHeader =
  "//h3[contains(text(),'Approved Initial or Renewal Number')]";
const stateHeader = "//h3[text()='State']";
const initialSubmittedDateHeader = "//h3[text()='Initial Submission Date']";
const raiResponsesHeader = "//section//h2[text()='Formal RAI Responses']";
const proposedEffectiveDateHeader =
  "//h3[contains(text(),'Proposed Effective Date')]";
const finalDispositionDateHeader =
  "//h3[contains(text(),'Final Disposition Date')]";
const approvedEffectiveDateHeader =
  "//h3[contains(text(),'Approved Effective Date')]";
const formalRAIReceivedDateHeader =
  "//h3[contains(text(),'Formal RAI Received')]";
const adminPkgChangeSection = "#package-activities";
const additionalInfoSection =
  "//section[contains(@id, 'addl-info-chrono')]//h2[text()='Additional Information']";
const waiverAuthorityHeader = "//h3[text()='Waiver Authority']";
const attachmentsSection = "//h2[text()='Supporting Documentation']";
const amendmentTitleHeader = "//h3[text()='Amendment Title']";
const amendmentNumberHeader = "//h3[text()='Amendment Number']";
const withdrawBtn = "//a[contains(@href, '/withdraw-package')]";
const subjectHeader = "//h3[contains(text(),'Subject')]";
const descriptionHeader = "//h3[contains(text(),'Description')]";
const cPOCNameHeader = "//h3[contains(text(),'CPOC')]";
const reviewTeamSRTHeader = "//h3[contains(text(),'Review Team (SRT)')]";
const initialSubmissionCaretBtn =
  '//h3//button//*[contains(text(),"Initial package")]';
const downloadAllBtn = "//button[contains(text(),'Download all documents')]";
const withdrawalRequestedCaretBtn =
  '//h3//button[contains(@id,"Package0_caret-button")]';
//this is to parse dates like 02/12/2024
const dateRegex = /[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}/;
const issueRAIBtn = "//a/*[text()= 'Issue Formal RAI']";

export class oneMacPackageDetailsPage {
  verifyPackageDetailsPageIsVisible() {
    cy.xpath(detailsPage).should("be.visible");
  }
  verifyStatusIs(status) {
    cy.xpath(statusHeader).next().contains(status);
  }
  verify2ndClockIsVisible() {
    cy.xpath(statusHeader).next().contains("2nd Clock");
  }
  verify2ndClockIsNotVisible() {
    cy.xpath(statusHeader).next().should("not.have", "2nd Clock");
  }
  verifyPackageActionsHeaderIsVisible() {
    cy.xpath(packageActionsHeader).should("be.visible");
  }
  verifyNoPackageActionsAvailable() {
    cy.xpath(packageActionsHeader)
      .next("div")
      .contains("No actions are currently available for this submission");
  }
  verifyRespondtoRAIActionExists() {
    cy.xpath(respondToRAIAction).scrollIntoView().should("be.visible");
  }
  verifyWithdrawPackageActionExists() {
    cy.xpath(withdrawPackageAction).scrollIntoView().should("be.visible");
  }
  verifyRequestTempExtensionPackageActionExists() {
    cy.xpath(requestTempExtensionPackageAction)
      .scrollIntoView()
      .should("be.visible");
  }
  clickRequestTempExtensionPackageAction() {
    cy.xpath(requestTempExtensionPackageAction).click();
  }
  verifyAddAmendmentActionExists() {
    cy.xpath(addAmendmentPackageAction).scrollIntoView().should("be.visible");
  }
  clickAddAmendmentPackageAction() {
    cy.xpath(addAmendmentPackageAction).click();
  }
  verifyWithdrawFormalRAIResponseActionExists() {
    cy.xpath(withdrawFormalRAIResponseAction)
      .scrollIntoView()
      .should("be.visible");
  }
  clickWithdrawFormalRAIResponseAction() {
    cy.xpath(withdrawFormalRAIResponseAction).click();
  }
  verifyEnableRAIResponseWithdrawActionExists() {
    cy.xpath(enableRAIResponseWithdrawAction)
      .scrollIntoView()
      .should("be.visible");
  }
  clickEnableRAIResponseWithdrawAction() {
    cy.xpath(enableRAIResponseWithdrawAction).click();
  }
  clickRespondToRAIAction() {
    cy.xpath(respondToRAIAction).click();
  }
  verifyDisableRAIResponseWithdrawActionExists() {
    cy.xpath(disableRAIResponseWithdrawAction)
      .scrollIntoView()
      .should("be.visible");
  }
  verifyDetailSectionExists() {
    cy.get(detailSection).should("be.visible");
  }
  verifyTitleContains(s) {
    cy.get(detailSection).find("h2").first().contains(s);
  }
  verifyAuthorityHeaderExists() {
    cy.xpath(authorityHeader).should("be.visible");
  }
  verifyAuthorityIs(s) {
    cy.xpath(authorityHeader).parent().contains(s);
  }
  verifyParentWaiverNumberHeaderExists() {
    cy.xpath(parentWaiverNumberHeader).should("be.visible");
  }
  verifyParentWaiverNumber(s) {
    cy.xpath(parentWaiverNumberHeader).next().contains(s);
  }
  verifyStateHeaderExists() {
    cy.xpath(stateHeader).should("be.visible");
  }
  verifyStateExists() {
    cy.xpath(stateHeader).parent().contains(/[A-Z]{2}/);
  }
  verifyInitialSubmittedDateHeaderExists() {
    cy.xpath(initialSubmittedDateHeader).should("be.visible");
  }
  verifyDateExists() {
    cy.xpath(initialSubmittedDateHeader).parent().contains(dateRegex);
  }
  verifyRaiResponseHeaderDoesNotExist() {
    cy.xpath(raiResponsesHeader).should("not.exist");
  }
  verifyRaiResponseHeaderTitle() {
    cy.xpath(raiResponsesHeader).scrollIntoView().should("be.visible");
  }
  verifyCHIPTopRaiRespCaretExistsAndEnabled() {
    cy.get(chipTopRaiRespCaret).scrollIntoView().should("be.visible");
    cy.get(chipTopRaiRespCaret).should("be.enabled");
  }
  verifyMedicaidTopRaiRespCaretExistsAndEnabled() {
    cy.get(medicaidTopRaiRespCaret).scrollIntoView().should("be.visible");
    cy.get(medicaidTopRaiRespCaret).should("be.enabled");
  }
  verifyAppKTopRaiRespCaretExistsAndEnabled() {
    cy.get(appKTopRaiRespCaret).scrollIntoView().should("be.visible");
    cy.get(appKTopRaiRespCaret).should("be.enabled");
  }
  verifyCHIPTopRaiRespDownloadBtnExistsAndEnabled() {
    cy.get(chipTopRaiRespDownloadBtn).scrollIntoView().should("be.visible");
    cy.get(chipTopRaiRespDownloadBtn).should("be.enabled");
  }
  verifyMedicaidTopRaiRespDownloadBtnExistsAndEnabled() {
    cy.get(medicaidTopRaiRespDownloadBtn).scrollIntoView().should("be.visible");
    cy.get(medicaidTopRaiRespDownloadBtn).should("be.enabled");
  }
  verifyAppKTopRaiRespDownloadBtnxistsAndEnabled() {
    cy.get(appKTopRaiRespDownloadBtn).scrollIntoView().should("be.visible");
    cy.get(appKTopRaiRespDownloadBtn).should("be.enabled");
  }
  verifyProposedEffectiveDateHeaderExists() {
    cy.xpath(proposedEffectiveDateHeader).should("be.visible");
  }
  verifyproposedEffectiveDateHeaderContainsDate() {
    cy.xpath(proposedEffectiveDateHeader).parent().contains(dateRegex);
  }
  verifyFinalDispositionDateHeaderExists() {
    cy.xpath(finalDispositionDateHeader).should("be.visible");
  }
  verifyFinalDispositionDateHeaderDoesNotExists() {
    cy.xpath(finalDispositionDateHeader).should("not.exist");
  }
  verifyApprovedEffectiveDateHeaderExists() {
    cy.xpath(approvedEffectiveDateHeader).should("be.visible");
  }
  verifyApprovedEffectiveDateHeaderDoesNotExists() {
    cy.xpath(approvedEffectiveDateHeader).should("not.exist");
  }
  verifyFormalRAIReceivedDateHeaderExists() {
    cy.xpath(formalRAIReceivedDateHeader).should("be.visible");
  }
  verifyFormalRAIReceivedDateHeaderContainsDate() {
    cy.xpath(formalRAIReceivedDateHeader).parent().contains(dateRegex);
  }
  verifyAmendmentNumbermatches(anumber) {
    cy.xpath(amendmentNumberHeader).next().contains(anumber);
  }
  verifyAmendmentTitleHeaderExists() {
    cy.xpath(amendmentTitleHeader).should("be.visible");
  }
  verifyAmendmentTitleExists() {
    cy.xpath(amendmentTitleHeader).next().should("be.visible");
  }
  verifyAmendmentTitleIs(s) {
    cy.xpath(amendmentTitleHeader).next().contains(s);
  }
  verifyWaiverAuthorityHeaderExists() {
    cy.xpath(waiverAuthorityHeader).should("be.visible");
  }
  verifyWaiverAuthorityHeaderis1915cHCBS() {
    cy.xpath(waiverAuthorityHeader).next().contains("1915(c) HCBS");
  }
  verifyAttachmentsSectionExists() {
    cy.xpath(attachmentsSection).should("be.visible");
  }
  verifyAdditionalInfoSectionExists() {
    cy.xpath(additionalInfoSection).should("be.visible");
  }
  verifyAdministrativePackageChangesSectionExists() {
    cy.get(adminPkgChangeSection).should("be.visible");
  }
  clickWithdrawBtn() {
    cy.xpath(withdrawBtn).click();
  }
  verifySubjectHeaderExists() {
    cy.xpath(subjectHeader).should("be.visible");
  }
  verifySubjectValueExists() {
    cy.xpath(subjectHeader)
      .parent("div")
      .contains(/^(?!\s*$).+/);
  }
  verifySubjectDoesNotExists() {
    cy.xpath(subjectHeader).should("not.exist");
  }
  verifyDescrptionHeaderExists() {
    cy.xpath(descriptionHeader).should("be.visible");
  }
  verifyDescriptionValueExists() {
    cy.xpath(descriptionHeader)
      .parent("div")
      .contains(/^(?!\s*$).+/);
  }
  verifyDescrptionDoesNotExists() {
    cy.xpath(descriptionHeader).should("not.exist");
  }
  verifyCPOCNameHeaderExists() {
    cy.xpath(cPOCNameHeader).should("be.visible");
  }
  verifyCPOCNameValueExists() {
    cy.xpath(cPOCNameHeader)
      .parent("div")
      .contains(/^(?!\s*$).+/);
  }
  verifyCPOCNameDoesNotExist() {
    cy.xpath(cPOCNameHeader).should("not.exist");
  }
  verifyReviewTeamSRTHeaderExists() {
    cy.xpath(reviewTeamSRTHeader).should("be.visible");
  }
  verifyReviewTeamSRTValueExists() {
    cy.xpath(reviewTeamSRTHeader)
      .parent("div")
      .contains(/^(?!\s*$).+/);
  }
  verifyReviewTeamSRTDoesNotExists() {
    cy.xpath(reviewTeamSRTHeader).should("not.exist");
  }
  verifyInitialSubmissionCaretBtnExists() {
    cy.xpath(initialSubmissionCaretBtn).should("be.visible");
  }
  clickInitialSubmissionCaretBtn() {
    cy.xpath(initialSubmissionCaretBtn).click();
  }
  expandInitialSubmissionCaretBtn() {
    cy.xpath(initialSubmissionCaretBtn)
      .invoke("attr", "aria-expanded")
      .then(($isExpanded) => {
        if ($isExpanded === "false") {
          //only click to expand
          cy.xpath(initialSubmissionCaretBtn).click();
        }
      });
  }
  verifyDownloadAllBtnExists() {
    cy.xpath(downloadAllBtn).should("be.visible");
  }
  verifyWithdrawalRequestedCaretBtnExists() {
    cy.xpath(withdrawalRequestedCaretBtn).should("be.visible");
  }
  clickWithdrawalRequestedCaretBtn() {
    cy.xpath(withdrawalRequestedCaretBtn).click();
  }
  expandWithdrawalRequestedCaretBtn() {
    cy.xpath(withdrawalRequestedCaretBtn)
      .invoke("attr", "aria-expanded")
      .then(($isExpanded) => {
        if ($isExpanded === "false") {
          //only click to expand
          cy.xpath(withdrawalRequestedCaretBtn).click();
        }
      });
  }
  verifyTheSubStatus() {
    cy.xpath(statusHeader).next().contains("Withdraw Formal RAI Response Enabled");
  }
  clickIssueRAIBtn() {
    cy.xpath(issueRAIBtn).click({ force: true });
  }
}
export default oneMacPackageDetailsPage;
