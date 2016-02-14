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

```bash
npm install
Q_DEBUG=1 node index.js
```
