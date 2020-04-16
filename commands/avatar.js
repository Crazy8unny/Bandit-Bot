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
    const input = ('../assets/basePhoto.png');
    const composite = ('../assets/deep_f2.png');
    sharp(input)
    .composite([{ input: composite}])
    .toBuffer()
    .then(function(outputBuffer) {
      // let embed = new Discord.MessageEmbed().setImage(data).setAuthor( message.author).setColor('#1E2023');
      message.channel.send("בדיקה");    
      message.channel.send(outputBuffer);    
    })
    .catch(err => {
      message.channel.send(" 2בדיקה");    
      message.channel.send(err.toString());    
    });
    // const input = getBod('../assets/basePhoto.png');
    // const composite = ('../assets/deep_f2.png');
    // const output = await sharp(input).composite({ input: composite }).png().toBuffer();
    // message.channel.send("בדיקה");    
    // message.channel.send(output);    
  }
}

module.exports = Avatar;
