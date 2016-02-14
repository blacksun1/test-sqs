"use strict";

const BaseApp = require("./base-app");
const errorCatcher = require("../helpers/error-catcher");

class ClientApp extends BaseApp {

  constructor(awsSqsPromises, queueUrl, interval) {
    super();
    this.awsSqsPromises_ = awsSqsPromises;
    this.queueUrl_ = queueUrl;
    this.interval_ = typeof interval === "undefined" ? 5000 : interval;

    this.paused = false;
    this.messages_ = [
      "I Like Cake",
      "Spinach is not tasty",
      "Please, try the fish",
      "London loves chicken",
      "Feed the man meat",
    ];
  }

  start() {
    if (typeof this.intervalRef_ === "undefined") {
      this.intervalRef_ = setInterval(this.ping.bind(this), this.interval_);
    }
    this.paused = false;
  }

  ping() {
    if (this.paused) {
      console.log("Client paused. Not doing anything at the moment.")
      return;
    }

    const messageBody = this.messages_[Math.floor(Math.random() * this.messages_.length)];

    this.awsSqsPromises_.sendMessage(this.queueUrl_, messageBody, 0)
      .tap(data => {
        console.log("Success! Placed a new message on the queue.");
      })
      .catch(errorCatcher)
      .done();
  }

  pause() {
    this.paused = true;
  }

  stop() {
    clearInterval(this.intervalRef_);
    this.intervalRef_ = undefined;
    console.log("Stopped client app");
  }

}

module.exports = ClientApp;
