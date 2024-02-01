//These elements are css and use cy.get
const groupDropdown = "#group-select";
const modal = "#react-aria-modal-dialog";

//These elements are xpath and use cy.xpath instead of cy.get
const selectTheRoleText =
  "//legend[contains(text(),'Select the role for which you are registering.')]";
const stateSubmitterRoleBtn =
  "//a[@href='/signup/state']//div[contains(text(),'State Submitter')]";
const SSARoleBtn =
  "//a[@href='/signup/state']//div[contains(text(),'State System Admin')]";
const userRoleHeader = "//div[@class='signup-headings']//p[@class='user-role']";
const errorMsg = "//div[@class='multi-select-error-message']";
const submitBtn = "//button[contains(text(),'Submit')]";
const cancelBtn = "//button[text()='Cancel']";
const stayOnPageBtn = "//button[text()='Stay on Page']";
const confirmBtn = "//button[text()='Confirm']";
const CMSReviewerRoleBtn =
  "//a[@href='/signup/cmsreviewer']//div[contains(text(),'CMS Reviewer')]";
const CMSRoleApproverBtn =
  "//a[@href='/usermanagement']//div[contains(text(),'CMS Role Approver')]";

export class oneMacRequestARoleChangePage {
  verifySelectTheRoleTextExists() {
    cy.xpath(selectTheRoleText).should("be.visible");
  }
  clickStateSubmitterRoleBtn() {
    cy.xpath(stateSubmitterRoleBtn).click();
  }
  verifyStateSubmitterRoleBtnExists() {
    cy.xpath(stateSubmitterRoleBtn).should("be.visible");
  }
  clickSSARoleBtn() {
    cy.xpath(SSARoleBtn).click();
  }
  verifySSARoleBtnExists() {
    cy.xpath(SSARoleBtn).should("be.visible");
  }
  verifyUserRoleHeaderIs(roleName) {
    cy.xpath(userRoleHeader).contains(roleName);
  }
  verifyErrorMessageTextIs(string) {
    cy.xpath(errorMsg).contains(string);
  }
  verifySubmitBtnIsDisabled() {
    cy.xpath(submitBtn).should("be.disabled");
  }
  verifySubmitBtnIsDisabledViaClass() {
    cy.xpath(submitBtn).should("have.class", "ds-c-button--disabled");
  }
  verifySubmitBtnIsEnabled() {
    cy.xpath(submitBtn).should("not.be.disabled");
  }
  clickStateForStateAccess(state) {
    cy.get('input[role="combobox"]').type(state).type("{enter}");
  }
  verifyErrorMsgDoesNotExist() {
    cy.xpath(errorMsg).should("not.exist");
  }
  clickCancelBtn() {
    cy.xpath(cancelBtn).click();
  }
  verifyCancelBtnIsEnabled() {
    cy.xpath(cancelBtn).should("be.enabled");
  }
  clickStayOnPageBtn() {
    cy.xpath(stayOnPageBtn).click();
  }
  clickConfirmBtn() {
    cy.xpath(confirmBtn).click();
  }
  clickCMSReviewerRoleBtn() {
    cy.xpath(CMSReviewerRoleBtn).click();
  }
  verifyCMSReviewerRoleBtnExists() {
    cy.xpath(CMSReviewerRoleBtn).should("be.visible");
  }
  clickCMSRoleApproverBtn() {
    cy.xpath(CMSRoleApproverBtn).click();
  }
  verifyCMSRoleApproverBtnExists() {
    cy.xpath(CMSRoleApproverBtn).should("be.visible");
  }
  verifyGroupDropdownExists() {
    cy.get(groupDropdown).should("be.visible");
  }
}
export default oneMacRequestARoleChangePage;
