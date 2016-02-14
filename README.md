# test-sqs

## What does it do?

Not a lot.

* Grab the specified queue if it exists. If it doesn't it will create it.
* Request and show the `QueueArn`, `ApproximateNumberOfMessages`, `ApproximateNumberOfMessagesNotVisible`, `ApproximateNumberOfMessagesDelayed` of the queue.
* Sets up a bunch of "BaseApp" objects.
	* One App is Client - it sticks messages on the queue.
	* The other App is Server - it pulls some messages off of the queue and then deletes them.
* Starts them all up.
* Shows being able to pause everything and start it back up again.
* Shut it all down when the application gets a SIGINT.

## Install

Clone it and make sure you have have node 4.3 or higher installed then run.

Make a copy of `config.json.default` to `config.json` and add in your AWS details with a user account that that has full access SQS access.

```bash
npm install
npm start
```
