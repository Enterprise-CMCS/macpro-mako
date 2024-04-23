Feature: 1915(b)(4) FFS Selective Contracting New Initial Waiver Form
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on "1915(b)(4) FFS Selective Contracting Waivers" choice

    Scenario: Screen Enhance - 1915(b)(4) FFS Selective Contracting Initial Waiver
        Then verify "1915(b)(4) FFS Selective Contracting New Initial Waiver" choice goes to "/new-submission/waiver/b/b4/initial/create"
        Then click on "1915(b)(4) FFS Selective Contracting New Initial Waiver" choice
        Then verify user is on new initial waiver page
        Then verify the attachment info descriptiion
    #Then verify the attachment info link is for "1915b Waiver"

    Scenario: Verify 1915(b)(4) FFS Selective Contracting (Streamlined) Waiver Application Pre-print is required
        Then click on "1915(b)(4) FFS Selective Contracting New Initial Waiver" choice
        Then verify Waiver Authority contains "1915(b)"
        Then type the generated "Initial Waiver Number" Number 4 into the ID Input box using the state "MD"
        Then Click the Submit Button without waiting
        Then verify the "Proposed Effective Date" error message is "Required"
        Then verify the "first attachment" error message is "Required"
        Then set "Proposed Effective Date of 1915(b) Initial Waiver" to 3 months from today
        Then Click the Submit Button without waiting
        Then verify "Proposed Effective Date" has no error messages
        Then attach "excel.xlsx" file to attachment 1
        Then clear the ID Input box
        Then Click the Submit Button without waiting
        Then verify "first attachment" has no error messages

    Scenario: create initial waiver from package dashboard and search it
        Then click on "1915(b)(4) FFS Selective Contracting New Initial Waiver" choice
        Then type the generated "Initial Waiver Number" Number 4 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of 1915(b) Initial Waiver" to 3 months from today
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This Initial Waiver package was created by the test automation."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then click on the Waivers tab
        Then search for the generated "Initial Waiver Number" Number 4
        Then verify the id number in the first row matches the generated "Initial Waiver Number" Number 4
