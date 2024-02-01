Feature: Package Dashboard - SPA Tab Column Picker for CMS User
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user

    Scenario: SPAs Tab - Screen enhancement
        Then verify show hide columns button exists
        Then verify SPA ID column exists
        Then verify type column exists
        Then Verify State Column Exists
        Then verify status column exists
        Then verify Initial Submission Date column exists
        Then verify Formal RAI Received column exists
        Then verify submitted by column does not exist
        Then verify CPOC Name column does not exist
        Then verify Final Disposition column does not exist
        Then click show hide columns button
        Then verify Formal RAI Received checkbox exists
        Then verify Initial Submission Date checkbox exists
        Then verify state checkbox exists
        Then verify status checkbox exists
        Then verify submitted by checkbox exists
        Then verify type checkbox exists
        Then verify CPOC Name checkbox exists
        Then verify Final Disposition checkbox exists
        Then click show hide columns button

    Scenario: SPAs Tab - Uncheck all and verify SPA ID exists
        Then click show hide columns button
        Then click Formal RAI Received checkbox
        Then click Initial Submission Date checkbox
        Then click state checkbox
        Then click status checkbox
        Then click type checkbox
        Then click CPOC Name checkbox
        Then click Final Disposition checkbox
        Then click show hide columns button
        Then verify SPA ID column exists
        Then verify type column does not exist
        Then verify state column does not exist
        Then verify status column does not exist
        Then verify Initial Submission Date column does not exist
        Then verify submitted by column does not exist
        Then verify CPOC Name column exists
        Then verify Final Disposition column exists
        Then verify Formal RAI Received column does not exist
        Then Click on My Account
        Then click the logout button

    Scenario: Verify state exists, click state from drop down, verify it no longer exists, click it again, verify it exists again.
        Then Verify State Column Exists
        Then click show hide columns button
        Then click state checkbox
        Then click show hide columns button
        Then verify state column does not exist
        Then click show hide columns button
        Then click state checkbox
        Then click show hide columns button
        Then Verify State Column Exists
        Then Click on My Account
        Then click the logout button

    Scenario: Verify type exists, click type from drop down, verify it no longer exists, click it again, verify it exists again.
        Then verify type column exists
        Then click show hide columns button
        Then click type checkbox
        Then click show hide columns button
        Then verify type column does not exist
        Then click show hide columns button
        Then click type checkbox
        Then click show hide columns button
        Then verify type column exists
        Then Click on My Account
        Then click the logout button

    Scenario: Filter for medicaid spa only, remove all check from drop down and keep TYPE, verify type state medicaid spa
        Then Click on Filter Button
        Then click on Type
        Then click CHIP SPA check box
        Then Click on Filter Button
        Then click show hide columns button
        Then click Formal RAI Received checkbox
        Then click Initial Submission Date checkbox
        Then click state checkbox
        Then click status checkbox
        Then click submitted by checkbox
        Then click show hide columns button
        Then verify submitted by column exists
        Then verify the type on row one exists
        Then verify the type on row one is Medicaid SPA
        Then Click on My Account
        Then click the logout button

    Scenario: Search with no results and verify error message is correct, verify columns are existing per selection on filter
        Then search for "pending"
        Then verify Error message displayed should be No Results Found
        Then verify IDNumber column exists
        Then verify type column exists
        Then Verify State Column Exists
        Then verify Formal RAI Received column exists
        Then verify status column exists
        Then verify Initial Submission Date column exists
        Then verify submitted by column does not exist
        Then Click on My Account
        Then click the logout button

    Scenario: Uncheck all but type and state, search with results, then remove State and verify that the type column still exists and search criteria is still valid
        Then click show hide columns button
        Then click Initial Submission Date checkbox
        Then click status checkbox
        Then click Formal RAI Received checkbox
        Then click show hide columns button
        Then verify type column exists
        Then Verify State Column Exists
        Then verify the type on row one exists
        Then verify the state on row one exists
        Then click show hide columns button
        Then click state checkbox
        Then click show hide columns button
        Then verify state column does not exist
        Then verify type column exists
        Then verify the type on row one exists
        Then Click on My Account
        Then click the logout button


    Scenario: Verify State Column Exists and is sortable
        Then i am on Dashboard Page
        Then Verify State Column Exists
        Then Verify State Column is sortable
        Then Click on My Account
        Then click the logout button

    Scenario: Verify submitted by doesn't exists, but is selectable
        Then verify submitted by column does not exist
        Then click show hide columns button
        Then click submitted by checkbox
        Then click show hide columns button
        Then verify submitted by column exists
        Then click show hide columns button
        Then click submitted by checkbox
        Then click show hide columns button
        Then verify submitted by column does not exist
        Then Click on My Account
        Then click the logout button