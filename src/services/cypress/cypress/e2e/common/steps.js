import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import oneMacDashboardPage from "../../../support/pages/oneMacDashboardPage";
import oneMacDevLoginPage from "../../../support/pages/oneMacDevLoginPage";
import oneMacHomePage from "../../../support/pages/oneMacHomePage";
import oneMacFormPage from "../../../support/pages/oneMacFormPage";
import oneMacSubmissionTypePage from "../../../support/pages/oneMacSubmissionTypePage";
import oneMacUserManagmentPage from "../../../support/pages/oneMacUserManagmentPage";
import oneMacMyProfilePage from "../../../support/pages/oneMacMyProfilePage";
import oneMacFAQPage from "../../../support/pages/oneMacFAQPage";
import oneMacPackageDetailsPage from "../../../support/pages/oneMacPackageDetailsPage";
import utilities from "../../../support/utilities/utilities";

const OneMacDashboardPage = new oneMacDashboardPage();
const OneMacDevLoginPage = new oneMacDevLoginPage();
const OneMacHomePage = new oneMacHomePage();
const OneMacFormPage = new oneMacFormPage();
const OneMacSubmissionTypePage = new oneMacSubmissionTypePage();
const OneMacUserManagmentPage = new oneMacUserManagmentPage();
const OneMacMyProfilePage = new oneMacMyProfilePage();
const OneMacFAQPage = new oneMacFAQPage();
const OneMacPackageDetailsPage = new oneMacPackageDetailsPage();
const util = new utilities();



Given("I am on Login Page", () => {
  OneMacHomePage.launch();
});
Then("Verify I am on the login page and not logged in", () => {
  OneMacHomePage.verifyUserIsNotLoggedInOnLoginPage();
});

When("clicking the Sign In Button", () => {
  OneMacHomePage.clicksignInBtn();
  cy.wait(500);
});
When("Clicking on FAQ Tab", () => {
  OneMacHomePage.clickFAQPage();
});
When("Login with {string} {string} user", (status, userRole) => {
  const realStatus = status.replace("a ", "").replace("an ", "");
  OneMacDevLoginPage.loginAs(userRole, realStatus);
  cy.wait(500);
});
Then("click on New Submission", () => {
  OneMacDashboardPage.clickNewSubmission();
});
Then("click the main Dashboard Button", () => {
  OneMacDashboardPage.clickDashboardBtn();
});
Then(
  "verify {string} choice goes to {string}",
  (choiceText, destinationUrl) => {
    OneMacSubmissionTypePage.verifyChoiceGoesTo(choiceText, destinationUrl);
  }
);
Then("click on {string} choice", (choiceText) => {
  OneMacSubmissionTypePage.clickChoice(choiceText);
});
Then("Click on State Plan Amendment SPA", () => {
  OneMacSubmissionTypePage.clickStatePlanAmendmentSPA();
});
Then("click on Medicaid SPA", () => {
  OneMacSubmissionTypePage.clickMedicaidSPA();
});
Then("Click on Submit Button", () => {
  OneMacFormPage.clicksubmitBTN();
});
Then("Click the Submit Button without waiting", () => {
  OneMacFormPage.clicksubmitBTNWithoutWait();
});
Then("verify the modal pop-up is visible", () => {
  OneMacFormPage.verifyModalContainerExists();
});
Then("verify the modal pop-up is not visible", () => {
  OneMacFormPage.verifyModalContainerDoesNotExists();
});
Then(
  "verify the title of the modal pop-up is Do you want to submit your official formal RAI response",
  () => {
    OneMacFormPage.verifyModalTitleIs(
      "Do you want to submit your official formal RAI response"
    );
  }
);
Then(
  "verify the detailed text in the modal contains you are submitting your official formal RAI Response to restart the SPA review process and a new 90th day will be identified",
  () => {
    OneMacFormPage.verifyModalTextIs(
      "you are submitting your official formal RAI Response to restart the SPA review process and a new 90th day will be identified."
    );
  }
);
Then(
  "verify the detailed text in the modal contains you are submitting your official formal RAI Response to start the 90 day clock review process",
  () => {
    OneMacFormPage.verifyModalTextIs(
      "you are submitting your official formal RAI Response to start the 90 day clock review process"
    );
  }
);

Then("verify form cancel button exists", () => {
  OneMacFormPage.verifyCancelBtnExists();
});
Then("click form cancel button", () => {
  OneMacFormPage.clickCancelBtn();
});
Then("click modal cancel button", () => {
  OneMacFormPage.clickModalCancelBtn();
});
Then("click Yes leave form button", () => {
  OneMacFormPage.clickButtonLabelled("Yes, leave form");
});
Then("click Return to form", () => {
  OneMacFormPage.clickReturnToFormBtn();
});
Then("verify the success message is {string}", (s) => {
  OneMacDashboardPage.verifySuccessMessageIs(s);
});
Then("verify package submitted message in the alert bar", () => {
  OneMacDashboardPage.verifyAlertMessageIs("Package submitted");
});
Then("verify the message in the alert bar is {string}", (s) => {
  OneMacDashboardPage.verifyAlertMessageIs(s);
});
Then("verify submission successful message in the alert bar", () => {
  OneMacDashboardPage.verifySuccessMessage1IsDisplayed();
});

Then("i am on User Management Page", () => {
  OneMacUserManagmentPage.verifyWeAreOnUserManagmentPage();
});
Then("Click on My Account", () => {
  OneMacUserManagmentPage.clickMyAccountDropDown();
});
Then("Click on Manage Profile", () => {
  OneMacUserManagmentPage.clickmanageProfileBTN();
});
When("I am on My Profile Page", () => {
  OneMacMyProfilePage.verifyWeAreOnMyProfilePage();
});
Then("verify My Information Header is Displayed", () => {
  OneMacMyProfilePage.verifyProfileInformationIsDisplayed();
});
Then("Full Name text is Displayed", () => {
  OneMacMyProfilePage.verifyFullNameHeader();
});
Then("Actual Full Name is Displayed", () => {
  OneMacMyProfilePage.verifyFullName();
});
Then("Role text is Displayed", () => {
  OneMacMyProfilePage.verifyRoleHeader();
});
Then("Actual Role is Displayed", () => {
  OneMacMyProfilePage.verifyRole();
});
Then("Email text is Displayed", () => {
  OneMacMyProfilePage.verifyEmailHeader();
});
Then("Actual Email is Displayed", () => {
  OneMacMyProfilePage.verifyEmail();
});
Then("Phone Number text is Displayed", () => {
  OneMacMyProfilePage.verifyPhoneNumberHeader();
});
Then("Phone Number Add Button is Displayed", () => {
  OneMacMyProfilePage.verifyPhoneNumberAddBTN();
});
Then("Status text is Displayed", () => {
  OneMacMyProfilePage.verifyStatusHeader();
});
Then("Status text is not displayed", () => {
  OneMacMyProfilePage.verifyStatusHeaderDoesNotExist();
});
Then("Actual Status is Displayed with Access Granted", () => {
  OneMacMyProfilePage.verifyAccessStatus();
});
Then("Click on User Management Tab", () => {
  OneMacDashboardPage.clickUserManagementTab();
});
Then("i am on Dashboard Page", () => {
  OneMacDashboardPage.verifyWeAreOnDashboardPage();
});
Then("verify Export to Excel CSV is Displayed", () => {
  OneMacDashboardPage.verifyexportToEXcelCSVBTNIsDisplayed();
});
Then("verify User Management is Displayed", () => {
  OneMacUserManagmentPage.verifyUserManagmentHeaderIsDisplayed();
});
Then("verify Name is Displayed", () => {
  OneMacUserManagmentPage.verifyNameHeaderIsDisplayed();
});
Then("verify State is Displayed", () => {
  OneMacUserManagmentPage.verifyStateHeaderIsDisplayed();
});
Then("verify Status is Displayed", () => {
  OneMacUserManagmentPage.verifyStatusHeaderIsDisplayed();
});
Then("verify Role is Displayed", () => {
  OneMacUserManagmentPage.verifyRoleHeaderIsDisplayed();
});
Then("verify Last Modified is Displayed", () => {
  OneMacUserManagmentPage.verifyLastModifiedHeaderIsDisplayed();
});
Then("verify Modified By is Displayed", () => {
  OneMacUserManagmentPage.verifyModifiedByHeaderIsDisplayed();
});
//this is for oy2 9990
Then("verify Home tab is Displayed", () => {
  OneMacUserManagmentPage.verifyHomeTabIsDisplayed();
});
Then("dashboard tab is Displayed", () => {
  OneMacUserManagmentPage.verifyDashboardTabIsDisplayed();
});
Then("FAQ tab is Displayed", () => {
  OneMacUserManagmentPage.verifyFAQTabIsDisplayed();
});
Then("verify Actions is Displayed", () => {
  OneMacUserManagmentPage.verifyActionsHeaderIsDisplayed();
});
//this is for oy2_9990 state submitter
Then("verify New Submission BTN is Displayed", () => {
  OneMacDashboardPage.verifyNewSubmissionBTNIsDisplayed();
});

//this is for OY2_3900
Then("verify {string} has no error messages", (whichLabel) => {
  OneMacFormPage.verifyErrorMessagesAreNotThere(whichLabel);
});
Then("click on CHIP SPA", () => {
  OneMacSubmissionTypePage.clickChipSPA();
});

Then("clear the ID Input box", () => {
  OneMacFormPage.clearIDInputBox();
});
Then("type {string} into the ID Input box", (newID) => {
  OneMacFormPage.inputID(newID);
});
Then("into {string} type {string}", (whereTo, newValue) => {
  OneMacFormPage.inputInto(whereTo, newValue);
});
Then("clear {string} input field", (whereTo) => {
  OneMacFormPage.clearInput(whereTo);
});

