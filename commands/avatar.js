const Command = require("../base/Command.js");
const sharp = require('sharp');
const Discord = require('discord.js');
const util = require('../util/utils.js');
const images = require("images");

class Avatar extends Command {
  constructor(client) {
    super(client, {
      name: "אווטאר",
      description: "הופך אותך לבאנדיט אפל",
      usage: "אווטאר",
      category: "שימושי",
      aliases: [],
      permLevel: "Bot Owner"
    });
  }

  async run(message, args, level) {
    const output = images("../assets/basePhoto.png")
      .draw(images({ url: message.author.displayAvatarURL(), method: "get", encoding: null }))
      .encode("png")

    let embed = new Discord.MessageEmbed()
      .attachFiles([{ name: 'Bandit' + member.username + '.png', attachment: output }])
      .setImage('attachment://' + 'Bandit' + member.username + '.png')
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setColor('#1E2023');
    message.channel.send(embed);
  }
}

module.exports = Avatar;
