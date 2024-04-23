Feature: Package Dashboard: CHIP SPA Initial Submission
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then click on "State Plan Amendment (SPA)" choice
        Then verify "CHIP SPA" choice goes to "/new-submission/spa/chip"
        Then click on "CHIP SPA" choice

    Scenario: Screen Enhance - CHIP Eligibility is Outside of OneMAC
        Then verify "CHIP Eligibility" choice goes to "/new-submission/spa/chip/landing/chip-eligibility"
        Then click on "CHIP Eligibility" choice
        Then verify the page header is "CHIP Eligibility SPAs"
        Then verify Enter the MMDL System button is visible and clickable

    Scenario: Create CHIP SPA Initial Submission in OneMAC using the All Other CHIP SPA Submissions choice
        Then verify "All Other CHIP SPA Submissions" choice goes to "/new-submission/spa/chip/create"
        Then click on "All Other CHIP SPA Submissions" choice
        Then verify the form title is "CHIP SPA Details"
        Then type the generated "CHIP SPA" Number 1 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of CHIP SPA" to 3 months from today
        #Then into "Subject" type "Cypress Regression Test"
        #Then into "Description" type "This package was created while running the test automation."
        Then verify the attachment info descriptiion
        #Then verify the attachment info link is for "CHIP SPA"
        Then attach "picture.jpg" file to attachment 1
        Then attach "adobe.pdf" file to attachment 2
        Then attach "adobe.pdf" file to attachment 3
        Then into "Additional Information" type "This is an automated test."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then verify the SPAs tab is selected
        Then click the main Dashboard Button
        Then search for the generated "CHIP SPA" Number 1
        Then verify the id number in the first row matches the generated "CHIP SPA" Number 1