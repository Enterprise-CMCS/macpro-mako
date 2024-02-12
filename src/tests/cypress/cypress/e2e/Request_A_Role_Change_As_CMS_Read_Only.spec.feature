Feature: OY2-16707 CMS Users Denied a CRA Role loses Read Only Access to OneMAC
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
        Then Click on User Management Tab
        Then reset EUA CMS Read Only User state if needed
        Then Click on My Account
        Then click the sign out button

    Scenario: Denied EUA CMS user requests and denied but still see same info
        Then Verify I am on the login page and not logged in
        When clicking the Sign In Button
        When Login with "an Active" "CMS Read Only" user
        Then Click on My Account
        Then click on Request a Role Change button
        Then click on the CMS Role Approver role
        Then Click on My Account
        Then verify that Request a Role Change button does not exist
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
        Then Click on My Account
        Then verify the logout button exists
        Then click the sign out button
        Then Verify I am on the login page and not logged in
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
        Then Click on User Management Tab
        Then click the pending user action button
        Then click the deny access button
        Then click confirm in the modal
        Then verify success message for denied role
        Then Click on My Account
        Then verify the logout button exists
        Then click the sign out button
        Then Verify I am on the login page and not logged in
        When clicking the Sign In Button
        When Login with "an Active" "CMS Read Only" user
        Then Click on My Account
        Then verify that Request a Role Change button exists
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