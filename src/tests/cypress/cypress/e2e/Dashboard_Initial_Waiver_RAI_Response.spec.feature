Feature: RAI Response for Initial Waiver - Package View
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions

    Scenario: create package, issue RAI and validate response to Comprehensive (Capitated) RAI from package dashboard
        Then click on "1915(b) Comprehensive (Capitated) Waiver Authority" choice
        Then click on "1915(b) Comprehensive (Capitated) New Initial Waiver" choice
        Then type the generated "Initial Waiver" Number 3 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of 1915(b) Initial Waiver" to 3 months from today
        Then attach "file.docx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This Initial Waiver package was created by the test automation."
        Then Click on Submit Button
        Then Click on My Account
        Then click the sign out button
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then search for the generated "Initial Waiver" Number 3
        Then verify the id number in the first row matches the generated "Initial Waiver" Number 3
        Then click the actions button in row one
        Then click the Issue Formal RAI button

        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then search for the generated "Initial Waiver" Number 3
        Then verify the id number in the first row matches the generated "Initial Waiver" Number 3
        Then click the actions button in row one
        Then click the Respond to RAI button
        Then verify "Waiver Number" is prefilled
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "Waiver RAI"
        Then attach "adobe.pdf" file to attachment 1
        Then verify the submit button is enabled

    Scenario: create package, issue RAI and validate response to Comprehensive (Capitated) RAI from package details page
        Then click on "1915(b) Comprehensive (Capitated) Waiver Authority" choice
        Then click the Waiver Number link in the first row
        Then click on Respond to RAI package action
        Then verify "Waiver Number" is prefilled
        Then attach "adobe.pdf" file to attachment 1
        Then verify the submit button is enabled

        Scenario: validate response to RAI from package dashboard
        Then click the actions button in row one
        Then click the Respond to RAI button
        Then verify "Waiver Number" is prefilled
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "Waiver RAI"
        Then attach "adobe.pdf" file to attachment 1
        Then verify the submit button is enabled

    Scenario: validate response to RAI from package details page
        Then click the Waiver Number link in the first row
        Then click on Respond to RAI package action
        Then verify "Waiver Number" is prefilled
        Then attach "adobe.pdf" file to attachment 1
        Then verify the submit button is enabled