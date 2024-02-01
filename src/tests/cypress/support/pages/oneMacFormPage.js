const submitBTN = "#form-submission-button";
const cancelBTN = "#form-cancel-button";
const idElement = "#componentId";
const parentIdElement = "#parent-componentId";
const packageFormPt2ErrorMsg = "#componentIdStatusMsg1";
const typeHeader = "//h3[text()='Type']";

const modalContainer = "#react-aria-modal-dialog";
const modalTitle = "#dialog-title";
const modalText = "#dialog-content";
const modalCancelBTN =
  "//*[@id='react-aria-modal-dialog']//button[text()='Cancel']";
const attachmentInfoDescription =
  "//h3[text()='Attachments']/following-sibling::p[1]";
const enterMmdlBtn = "//button[contains(text(),'Enter the MMDL system')]";
const enterMacProBtn = "//button[contains(text(),'Enter the MACPro system')]";

const IDInputBox = idElement;
const errorMessageID = "#componentIdStatusMsg0";
const errorMessageLine2ID = "#componentIdStatusMsg1";
const parentIDInputBox = "#parent-componentId";
const errorMessageParentID = "#parent-componentIdStatusMsg0";
const waiverAuthorityLabel = "//h3[text()='Waiver Authority']";
const amendmentTitleField = "#title";
const tempExtensionTypeHeader =
  "//h3[contains(text(),'Temporary Extension Type')]";
const tempExtensionTypeBtn = "#temp-ext-type";
const formIntroElement = "#form-intro";

const labelElementFromLabel = {
  "Additional Information": "#additional-information-label",
};
const elementFromLabel = {
  // Different forms may have different labels for the ID field
  "SPA ID": idElement,
  "Temporary Extension Request Number": idElement,
  "Initial Waiver Number": idElement,
  "1915(b) Waiver Amendment Number": idElement,
  "1915(b) Waiver Renewal Number": idElement,
  "Existing Waiver Number to Renew": parentIdElement,
  "Existing Waiver Number to Amend": parentIdElement,
  "Additional Information": "#additional-information",
};
const errorMessageLine1FromLabel = {
  "SPA ID": "#componentIdStatusMsg0",
  "Temporary Extension Request Number": "#componentIdStatusMsg0",
  "Initial Waiver Number": "#componentIdStatusMsg0",
  "1915(b) Waiver Renewal Number": "#componentIdStatusMsg0",
  "1915(b) Waiver Amendment Number": "#componentIdStatusMsg0",
  "Existing Waiver Number to Renew": "#parent-componentIdStatusMsg0",
  "Existing Waiver Number to Amend": "#parent-componentIdStatusMsg0",
};
const errorMessageLine2FromLabel = {
  "SPA ID": "#componentIdStatusMsg1",
  "Temporary Extension Request Number": "#componentIdStatusMsg1",
  "Initial Waiver Number": "#componentIdStatusMsg1",
  "1915(b) Waiver Renewal Number": "#componentIdStatusMsg1",
  "1915(b) Waiver Amendment Number": "#componentIdStatusMsg1",
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
  "Proposed Effective Date of Medicaid SPA": "#proposed-effective-date",
  "Proposed Effective Date of CHIP SPA": "#proposed-effective-date",
  "Proposed Effective Date of 1915(b) Initial Waiver":
    "#proposed-effective-date",
  "Proposed Effective Date of 1915(b) Waiver Renewal":
    "#proposed-effective-date",
  "Proposed Effective Date of 1915(b) Waiver Amendment":
    "#proposed-effective-date",
  "Proposed Effective Date of 1915(c) Appendix K Amendment":
    "#proposed-effective-date",
};

//internal function for proposed effective date
function caculateMonthsInFuture(numMonths) {
  var t = new Date();
  t.setMonth(t.getMonth() + Number(numMonths));
  return `${t.toISOString().slice(0, 10)}`;
}

