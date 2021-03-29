const Command = require("../../../base/Command.js");
const Discord = require('discord.js');

class SGif extends Command {
    constructor(client) {
        super(client, {
            name: "הזה",
            description: "מדפיס את השם של הסדרה הזאת נו",
            usage: "הזה נו",
            aliases: [],
            category: "פנאי",
            permLevel: "Bot Support"
        });
    }

    async run(message, args, level) {
        if (args[0] == null || args[1] != null || args[0] != "נו") {
            message.channel.send("שימוש שגוי בפקודה, שלח `!עזרה הזה` על מנת לקבל מידע מלא על הפקודה");
        }
        else {
            try {
                let embed = new Discord.MessageEmbed()
                    .setImage("https://i.imgur.com/0gYpI9t.gif")
                    .setColor('#1E2023');
                message.channel.send(embed);
            } catch (e) {
                console.log(e);
            }
        }
    }
}



module.exports = SGif;
