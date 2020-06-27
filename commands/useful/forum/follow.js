const Command = require("../../../base/Command.js");

class Follow extends Command {
    constructor(client) {
        super(client, {
            name: "עקוב",
            description: "מעקב אחר נושאים בהתראות של הפורום",
            usage: "עקוב <לינק של נושא> - הוספת נושא למעקב \n הסר מעקב <לינק של נושא> - הוספת נושא למעקב \n רשימת מעקב - מדפיס את כל הנושאים שאתה עוקב אחריהם",
            category: "שימושי",
            aliases: ["הסר", "רשימת"]
        });
    }

    async run(message, args, level) {
        let msg = message.toString();
        console.log(msg);
        let res;
        if (args[0] == null || args[1] != null) {
            message.channel.send("שימוש שגוי בפקודה, שלח `!עזרה עקוב` על מנת לקבל מידע מלא על הפקודה");
        }
        else if (msg.startsWith("!רשימת מעקב")) {
            message.channel.send("אחי אתה עוקב אחרי כל השיט הבא");
        }
        else if (msg.startsWith("!הסר")) {
            message.channel.send("הלינק הוסר בהצלחה משהו");
        }
        else if (msg.startsWith("!עקוב")) {
            message.channel.send("אתה עוקב אחרי הדבר המגניב הזה");
        }
        else {
            message.channel.send("שימוש שגוי בפקודה, שלח `!עזרה עקוב` על מנת לקבל מידע מלא על הפקודה");
        }
        // let msg = message.toString();
        // let res;
        // const server = this.client.SG.doc(message.guild.id);
        // server.get().then(lastEpisode => {
        //     if (!lastEpisode.exists) {
        //         lastEpisode = { 'where': "וואלה לא יודע איפה הייתם"};
        //     }
        //     else {
        //         lastEpisode = lastEpisode.data();
        //     }
        //     if (args[0] == null) {
        //         message.channel.send("שימוש שגוי בפקודה שלח `אנחנו ב` או `איפה אנחנו`");
        //     }
        //     else if (msg.includes("אנחנו אנחנו")) {
        //         message.channel.send("אנחנו אנחנו ? מה זה בכלל ?");
        //     }
        //     else if (args[0] == "אנחנו" && args[1] == null) {
        //         message.channel.send("אתם ב" + lastEpisode.where);
        //     }
        //     else if (args[0].startsWith('ב') && msg.includes("אנחנו ב")) {
        //         let position = msg.search("אנחנו ב");
        //         let placeString = msg.substring(position + 7, msg.length);
        //         lastEpisode.where = placeString;
        //         server.set(lastEpisode);
        //     }
        //     else {
        //         message.channel.send("שימוש שגוי בפקודה שלח `אנחנו ב` או `איפה אנחנו`");
        //     }
        // })
    }
}

module.exports = Follow;
