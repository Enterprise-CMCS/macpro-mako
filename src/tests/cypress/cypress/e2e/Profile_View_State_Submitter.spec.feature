Feature: OY2_9990_State_Submitter_Profile_Screen_Enhancements
    Scenario: State Submitter User Profile Screen Enhancements
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then i am on Dashboard Page
        Then verify New Submission BTN is Displayed
        Then verify Waiver Number column exists
        Then verify Authority column exists
        Then verify state column does not exist
        Then verify submitted by column exists
        Then verify Home tab is Displayed
        Then dashboard tab is Displayed
        Then FAQ tab is Displayed
        Then Click on My Account
        Then Click on Manage Profile
        When I am on My Profile Page
        Then verify My Information Header is Displayed
        Then Full Name text is Displayed
        Then Actual Full Name is Displayed
        Then Role text is Displayed
        Then Actual Role is Displayed
        Then Email text is Displayed
        Then Actual Email is Displayed
        Then Phone Number text is Displayed
        Then Phone Number Add Button is Displayed
        Then Status text is Displayed
        Then Actual Status is Displayed with Access Granted