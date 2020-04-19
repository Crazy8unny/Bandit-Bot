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
      let member = message.mentions.users.first() || message.author; 
      const basePhoto = "https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png";
      const photo = member.displayAvatarURL();
      let options = {
        url: "http://image-merger.herokuapp.com/api/v1.0/",
        method: "POST",
        encoding: null,
        json: {
          "foreground_url" : basePhoto,
          "background_url" : photo
        }
      };
      let output = util.req(options);

      let embed = new Discord.MessageEmbed()
      .attachFiles([{name: "image.png", attachment:output}])
      .setImage('attachment://image.png')
      .setAuthor(message.author.username)
      .setColor('#1E2023');
      message.channel.send(embed);
  }
}

module.exports = Avatar;