Then("verify ID error message is not present", () => {
  OneMacFormPage.verifyIDErrorMessageIsNotDisplayed();
});
Then("verify the ID error message is {string}", (chkErrorMessage) => {
  OneMacFormPage.verifyIDErrorMessageContains(chkErrorMessage);
});
//
Then(
  "verify the {string} error message is {string}",
  (whichLabel, chkErrorMessage) => {
    OneMacFormPage.verifyErrorMessageContains(whichLabel, "1", chkErrorMessage);
  }
);
Then(
  "verify the form error message is {string}",
  (chkErrorMessage) => {
    OneMacFormPage.verifyFormErrorMessageContains(chkErrorMessage);
  }
);
Then(
  "verify the {string} error message line 2 is {string}",
  (whichLabel, chkErrorMessage) => {
    OneMacFormPage.verifyErrorMessageContains(whichLabel, "2", chkErrorMessage);
  }
);
Then(
  "verify the ID error message has a second line with {string}",
  (chkErrorMessage) => {
    OneMacFormPage.verifyIDErrorMessage2Contains(chkErrorMessage);
  }
);
Then("clear the Parent ID Input box", () => {
  OneMacFormPage.clearParentIDInputBox();
});
Then("type {string} into the Parent ID Input box", (newID) => {
  OneMacFormPage.inputParentID(newID);
});
Then("verify Parent ID error message is not present", () => {
  OneMacFormPage.verifyParentIDErrorMessageIsNotDisplayed();
});
Then("verify the Parent ID error message is {string}", (chkErrorMessage) => {
  OneMacFormPage.verifyParentIDErrorMessageContains(chkErrorMessage);
});

Then("Click on Waiver Action", () => {
  OneMacSubmissionTypePage.clickwaiverAction();
});
Then("click on 1915b Waiver Actions", () => {
  OneMacSubmissionTypePage.click1915bWaiverActions();
});
Then("click on 1915b 4 FFS Selective Contracting waivers", () => {
  OneMacSubmissionTypePage.clickFssSelectiveAuthority();
});
Then("click on 1915b 4 FFS Selective Contracting New Initial Waiver", () => {
  OneMacSubmissionTypePage.clickInitialWaiver();
});
Then("1915b 4 FFS Selective Contracting Renewal Waiver", () => {
  OneMacSubmissionTypePage.click1915b4WaiverRenewal();
});
Then("click on 1915b 4 FFS Selective Contracting Waiver Amendment", () => {
  OneMacSubmissionTypePage.clickWaiverAmendment1915b4();
});
Then("click on 1915b Comprehensive Capitated Waiver Amendment", () => {
  OneMacSubmissionTypePage.clickComprehensiveWaiverAmendmentWaiverAmendment();
});

Then(
  "verify 1915b 4 FFS Selective Contracting New Initial Waiver is a clickable option",
  () => {
    OneMacSubmissionTypePage.verifyFFSNewInitialWaiverIsClickable();
  }
);
Then("verify Appendix K is a clickable option", () => {
  OneMacSubmissionTypePage.verifyAppendixKIsClickable();
});
Then("verify 1915b 4 Renewal Waiver is a clickable option", () => {
  OneMacSubmissionTypePage.verify1915b4WaiverRenewalIsClickable();
});
Then(
  "verify 1915b Comprehensive Capitated Renewal Waiver is a clickable option",
  () => {
    OneMacSubmissionTypePage.verifyCompreheniveCapitatedRenewalWaiverIsClickable();
  }
);
Then(
  "verify 1915b 4 FFS Selective Contracting Waiver Amendment is a clickable option",
  () => {
    OneMacSubmissionTypePage.verifyFFSWaiverAmendmentIsClickable();
  }
);
Then(
  "verify 1915b Comprehensive Capitated Waiver Amendment is a clickable option",
  () => {
    OneMacSubmissionTypePage.verifyComprehensiveWaiverAmendmentIsClickable();
  }
);
Then(
  "click Medicaid Alternative Benefits Plans ABP, and Medicaid Premiums and Cost Sharing",
  () => {
    OneMacSubmissionTypePage.clickMedicaidAlternative();
  }
);
Then("verify All Other Medicaid SPA Submissions is a clickable option", () => {
  OneMacSubmissionTypePage.verifyAllOtherMedicaidIsClickable();
});
Then("click All Other Medicaid SPA Submissions", () => {
  OneMacSubmissionTypePage.clickAllOtherMedicaid();
});
Then("verify CHIP Eligibility is a clickable option", () => {
  OneMacSubmissionTypePage.verifyChipEligibilityIsClickable();
});
Then("click CHIP Eligibility", () => {
  OneMacSubmissionTypePage.clickChipEligibility();
});
Then("verify All Other CHIP SPA Submissions is a clickable option", () => {
  OneMacSubmissionTypePage.verifyAllOtherChip();
});
Then("click All Other CHIP SPA Submissions", () => {
  OneMacSubmissionTypePage.clickAllOtherChip();
});

Then("Click on Request Temporary Extension in Package dashboard", () => {
  OneMacSubmissionTypePage.clickRequestTemporaryExtension();
});

Then("Click on Appendix K Amendment", () => {
  OneMacSubmissionTypePage.clickAppendixKAmendment();
});

Then("verify Waiver Authority contains {string}", (whatAuthority) => {
  OneMacFormPage.verifyWaiverAuthorityContains(whatAuthority);
});

Then(
  "Remove file for 1915b Comprehensive Capitated Waiver Application Pre-print",
  () => {
    OneMacFormPage.removeFirstAttachment(1);
  }
);
Then(
  "Remove file for 1915b Comprehensive Capitated Waiver Cost Effectiveness Spreadsheets",
  () => {
    OneMacFormPage.removeFirstAttachment(2);
  }
);
Then("search for Initial Waiver Number 1 with 12 Characters", () => {
  cy.fixture("packageDashboardWaiverNumbers.json").then((data) => {
    OneMacDashboardPage.searchFor(data.newInitialWaiverNumber1);
  });
  cy.wait(1000);
});
Then("search for Initial Waiver Number 3 with 12 Characters", () => {
  cy.fixture("packageDashboardWaiverNumbers.json").then((data) => {
    OneMacDashboardPage.searchFor(data.newInitialWaiverNumber3);
  });
  cy.wait(1000);
});
Then("search for approved Initial Waiver Number 1", () => {
  cy.fixture("packageDashboardWaiverNumbers.json").then((data) => {
    OneMacDashboardPage.searchFor(data.approvedInitialWaiverNum1);
  });
  cy.wait(1000);
});
Then("search for Initial Waiver Number 2 with 12 Characters", () => {
  cy.fixture("packageDashboardWaiverNumbers.json").then((data) => {
    OneMacDashboardPage.searchFor(data.newInitialWaiverNumber2);
  });
  cy.wait(1000);
});
Then("search for Medicaid SPA ID", () => {
  cy.fixture("packageDashboardSPAIDs.json").then((data) => {
    OneMacDashboardPage.searchFor(data.newMedicaidSPAID1);
  });
  cy.wait(1000);
});
Then("search for CHIP SPA ID", () => {
  cy.fixture("packageDashboardSPAIDs.json").then((data) => {
    OneMacDashboardPage.searchFor(data.newChipSPAID1);
  });
  cy.wait(1000);
});
Then(
  "verify id number in the first row matches Initial Waiver Number 1",
  () => {
    cy.fixture("packageDashboardWaiverNumbers.json").then((data) => {
      OneMacDashboardPage.verifyIDNumberInFirstRowIs(
        data.newInitialWaiverNumber1
      );
    });
  }
);
Then(
  "verify id number in the first row matches Initial Waiver Number 3",
  () => {
    cy.fixture("packageDashboardWaiverNumbers.json").then((data) => {
      OneMacDashboardPage.verifyIDNumberInFirstRowIs(
        data.newInitialWaiverNumber3
      );
    });
  }
);
Then("verify id number in the first row matches Medicaid SPA ID", () => {
  cy.fixture("packageDashboardSPAIDs.json").then((data) => {
    OneMacDashboardPage.verifyIDNumberInFirstRowIs(data.newMedicaidSPAID1);
  });
});
Then("verify id number in the first row matches CHIP SPA ID", () => {
  cy.fixture("packageDashboardSPAIDs.json").then((data) => {
    OneMacDashboardPage.verifyIDNumberInFirstRowIs(data.newChipSPAID1);
  });
});

Then(
  "verify that value of the column for the ID is NA Pending or a date",
  () => {
    OneMacDashboardPage.verifyValue();
  }
);

Then("navigate to {string}", (s) => {
  OneMacDashboardPage.navigatetoURL(s);
});
Then(
  "verify Expiration Date column is available to the immediate left to the status column",
  () => {
    OneMacDashboardPage.verifyexpirationDateColumnHeaderExists();
  }
);
Then(
  "attach {string} file to attachment {int}",
  (fileName, attachmentIndex) => {
    OneMacFormPage.uploadAttachment(fileName, attachmentIndex);
  }
);

Then("Verify General Section Exists", () => {
  OneMacFAQPage.verifyGeneralSectionExists();
});

Then(
  "Verify What browsers can I use to access the system link is displayed and click it",
  () => {
    OneMacFAQPage.verifyVerifywhatBrowsersHeaderBtnlinkisdisplayedandclickit();
  }
);

Then(
  "Verify text contains The submission portal works best on Google Chrome",
  () => {
    OneMacFAQPage.verifytextcontainsThesubmissionportalworksbestonGoogleChrome();
  }
);

Then(
  "Verify What should we do if we don’t receive a confirmation email is displayed and click it",
  () => {
    OneMacFAQPage.VerifyWhatshouldwedoifwedontreceiveaconfirmationemailisdisplayedandclickit();
  }
);

Then(
  "Verify text contains Refresh your inbox, check your SPAM filters, then contact the OneMAC Help Desk",
  () => {
    OneMacFAQPage.VerifytextcontainsRefreshyourinboxcheckyourSPAMfiltersthencontacttheOneMACHelpDesk();
  }
);

