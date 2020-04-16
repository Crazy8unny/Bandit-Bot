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
    sharp('../assets/basePhoto.png').resize(200, 200).toBuffer().then(data => {
      message.channel.send(data);
      message.channel.send("בדיקה");
    }).catch(err => {
      message.channel.send("בדיקה 2");
      message.channel.send(err.toString());
    })
  }
}

module.exports = Avatar;
