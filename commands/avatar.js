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
    let member = message.mentions.users.first() || message.author; 
    const attachment = new Discord.Attachment('../assets/basePhoto.png', 'basePhoto.png');
    let embed = new Discord.MessageEmbed().setImage(attachmenttr).setAuthor(message.author.username).setColor('#1E2023');
    message.channel.send(embed);
    // const image = require('../assets/basePhoto.png').toBuffer();
    // const image = sharp('..\asseets\basePhoto.png')
    // image.resize(200, 200).toBuffer().then(data => {
    //   message.channel.send(data);
    //   message.channel.send("בדיקה");
    // }).catch(err => {
    //   message.channel.send("בדיקה 2");
    //   message.channel.send(err.toString());
    // })
  }
}

module.exports = Avatar;
