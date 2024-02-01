Feature: Validate Waiver Form is checking ID format without period
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click on Packages
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b Comprehensive Capitated Waiver Authority

    Scenario: Verify Initial Waiver number errors when dash is used
        Then click on 1915b Comprehensive Capitated New Initial Waiver
        Then verify Waiver Authority contains "All other 1915(b) Waivers"
        Then into "Initial Waiver Number" type "MD.1055.R00.00"
        Then set "Proposed Effective Date of 1915(b) Initial Waiver" to 3 months from today
        Then attach "excel.xlsx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then verify the "Initial Waiver Number" error message is "The Initial Waiver Number must be in the format of SS-####.R00.00 or SS-#####.R00.00"
        Then verify the submit button is disabled
        Then clear the ID Input box
        Then type "MD-99331.R00.00" into the ID Input box
        Then verify ID error message is not present
        Then verify the submit button is not disabled
        Then clear the ID Input box
        Then into "Initial Waiver Number" type "MD.10555.R00.00"
        Then verify the "Initial Waiver Number" error message is "The Initial Waiver Number must be in the format of SS-####.R00.00 or SS-#####.R00.00"
        Then verify the submit button is disabled
        Then clear the ID Input box

    Scenario: Validate Waiver Form Logic for Waiver Amendment
        Then click on 1915b Comprehensive Capitated Waiver Amendment
        Then verify Waiver Authority contains "All other 1915(b) Waivers"
        Then into "Existing Waiver Number to Amend" type "MD-2200.R00.00"
        Then type "MD.123456" into the ID Input box
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        Then verify the "1915(b) Waiver Amendment Number" error message is "The 1915(b) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##"
        Then verify the "1915(b) Waiver Amendment Number" error message line 2 is "For amendments, the last two digits start with ‘01’ and ascends."
        Then attach "excel.xlsx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then verify the submit button is disabled
        Then clear the ID Input box
        Then type "MD-22005.R00.00" into the ID Input box
        Then verify the "1915(b) Waiver Amendment Number" error message is "The 1915(b) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##"
        Then verify the "1915(b) Waiver Amendment Number" error message line 2 is "For amendments, the last two digits start with ‘01’ and ascends."
        Then verify the submit button is disabled
        Then clear the ID Input box
        Then into "1915(b) Waiver Amendment Number" type "MD-12323.R01.01"
        Then verify ID error message is not present
        Then verify the submit button is not disabled


    Scenario: Validate Waiver Form Logic for Waiver Renewal and All other
        Then click on 1915b Comprehensive Capitated Renewal Waiver
        Then verify Waiver Authority contains "All other 1915(b) Waivers"
        Then type "MD-22005.R00.00" into the ID Input box
        Then attach "excel.xlsx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then verify the "1915(b) Waiver Renewal Number" error message is "The 1915(b) Waiver Renewal Number must be in the format of SS-####.R##.00 or SS-#####.R##.00"
        Then verify the "1915(b) Waiver Renewal Number" error message line 2 is "For renewals, the “R##” starts with ‘01’ and ascends."
        Then verify the submit button is disabled