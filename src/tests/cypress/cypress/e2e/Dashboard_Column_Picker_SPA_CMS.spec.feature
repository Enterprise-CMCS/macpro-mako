Feature: Package Dashboard - SPA Tab Column Picker for CMS User
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
        Then click the main Dashboard Button

    Scenario: SPAs Tab - Screen enhancement
        Then verify show hide columns button exists
        Then verify SPA ID column exists
        Then verify Authority column exists
        Then verify State column exists
        Then verify status column exists
        Then verify Initial Submission Date column exists
        Then verify Formal RAI Received column exists
        Then verify submitted by column exists
        Then verify CPOC Name column does not exist
        #Then verify Final Disposition column does not exist
        Then click show hide columns button
        Then verify Formal RAI Received checkbox exists
        Then verify Initial Submission Date checkbox exists
        Then verify state checkbox exists
        Then verify status checkbox exists
        Then verify submitted by checkbox exists
        Then verify Authority checkbox exists
        Then verify CPOC Name checkbox exists
        #Then verify Final Disposition checkbox exists
        Then click show hide columns button

    Scenario: SPAs Tab - Uncheck all and verify SPA ID exists
        Then click show hide columns button
        Then click Formal RAI Received column visibility toggle button
        Then click Initial Submission Date column visibility toggle button
        Then click state column visibility toggle button
        Then click status column visibility toggle button
        Then click Authority column visibility toggle button
        Then click CPOC Name column visibility toggle button
        Then click submitted by column visibility toggle button
        #Then click Final Disposition checkbox
        Then click show hide columns button
        Then verify SPA ID column exists
        Then verify Authority column does not exist
        Then verify state column does not exist
        Then verify status column does not exist
        Then verify Initial Submission Date column does not exist
        Then verify submitted by column does not exist
        Then verify CPOC Name column exists
        #Then verify Final Disposition column exists
        Then verify Formal RAI Received column does not exist
        Then Click on My Account
        Then click the sign out button

    Scenario: Verify state exists, click state from drop down, verify it no longer exists, click it again, verify it exists again.
        Then verify State column exists
        Then click show hide columns button
        Then click state column visibility toggle button
        Then click show hide columns button
        Then verify state column does not exist
        Then click show hide columns button
        Then click state column visibility toggle button
        Then click show hide columns button
        Then verify State column exists
        Then Click on My Account
        Then click the sign out button

    Scenario: Verify type exists, click type from drop down, verify it no longer exists, click it again, verify it exists again.
        Then verify Authority column exists
        Then click show hide columns button
        Then click Authority column visibility toggle button
        Then click show hide columns button
        Then verify Authority column does not exist
        Then click show hide columns button
        Then click Authority column visibility toggle button
        Then click show hide columns button
        Then verify Authority column exists
        Then Click on My Account
        Then click the sign out button

    Scenario: Filter for medicaid spa only, remove all check from drop down and keep type, verify type state medicaid spa
        Then Click on Filter Button
        Then click on Authority
        Then click Medicaid SPA check box
        Then Click on the close Filter Button
        Then click show hide columns button
        Then click Formal RAI Received column visibility toggle button
        Then click Initial Submission Date column visibility toggle button
        Then click state column visibility toggle button
        Then click status column visibility toggle button
        Then click submitted by column visibility toggle button
        Then click show hide columns button
        Then verify submitted by column does not exist
        Then verify the type on row one exists
        Then verify the type in row one is "Medicaid SPA"
        Then Click on My Account
        Then click the sign out button

    Scenario: Search with no results and verify error message is correct, verify columns are existing per selection on filter
        Then search for "pending"
        Then verify Error message displayed should be No Results Found
        Then verify SPA ID column exists
        Then verify Authority column exists
        Then verify State column exists
        Then verify Formal RAI Received column exists
        Then verify status column exists
        Then verify Initial Submission Date column exists
        Then verify submitted by column exists
        Then Click on My Account
        Then click the sign out button

    Scenario: Uncheck all but type and state, search with results, then remove State and verify that the type column still exists and search criteria is still valid
        Then click show hide columns button
        Then click Initial Submission Date column visibility toggle button
        Then click status column visibility toggle button
        Then click Formal RAI Received column visibility toggle button
        Then click show hide columns button
        Then verify Authority column exists
        Then verify State column exists
        Then verify the type on row one exists
        Then verify the state on row one exists
        Then click show hide columns button
        Then click state column visibility toggle button
        Then click show hide columns button
        Then verify state column does not exist
        Then verify Authority column exists
        Then verify the type on row one exists
        Then Click on My Account
        Then click the sign out button


    Scenario: verify State column exists and is sortable
        Then i am on Dashboard Page
        Then verify State column exists
        Then Verify State Column is sortable
        Then Click on My Account
        Then click the sign out button

    Scenario: Verify submitted by exists
        Then verify submitted by column exists
        Then click show hide columns button
        Then click submitted by column visibility toggle button
        Then click show hide columns button
        Then verify submitted by column does not exist
        Then click show hide columns button
        Then click submitted by column visibility toggle button
        Then click show hide columns button
        Then verify submitted by column exists
        Then Click on My Account
        Then click the sign out button