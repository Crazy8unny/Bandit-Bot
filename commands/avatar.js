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
    sharp('http://cdn.discordapp.com/avatars/300324644932681728/c1d5f3c1596b2901b57fc1f62f8ab785.png')
    .composite([{ input: 'http://cdn.discordapp.com/avatars/300332593881153547/3d0dced924f5a031779f88cbb56d300f.png'}])
    .toBuffer()
    .then(function(outputBuffer) {
      // let embed = new Discord.MessageEmbed().setImage(data).setAuthor( message.author).setColor('#1E2023');
      message.channel.send("בדיקה");    
      // message.channel.send(outputBuffer);    
    })
    .catch(err => {
      message.channel.send(" 2בדיקה");    
      message.channel.send(err.toString());    
    });
  }
}

module.exports = Avatar;
