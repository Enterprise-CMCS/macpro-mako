Feature: RAI Response for Medicaid SPA package view
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then Click on Filter Button
        Then click on Authority
        Then click Medicaid SPA check box
        Then click on Authority
        Then click on Status
        Then click RAI Issued checkbox
        Then Click on the close Filter Button

    Scenario: validate response to RAI from package details page
        Then copy the ID from the link in the first row
        Then click the SPA ID link in the first row
        Then verify Respond to Formal RAI action exists
        Then click on Respond to RAI package action
        Then verify the form is titled "Medicaid SPA Formal RAI Response Details"
        Then verify the attachment info descriptiion
        Then verify the attachment info link is for "Medicaid RAI"
        Then attach "adobe.pdf" file to attachment 1
    # Then Click the Submit Button without waiting
    # Then verify the modal pop-up is visible
    # Then verify the title of the modal pop-up is Do you want to submit your official formal RAI response
    # Then verify the detailed text in the modal contains you are submitting your official formal RAI Response to start the 90 day clock review process

    Scenario: validate response to RAI from package dashboard
        Then copy the ID from the link in the first row
        Then click the actions button in row one
        Then verify the Respond to Formal RAI button is displayed
        Then click the Respond to RAI button
        Then verify the form is titled "Medicaid SPA Formal RAI Response Details"
        Then attach "adobe.pdf" file to attachment 1
        Then into "Additional Information" type "This is just a test."
# Then Click the Submit Button without waiting
# Then verify the modal pop-up is visible
# Then verify the title of the modal pop-up is Do you want to submit your official formal RAI response
# Then verify the detailed text in the modal contains you are submitting your official formal RAI Response to start the 90 day clock review process
