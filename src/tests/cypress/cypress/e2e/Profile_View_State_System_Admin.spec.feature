Feature: OY2_9990_State_System_Admin_Profile_Screen_Enhancements
    Scenario: State System Admin User Profile Screen Enhancements
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
        Then Click on User Management Tab
        Then i am on User Management Page
        Then verify User Management is Displayed
        Then verify Export to Excel CSV is Displayed
        Then verify Name is Displayed
        Then verify Status is Displayed
        Then verify Role is Displayed
        Then verify Last Modified is Displayed
        Then verify Modified By is Displayed
        Then verify Actions is Displayed
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