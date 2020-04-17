const Command = require("../base/Command.js");
const sharp = require('sharp');
const Discord = require('discord.js');
const util = require('../util/utils.js');

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
    const semiTransparentRedPng = await sharp({
      create: {
        width: 48,
        height: 48,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0.5 }
      }
    })
      .png()
      .toBuffer();
      let embed = new Discord.MessageEmbed()
      .attachFiles([{name: "image.png", attachment:semiTransparentRedPng}])
      .setImage('attachment://image.png')
      .setAuthor(message.author.username, message.author.avatar)
      .setColor('#1E2023');
      message.channel.send(embed);
  }
}

module.exports = Avatar;
