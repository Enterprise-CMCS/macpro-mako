Feature: RAI Response for 1915B Waiver Amendment - Package View

    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Authority
        Then click the 1915b check box
        Then click on Authority
        Then click on Action Type
        Then click the Waiver Amendment check box
        Then click on Action Type
        Then click on Status
        Then click RAI Issued checkbox
        Then Click on the close Filter Button

    Scenario: Respond to RAI from package dashboard
        Then click the actions button in row one
        Then click the Respond to RAI button
        Then verify "Waiver Number" is prefilled
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "Waiver RAI"
        Then attach "adobe.pdf" file to attachment 1
        Then Click the Submit Button without waiting

    Scenario: Respond to RAI from package details page
        Then click the Waiver Number link in the first row
        Then click on Respond to RAI package action
        Then verify "Waiver Number" is prefilled
        Then attach "adobe.pdf" file to attachment 1
        Then Click the Submit Button without waiting
