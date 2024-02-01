Feature: 1915b Comprehensive Capitated Initial Waiver
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b Comprehensive Capitated Waiver Authority

    Scenario: Screen Enhance - Initial Waiver
        Then verify 1915b Comprehensive Capitated New Initial Waiver is a clickable option
        Then click on 1915b Comprehensive Capitated New Initial Waiver
        Then verify user is on new initial waiver page
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "1915b Waiver"

    Scenario: Initial Waiver number format
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

    Scenario: Verify pre-print and spreadsheet are both required
        Then click on 1915b Comprehensive Capitated New Initial Waiver
        Then verify Waiver Authority contains "All other 1915(b) Waivers"
        Then type "MD-99331.R00.00" into the ID Input box
        Then set "Proposed Effective Date of 1915(b) Initial Waiver" to 3 months from today
        Then attach "excel.xlsx" file to attachment 2
        Then verify the submit button is disabled
        #        Then Remove file for 1915b Comprehensive Capitated Waiver Cost Effectiveness Spreadsheets
        #        Then attach "excel.xlsx" file to attachment 1
        #        Then verify the submit button is disabled
        Then attach "excel.xlsx" file to attachment 1
        Then verify the submit button is not disabled

    Scenario: create initial waiver from package dashboard and search it
        Then click on 1915b Comprehensive Capitated New Initial Waiver
        Then verify Waiver Authority contains "All other 1915(b) Waivers"
        Then type "MD-33463.R00.00" into the ID Input box
        Then set "Proposed Effective Date of 1915(b) Initial Waiver" to 3 months from today
        Then attach "excel.xlsx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify submission successful message in the alert bar
        Then verify the Waivers tab is selected
        Then search for Initial Waiver Number 1 with 12 Characters
        Then verify id number in the first row matches Initial Waiver Number 1
