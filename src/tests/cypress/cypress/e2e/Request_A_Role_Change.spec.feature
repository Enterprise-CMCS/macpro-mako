Feature: OY2-12679 Users can request a role change in OneMAC
    Scenario: Screen enhance - State Submitter role change
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then i am on Dashboard Page
        Then Click on My Account
        Then verify that Request a Role Change button exists
        Then click on Request a Role Change button
        Then verify Select the role for which you are registering is visible
        Then verify SSA is the role available
        Then click on the SSA role
        Then verify the user role is "State System Admin"
        Then verify the error message says "Please select a state."
        Then verify the submit button is disabled on request a role page
        Then select "Alabama" for state access
        Then verify the submit button is enabled
        Then verify there is no error message
        Then select "Alaska" for state access
        Then verify the submit button is enabled
        Then verify there is no error message

    Scenario: Screen enhance - SSA role change
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State System Admin" user
        Then i am on Dashboard Page
        Then Click on My Account
        Then verify that Request a Role Change button exists
        Then click on Request a Role Change button
        Then verify Select the role for which you are registering is visible
        Then verify State Submitter is the role available
        Then click on the State Submitter role
        Then verify the user role is "State Submitter"
        Then verify the error message says "Please select at least one state."
        Then verify the submit button is disabled on request a role page
        Then select "Alabama" for state access
        Then verify the submit button is enabled
        Then verify there is no error message
        Then select "Alaska" for state access
        Then verify the submit button is enabled
        Then verify there is no error message
        Then verify the cancel button is clickable

    Scenario: Screen enhance - cms role approver role change
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS Role Approver" user
        Then i am on User Management Page
        Then Click on My Account
        Then verify that Request a Role Change button exists
        Then click on Request a Role Change button
        Then verify Select the role for which you are registering is visible
        Then verify the CMS Reviewer role is available
        Then click on the CMS Reviewer role
        Then verify the group dropdown exists
        Then verify the submit button is disabled via class
        Then click on cancel
        Then click stay on page in the modal
        Then verify the cancel button is clickable

    # Scenario: Screen enhance - CMS Reviewer role change
    #     Given I am on Login Page
    #     When clicking the Sign In Button
    #     When Login with CMS Reviewer User
    #     Then i am on Dashboard Page
    #     Then Click on My Account
    #     Then verify that Request a Role Change button exists
    #     Then click on Request a Role Change button
    #     Then verify Select the role for which you are registering is visible
    #     Then verify the CMS Role Approver role is available

    Scenario: Screen enhance - cms system admin role change
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
        Then i am on Dashboard Page
        Then Click on My Account
        Then verify that Request a Role Change button does not exist

    Scenario: Screen enhance - Help Desk User role change
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "Help Desk" user
        Then i am on Dashboard Page
        Then Click on My Account
        Then verify that Request a Role Change button does not exist

    Scenario: Screen Enhance - Denied CMS user can request CMS Role Approver
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "a Denied" "CMS Role Approver" user
        Then i am on Dashboard Page
        Then Click on My Account
        Then verify that Request a Role Change button exists
        Then click on Request a Role Change button
        Then verify Select the role for which you are registering is visible
        Then verify the CMS Role Approver role is available

    Scenario: Screen Enhance - Revoked CMS user can request CMS Role Approver
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "a Revoked" "CMS Role Approver" user
        Then i am on Dashboard Page
        Then Click on My Account
        Then verify that Request a Role Change button exists
        Then click on Request a Role Change button
        Then verify Select the role for which you are registering is visible
        Then verify the CMS Role Approver role is available
