//Element is Xpath use cy.xpath instead of cy.get: All of the following are xpath
//overall headers and help desk section
const pageHeader = "//*[@id='title_bar']//h1";
const generalHeader = '//h2[contains(text(),"General")]';
const statePlanAmendmentSPAHeader =
  '//h2[contains(text(),"State Plan Amendments (SPAs)")]';
const waiversHeader = '//h2[contains(text(),"Waivers")]';
const oneMacHelpDeskContactInfoHeader = "#contact-card";
const phoneNumber =
  '//*[@id="contact-card"]//dt[contains(text(),"Phone Number")]';
const actualPhoneNumber =
  '//*[@id="contact-card"]//a[contains(text(),"(833) 228-2540")]';
const email = '//*[@id="contact-card"]//dt[contains(text(),"Email")]';
const actualEmail =
  "//*[@id='contact-card']//a[@href='mailto:OneMAC_Helpdesk@cms.hhs.gov']";
//General Section
const whatBrowsersHeaderBtn = "#browsers-button";
const whatBrowsersBody = "#browsers";
const WhatToDoConfirmationEmailHeaderBtn = "#confirm-email-button";
const WhatToDoConfirmationEmailBody = "#confirm-email";
const isThisOfficialHeaderBtn = "#is-official-button";
const isThisOfficialBody = "#is-official";
const whatAreTheOneMacUserRoles = "#onemac-roles-button";
//Element is Xpath use cy.xpath instead of cy.get
const whatAreTheOneMacUserRolesValueStateSubmitter =
  "//*[@id='onemac-roles']//td[text()='State Submitter']";
//Element is Xpath use cy.xpath instead of cy.get
const whatAreTheOneMacUserRolesValueStateSystemAdministrator =
  "//*[@id='onemac-roles']//tr[2]/td[text()='State System Administrator']";
//Element is Xpath use cy.xpath instead of cy.get
const whatAreTheOneMacUserRolesValueCMSRoleApprover =
  "//*[@id='onemac-roles']//tr[3]//td[text()='CMS Role Approver']";
//State Plan Amendment (SPA's) Section
const whatFormatIsUsedToEnterASPAID = "#spa-id-format-button";
const whatFormatIsUsedToEnterASPAIDValue = "#spa-id-format";
const whatAttachmentForMedicaidSPAHeaderBtn =
  "#medicaid-spa-attachments-button";
const whatAttachmentForMedicaidSPABody = "#medicaid-spa-attachments";
const whatAttachmentForRespToSPARAI = "#medicaid-spa-rai-attachments-button";
const whatAttachmentForRespToSPARAIValue = "#medicaid-spa-rai-attachments";
const whatAttachmentsForCHIPSPA = "#chip-spa-attachments-button";
const whatAttachmentsForCHIPSPAValue = "#chip-spa-attachments";
const whatAttachmentsForCHIPSPAResponseToRAI =
  "#chip-spa-rai-attachments-button";
const whatAttachmentsForCHIPSPAResponseToRAIValue = "#chip-spa-rai-attachments";
const canISubmitSPAFORPHEInOneMac = "#public-health-emergency-button";
const canISubmitSPAFORPHEInOneMacValue = "#public-health-emergency";
//Waiver section
const initialWaiverFormatHeaderBtn = "#initial-waiver-id-format-button";
const initialWaiverFormatBody = "#initial-waiver-id-format";
const waiverRenewalFormatHeaderBtn = "#waiver-renewal-id-format-button";
const waiverRenewalFormatBody = "#waiver-renewal-id-format";
const whatFormatIsUsedToEnterASPAIDforWaivers = "#waiver-id-format-button";
const whatFormatIsUsedToEnterASPAIDforWaiversValue = "#waiver-id-format";
const whoCanIContactToHelpMeFigureOutTheCorrect1915bWaiverNumber =
  "#waiver-id-help-button";
const whoCanIContactToHelpMeFigureOutTheCorrect1915bWaiverNumberValue =
  "#waiver-id-help";
