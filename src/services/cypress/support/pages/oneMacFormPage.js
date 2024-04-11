const submitBTN = "//button[text()='Submit']";
const cancelBTN = "//button[text()='Cancel']";
const idElement = "[name='id']";
const parentIdElement = "[name='waiverNumber']";
const packageFormPt2ErrorMsg = "#componentIdStatusMsg1";
const authorityHeader = "//label[text()='Authority']";

const modalContainer = "#react-aria-modal-dialog";
const modalTitle = "#dialog-title";
const modalText = "#dialog-content";
const modalCancelBTN =
  "//*[@id='react-aria-modal-dialog']//button[text()='Cancel']";
const attachmentInfoDescription = "//p[contains(text(), 'Maximum file size of 80 MB per attachment')]";
const enterMmdlBtn = "//button[contains(text(),'Enter the MMDL system')]";
const enterMacProBtn = "//button[contains(text(),'Enter the MACPro system')]";

const IDInputBox = idElement;
const errorMessageID = "p[id*='form-item-message']";
const errorMessageLine2ID = "#componentIdStatusMsg1";
const parentIDInputBox = "#parent-componentId";
const errorMessageParentID = "#parent-componentIdStatusMsg0";
const waiverAuthorityLabel = "//label[text()='Waiver Authority']";
const amendmentTitleField = "[name=title]";
const tempExtensionTypeHeader =
  "//*[contains(text(),'Temporary Extension Type')]";
const tempExtensionTypeBtn = "//button//*[contains(text(), 'select a temporary extension type')]";
const formIntroElement = "form p";
const returnToFormBtn = "//*[@role='dialog']//button[text()='Return to form']";
const labelElementFromLabel = {
  "Additional Information": "//*[contains(text(),'Additional Information')]",
};
const elementFromLabel = {
  // Different forms may have different labels for the ID field
  "SPA ID": idElement,
  "Approved Initial or Renewal Waiver Number": "[name=originalWaiverNumber]",
  "Temporary Extension Request Number": idElement,
  "Initial Waiver Number": idElement,
  "1915(b) Waiver Amendment Number": idElement,
  "1915(b) Waiver Renewal Number": idElement,
  "Existing Waiver Number to Renew": parentIdElement,
  "Existing Waiver Number to Amend": parentIdElement,
  "Additional Information": "textarea[name='additionalInformation']",
  "Subject": "[name='subject']",
  "Description": "[name='description']",
  "Appendix K ID": "[placeholder]",
};
const errorMessageLine1FromLabel = {
  "SPA ID": idElement,
  "Temporary Extension Request Number": idElement,
  "Initial Waiver Number": idElement,
  "1915(b) Waiver Renewal Number": idElement,
  "1915(b) Waiver Amendment Number": idElement,
  "Existing Waiver Number to Renew": parentIdElement,
  "Existing Waiver Number to Amend": parentIdElement,
  "Approved Initial or Renewal Waiver Number": "[name='originalWaiverNumber']",
  "first attachment": ".space-y-2:nth-of-type(2) input[type='file']",
  "second attachment": ".space-y-2:nth-of-type(3) input[type='file']",
  "Proposed Effective Date": "form [class*='space-y-2'] button svg"
};
const errorMessageLine2FromLabel = {
  "SPA ID": idElement,
  "Temporary Extension Request Number": idElement,
  "Initial Waiver Number": idElement,
  "1915(b) Waiver Renewal Number": idElement,
  "1915(b) Waiver Amendment Number": idElement,
};
const hintTextFromLabel = {
  "SPA ID": "#fieldHint0",
  "Temporary Extension Request Number": "#fieldHint0",
  "Initial Waiver Number": "#fieldHint0",
  "1915(b) Waiver Renewal Number": "#fieldHint0",
  "1915(b) Waiver Amendment Number": "#fieldHint0",
  "Existing Waiver Number to Renew": "#parent-fieldHint0",
  "Existing Waiver Number to Amend": "#parent-fieldHint0",
};
const dateElementsFromLabel = {
  "Proposed Effective Date of Medicaid SPA": "//button//*[text()='Pick a date']",
  "Proposed Effective Date of CHIP SPA": "//button//*[text()='Pick a date']",
  "Proposed Effective Date of 1915(b) Initial Waiver":
    "//button//*[text()='Pick a date']",
  "Proposed Effective Date of 1915(b) Waiver Renewal":
    "//button//*[text()='Pick a date']",
  "Proposed Effective Date of 1915(b) Waiver Amendment":
    "//button//*[text()='Pick a date']",
  "Proposed Effective Date of 1915(c) Appendix K Amendment":
    "//button//*[text()='Pick a date']",
};
const nextMonthDatePickerBtn = "button[name='next-month']";
const lastMonthDatePickerBtn = "button[name='previous-month']";
const dayDatePickerBtn = "button[name='day']";
const addFileBTN = "input[type='file']";

