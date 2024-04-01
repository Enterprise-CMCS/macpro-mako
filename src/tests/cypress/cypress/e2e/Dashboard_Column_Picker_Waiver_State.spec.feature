Feature: Package Dashboard - Waiver Tab Column Picker
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on the Waivers tab

    Scenario: Waivers Tab - Screen enhancement
        Then verify show hide columns button exists
        Then verify Waiver Number column exists
        Then verify Authority column exists
        Then verify action type column exists
        Then verify State column exists
        Then verify Waiver Number column exists
        Then verify status column exists
        Then verify Initial Submission Date column exists
        Then verify submitted by column exists
        Then verify actions column exists
        Then verify Formal RAI Received column exists
        Then verify CPOC Name column does not exist
        #Then verify Final Disposition column does not exist
        Then click show hide columns button
        Then verify Formal RAI Received checkbox exists
        Then verify state checkbox exists
        Then verify status checkbox exists
        Then verify Initial Submission Date checkbox exists
        Then verify submitted by checkbox exists
        Then verify Authority checkbox exists
        Then verify action type checkbox exists
        Then verify CPOC Name checkbox exists
        #Then verify Final Disposition checkbox exists
        Then click show hide columns button
        Then Click on My Account
        Then click the sign out button

    Scenario: Waivers Tab - Uncheck all and verify Waiver Number and actions exists
        Then click show hide columns button
        Then click status column visibility toggle button
        Then click submitted by column visibility toggle button
        Then click Formal RAI Received column visibility toggle button
        Then click Initial Submission Date column visibility toggle button
        Then click state column visibility toggle button
        Then click Authority column visibility toggle button
        Then click action type column visibility toggle button
        Then click CPOC Name column visibility toggle button
        #Then click Final Disposition checkbox
        Then click show hide columns button
        Then verify Waiver Number column exists
        Then verify actions column exists
        Then verify Authority column does not exist
        Then verify action type column does not exist
        Then verify state column does not exist
        Then verify status column does not exist
        Then verify Initial Submission Date column does not exist
        Then verify submitted by column does not exist
        Then verify Formal RAI Received column does not exist
        #Then verify Final Disposition column exists
        Then verify CPOC Name column exists
        Then Click on My Account
        Then click the sign out button

    Scenario: Waivers Tab - verify tabs reset after login
        Then verify show hide columns button exists
        Then verify Waiver Number column exists
        Then verify Authority column exists
        Then verify action type column exists
        #Then verify state column does not exist
        Then verify Waiver Number column exists
        Then verify status column exists
        Then verify Initial Submission Date column exists
        Then verify submitted by column exists
        Then verify Formal RAI Received column exists
        Then verify actions column exists
        Then Click on My Account
        Then click the sign out button

# Scenario: Verify state doesn't exists, but is selectable
#     Then verify state column does not exist
#     Then click show hide columns button
#     Then click state column visibility toggle button
#     Then click show hide columns button
#     Then verify State column exists
#     Then click show hide columns button
#     Then click state column visibility toggle button
#     Then click show hide columns button
#     Then verify state column does not exist
#     Then Click on My Account
#     Then click the sign out button