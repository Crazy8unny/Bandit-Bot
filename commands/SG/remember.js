const Command = require("../../base/Command.js");

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
        const server = this.client.SG.doc(message.guild.id);
        server.get().then(lastEpisode => {
            if (!lastEpisode.exists) {
                lastEpisode = { 'where': "וואלה לא יודע איפה הייתם"};
            }
            else {
                lastEpisode = lastEpisode.data();
            }
            if (args[0] == null) {
                message.channel.send("שימוש שגוי בפקודה שלח `אנחנו ב` או `איפה אנחנו`");
            }
            else if (msg.includes("אנחנו אנחנו")) {
                message.channel.send("אנחנו אנחנו ? מה זה בכלל ?");
            }
            else if (args[0] == "אנחנו" && args[1] == null) {
                message.channel.send("אתם ב" + lastEpisode.where);
            }
            else if (args[0].startsWith('ב') && msg.includes("אנחנו ב")) {
                message.delete();
                let position = msg.search("אנחנו ב");
                let placeString = msg.substring(position + 7, msg.length);
                lastEpisode.where = placeString;
                server.set(lastEpisode);
            }
            else {
                message.channel.send("שימוש שגוי בפקודה שלח `אנחנו ב` או `איפה אנחנו`");
            }
        })
    }
}

module.exports = Remember;
