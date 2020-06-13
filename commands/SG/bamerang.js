const Command = require("../../../base/Command.js");
const Discord = require('discord.js');

class Bamerang extends Command {
  constructor (client) {
    super(client, {
      name: "בנגרנג",
      description: "בנגרנגגגגגג",
      usage: "בנגרנג",
      aliases: [],
      category: "פנאי"
    });
  }

  async run (message, args, level) {
    try {
        let embed = new Discord.MessageEmbed()
        .setImage("https://i.imgur.com/2CPxx0k.gif")
        .setDescription(" בנגרנגגגגג " + "<@" + message.author.id + ">" + " ! ")
        .setColor('#1E2023');
        message.channel.send(embed);
    } catch (e) {
      console.log(e);
    }
  }
}



module.exports = Bamerang;
