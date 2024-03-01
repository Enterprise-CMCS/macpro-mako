Feature: Verify user can withdraw a package in Under Review Status in the package dashboard
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then Click on Filter Button
        Then click on Status
        Then click Under Review checkbox
        Then click on Type
        Then click Medicaid SPA check box
        Then Click on the close Filter Button

    Scenario: Screen Enhance - Validate Medicaid Withdrawal Page from dashboard
        Then click the actions button in row one
        Then click withdraw package button
        Then verify the page header is "Withdraw Medicaid SPA Package"
        Then verify Form Intro Text is "Complete this form to withdraw a package. Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
        Then verify ID Label is "Package ID"
        Then verify Type is "Medicaid SPA"
        Then verify "Upload Supporting Documentation" is an Attachment Type
        Then verify label "Additional Information" exists on page
        Then verify the submit button is disabled
        Then verify form cancel button exists
        Then click form cancel button
        Then click Return to form
        Then click form cancel button
        Then click Yes leave form button
        Then Click on My Account
        Then click the sign out button

    Scenario: Screen Enhance - Validate Medicaid Withdrawal Page from details page
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then click withdraw button
        Then verify the form title is "Withdraw Medicaid SPA Package"
        Then verify Form Intro Text is "Complete this form to withdraw a package. Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
        Then verify ID Label is "Package ID"
        Then verify Type is "Medicaid SPA"
        Then verify "Upload Supporting Documentation" is an Attachment Type
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
        Then attach "adobe.pdf" file to attachment 1
        Then verify the submit button is not disabled
        Then clear "Additional Information" input field
        Then verify the submit button is not disabled