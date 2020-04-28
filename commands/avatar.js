const Command = require("../base/Command.js");
const sharp = require('sharp');
const Discord = require('discord.js');
const util = require('../util/utils.js');
const jimp = require('jimp');

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
    let basePhoto = "https://cdn.discordapp.com/attachments/699235141134057492/701537065745121382/basePhoto.png";
    let image;
    image = util.request({ url: basePhoto, method: "get", encoding: null });
    while (image == null) {
      await this.client.wait(100);
    }
    jimp.read(image).then(image => {
      message.channel.send("ברוך הבא לגאנג אח שלי");
      let embed = new Discord.MessageEmbed()
        .attachFiles([{ name: 'Bandit' + member.username + '.png', attachment: image }])
        .setImage('attachment://' + 'Bandit' + member.username + '.png')
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setDescription("ברוך הבא לגאנג אח שלי")
        .setColor('#1E2023');
      message.channel.send(embed);
    })
    
    // let options = {
    //   url: "http://image-merger.herokuapp.com/api/v1.0/",
    //   method: "Post",
    //   json: {
    //     "foreground_url": basePhoto,
    //     "background_url": "https://cdn.discordapp.com/avatars/"+ member.id +  "/" + member.avatar +".png"
    //   }
    // }

    // console.log("https://cdn.discordapp.com/avatars/"+ member.id +  "/" + member.avatar +".png")
    // let response = util.request(options);
    // console.log(response);
  }
}

module.exports = Avatar;