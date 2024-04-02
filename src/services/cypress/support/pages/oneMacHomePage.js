//xpath, use cy.xpath
const signInBtn = "//button[contains(text(),'Sign In')]";

//xpath, use cy.xpath
const FAQPage = "//a[text()='FAQ']";
//xpath, use cy.xpath
const HomePageLink = "//a[contains(text(),'Home')]";
//xpath, use cy.xpath
const RegisterLink = "//button[contains(text(),'Register')]";
//xpath, use cy.xpath
const welcomeMSG = "//*[contains(text(),'Welcome to the official submission system for pape')]";
//xpath, use cy.xpath
const stateUsersSection = "//h2[contains(text(),'State Users')]";
//xpath, use cy.xpath
const cmsUsersSection = "//h2[contains(text(),'CMS Users')]";
//xpath, use cy.xpath
const doYouHaveQuestionsOrNeedSupport =
  "//*[contains(text(),'Do you have questions or need support?')]";
//xpath, use cy.xpath
const viewFAQ = "//button[contains(text(),'View FAQ')]";

//State Users Section

//xpath, use cy.xpath
const howToCreateASubmission =
  "//h3[contains(text(),'How it works')]";
//xpath, use cy.xpath
const loginWithIDM = "//*[contains(text(),'Login with IDM')]";
//xpath, use cy.xpath
const loginWithIDMInfo =
  "//*[contains(text(),'Login with your IDM username and password to acces')]";
//xpath, use cy.xpath
const AttachYourDocuments = "//*[contains(text(),'Attach your documents')]";
//xpath, use cy.xpath
const AttachYourDocumentsInfo =
  "//*[contains(text(),'Select a submission type and attach required docum')]";
//xpath, use cy.xpath
const receiveAnEmailConformation =
  "//*[contains(text(),'Receive an email confirmation')]";
//xpath, use cy.xpath
const receiveAnEmailConformationInfo =
  "//*[contains(text(),'After you submit, you will receive an email confir')]";
//xpath, use cy.xpath
const submissionTypesInclude =
  "//*[contains(text(),'Submission Types include:')]";
//xpath, use cy.xpath
const firstBullet =
  "//*[contains(text(),'Amendments to your Medicaid and CHIP State Plans (')]";
//xpath, use cy.xpath
const secondBullet =
  "//*[text()='Official state responses to formal requests for additional information (RAIs) for SPAs (not submitted through MACPro).']";
//xpath, use cy.xpath
const thirdBullet =
  "//*[contains(text(),'Section 1915(b) waiver submissions (those not subm')]";
//xpath, use cy.xpath
const fourthBullet =
  "//*[contains(text(),'Section 1915(c) Appendix K amendments (which canno')]";
//xpath, use cy.xpath
const fifthBullet =
  "//*[text()='Official state responses to formal requests for additional information (RAIs) for Section 1915(b) waiver actions (in addition to submitting waiver changes in WMS, if applicable).']";
//xpath, use cy.xpath
const sixthBullet =
  "//*[text()='State requests for Temporary Extensions for section 1915(b) and 1915(c) waivers.']";

// CMS Users Section
//xpath, use cy.xpath
const ReceiveAnEmailForSubmissionNotification =
  "//*[contains(text(),'Receive an email for submission notification')]";

//xpath, use cy.xpath
const ReceiveAnEmailForSubmissionNotificationInfo =
  "//*[contains(text(),'After a state adds a submission to OneMAC, you wil')]";
//xpath, use cy.xpath
const loginWithEUA = "//*[contains(text(),'Login with EUA')]";
//xpath, use cy.xpath
const loginWithEUAInfo =
  "//*[contains(text(),'Login with your EUA username and password to acces')]";
//xpath, use cy.xpath
const ReviewYourAssignedSubmission =
  "//*[contains(text(),'Review your assigned submission')]";
//xpath, use cy.xpath
const ReviewYourAssignedSubmissionInfo =
  "//*[contains(text(),'Search the submission ID from the email and click ')]";
//xpath, use cy.xpath
const CMSBullet1 =
  "//*[contains(text(),'Amendments to your Medicaid and CHIP State Plans.')]";
//xpath, use cy.xpath
const CMSBullet2 =
  "//*[text()='Official state responses to formal requests for additional information (RAIs) for SPAs.']";
//xpath, use cy.xpath
const CMSBullet3 =
  "//*[contains(text(),'Section 1915(b) waiver submissions.')]";
//xpath, use cy.xpath
const CMSBullet4 =
  "//*[contains(text(),'Section 1915(c) Appendix K amendments.')]";
//xpath, use cy.xpath
const CMSBullet5 =
  "//*[text()='Official state responses to formal requests for additional information (RAIs) for Section 1915(b) waiver actions.']";
//xpath, use cy.xpath
const CMSBullet6 =
  "//*[text()='State requests for Temporary Extensions for section 1915(b) and 1915(c) waivers.']";

