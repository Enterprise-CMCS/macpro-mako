Feature: OY2-13094 Package Dashboard - Filter by State
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click show hide columns button
        Then click state checkbox
        Then click show hide columns button

    Scenario: Screen enhancement
        Then Click on Filter Button
        Then verify state dropdown filter exists
        Then click on state dropdown filter
        Then verify state filter select exists
        Then verify no states are selected
        Then Click on My Account
        Then click the logout button

    Scenario: filter by state full name
        Then Click on Filter Button
        Then click on state dropdown filter
        Then set value on state filter select to "Maryland"
        Then verify states selected includes "Maryland"
        Then verify "MD" is showing in the state column
        Then Click on My Account
        Then click the logout button

    Scenario: filter by state Abbrev
        Then Click on Filter Button
        Then click on state dropdown filter
        Then set value on state filter select to "NJ"
        Then verify states selected includes "New Jersey"
        Then Click on My Account
        Then click the logout button

    Scenario:  filter by non-state
        Then Click on Filter Button
        Then click on state dropdown filter
        Then set value on state filter select to "foobar"
        Then verify no states are selected
        Then Click on My Account
        Then click the logout button

    Scenario: filter and then reset
        Then Click on Filter Button
        Then click on state dropdown filter
        Then set value on state filter select to "Maryland"
        Then verify states selected includes "Maryland"
        Then click on reset button
        Then verify no states are selected

    Scenario: filter and then remove state
        Then Click on Filter Button
        Then click on state dropdown filter
        Then set value on state filter select to "Maryland"
        Then verify remove "Maryland" button exists
        Then click remove "Maryland" button