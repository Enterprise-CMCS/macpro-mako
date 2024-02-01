Feature: OY2-11159 Case sensitive emails causing login error
    Scenario: Verify user is able to login with all lowercase and manipulate url for email to mixedcase and all uppercase characters
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then i am on Dashboard Page
        Then navigate to "/profile/statesubmitter@nightwatch.test"
        Then Actual Full Name is Displayed
        Then navigate to "/profile/STATESUBMITTER@NIGHTWATCH.TEST"
        Then Actual Full Name is Displayed
        Then navigate to "/profile/staTEsubmiTTeR@nightwatch.test"
        Then Actual Full Name is Displayed