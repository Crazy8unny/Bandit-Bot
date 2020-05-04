const Command = require("../base/Command.js");
const Discord = require('discord.js');

class Bamerang extends Command {
  constructor (client) {
    super(client, {
      name: "באמרנג",
      description: "באמרנגגגגגג",
      usage: "באמרנג",
      aliases: [],
      category: "פנאי"
    });
  }

  async run (message, args, level) {
    try {
        let embed = new Discord.MessageEmbed()
        .setImage("https://i.imgur.com/2CPxx0k.gif")
        .setDescription("! <@" + message.author.id + ">" + " באמרנגגגגגג")
        .setColor('#1E2023');
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Bamerang;
