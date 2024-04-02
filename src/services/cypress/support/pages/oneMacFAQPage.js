//Element is Xpath use cy.xpath instead of cy.get: All of the following are xpath
//overall headers and help desk section
const pageHeader = "//h1";
const generalHeader = '//h2[contains(text(),"General")]';
const statePlanAmendmentSPAHeader =
  '//h2[contains(text(),"State Plan Amendments (SPAs)")]';
const waiversHeader = '//h2[contains(text(),"Waivers")]';
const oneMacHelpDeskContactInfoHeader = "//h3[text()='OneMAC Help Desk Contact Info']";
const phoneNumber =
  '//*[contains(text(),"Phone Number")]';
const actualPhoneNumber =
  '//a[contains(text(),"(833) 228-2540")]';
const email = '//*[contains(text(),"Email")]';
const actualEmail =
  "//a[@href='mailto:OneMAC_Helpdesk@cms.hhs.gov']";
//General Section
const whatBrowsersHeaderBtn = "//button[contains(text(),'What browsers can I use to access the system')]";
const whatBrowsersBody = "div[role='region']  p";
const WhatToDoConfirmationEmailHeaderBtn = "div#confirm-email  .flex.flex-1.font-medium.items-center.justify-between.py-4.transition-all";
const WhatToDoConfirmationEmailBody = "div:nth-of-type(3) > div[role='region']  p";
const isThisOfficialHeaderBtn = "div#is-official  .flex.flex-1.font-medium.items-center.justify-between.py-4.transition-all";
const isThisOfficialBody = "div:nth-of-type(4) > div[role='region']  p";
const whatAreTheOneMacUserRoles = "div#onemac-roles  .flex.flex-1.font-medium.items-center.justify-between.py-4.transition-all";
//Element is Xpath use cy.xpath instead of cy.get
const whatAreTheOneMacUserRolesTable =
  "//article[1]//*[@data-state='open']//table[1]";
//State Plan Amendment (SPA's) Section
const whatFormatIsUsedToEnterASPAID = "//button[contains(text(),'What format is used to enter a SPA ID')]";
const whatFormatIsUsedToEnterASPAIDValue = "//*[@id='radix-:rh:']";
const whatAttachmentForMedicaidSPAHeaderBtn =
  "//button[contains(text(),'What are the attachments for a Medicaid SPA')]";
const whatAttachmentForRespToSPARAI = "//button[contains(text(),'What are the attachments for a Medicaid response to Request for Additional Information')]";
const whatAttachmentsForCHIPSPA = "//button[contains(text(),'What are the attachments for a CHIP SPA?')]";
const whatAttachmentsForCHIPSPAResponseToRAI =
"//button[contains(text(),'What are the attachments for a CHIP SPA response to Request for Additional Information \(RAI\)')]";
const canISubmitSPAFORPHEInOneMac = "//button[contains(text(), 'Can I submit SPAs relating to the Public Health Emergency \(PHE\)')]";
//Waiver section
const initialWaiverFormatHeaderBtn = "//button[contains(text(),'What format is used to enter a 1915\(b\) Initial Waiver number')]";
const waiverRenewalFormatHeaderBtn = "//button[contains(text(),'What format is used to enter a 1915\(b\) Waiver Renewal number')]";
const whatFormatIsUsedToEnterASPAIDforWaivers = "#waiver-id-format-button";
const whatFormatIsUsedToEnterASPAIDforWaiversValue = "#waiver-id-format";
const whoCanIContactToHelpMeFigureOutTheCorrect1915bWaiverNumber =
  "//button[contains(text(),'Who can I contact to help me figure out the correct 1915\(b\) Waiver Number')]";
const whatFormatIsUsedToEnter1915cwaiverNumber = "//button[contains(text(),'What format is used to enter a 1915(c) waiver number')]";
const whatAttachmentsAreNeededToSubmitA1915bWaiverAction =
  "//button[contains(text(),'What attachments are needed to submit a 1915\(b\) waiver action')]";
const whatAreTheAttachmentsFor1915bResponsetoRAI =
"//button[contains(text(),'What are the attachments for a 1915\(b\) Waiver response to Request for Additional Information \(RAI\)')]";
const tempExtFormatHeaderBtn = "//button[contains(text(),'What format is used to enter a 1915\(b\) or 1915\(c\) Temporary Extension number')]";
const whatAreTheAttachmentsFor1915bRequestTemprorayExtension =
  "//button[contains(text(),'What are the attachments for a 1915(b) Waiver - Request for Temporary Extension')]";