export class oneMacFormPage {
  verifyInputHeaderIs(inputHeader) {
    cy.get(labelElementFromLabel[inputHeader])
      .should("be.visible")
      .contains(inputHeader);
  }
  clearInput(whereTo) {
    cy.get(elementFromLabel[whereTo]).clear();
  }
  inputInto(whereTo, newValue) {
    cy.get(elementFromLabel[whereTo]).type(newValue);
  }
  verifyPrefill(whereTo) {
    cy.xpath(`//h3[text()='${whereTo}']`)
      .next("div")
      .contains(/^(?!\s*$).+/);
  }
  verifyErrorMessagesAreNotThere(whichLabel) {
    cy.get(errorMessageLine1FromLabel[whichLabel]).should("not.exist");
    cy.get(errorMessageLine2FromLabel[whichLabel]).should("not.exist");
  }
  verifyErrorMessageContains(whichLabel, whichLine, errorMessage) {
    const errorMessageElement =
      whichLine === "2"
        ? cy.get(errorMessageLine2FromLabel[whichLabel])
        : cy.get(errorMessageLine1FromLabel[whichLabel]);

    errorMessageElement.should("be.visible").contains(errorMessage);
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
      .contains(linkLabel)
      .invoke("attr", "href")
      .then((href) => {
        cy.visit(href);
      });
  }
  inputID(anId) {
    cy.get(IDInputBox).type(anId);
  }
  clearIDInputBox() {
    cy.get(IDInputBox).clear();
  }
  verifyIDLabelIs(idLabel) {
    elementFromLabel[idLabel] === idElement &&
      cy.xpath(`//h3[text()='${idLabel}']`).should("be.visible");
  }
  verifyIDErrorMessageIsNotDisplayed() {
    cy.get(errorMessageID).should("not.exist");
  }
  verifyIDErrorMessageContains(errorMessage) {
    cy.get(errorMessageID).should("be.visible");
    cy.get(errorMessageID).contains(errorMessage);
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
  verifyTypeIs(s) {
    cy.xpath(typeHeader).next().contains(s);
  }
  verifyWaiverAuthorityContains(whatAuthority) {
    cy.xpath(waiverAuthorityLabel).next("div").contains(whatAuthority);
  }
  addMonthsTo(whichDate, numMonths) {
    cy.get(dateElementsFromLabel[whichDate]).type(
      caculateMonthsInFuture(numMonths)
    );
  }
  selectWaiverAuthority(whichAuthority) {}
  verifyTempExtensionType(whatType) {
    cy.xpath(tempExtensionTypeHeader).next("div").contains(whatType);
  }
  selectTempExtensionType(whatType) {
    cy.get(tempExtensionTypeBtn).select(whatType);
  }
  uploadAttachment(fileName, attachmentIndex) {
    const addFileBTN = `//tbody/tr[${attachmentIndex}]/td[2]/label[1]`;
    const innerBTN = `#uploader-input-${attachmentIndex - 1}`;
    const filePath = `/files/${fileName}`;

    cy.xpath(addFileBTN).click();
    cy.get(innerBTN).attachFile(filePath);
  }
  removeFirstAttachment(attachmentIndex) {
    const closeBTNXPath = `//*[@id="main"]/div[2]/div[2]/form/div[3]/div/table/tbody/tr[${attachmentIndex}]/td[3]/div[1]/button`;

    cy.xpath(closeBTNXPath).click();
  }
  clicksubmitBTN() {
    cy.get(submitBTN).click();
    cy.wait(8000);
  }
  clicksubmitBTNWithoutWait() {
    cy.get(submitBTN).click();
  }
  verifySubmitBtnIsNotDisabled() {
    cy.get(submitBTN).should("not.be.disabled");
  }
  verifySubmitBtnIsDisabled() {
    cy.get(submitBTN).should("be.disabled");
  }
  verifyCancelBtnExists() {
    cy.get(cancelBTN).scrollIntoView().should("be.visible");
  }
  clickCancelBtn() {
    cy.get(cancelBTN).scrollIntoView().click();
  }
  clickModalCancelBtn() {
    cy.xpath(modalCancelBTN).click();
  }
  verifyErrorMsgContains(s) {
    cy.get(packageFormPt2ErrorMsg).contains(s);
  }
  verifyAttachmentInfoDecription() {
    cy.xpath(attachmentInfoDescription)
      .contains("Maximum file size of")
      .contains("You can add multiple files per attachment type");
  }
  verifyAttachmentInfoLinkFor(packageType) {
    switch (packageType) {
      case "Medicaid SPA":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/FAQ#medicaid-spa-attachments");
        break;
      case "Medicaid RAI":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/FAQ#medicaid-spa-rai-attachments");
        break;
      case "CHIP SPA":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/FAQ#chip-spa-attachments");
        break;
      case "CHIP RAI":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/FAQ#chip-spa-rai-attachments");
        break;
      case "1915b Waiver":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/FAQ#waiverb-attachments");
        break;
      case "Temp Extension":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/FAQ#waiverb-extension-attachments");
        break;
      case "Appendix K":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/FAQ#appk-attachments");
        break;
      case "Waiver RAI":
        cy.xpath(attachmentInfoDescription)
          .find("a")
          .should("have.attr", "href", "/FAQ#waiverb-rai-attachments");
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
    cy.get(formIntroElement).should("be.visible").contains(introText);
  }
  verifyAttachmentType(attachmentType) {
    cy.xpath(`//h3[text()='${attachmentType}']`).should("be.visible");
  }
}
export default oneMacFormPage;