const whatFormatIsUsedToEnter1915cwaiverNumber = "#waiver-c-id-button";
const whatFormatIsUsedToEnter1915cwaiverNumberValue = "#waiver-c-id";
const whatAttachmentsAreNeededToSubmitA1915bWaiverAction =
  "#waiverb-attachments-button";
const whatAttachmentsAreNeededToSubmitA1915bWaiverActionValue =
  "#waiverb-attachments";
const whatAreTheAttachmentsFor1915bResponsetoRAI =
  "#waiverb-rai-attachments-button";
const whatAreTheAttachmentsFor1915bResponsetoRAIValue =
  "#waiverb-rai-attachments";
const tempExtFormatHeaderBtn = "#waiver-extension-id-format-button";
const tempExtFormatBody = "#waiver-extension-id-format";
const whatAreTheAttachmentsFor1915bRequestTemprorayExtension =
  "#waiverb-extension-attachments-button";
const whatAreTheAttachmentsFor1915bRequestTemprorayExtensionValue =
  "#waiverb-extension-attachments";
const attachmentsFor1915cRequestTempExtHeaderBtn =
  "#waiverc-extension-attachments-button";
const attachmentsFor1915cRequestTempExtBody = "#waiverc-extension-attachments";
const canISubmitAppendixKAmendmentsInOneMac = "#appk-button";
const canISubmitAppendixKAmendmentsInOneMacValue = "#appk";
const whatAreTheAttachmentsForAppendixKWaiver = "#appk-attachments-button";
const whatAreTheAttachmentsForAppendixKWaiverValue = "#appk-attachments";
const onboardingMaterialsBtn = "#onboarding-materials-button";
const welcomeToOneMacLink =
  "//div[@id='onboarding-materials']//a[text() = 'Welcome to OneMAC']";
const idmInstructionsLink =
  "//div[@id='onboarding-materials']//a[text() = 'IDM Instructions for OneMAC Users']";
const idmGuideLink =
  "//div[@id='onboarding-materials']//a[text() = 'OneMAC IDM Guide']";
const stateSubmitterGuideLink =
  "//div[@id='onboarding-materials']//a[text() = 'OneMAC State User Guide']";
const stateAdminGuideLink =
  "//div[@id='onboarding-materials']//a[text() = 'OneMAC State Administrator Guide']";
