Feature: CHIP SPA State Details View - Administrative Package Change Log
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user

    Scenario: Screen Enhance
        Then search for "MD-23-4441-VMX"
        Then verify id number in the first row matches "MD-23-4441-VMX"
        Then click the SPA ID link in the first row
        Then verify the attachments section exists
        Then verify the additional information section exists
        Then verify the Administrative Package Changes section exists
        Then verify RAI Responses header exists
        Then verify the first RAI Response header is titled