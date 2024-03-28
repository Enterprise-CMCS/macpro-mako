Feature: Verify user can withdraw a package in Under Review Status in the package dashboard
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Authority
        Then click the 1915c check box
        Then click on Authority
        Then click on Action Type
        Then click the Waiver Amendment check box
        Then click on Action Type
        Then click on Status
        Then click Under Review checkbox
        Then Click on the close Filter Button

    Scenario: Screen Enhance - Validate 1915C Appendix K Amendment Withdrawal Page from dashboard
        Then click the actions button in row one
        Then click withdraw package button
        Then verify the form title is "Withdraw Waiver"
        Then verify Form Intro Text is "Complete this action to withdraw this 1915(c) Appendix K Amendment package. Once completed, you will not be able to resubmit the 1915(c) Appendix K Amendment package or undo this action."
        Then verify ID Label is "Waiver Amendment Number"
        Then verify Authority is "1915(c) Appendix K Amendment"
        Then verify "Supporting Documentation" is an Attachment Type
        Then verify label "Additional Information" exists on page
        Then verify the submit button is disabled
        Then verify form cancel button exists
        Then click form cancel button
        Then click Return to form
        Then click form cancel button
        Then click Yes leave form button
        Then Click on My Account
        Then click the sign out button

    Scenario: Screen Enhance - Validate 1915C Appendix K Amendment Withdrawal Page from details page
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then click withdraw button
        Then verify the form title is "Withdraw Waiver"
        Then verify Form Intro Text is "Complete this action to withdraw this 1915(c) Appendix K Amendment package. Once completed, you will not be able to resubmit the 1915(c) Appendix K Amendment package or undo this action."
        Then verify ID Label is "Waiver Amendment Number"
        Then verify Authority is "1915(c) Appendix K Amendment"
        Then verify "Supporting Documentation" is an Attachment Type
        Then verify label "Additional Information" exists on page
        Then verify the submit button is disabled
        Then verify form cancel button exists
        Then click form cancel button
        Then click Return to form
        Then click form cancel button
        Then click Yes leave form button
        Then Click on My Account
        Then click the sign out button

    Scenario: Screen Enhance - Validate Form logic
        Then click the actions button in row one
        Then click withdraw package button
        Then verify the submit button is disabled
        Then into "Additional Information" type "Withdrawal test."
        Then verify the submit button is not disabled
        Then         attach "adobe.pdf" file to attachment 1

        Then verify the submit button is not disabled
        Then clear "Additional Information" input field
        Then verify the submit button is not disabled
        Then Click the Submit Button without waiting
        Then verify yes, withdraw package button exists
        Then click modal cancel button
        Then Click on My Account
        Then click the sign out button