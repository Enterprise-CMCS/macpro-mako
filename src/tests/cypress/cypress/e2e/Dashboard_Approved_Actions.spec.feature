Feature: Verify package actions in Approved Status in the package dashboard
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user

    Scenario: Demonstrate add amendment and temp ext are available for Initial Waiver in Approved Status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click Approved checkbox
        Then click on Type
        Then uncheck all of the type checkboxes
        Then click 1915b Initial Waiver check box
        Then click the actions button in row one
        Then verify the Add Amendment button is displayed
        Then verify the Request Temporary Extension button is displayed

    Scenario: Demonstrate add amendment and temp ext are available for Waiver Renewals in Approved Status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click Approved checkbox
        Then click on Type
        Then uncheck all of the type checkboxes
        Then click 1915b Waiver Renewal check box
        Then click the actions button in row one
        Then verify the Add Amendment button is displayed
        Then verify the Request Temporary Extension button is displayed