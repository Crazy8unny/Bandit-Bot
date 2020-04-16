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
    let member = message.mentions.users.first() 
    message.channel.send(member.avatarURL);
    let embed = new Discord.MessageEmbed().setImage(member.avatarURL).setColor('#1E2023');
    message.channel.send(embed);
    message.channel.send("--------");
    message.channel.send(message.author.avatarURL);
    let embed = new Discord.MessageEmbed().setImage(message.author.avatarURL).setColor('#1E2023');
    message.channel.send(embed);
    
  }
}

module.exports = Avatar;
