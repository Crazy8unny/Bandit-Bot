const Command = require("../base/Command.js");
const sharp = require('sharp');
const Discord = require('discord.js');

class Avatar extends Command {
  constructor (client) {
    super(client, {
      name: "אווטאר",
      description: "הופך אותך לבאנדיט אפל",
      usage: "אווטאר",
      category: "שימושי",
      aliases: [],
      permLevel: "Bot Owner"
    });
  }

  async run (message, args, level) { 
    let embed = new Discord.MessageEmbed().setImage("https://i.imgur.com/wSTFkRM.png").setColor('#275BF0');
    message.channel.send(embed);
  }
}

module.exports = Avatar;
