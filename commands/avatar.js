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
    let member = message.mentions.users.first() || message.author; 
    let basePhoto = "https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png";
    let photo = member.displayAvatarURL();

    console.log(photo)
    
    let options = {
      url: "http://image-merger.herokuapp.com/api/v1.0/",
      method: "Post",
      json: {
        "foreground_url": basePhoto,
        "background_url": "https://cdn.discordapp.com/avatars/"+ member.id +  "/" + member.Avatar +".png"
      }
    }

    let response = util.request(options);
    console.log(response.toString());

    let embed = new Discord.MessageEmbed()
      .attachFiles([{ name: 'Bandit' + member.username + '.png', attachment: response }])
      .setImage('attachment://' + 'Bandit' + member.username + '.png')
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setColor('#1E2023');
    message.channel.send(embed);
  }
}

module.exports = Avatar;