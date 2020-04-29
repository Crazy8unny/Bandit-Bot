/*
Logger class for easy and aesthetically pleasing console logging
*/
const chalk = require("chalk");
const moment = require("moment");

class ForumNotification {
  static listen () {
    const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`;
    console.log(timestamp); 
  }
}

module.exports = ForumNotification;