const attachmentsFor1915cRequestTempExtHeaderBtn =
"//button[contains(text(),'What are the attachments for a 1915(c) Waiver - Request for Temporary Extension')]";
const canISubmitAppendixKAmendmentsInOneMac = "//button[contains(text(),'Can I submit Appendix K amendments in OneMAC')]";
const whatAreTheAttachmentsForAppendixKWaiver = "//button[contains(text(),'What are the attachments for a 1915(c) Appendix K Waiver?')]";
const onboardingMaterialsBtn = "//button[contains(text(),'Onboarding Materials')]";
const welcomeToOneMacLink =
  "//a[text() = 'Welcome to OneMAC']";
const idmInstructionsLink =
  "//a[text() = 'IDM Instructions for OneMAC Users']";
const idmGuideLink =
  "//a[text() = 'OneMAC IDM Guide']";
const stateSubmitterGuideLink =
  "//a[text() = 'OneMAC State User Guide']";
const cmsUserGuideLink =
  "//a[text() = 'OneMAC CMS User Guide']";
const expandAllBtn =
  "//button[contains(text(),'Expand all to search with CTRL+F')]";

export class oneMacFAQPage {
  verifyGeneralSectionExists() {
    cy.xpath(generalHeader).should("be.visible");
  }

  verifySPASectionExists() {
    cy.xpath(statePlanAmendmentSPAHeader).should("be.visible");
  }
  verifyWaiversExists() {
    cy.xpath(waiversHeader).should("be.visible");
  }
  verifyOneMacHelpDeskInfoExists() {
    cy.xpath(oneMacHelpDeskContactInfoHeader)
      .should("be.visible")
      .and("contain", "OneMAC Help Desk Contact Info");
  }

  verifyVerifywhatBrowsersHeaderBtnlinkisdisplayedandclickit() {
    cy.xpath(whatBrowsersHeaderBtn).click();
  }

  verifytextcontainsThesubmissionportalworksbestonGoogleChrome() {
    cy.get(whatBrowsersBody)
      .should("be.visible")
      .contains(
        "The submission portal works best on Google Chrome (Version 91.0.4472.77 or later), Firefox (Version 89.0 or later)."
      );
  }

  VerifyWhatshouldwedoifwedontreceiveaconfirmationemailisdisplayedandclickit() {
    cy.get(WhatToDoConfirmationEmailHeaderBtn).click();
  }

  VerifytextcontainsRefreshyourinboxcheckyourSPAMfiltersthencontacttheOneMACHelpDesk() {
    cy.get(WhatToDoConfirmationEmailBody)
      .should("be.visible")
      .contains(
        "Refresh your inbox, check your SPAM filters, then contact the OneMAC Help Desk"
      );
  }
  VerifyIsthisconsideredtheofficialstatesubmissionisdisplayedandclickit() {
    cy.get(isThisOfficialHeaderBtn).click();
  }

  VerifytextcontainsYesaslongasuouhavetheelectronicreceipt() {
    cy.get(isThisOfficialBody)
      .should("be.visible")
      .contains(
        "Yes, as long as you have the electronic receipt (confirmation email). Your submission is considered your official state submission and will only be considered received by CMS if you have received the electronic receipt. You should receive an email confirmation that the formal action was received along with information about the 90th day. If you do not receive a confirmation email for your SPA or waiver submissions, please contact your state lead or your state’s CMS lead for HCBS or managed care."
      );
  }
  VerifyWhataretheOneMACuserrolesisdisplayedandclickit() {
    cy.get(whatAreTheOneMacUserRoles).click();
  }
  VerifytextcontainsStateSubmitter() {
    cy.xpath(whatAreTheOneMacUserRolesTable).should("be.visible").and('contain.text', 'State Submitter');
  }
  VerifytextcontainsStateSystemAdministrator() {
    cy.xpath(whatAreTheOneMacUserRolesTable).should("be.visible").and('contain.text', 'State System Admin');
  }
  VerifytextcontainsCMSRoleApprover() {
    cy.xpath(whatAreTheOneMacUserRolesTable).should("be.visible").and('contain.text', 'CMS Role Approver');
  }
  VerifyWhatWhatformatisusedtoenteraSPAIDisdisplayedandclickit() {
    cy.xpath(whatFormatIsUsedToEnterASPAID).click();
  }

  VerifytextcontainsEntertheStatePlanAmendmenttransmittalnumberAssignconsecutivenumbersonacalendaryearbasis() {
    cy.xpath(whatFormatIsUsedToEnterASPAID).parent("h3").next("div").should("have.attr", "data-state", "open");
  }
  VerifyWhataretheattachmentsforaMedicaidSPAisdisplayedandclickit() {
    cy.xpath(whatAttachmentForMedicaidSPAHeaderBtn).click();
  }

  VerifytextcontainsSPAsubmissionrequirementscanbefoundinregulation() {
    cy.xpath(whatAttachmentForMedicaidSPAHeaderBtn).parent("h3").next("div").should("have.attr", "data-state", "open");
  }

