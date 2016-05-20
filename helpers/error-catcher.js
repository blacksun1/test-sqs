"use strict";
const boxen = require("boxen");

function errorCatcher(err) {
  const msg = `{err}
${err.stack}`;

  console.error(boxen(msg, {
    "padding": 1,
    "borderColor": "red"
  }));
  return;
}

module.exports = errorCatcher;