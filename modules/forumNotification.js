/*
  Get forum notifications
*/

const moment = require("moment");
const Discord = require('discord.js');
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
          let prevName = prevComment.name;
          let prevAuthor = prevComment.author;
          let prevNumber = prevComment.commentsNumber;
          let prevNewUser = prevComment.newUser;

          // find message author and title in forum general page
          const jsdom = new JSDOM(iconv.decode(data, 'iso-8859-8'));
          const body = jsdom.window.document.getElementsByTagName("tbody")[6].getElementsByTagName("td")[1].getElementsByTagName("a");
          let name = body[body.length - 6].getElementsByTagName("b")[0];
          let forum = body[body.length - 5].innerHTML;
          let bodyWords = jsdom.window.document.getElementsByTagName("tbody")[6].getElementsByTagName("td")[1].innerHTML;
          let position = bodyWords.search("תגובה אחרונה על ידי");
          let author = bodyWords.substring(position, bodyWords.length);
          let link = "https://lf2.co.il" + body[body.length - 6].href;
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
          let newUserTable = jsdom.window.document.getElementsByTagName("tbody");
          newUserTable = newUserTable[newUserTable.length - 5];
          newUserTable = newUserTable.getElementsByTagName("tr");
          newUserTable = newUserTable[newUserTable.length - 2];
          let newUser = newUserTable.getElementsByTagName("a")[0].innerHTML;

          // check if its a new message
          if (name.innerHTML != prevName || author != prevAuthor || number != prevNumber) {
            prevName = name.innerHTML;
            prevAuthor = author;
            prevNumber = number;

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
            client.lastThread.set({ name: prevName, author: prevAuthor, commentsNumber: prevNumber, newUser: newUser });
            let MD = getMessageDetails(settings, embed);
          }

          // check if there is a new user
          if (newUser != prevNewUser) {
            client.lastThread.set({ name: prevName, author: prevAuthor, commentsNumber: prevNumber, newUser: newUser });
            let embed2 = {
              description: `מזל טוב ! **${newUser}** הצטרף לפורום !!!!11`,
              color: "#FF7519"
            };
            sendEmbed(embed2, "", true);
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
              MD.rank = addLF2Domain(photos[0].src, true);
              MD.avatar = addLF2Domain(photos[1].src, false);
              if (MD.avatar == "templates/fiblack3dblue/images/lang_hebrew/icon_buddy.gif") {
                MD.avatar = "https://lf2.co.il/forum/images/avatars/gallery/fighters/index.9.gif";
              }

              if (MD.rank == "https://www.lf2.co.il/forum/templates/fiblack3dblue/images/Big_Sword.gif" && photos.length > 2) {
                MD.rank = MD.avatar;
                MD.avatar = addLF2Domain(photos[2].src, false);
              }

              let comment = table.getElementsByClassName("postbody");
              comment = comment[comment.length - 1].textContent
              // comment = comment.innerHTML;
              comment = comment.replace("<br />", "`");
              // let regex = new RegExp('[^' + '\nאבגדהוזחטיכלמנסעפצקרשתךםןץף ' + ']', 'g');
              // comment = comment.replace(regex, '');
              if (comment.length > 2000) {
                comment = comment.substring(0, 2000);
                comment += ".......";
              }

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

              sendEmbed(embed, link, false);
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

          function addRegisteredUsers(embed, serverID, link) {
            client.db.collection("lastThread").doc("RegisteredSubjects").get().then(servers => {
              let works = true;
              if (link != undefined) {
                if (servers.exists) {
                  let server = servers.data()[serverID];
                  if (server != undefined) {
                    let usersID = Object.keys(server);
                    let names = "";
                    console.log("link: " + link);
                    // let subjectsID;
                    // console.log("server.length: " + usersID.length);
                    for (let user = 0; user < usersID.length; user++) {
                      // subjectsID = Object.keys(server[usersID[user]]);
                      // console.log("server[user].length: " + subjectsID.length);
                      for (let subjectURL in server[usersID[user]]) {
                        console.log("URL: " + server[usersID[user]][subjectURL])
                        if (server[usersID[user]][subjectURL] == link) {
                          names += `<@${usersID[user]}> \n`
                          console.log("user: " + usersID[user]);
                        }
                      }
                    }
                    if (names != "") {
                      embed.description += `\n \n || ${names.substring(0, names.length - 2)} ||`;
                    }
                    
                  }
                }
                works = false;
              }
              if (!works) {client.channels.cache.find(c => c.id === serverID).send({ embed }).catch(console.error);}
            });
          }

          function sendEmbed(embed, link, isUserName) {
            client.db.collection("lastThread").doc("Servers").get().then(servers => {
              let embedbck = embed;
              if (servers.exists) {
                servers = servers.data().servers;
                for (let i in servers) {
                  if (i != "random" && !isUserName) {
                    addRegisteredUsers(embed, servers[i], link);
                    embed = embedbck;
                  }
                  else {
                    client.channels.cache.find(c => c.id === i).send({ embed }).catch(console.error);
                  }
                }
              }
            });
          }
        })
      });
      client.works = false;
    }
  }
}

module.exports = ForumNotification;
