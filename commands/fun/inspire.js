const Command = require("../../base/Command.js");
const Discord = require('discord.js');
const request = require('request');

class Inspire extends Command {
  constructor(client) {
    super(client, {
      name: "השראה",
      description: "מביא לך קצת השראה על חשבנון הבית אחי",
      usage: "השראה",
      aliases: [],
      category: "פנאי"
    });
  }

  async run(message, args, level) {
    let url = "https://inspirobot.me/api?generate=true";
    let settings = {
      "url": url,
      "method": "GET",
      "encoding": null
    }
    request.get(settings, function (error, response, data) {
      try {
        let embed = new Discord.MessageEmbed()
          .setImage(data)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setColor('#1E2023');
        message.channel.send(embed);
      } catch (e) {
        console.log(e);
      }
    });
  }
}


module.exports = Inspire;