Then(
  "Verify Is this considered the official state submission is displayed and click it",
  () => {
    OneMacFAQPage.VerifyIsthisconsideredtheofficialstatesubmissionisdisplayedandclickit();
  }
);
Then(
  "Verify text contains Yes as long as you have the electronic receipt confirmation email Your submission is considered your official state submission",
  () => {
    OneMacFAQPage.VerifytextcontainsYesaslongasuouhavetheelectronicreceipt();
  }
);
Then("Verify What are the OneMAC user roles is displayed and click it", () => {
  OneMacFAQPage.VerifyWhataretheOneMACuserrolesisdisplayedandclickit();
});
Then("Verify text contains State Submitter", () => {
  OneMacFAQPage.VerifytextcontainsStateSubmitter();
});
Then("Verify text contains State System Administrator", () => {
  OneMacFAQPage.VerifytextcontainsStateSystemAdministrator();
});
Then("Verify text contains CMS Role Approver", () => {
  OneMacFAQPage.VerifytextcontainsCMSRoleApprover();
});
Then("Verify State Plan Amendments SPAs Section Exists", () => {
  OneMacFAQPage.verifySPASectionExists();
});
Then(
  "Verify What format is used to enter a SPA ID is displayed and click it",
  () => {
    OneMacFAQPage.VerifyWhatWhatformatisusedtoenteraSPAIDisdisplayedandclickit();
  }
);
Then(
  "Verify text contains Enter the State Plan Amendment transmittal number Assign consecutive numbers on a calendar year basis",
  () => {
    OneMacFAQPage.VerifytextcontainsEntertheStatePlanAmendmenttransmittalnumberAssignconsecutivenumbersonacalendaryearbasis();
  }
);
Then(
  "Verify What are the attachments for a Medicaid SPA is displayed and click it",
  () => {
    OneMacFAQPage.VerifyWhataretheattachmentsforaMedicaidSPAisdisplayedandclickit();
  }
);
Then(
  "Verify text contains SPA submission requirements can be found in regulation",
  () => {
    OneMacFAQPage.VerifytextcontainsSPAsubmissionrequirementscanbefoundinregulation();
  }
);
Then(
  "Verify What are the attachments for a Medicaid response to Request for Additional Information RAI is displayed and click it",
  () => {
    OneMacFAQPage.VerifyWhataretheattachmentsforaMedicaidresponsetoRequestforAdditionalInformationRAIisdisplayedandclickit();
  }
);
Then('Verify text contains "indicates a required attachment"', () => {
  OneMacFAQPage.VerifyWhatWhatformatisusedtoenteraSPAIDisdisplayedandclickit();
});
Then(
  "Verify What are the attachments for a CHIP SPA is displayed and click it",
  () => {
    OneMacFAQPage.VerifyWhataretheattachmentsforaCHIPSPAisdisplayedandclickit();
  }
);
Then(
  "Verify What are the attachments for a CHIP SPA response to Request for Additional Information RAI is displayed and click it",
  () => {
    OneMacFAQPage.VerifyWhataretheattachmentsforaCHIPSPAresponsetoRequestforAdditionalInformationRAIisdisplayedandclickit();
  }
);
Then(
  "Verify Can I submit SPAs relating to the Public Health Emergency PHE in OneMAC is displayed and click it",
  () => {
    OneMacFAQPage.VerifyCanIsubmitSPAsrelatingtothePublicHealthEmergencyPHEinOneMACisdisplayedandclickit();
  }
);

Then(
  'Verify text contains "Yes, all PHE-related SPAs should be submitted through OneMAC"',
  () => {
    OneMacFAQPage.VerifytextcontainsYesallPHErelatedSPAsshouldbesubmittedthroughOneMAC();
  }
);
Then("Verify Waivers Section Exists", () => {
  OneMacFAQPage.verifyWaiversExists();
});

Then(
  "Verify What format is used to enter a 1915b waiver number is displayed and click it",
  () => {
    OneMacFAQPage.VerifyWhatformatisusedtoentera1915bwaivernumberisdisplayedandclickit();
  }
);

Then('Verify text contains "Waiver number must follow the format"', () => {
  OneMacFAQPage.VerifytextcontainsWaivernumbermustfollowtheformat();
});

Then(
  "Verify Who can I contact to help me figure out the correct 1915b Waiver Number is displayed and click it",
  () => {
    OneMacFAQPage.VerifyWhocanIcontacttohelpmefigureoutthecorrect1915bWaiverNumberisdisplayedandclickit();
  }
);
Then(
  'Verify text contains "Email MCOGDMCOActions@cms.hhs.gov to get support with determining the correct 1915b Waiver Number"',
  () => {
    OneMacFAQPage.VerifytextcontainsEmailMCOGDMCOActionscmshhsgovtogetsupportwithdeterminingthecorrect1915bWaiverNumber();
  }
);
Then(
  "Verify What format is used to enter a 1915c waiver number is displayed and click it",
  () => {
    OneMacFAQPage.VerifyWhatformatisusedtoentera1915cwaivernumberisdisplayedandclickit();
  }
);
Then(
  'Verify text contains "Waiver number must follow the format SS.####.R##.## or SS.#####.R##.## to include"',
  () => {
    OneMacFAQPage.VerifytextcontainsWaivernumbermustfollowtheformatSStoinclude();
  }
);
Then(
  "Verify What attachments are needed to submit a 1915b waiver action is displayed and click it",
  () => {
    OneMacFAQPage.VerifyWhatattachmentsareneededtosubmita1915bwaiveractionisdisplayedandclickit();
  }
);
Then(
  'Verify text contains "The regulations at 42 C.F.R. §430.25, 431.55 and 42 C.F.R. §441.301"',
  () => {
    OneMacFAQPage.VerifytextcontainsTheregulationsat42CFR4302543155and42CFR441301();
  }
);
Then(
  "Verify What are the attachments for a 1915b Waiver response to Request for Additional Information RAI is displayed and click it",
  () => {
    OneMacFAQPage.VerifyWhataretheattachmentsfora1915bWaiverresponsetoRequestforAdditionalInformationRAIisdisplayedandclickit();
  }
);
Then(
  "Verify What are the attachments for a 1915b Waiver Request for Temporary Extension is displayed and click it",
  () => {
    OneMacFAQPage.VerifyWhataretheattachmentsfora1915bWaiverRequestforTemporaryExtensionisdisplayedandclickit();
  }
);
Then(
  "Verify Can I submit Appendix K amendments in OneMAC is displayed and click it",
  () => {
    OneMacFAQPage.VerifyCanIsubmitAppendixKamendmentsinOneMACisdisplayedandclickit();
  }
);
Then('Verify text contains "Yes, you can submit Appendix K amendments"', () => {
  OneMacFAQPage.VerifytextcontainsYesyoucansubmitAppendixKamendments();
});
Then(
  "Verify What are the attachments for a 1915c Appendix K Waiver is displayed and click it",
  () => {
    OneMacFAQPage.VerifyWhataretheattachmentsfora1915cAppendixKWaiverisdisplayedandclickit();
  }
);
Then(
  'Verify text contains "The regulations at 42 C.F.R. §430.25, 431.55 and 42 C.F.R. §441.301 describe the"',
  () => {
    OneMacFAQPage.VerifytextcontainsTheregulationsat42CFR4302543155and42CFR441301describethe();
  }
);
Then("Verify OneMAC Help Desk Contact Info Section Exists", () => {
  OneMacFAQPage.verifyOneMacHelpDeskInfoExists();
});
Then("Verify Phone Number Exists", () => {
  OneMacFAQPage.verifyPhoneNumberExists();
});
Then("Verify actual Phone Number Exists", () => {
  OneMacFAQPage.verifyActualphoneNumberExists();
});
Then("verify Contact Email label Exists", () => {
  OneMacFAQPage.verifyEmailExists();
});
Then("verify actual Contact Email address Exists", () => {
  OneMacFAQPage.verifyActualEmailExists();
});
Then("Verify page title is {string}", (s) => {
  OneMacFAQPage.VerifyPageTitleIs(s);
});
Then("click link labelled {string}", (linkLabel) => {
  OneMacFormPage.clickLinkWithLabel(linkLabel);
});

Then("Home tab exists", () => {
  OneMacHomePage.verifyHomePageLinkExists();
});

Then("FAQ tab exists", () => {
  OneMacHomePage.verifyFAQLinkExists();
});

Then("Register exists", () => {
  OneMacHomePage.verifyRegisterLinkExists();
});

Then("Login Exists", () => {
  OneMacHomePage.verifyloginBTNExists();
});

Then("welcome message exists", () => {
  OneMacHomePage.verifywelcomeMSGExists();
});

Then("state users section exists", () => {
  OneMacHomePage.verifystateUsersSectionExists();
});

Then("cms users section exists", () => {
  OneMacHomePage.verifycmsUsersSectionExists();
});

Then("do you have questions or need support exists", () => {
  OneMacHomePage.verifydoYouHaveQuestionsOrNeedSupportExists();
});

Then("View FAQ exists", () => {
  OneMacHomePage.verifyviewFAQExists();
});

Then("How to create a submission exists", () => {
  OneMacHomePage.verifyhowToCreateASubmissionExists();
});

Then("Login with IDM Exists", () => {
  OneMacHomePage.verifyloginWithIDMExists();
});

Then("Login with IDM Info Exists", () => {
  OneMacHomePage.verifyloginWithIDMInfoExists();
});

Then("attach your documents Exists", () => {
  OneMacHomePage.verifyAttachYourDocumentsExists();
});

Then("attach your documents info Exists", () => {
  OneMacHomePage.verifyAttachYourDocumentsInfoExists();
});

Then("Receive an email confirmation Exists", () => {
  OneMacHomePage.verifyreceiveAnEmailConformationExists();
});

Then("Receive an email confirmation details Exists", () => {
  OneMacHomePage.verifyreceiveAnEmailConformationInfoExists();
});

Then("Submission Types include Exists", () => {
  OneMacHomePage.verifysubmissionTypesIncludeExists();
});

Then(
  "Amendments to your Medicaid and CHIP State Plans not submitted through MACPro MMDL or WMS Exists",
  () => {
    OneMacHomePage.verifyfirstBulletExists();
  }
);

Then(
  "Official state responses to formal requests for additional information RAIs for SPAs not submitted through MACPro Exists",
  () => {
    OneMacHomePage.verifySecondBulletExists();
  }
);

Then(
  "Section 1915b waiver submissions those not submitted through WMS Exists",
  () => {
    OneMacHomePage.verifyThirdBulletExists();
  }
);

Then(
  "Section 1915c Appendix K amendments which cannot be submitted through WMS Exists",
  () => {
    OneMacHomePage.verifyForthBulletExists();
  }
);

