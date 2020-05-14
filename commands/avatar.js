const Command = require("../base/Command.js");
const Discord = require('discord.js');
const Jimp = require('jimp');

class Avatar extends Command {
  constructor(client) {
    super(client, {
      name: "אווטאר",
      description: "הופך אותך לבאנדיט אפל",
      usage: "אווטאר",
      category: "שימושי",
      aliases: []
    });
  }

  async run(message, args, level) {
    let x = 0, y = 0;
    if (args[0] != null && args[1] != null) {
      if (args[2] != null) {
        x = parseInt(args[1]);
        y = parseInt(args[2]);
      }
      else {
        x = parseInt(args[0]);
        y = parseInt(args[1]);
      }
    }

    if (x.toString() == 'NaN' || y.toString() == 'NaN') {
      message.channel.send("עליך לשלוח `!אווטאר <שםמשתמש> <מיקום X> <מיקום Y>` לשלוח !");
    }
    else {
      let member = message.mentions.users.first() || message.author;
      let basePhoto = "https://cdn.discordapp.com/attachments/699235141134057492/701537065745121382/basePhoto.png";
      Jimp.read(basePhoto).then(base => {
        Jimp.read("https://cdn.discordapp.com/avatars/" + member.id + "/" + member.avatar + ".png").then(image => {
          image.composite(base, x, y, {
            mode: Jimp.BLEND_SOURCE_OVER
          });
          message.channel.send("ברוך הבא לגאנג אח שלי");
          image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
            let embed = new Discord.MessageEmbed()
              .attachFiles([{ name: 'Bandit' + member.username + '.png', attachment: buffer }])
              .setImage('attachment://' + 'Bandit' + member.username + '.png')
              .setAuthor(message.author.username, message.author.displayAvatarURL())
              .setColor('#1E2023');
            message.channel.send(embed);
          });
        })
      })
        .catch(err => {
          console.log(err);
        });
    }
  }
}

module.exports = Avatar;