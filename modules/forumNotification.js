/*
  Get forum notifications
*/

// const chalk = require("chalk");
const moment = require("moment");
// const Discord = require('discord.js');
const cheerio = require('cheerio')
const util = require('../util/utils');

class ForumNotification {
  static listen(lastThread) {
    const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`;
    const prevName = lastThread.get("name");
    // console.log("test name: " + prevName);
    const request = require('request');
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
    
    request.get(settings, function (err, res, data) {
      const $ = cheerio.load(data);
      console.log($("tbody")[6].find("td"));
    });
  }
}

module.exports = ForumNotification;
