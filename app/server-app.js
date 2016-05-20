"use strict";

const BaseApp = require("./base-app");
// const errorCatcher = require("../helpers/error-catcher");

class ServerApp extends BaseApp {

  // constructor(awsSqsStream, queueUrl, interval, queueStream) {
  constructor(queueStream, interval) {
    super();

    // this.awsSqsPromises_ = awsSqsPromises;
    // this.queueUrl_ = queueUrl;
    this.interval_ = typeof interval === "undefined" ? 5000 : interval;
    this.queueStream_ = queueStream;
    this.messageNumber_ = 0;

    this.paused = false;
  }

  start() {
    if (typeof this.intervalRef_ === "undefined") {
      this.intervalRef_ = setInterval(this.ping.bind(this), this.interval_);
    }
    this.paused = false;

    this.queueStream_.on("error", error => {
      console.error(error);
      this.queueStream_.pause();
    });

    this.queueStream_.on("data", data => {
      this.messageNumber_ += 1;
      console.log(`Message ${this.messageNumber_}`);
      console.log(JSON.stringify(data, null, 2));
      console.log("");
      // console.log(`Success! ${data.Messages.length} message${data.Messages.length > 1 ? "s": ""} received.`);
    });
  }

  pause() {
    this.paused = true;
    this.queueStream_.pause();
  }

  ping() {
    if (this.paused) {
      console.log("Server paused. Not doing anything at the moment.");
      return;
    }

    // this.awsSqsPromises_.receiveMessages(this.queueUrl_)
    //   .catch(errorCatcher)
    //   .tap(data => {
    //     if (typeof data === "undefined" || typeof data.Messages === "undefined") {
    //       console.log("Success! No messages received.");
    //     } else {
    //       console.log(`Success! ${data.Messages.length} message${data.Messages.length > 1 ? "s": ""} received.`);
    //     }
    //   })
    //   .then(data => {
    //     if (typeof data !== "undefined" && typeof data.Messages !== "undefined") {
    //       return this.awsSqsPromises_.deleteMessageBatch(this.queueUrl_, data.Messages.map(message => message.ReceiptHandle))
    //         .catch(errorCatcher)
    //         .tap(data => {
    //           console.log(`Success! ${data.Successful.length} message${data.Successful.length > 1 ? "s": ""} deleted.`);
    //         });
    //     }

    //     console.log("No messages to delete");
    //   })
    //   .done();

    return;
  }

  stop() {
    clearInterval(this.intervalRef_);
    this.intervalRef_ = undefined;
    console.log("Stopped server app");
  }

}

module.exports = ServerApp;
