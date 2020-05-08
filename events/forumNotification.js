/*
  Get forum notifications
*/

// This event executes when a new guild (server) is joined.
// const chalk = require("chalk");
const moment = require("moment");
const Discord = require('discord.js');
// const cheerio = require('cheerio')
const util = require('../util/utils');
const JSDOM = require('jsdom').JSDOM;


module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (lastThread) {
      const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`;
      const prevName = lastThread.get("name");
      // console.log("test name: " + prevName);
      const request = require('request');
      let settings = {
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

      request.get(settings, function (error, response, data) {
      // const $ = cheerio.load(data);
      const jsdom = new JSDOM(data);
      const body = jsdom.window.document.getElementsByTagName("tbody")[6].getElementsByTagName("td")[1].getElementsByTagName("a");
      let name = body[body.length - 6];
      if (name.innerText != prevName) {
        let embed = {
          color: 0x0099ff,
          title: name.innerText,
          url: name.href
        };
        // console.log(name.innerText);
        this.client.channels.get(`704981301572403211`).send(embed);
        lastThread.set("name", name.innerText);
      }

    // console.log(link);
    // request.get(settings, function (err, res, dat) {
    //   // const $ = cheerio.load(data);
    //   const jsdom = new JSDOM(dat);
    //   const table = jsdom.window.document.getElementsByTagName("tbody");
    //   // const table = jsdom.window.document.getElementsByTagName("tbody")[8];
    //   // let time = table.getElementsByClassName("postdetails");
    //   // time = time[time.length - 2];
    //   console.log(table.length);
   });
  }
};

module.exports = ForumNotification;
