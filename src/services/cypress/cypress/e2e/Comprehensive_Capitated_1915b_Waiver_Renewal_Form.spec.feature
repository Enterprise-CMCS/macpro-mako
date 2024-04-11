Feature: Waiver Renewal in Package Dashboard
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on "1915(b) Comprehensive (Capitated) Waiver Authority" choice

    Scenario: Screen Enhance - Waiver Renewal
        Then verify "1915(b) Comprehensive (Capitated) Renewal Waiver" choice goes to "/new-submission/waiver/b/capitated/renewal/create"
        Then click on "1915(b) Comprehensive (Capitated) Renewal Waiver" choice
        Then verify user is on new waiver renewal page
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "1915b Waiver"

    Scenario: Verify pre-print and spreadsheet are both required
        Then click on "1915(b) Comprehensive (Capitated) Renewal Waiver" choice
        Then into "Existing Waiver Number to Renew" type "MD-2200.R00.00"
        Then type the generated "1915(b) Waiver Renewal Number" Number 1 into the ID Input box using the state "MD"
        Then Click the Submit Button without waiting
        Then verify the "Proposed Effective Date" error message is "Required"
        Then verify the "first attachment" error message is "Required"
        Then verify the "second attachment" error message is "Required"
        Then set "Proposed Effective Date of 1915(b) Waiver Renewal" to 3 months from today
        Then Click the Submit Button without waiting
        Then verify "Proposed Effective Date" has no error messages
        Then attach "excel.xlsx" file to attachment 2
        Then Click the Submit Button without waiting
        Then verify "second attachment" has no error messages
        Then attach "excel.xlsx" file to attachment 1
        Then clear the ID Input box
        Then Click the Submit Button without waiting
        Then verify "first attachment" has no error messages

    Scenario: create waiver renewal from package dashboard and search it
        Then click on "1915(b) Comprehensive (Capitated) Renewal Waiver" choice
        Then into "Existing Waiver Number to Renew" type "MD-1000.R00.00"
        Then type the generated "1915(b) Waiver Renewal Number" Number 1 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of 1915(b) Waiver Renewal" to 3 months from today
        #Then into "Subject" type "Cypress Regression Test"
        #Then into "Description" type "This package was created while running the test automation."
        Then attach "file.docx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This 1915(b) Renewal Waiver package was created by the test automation."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then click on the Waivers tab
        Then search for the generated "1915(b) Waiver Renewal Number" Number 1
        Then verify the id number in the first row matches the generated "1915(b) Waiver Renewal Number" Number 1