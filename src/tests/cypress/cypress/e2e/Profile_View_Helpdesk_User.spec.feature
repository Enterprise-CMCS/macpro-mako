Feature: Helpdesk User

    Scenario: Verify that there are Dashboard and User Management tabs
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "Help Desk" user
        Then click the main Dashboard Button
        Then i am on Dashboard Page
        Then verify the SPAs tab is selected
        Then verify Export to Excel CSV is Displayed
        Then verify SPA ID column exists
        Then verify Authority column exists
        Then verify State column exists
        Then verify submitted by column exists
        Then click on the Waivers tab
        Then verify Export to Excel CSV is Displayed
        Then verify Waiver Number column exists
        Then verify Authority column exists
        Then verify State column exists
        Then verify submitted by column exists