const EmailInput = "#signInFormUsername";
const PasswordInput = "#signInFormPassword";
const LoginBtn = "form[name='cognitoSignInForm'] > input[name='signInSubmitButton']";

const DEFAULT_DEV_WORD = "MakoIsVeryPrivate1!";
const LOGIN_FIXTURE = `user-logins.json`;
const COGNITO_LOGIN_URLS = {
  "featureBranch" : "https://cypress-migration-login-6obldv312dgtlh7fthoq15i75l.auth.us-east-1.amazoncognito.com/",
  "devEnv" : "https://master-login-63rttgmcp5p2ngifisgh23k9o5.auth.us-east-1.amazoncognito.com"
}

export class oneMacDevLoginPage {
  loginAs(userRole, userStatus) {
    cy.origin(COGNITO_LOGIN_URLS.featureBranch, { args: { EmailInput, PasswordInput, LOGIN_FIXTURE, DEFAULT_DEV_WORD, LoginBtn, userRole, userStatus } }, ({ EmailInput, PasswordInput, LOGIN_FIXTURE, DEFAULT_DEV_WORD, LoginBtn, userRole, userStatus}) => {
      cy.fixture(LOGIN_FIXTURE).then(function (loginCredentials) {
        cy.get(EmailInput).type(loginCredentials[userRole][userStatus], { force: true });
        cy.get(PasswordInput).type(DEFAULT_DEV_WORD, { force: true });
        cy.get(LoginBtn).filter(':visible').click();
      });
    });
  }
  loginAsA11Y(userRole, userStatus) {
    cy.origin(COGNITO_LOGIN_URLS.featureBranch, { args: { EmailInput, PasswordInput, LOGIN_FIXTURE, DEFAULT_DEV_WORD, LoginBtn, userRole, userStatus } }, ({ EmailInput, PasswordInput, LOGIN_FIXTURE, DEFAULT_DEV_WORD, LoginBtn, userRole, userStatus}) => {
      cy.fixture(LOGIN_FIXTURE).then(function (loginCredentials) {
        cy.get(EmailInput).type(loginCredentials["State Submitter"]["Active"], { force: true });
        cy.get(PasswordInput).type(DEFAULT_DEV_WORD, { force: true });
        cy.get(LoginBtn).filter(':visible').click();
      });
    });
  }
}
export default oneMacDevLoginPage;
