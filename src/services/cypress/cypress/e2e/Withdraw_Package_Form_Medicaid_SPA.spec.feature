Feature: Verify user can withdraw a Medicaid SPA package in Under Review Status in the package dashboard
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then click on "State Plan Amendment (SPA)" choice
        Then click on "Medicaid SPA" choice
        Then click on "All Other Medicaid SPA Submissions" choice

    Scenario: Validate Medicaid SPA Withdrawal Page from dashboard
        Then type the generated "Medicaid SPA" Number 2 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of Medicaid SPA" to 3 months from today
        Then attach "file.docx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This Medicaid SPA package was created by the test automation."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then verify the SPAs tab is selected
        Then search for the generated "Medicaid SPA" Number 2
        Then verify the id number in the first row matches the generated "Medicaid SPA" Number 2
        Then click the actions button in row one
        Then click withdraw package button
        Then verify the form is titled "Withdraw Medicaid SPA Package"
        Then verify ID Label is "Package ID"
        Then verify Authority is "Medicaid SPA"
        Then verify "Supporting Documentation" is an Attachment Type
        Then verify label "Additional Information" exists on page
        Then verify form cancel button exists
        Then click form cancel button
        Then click Return to form
        Then Click the Submit Button without waiting
        Then click yes, withdraw package button without waiting
        Then verify the form error message is "An Attachment or Additional Information is required."
        Then into "Additional Information" type "This Medicaid SPA package was withdrawn by the test automation."
        Then Click the Submit Button without waiting
        Then click yes, withdraw package button
        Then verify the message in the alert bar is "Package withdrawn"

    Scenario: Validate Medicaid SPA Withdrawal Page from details page
        Then type the generated "Medicaid SPA" Number 3 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of Medicaid SPA" to 3 months from today
        Then attach "file.docx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This Medicaid SPA package was created by the test automation."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then verify the SPAs tab is selected
        Then search for the generated "Medicaid SPA" Number 3
        Then verify the id number in the first row matches the generated "Medicaid SPA" Number 3
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then click withdraw button
        Then verify the form is titled "Withdraw Medicaid SPA Package"
        Then verify Authority is "Medicaid SPA"
        Then verify "Supporting Documentation" is an Attachment Type
        Then verify label "Additional Information" exists on page
        Then verify form cancel button exists
        Then click form cancel button
        Then click Return to form
        Then Click the Submit Button without waiting
        Then click yes, withdraw package button without waiting
        Then verify the form error message is "An Attachment or Additional Information is required."
        Then attach "adobe.pdf" file to attachment 1
        Then Click the Submit Button without waiting
        Then click yes, withdraw package button
        Then verify the message in the alert bar is "Package withdrawn"