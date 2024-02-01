Feature: OY2_8618_CMS_Approver
    Scenario: CMS Role Approver user can see the text, profile information and status card
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS Role Approver" user
        Then i am on User Management Page
        Then Click on My Account
        Then Click on Manage Profile
        When I am on My Profile Page
        Then verify Profile Information is Displayed
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