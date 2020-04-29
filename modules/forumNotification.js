/*
Logger class for easy and aesthetically pleasing console logging
*/
const chalk = require("chalk");
const moment = require("moment");
const Discord = require('discord.js');

class ForumNotification {
  static listen (client) {
    const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`;
    // console.log(timestamp); 
    const channel = client.channels.get('forum-notification');
    const prevName = client.lastThread.get("name");
    chennel.send("test name: " + prevName);
  }
}

module.exports = ForumNotification;
