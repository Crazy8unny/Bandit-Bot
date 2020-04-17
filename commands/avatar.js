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
    // let embed = new Discord.MessageEmbed().setImage().setAuthor(message.author.username, message.author.avatar).setColor('#1E2023');
    // message.channel.send(embed);
    sharp(await util.getImage("https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png"))
    .composite([{ input: await "https://cdn.discordapp.com/attachments/699235141134057492/700626850983968768/basePhoto.png"}]).toBuffer()
    .then(function(outputBuffer) {
      // let embed = new Discord.MessageEmbed().setImage(data).setAuthor( message.author).setColor('#1E2023');
      message.channel.send("בדיקה");    
      message.channel.send(outputBuffer);    
    })
    .catch(err => {
      message.channel.send(" 2בדיקה");    
      message.channel.send(err.toString()); 
      console.log(err);   
    });

  }
}

module.exports = Avatar;
