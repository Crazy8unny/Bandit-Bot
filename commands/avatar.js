const Command = require("../base/Command.js");
const sharp = require('sharp');

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
    let embed = new Discord.RichEmbed().setImage(message.author.avatarURL).setColor('#275BF0');
    message.channel.send(embed);
  }
}

module.exports = Avatar;
