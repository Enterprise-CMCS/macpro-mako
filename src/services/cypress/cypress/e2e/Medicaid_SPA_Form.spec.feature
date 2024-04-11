Feature: Package Dashboard: Medicaid SPA Form
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then click on "State Plan Amendment (SPA)" choice
        Then verify "Medicaid SPA" choice goes to "/new-submission/spa/medicaid"
        Then click on "Medicaid SPA" choice

    Scenario: Screen Enhance - Medicaid Eligibility, Enrollment, Administration, and Health Homes
        Then verify "Medicaid Eligibility, Enrollment, Administration, and Health Homes" choice goes to "/medicaid-eligibility"
        Then click on "Medicaid Eligibility, Enrollment, Administration, and Health Homes" choice
        Then verify the page header is "Medicaid Eligibility, Enrollment, Administration, and Health Homes"
        Then verify Enter the MACPro system button is visible and clickable

    Scenario: Screen Enhance - Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing
        Then verify "Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing" choice goes to "/medicaid-abp"
        Then click on "Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing" choice
        Then verify the page header is "Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing"
        Then verify Enter the MMDL System button is visible and clickable

    Scenario: Create All Other Medicaid SPA Submission from package dashboard and search it
        Then verify "All Other Medicaid SPA Submissions" choice goes to "/new-submission/spa/medicaid/create"
        Then click on "All Other Medicaid SPA Submissions" choice
        Then verify the form title is "Medicaid SPA Details"
        Then type the generated "Medicaid SPA" Number 1 into the ID Input box using the state "MD"
        Then set "Proposed Effective Date of Medicaid SPA" to 3 months from today
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "Medicaid SPA"
        Then attach "adobe.pdf" file to attachment 1
        Then attach "picture.jpg" file to attachment 2
        Then into "Additional Information" type "This is an automated test."
        Then Click on Submit Button
        Then verify package submitted message in the alert bar
        Then verify the SPAs tab is selected
        Then search for the generated "Medicaid SPA" Number 1
        Then verify the id number in the first row matches the generated "Medicaid SPA" Number 1