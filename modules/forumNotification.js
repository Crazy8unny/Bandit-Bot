/*
Logger class for easy and aesthetically pleasing console logging
*/
// const chalk = require("chalk");
const moment = require("moment");
// const Discord = require('discord.js');
const util = require('../util/utils');
// const JSDOM = require("jsdom").JSDOM;
const HTMLParser = require("node-html-parser");

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

    let page = util.request(settings);
    console.log(HTMLParser.parse(page));
  }
}

module.exports = ForumNotification;
