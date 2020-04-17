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
      // const basePhoto = util.getImage("https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png")
      // const avatar = util.getImage("https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png");
      const photo = await sharp(util.getImage("https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png")).resize(200, 200).png().toBuffer();

      let embed = new Discord.MessageEmbed()
      .attachFiles([{name: "image.png", attachment:photo}])
      .setImage('attachment://image.png')
      .setAuthor(message.author.username)
      .setColor('#1E2023');
      message.channel.send(embed);
  }
}

module.exports = Avatar;
