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
        Then verify page url contains "/chip-eligibility"
        Then verify the page header is "CHIP Eligibility SPAs"
        Then verify Enter the MMDL System button is visible and clickable


    Scenario: Create CHIP SPA Initial Submission in OneMAC using the All Other CHIP SPA Submissions choice
        Then verify "All Other CHIP SPA Submissions" choice goes to "/new-submission/spa/chip/create"
        Then click on "All Other CHIP SPA Submissions" choice
        Then verify page url contains "/spa/chip/create"
        Then verify the page header is "CHIP SPA Details"
        Then type the generated SPA ID into the ID Input box
        Then set "Proposed Effective Date of CHIP SPA" to 3 months from today
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "CHIP SPA"
        Then attach "picture.jpg" file to attachment 1
        Then attach "adobe.pdf" file to attachment 2
        Then attach "adobe.pdf" file to attachment 3
        Then into "Additional Information" type "This is just a test."
        Then Click the Submit Button without waiting
        Then verify submission successful message in the modal
        Then click the Go to Dashboard button
        Then verify the SPAs tab is selected
        Then search for the generated CHIP SPA ID
        #Then verify id number in the first row matches CHIP SPA ID