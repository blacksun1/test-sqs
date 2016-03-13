"use strict";

const Q = require("q");

class AwsSqsPromises {

  constructor(SQS) {
    this.SQS_ = SQS;
  }

  deleteMessageBatch(queueUrl, entries) {
    const params = {
      "QueueUrl": queueUrl,
      "Entries": []
    };

    params.Entries = entries.map((entry, index) => {
      return {
        "Id": index.toString(),
        "ReceiptHandle": entry
      };
    });

    return Q.nfcall(this.SQS_.deleteMessageBatch.bind(this.SQS_), params)
      .tap(data => {
        if (data.Failed.length > 0) {
          console.error("Some messages failed to be deleted.");
        }
      });
  }

  getQueueAttributes(queueUrl) {
    const params = {
      "QueueUrl": queueUrl,
      "AttributeNames": [
        "QueueArn", "ApproximateNumberOfMessages", "ApproximateNumberOfMessagesNotVisible", "ApproximateNumberOfMessagesDelayed"
      ]
    };

    return Q.nfcall(this.SQS_.getQueueAttributes.bind(this.SQS_), params);
  }

  getQueueIdentifier(queueOptions) {
    return Q.Promise((resolve, reject) => {
      this.SQS_.getQueueUrl({"QueueName": queueOptions.QueueName}, (err, data) => {
        if (err) {
          if (err.code === "AWS.SimpleQueueService.NonExistentQueue") {
            this.SQS_.createQueue({
              "QueueName": queueOptions.QueueName,
              "Attributes": queueOptions.Attributes
            }, (err, data) => {
              if (err) {
                return reject(new Error(`Could not create the queue with name ${queueOptions.queueName}. ${err.code}`));
              }

              return resolve({"QueueUrl": data.QueueUrl, "CreatedNew": true});
            });
          } else {
            return reject(new Error(`Could not get the URL with name ${queueOptions.queueName}. Error is ${err.code}`));
          }
        } else {
          return resolve({
            "QueueUrl": data.QueueUrl,
            "CreatedNew": false
          });
        }
      });
    });
  }

  receiveMessages(queueUrl, maxNumberOfMessages) {
    const params = {
      "QueueUrl": queueUrl,
      "MaxNumberOfMessages": typeof maxNumberOfMessages === "undefined" ? 10 : maxNumberOfMessages,
      "WaitTimeSeconds": 2
    };

    return Q.nfcall(this.SQS_.receiveMessage.bind(this.SQS_), params);
  }

  sendMessage(queueUrl, messageBody, delaySeconds, attributes) {
    delaySeconds = typeof delaySeconds === "undefined" ? 0 : delaySeconds;
    attributes = typeof attributes === "undefined" ?  {} : attributes;

    const params = {
      "MessageBody": messageBody,
      "QueueUrl": queueUrl,
      "DelaySeconds": delaySeconds,
      "MessageAttributes": attributes
    };

    return Q.nfcall(this.SQS_.sendMessage.bind(this.SQS_), params);
  }

}

module.exports = AwsSqsPromises;
