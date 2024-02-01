Feature: Create a waiver Amendment
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user

    Scenario: Screen Enhance - Amendment
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b 4 FFS Selective Contracting waivers
        Then verify 1915b 4 FFS Selective Contracting Waiver Amendment is a clickable option
        Then click on 1915b 4 FFS Selective Contracting Waiver Amendment
        Then verify user is on new waiver amendment page
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "1915b Waiver"
    @focus
    Scenario: Existing Waiver Number to Amend Input Field format
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b 4 FFS Selective Contracting waivers
        Then click on 1915b 4 FFS Selective Contracting Waiver Amendment
        Then verify Waiver Authority contains "1915(b)(4) FFS Selective Contracting waivers"
        Then into "Existing Waiver Number to Amend" type "MD"
        Then into "1915(b) Waiver Amendment Number" type "MD-5533.R00.02"
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        Then attach "picture.jpg" file to attachment 1
        Then verify the "Existing Waiver Number to Amend" error message is "The waiver number entered does not appear to match our records. Please enter an approved initial or renewal waiver number, using a dash after the two character state abbreviation."
        Then verify the submit button is disabled
        Then clear "Existing Waiver Number to Amend" input field
        Then into "Existing Waiver Number to Amend" type "MD-2200.R00.00"
        Then verify "Existing Waiver Number to Amend" has no error messages
        Then verify the submit button is not disabled
        Then clear "Existing Waiver Number to Amend" input field
        Then into "Existing Waiver Number to Amend" type "MD"
        Then verify the "Existing Waiver Number to Amend" error message is "The waiver number entered does not appear to match our records. Please enter an approved initial or renewal waiver number, using a dash after the two character state abbreviation."
        Then verify the submit button is disabled
        Then clear "Existing Waiver Number to Amend" input field

    Scenario: 1915b Waiver Amendment Number Input Field format
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b 4 FFS Selective Contracting waivers
        Then click on 1915b 4 FFS Selective Contracting Waiver Amendment
        Then verify Waiver Authority contains "1915(b)(4) FFS Selective Contracting waivers"
        Then into "Existing Waiver Number to Amend" type "MD-2200.R00.00"
        Then into "1915(b) Waiver Amendment Number" type "MD"
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        Then attach "picture.jpg" file to attachment 1
        Then verify the "1915(b) Waiver Amendment Number" error message is "The 1915(b) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##"
        Then verify the "1915(b) Waiver Amendment Number" error message line 2 is "For amendments, the last two digits start with ‘01’ and ascends."
        Then verify the submit button is disabled
        Then clear "1915(b) Waiver Amendment Number" input field
        Then into "1915(b) Waiver Amendment Number" type "MD-5533.R00.02"
        Then verify "1915(b) Waiver Amendment Number" has no error messages
        Then verify the submit button is not disabled
        Then clear "1915(b) Waiver Amendment Number" input field
        Then into "1915(b) Waiver Amendment Number" type "MD"
        Then verify the "1915(b) Waiver Amendment Number" error message is "The 1915(b) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##"
        Then verify the "1915(b) Waiver Amendment Number" error message line 2 is "For amendments, the last two digits start with ‘01’ and ascends."
        Then verify the submit button is disabled
        Then clear "1915(b) Waiver Amendment Number" input field

    Scenario: create waiver amendment from package dashboard and search it
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b 4 FFS Selective Contracting waivers
        Then click on 1915b 4 FFS Selective Contracting Waiver Amendment
        Then verify Waiver Authority contains "1915(b)(4) FFS Selective Contracting waivers"
        Then into "Existing Waiver Number to Amend" type "MD-2200.R00.00"
        Then into "1915(b) Waiver Amendment Number" type "MD-5533.R00.03"
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify submission successful message in the alert bar
        Then verify the Waivers tab is selected
        Then search for "MD-5533.R00.03"
        Then verify id number in the first row matches new waiver amendment number "3"
