Feature: Package Dashboard Read Only View
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS Read Only" user
        Then click the main Dashboard Button

    Scenario: CMS Read Only user actions column unavailable in Package Dashboard
        Then verify actions column is unavailable
        Then click on the Waivers tab
        Then verify actions column is unavailable

    Scenario: CMS Read Only user actions column unavailable in Package Mini-Dashboard
        Then click on the Waivers tab
        Then click the Waiver Number link in the first row
        Then verify there are no package actions available