Feature: OY2_12596_CMSUserDenied
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "a Denied" "CMS Role Approver" user

    Scenario: Screen Enhance - Denied CMS user can see the text and profile information
        Then i am on Dashboard Page
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
        Then Status text is not displayed