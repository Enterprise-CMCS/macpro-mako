Feature: Appendix K Waiver Type Selection
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on Waiver Action

    Scenario: Screen Enhance - Appendix K
        Then verify "1915(c) Appendix K Amendment" choice goes to "/new-submission/waiver/app-k"
        Then click on "1915(c) Appendix K Amendment" choice
        Then verify user is on new Appendix K page
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "Appendix K"

    Scenario: Verify the Waiver Number format on Appendix K Form
        Then click on "1915(c) Appendix K Amendment" choice
        Then type "Appendix K Submission 1" into Amendment Title field
        Then set the value of state select button to "Georgia"
        Then clear the ID Input box
        Then type "22106.R01.03" into the ID Input box
        Then attach "adobe.pdf" file to attachment 1
        Then set "Proposed Effective Date of 1915(c) Appendix K Amendment" to 3 months from today
        Then verify ID error message is not present
        Then verify the submit button is not disabled
        Then clear the ID Input box
        Then type ".1236" into the ID Input box
        Then verify the ID error message is "The Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##"
        Then verify the ID error message has a second line with "For amendments, the last two digits start with ‘01’ and ascends."
        Then verify the submit button is disabled
        Then clear the ID Input box
        Then type "22106.R01.03" into the ID Input box
        Then verify ID error message is not present
        Then verify the submit button is not disabled

    Scenario: create Appendix K from package dashboard and search it
        Then click on "1915(c) Appendix K Amendment" choice
        Then type "Appendix K Submission 1" into Amendment Title field
        Then verify Waiver Authority contains "1915(c)"
        Then set the value of state select button to "Georgia"
        Then type the generated "Appendix K ID" Number 1 into the ID Input box using the state "GA"
        Then set "Proposed Effective Date of 1915(c) Appendix K Amendment" to 3 months from today
        Then attach "adobe.pdf" file to attachment 1
        Then attach "file.docx" file to attachment 2
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar