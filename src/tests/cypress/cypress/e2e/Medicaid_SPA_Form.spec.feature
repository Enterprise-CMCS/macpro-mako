Feature: Package Dashboard: Medicaid SPA Form
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click on New Submission
        Then Click on State Plan Amendment SPA

    Scenario: Screen Enhance - Medicaid Eligibility, Enrollment, Administration, and Health Homes
        Then verify Medicaid SPA is a clickable option
        Then click on Medicaid SPA
        Then verify Medicaid Eligibility, Enrollment, Administration, and Health Homes is a clickable option
        Then click Medicaid Eligibility, Enrollment, Administration, and Health Homes
        Then verify page url contains "/medicaid-eligibility"
        Then verify the page header is "Medicaid Eligibility, Enrollment, Administration, and Health Homes"
        Then verify Enter the MACPro system button is visible and clickable

    Scenario: Screen Enhance - Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing
        Then verify Medicaid SPA is a clickable option
        Then click on Medicaid SPA
        Then verify Medicaid Alternative Benefits Plans ABP, and Medicaid Premiums and Cost Sharing is a clickable option
        Then click Medicaid Alternative Benefits Plans ABP, and Medicaid Premiums and Cost Sharing
        Then verify page url contains "/medicaid-abp"
        Then verify the page header is "Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing"
        Then verify Enter the MMDL System button is visible and clickable

    Scenario: Screen Enhance - All Other Medicaid SPA
        Then verify Medicaid SPA is a clickable option
        Then click on Medicaid SPA
        Then verify All Other Medicaid SPA Submissions is a clickable option
        Then click All Other Medicaid SPA Submissions
        Then verify page url contains "/medicaid-spa"
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "Medicaid SPA"

    Scenario: Create All Other Medicaid SPA Submission from package dashboard and search it
        Then click on Medicaid SPA
        Then click All Other Medicaid SPA Submissions
        Then into "SPA ID" type "MD-22-4234"
        Then set "Proposed Effective Date of Medicaid SPA" to 3 months from today
        Then attach "adobe.pdf" file to attachment 1
        Then attach "picture.jpg" file to attachment 2
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify submission successful message in the alert bar
        Then verify the SPAs tab is selected
        Then search for Medicaid SPA ID
        Then verify id number in the first row matches Medicaid SPA ID