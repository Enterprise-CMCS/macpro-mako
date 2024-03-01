Feature: Validate Waiver Form is checking ID format without period
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on "1915(b)(4) FFS Selective Contracting Waivers" choice

    Scenario: Verify Initial Waiver number errors when dash is used
        Then click on "1915(b)(4) FFS Selective Contracting New Initial Waiver" choice
        Then verify Waiver Authority contains "1915(b)"
        Then into "Initial Waiver Number" type "MD.1055.R00.00"
        Then Click the Submit Button without waiting
        Then verify the "Initial Waiver Number" error message is "The Initial Waiver Number must be in the format of SS-####.R00.00 or SS-#####.R00.00"
        Then clear the ID Input box
        Then type "MD-99331.R00.00" into the ID Input box
        Then verify ID error message is not present
        Then verify the submit button is not disabled
        Then clear the ID Input box
        Then into "Initial Waiver Number" type "MD.10555.R00.00"
        Then verify the "Initial Waiver Number" error message is "The Initial Waiver Number must be in the format of SS-####.R00.00 or SS-#####.R00.00"
        Then clear the ID Input box

 Scenario: Validate Waiver Form Logic for Waiver Amendment
        Then click on "1915(b)(4) FFS Selective Contracting Waiver Amendment" choice
        Then verify Waiver Authority contains "1915(b)"
        Then into "Existing Waiver Number to Amend" type "MD-2200-R00-00"
        Then type "MD-22005.R00.00" into the ID Input box
        Then Click the Submit Button without waiting
        Then verify the "Existing Waiver Number to Amend" error message is "The 1915(b) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##. For amendments, the last two digits start with '01' and ascends."
        Then verify the "1915(b) Waiver Amendment Number" error message is "The 1915(b) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##. For amendments, the last two digits start with '01' and ascends."
        Then clear "Existing Waiver Number to Amend" input field
        Then clear "1915(b) Waiver Amendment Number" input field
        Then into "Existing Waiver Number to Amend" type "MD-2200.R00.00"
        Then type "MD-22005.R00.00" into the ID Input box
        Then Click the Submit Button without waiting
        Then verify "Existing Waiver Number to Amend" has no error messages
        Then verify the "1915(b) Waiver Amendment Number" error message is "The 1915(b) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##. For amendments, the last two digits start with '01' and ascends."
        Then clear "Existing Waiver Number to Amend" input field
        Then clear "1915(b) Waiver Amendment Number" input field
        Then into "Existing Waiver Number to Amend" type "MD-2200-R00.00"
        Then type "MD-40000.R01.01" into the ID Input box
        Then Click the Submit Button without waiting
        Then verify the "Existing Waiver Number to Amend" error message is "The 1915(b) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##. For amendments, the last two digits start with '01' and ascends."
        Then verify "1915(b) Waiver Amendment Number" has no error messages
        Then clear "Existing Waiver Number to Amend" input field
        Then clear "1915(b) Waiver Amendment Number" input field
        Then into "Existing Waiver Number to Amend" type "MD-2200.R00.00"
        Then type "MD-40000.R01.01" into the ID Input box
        Then Click the Submit Button without waiting
        Then verify "Existing Waiver Number to Amend" has no error messages
        Then verify "1915(b) Waiver Amendment Number" has no error messages

    Scenario: Validate Waiver Form Logic for Waiver Renewal and All other
        Then click on "1915(b)(4) FFS Selective Contracting Renewal Waiver" choice
        Then verify Waiver Authority contains "1915(b)"
        Then into "Existing Waiver Number to Renew" type "MD-2200-R00-00"
        Then type "MD-22005.R00.00" into the ID Input box
        Then Click the Submit Button without waiting
        Then verify the "Existing Waiver Number to Renew" error message is "The 1915(b) Waiver Renewal Number must be in the format of SS-####.R##.## or SS-#####.R##.##."
        Then verify the "1915(b) Waiver Renewal Number" error message is "Renewal Number must be in the format of SS-####.R##.00 or SS-#####.R##.00 For renewals, the “R##” starts with '01' and ascends."
        Then clear "Existing Waiver Number to Renew" input field
        Then clear "1915(b) Waiver Renewal Number" input field
        Then into "Existing Waiver Number to Renew" type "MD-2200.R00.00"
        Then type "MD-22005.R00.01" into the ID Input box
        Then Click the Submit Button without waiting
        Then verify "Existing Waiver Number to Renew" has no error messages
        Then verify the "1915(b) Waiver Renewal Number" error message is "Renewal Number must be in the format of SS-####.R##.00 or SS-#####.R##.00 For renewals, the “R##” starts with '01' and ascends."
        Then clear "Existing Waiver Number to Renew" input field
        Then clear "1915(b) Waiver Renewal Number" input field
        Then into "Existing Waiver Number to Renew" type "MD-2200-R00.00"
        Then type "MD-29999.R50.00" into the ID Input box
        Then Click the Submit Button without waiting
        Then verify the "Existing Waiver Number to Renew" error message is "The 1915(b) Waiver Renewal Number must be in the format of SS-####.R##.## or SS-#####.R##.##."
        Then verify "1915(b) Waiver Renewal Number" has no error messages
        Then clear "Existing Waiver Number to Renew" input field
        Then clear "1915(b) Waiver Renewal Number" input field
        Then into "Existing Waiver Number to Renew" type "MD-2200.R00.00"
        Then type "MD-29999.R50.00" into the ID Input box
        Then Click the Submit Button without waiting
        Then verify "Existing Waiver Number to Renew" has no error messages
        Then verify "1915(b) Waiver Renewal Number" has no error messages