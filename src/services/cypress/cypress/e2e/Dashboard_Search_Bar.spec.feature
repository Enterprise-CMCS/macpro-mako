Feature: OY2-11149 Submission Dashboard - Search bar
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button

    Scenario: Search for non existing user and verify error message
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then type in search bar an ID that does not exist in search bar
        Then verify x in search bar exists to clear
        Then verify Error message displayed should be No Results Found

    Scenario: Search for non existing criteria and verify error message
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then search for "pending"
        Then verify Error message displayed should be No Results Found

    Scenario: Search for medicaid SPA
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then Click on Filter Button
        Then click on Authority
        Then click CHIP SPA check box
        Then Click on the close Filter Button
        Then copy the ID from the link in the first row
        Then search for the ID copied from the link in the first row
        Then verify the ID searched for is the ID in the first result
        Then clear search bar

    Scenario: Search existing user with Upper case
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then search for "George"
        Then verify user exists with id number searched


    Scenario: Search existing user with special characters
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then search for "-"
        Then verify user exists with id number searched

    Scenario: Log in with help desk user
        When Login with "an Active" "Help Desk" user
        Then click the main Dashboard Button
        Then verify search bar exists
        Then verify Search by Package ID, CPOC Name, or Submitter Name is displayed on top of search bar

    Scenario: Log in with system admin user
        When Login with "an Active" "CMS System Admin" user
        Then click the main Dashboard Button
        Then verify search bar exists
        Then verify Search by Package ID, CPOC Name, or Submitter Name is displayed on top of search bar

    Scenario: Screen Enhancement
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then verify search bar exists
        Then verify Search by Package ID, CPOC Name, or Submitter Name is displayed on top of search bar
        Then search for "George"
        Then verify x in search bar exists to clear search and click it
