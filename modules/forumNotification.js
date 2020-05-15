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

      // find message author and title in forum general page
      const jsdom = new JSDOM(iconv.decode(data, 'iso-8859-8'));
      const body = jsdom.window.document.getElementsByTagName("tbody")[6].getElementsByTagName("td")[1].getElementsByTagName("a");
      let name = body[body.length - 6].getElementsByTagName("b")[0];
      let forum = body[body.length - 5].innerHTML;
      let bodyWords = jsdom.window.document.getElementsByTagName("tbody")[6].getElementsByTagName("td")[1].innerHTML;
      let position = bodyWords.search("תגובה אחרונה על ידי");
      let author = bodyWords.substring(position, bodyWords.length);
      position = author.search(",");
      author = author.substring(20, position);

      // check if its a new message
      if (name.innerHTML != prevName || author != prevAuthor) {
        // get message info
        settings.url = "https://lf2.co.il" + body[body.length - 4].href
        console.log("test");
        let MD = getMessageDetails(settings);
        client.lastThread.set("name", name.innerHTML);
        client.lastThread.set("author", author);
        let embed = {
          author: {
            name: author,
            icon_url: MD.avatar,
          },
          color: 0x0099ff,
          title: name.innerHTML,
          url: "https://lf2.co.il" + body[body.length - 4].href,
          description: "כאן יוכנס התוכן של ההודעה",
          footer: {
            text: forum
          },
          thumbnail: {
            url: MD.avatar,
          }
        };
        client.channels.cache.find(c => c.id === '704981301572403211').send({ embed }).catch(console.error);
        client.channels.cache.find(c => c.id === '708218080815218748').send({ embed }).catch(console.error);


      }
    });
  }
}

// request to the message page
function getMessageDetails(settings) {
  return request.get(settings, function (error, response, data) {
    const jsdom = new JSDOM(iconv.decode(data, 'iso-8859-8'));
    const table = jsdom.window.document.getElementsByTagName("tbody")[8];
    let MD = {};
    MD.avatar = table.getElementsByClassName("row2")
    MD.avatar = MD.avatar[MD.avatar.length - 3];
    MD.avatar = MD.avatar.getElementsByTagName("img")
    MD.avatar = MD[1].src;
    MD.rank = MD[0].src;
    return MD;
  });
}

module.exports = ForumNotification;