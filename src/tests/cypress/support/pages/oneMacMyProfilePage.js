const profileInformation = "#profileInfoHeader";
//Element is Xpath use cy.xpath instead of cy.get
const fullNameHeader = '//h3[contains(text(),"Full Name")]';
//Element is Xpath use cy.xpath instead of cy.get
const roleHeader = '//h3[contains(text(),"Role")]';
//Element is Xpath use cy.xpath instead of cy.get
const emailHeader = '//h3[contains(text(),"Email")]';
//Element is Xpath use cy.xpath instead of cy.get
const phoneNumberHeader = '//span[contains(text(),"Phone Number")]';
const phoneNumberAddBTN = "#addButton";
const statusHeader = "#accessHeader";
const accessStatus = '//em[contains(text(),"Access Granted")]';
const accessStatusDenied = '//em[contains(text(),"Access Denied")]';
const accessStatusRevoked = '//em[contains(text(),"Access Revoked")]';

export class oneMacMyProfilePage {
  verifyProfileInformationIsDisplayed() {
    cy.get(profileInformation).should("be.visible");
  }

  verifyWeAreOnMyProfilePage() {
    cy.url().should("include", "/profile");
  }

  verifyFullNameHeader() {
    cy.xpath(fullNameHeader).should("be.visible");
  }
  verifyFullName() {
    cy.xpath(fullNameHeader).next("div").should("be.visible");
  }
  verifyRoleHeader() {
    cy.xpath(roleHeader).should("be.visible");
  }
  verifyRole() {
    cy.xpath(roleHeader).next("div").should("be.visible");
  }
  verifyEmailHeader() {
    cy.xpath(emailHeader).should("be.visible");
  }
  verifyEmail() {
    cy.xpath(emailHeader).next("div").should("be.visible");
  }
  verifyPhoneNumberHeader() {
    cy.xpath(phoneNumberHeader).should("be.visible");
  }
  verifyPhoneNumberAddBTN() {
    cy.get(phoneNumberAddBTN).should("be.visible");
  }
  verifyStatusHeader() {
    cy.get(statusHeader).should("be.visible");
  }
  verifyStatusHeaderDoesNotExist() {
    cy.get(statusHeader).should("not.exist");
  }
  verifyAccessStatus() {
    cy.xpath(accessStatus).should("be.visible");
  }
}
export default oneMacMyProfilePage;
