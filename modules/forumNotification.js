/*
Logger class for easy and aesthetically pleasing console logging
*/
const chalk = require("chalk");
const moment = require("moment");
const Discord = require('discord.js');
const util = require('../util/utils');

class ForumNotification {
  static listen(lastThread) {
    const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`;
    // console.log(timestamp); 
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
    let parser = new DOMParser();
    let document = parser.parseFromString(page, "text/html");
    let last = document.getElementsByTagName("tbody")[6].getElementsByTagName("td")[1]
    console.log(last);
  }
}

module.exports = ForumNotification;
