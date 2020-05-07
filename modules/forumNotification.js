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
    const $ = cheerio.load(page);

    console.log($.html());
  }
}

module.exports = ForumNotification;
