Feature: RAI Response for Initial Waiver - Package View

    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status

        Then click RAI Issued checkbox
        Then click on Status
        Then click on Type

        Then click on Action Type
        Then click the Initial check box
        Then Click on Filter Button

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