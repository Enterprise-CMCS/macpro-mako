Feature: Verify user can use withdraw package action in Under Review Status in the package dashboard
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click on Packages

    Scenario: Demonstrate withdraw package is available for CHIP SPA in Under Review Status
        Then Click on Filter Button
        Then click on Status

        Then click Under Review checkbox
        Then click on Type

        Then click CHIP SPA check box
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard

    Scenario: Demonstrate withdraw package is available for Medicaid SPA in Under Review Status
        Then Click on Filter Button
        Then click on Status

        Then click Under Review checkbox
        Then click on Type

        Then click Medicaid SPA check box
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard

    Scenario: Demonstrate withdraw package is available for Initial Waiver in Under Review Status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status

        Then click Under Review checkbox
        Then click on Type

        Then click on Action Type
        Then click the Initial check box
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard

    Scenario: Demonstrate withdraw package is available for Waiver Renewals in Under Review Status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status

        Then click Under Review checkbox
        Then click on Type

        Then click the Renewal check box
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard

    Scenario: Demonstrate withdraw package is available for Waiver Amendments in Under Review Status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status

        Then click Under Review checkbox
        Then click on Type

        Then click 1915b Waiver Amendment check box
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard

    Scenario: Demonstrate withdraw package is available for Appendix K Amendments in Under Review Status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status

        Then click Under Review checkbox
        Then click on Type

        Then click 1915c Appendix K Amendment check box
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard