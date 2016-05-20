"use strict";

const Q = require("q");
const config = require("./config.json");
const SqsStream = require("aws-sqs-stream").SqsStream;
// const MemoryStream = require("memory-stream");
const AWS = require("aws-sdk");
const errorCatcher = require("./helpers/error-catcher");
const AwsSqsPromises = require("./helpers/aws-sqs-promises");

var sqsOptions = {
  "awsConfig": {
    "accessKeyId": config.dataQueue.config.accessKeyId,
    "secretAccessKey": config.dataQueue.config.secretAccessKey,
    "region": config.dataQueue.config.region,
    "sslEnabled": config.dataQueue.config.sslEnabled
  },
  "QueueName": config.dataQueue.config.queueName,
  "QueueOptions":  {
    "MaxNumberOfMessages": 10,
    "WaitTimeSeconds": 20,
    "VisibilityTimeout": 15
  }
};

const SQS = new AWS.SQS(sqsOptions.awsConfig);
const awsSqsPromises = new AwsSqsPromises(SQS);

function getQueueUrl(queueName) {
  return awsSqsPromises.getQueueIdentifier(
    {
      "QueueName": queueName,
      "Attributes": {
        "MessageRetentionPeriod": `${config.dataQueue.config.defaultMessageRetentionPeriod}`,
        "VisibilityTimeout": `${config.dataQueue.config.defaultVisibilityTimeout}`
      }
    })
    .then(data => {
      return data.QueueUrl;
    });
}

function processQueue() {
  const defered = Q.defer();
  const readStream = new SqsStream(sqsOptions);
  const sqsClient = new AWS.SQS(sqsOptions.awsConfig);
  let chunk = 0;

  readStream.on("error", error => {
    errorCatcher(error);
    defered.reject(error);
  });

  readStream.on("data", function(data) {
    console.log(`Processing chunk ${++chunk}.`);
    console.log(`${data.MessageId}: ${data.Body}`);
    const deletedChunk = chunk;

    sqsClient.deleteMessage({
      "QueueUrl": sqsOptions.QueueUrl,
      "ReceiptHandle": data.ReceiptHandle
    }, function() {
      console.log(`Message from chunk ${deletedChunk} delete ack`);
    });
  });

  readStream.on("end", function() {
    defered.resolve();
  });

  return defered.promise;
}

function streamLoop() {
  processQueue()
    .then(() => console.log("All messages processed."))
    .catch(errorCatcher)
    .then(() => {
      console.log("Waiting 5 seconds then going to start again");
      setTimeout(streamLoop, 5000);
    })
    .done();
}

getQueueUrl(config.dataQueue.config.queueName)
  .then(queueUrl => {
    console.log(`URL for the queue ${sqsOptions.QueueName} is ${queueUrl}`);
    sqsOptions.QueueUrl = queueUrl;
  })
  .catch(errorCatcher)
  .then(() => {
    streamLoop();

    // setTimeout(() => {
    //   console.log("Pausing");
    //   readStream.pause();
    //   setTimeout(() => {
    //     console.log("Resuming");
    //     readStream.resume();
    //   }, 5000);
    // }, 1000);

  })
  .catch(errorCatcher)
  .done();



// writeStream.on("finish", function() {
//   //console.log(writeStream.get());
// });

// readStream.pipe(writeStream);