  VerifyWhataretheattachmentsforaMedicaidresponsetoRequestforAdditionalInformationRAIisdisplayedandclickit() {
    cy.xpath(whatAttachmentForRespToSPARAI).click();
  }
  Verifytextcontainsindicatesarequiredattachment() {
    cy.xpath(whatAttachmentForRespToSPARAI).parent("h3").next("div").should("have.attr", "data-state", "open");
  }

  VerifyWhataretheattachmentsforaCHIPSPAisdisplayedandclickit() {
    cy.xpath(whatAttachmentsForCHIPSPA).click();
  }
  VerifyWhataretheattachmentsforaCHIPSPAresponsetoRequestforAdditionalInformationRAIisdisplayedandclickit() {
    cy.xpath(whatAttachmentsForCHIPSPAResponseToRAI).click();
  }
  VerifyCanIsubmitSPAsrelatingtothePublicHealthEmergencyPHEinOneMACisdisplayedandclickit() {
    cy.xpath(canISubmitSPAFORPHEInOneMac).click();
  }
  VerifytextcontainsYesallPHErelatedSPAsshouldbesubmittedthroughOneMAC() {
    cy.xpath(canISubmitSPAFORPHEInOneMac)
    .parent("h3").next("div").should("have.attr", "data-state", "open")
      .contains(
        "Yes, all PHE-related SPAs should be submitted through OneMAC by completing the Medicaid SPA form."
      );
  }

