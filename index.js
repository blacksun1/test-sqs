"use strict";

const Q = require("q");
const config = require("./config.json");
const AWS = require("aws-sdk");
const errorCatcher = require("./helpers/error-catcher");
const SQS = new AWS.SQS({
  "apiVersion": "2016-02-13",
  "accessKeyId": config.dataQueue.config.accessKeyId,
  "secretAccessKey": config.dataQueue.config.secretAccessKey,
  "region": config.dataQueue.config.region,
  "sslEnabled": config.dataQueue.config.sslEnabled
});
const second = 1000;
const seconds = 1000;

const AwsSqsPromises = require("./helpers/aws-sqs-promises");
const ClientApp = require("./app/client-app");
const ServerApp = require("./app/server-app");

const awsSqsPromises = new AwsSqsPromises(SQS);

let apps = [];

awsSqsPromises.getQueueIdentifier(
  {
    "QueueName": config.dataQueue.config.queueName,
    "Attributes": {
      "MessageRetentionPeriod": `${config.dataQueue.config.defaultMessageRetentionPeriod}`,
      "VisibilityTimeout": `${config.dataQueue.config.defaultVisibilityTimeout}`
    }
  })
  .catch(errorCatcher)
  .tap(data => {
    const queueUrl = data.QueueUrl;
    console.log(`Success! Ready to use Queue at ${queueUrl}.`);

    apps.push(new ClientApp(awsSqsPromises, queueUrl, second));
    apps.push(new ServerApp(awsSqsPromises, queueUrl, 3 * seconds));
  })
  .then(data => awsSqsPromises.getQueueAttributes(data.QueueUrl))
  .catch(errorCatcher)
  .tap(data => {
    console.log("Success! Got the queue attributes.", data);
  })

  // Start up all of our applications
  .then(() => Q.all(apps.map(app => app.start())))

  // Something went wrong while starting up the application. Bail out quick!
  .catch((err) => {
    errorCatcher(err);
    throw err;
  })

  // Shut the apps down nicely when the user hits CTRL+C or sends the
  // application a SIGINT.
  .then(() => {
    process.on("SIGINT", () => {
      console.log("Shutting everything down");
      Q.all(apps.map(app => app.stop()));
    });
  })

  // Pause the applications
  // The unref() is so that they don't stop the
  // application from shutting down.
  .then(() => setTimeout(() => {
    console.log("Pausing the application");
    Q.all(apps.map(app => app.pause()));
  }, 5 * seconds).unref())

  // Resume the applications
  // The unref() is so that they don't stop the
  // application from shutting down.
  .then(() => setTimeout(() => {
    console.log("Starting it back up again");
    Q.all(apps.map(app => app.start()));
  }, 10 * seconds).unref())

  .done();
