Feature: OY2-14464 Package Dashboard - Separate Tab for Waivers and SPAs
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user

    Scenario: SPAs Tab - Screen enhancement
        Then verify the SPAs tab exists
        Then verify the SPAs tab is selected
        Then verify SPA ID column exists

    Scenario: Waivers Tab - Screen enhancement
        Then verify search bar exists
        Then verify the Waivers tab exists
        Then verify the Waivers tab is clickable
        Then click on the Waivers tab
        Then verify the Waivers tab is selected
        Then verify Waiver Number column exists

    Scenario: Verify the SPAs tab is the default
        Then click on the Waivers tab
        Then refresh the page
        Then verify the SPAs tab is selected

    Scenario: screen enhancement
        Then click on the Waivers tab
        Then verify the Waivers tab is selected

    Scenario: verify initial waiver waiver number pattern
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Type
        Then uncheck all of the type checkboxes
        Then click 1915b Initial Waiver check box
        Then Click on Filter Button
        Then verify the type in row one is Initial Waiver
        Then verify the waiver number format in row one is SS.#### or SS.#####

    Scenario: verify waiver renewal waiver number pattern
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Type
        Then uncheck all of the type checkboxes
        Then click 1915b Waiver Renewal check box
        Then Click on Filter Button
        Then verify the type in row one is Waiver Renewal
        Then verify the waiver number format in row one is SS.#####.S## or SS.####.S##