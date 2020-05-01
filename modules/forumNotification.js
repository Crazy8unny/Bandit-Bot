/*
Logger class for easy and aesthetically pleasing console logging
*/
const chalk = require("chalk");
const moment = require("moment");
const Discord = require('discord.js');
const util = require('../util/utils');
const JSDOM = require("jsdom").JSDOM

class ForumNotification {
  static listen(lastThread) {
    const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`;
    const prevName = lastThread.get("name");
    // console.log("test name: " + prevName);
    const settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://lf2.co.il/forum/index.php",
      "method": "GET",
      "headers": {
        "cache-control": "no-cache",
        "Content-Type": "text/html; charset=iso-8859-8"
      },
      "beforeSend": function (jqXHR) {
        jqXHR.overrideMimeType('text/html;charset=iso-8859-8');
      }
    }

    // let page = util.request(settings);
    let jsdom = (new JSDOM(page));
    // let { window } = jsdom;

    // let last = jsdom.window.document.getElementsByTagName("tbody");
    // console.log(last);

    
// Create a new DOM with jsdom and get the window element;
// const jsdom = new JSDOM("<!doctype html><html><body><div>Hello World</div></body></html>");
const { window } = jsdom;

// Check to ensure that our jsdom looks like what was serialized.
console.log(`CONSTRUCTED DOM: ${jsdom.serialize()}`);  // As expected, as passed to constructor.

// Get number of divs.  Expecting 1.
const initialNumberOfDivs = jsdom.window.document.getElementsByTagName("div").length;
console.log(`# OF DIVS IN CONSTRUCTED DOM: ${initialNumberOfDivs}`);  // Unexpected.  I expect 1, but get 0.

// Get number of bodies.  Expecting 1.
const bodyElements = jsdom.window.document.getElementsByTagName("tbody");
console.log(`# OF BODIES IN CONSTRUCTED DOM: ${bodyElements.length}`);  // Expected.  I expect 1, and get 1.

// Get the body itself to operate on.
const bodyElement = bodyElements[0];
console.log(`# OF DIVS IN CONSTRUCTED BODY: ${bodyElement.getElementsByTagName("div").length}`);  // Unexpected.  I expect 1, but get 0.

// Add a div to the body.
bodyElement.insertAdjacentHTML("afterbegin", "<div>Goodbye!!</div>");

// Now it gets really weird.....
const numberOfDivsAfterInsert = jsdom.window.document.getElementsByTagName("div").length;
console.log(`# OF DIVS AFTER INSERT: ${numberOfDivsAfterInsert}`);  // Expected... I (unexpectedly) had zero before, but now I have one, so one more.

// But now lets serialize the dom again, and there is no trace of the added div!
console.log(`DOM AFTER INSERT: ${jsdom.serialize()}`);  // Why no "Goodbye" div here?.
  }
}

module.exports = ForumNotification;