const submissionModal = "*[role='dialog'][data-state='open']";
const goToDashBoardBtn = "//button[text()='Go to Dashboard']";

const withdrawLabel = "#package-id-label";

const stateSelectBtn = "button[role='combobox']";
const formErrorAlert = "form [role=alert]";
export class oneMacFormPage {
  verifyInputHeaderIs(inputHeader) {
    cy.xpath(labelElementFromLabel[inputHeader])
      .should("be.visible")
      .contains(inputHeader);
  }
  clearInput(whereTo) {
    cy.get(elementFromLabel[whereTo]).clear();
  }
  inputInto(whereTo, newValue) {
    cy.get(elementFromLabel[whereTo]).type(newValue, { delay: 100 });
  }
  verifyPrefill(whereTo) {
    cy.xpath(`//*[text()='${whereTo}']`)
      .next()
      .contains(/^(?!\s*$).+/);
  }
  verifyErrorMessagesAreNotThere(whichLabel) {
    cy.get(errorMessageLine1FromLabel[whichLabel]).parent().next(errorMessageID).should("not.exist");
  }
  verifyErrorMessageContains(whichLabel, whichLine, errorMessage) {
    const errorMessageElement =
      whichLine === "2"
        ? cy.get(errorMessageLine2FromLabel[whichLabel]).parent().next(errorMessageID).should("be.visible")
        : cy.get(errorMessageLine1FromLabel[whichLabel]).parent().next(errorMessageID).should("be.visible");

    errorMessageElement.should("be.visible").contains(errorMessage);
  }
  verifyFormErrorMessageContains(errorMessage){
    cy.get(formErrorAlert).first().should("be.visible").and("contain", errorMessage);
  }
  verifyHintTextContains(whichLabel, hintText) {
    const hintTextElement = cy.get(hintTextFromLabel[whichLabel]);

    hintTextElement.should("be.visible");
    hintTextElement.contains(hintText);
  }
  verifyPageHeader(inPageHeader) {
    cy.get("h1").contains(inPageHeader);
  }
  verifyFormTitle(inFormTitle) {
    cy.get("h2").contains(inFormTitle);
  }
  inputAmendmentTitle(s) {
    cy.get(amendmentTitleField).type(s);
  }
  clickLinkWithLabel(linkLabel) {
    cy.get("a:visible")
      .contains(linkLabel).invoke('removeAttr', 'target').click();
  }
  inputID(anId) {
    cy.get(IDInputBox).type(anId, { delay: 200 });
  }
  clearIDInputBox() {
    cy.get(IDInputBox).clear();
  }
  verifyIDLabelIs(label) {
    cy.get(withdrawLabel).should("be.visible").and("contain", label);
  }
  verifyIDErrorMessageIsNotDisplayed() {
    cy.get(idElement).parent().next(errorMessageID).should("not.exist");
  }
  verifyIDErrorMessageContains(errorMessage) {
    cy.get(idElement).parent().next(errorMessageID).should("exist");
    cy.get(idElement).parent().next(errorMessageID).contains(errorMessage);
  }
  verifyIDErrorMessage2Contains(errorMessage) {
    cy.get(errorMessageLine2ID).should("be.visible");
    cy.get(errorMessageLine2ID).contains(errorMessage);
  }
  inputParentID(anId) {
    cy.get(parentIDInputBox).type(anId);
  }
  clearParentIDInputBox() {
    cy.get(parentIDInputBox).clear();
  }
  verifyParentIDErrorMessageIsNotDisplayed() {
    cy.get(errorMessageParentID).should("not.exist");
  }
  verifyParentIDErrorMessageContains(errorMessage) {
    cy.get(errorMessageParentID).should("be.visible");
    cy.get(errorMessageParentID).contains(errorMessage);
  }
  verifyAuthorityIs(s) {
    cy.xpath(authorityHeader).next().contains(s);
  }
  verifyWaiverAuthorityContains(whatAuthority) {
    cy.xpath(waiverAuthorityLabel).next().contains(whatAuthority);
  }
  addMonthsTo(whichDate, numMonths) {
    cy.xpath(dateElementsFromLabel[whichDate]).then(($datePicker) => {
      cy.wrap($datePicker).click()
      for (let i = 0; i < numMonths; i++) {
        cy.get(nextMonthDatePickerBtn).click();
      }
    })

    const aday = Math.floor(Math.random() * 29) + 1;
    cy.get(dayDatePickerBtn).filter(":contains(" + aday + ")").first().click()

  }
  verifyTempExtensionType(whatType) {
    cy.xpath(tempExtensionTypeHeader).next("div").contains(whatType);
  }
  selectTempExtensionType(whatType) {
    cy.xpath(tempExtensionTypeBtn).parent("button").click().next().select(whatType, { force: true });
  }
  uploadAttachment(fileName, attachmentIndex) {
    // const innerBTN = `#uploader-input-${attachmentIndex - 1}`;
    const filePath = `/files/${fileName}`;

    cy.get(addFileBTN).eq(attachmentIndex - 1).attachFile(filePath);
  }
  removeFirstAttachment(attachmentIndex) {
    const closeBTNXPath = `//*[@id="main"]/div[2]/div[2]/form/div[3]/div/table/tbody/tr[${attachmentIndex}]/td[3]/div[1]/button`;

    cy.xpath(closeBTNXPath).click();
  }
  clicksubmitBTN() {
    cy.xpath(submitBTN).click();
    cy.wait(8000);
  }
  clicksubmitBTNWithoutWait() {
    cy.xpath(submitBTN).click();
  }
  verifySubmitBtnIsNotDisabled() {
    cy.xpath(submitBTN).should("not.be.disabled");
  }
  verifySubmitBtnIsDisabled() {
    cy.xpath(submitBTN).should("be.disabled");
  }
  verifyCancelBtnExists() {
    cy.xpath(cancelBTN).scrollIntoView().should("be.visible");
  }
  clickCancelBtn() {
    cy.xpath(cancelBTN).scrollIntoView().click();
  }
  clickModalCancelBtn() {
    cy.xpath(modalCancelBTN).click();
  }
  clickReturnToFormBtn() {
    cy.xpath(returnToFormBtn).click({ force: true });
  }
  verifyErrorMsgContains(s) {
    cy.get(packageFormPt2ErrorMsg).contains(s);
  }
  verifyAttachmentInfoDecription() {
    cy.xpath(attachmentInfoDescription)
      .contains("Maximum file size of 80 MB")
      .contains("You can add multiple files per attachment type");
  }
  verifyAttachmentInfoLinkFor(packageType) {
    switch (packageType) {
      case "Medicaid SPA":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/faq/medicaid-spa-attachments");
        break;
      case "Medicaid RAI":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/faq/medicaid-spa-rai-attachments");
        break;
      case "CHIP SPA":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/faq/chip-spa-attachments");
        break;
      case "CHIP RAI":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/faq/#chip-spa-rai-attachments");
        break;
      case "1915b Waiver":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/faq/#waiverb-attachments");
        break;
      case "Temp Extension":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/faq/#waiverb-extension-attachments");
        break;
      case "Appendix K":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/faq/#appk-attachments");
        break;
      case "Waiver RAI":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/faq/#waiverb-rai-attachments");
        break;
    }
  }

