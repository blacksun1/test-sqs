"use strict";
const boxen = require("boxen");

function errorCatcher(err) {
  const msg = `{error}
${err.stack}`;

  // console.error("error");
  // console.error(err);
  // console.error(err.stack);
  console.error(boxen(msg, {
    "padding": 1,
    "borderColor": "red"
  }));
  return;
}

exports.module = errorCatcher;