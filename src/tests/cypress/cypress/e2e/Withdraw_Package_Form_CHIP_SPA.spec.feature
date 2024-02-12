Feature: Verify user can withdraw a package in Under Review Status in the package dashboard
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click on Packages
        Then Click on Filter Button
        Then click on Status

        Then click Under Review checkbox
        Then click on Type

        Then click CHIP SPA check box

    Scenario: Screen Enhance - Validate CHIP Withdrawal Page from the dashboard
        Then click the actions button in row one
        Then click withdraw package button
        Then verify the form title is "Withdraw CHIP SPA Package"
        Then verify Form Intro Text is "Complete this action to withdraw this CHIP SPA package. Once completed, you will not be able to resubmit the CHIP SPA package or undo this action."
        Then verify ID Label is "SPA ID"
        Then verify Type is "CHIP SPA"
        Then verify "Upload Supporting Documentation" is an Attachment Type
        Then verify label "Additional Information" exists on page
        Then verify the submit button is disabled
        Then verify form cancel button exists
        Then click form cancel button
        Then click Stay on Page
        Then click form cancel button
        Then click Leave Anyway form button

    Scenario: Screen Enhance - Validate CHIP Withdrawal Page from the details page
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then click withdraw button
        Then verify the form title is "Withdraw CHIP SPA Package"
        Then verify Form Intro Text is "Complete this action to withdraw this CHIP SPA package. Once completed, you will not be able to resubmit the CHIP SPA package or undo this action."
        Then verify ID Label is "SPA ID"
        Then verify Type is "CHIP SPA"
        Then verify "Upload Supporting Documentation" is an Attachment Type
        Then verify label "Additional Information" exists on page
        Then verify the submit button is disabled
        Then verify form cancel button exists
        Then click form cancel button
        Then click Stay on Page
        Then click form cancel button
        Then click Leave Anyway form button

    Scenario: Screen Enhance - Validate Form logic
        Then click the actions button in row one
        Then click withdraw package button
        Then into "Additional Information" type "Withdrawal test."
        Then verify the submit button is disabled
        Then         attach "adobe.pdf" file to attachment 1

        Then verify the submit button is not disabled
        Then clear "Additional Information" input field
        Then verify the submit button is not disabled
        Then Click the Submit Button without waiting
        Then verify yes, withdraw package button exists
        Then click modal cancel button

# Scenario: Demonstrate withdraw package for CHIP SPA in Under Review Status
#     Then         attach "adobe.pdf" file to attachment 1

#     Then verify the submit button is not disabled
#     Then Click the Submit Button without waiting
#     Then click yes, withdraw package button