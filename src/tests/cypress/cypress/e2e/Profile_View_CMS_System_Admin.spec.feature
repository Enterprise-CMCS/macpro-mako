Feature: OY2_8618_CMS_System_Admin
    Scenario: CMS System Admin user can see the text, profile information
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
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