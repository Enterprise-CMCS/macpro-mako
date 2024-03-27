Feature: OY2-14464 Package Dashboard - Separate Tab for Waivers and SPAs
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button

    Scenario: SPAs Tab - Screen enhancement
        Then verify the SPAs tab exists
        Then verify the SPAs tab is selected
        Then verify SPA ID column exists
        Then verify search bar exists

    Scenario: Waivers Tab - Screen enhancement
        Then verify the Waivers tab exists
        Then verify the Waivers tab is clickable
        Then click on the Waivers tab
        Then verify the Waivers tab is selected
        Then verify Waiver Number column exists
        Then verify search bar exists

    Scenario: verify initial waiver waiver number pattern
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Authority
        Then click the 1915b check box
        Then click on Action Type
        Then click the Initial check box
        Then Click on the close Filter Button
        Then verify the type in row one is "Initial"
        Then verify the waiver number format in row one is SS-#####.S## or SS-####.S##

    Scenario: verify waiver renewal waiver number pattern
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Authority
        Then click the 1915b check box
        Then click on Action Type
        Then click the Renewal check box
        Then Click on the close Filter Button
        Then verify the type in row one is "Renewal"
        Then verify the waiver number format in row one is SS-#####.S## or SS-####.S##