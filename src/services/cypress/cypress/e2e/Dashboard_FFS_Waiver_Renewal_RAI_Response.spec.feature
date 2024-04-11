Feature: RAI Response for FFS Waiver Renewal
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on "1915(b)(4) FFS Selective Contracting Waivers" choice
        Then click on "1915(b)(4) FFS Selective Contracting Renewal Waiver" choice
        Then into "Existing Waiver Number to Renew" type "MD-1000.R00.00"

    Scenario: create package, issue RAI and validate response to FFS Selective Contracting RAI from package dashboard
        Then type the generated "1915(b) Waiver Renewal Number" Number 3 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of 1915(b) Waiver Renewal" to 3 months from today
        Then attach "file.docx" file to attachment 1
        Then into "Additional Information" type "This Renewal Waiver package was created by the test automation."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then Click on My Account
        Then click the sign out button
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then search for the generated "1915(b) Waiver Renewal Number" Number 3
        Then verify the id number in the first row matches the generated "1915(b) Waiver Renewal Number" Number 3
        Then click the actions button in row one
        Then click the Issue Formal RAI button
        Then attach "file.docx" file to attachment 1
        Then into "Additional Information" type "This is an automated test to issue a formal rai."
        Then Click on Submit Button
        Then verify the message in the alert bar is "RAI issued"
        Then Click on My Account
        Then click the sign out button
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then search for the generated "1915(b) Waiver Renewal Number" Number 3
        Then verify the id number in the first row matches the generated "1915(b) Waiver Renewal Number" Number 3
        Then click the actions button in row one
        Then click the Respond to RAI button
        Then verify "Waiver Number" is prefilled
        Then verify the attachment info descriptiion
        #Then verify the attachment info link is for "Waiver RAI"
        Then attach "adobe.pdf" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify the message in the alert bar is "RAI response submitted"

    Scenario: create package, issue RAI and validate response to FFS Selective Contracting RAI from package details page
        Then type the generated "1915(b) Waiver Renewal Number" Number 9 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of 1915(b) Waiver Renewal" to 3 months from today
        Then attach "file.docx" file to attachment 1
        Then into "Additional Information" type "This Renewal Waiver package was created by the test automation."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then Click on My Account
        Then click the sign out button
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then search for the generated "1915(b) Waiver Renewal Number" Number 9
        Then verify the id number in the first row matches the generated "1915(b) Waiver Renewal Number" Number 9
        Then click the Waiver Number link in the first row
        Then click the details page Issue Formal RAI button
        Then attach "file.docx" file to attachment 1
        Then into "Additional Information" type "This is an automated test to issue a formal rai."
        Then Click on Submit Button
        Then verify the message in the alert bar is "RAI issued"
        Then Click on My Account
        Then click the sign out button
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then search for the generated "1915(b) Waiver Renewal Number" Number 9
        Then verify the id number in the first row matches the generated "1915(b) Waiver Renewal Number" Number 9
        Then click the Waiver Number link in the first row
        Then click on Respond to RAI package action
        Then verify "Waiver Number" is prefilled
        Then verify the attachment info descriptiion
        #Then verify the attachment info link is for "Waiver RAI"
        Then attach "adobe.pdf" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify the message in the alert bar is "RAI response submitted"