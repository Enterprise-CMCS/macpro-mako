const myAccountDropDown = "#myAccountLink";
const manageProfileBTN = "#manageAccountLink";
//Element is Xpath use cy.xpath instead of cy.get
const userManagmentHeader = '//h1[contains(text(),"User Management")]';
const nameHeader = "#nameColHeader";
const stateHeader = "#stateColHeader";
const statusHeader = "#statusColHeader";
const roleHeader = "#roleColHeader";
const lastModifiedHeader = "#lastModifiedColHeader";
const modifiedByHeader = "#doneByNameColHeader";
//Element is Xpath use cy.xpath instead of cy.get
const homeTab = '//a[contains(text(),"Home")]';
const dashboardTab = "#packageListLink";
//Element is Xpath use cy.xpath instead of cy.get
const FAQTab = '//a[contains(text(),"FAQ")]';
const actionsHeader = "#personnelActionsColHeader";
const requestARoleBtn = "#requestRoleLink";

//Element is Xpath use cy.xpath instead of cy.get
const userNameValenciaM = "//td[text()='Valencia McMurray']";
const denyAccessBtn = "//div[@autofocus]//li[text()='Deny Access']";

export class oneMacUserManagmentPage {
  clickMyAccountDropDown() {
    cy.get(myAccountDropDown).click();
  }
  clickmanageProfileBTN() {
    cy.get(manageProfileBTN).click();
  }
  verifyRequestARoleChangeBtnExists() {
    cy.get(requestARoleBtn).should("be.visible");
  }
  clickRequestARoleChangeBtn() {
    cy.get(requestARoleBtn).click();
  }
  verifyRequestARoleChangeBtnDoesNotExist() {
    cy.get(requestARoleBtn).should("not.exist");
  }
  verifyWeAreOnUserManagmentPage() {
    cy.url().should("include", "/usermanagement");
  }
  clickPendingUserActionBtn() {
    cy.xpath(userNameValenciaM)
      .next("td")
      .find("button")
      .scrollIntoView({ easing: "linear" })
      .click();
  }
  isActionBtnPending() {
    cy.get('td:contains("Valencia McMurray")')
      .its("length")
      .then((num) => {
        console.log("num is " + (num > 2));
        return cy.wrap(num > 2);
      });
  }
  clickDenyAccessBtn() {
    cy.xpath(denyAccessBtn).click();
  }
  verifyUserManagmentHeaderIsDisplayed() {
    cy.xpath(userManagmentHeader).should("be.visible");
  }
  verifyNameHeaderIsDisplayed() {
    cy.get(nameHeader).should("be.visible");
  }
  verifyStateHeaderIsDisplayed() {
    cy.get(stateHeader).should("be.visible");
  }
  verifyStatusHeaderIsDisplayed() {
    cy.get(statusHeader).should("be.visible");
  }
  verifyRoleHeaderIsDisplayed() {
    cy.get(roleHeader).should("be.visible");
  }
  verifyLastModifiedHeaderIsDisplayed() {
    cy.get(lastModifiedHeader).should("be.visible");
  }
  verifyModifiedByHeaderIsDisplayed() {
    cy.get(modifiedByHeader).should("be.visible");
  }
  verifyHomeTabIsDisplayed() {
    cy.xpath(homeTab).should("be.visible");
  }
  verifyDashboardTabIsDisplayed() {
    cy.get(dashboardTab).should("be.visible");
  }
  verifyFAQTabIsDisplayed() {
    cy.xpath(FAQTab).should("be.visible");
  }
  verifyActionsHeaderIsDisplayed() {
    cy.get(actionsHeader).should("be.visible");
  }
}
export default oneMacUserManagmentPage;
