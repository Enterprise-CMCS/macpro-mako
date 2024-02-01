Feature: Create a waiver Amendment

    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user

    Scenario: Screen Enhance - Amendment
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b Comprehensive Capitated Waiver Authority
        Then verify 1915b Comprehensive Capitated Waiver Amendment is a clickable option
        Then click on 1915b Comprehensive Capitated Waiver Amendment
        Then verify user is on new waiver amendment page
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "1915b Waiver"

    Scenario: Existing Waiver Number to Amend Input Field format
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b Comprehensive Capitated Waiver Authority
        Then click on 1915b Comprehensive Capitated Waiver Amendment
        Then verify Waiver Authority contains "All other 1915(b) Waivers"
        Then into "Existing Waiver Number to Amend" type "MD"
        Then into "1915(b) Waiver Amendment Number" type "MD-5533.R00.02"
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        Then attach "excel.xlsx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then verify the "Existing Waiver Number to Amend" error message is "The waiver number entered does not appear to match our records. Please enter an approved initial or renewal waiver number, using a dash after the two character state abbreviation."
        Then verify the submit button is disabled
        Then clear "Existing Waiver Number to Amend" input field
        Then into "Existing Waiver Number to Amend" type "MD-2200.R00.00"
        Then verify Parent ID error message is not present
        Then verify the submit button is not disabled
        Then clear "Existing Waiver Number to Amend" input field
        Then into "Existing Waiver Number to Amend" type "MD-11"
        Then verify the "Existing Waiver Number to Amend" error message is "The waiver number entered does not appear to match our records. Please enter an approved initial or renewal waiver number, using a dash after the two character state abbreviation."
        Then verify the submit button is disabled
        Then clear "Existing Waiver Number to Amend" input field

    Scenario: 1915b Waiver Amendment Number Input Field format
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b Comprehensive Capitated Waiver Authority
        Then click on 1915b Comprehensive Capitated Waiver Amendment
        Then verify Waiver Authority contains "All other 1915(b) Waivers"
        Then into "Existing Waiver Number to Amend" type "MD-2200.R00.00"

        Then into "1915(b) Waiver Amendment Number" type "MD"
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        Then attach "excel.xlsx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then verify the "1915(b) Waiver Amendment Number" error message is "The 1915(b) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##"
        Then verify the "1915(b) Waiver Amendment Number" error message line 2 is "For amendments, the last two digits start with ‘01’ and ascends."
        Then verify the submit button is disabled
        Then clear "1915(b) Waiver Amendment Number" input field
        Then into "1915(b) Waiver Amendment Number" type "MD-5533.R00.02"
        Then verify ID error message is not present
        Then verify the submit button is not disabled
        Then clear "1915(b) Waiver Amendment Number" input field
        Then into "1915(b) Waiver Amendment Number" type "MD"
        Then verify the "1915(b) Waiver Amendment Number" error message is "The 1915(b) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##"
        Then verify the "1915(b) Waiver Amendment Number" error message line 2 is "For amendments, the last two digits start with ‘01’ and ascends."
        Then verify the submit button is disabled
        Then clear "1915(b) Waiver Amendment Number" input field

    Scenario: Verify pre-print and spreadsheet are both required
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b Comprehensive Capitated Waiver Authority
        Then click on 1915b Comprehensive Capitated Waiver Amendment
        Then verify Waiver Authority contains "All other 1915(b) Waivers"
        Then into "Existing Waiver Number to Amend" type "MD-2200.R00.00"
        Then into "1915(b) Waiver Amendment Number" type "MD-5533.R00.02"
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        Then attach "excel.xlsx" file to attachment 2
        Then verify the submit button is disabled
        Then attach "excel.xlsx" file to attachment 1
        Then verify the submit button is not disabled

    Scenario: create waiver amendment from package dashboard and search it
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b Comprehensive Capitated Waiver Authority
        Then click on 1915b Comprehensive Capitated Waiver Amendment
        Then verify Waiver Authority contains "All other 1915(b) Waivers"
        Then into "Existing Waiver Number to Amend" type "MD-2200.R00.00"
        Then into "1915(b) Waiver Amendment Number" type "MD-5533.R00.01"
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        Then attach "excel.xlsx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify submission successful message in the alert bar
        Then verify the Waivers tab is selected
        Then search for "MD-5533.R00.01"
        Then verify id number in the first row matches new waiver amendment number "1"

#need more time to consider hwo to test with different authority parent
# Scenario: Verify user can create an amendment from the package details Mini-Dashboard
#     Then click on the Waivers tab
#     Then search for approved Initial Waiver Number 1
#     Then click the Waiver Number link in the first row
#     Then verify Add Amendment package action exists
#     Then click Add Amendment package action
#     Then verify Waiver Authority contains "All other 1915(b) Waivers"
#     Then type new waiver amendment number 5 in 1915b Waiver Amendment Number field
#     Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
#     Then attach "excel.xlsx" file to attachment 1
#     Then attach "excel.xlsx" file to attachment 2
#     Then into "Additional Information" type "This is just a test."
#     Then Click on Submit Button
#     Then verify submission successful message in the alert bar

# Scenario: Verify user can create an amendment from the package dashboard waiver tab
#     Then click on the Waivers tab
#     Then search for approved Initial Waiver Number 1
#     Then click the actions button in row one
#     Then verify the Add Amendment button is displayed
#     Then verify Waiver Authority contains "All other 1915(b) Waivers"
#     Then type new waiver amendment number 6 in 1915b Waiver Amendment Number field
#     Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
#     Then attach "excel.xlsx" file to attachment 1
#     Then attach "excel.xlsx" file to attachment 2
#     Then into "Additional Information" type "This is just a test."
#     Then Click on Submit Button
#     Then verify submission successful message in the alert bar