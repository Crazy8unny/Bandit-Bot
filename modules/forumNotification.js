/*
Logger class for easy and aesthetically pleasing console logging
*/
const chalk = require("chalk");
const moment = require("moment");
const Discord = require('discord.js');
const util = require('../util/utils');

class ForumNotification {
  static listen (lastThread) {
    const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`;
    // console.log(timestamp); 
    const prevName = lastThread.get("name");
    // console.log("test name: " + prevName);
    console.log(util.request({ url: "https://lf2.co.il/forum/index.php", method: "get"}));
  }
}

module.exports = ForumNotification;
