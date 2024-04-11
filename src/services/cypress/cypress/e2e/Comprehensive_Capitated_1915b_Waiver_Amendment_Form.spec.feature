Feature: 1915b Comprehensive Capitated Waiver Amendment
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on "1915(b) Comprehensive (Capitated) Waiver Authority" choice

    Scenario: Screen Enhance - Amendment
        Then verify "1915(b) Comprehensive (Capitated) Waiver Amendment" choice goes to "/new-submission/waiver/b/capitated/amendment/create"
        Then click on "1915(b) Comprehensive (Capitated) Waiver Amendment" choice
        Then verify user is on new waiver amendment page
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "1915b Waiver"

    Scenario: Verify pre-print and spreadsheet are both required
        Then click on "1915(b) Comprehensive (Capitated) Waiver Amendment" choice
        Then into "Existing Waiver Number to Amend" type "MD-1000.R00.00"
        Then type the generated "1915(b) Waiver Amendment Number" Number 1 into the ID Input box using the state "MD"
        Then Click the Submit Button without waiting
        Then verify the "Proposed Effective Date" error message is "Required"
        Then verify the "first attachment" error message is "Required"
        Then verify the "second attachment" error message is "Required"
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        Then Click the Submit Button without waiting
        Then verify "Proposed Effective Date" has no error messages
        Then attach "excel.xlsx" file to attachment 2
        Then Click the Submit Button without waiting
        Then verify "second attachment" has no error messages
        Then attach "excel.xlsx" file to attachment 1
        Then clear the ID Input box
        Then Click the Submit Button without waiting
        Then verify "first attachment" has no error messages

    Scenario: create waiver amendment from package dashboard and search it
        Then click on "1915(b) Comprehensive (Capitated) Waiver Amendment" choice
        Then into "Existing Waiver Number to Amend" type "MD-1000.R00.00"
        Then type the generated "1915(b) Waiver Amendment Number" Number 1 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        Then attach "file.docx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This 1915(b) Waiver Amendment package was created by the test automation."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then click on the Waivers tab
        Then search for the generated "1915(b) Waiver Amendment Number" Number 1
        Then verify the id number in the first row matches the generated "1915(b) Waiver Amendment Number" Number 1

#TODO: it's currently not possible to create an amendment from an approved initial or renewal waiver in MAKO
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