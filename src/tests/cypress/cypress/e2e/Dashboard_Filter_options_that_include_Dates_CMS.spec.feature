Feature: Package Dashboard - Filter by Formal RAI Received
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
        Then click the main Dashboard Button

    Scenario: Filter by Initial Submission Date - Date picker
        Then Click on Filter Button
        Then click on Initial Submission Date filter dropdown
        Then click the date picker for the filter
        Then click on quarter to date date picker button
        Then Click on the close Filter Button
        Then verify Initial Submission Date column one date is this quarter
        Then Click on My Account
        Then click the sign out button

    Scenario: Filter by Formal RAI Received - Date picker
        Then Click on Filter Button
        Then click on Formal RAI Received dropdown filter
        Then click the date picker for the filter
        Then click on quarter to date date picker button
        Then Click on the close Filter Button
        Then Click on My Account
        Then click the sign out button

    # Scenario: Filter by Final Disposition - Date picker
    #     Then Click on Filter Button
    #     #Then click on Final Disposition dropdown filter
    #     Then click the date picker for the filter
    #     Then click on quarter to date date picker button
    #     Then Click on the close Filter Button
    #     Then Click on My Account
    #     Then click the sign out button

    Scenario: Change Initial Submission Date filter. Verify no results. Then reset filter
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Initial Submission Date filter dropdown
        Then click the date picker for the filter
        Then click on quarter to date date picker button
        Then click on Initial Submission Date filter dropdown
        Then click on reset button
        Then Click on the close Filter Button
        Then verify package row one exists
        Then Click on My Account
        Then click the sign out button

    Scenario: Change Formal RAI Received date filter. Verify results. Then reset filter
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Formal RAI Received dropdown filter
        Then click the date picker for the filter
        Then click on quarter to date date picker button
        Then click on Formal RAI Received dropdown filter
        Then click on reset button
        Then Click on the close Filter Button
        Then verify package row one exists
        Then Click on My Account
        Then click the sign out button