  verifyMmdlSystemBtn() {
    cy.xpath(enterMmdlBtn).should("be.visible");
    cy.xpath(enterMmdlBtn)
      .parent("a")
      .should(
        "have.attr",
        "href",
        "https://wms-mmdl.cms.gov/MMDL/faces/portal.jsp"
      );
  }
  verifyMacProSystemBtn() {
    cy.xpath(enterMacProBtn).should("be.visible");
    cy.xpath(enterMacProBtn)
      .parent("a")
      .should(
        "have.attr",
        "href",
        "https://www.medicaid.gov/resources-for-states/medicaid-and-chip-program-macpro-portal/index.html#MACPro"
      );
  }
  clickButtonLabelled(buttonLabel) {
    cy.xpath(`//button[contains(text(),'${buttonLabel}')]`).click();
  }
  verifyModalContainerExists() {
    cy.get(modalContainer).should("be.visible");
  }
  verifyModalContainerDoesNotExists() {
    cy.get(modalContainer).should("not.exist");
  }
  verifyModalTitleIs(s) {
    cy.get(modalTitle).contains(s);
  }
  verifyModalTextIs(s) {
    cy.get(modalText).contains(s);
  }
  verifyFormIntro(introText) {
    cy.get(formIntroElement).find("Complete").should("be.visible").contains(introText);
  }
  verifyAttachmentType(attachmentType) {
    cy.xpath(`//label[text()='${attachmentType}']`).should("be.visible");
  }
  verifySuccessMessageIsDisplayedInModal() {
    cy.get(submissionModal).contains("Submission Successful");
  }
  clickGoToDashBoardBtn() {
    cy.xpath(goToDashBoardBtn).click();
  }
  setStateSelectBtn(state) {
    cy.get(stateSelectBtn).focus().type(state);
  }
}
export default oneMacFormPage;
