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
    let semiTransparentRedPng;
    await sharp(Buffer.from(util.request(
      { url: "https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png", method: "get", encoding: null }), 'base64'))
      .resize({ width: 200, height: 200 })
      .png()
      .toBuffer()
      .then(image => {
        semiTransparentRedPng = image;
        let embed = new Discord.MessageEmbed()
          .attachFiles([{ name: "image.png", attachment: semiTransparentRedPng }])
          .setImage('attachment://image.png')
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setColor('#1E2023');
        message.channel.send(embed);
      })

    //   let options = {
    //     url: url,
    //     method: "get",
    //     encoding: null
    // };
    // const basePhoto = util.getImage("https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png")
    // const photo = util.getImage("https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png");
  }
}

module.exports = Avatar;
