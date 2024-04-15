Feature: CHIP SPA State Details View - Package Activity Log
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button

    Scenario: Screen Enhance
        Then search for "MD-23-4441-VMX"
        Then verify id number in the first row matches "MD-23-4441-VMX"
        Then click the SPA ID link in the first row
        Then verify the package activity section exists
        Then verify the Administrative Package Changes section exists