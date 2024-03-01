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
    #Then verify Error message details is displayed

    Scenario: Search for non existing criteria and verify error message
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then search for "pending"
        Then verify Error message displayed should be No Results Found
    #Then verify Error message details is displayed

    Scenario: Search for medicaid SPA
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then Click on Filter Button
        Then click on Type
        Then click CHIP SPA check box
        Then Click on the close Filter Button
        Then copy the ID from the link in the first row
        Then search for the ID copied from the link in the first row
        Then verify the ID searched for is the ID in the first result
        Then clear search bar

    @focus
    Scenario: Create Initial Waiver and search it
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b 4 FFS Selective Contracting waivers
        Then click on 1915b 4 FFS Selective Contracting New Initial Waiver
        Then type the generated "Initial Waiver" Number 1 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of 1915(b) Initial Waiver" to 3 months from today
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then click on the Waivers tab
        Then search for the generated "Initial Waiver" Number 1
        Then verify the id number in the first row matches the generated "Initial Waiver" Number 1
        Then clear search bar
        Then search for "George Harrison"
        Then verify user exists with id number searched

    Scenario: Search existing user with Upper case
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then search for "ANGIE ACTIVE"
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
        Then search for "ANGIE ACTIVE"
        Then verify x in search bar exists to clear search and click it
