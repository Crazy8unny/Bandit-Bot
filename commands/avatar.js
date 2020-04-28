const Command = require("../base/Command.js");
const sharp = require('sharp');
const Discord = require('discord.js');
const util = require('../util/utils.js');
const Jimp = require('jimp');

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
    
    Jimp.read('https://www.israelhayom.co.il/sites/default/files/styles/566x349/public/images/articles/2016/05/04/14623178569657_b.jpg')
    .then(image => {
      message.channel.send("ברוך הבא לגאנג אח שלי");
      // let embed = new Discord.MessageEmbed()
      //   .attachFiles([{ name: 'Bandit' + member.username + '.png', attachment: image }])
      //   .setImage('attachment://' + 'Bandit' + member.username + '.png')
      //   .setAuthor(message.author.username, message.author.displayAvatarURL())
      //   .setDescription("ברוך הבא לגאנג אח שלי")
      //   .setColor('#1E2023');
      // message.channel.send(embed);
      image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
        console.log(buffer)
        console.log("##############")
        message.channel.send(buffer);
        console.log(err);
      });
    })
    .catch(err => {
      console.log(err);
    });

    
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