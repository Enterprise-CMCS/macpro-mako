Feature: Verify user can withdraw a 1915(b) Waiver Amendment in Under Review Status in the package dashboard
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions

    Scenario: Screen Enhance - Validate Waiver Amendment Withdrawal Page from dashboard
        Then click on "1915(b) Comprehensive (Capitated) Waiver Authority" choice
        Then click on "1915(b) Comprehensive (Capitated) Waiver Amendment" choice
        Then into "Existing Waiver Number to Amend" type "MD-1000.R00.00"
        Then type the generated "1915(b) Waiver Amendment Number" Number 3 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        #Then into "Subject" type "Waiver Amendment Withdrawal Cypress Regression Test"
        #Then into "Description" type "This package was created while running the test automation."
        Then attach "file.docx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This Waiver Amendment package was created by the test automation."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then search for the generated "1915(b) Waiver Amendment Number" Number 3
        Then verify the id number in the first row matches the generated "1915(b) Waiver Amendment Number" Number 3
        Then click the actions button in row one
        Then click withdraw package button
        Then verify the form is titled "Withdraw Waiver"
        Then verify "Supporting Documentation" is an Attachment Type
        Then verify form cancel button exists
        Then click form cancel button
        Then click Return to form
        Then Click the Submit Button without waiting
        Then click yes, withdraw package button without waiting
        Then verify the form error message is "An Attachment or Additional Information is required."
        Then into "Additional Information" type "This Waiver Amendment package was withdrawn by the test automation."
        Then Click the Submit Button without waiting
        Then click yes, withdraw package button
        Then verify the message in the alert bar is "Package withdrawn"

    Scenario: Screen Enhance - Validate Waiver Amendment Withdrawal Page from details page
        Then click on "1915(b) Comprehensive (Capitated) Waiver Authority" choice
        Then click on "1915(b) Comprehensive (Capitated) Waiver Amendment" choice
        Then into "Existing Waiver Number to Amend" type "MD-1000.R00.00"
        Then type the generated "1915(b) Waiver Amendment Number" Number 4 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        #Then into "Subject" type "Waiver Amendment Withdrawal Cypress Regression Test"
        #Then into "Description" type "This package was created while running the test automation."
        Then attach "file.docx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This Waiver Amendment package was created by the test automation."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then search for the generated "1915(b) Waiver Amendment Number" Number 4
        Then verify the id number in the first row matches the generated "1915(b) Waiver Amendment Number" Number 4
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then click withdraw button
        Then verify the form is titled "Withdraw Waiver"
        Then verify "Supporting Documentation" is an Attachment Type
        Then verify form cancel button exists
        Then click form cancel button
        Then click Return to form
        Then Click the Submit Button without waiting
        Then click yes, withdraw package button without waiting
        Then verify the form error message is "An Attachment or Additional Information is required."
        Then attach "adobe.pdf" file to attachment 1
        Then Click the Submit Button without waiting
        Then click yes, withdraw package button
        Then verify the message in the alert bar is "Package withdrawn"

    Scenario: Screen Enhance - Validate Waiver Amendment Withdrawal Page from dashboard
        Then click on "1915(b)(4) FFS Selective Contracting Waivers" choice
        Then click on "1915(b)(4) FFS Selective Contracting Waiver Amendment" choice
        Then into "Existing Waiver Number to Amend" type "MD-1000.R00.00"
        Then type the generated "1915(b) Waiver Amendment Number" Number 5 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        #Then into "Subject" type "Waiver Amendment Withdrawal Cypress Regression Test"
        #Then into "Description" type "This package was created while running the test automation."
        Then attach "file.docx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This Waiver Amendment package was created by the test automation."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then search for the generated "1915(b) Waiver Amendment Number" Number 5
        Then verify the id number in the first row matches the generated "1915(b) Waiver Amendment Number" Number 5
        Then click the actions button in row one
        Then click withdraw package button
        Then verify the form is titled "Withdraw Waiver"
        Then verify "Supporting Documentation" is an Attachment Type
        Then verify form cancel button exists
        Then click form cancel button
        Then click Return to form
        Then Click the Submit Button without waiting
        Then click yes, withdraw package button without waiting
        Then verify the form error message is "An Attachment or Additional Information is required."
        Then attach "adobe.pdf" file to attachment 1
        Then Click the Submit Button without waiting
        Then click yes, withdraw package button
        Then verify the message in the alert bar is "Package withdrawn"

    Scenario: Screen Enhance - Validate Waiver Amendment Withdrawal Page from details page
        Then click on "1915(b)(4) FFS Selective Contracting Waivers" choice
        Then click on "1915(b)(4) FFS Selective Contracting Waiver Amendment" choice
        Then into "Existing Waiver Number to Amend" type "MD-1000.R00.00"
        Then type the generated "1915(b) Waiver Amendment Number" Number 6 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of 1915(b) Waiver Amendment" to 3 months from today
        #Then into "Subject" type "Waiver Amendment Withdrawal Cypress Regression Test"
        #Then into "Description" type "This package was created while running the test automation."
        Then attach "file.docx" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This Waiver Amendment package was created by the test automation."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then search for the generated "1915(b) Waiver Amendment Number" Number 6
        Then verify the id number in the first row matches the generated "1915(b) Waiver Amendment Number" Number 6
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then click withdraw button
        Then verify the form is titled "Withdraw Waiver"


        Then verify "Supporting Documentation" is an Attachment Type
        Then verify form cancel button exists
        Then click form cancel button
        Then click Return to form
        Then Click the Submit Button without waiting
        Then click yes, withdraw package button without waiting
        Then verify the form error message is "An Attachment or Additional Information is required."
        Then into "Additional Information" type "This Waiver Amendment package was withdrawn by the test automation."
        Then Click the Submit Button without waiting
        Then click yes, withdraw package button
        Then verify the message in the alert bar is "Package withdrawn"