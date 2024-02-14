Feature: OY2-13094 Package Dashboard - Filter by State
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "Help Desk" user
        Then click the main Dashboard Button

    Scenario: Screen enhancement
        Then Click on Filter Button
        Then verify state dropdown filter exists
        Then click on state dropdown filter
        Then verify state filter select exists
        Then verify no states are selected
        Then Click on the close Filter Button
        Then Click on My Account
        Then click the sign out button

    Scenario: filter by state full name
        Then Click on Filter Button
        Then click on state dropdown filter
        Then set value on state filter select to "Maryland"
        Then verify states selected includes "MD"
        Then verify "MD" is showing in the state column
        Then Click on the close Filter Button
        Then Click on My Account
        Then click the sign out button

    # Scenario: filter by state Abbrev
    #     Then Click on Filter Button
    #     Then click on state dropdown filter
    #     Then set value on state filter select to "NJ"
    #     Then verify states selected includes "NJ"
    #     Then Click on the close Filter Button
    #     Then Click on My Account
    #     Then click the sign out button

    Scenario:  filter by non-state
        Then Click on Filter Button
        Then click on state dropdown filter
        Then set value on state filter select to "foobar"
        Then verify no states are selected
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