  VerifyWhatformatisusedtoentera1915bwaivernumberisdisplayedandclickit() {
    cy.get(whatFormatIsUsedToEnterASPAIDforWaivers).click();
  }
  VerifytextcontainsWaivernumbermustfollowtheformat() {
    cy.get(whatFormatIsUsedToEnterASPAIDforWaiversValue).should("be.visible");
  }
  VerifyWhocanIcontacttohelpmefigureoutthecorrect1915bWaiverNumberisdisplayedandclickit() {
    cy.xpath(whoCanIContactToHelpMeFigureOutTheCorrect1915bWaiverNumber).click();
  }
  VerifytextcontainsEmailMCOGDMCOActionscmshhsgovtogetsupportwithdeterminingthecorrect1915bWaiverNumber() {
    cy.xpath(
      whoCanIContactToHelpMeFigureOutTheCorrect1915bWaiverNumber
    ).parent("h3").next("div").should("have.attr", "data-state", "open");
  }
  VerifyWhatformatisusedtoentera1915cwaivernumberisdisplayedandclickit() {
    cy.xpath(whatFormatIsUsedToEnter1915cwaiverNumber).click();
  }
  VerifytextcontainsWaivernumbermustfollowtheformatSStoinclude() {
    cy.xpath(whatFormatIsUsedToEnter1915cwaiverNumber).parent("h3").next("div").should("have.attr", "data-state", "open");
  }
  VerifyWhatattachmentsareneededtosubmita1915bwaiveractionisdisplayedandclickit() {
    cy.xpath(whatAttachmentsAreNeededToSubmitA1915bWaiverAction).click();
  }
  VerifytextcontainsTheregulationsat42CFR4302543155and42CFR441301() {
    cy.xpath(whatAttachmentsAreNeededToSubmitA1915bWaiverAction).parent("h3").next("div").should("have.attr", "data-state", "open");
  }
  VerifyWhataretheattachmentsfora1915bWaiverresponsetoRequestforAdditionalInformationRAIisdisplayedandclickit() {
    cy.xpath(whatAreTheAttachmentsFor1915bResponsetoRAI).click();
  }
  verifyTempExtFormatHeaderBtnExists() {
    cy.xpath(tempExtFormatHeaderBtn).should("be.visible");
  }
  clickTempExtFormatHeaderBtn() {
    cy.xpath(tempExtFormatHeaderBtn).click();
  }
  verifyTempExtFormatBody() {
    cy.xpath(tempExtFormatHeaderBtn)
    .parent("h3").next("div").should("have.attr", "data-state", "open")
      .contains(
        "Temporary extension numbers must follow the format SS-####.R##.TE## or SS-#####.R##.TE## to include:"
      );
  }
  VerifyWhataretheattachmentsfora1915bWaiverRequestforTemporaryExtensionisdisplayedandclickit() {
    cy.xpath(whatAreTheAttachmentsFor1915bRequestTemprorayExtension).click();
  }
  VerifyCanIsubmitAppendixKamendmentsinOneMACisdisplayedandclickit() {
    cy.xpath(canISubmitAppendixKAmendmentsInOneMac).click();
  }
  VerifytextcontainsYesyoucansubmitAppendixKamendments() {
    cy.xpath(canISubmitAppendixKAmendmentsInOneMac).parent("h3").next("div").should("have.attr", "data-state", "open");
  }
  VerifyWhataretheattachmentsfora1915cAppendixKWaiverisdisplayedandclickit() {
    cy.xpath(whatAreTheAttachmentsForAppendixKWaiver)
      .should("be.visible")
      .click();
  }
  VerifytextcontainsTheregulationsat42CFR4302543155and42CFR441301describethe() {
    cy.xpath(whatAreTheAttachmentsForAppendixKWaiver).parent("h3").next("div").should("have.attr", "data-state", "open");
  }
  verifyPhoneNumberExists() {
    cy.xpath(phoneNumber).should("be.visible");
  }
  verifyActualphoneNumberExists() {
    cy.xpath(actualPhoneNumber).should("be.visible");
  }
  verifyEmailExists() {
    cy.xpath(email).should("be.visible");
  }
  verifyActualEmailExists() {
    cy.xpath(actualEmail).should("be.visible");
  }
  VerifyPageTitleIs(s) {
    cy.xpath(pageHeader).should("be.visible").contains(s);
  }
  verifyOnboardingMaterialsBtnExists() {
    cy.xpath(onboardingMaterialsBtn).should("be.visible");
  }
  clickOnboardingMaterialsBtn() {
    cy.xpath(onboardingMaterialsBtn).click();
  }
  verifyWelcomeToOneMacLinkExists() {
    cy.xpath(welcomeToOneMacLink).should("be.visible");
  }
  verifyIdmInstructionsLinkExists() {
    cy.xpath(idmInstructionsLink).should("be.visible");
  }
  verifyIdmGuideLinkExists() {
    cy.xpath(idmGuideLink).should("be.visible");
  }
  verifyStateSubmitterGuideLinkExists() {
    cy.xpath(stateSubmitterGuideLink).should("be.visible");
  }
  verifyCmsUserGuideLinkExists() {
    cy.xpath(cmsUserGuideLink).should("be.visible");
  }
  verifyWelcomeToOneMacLinkIsValid() {
    cy.xpath(welcomeToOneMacLink).invoke('removeAttr', 'target')
  }
  verifyIdmInstructionsLinkIsValid() {
    cy.xpath(idmInstructionsLink).invoke('removeAttr', 'target')
  }
  verifyIdmGuideLinkIsValid() {
    cy.xpath(idmGuideLink).invoke('removeAttr', 'target')
  }
  verifyStateSubmitterGuideLinkIsValid() {
    cy.xpath(stateSubmitterGuideLink).invoke('removeAttr', 'target');
  }
  verifyCmsUserGuideLinkIsValid() {
    cy.xpath(cmsUserGuideLink).invoke('removeAttr', 'target');
  }
  verifyInitialWaiverFormatHeaderBtnExists() {
    cy.xpath(initialWaiverFormatHeaderBtn).should("be.visible");
  }
  clickInitialWaiverFormatHeaderBtn() {
    cy.xpath(initialWaiverFormatHeaderBtn).click();
  }
  verifyInitialWaiverFormatBody() {
    cy.xpath(initialWaiverFormatHeaderBtn)
    .parent("h3").next("div").should("have.attr", "data-state", "open")
      .contains(
        "1915(b) Initial Waiver numbers must follow the format SS-####.R00.00 or SS-#####.R00.00 to include:"
      );
  }
  verifyWaiverRenewalFormatHeaderBtnExists() {
    cy.xpath(waiverRenewalFormatHeaderBtn).should("be.visible");
  }
  clickWaiverRenewalFormatHeaderBtn() {
    cy.xpath(waiverRenewalFormatHeaderBtn).click();
  }
  verifyWaiverRenewalFormatBody() {
    cy.xpath(waiverRenewalFormatHeaderBtn).parent("h3").next("div").should("have.attr", "data-state", "open");
  }
  verifyAttachmentsFor1915cRequestTempExtHeaderBtnExists() {
    cy.xpath(attachmentsFor1915cRequestTempExtHeaderBtn).should("be.visible");
  }
  clickAttachmentsFor1915cRequestTempExtHeaderBtn() {
    cy.xpath(attachmentsFor1915cRequestTempExtHeaderBtn).click();
  }
  verifyAttachmentsFor1915cRequestTempExtBody() {
    cy.xpath(attachmentsFor1915cRequestTempExtHeaderBtn).parent("h3").next("div").should("have.attr", "data-state", "open");
  }
  verifyExpandAllBtnExists() {
    cy.xpath(expandAllBtn).should("be.visible");
  }
  clickExpandAllBtn() {
    cy.xpath(expandAllBtn).click();
  }
  verifyAllSectionsAreCollapsed() {
    cy.get("button.accordion-button")
      .should("have.attr", "aria-expanded", "false")
      .and("have.length.greaterThan", 20);
  }
  verifyAllSectionsAreExpanded() {
    cy.get("button.accordion-button")
      .should("have.attr", "aria-expanded", "true")
      .and("have.length.greaterThan", 20);
  }
}
export default oneMacFAQPage;
