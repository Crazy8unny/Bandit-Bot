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
    if (!client.works) {
      client.works = true;
      let settings = {
        "url": "https://lf2.co.il/forum/index.php",
        "method": "GET",
        "encoding": null
      }
      request.get(settings, function (error, response, data) {
        client.lastThread.get().then(prevComment => {
          if (!prevComment.exists) {
            prevComment = { name: "hi", author: "hi", commentsNumber: "0", newUser: "test" };
          }
          else {
            prevComment = prevComment.data();
          }
          const prevName = prevComment.name;
          const prevAuthor = prevComment.author;
          const prevNumber = prevComment.commentsNumber;
          const prevNewUser = prevComment.newUser;

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
          position = bodyWords.search("תגובות\\)");
          let number = bodyWords.substring(0, position);
          position = number.search(new RegExp('\\(' + '[' + '1234567890' + ']', 'g'));
          number = number.substring(position + 1, number.length);
          number = parseInt(number);
          let color = "#1E2023";
          if (number == 0) {
            color = 0x0099ff;
          }

          //find new user details
          let newUser = jsdom.window.document.getElementsByTagName("tbody")[13].getElementsByTagName("tr")[5].getElementsByTagName("a")[0].innerHTML

          // check if its a new message
          if (name.innerHTML != prevName || author != prevAuthor || number != prevNumber) {
            // get message info
            settings.url = "https://lf2.co.il" + body[body.length - 4].href
            let embed = {
              author: {
                name: author
              },
              title: name.innerHTML,
              url: "https://lf2.co.il" + body[body.length - 4].href,
              footer: {
                text: forum + ` (${number} תגובות) `
              }
            };
            client.lastThread.set({ name: name.innerHTML, author: author, commentsNumber: number });
            let MD = getMessageDetails(settings, embed);
          }

          // check if there is a new user
          if (newUser != prevNewUser) {
            client.lastThread.set({newUser: newUser});
            let embed2 = {
              title: `**${newUser}** הצטרף לפורום !!!!111`,
              color: "#00FF15"
            }
            client.channels.cache.find(c => c.id === '704981301572403211').send({ embed }).catch(console.error);
            client.channels.cache.find(c => c.id === '708218080815218748').send({ embed }).catch(console.error);
            client.channels.cache.find(c => c.id === '711614062408237108').send({ embed }).catch(console.error);
          }

          // request to the message page
          function getMessageDetails(settings, embed) {
            request.get(settings, function (error, response, data) {
              const jsdom = new JSDOM(iconv.decode(data, 'iso-8859-8'));
              let table = jsdom.window.document.getElementsByClassName("forumline");
              if (table.length < 2) {
                table = table[0];
              } else {
                table = table[1];
              }
              let MD = {};
              MD.avatar = table.getElementsByClassName("postdetails");
              MD.avatar = MD.avatar[MD.avatar.length - 3];
              let photos = MD.avatar.getElementsByTagName("img");
              MD.avatar = addLF2Domain(photos[1].src, false);
              MD.rank = addLF2Domain(photos[0].src, true);

              if (MD.rank == "https://www.lf2.co.il/forum/templates/fiblack3dblue/images/Big_Sword.gif" && photos.length > 2) {
                MD.rank = MD.avatar;
                MD.avatar = addLF2Domain(photos[2].src, false);
              }

              let comment = table.getElementsByClassName("postbody");
              comment = comment[comment.length - 1]
              comment = comment.innerHTML;
              comment = comment.replace("<br>", "\n");
              let regex = new RegExp('[^' + '\nאבגדהוזחטיכלמנסעפצקרשתךםןץף ' + ']', 'g');
              comment = comment.replace(regex, '');

              embed = {
                author: {
                  name: embed.author.name,
                  icon_url: MD.rank,
                },
                color: color,
                title: embed.title,
                url: embed.url,
                description: comment,
                footer: {
                  text: embed.footer.text
                },
                thumbnail: {
                  url: MD.avatar,
                }
              };

              client.channels.cache.find(c => c.id === '704981301572403211').send({ embed }).catch(console.error);
              client.channels.cache.find(c => c.id === '708218080815218748').send({ embed }).catch(console.error);
              client.channels.cache.find(c => c.id === '711614062408237108').send({ embed }).catch(console.error);
              client.works = false;
            });
          }

          function addLF2Domain(name, isRank) {
            if (name.startsWith("images") || isRank) {
              name = "https://www.lf2.co.il/forum/" + name;
              name = name.replace("\\", "/");
            }
            return name;
          }
        })
      });
      client.works = false;
    }
  }
}

module.exports = ForumNotification;
