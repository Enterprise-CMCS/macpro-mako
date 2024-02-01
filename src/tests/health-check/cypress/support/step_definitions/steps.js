import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import oneMacHomePage from "../pages/oneMacHomePage";
const OneMacHomePage = new oneMacHomePage();

Given("I navigate to the Login Page", () => {
  OneMacHomePage.launch();
});

When("the page loads", () => {
  OneMacHomePage.pageHasLoaded();
});
Then("I am on the home page and not logged in", () => {
  OneMacHomePage.verifyUserIsNotLoggedInOnHomePage();
});
