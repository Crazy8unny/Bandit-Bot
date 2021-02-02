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
      method: "GET",
      redirect: 'follow'
    }

    fetch(url, settings).then(response => response.text())
    .then(result => {let embed = new Discord.MessageEmbed()
        .setImage(result)
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setColor('#1E2023'); 
        message.channel.send(embed)})
    .catch(error => console.log('error', error));
  }
}


module.exports = Inspire;
