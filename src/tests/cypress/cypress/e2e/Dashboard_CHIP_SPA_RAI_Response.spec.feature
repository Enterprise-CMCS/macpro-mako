Feature: RAI Response for CHIP SPA package view
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then click on "State Plan Amendment (SPA)" choice
        Then click on "CHIP SPA" choice
        Then click on "All Other CHIP SPA Submissions" choice

    Scenario: Validate response to RAI page from the Package details page
        Then type the generated "CHIP SPA" Number 4 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of CHIP SPA" to 3 months from today
        Then into "Subject" type "Cypress Regression Test"
        Then into "Description" type "This package was created while running the test automation."
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "CHIP SPA"
        Then attach "picture.jpg" file to attachment 1
        Then attach "adobe.pdf" file to attachment 2
        Then attach "adobe.pdf" file to attachment 3
        Then into "Additional Information" type "This is an automated test."
        Then Click the Submit Button without waiting
        Then verify package submitted message in the alert bar
        Then Click on My Account
        Then click the sign out button
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
        Then click the main Dashboard Button
        Then search for the generated "CHIP SPA" Number 4
        Then click the SPA ID link in the first row
        Then click the details page Issue Formal RAI button
        Then attach "file.docx" file to attachment 1
        Then into "Additional Information" type "This is an automated test to issue a formal rai."
        Then Click the Submit Button without waiting
        Then verify the message in the alert bar is "RAI Issued"
        Then Click on My Account
        Then click the sign out button
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then search for the generated "CHIP SPA" Number 4
        Then click the SPA ID link in the first row
        Then verify Respond to Formal RAI action exists
        Then click on Respond to RAI package action
        Then verify the form is titled "CHIP SPA Formal RAI Response Details"
        Then verify the attachment info descriptiion
        Then attach "file.docx" file to attachment 1
        Then attach "picture.jpg" file to attachment 2
        Then Click the Submit Button without waiting
        Then verify the message in the alert bar is "RAI response submitted"

    Scenario: Validate response to RAI from the Package page
        Then type the generated "CHIP SPA" Number 5 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of CHIP SPA" to 3 months from today
        Then into "Subject" type "Cypress Regression Test"
        Then into "Description" type "This package was created for an RAI test."
        Then attach "picture.jpg" file to attachment 1
        Then attach "adobe.pdf" file to attachment 2
        Then attach "adobe.pdf" file to attachment 3
        Then into "Additional Information" type "This is an automated test."
        Then Click the Submit Button without waiting
        Then verify package submitted message in the alert bar
        Then Click on My Account
        Then click the sign out button
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
        Then click the main Dashboard Button
        Then search for the generated "CHIP SPA" Number 5
        Then click the actions button in row one
        Then click the Issue Formal RAI button
        Then attach "file.docx" file to attachment 1
        Then into "Additional Information" type "This is an automated test to issue a formal rai."
        Then Click the Submit Button without waiting
        Then verify the message in the alert bar is "RAI Issued"
        Then Click on My Account
        Then click the sign out button
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then search for the generated "CHIP SPA" Number 5
        Then click the actions button in row one
        Then verify the Respond to Formal RAI button is displayed
        Then click the Respond to RAI button
        Then verify the form is titled "CHIP SPA Formal RAI Response Details"
        Then attach "adobe.pdf" file to attachment 1
        Then attach "excel.xlsx" file to attachment 2
        Then into "Additional Information" type "This is just a test."
        Then Click the Submit Button without waiting
        Then verify the message in the alert bar is "RAI response submitted"
