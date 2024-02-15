Feature: Helpdesk User

    Scenario: Verify that there are Dashboard and User Management tabs
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "Help Desk" user
        Then i am on Dashboard Page
        Then verify the SPAs tab is selected
        Then verify Export to Excel CSV is Displayed
        Then verify Waiver Number column exists
        Then verify type column exists
        Then verify state column does not exist
        Then verify submitted by column exists
        Then Click on User Management Tab
        Then i am on User Management Page
        Then verify User Management is Displayed
        Then verify Export to Excel CSV is Displayed
        Then verify Name is Displayed
        Then verify State is Displayed
        Then verify Status is Displayed
        Then verify Role is Displayed
        Then verify Last Modified is Displayed
        Then verify Modified By is Displayed