export class oneMacHomePage {
  launch() {
    cy.visit("/");
  }

  verifyUserIsNotLoggedInOnLoginPage() {
    cy.wait(2000);
    cy.xpath(signInBtn)
      .should("be.visible")
      .xpath(welcomeMSG)
      .should("be.visible");
  }

  clicksignInBtn() {
    cy.xpath(signInBtn).click()
  }

  clickFAQPage() {
    cy.xpath(FAQPage).invoke('removeAttr', 'target').click()
  }

  verifyHomePageLinkExists() {
    cy.xpath(HomePageLink).should("be.visible");
  }

  verifyFAQLinkExists() {
    cy.xpath(FAQPage).should("be.visible");
  }

  verifyRegisterLinkExists() {
    cy.xpath(RegisterLink).should("be.visible");
  }

  verifyloginBTNExists() {
    cy.xpath(signInBtn).should("be.visible");
  }

  verifywelcomeMSGExists() {
    cy.xpath(welcomeMSG).should("be.visible");
  }

  verifystateUsersSectionExists() {
    cy.xpath(stateUsersSection).should("be.visible");
  }

  verifycmsUsersSectionExists() {
    cy.xpath(cmsUsersSection).should("be.visible");
  }

  verifydoYouHaveQuestionsOrNeedSupportExists() {
    cy.xpath(doYouHaveQuestionsOrNeedSupport).should("be.visible");
  }

  verifyviewFAQExists() {
    cy.xpath(viewFAQ).should("be.visible");
  }

  // STATE SECTION STARTS HERE
  verifyhowToCreateASubmissionExists() {
    cy.xpath(howToCreateASubmission).should("be.visible");
  }

  verifyloginWithIDMExists() {
    cy.xpath(loginWithIDM).should("be.visible");
  }

  verifyloginWithIDMInfoExists() {
    cy.xpath(loginWithIDMInfo).should("be.visible");
  }

  verifyAttachYourDocumentsExists() {
    cy.xpath(AttachYourDocuments).should("be.visible");
  }

  verifyAttachYourDocumentsInfoExists() {
    cy.xpath(AttachYourDocumentsInfo).should("be.visible");
  }

  verifyreceiveAnEmailConformationExists() {
    cy.xpath(receiveAnEmailConformation).should("be.visible");
  }

  verifyreceiveAnEmailConformationInfoExists() {
    cy.xpath(receiveAnEmailConformationInfo).should("be.visible");
  }

  verifysubmissionTypesIncludeExists() {
    cy.xpath(submissionTypesInclude).should("be.visible").and("have.length", 2);
  }
  verifyfirstBulletExists() {
    cy.xpath(firstBullet).should("be.visible");
  }
  verifySecondBulletExists() {
    cy.xpath(secondBullet).should("be.visible");
  }
  verifyThirdBulletExists() {
    cy.xpath(thirdBullet).should("be.visible");
  }
  verifyForthBulletExists() {
    cy.xpath(fourthBullet).should("be.visible");
  }
  verifyFifthBulletExists() {
    cy.xpath(fifthBullet).should("be.visible");
  }
  verifySixthBulletExists() {
    cy.xpath(sixthBullet).should("be.visible");
  }

  //CMS USERS SECTION
  verifyReceiveAnEmailForSubmissionNotificationExists() {
    cy.xpath(ReceiveAnEmailForSubmissionNotification).should("be.visible");
  }
  verifyReceiveAnEmailForSubmissionNotificationInfoExists() {
    cy.xpath(ReceiveAnEmailForSubmissionNotificationInfo).should("be.visible");
  }
  verifyloginWithEUAExists() {
    cy.xpath(loginWithEUA).should("be.visible");
  }
  verifyloginWithEUAInfoExists() {
    cy.xpath(loginWithEUAInfo).should("be.visible");
  }
  verifyReviewYourAssignedSubmissionExists() {
    cy.xpath(ReviewYourAssignedSubmission).should("be.visible");
  }
  verifyReviewYourAssignedSubmissionInfoExists() {
    cy.xpath(ReviewYourAssignedSubmissionInfo).should("be.visible");
  }
  verifyCMSBullet1Exists() {
    cy.xpath(CMSBullet1).should("be.visible");
  }
  verifyCMSBullet2Exists() {
    cy.xpath(CMSBullet2).should("be.visible");
  }
  verifyCMSBullet3Exists() {
    cy.xpath(CMSBullet3).should("be.visible");
  }
  verifyCMSBullet4Exists() {
    cy.xpath(CMSBullet4).should("be.visible");
  }
  verifyCMSBullet5Exists() {
    cy.xpath(CMSBullet5).should("be.visible");
  }
  verifyCMSBullet6Exists() {
    cy.xpath(CMSBullet6).should("be.visible");
  }
}
export default oneMacHomePage;
