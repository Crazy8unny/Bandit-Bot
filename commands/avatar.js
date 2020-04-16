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
    // let embed = new Discord.MessageEmbed().setImage(member.displayAvatarURL()).setAuthor( message.author).setColor('#1E2023');
    sharp("../assets/basePhoto.png")
    .composite([{ input: "https://lf2.co.il/NewImages/My/Ayalx/RasahrGuy2M.png"}])
    .toBuffer()
    .then(function(outputBuffer) {
      // let embed = new Discord.MessageEmbed().setImage(data).setAuthor( message.author).setColor('#1E2023');
      message.channel.send("בדיקה");    
      message.channel.send(outputBuffer);    
    })
    .catch(err => {
      message.channel.send(" 2בדיקה");    
      message.channel.send(err);    
    });
  }
}

module.exports = Avatar;