Then(
  "Official state responses to formal requests for additional information RAIs for Section 1915b waiver actions in addition to submitting waiver changes in WMS if applicable Exists",
  () => {
    OneMacHomePage.verifyFifthBulletExists();
  }
);

Then("Receive an email for submission notification exists", () => {
  OneMacHomePage.verifyReceiveAnEmailForSubmissionNotificationExists();
});
Then("Receive an email for submission notification information exists", () => {
  OneMacHomePage.verifyReceiveAnEmailForSubmissionNotificationInfoExists();
});
Then("Login with EUA exists", () => {
  OneMacHomePage.verifyloginWithEUAExists();
});
Then("Login with EUA information exists", () => {
  OneMacHomePage.verifyloginWithEUAInfoExists();
});
Then("Review your assigned submission exists", () => {
  OneMacHomePage.verifyReviewYourAssignedSubmissionExists();
});
Then("Review your assigned submission information exists", () => {
  OneMacHomePage.verifyReviewYourAssignedSubmissionInfoExists();
});
Then("Amendments to your Medicaid and CHIP State Plans exists", () => {
  OneMacHomePage.verifyCMSBullet1Exists();
});
Then(
  "Official state responses to formal requests for additional information RAIs for SPAs exists",
  () => {
    OneMacHomePage.verifyCMSBullet2Exists();
  }
);
Then("Section 1915b waiver submissions exists", () => {
  OneMacHomePage.verifyCMSBullet3Exists();
});
Then("Section 1915c Appendix K amendments exists", () => {
  OneMacHomePage.verifyCMSBullet4Exists();
});
Then(
  "Official state responses to formal requests for additional information RAIs for Section 1915b waiver actions exists",
  () => {
    OneMacHomePage.verifyCMSBullet5Exists();
  }
);
Then(
  "State requests for Temporary Extensions for section 1915b and 1915c waivers exists",
  () => {
    OneMacHomePage.verifyCMSBullet6Exists();
  }
);
Then("verify Error message displayed should be No Results Found", () => {
  OneMacDashboardPage.noResultsFoundErrorMessage();
});
Then("verify user exists with id number searched", () => {
  cy.fixture("packageDashboardWaiverNumbers.json").then((data) => {
    OneMacDashboardPage.verifyIDNumberExists(data.newInitialWaiverNumber2);
  });
});
Then("clear search bar", () => {
  OneMacDashboardPage.clearSearchBar();
});
Then("verify search bar exists", () => {
  OneMacDashboardPage.verifySearchBarExists();
});
Then(
  "verify Search by Package ID, CPOC Name, or Submitter Name is displayed on top of search bar",
  () => {
    OneMacDashboardPage.verifySearchisDisplayed();
  }
);
Then("verify x in search bar exists to clear search and click it", () => {
  OneMacDashboardPage.verifyxexistsandClickIt();
});
Then("verify x in search bar exists to clear", () => {
  OneMacDashboardPage.verifyXExists();
});
Then("verify Error message details is displayed", () => {
  OneMacDashboardPage.verifyErrorMessageDetails();
});
Then("type in search bar an ID that does not exist in search bar", () => {
  OneMacDashboardPage.searchFor("ZZ-00-0000");
});
Then("verify State column exists", () => {
  OneMacDashboardPage.verifyStateColumnExists();
});
Then("Verify State Column is sortable", () => {
  OneMacDashboardPage.verifyStateColumnIsSortable();
});
Then("Verify Filter button exists", () => {
  OneMacDashboardPage.verifyfilterButtonExists();
});
Then("Click on Filter Button", () => {
  OneMacDashboardPage.clickOnfilterButton();
});
Then("Click on the close Filter Button", () => {
  OneMacDashboardPage.clickOnCloseFilterBtn();
});
Then("verify Filters header Exists", () => {
  OneMacDashboardPage.verifyfilterByExists();
});
Then("verify the filter close button exists", () => {
  OneMacDashboardPage.verifycloseButtonExists();
});
Then("verify authority dropdown filter exists", () => {
  OneMacDashboardPage.verifyAuthorityDropDownExists();
});
Then("verify reset Exists", () => {
  OneMacDashboardPage.verifyresetButtonExists();
});
Then("click on Type", () => {
  OneMacDashboardPage.clickTypeDropDown();
});
Then("click on Authority", () => {
  OneMacDashboardPage.clickAuthorityDropDown();
});
Then("click on Action Type", () => {
  OneMacDashboardPage.clickActionTypeDropDown();
});
Then("verify the 1915b type filter exists", () => {
  OneMacDashboardPage.verify1915bTypeFilterExists();
});
Then("verify the 1915c type filter exists", () => {
  OneMacDashboardPage.verify1915cTypeFilterExists();
});
Then("verify the Initial type action filter exists", () => {
  OneMacDashboardPage.verifyInitialWaiverFilterExists();
});
Then("verify 1915b Intial Waiver exists in list", () => {
  OneMacDashboardPage.verifyInitialWaiverInListExists();
});
Then("verify the Renewal type action filter exists", () => {
  OneMacDashboardPage.verifyWaiverRenewalFilterCheckBoxExists();
});
Then("verify the Amendment type action filter exists", () => {
  OneMacDashboardPage.verifyWaiverAmendmentFilterCheckBox();
});
Then("verify 1915c Appendix K Amendment check box exists", () => {
  OneMacDashboardPage.verify1915cAppendixKAmendmentCheckBox();
});
Then("verify 1915b Temporary Extension exists", () => {
  OneMacDashboardPage.verify1915bTemporaryExtensionCheckBoxExists();
});
Then("verify 1915c Temporary Extension exists", () => {
  OneMacDashboardPage.verify1915cTemporaryExtensionCheckBoxExists();
});
Then("verify CHIP SPA Exists", () => {
  OneMacDashboardPage.verifyCHIPSPACheckBoxExists();
});
Then("verify Medicaid SPA Exists", () => {
  OneMacDashboardPage.verifyMedicaidSPACheckBoxExists();
});
Then("click on Status", () => {
  OneMacDashboardPage.clickstatusDropDown();
});
Then("verify Under Review checkbox exists", () => {
  OneMacDashboardPage.verifyUnderReviewCheckBoxExists();
});
Then("verify Approved checkbox exists", () => {
  OneMacDashboardPage.verifyApprovedCheckboxExists();
});
Then("verify Disapproved checkbox exists", () => {
  OneMacDashboardPage.verifyDisapprovedCheckboxExists();
});
Then("verify Submitted status checkbox exists", () => {
  OneMacDashboardPage.verifySubmittedCheckboxExists();
});
Then("verify Package Withdrawn status checkbox exists", () => {
  OneMacDashboardPage.verifyWithdrawnCheckBoxExists();
});
Then("verify RAI Issued status checkbox exists", () => {
  OneMacDashboardPage.verifyRaiIssuedCheckboxExists();
});
Then("click Under Review checkbox", () => {
  OneMacDashboardPage.clickUnderReviewCheckBox();
});
Then("click Waiver Terminated checkbox", () => {
  OneMacDashboardPage.clickWaiverTerminatedCheckBox();
});
Then("click the Withdrawal Requested checkbox", () => {
  OneMacDashboardPage.clickWithdrawalRequestedCheckBox();
});
Then("click the Formal RAI Response - Withdrawal Requested checkbox", () => {
  OneMacDashboardPage.clickRaiResponseWithdrawalRequestedCheckBox();
});
Then("click the Withdraw Formal RAI Response Enabled checkbox", () => {
  OneMacDashboardPage.clickRaiResponseWithdrawEnabledCheckBox();
});
Then("click the 1915b check box", () => {
  OneMacDashboardPage.click1915bTypeFilterCheckBox();
});
Then("click the 1915c check box", () => {
  OneMacDashboardPage.click1915cTypeFilterCheckBox();
});
Then("click the Initial check box", () => {
  OneMacDashboardPage.clickInitialWaiverCheckBox();
});
Then("click the Renewal check box", () => {
  OneMacDashboardPage.clickWaiverRenewalFilterCheckBox();
});
Then("click 1915c Appendix K Amendment check box", () => {
  OneMacDashboardPage.click1915cAppendixKAmendmentCheckBox();
});
Then("click the Waiver Amendment check box", () => {
  OneMacDashboardPage.clickWaiverAmendmentFilterCheckBox();
});
Then("click 1915b Temporary Extension check box", () => {
  OneMacDashboardPage.click1915bTemporaryExtensionCheckBox();
});
Then("click 1915c Temporary Extension check box", () => {
  OneMacDashboardPage.click1915cTemporaryExtensionCheckBox();
});
Then("click CHIP SPA check box", () => {
  OneMacDashboardPage.clickCHIPSPACheckBox();
});
Then("click Medicaid SPA check box", () => {
  OneMacDashboardPage.clickMedicaidSPACheckBox();
});
Then("verify Medicaid SPA Exists in list", () => {
  OneMacDashboardPage.verifyMedicaidSPAInListExists();
});
Then("verify show hide columns button exists", () => {
  OneMacDashboardPage.verifyShowHideColumnsBTNExists();
});
Then("click show hide columns button", () => {
  OneMacDashboardPage.clickShowHideColumnsBTN();
});
Then("verify Initial Submission Date checkbox exists", () => {
  OneMacDashboardPage.verifycheckBoxInitialSubmissionDateExists();
});
Then("verify state checkbox exists", () => {
  OneMacDashboardPage.verifycheckboxStateExists();
});
Then("verify status checkbox exists", () => {
  OneMacDashboardPage.verifycheckBoxStatusExists();
});
Then("verify submitted by checkbox exists", () => {
  OneMacDashboardPage.verifycheckBoxSubmittedByExists();
});
Then("verify Authority checkbox exists", () => {
  OneMacDashboardPage.verifyCheckBoxAuthorityExists();
});
Then("verify action type checkbox exists", () => {
  OneMacDashboardPage.verifycheckBoxTypeActionExists();
});
Then("verify CPOC Name checkbox exists", () => {
  OneMacDashboardPage.verifycheckBoxCPOCNameExists();
});
Then("verify Formal RAI Received checkbox exists", () => {
  OneMacDashboardPage.verifyFormalRAIReceivedCheckboxExists();
});
Then("verify Formal RAI Response checkbox exists", () => {
  OneMacDashboardPage.verifyFormalRAIResponseCheckboxExists();
});
Then("verify Final Disposition checkbox exists", () => {
  OneMacDashboardPage.verifyFinalDispositionCheckBoxExists();
});
Then("verify Initial Submission Date column exists", () => {
  OneMacDashboardPage.verifyinitialSubmissionDateColumnExists();
});
Then("verify status column exists", () => {
  OneMacDashboardPage.verifystatusColumnExists();
});
Then("verify submitted by column exists", () => {
  OneMacDashboardPage.verifysubmittedByColumnExists();
});
Then("verify Authority column exists", () => {
  OneMacDashboardPage.verifyAuthorityColumnExists();
});
Then("verify action type column exists", () => {
  OneMacDashboardPage.verifyActionTypeColumnExists();
});
Then("verify actions column exists", () => {
  OneMacDashboardPage.verifyactionsColumnExists();
});
Then("verify Formal RAI Received column exists", () => {
  OneMacDashboardPage.verifyFormalRAIReceivedColumnExists();
});
Then("verify Formal RAI Response column exists", () => {
  OneMacDashboardPage.verifyFormalRAIResponseColumnExists();
});
Then("verify Formal RAI Received column does not exist", () => {
  OneMacDashboardPage.verifyFormalRAIReceivedColumnDoesNotExist();
});
Then("verify Formal RAI Response column does not exist", () => {
  OneMacDashboardPage.verifyFormalRAIResponseColumnDoesNotExist();
});
Then("verify CPOC Name column exists", () => {
  OneMacDashboardPage.verifyCPOCNameColumnExists();
});
Then("verify CPOC Name column does not exist", () => {
  OneMacDashboardPage.verifyCPOCNameColumnDoesNotExist();
});
Then("verify Final Disposition column exists", () => {
  OneMacDashboardPage.verifyFinalDispositionColumnExists();
});
Then("verify Final Disposition column does not exist", () => {
  OneMacDashboardPage.verifyFinalDispositionColumnDoesNotExist();
});
Then("click Initial Submission Date column visibility toggle button", () => {
  OneMacDashboardPage.clickCheckBoxInitialSubmissionDate();
});
Then("click state column visibility toggle button", () => {
  OneMacDashboardPage.clickCheckboxState();
});
Then("click status column visibility toggle button", () => {
  OneMacDashboardPage.clickCheckboxStatus();
});
Then("click submitted by column visibility toggle button", () => {
  OneMacDashboardPage.clickCheckBoxSubmittedBy();
});
Then("click Authority column visibility toggle button", () => {
  OneMacDashboardPage.clickCheckBoxAuthority();
});
Then("click action type column visibility toggle button", () => {
  OneMacDashboardPage.clickCheckBoxATypeAction();
});
Then("click CPOC Name column visibility toggle button", () => {
  OneMacDashboardPage.clickCPOCNameCheckBox();
});
Then("click Formal RAI Received column visibility toggle button", () => {
  OneMacDashboardPage.clickFormalRAIReceivedVisibilityToggleBtn();
});
Then("click Final Disposition checkbox", () => {
  OneMacDashboardPage.clickFinalDispositionDateCheckBox();
});
Then("verify Authority column does not exist", () => {
  OneMacDashboardPage.verifyAuthorityColumnDoesNotExist();
});
Then("verify action type column does not exist", () => {
  OneMacDashboardPage.verifyActionTypeColumnDoesNotExist();
});
Then("verify state column does not exist", () => {
  OneMacDashboardPage.verifyStateColumnDoesNotExist();
});
Then("verify status column does not exist", () => {
  OneMacDashboardPage.verifystatusColumnDoesNotExist();
});
Then("verify Initial Submission Date column does not exist", () => {
  OneMacDashboardPage.verifyinitialSubmissionDateColumnDoesNotExist();
});
Then("verify submitted by column does not exist", () => {
  OneMacDashboardPage.verifysubmittedByColumnDoesNotExist();
});
Then("verify the type on row one exists", () => {
  OneMacDashboardPage.verifypackageRowOneTypeExists();
});
Then("verify the state on row one exists", () => {
  OneMacDashboardPage.verifypackageRowOneStateExists();
});
Then("verify Initial Submission Date filter dropdown exists", () => {
  OneMacDashboardPage.verifyInitialSubmissionDateFilterDropDownExists();
});
Then("click on Initial Submission Date filter dropdown", () => {
  OneMacDashboardPage.clickOnInitialSubmissionDateFilterDropDown();
});
Then("verify the date picker for the filter exists", () => {
  OneMacDashboardPage.verifyDatePickerFilterExists();
});
Then("click the date picker for the filter", () => {
  OneMacDashboardPage.clickOnDatePickerFilter();
});
Then("click on this quarter date picker button", () => {
  OneMacDashboardPage.clickOnThisQuarterDatePickerBtn();
});
Then("click on quarter to date date picker button", () => {
  OneMacDashboardPage.clickOnQuarterToDateDatePickerBtn();
});
Then("click on reset button", () => {
  OneMacDashboardPage.clickOnResetButton();
});
Then("verify package row one exists", () => {
  OneMacDashboardPage.verifyPackageRowOneExists();
});
Then("verify Initial Submission Date column one date is this quarter", () => {
  OneMacDashboardPage.verifypackageRowOneInitialSubmissionDateIsThisQuarter();
});
Then("verify states selected includes {string}", (state) => {
  OneMacDashboardPage.verifyStatesSelectedIncludes(state);
});
Then("verify state dropdown filter exists", () => {
  OneMacDashboardPage.verifyStateDropdownFilterExists();
});
Then("click on state dropdown filter", () => {
  OneMacDashboardPage.clickStateDropdownFilter();
});
Then("verify Formal RAI Received dropdown filter exists", () => {
  OneMacDashboardPage.verifyFormalRAIReceivedDateFilterDropdownExists();
});
Then("click on Formal RAI Received dropdown filter", () => {
  OneMacDashboardPage.clickOnFormalRAIReceivedDateFilterDropdownDropDown();
});
Then("verify Final Disposition dropdown filter exists", () => {
  OneMacDashboardPage.verifyFinalDispositionDateFilterDropdownExists();
});
Then("click on Final Disposition dropdown filter", () => {
  OneMacDashboardPage.clickOnFinalDispositionDateFilterDropdownDropDown();
});
Then("verify state filter select exists", () => {
  OneMacDashboardPage.verifyFilterInputSelectExists();
});
Then("verify no states are selected", () => {
  OneMacDashboardPage.verifyFilterInputSelectIsEmpty();
});
Then("set value on state filter select to {string}", (state) => {
  OneMacDashboardPage.typeStateToSelect(state + "{enter}");
});
Then("set the value of state select button to {string}", (state) => {
  OneMacFormPage.setStateSelectBtn(state + "{enter}");
});
Then("verify {string} is showing in the state column", (state) => {
  OneMacDashboardPage.verifypackageRowOneValueIs(state);
});
Then("verify remove {string} button exists", (state) => {
  OneMacDashboardPage.verifyremoveBtnExistsFor(state);
});
Then("click remove {string} button", (state) => {
  OneMacDashboardPage.clickRemoveBtnFor(state);
});
Then("verify the Waivers tab exists", () => {
  OneMacDashboardPage.verifyWaiversTabExists();
});
Then("click on the Waivers tab", () => {
  OneMacDashboardPage.clickOnWaiversTab();
});
Then("verify the SPAs tab exists", () => {
  OneMacDashboardPage.verifySPAsTabExists();
});
Then("verify SPA ID column exists", () => {
  OneMacDashboardPage.verifySPAIDColumnExists();
});
Then("verify Waiver Number column exists", () => {
  OneMacDashboardPage.verifyWaiverNumberColumnExists();
});
Then("verify status DropDown Filter exists", () => {
  OneMacDashboardPage.verifystatusDropDownFilterExists();
});
Then("verify the SPAs tab is selected", () => {
  OneMacDashboardPage.verifySPAsTabIsActive();
});
Then("verify the Waivers tab is selected", () => {
  OneMacDashboardPage.verifyWaiversTabIsActive();
});
Then("verify the Waivers tab is clickable", () => {
  OneMacDashboardPage.verifyWaiversTabIsClickable();
});
Then("refresh the page", () => {
  cy.reload();
});
Then("check all of the status checkboxes", () => {
  OneMacDashboardPage.checkAllStatusFilterCheckboxes();
});
Then("uncheck all of the status checkboxes", () => {
  OneMacDashboardPage.uncheckAllStatusFilterCheckboxes();
});
Then("check all of the type checkboxes", () => {
  OneMacDashboardPage.checkAllTypeFilterCheckboxes();
});
Then("uncheck all of the type checkboxes", () => {
  OneMacDashboardPage.uncheckAllTypeFilterCheckboxes();
});
Then("click RAI Issued checkbox", () => {
  OneMacDashboardPage.clickRaiIssuedCheckbox();
});
Then("click Pending - RAI checkbox", () => {
  OneMacDashboardPage.clickPendingRaiCheckbox();
});
Then("verify Pending - RAI status checkbox exists", () => {
  OneMacDashboardPage.verifyPendingRaiCheckboxExists();
});
Then("click the Pending - Concurrence checkbox", () => {
  OneMacDashboardPage.clickPendingConcurrenceCheckbox();
});
Then("verify the Pending - Concurrence status checkbox exists", () => {
  OneMacDashboardPage.verifyPendingConcurrenceCheckboxExists();
});
Then("click the Pending - Approval checkbox", () => {
  OneMacDashboardPage.clickPendingApprovalCheckbox();
});
Then("verify the Pending - Approval status checkbox exists", () => {
  OneMacDashboardPage.verifyPendingApprovalCheckboxExists();
});
Then("click Approved checkbox", () => {
  OneMacDashboardPage.clickApprovedCheckbox();
});
Then("click Disapproved checkbox", () => {
  OneMacDashboardPage.clickDisapprovedCheckbox();
});
Then("click the SPA ID link in the first row", () => {
  cy.wait(1000);
  OneMacDashboardPage.clickSPAIDLinkInFirstRow();
});
Then("click the Waiver Number link in the first row", () => {
  cy.wait(1000);
  OneMacDashboardPage.clickWaiverNumberLinkInFirstRow();
});
Then("click the Package Withdrawn checkbox", () => {
  OneMacDashboardPage.clickWithdrawnCheckBoxExists();
});
Then("click Unsubmitted checkbox", () => {
  OneMacDashboardPage.clickUnsubmittedCheckbox();
});
Then("click Submitted checkbox", () => {
  OneMacDashboardPage.clickSubmittedCheckbox();
});
Then("click Submitted - Intake Needed checkbox", () => {
  OneMacDashboardPage.clickSubmittedIntakeNeededCheckbox();
});
Then("verify Submitted - Intake Needed status checkbox exists", () => {
  OneMacDashboardPage.verifySubmittedIntakeNeededCheckboxExists();
});
Then("click Requested checkbox", () => {
  OneMacDashboardPage.clickDoubleDashCheckbox();
});
Then("click the Pending checkbox", () => {
  OneMacDashboardPage.clickPendingCheckbox();
});
Then("verify the type action in row one is {string}", (s) => {
  OneMacDashboardPage.verifypackageRowOneTypeActionHasText(s);
});
Then("verify the type in row one is {string}", (s) => {
  OneMacDashboardPage.verifypackageRowOneTypeHasText(s);
});
Then(
  "verify the waiver number format in row one is SS-#####.S## or SS-####.S##",
  () => {
    OneMacDashboardPage.verifypackageRowOneIDWaiverFormat();
  }
);
Then("verify Onboarding Materials exists", () => {
  OneMacFAQPage.verifyOnboardingMaterialsBtnExists();
});
Then("click on Onboarding Materials", () => {
  OneMacFAQPage.clickOnboardingMaterialsBtn();
});
Then("verify Welcome to OneMac link exists", () => {
  OneMacFAQPage.verifyWelcomeToOneMacLinkExists();
});
Then("verify Welcome to OneMac link is valid", () => {
  OneMacFAQPage.verifyWelcomeToOneMacLinkIsValid();
});
Then("verify IDM Instructions for OneMAC Users link exists", () => {
  OneMacFAQPage.verifyIdmInstructionsLinkExists();
});
Then("verify OneMAC IDM Guide link exists", () => {
  OneMacFAQPage.verifyIdmGuideLinkExists();
});
Then("verify OneMAC State User Guide link exists", () => {
  OneMacFAQPage.verifyStateSubmitterGuideLinkExists();
});
Then("verify OneMAC CMS User Guide link exists", () => {
  OneMacFAQPage.verifyCmsUserGuideLinkExists();
});
Then("verify IDM Instructions for OneMAC Users is valid", () => {
  OneMacFAQPage.verifyIdmInstructionsLinkIsValid();
});
Then("verify OneMAC IDM Guide is valid", () => {
  OneMacFAQPage.verifyIdmGuideLinkIsValid();
});
Then("verify OneMAC State User Guide is valid", () => {
  OneMacFAQPage.verifyStateSubmitterGuideLinkIsValid();
});
Then("verify OneMAC CMS User Guide is valid", () => {
  OneMacFAQPage.verifyCmsUserGuideLinkIsValid();
});
Then("search for {string}", (part) => {
  OneMacDashboardPage.searchFor(part);
  cy.wait(1000);
});
Then("verify that Request a Role Change button exists", () => {
  OneMacUserManagmentPage.verifyRequestARoleChangeBtnExists();
});

