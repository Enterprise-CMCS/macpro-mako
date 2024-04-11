Feature: Package Dashboard Temporary Extension
    Background: reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button

    Scenario: Verify user can create a temporary extension from new submission button - initial waiver
        Then click on New Submission
        Then Click on Waiver Action
        Then click on "Request Temporary Extension" choice
        Then select "1915(b)" as the Temporary Extension Type
        Then into "Approved Initial or Renewal Waiver Number" type "MD-1000.R00.00"
        Then type the "1915(b) Temporary Extension Request Number" Number 1 into the ID Input box using the state "MD"
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This an automated test to create a 1915(b) test."
        Then Click on Submit Button
        Then verify the message in the alert bar is "Temporary Extension issued"

    Scenario: Verify user can create a temporary extension from new submission button - renewal waiver
        Then click on New Submission
        Then Click on Waiver Action
        Then click on "Request Temporary Extension" choice
        Then select "1915(b)" as the Temporary Extension Type
        Then into "Approved Initial or Renewal Waiver Number" type "MD-22008.R01.00"
        Then type the "1915(b) Temporary Extension Request Number" Number 1 into the ID Input box using the state "MD"
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This an automated test to create a 1915(b) test."
        Then Click on Submit Button
        Then verify the message in the alert bar is "Temporary Extension issued"

    Scenario: Verify user can create a temporary extension from the initial waiver package details
        Then click on the Waivers tab
        Then search for "MD-1000.R00.00"
        Then verify id number in the first row matches "MD-1000.R00.00"
        Then click the Waiver Number link in the first row
        Then verify Request a Temporary Extension package action exists
        Then click Request a Temporary Extension package action
        Then verify the Temporary Extension Type is "1915(b)"
        Then verify "Approved Initial or Renewal Waiver Number" is prefilled
        Then type the "1915(b) Temporary Extension Request Number" Number 3 into the ID Input box using the state "MD"
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify the message in the alert bar is "Temporary Extension issued"

    Scenario: Verify user can create a temporary extension from the waiver renewal package details
        Then click on the Waivers tab
        Then search for "MD-22008.R01.00"
        Then verify id number in the first row matches "MD-22008.R01.00"
        Then click the Waiver Number link in the first row
        Then verify Request a Temporary Extension package action exists
        Then click Request a Temporary Extension package action
        Then verify the Temporary Extension Type is "1915(b)"
        Then verify "Approved Initial or Renewal Waiver Number" is prefilled
        Then type the "1915(b) Temporary Extension Request Number" Number 4 into the ID Input box using the state "MD"
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify the message in the alert bar is "Temporary Extension issued"

    Scenario: Verify user can create a temporary extension from the package dashboard waiver tab - initial
        Then click on the Waivers tab
        Then search for "MD-1000.R00.00"
        Then verify id number in the first row matches "MD-1000.R00.00"
        Then click the actions button in row one
        Then verify the Request Temporary Extension button is displayed
        Then click the Request Temporary Extension button
        Then verify the Temporary Extension Type is "1915(b)"
        Then verify "Approved Initial or Renewal Waiver Number" is prefilled
        Then type the "1915(b) Temporary Extension Request Number" Number 5 into the ID Input box using the state "MD"
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify the message in the alert bar is "Temporary Extension issued"

    Scenario: Verify user can create a temporary extension from the package dashboard waiver tab - renewal
        Then click on the Waivers tab
        Then search for "MD-22008.R01.00"
        Then verify id number in the first row matches "MD-22008.R01.00"
        Then click the actions button in row one
        Then verify the Request Temporary Extension button is displayed
        Then click the Request Temporary Extension button
        Then verify the Temporary Extension Type is "1915(b)"
        Then verify "Approved Initial or Renewal Waiver Number" is prefilled
        Then type the "1915(b) Temporary Extension Request Number" Number 6 into the ID Input box using the state "MD"
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify the message in the alert bar is "Temporary Extension issued"