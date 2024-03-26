Feature: Appendix K Waiver Type Selection
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on Waiver Action

    Scenario: Screen Enhance - Appendix K
        Then verify Appendix K is a clickable option
        Then Click on Appendix K Amendment
        Then verify user is on new Appendix K page
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "Appendix K"

    Scenario: Verify the Waiver Number format on Appendix K Form
        Then Click on Appendix K Amendment
        Then type "Appendix K Submission 1" into Amendment Title field
        Then type "MD-22106.R01.03" into the ID Input box
        Then attach "adobe.pdf" file to attachment 1
        Then set "Proposed Effective Date of 1915(c) Appendix K Amendment" to 3 months from today
        Then verify ID error message is not present
        Then verify the submit button is not disabled
        Then clear the ID Input box
        Then type "MD.1236" into the ID Input box
        Then verify the ID error message is "The Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##"
        Then verify the ID error message has a second line with "For amendments, the last two digits start with ‘01’ and ascends."
        Then verify the submit button is disabled
        Then clear the ID Input box
        Then type "MD-22106.R01.03" into the ID Input box
        Then verify ID error message is not present
        Then verify the submit button is not disabled

    Scenario: create Appendix K from package dashboard and search it
        Then Click on Appendix K Amendment
        Then type "Appendix K Submission 1" into Amendment Title field
        Then type "MD-22106.R01.02" into the ID Input box
        Then set "Proposed Effective Date of 1915(c) Appendix K Amendment" to 3 months from today
        Then into "Subject" type "Cypress Regression Test"
        Then into "Description" type "This package was creating while running the test automation."
        Then attach "adobe.pdf" file to attachment 1
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify submission successful message in the alert bar
        Then verify the Waivers tab is selected
        Then search for "MD-22106.R01.02"
        Then verify id number in the first row matches "MD-22106.R01.02"
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Submitted"
        Then verify package actions header is visible
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify the waiver authority header exists
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Amendment Title header in the details section
        Then verify the Amendment Title is "Appendix K Submission 1"
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section