Then("click on Request a Role Change button", () => {
  OneMacUserManagmentPage.clickRequestARoleChangeBtn();
});
Then("verify that Request a Role Change button does not exist", () => {
  OneMacUserManagmentPage.verifyRequestARoleChangeBtnDoesNotExist();
});
Then(
  "verify withdraw package button is visible for package in package dashboard",
  () => {
    OneMacDashboardPage.verifyWithdrawPackageBtnExists();
  }
);
Then(
  "verify withdraw package button is not visible for package in package dashboard",
  () => {
    OneMacDashboardPage.verifyWithdrawPackageBtnDoesNotExists();
  }
);
Then("click withdraw package button", () => {
  OneMacDashboardPage.clickWithdrawPackageBtn();
});
Then("click yes, withdraw package button", () => {
  OneMacDashboardPage.clickConfirmWithdrawPackageBtn();
});
Then("click yes, withdraw package button without waiting", () => {
  OneMacDashboardPage.clickConfirmWithdrawPackageBtnWithoutWaiting();
});
Then("verify yes, withdraw package button exists", () => {
  OneMacDashboardPage.verifyConfirmWithdrawPackageBtnExists();
});
Then("click Yes, withdraw response button", () => {
  OneMacDashboardPage.clickConfirmWithdrawResponseBtn();
});
Then("verify Yes, withdraw response button exists", () => {
  OneMacDashboardPage.verifyConfirmWithdrawResponseBtnExists();
});
Then("verify the package details page is visible", () => {
  OneMacPackageDetailsPage.verifyPackageDetailsPageIsVisible();
});
Then("verify the status on the card is {string}", (status) => {
  OneMacPackageDetailsPage.verifyStatusIs(status);
});
Then("verify 2nd clock is visible under the status", () => {
  OneMacPackageDetailsPage.verify2ndClockIsVisible();
});
Then("verify 2nd clock is not visible under the status", () => {
  OneMacPackageDetailsPage.verify2ndClockIsNotVisible();
});
Then("verify package actions header is visible", () => {
  OneMacPackageDetailsPage.verifyPackageActionsHeaderIsVisible();
});
Then("verify there are no package actions available", () => {
  OneMacPackageDetailsPage.verifyNoPackageActionsAvailable();
});
Then("verify Respond to Formal RAI action exists", () => {
  OneMacPackageDetailsPage.verifyRespondtoRAIActionExists();
});
Then("verify withdraw package action exists", () => {
  OneMacPackageDetailsPage.verifyWithdrawPackageActionExists();
});
Then("verify Request a Temporary Extension package action exists", () => {
  OneMacPackageDetailsPage.verifyRequestTempExtensionPackageActionExists();
});
Then("click Request a Temporary Extension package action", () => {
  OneMacPackageDetailsPage.clickRequestTempExtensionPackageAction();
});
Then("verify Add Amendment package action exists", () => {
  OneMacPackageDetailsPage.verifyAddAmendmentActionExists();
});
Then("click Add Amendment package action", () => {
  OneMacPackageDetailsPage.clickAddAmendmentPackageAction();
});
Then("verify Withdraw Formal RAI Response package action exists", () => {
  OneMacPackageDetailsPage.verifyWithdrawFormalRAIResponseActionExists();
});
Then("click Withdraw Formal RAI Response package action", () => {
  OneMacPackageDetailsPage.clickWithdrawFormalRAIResponseAction();
});
Then("verify Enable Formal RAI Response Withdraw package action exists", () => {
  OneMacPackageDetailsPage.verifyEnableRAIResponseWithdrawActionExists();
});
Then("click Enable Formal RAI Response Withdraw package action", () => {
  OneMacPackageDetailsPage.clickEnableRAIResponseWithdrawAction();
});
Then(
  "verify Disable Formal RAI Response Withdraw package action exists",
  () => {
    OneMacPackageDetailsPage.verifyDisableRAIResponseWithdrawActionExists();
  }
);
Then("click on Respond to RAI package action", () => {
  OneMacPackageDetailsPage.clickRespondToRAIAction();
});
Then("verify the details section exists", () => {
  OneMacPackageDetailsPage.verifyDetailSectionExists();
});
Then("verify the package details title contains {string}", (string) => {
  OneMacPackageDetailsPage.verifyTitleContains(string);
});

