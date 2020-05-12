/*
  Get forum notifications
*/

// const chalk = require("chalk");
const moment = require("moment");
const Discord = require('discord.js');
// const cheerio = require('cheerio')
const util = require('../util/utils');
const JSDOM = require('jsdom').JSDOM;
const iconv = require('iconv-lite');
const $ = require("jquery");
const request = require('request');

class ForumNotification {
  static listen(client) {
    const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`;
    const prevName = client.lastThread.get("name");
    const prevAuthor = client.lastThread.get("author");
    // console.log("test name: " + prevName);
    let settings = {
      "url": "https://lf2.co.il/forum/index.php",
      "method": "GET",
      "encoding": null
    }

    request.get(settings, function (error, response, data) {

      // const $ = cheerio.load(data);
      const jsdom = new JSDOM(iconv.decode(data, 'iso-8859-8'));
      const body = jsdom.window.document.getElementsByTagName("tbody")[6].getElementsByTagName("td")[1].getElementsByTagName("a");
      let name = body[body.length - 6].getElementsByTagName("b")[0];
      let forum = body[body.length - 5].innerHTML;
      let bodyWords = jsdom.window.document.getElementsByTagName("tbody")[6].getElementsByTagName("td")[1].innerHTML;
      let position = bodyWords.search("תגובה אחרונה על ידי");
      let author = bodyWords.substring(position, bodyWords.length);
      position = author.search(",");
      author = author.substring(20, position);

      if (name.innerHTML != prevName || author != prevAuthor) {
        client.lastThread.set("name", name.innerHTML);
        client.lastThread.set("author", author);
        let embed = {
          color: 0x0099ff,
          title: name.innerHTML,
          url: "https://lf2.co.il" + body[body.length - 6].href,
          description: forum,
          footer: {
            text: author
          }
        };
        console.log(name.innerHTML);
        client.channels.cache.find(c => c.id === '704981301572403211').send({ embed }).catch(console.error);
        client.channels.cache.find(c => c.id === '708218080815218748').send({ embed }).catch(console.error);

        settings.url = "https://lf2.co.il" + body[body.length - 4].href

        // // console.log(link);
        // request.get(settings, function (err, res, dat) {
        //   console.log(dat)
        //   // const jsdom = new JSDOM(dat);
        //   // const table = jsdom.window.document.getElementsByTagName("tbody")[8];
        //   // let time = table.getElementsByClassName("postdetails");
        //   // time = time[time.length - 2];
        //   // console.log(table);
        //   // console.log(time);
        // });
      }
    });
  }
}

module.exports = ForumNotification;