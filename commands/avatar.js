const Command = require("../base/Command.js");
const sharp = require('sharp');
const Discord = require('discord.js');
const util = require('../util/utils.js');

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
    let inputBuffer = Buffer.from(util.request({ url: "https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png", method: "get" }));
    sharp(inputBuffer)
      .resize(160, 160)
      .toBuffer()
      .then(data => {
        let embed = new Discord.MessageEmbed()
          .attachFiles([{ name: 'Bandit' + member.username + '.png', attachment: data }])
          .setImage('attachment://' + 'Bandit' + member.username + '.png')
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setColor('#1E2023');
        message.channel.send(embed);
      }).catch(err => {
        console.log(err);
      });
  }
}

module.exports = Avatar;