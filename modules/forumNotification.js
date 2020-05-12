/*
  Get forum notifications
*/

// const chalk = require("chalk");
const moment = require("moment");
const Discord = require('discord.js');
// const cheerio = require('cheerio')
const util = require('../util/utils');
const JSDOM = require('jsdom').JSDOM;
const iconv = require('iconv-lite')
const $ = require( "jquery" );

class ForumNotification {
  static listen(client) {
    const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`;
    const prevName = client.lastThread.get("name");
    // console.log("test name: " + prevName);
    const request = require('request');
    let settings = {
      "url": "https://lf2.co.il/forum/index.php",
      "method": "GET",
      "encoding": null
    }

    request.get(settings, function (error, response, data) {

      // const $ = cheerio.load(data);
      const jsdom = new JSDOM(iconv.decode(data, 'iso-8859-8'));
      const body = jsdom.window.document.getElementsByTagName("tbody")[6].getElementsByTagName("td")[1].getElementsByTagName("a");
      let name = body[body.length - 6].getElementsByTagName("b")[1];
      if (name.innerHTML != prevName) {
        client.lastThread.set("name", name.innerHTML);
        let embed = {
          color: 0x0099ff,
          title: name.innerHTML,
          url: "https://lf2.co.il" + name.href
        };
        console.log(name.innerHTML);
        client.channels.cache.find(c => c.id === '704981301572403211').send({embed}).catch(console.error);
        client.channels.cache.find(c => c.id === '708218080815218748').send({embed}).catch(console.error);

        // console.log(link);
        // request.get(settings, function (err, res, dat) {
        //   // const $ = cheerio.load(data);
        //   const jsdom = new JSDOM(dat);
        //   const table = jsdom.window.document.getElementsByTagName("tbody");
        //   // const table = jsdom.window.document.getElementsByTagName("tbody")[8];
        //   // let time = table.getElementsByClassName("postdetails");
        //   // time = time[time.length - 2];
        //   console.log(table.length);
      }
    });
  }
}

module.exports = ForumNotification;