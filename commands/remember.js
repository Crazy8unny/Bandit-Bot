const Command = require("../base/Command.js");

class Remember extends Command {
    constructor(client) {
        super(client, {
            name: "איפה",
            description: "זוכר איפה היינו בסטארגייט",
            usage: "איפה",
            category: "פנאי",
            aliases: ["אנחנו"]
        });
    }

    async run(message, args, level) {
        let msg = message.toString();
        let res;
        let settings = this.client.getSettings(message.guild);
        if (args[0] == null) {
            res = "שימוש שגוי בפקודה שלח `אנחנו ב` או `איפה אנחנו`"
        }
        else if (msg.includes("אנחנו אנחנו")) {
            res = "אנחנו אנחנו ? מה זה בכלל ?";
        }
        else if (args[0] == "אנחנו" && args[1] == null) {
            res = "אתם  ב" + settings.where;
        }
        else if (args[0].startsWith('ב') && msg.includes("אנחנו ב")) {
            let position = msg.search("אנחנו ב");
            let placeString = msg.substring(position + 7, msg.length);
            settings.where = placeString;
            this.client.writeSettings(message.guild.id, settings);
        }
        else {
            res = "שימוש שגוי בפקודה שלח `אנחנו ב` או `איפה אנחנו`"
        }
        message.channel.send(res.toString());
    }
}

module.exports = Remember;