const cmsUserGuideLink =
  "//div[@id='onboarding-materials']//a[text() = 'OneMAC CMS User Guide']";
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
    cy.get(oneMacHelpDeskContactInfoHeader)
      .should("be.visible")
      .and("contain", "OneMAC Help Desk Contact Info");
  }

  verifyVerifywhatBrowsersHeaderBtnlinkisdisplayedandclickit() {
    cy.get(whatBrowsersHeaderBtn).click();
  }

  verifytextcontainsThesubmissionportalworksbestonGoogleChrome() {
    cy.get(whatBrowsersBody)
      .should("be.visible")
      .find("p")
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
      .find("p")
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
      .find("p")
      .contains(
        "Yes, as long as you have the electronic receipt (confirmation email). Your submission is considered your official state submission and will only be considered received by CMS if you have received the electronic receipt. You should receive an email confirmation that the formal action was received along with information about the 90th day. If you do not receive a confirmation email for your SPA or waiver submissions, please contact your state lead or your state’s CMS lead for HCBS or managed care."
      );
  }
  VerifyWhataretheOneMACuserrolesisdisplayedandclickit() {
    cy.get(whatAreTheOneMacUserRoles).click();
  }
  VerifytextcontainsStateSubmitter() {
    cy.xpath(whatAreTheOneMacUserRolesValueStateSubmitter).should("be.visible");
  }
  VerifytextcontainsStateSystemAdministrator() {
    cy.xpath(whatAreTheOneMacUserRolesValueStateSystemAdministrator).should(
      "be.visible"
    );
  }
  VerifytextcontainsCMSRoleApprover() {
    cy.xpath(whatAreTheOneMacUserRolesValueCMSRoleApprover).should(
      "be.visible"
    );
  }
  VerifyWhatWhatformatisusedtoenteraSPAIDisdisplayedandclickit() {
    cy.get(whatFormatIsUsedToEnterASPAID).click();
  }

  VerifytextcontainsEntertheStatePlanAmendmenttransmittalnumberAssignconsecutivenumbersonacalendaryearbasis() {
    cy.get(whatFormatIsUsedToEnterASPAIDValue).should("be.visible");
  }
  VerifyWhataretheattachmentsforaMedicaidSPAisdisplayedandclickit() {
    cy.get(whatAttachmentForMedicaidSPAHeaderBtn).click();
  }

  VerifytextcontainsSPAsubmissionrequirementscanbefoundinregulation() {
    cy.get(whatAttachmentForMedicaidSPABody).should("be.visible");
  }

  VerifyWhataretheattachmentsforaMedicaidresponsetoRequestforAdditionalInformationRAIisdisplayedandclickit() {
    cy.get(whatAttachmentForRespToSPARAI).click();
  }
  Verifytextcontainsindicatesarequiredattachment() {
    cy.get(whatAttachmentForRespToSPARAIValue).should("be.visible");
  }

  VerifyWhataretheattachmentsforaCHIPSPAisdisplayedandclickit() {
    cy.get(whatAttachmentsForCHIPSPA).click();
  }
  VerifyWhataretheattachmentsforaCHIPSPAresponsetoRequestforAdditionalInformationRAIisdisplayedandclickit() {
    cy.get(whatAttachmentsForCHIPSPAResponseToRAI).click();
  }
  VerifyCanIsubmitSPAsrelatingtothePublicHealthEmergencyPHEinOneMACisdisplayedandclickit() {
    cy.get(canISubmitSPAFORPHEInOneMac).click();
  }
  VerifytextcontainsYesallPHErelatedSPAsshouldbesubmittedthroughOneMAC() {
    cy.get(canISubmitSPAFORPHEInOneMacValue)
      .should("be.visible")
      .find("p")
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
    cy.get(whoCanIContactToHelpMeFigureOutTheCorrect1915bWaiverNumber).click();
  }
  VerifytextcontainsEmailMCOGDMCOActionscmshhsgovtogetsupportwithdeterminingthecorrect1915bWaiverNumber() {
    cy.get(
      whoCanIContactToHelpMeFigureOutTheCorrect1915bWaiverNumberValue
    ).should("be.visible");
  }
  VerifyWhatformatisusedtoentera1915cwaivernumberisdisplayedandclickit() {
    cy.get(whatFormatIsUsedToEnter1915cwaiverNumber).click();
  }
  VerifytextcontainsWaivernumbermustfollowtheformatSStoinclude() {
    cy.get(whatFormatIsUsedToEnter1915cwaiverNumberValue).should("be.visible");
  }
  VerifyWhatattachmentsareneededtosubmita1915bwaiveractionisdisplayedandclickit() {
    cy.get(whatAttachmentsAreNeededToSubmitA1915bWaiverAction).click();
  }
  VerifytextcontainsTheregulationsat42CFR4302543155and42CFR441301() {
    cy.get(whatAttachmentsAreNeededToSubmitA1915bWaiverActionValue).should(
      "be.visible"
    );
  }
  VerifyWhataretheattachmentsfora1915bWaiverresponsetoRequestforAdditionalInformationRAIisdisplayedandclickit() {
    cy.get(whatAreTheAttachmentsFor1915bResponsetoRAI).click();
  }
  verifyTempExtFormatHeaderBtnExists() {
    cy.get(tempExtFormatHeaderBtn).should("be.visible");
  }
  clickTempExtFormatHeaderBtn() {
    cy.get(tempExtFormatHeaderBtn).click();
  }
  verifyTempExtFormatBody() {
    cy.get(tempExtFormatBody)
      .should("be.visible")
      .find("p")
      .contains(
        "Temporary extension numbers must follow the format SS-####.R##.TE## or SS-#####.R##.TE## to include:"
      );
  }
  VerifyWhataretheattachmentsfora1915bWaiverRequestforTemporaryExtensionisdisplayedandclickit() {
    cy.get(whatAreTheAttachmentsFor1915bRequestTemprorayExtension).click();
  }
  VerifyCanIsubmitAppendixKamendmentsinOneMACisdisplayedandclickit() {
    cy.get(canISubmitAppendixKAmendmentsInOneMac).click();
  }
  VerifytextcontainsYesyoucansubmitAppendixKamendments() {
    cy.get(canISubmitAppendixKAmendmentsInOneMacValue).should("be.visible");
  }
  VerifyWhataretheattachmentsfora1915cAppendixKWaiverisdisplayedandclickit() {
    cy.get(whatAreTheAttachmentsForAppendixKWaiver)
      .should("be.visible")
      .click();
  }
  VerifytextcontainsTheregulationsat42CFR4302543155and42CFR441301describethe() {
    cy.get(whatAreTheAttachmentsForAppendixKWaiverValue).should("be.visible");
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
    cy.get(onboardingMaterialsBtn).should("be.visible");
  }
  clickOnboardingMaterialsBtn() {
    cy.get(onboardingMaterialsBtn).click();
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
    cy.xpath(welcomeToOneMacLink)
      .invoke("attr", "href")
      .then((href) => {
        cy.request(href).its("status").should("eq", 200);
      });
  }
  verifyIdmInstructionsLinkIsValid() {
    cy.xpath(idmInstructionsLink)
      .invoke("attr", "href")
      .then((href) => {
        cy.request(href).its("status").should("eq", 200);
      });
  }
  verifyIdmGuideLinkIsValid() {
    cy.xpath(idmGuideLink)
      .invoke("attr", "href")
      .then((href) => {
        cy.request(href).its("status").should("eq", 200);
      });
  }
  verifyStateSubmitterGuideLinkIsValid() {
    cy.xpath(stateSubmitterGuideLink)
      .invoke("attr", "href")
      .then((href) => {
        cy.request(href).its("status").should("eq", 200);
      });
  }
  verifyCmsUserGuideLinkIsValid() {
    cy.xpath(cmsUserGuideLink)
      .invoke("attr", "href")
      .then((href) => {
        cy.request(href).its("status").should("eq", 200);
      });
  }
  verifyInitialWaiverFormatHeaderBtnExists() {
    cy.get(initialWaiverFormatHeaderBtn).should("be.visible");
  }
  clickInitialWaiverFormatHeaderBtn() {
    cy.get(initialWaiverFormatHeaderBtn).click();
  }
  verifyInitialWaiverFormatBody() {
    cy.get(initialWaiverFormatBody)
      .should("be.visible")
      .find("p")
      .contains(
        "1915(b) Initial Waiver numbers must follow the format SS-####.R00.00 or SS-#####.R00.00 to include:"
      );
  }
  verifyWaiverRenewalFormatHeaderBtnExists() {
    cy.get(waiverRenewalFormatHeaderBtn).should("be.visible");
  }
  clickWaiverRenewalFormatHeaderBtn() {
    cy.get(waiverRenewalFormatHeaderBtn).click();
  }
  verifyWaiverRenewalFormatBody() {
    cy.get(waiverRenewalFormatBody).should("be.visible");
  }
  verifyAttachmentsFor1915cRequestTempExtHeaderBtnExists() {
    cy.get(attachmentsFor1915cRequestTempExtHeaderBtn).should("be.visible");
  }
  clickAttachmentsFor1915cRequestTempExtHeaderBtn() {
    cy.get(attachmentsFor1915cRequestTempExtHeaderBtn).click();
  }
  verifyAttachmentsFor1915cRequestTempExtBody() {
    cy.get(attachmentsFor1915cRequestTempExtBody).should("be.visible");
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
