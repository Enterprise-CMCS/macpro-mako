echo "Enter cluster ARN"
read clusterArn
echo "[{\"DetailType\":\"ECS Task State Change\",\"Source\":\"demo.cli\",\"Detail\":\"{\\\"msg\\\":\\\"Something is wrong with the ecs instance\\\", \\\"lastStatus\\\": [\\\"STOPPED\\\"], \\\"stoppedReason\\\": \\\"Essential container in task exited\\\", \\\"clusterArn\\\": \\\"${clusterArn}\\\"}\"}]" > test-event.json
echo "A test event has been created at test-event.json - modify it to your needs. Wanna send it now? Run:"
echo "aws events put-events --entries file://test-event.json"