Then("verify there is a Type header in the details section", () => {
  OneMacPackageDetailsPage.verifyAuthorityHeaderExists();
});
Then("verify a type containing {string} exists for the Authority", (type) => {
  OneMacPackageDetailsPage.verifyAuthorityIs(type);
});
Then(
  "verify there is a Approved Initial or Renewal Number header in the details section",
  () => {
    OneMacPackageDetailsPage.verifyParentWaiverNumberHeaderExists();
  }
);
Then(
  "verify the Approved Initial or Renewal Number ID is the approved intial waiver number 1",
  () => {
    cy.fixture("packageDashboardWaiverNumbers.json").then((data) => {
      OneMacPackageDetailsPage.verifyParentWaiverNumber(
        data.approvedInitialWaiverNum1
      );
    });
  }
);
Then("verify there is a State header in the details section", () => {
  OneMacPackageDetailsPage.verifyStateHeaderExists();
});
Then("verify a state exists for the State", () => {
  OneMacPackageDetailsPage.verifyStateExists();
});
Then("verify there is an Amendment Title header in the details section", () => {
  OneMacPackageDetailsPage.verifyAmendmentTitleHeaderExists();
});
Then("verify there is an Amendment Title under the header", () => {
  OneMacPackageDetailsPage.verifyAmendmentTitleExists();
});
Then("verify the Amendment Title is {string}", (s) => {
  OneMacPackageDetailsPage.verifyAmendmentTitleIs(s);
});
Then(
  "verify there is an Initial Submission Date header in the details section",
  () => {
    OneMacPackageDetailsPage.verifyInitialSubmittedDateHeaderExists();
  }
);
Then("verify a date exists for the Initial Submission Date", () => {
  OneMacPackageDetailsPage.verifyDateExists();
});
Then(
  "verify the form is titled Formal Request for Additional Information Response",
  () => {
    OneMacFormPage.verifyPageHeader(
      "Formal Request for Additional Information Response"
    );
  }
);
Then(
  "verify the form is titled {string}",
  (formH1Title) => {
    OneMacFormPage.verifyPageHeader(formH1Title);
  }
);
Then("verify user is on new initial waiver page", () => {
  OneMacSubmissionTypePage.verifyNewInitialWaiverPage();
});
Then("verify user is on new waiver renewal page", () => {
  OneMacSubmissionTypePage.verifyNewWaiverRenewalPage();
});
Then("verify user is on new Appendix K page", () => {
  OneMacSubmissionTypePage.verifyNewAppendixKPage();
});
Then("verify user is on new waiver amendment page", () => {
  OneMacSubmissionTypePage.verifyNewWaiverAmendmentPage();
});
Then("verify the page header is {string}", (pageHeader) => {
  OneMacFormPage.verifyPageHeader(pageHeader);
});
Then("verify the form title is {string}", (pageHeader) => {
  OneMacFormPage.verifyFormTitle(pageHeader);
});
Then("verify Enter the MMDL System button is visible and clickable", () => {
  OneMacFormPage.verifyMmdlSystemBtn();
});
Then("verify Enter the MACPro system button is visible and clickable", () => {
  OneMacFormPage.verifyMacProSystemBtn();
});
Then("verify RAI Responses header does not exist", () => {
  OneMacPackageDetailsPage.verifyRaiResponseHeaderDoesNotExist();
});
Then("click the actions button in row one", () => {
  cy.wait(1000);
  OneMacDashboardPage.clickPackageRowOneActionsBtn();
});
Then("click the Respond to RAI button", () => {
  OneMacDashboardPage.clickRespondToRAIBtn();
});
Then("click the Issue Formal RAI button", () => {
  OneMacDashboardPage.clickIssueRAIBtn();
});
Then("click the details page Issue Formal RAI button", () => {
  OneMacPackageDetailsPage.clickIssueRAIBtn();
});
Then("click the Request Temporary Extension button", () => {
  OneMacDashboardPage.clickRequestTempExtensionBtn();
});
Then("verify the Request Temporary Extension button is displayed", () => {
  OneMacDashboardPage.verifyRequestTempExtensionBtnExists();
});
Then("verify the Add Amendment button is displayed", () => {
  OneMacDashboardPage.verifyAddAmendmentBtnExists();
});
Then("verify the Respond to Formal RAI button is displayed", () => {
  OneMacDashboardPage.verifyRespondToRAIBtnExists();
});
Then("click the pending user action button", () => {
  OneMacUserManagmentPage.clickPendingUserActionBtn();
});
Then("click the deny access button", () => {
  OneMacUserManagmentPage.clickDenyAccessBtn();
});
Then("verify the logout button exists", () => {
  OneMacDashboardPage.verifyLogoutBtnExists();
});
Then("click the sign out button", () => {
  OneMacDashboardPage.clickLogoutBtn();
});
Then(
  "verify there is a Proposed Effective Date header in the details section",
  () => {
    OneMacPackageDetailsPage.verifyProposedEffectiveDateHeaderExists();
  }
);
Then(
  "verify the Proposed Effective Date is a date formatted like mo dd yyyy",
  () => {
    OneMacPackageDetailsPage.verifyproposedEffectiveDateHeaderContainsDate();
  }
);
Then(
  "verify there is a Final Disposition Date header in the details section",
  () => {
    OneMacPackageDetailsPage.verifyFinalDispositionDateHeaderExists();
  }
);
Then(
  "verify there not is a Final Disposition Date header in the details section",
  () => {
    OneMacPackageDetailsPage.verifyFinalDispositionDateHeaderDoesNotExists();
  }
);
Then(
  "verify there is an Approved Effective Date in the details section",
  () => {
    OneMacPackageDetailsPage.verifyApprovedEffectiveDateHeaderExists();
  }
);
Then(
  "verify there is not an Approved Effective Date header in the details section",
  () => {
    OneMacPackageDetailsPage.verifyApprovedEffectiveDateHeaderDoesNotExists();
  }
);
Then(
  "verify there is an Formal RAI Received Date header in the details section",
  () => {
    OneMacPackageDetailsPage.verifyFormalRAIReceivedDateHeaderExists();
  }
);
Then(
  "verify the Formal RAI Received Date is a date formatted like Mon dd yyyy",
  () => {
    OneMacPackageDetailsPage.verifyFormalRAIReceivedDateHeaderContainsDate();
  }
);
Then("verify the waiver authority header exists", () => {
  OneMacPackageDetailsPage.verifyWaiverAuthorityHeaderExists();
});
Then("verify the waiver authority is 1915c HCBS", () => {
  OneMacPackageDetailsPage.verifyWaiverAuthorityHeaderis1915cHCBS();
});
Then("verify the package activity section exists", () => {
  OneMacPackageDetailsPage.verifyPackageActivitySectionExists();
});
Then("verify the additional information section exists", () => {
  OneMacPackageDetailsPage.verifyAdditionalInfoSectionExists();
});
Then("verify the Administrative Package Changes section exists", () => {
  OneMacPackageDetailsPage.verifyAdministrativePackageChangesSectionExists();
});
Then("click withdraw button", () => {
  OneMacPackageDetailsPage.clickWithdrawBtn();
});
Then("verify success message for denied role", () => {
  OneMacDashboardPage.verifySuccessMessageIsDisplayedForRoleChange();
});
Then("set {string} to {int} months from today", (whichDate, numMonths) => {
  OneMacFormPage.addMonthsTo(whichDate, numMonths);
});
Then("verify {string} is prefilled", (whereTo) => {
  OneMacFormPage.verifyPrefill(whereTo);
});
Then("copy the ID from the link in the first row", () => {
  cy.wait(1000);
  OneMacDashboardPage.copyTheIDFromLinkInFirstRow();
});
Then("search for the ID copied from the link in the first row", () => {
  cy.wait(1000);
  cy.fixture("savedID.json").then((data) => {
    OneMacDashboardPage.searchFor(data.savedID);
  });
  cy.wait(1000);
});
Then("verify the ID searched for is the ID in the first result", () => {
  cy.fixture("savedID.json").then((data) => {
    OneMacDashboardPage.compareSearchIDToFirstLinkID(data.savedID);
  });
  cy.wait(1000);
});
Then(
  "verify the CPOC searched for is Chester Tester in the first result",
  () => {
    OneMacDashboardPage.verifyCPOCInFirstRow();
    cy.wait(1000);
  }
);
Then("verify the actions button is disabled in the package dashboard", () => {
  OneMacDashboardPage.verifyActionsBtnDisabledOnFirstRow();
});
Then("verify actions column is unavailable", () => {
  OneMacDashboardPage.verifyActionsColumnDoesNotExist();
});
Then("verify the first RAI Response header is titled", () => {
  OneMacPackageDetailsPage.verifyRaiResponseHeaderTitle();
});
Then(
  "verify What format is used to enter a 1915b Initial Waiver number header is visible",
  () => {
    OneMacFAQPage.verifyInitialWaiverFormatHeaderBtnExists();
  }
);
Then(
  "click What format is used to enter a 1915b Initial Waiver number header",
  () => {
    OneMacFAQPage.clickInitialWaiverFormatHeaderBtn();
  }
);
Then(
  "verify What format is used to enter a 1915b Initial Waiver number body is visible",
  () => {
    OneMacFAQPage.verifyInitialWaiverFormatBody();
  }
);
Then(
  "verify What format is used to enter a 1915b Waiver Renewal number header is visible",
  () => {
    OneMacFAQPage.verifyWaiverRenewalFormatHeaderBtnExists();
  }
);
Then(
  "click What format is used to enter a 1915b Waiver Renewal number header",
  () => {
    OneMacFAQPage.clickWaiverRenewalFormatHeaderBtn();
  }
);
Then(
  "verify What format is used to enter a 1915b Waiver Renewal number is visible",
  () => {
    OneMacFAQPage.verifyWaiverRenewalFormatBody();
  }
);
Then("verify the submit button is not disabled", () => {
  OneMacFormPage.verifySubmitBtnIsNotDisabled();
});
Then("verify the submit button is disabled", () => {
  OneMacFormPage.verifySubmitBtnIsDisabled();
});
Then(
  "verify What format is used to enter a 1915b and 1915c Temporary Extension number header",
  () => {
    OneMacFAQPage.verifyTempExtFormatHeaderBtnExists();
  }
);
Then(
  "click What format is used to enter a 1915b and 1915c Temporary Extension number header",
  () => {
    OneMacFAQPage.clickTempExtFormatHeaderBtn();
  }
);
Then(
  "verify What format is used to enter a 1915b and 1915c Temporary Extension number body is visible",
  () => {
    OneMacFAQPage.verifyTempExtFormatBody();
  }
);
Then(
  "verify What are the attachments for a 1915c Waiver - Request for Temporary Extension header is visible",
  () => {
    OneMacFAQPage.verifyAttachmentsFor1915cRequestTempExtHeaderBtnExists();
  }
);
Then(
  "click What are the attachments for a 1915c Waiver - Request for Temporary Extension header",
  () => {
    OneMacFAQPage.clickAttachmentsFor1915cRequestTempExtHeaderBtn();
  }
);
Then(
  "verify What are the attachments for a 1915c Waiver - Request for Temporary Extension body is visible",
  () => {
    OneMacFAQPage.verifyAttachmentsFor1915cRequestTempExtBody();
  }
);
Then("verify error message contains {string}", (msg) => {
  OneMacFormPage.verifyErrorMsgContains(msg);
});
Then("type {string} into Amendment Title field", (amendmentTitle) => {
  OneMacFormPage.inputAmendmentTitle(amendmentTitle);
});
Then("verify id number in the first row matches {string}", (s) => {
  OneMacDashboardPage.verifyIDNumberInFirstRowIs(s);
});
Then("verify the {string} hint text is {string}", (whichLabel, hintText) => {
  OneMacFormPage.verifyHintTextContains(whichLabel, hintText);
});
Then("verify the Temporary Extension Type is {string}", (whichType) => {
  OneMacFormPage.verifyTempExtensionType(whichType);
});
Then("select {string} as the Temporary Extension Type", (whichType) => {
  OneMacFormPage.selectTempExtensionType(whichType);
});
Then("verify Form Intro Text is {string}", (introText) => {
  OneMacFormPage.verifyFormIntro(introText);
});
Then("verify ID Label is {string}", (label) => {
  OneMacFormPage.verifyIDLabelIs(label);
});
Then("verify Authority is {string}", (string) => {
  OneMacFormPage.verifyAuthorityIs(string);
});
Then("verify {string} is an Attachment Type", (attachmentType) => {
  OneMacFormPage.verifyAttachmentType(attachmentType);
});
Then("verify label {string} exists on page", (inputHeader) => {
  OneMacFormPage.verifyInputHeaderIs(inputHeader);
});
Then("verify there is a Subject header in the details section", () => {
  OneMacPackageDetailsPage.verifySubjectHeaderExists();
});
Then("verify the subject has a value displayed in the details section", () => {
  OneMacPackageDetailsPage.verifySubjectValueExists();
});
Then("verify subject is not visible in the details section", () => {
  OneMacPackageDetailsPage.verifySubjectDoesNotExists();
});
Then("verify there is a description header in the details section", () => {
  OneMacPackageDetailsPage.verifyDescrptionHeaderExists();
});
Then(
  "verify the description has a value displayed in the details section",
  () => {
    OneMacPackageDetailsPage.verifyDescriptionValueExists();
  }
);
Then("verify description is not visible in the details section", () => {
  OneMacPackageDetailsPage.verifyDescrptionDoesNotExists();
});
Then("verify the attachment info descriptiion", () => {
  OneMacFormPage.verifyAttachmentInfoDecription();
});
Then("verify the attachment info link is for {string}", (packageType) => {
  OneMacFormPage.verifyAttachmentInfoLinkFor(packageType);
});
Then("verify there is a CPOC header in the details section", () => {
  OneMacPackageDetailsPage.verifyCPOCNameHeaderExists();
});
Then("verify the CPOC has a value displayed in the details section", () => {
  OneMacPackageDetailsPage.verifyCPOCNameValueExists();
});
Then("verify CPOC is not visible in the details section", () => {
  OneMacPackageDetailsPage.verifyCPOCNameDoesNotExist();
});
Then("verify there is a Review Team SRT header in the details section", () => {
  OneMacPackageDetailsPage.verifyReviewTeamSRTHeaderExists();
});
Then(
  "verify the Review Team SRT has a value displayed in the details section",
  () => {
    OneMacPackageDetailsPage.verifyReviewTeamSRTValueExists();
  }
);
Then("verify Review Team SRT is not visible in the details section", () => {
  OneMacPackageDetailsPage.verifyReviewTeamSRTDoesNotExists();
});
Then("verify the Initial Submission caret button exists", () => {
  OneMacPackageDetailsPage.verifyInitialSubmissionCaretBtnExists();
});
Then("expand the Initial Submission caret", () => {
  OneMacPackageDetailsPage.expandInitialSubmissionCaretBtn();
});
Then("verify the download all button exists", () => {
  OneMacPackageDetailsPage.verifyDownloadAllBtnExists();
});
Then("verify the Withdrawal Requested caret button exists", () => {
  OneMacPackageDetailsPage.verifyWithdrawalRequestedCaretBtnExists();
});
Then("expand the Withdrawal Requested caret", () => {
  OneMacPackageDetailsPage.expandWithdrawalRequestedCaretBtn();
});
Then(
  "verify the sub status on the card is Withdraw Formal RAI Response Enabled",
  () => {
    OneMacPackageDetailsPage.verifyTheSubStatus();
  }
);
Then("verify the expand all button is visible", () => {
  OneMacFAQPage.verifyExpandAllBtnExists();
});
Then("click the expand all button", () => {
  OneMacFAQPage.clickExpandAllBtn();
});
Then("verify all sections are collapsed", () => {
  OneMacFAQPage.verifyAllSectionsAreCollapsed();
});
Then("verify all sections are expanded", () => {
  OneMacFAQPage.verifyAllSectionsAreExpanded();
});
Then("verify page url contains {string}", (checkUrl) => {
  OneMacDashboardPage.verifyPageByURL(checkUrl);
});

