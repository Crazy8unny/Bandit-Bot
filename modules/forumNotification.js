/*
Logger class for easy and aesthetically pleasing console logging
*/
const chalk = require("chalk");
const moment = require("moment");
const Discord = require('discord.js');

class ForumNotification {
  static listen (lastThread, channel) {
    const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`;
    // console.log(timestamp); 
    const prevName = lastThread.get("name");
    channel.send("test name: " + prevName);
  }
}

module.exports = ForumNotification;
