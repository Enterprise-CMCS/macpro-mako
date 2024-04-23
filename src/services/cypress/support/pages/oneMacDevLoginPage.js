const EmailInput = "#signInFormUsername";
const PasswordInput = "#signInFormPassword";
const LoginBtn = "form[name='cognitoSignInForm'] > input[name='signInSubmitButton']";

const DEFAULT_DEV_WORD = "MakoIsVeryPrivate1!";
const LOGIN_FIXTURE = `user-logins.json`;

export class oneMacDevLoginPage {
  loginAs(userRole, userStatus) {
    cy.origin(Cypress.env('cognito_url'), { args: { EmailInput, PasswordInput, LOGIN_FIXTURE, DEFAULT_DEV_WORD, LoginBtn, userRole, userStatus } }, ({ EmailInput, PasswordInput, LOGIN_FIXTURE, DEFAULT_DEV_WORD, LoginBtn, userRole, userStatus}) => {
      cy.wait(500);
      cy.fixture(LOGIN_FIXTURE).then(function (loginCredentials) {
        cy.get(EmailInput).type(loginCredentials[userRole][userStatus], { force: true });
        cy.get(PasswordInput).type(DEFAULT_DEV_WORD, { force: true });
        cy.get(LoginBtn).filter(':visible').click();
      });
    });
  }
  loginAsA11Y() {
    let url = Cypress.env('cognito_url')
    console.log("the cognito url being used for this test is " + url);
    cy.origin(url, { args: { EmailInput, PasswordInput, LOGIN_FIXTURE, DEFAULT_DEV_WORD, LoginBtn } }, ({ EmailInput, PasswordInput, LOGIN_FIXTURE, DEFAULT_DEV_WORD, LoginBtn}) => {
      cy.fixture(LOGIN_FIXTURE).then(function (loginCredentials) {
        cy.get(EmailInput).type(loginCredentials["State Submitter"]["Active"], { force: true });
        cy.get(PasswordInput).type(DEFAULT_DEV_WORD, { force: true });
        cy.get(LoginBtn).filter(':visible').click();
      });
    });
  }
}
export default oneMacDevLoginPage;
