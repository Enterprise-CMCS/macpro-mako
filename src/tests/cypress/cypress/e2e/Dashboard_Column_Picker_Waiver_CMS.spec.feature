Feature: Package Dashboard - Waiver Tab Column Picker for CMS User
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user

    Scenario: Waivers Tab - Screen enhancement
        Then click on the Waivers tab
        Then verify show hide columns button exists
        Then verify IDNumber column exists
        Then verify type column exists
        Then Verify State Column Exists
        Then verify Waiver Number column exists
        Then verify status column exists
        Then verify Initial Submission Date column exists
        Then verify Formal RAI Received column exists
        Then verify submitted by column does not exist
        Then verify CPOC Name column does not exist
        Then verify Final Disposition column does not exist
        Then click show hide columns button
        Then verify Formal RAI Received checkbox exists
        Then verify state checkbox exists
        Then verify status checkbox exists
        Then verify Initial Submission Date checkbox exists
        Then verify submitted by checkbox exists
        Then verify type checkbox exists
        Then verify CPOC Name checkbox exists
        Then verify Final Disposition checkbox exists
        Then click show hide columns button
        Then Click on My Account
        Then click the sign out button

    Scenario: Waivers Tab - Uncheck all and verify Waiver Number exists
        Then click on the Waivers tab
        Then click show hide columns button
        Then click Formal RAI Received checkbox
        Then click Initial Submission Date checkbox
        Then click state checkbox
        Then click status checkbox
        Then click type checkbox
        Then click CPOC Name checkbox
        Then click Final Disposition checkbox
        Then click show hide columns button
        Then verify Waiver Number column exists
        Then verify type column does not exist
        Then verify state column does not exist
        Then verify status column does not exist
        Then verify Initial Submission Date column does not exist
        Then verify submitted by column does not exist
        Then verify Formal RAI Received column does not exist
        Then verify Final Disposition column exists
        Then verify CPOC Name column exists
        Then Click on My Account
        Then click the sign out button

    Scenario: Waivers Tab - verify tabs reset after login
        Then click on the Waivers tab
        Then verify show hide columns button exists
        Then verify IDNumber column exists
        Then verify type column exists
        Then verify submitted by column does not exist
        Then verify Waiver Number column exists
        Then verify status column exists
        Then verify Initial Submission Date column exists
        Then verify Formal RAI Received column exists
        Then Click on My Account
        Then click the sign out button

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
        Then click the sign out button