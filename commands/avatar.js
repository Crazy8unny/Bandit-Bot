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
    const semiTransparentRedPng = await sharp(new Buffer(util.request(
      {url: "https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png", method: "get", encoding: 'base64'})))
      .resize({width: 200, height: 200})
      .png()
      .toBuffer();
      
    //   let options = {
    //     url: url,
    //     method: "get",
    //     encoding: null
    // };
      // const basePhoto = util.getImage("https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png")
      // const photo = util.getImage("https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png");
    

      let embed = new Discord.MessageEmbed()
      .attachFiles([{name: "image.png", attachment:semiTransparentRedPng}])
      .setImage('attachment://image.png')
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setColor('#1E2023');
      message.channel.send(embed);
  }
}

module.exports = Avatar;
