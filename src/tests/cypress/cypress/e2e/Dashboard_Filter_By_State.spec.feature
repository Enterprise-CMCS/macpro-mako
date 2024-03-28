Feature: OY2-13094 Package Dashboard - Filter by State
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "Help Desk" user
        Then click the main Dashboard Button

    Scenario: filter by state full name
        Then Click on Filter Button
        Then click on state dropdown filter
        Then set value on state filter select to "Maryland"
        Then verify states selected includes "MD"
        Then verify "MD" is showing in the state column
        Then Click on the close Filter Button
        Then Click on My Account
        Then click the sign out button

    Scenario: filter by state Abbrev
        Then Click on Filter Button
        Then click on state dropdown filter
        Then set value on state filter select to "VA"
        Then verify states selected includes "VA"
        Then Click on the close Filter Button
        Then Click on My Account
        Then click the sign out button

    Scenario: filter and then reset
        Then Click on Filter Button
        Then click on state dropdown filter
        Then set value on state filter select to "Maryland"
        Then verify states selected includes "MD"
        Then click on reset button
        Then verify no states are selected
        Then Click on the close Filter Button
        Then Click on My Account
        Then click the sign out button

    Scenario: filter and then remove state
        Then Click on Filter Button
        Then click on state dropdown filter
        Then set value on state filter select to "Maryland"
        Then verify remove "MD" button exists
        Then click remove "MD" button
        Then Click on the close Filter Button
        Then Click on My Account
        Then click the sign out button