Then("type the generated SPA ID {int} into the ID Input box using the state {string}", (count, state) => {
  let spaID = util.generateSPAID(state || 'MD');
  OneMacFormPage.inputID(spaID);
  cy.fixture("generatedIDs.json").then((obj) => {
    obj["generatedSPAID" + count] = spaID;
    // write the merged object
    cy.writeFile("./fixtures/generatedIDs.json", obj)
  })
});

Then("verify submission successful message in the modal", () => {
  OneMacFormPage.verifySuccessMessageIsDisplayedInModal();
});

Then("click the Go to Dashboard button", () => {
  cy.reload();
  OneMacFormPage.clickGoToDashBoardBtn();
});
Then("type the generated {string} Number {int} into the ID Input box using the state {string}", (type, count, state = "MD") => {
  cy.readFile("./fixtures/generatedIDs.json").then((obj) => {
    cy.readFile("./fixtures/generatedIDPartialCounter.json").then((data) => {
      let newID = state + "-";
      switch (type) {
        case "Initial Waiver Number": {
          data["lastInitialWaiverPart"] = util.firstpartCounter(data["lastInitialWaiverPart"]);
          newID += data["lastInitialWaiverPart"] + ".R00.00";
          obj["generated" + type.replace(/\s/g, '') + "ID" + count] = newID;
          console.log(`newID is ${newID}`)
          OneMacFormPage.inputInto(type, newID);
          break;
        }
        case "1915(b) Waiver Renewal Number": {
          if (parseInt(data["lastRenewalSecondPart"]) === 99) {
            data["lastRenewalFirstPart"] = util.firstpartCounter(data["lastRenewalFirstPart"]);
          }
          data["lastRenewalSecondPart"] = util.doubleDigitCounter(data["lastRenewalSecondPart"]);
          newID += data["lastRenewalFirstPart"] + ".R" + data["lastRenewalSecondPart"] + ".00";
          obj["generated" + type.replace(/\s/g, '') + "ID" + count] = newID;
          OneMacFormPage.inputInto(type, newID);
          break;
        }
        case "1915(b) Waiver Amendment Number": {
          if (parseInt(data["lastAmendmentSecondPart"]) === 99) {
            data["lastAmendmentFirstPart"] = util.firstpartCounter(data["lastAmendmentFirstPart"]);
          }
          data["lastAmendmentSecondPart"] = util.doubleDigitCounter(data["lastAmendmentSecondPart"]);
          newID += data["lastAmendmentFirstPart"] + ".R00." + data["lastAmendmentSecondPart"];
          obj["generated" + type.replace(/\s/g, '') + "ID" + count] = newID;
          OneMacFormPage.inputInto(type, newID);
          break;
        }
        case "1915(b) Temporary Extension Request Number": {
          if (parseInt(data["lastbTempExtensionSecondPart"]) === 99) {
            data["lastbTempExtensionFirstPart"] = util.firstpartCounter(data["lastbTempExtensionFirstPart"]);
          }
          data["lastbTempExtensionSecondPart"] = util.doubleDigitCounter(data["lastbTempExtensionSecondPart"]);
          newID += data["lastbTempExtensionFirstPart"] + ".R00.TE" + data["lastbTempExtensionSecondPart"];
          obj["generated" + type.replace(/\s/g, '') + "ID" + count] = newID;
          OneMacFormPage.inputInto("Temporary Extension Request Number", newID);
          break;
        }
        case "1915(c) Temporary Extension Request Number": {
          if (parseInt(data["lastcTempExtensionSecondPart"]) === 99) {
            data["lastcTempExtensionFirstPart"] = util.firstpartCounter(data["lastcTempExtensionFirstPart"]);
          }
          data["lastcTempExtensionSecondPart"] = util.doubleDigitCounter(data["lastcTempExtensionSecondPart"]);
          newID += data["lastcTempExtensionFirstPart"] + ".R00.TE" + data["lastcTempExtensionSecondPart"];
          obj["generated" + type.replace(/\s/g, '') + "ID" + count] = newID;
          OneMacFormPage.inputInto("Temporary Extension Request Number", newID);
          break;
        }
        case "Appendix K ID": {
          OneMacFormPage.clearInput(type);
          if (parseInt(data["lastAppKSecondPart"]) === 99) {
            data["lastAppKFirstPart"] = util.firstpartCounter(data["lastAppKFirstPart"]);
          }
          data["lastAppKSecondPart"] = util.doubleDigitCounter(data["lastAppKSecondPart"]);
          newID = data["lastAppKFirstPart"] + ".R00." + data["lastAppKSecondPart"];
          obj["generated" + type.replace(/\s/g, '') + "ID" + count] = newID;
          OneMacFormPage.inputInto(type, newID);
          break;
        }
        case "Medicaid SPA": {
          data["lastMedicaidSpaPart"] = util.spaIDCounter(data["lastMedicaidSpaPart"]);
          let year = new Date().getFullYear().toString().slice(-2);
          newID += year + "-" + data["lastMedicaidSpaPart"] + "-CYMS"; //CYMS
          obj["generated" + type.replace(/\s/g, '') + "ID" + count] = newID;
          OneMacFormPage.inputInto("SPA ID", newID);
          break;
        }
        case "CHIP SPA": {
          data["lastChipSpaPart"] = util.spaIDCounter(data["lastChipSpaPart"]);
          let year = new Date().getFullYear().toString().slice(-2);
          newID += year + "-" + data["lastChipSpaPart"] + "-CYCS"; //CYCS
          obj["generated" + type.replace(/\s/g, '') + "ID" + count] = newID;
          OneMacFormPage.inputInto("SPA ID", newID);
          break;
        }
        default:
          cy.log("type is invalid or not covered in cases");
          break;
      }
      // write the merged object
      console.log("obj: " + JSON.stringify(obj));
      console.log("data: " + data);
      cy.writeFile("./fixtures/generatedIDs.json", obj);
      cy.writeFile("./fixtures/generatedIDPartialCounter.json", data);
    })
  });
});
Then("search for the generated {string} Number {int}", (type, count) => {
  cy.readFile("./fixtures/generatedIDs.json").then((data) => {
    let idToSearch = data["generated" + type.replace(/\s/g, '') + "ID" + count];
    console.log(`text of the data variable we programatically created is generated` + type.replace(/\s/g, '') + "ID" + count)
    console.log(`id we're searching for is ${idToSearch}`);
    OneMacDashboardPage.searchFor(idToSearch);
  });
  cy.wait(1000);
});
Then(
  "verify the id number in the first row matches the generated {string} Number {int}", (type, count) => {
    cy.readFile("./fixtures/generatedIDs.json").then((data) => {
      OneMacDashboardPage.verifyIDNumberInFirstRowIs(data["generated" + type.replace(/\s/g, '') + "ID" + count]);
    });
  }
);