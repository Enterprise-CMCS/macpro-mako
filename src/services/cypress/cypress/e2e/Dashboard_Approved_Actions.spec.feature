Feature: Verify package actions in Approved Status in the package dashboard
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then click Approved checkbox

    Scenario: Demonstrate add amendment and temp ext are available for Initial Waiver in Approved Status
        Then click on Authority
        Then click the 1915b check box
        Then click on Action Type
        Then click the Initial check box
        Then Click on the close Filter Button
        Then click the actions button in row one
        Then verify the Add Amendment button is displayed
        Then verify the Request Temporary Extension button is displayed

    Scenario: Demonstrate add amendment and temp ext are available for Waiver Renewals in Approved Status
        Then click on Authority
        Then click the 1915b check box
        Then click on Action Type
        Then click the Renewal check box
        Then Click on the close Filter Button
        Then click the actions button in row one
        Then verify the Add Amendment button is displayed
        Then verify the Request Temporary Extension button is displayed