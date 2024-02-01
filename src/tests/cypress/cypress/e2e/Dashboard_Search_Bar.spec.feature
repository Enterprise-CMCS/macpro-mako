Feature: OY2-11149 Submission Dashboard - Search bar

    Scenario: Search for non existing user and verify error message
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then type in search bar not existing ID in search bar
        Then verify Error message displayed should be No Results Found
        Then verify Error message details is displayed

    Scenario: Search for non existing criteria and verify error message
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then search for "pending"
        Then verify Error message displayed should be No Results Found
        Then verify Error message details is displayed

    Scenario: Search for medicaid SPA
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then Click on Filter Button
        Then click on Type
        Then click CHIP SPA check box
        Then Click on Filter Button
        Then copy the ID from the link in the first row
        Then search for the ID copied from the link in the first row
        Then verify the ID searched for is the ID in the first result
        Then clear search bar


    Scenario: Create Initial Waiver and search it
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b 4 FFS Selective Contracting waivers
        Then click on 1915b 4 FFS Selective Contracting New Initial Waiver
        Then verify Waiver Authority contains "1915(b)(4) FFS Selective Contracting waivers"
        Then type "MD-39253.R00.00" into the ID Input box
        Then set "Proposed Effective Date of 1915(b) Initial Waiver" to 3 months from today
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify submission successful message in the alert bar
        Then search for Initial Waiver Number 2 with 12 Characters
        Then clear search bar
        Then search for "Angie Active"
        Then verify user exists with id number searched

    Scenario: Search existing user with Upper case
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then search for "ANGIE ACTIVE"
        Then verify user exists with id number searched


    Scenario: Search existing user with special characters
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then search for "-"
        Then verify user exists with id number searched

    Scenario: Search CPOC
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click show hide columns button
        Then click CPOC Name checkbox
        Then search for "Chester Tester"
        Then verify the CPOC searched for is Chester Tester in the first result

    Scenario: Log in with help desk user
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "Help Desk" user
        Then verify search bar exists
        Then verify Search by Package ID, CPOC Name, or Submitter Name is displayed on top of search bar

    Scenario: Log in with system admin user
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
        Then verify search bar exists
        Then verify Search by Package ID, CPOC Name, or Submitter Name is displayed on top of search bar

    Scenario: Screen Enhancement
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then verify search bar exists
        Then verify Search by Package ID, CPOC Name, or Submitter Name is displayed on top of search bar
        Then search for "ANGIE ACTIVE"
        Then verify x in search bar exists to clear search and click it
