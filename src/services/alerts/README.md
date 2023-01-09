# alerts

The template in this service deploys an SNS topic that is triggered by an EventBridge rule. The SNS topic policy provides the permission for EventBridge to invoke the SNS topic.

The EventBridge rules defined alongside various ECS services within this project filters the events based upon the criteria in the EventPattern section. When matching events are sent to EventBridge that trigger the rule, they are delivered to the SNS topic.

The pattern of this flow is shown below:

![Screen Shot 2022-08-12 at 8 16 24 AM](https://user-images.githubusercontent.com/3784116/184372901-a952a218-54c4-4e0c-b8ab-de3e160ee2fc.png)

The SNS Subscription service associated with the topic is managed manually, this allows for users to be added / removed without being deployed. Additionally, we can create subscription services in specific environments (val/prod).

## Testing

You can manually test events sent to EventBridge with the [AWS CLI](https://aws.amazon.com/cli/)

1. First, subscribe your email address to the SNS topic either by creating the service in the console or using the aws cli.
   ```bash
   aws sns subscribe --topic-arn ENTER_YOUR_TOPIC_ARN --protocol email --notification-endpoint ENTER_YOUR_EMAIL_ADDRESS
   ```
1. Click the confirmation link delivered to your email to verify the endpoint.
1. Create a test event to send EventBridge. You will need the cluster arn for the service you would like to test events for. (Seatool, LMDC, etc.) Once you have that, run this script and it will create a test-event for you.
   ```bash
   sh create-test-event.sh
   ```
1. Send the event to EventBridge:
   ```bash
   aws events put-events --entries file://test-event.json
   ```
1. The event is delivered to your email address.
