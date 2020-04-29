const Command = require("../base/Command.js");

class SG extends Command {
    constructor(client) {
        super(client, {
            name: "סטארגייט",
            description: "מביא את הלינק של סטארגייט בסדרות",
            usage: "סטארגייט",
            category: "פנאי",
            aliases: []
        });
    }

    async run(message, args, level) {
        let res = "https://www.sdarot.today/watch/92-stargate-sg-1-%D7%A1%D7%98%D7%90%D7%A8%D7%92%D7%99%D7%99%D7%98-%D7%90%D7%A1-%D7%92%D7%99-1";
        let popcorn = false;
        if (args[0] != null && (args[1] != '-' || args[3] != null)) {
            res = "שימוש שגוי בפקודה, שלח ללא פרמטרים או עם <עונה> - <פרק>"
        }
        else {
            if (args[0] == null) {
                popcorn = true;
            }
            else if (parseInt(args[0]).toString() == 'NaN' || parseInt(args[2]).toString() == 'NaN') {
                res = "אורי מה זה השטויות האלה ששמת פה"
            }
            else {
                res += "-stargate-sg-1/season/" + args[0] + "/episode/" + args[2];
                popcorn = true;
            }
        }
        message.channel.send(res.toString());
        if (popcorn) {
            message.channel.send("לא לשכוח incognito אחי");
            message.channel.send("צפייה נעימה ! 🍿");
        }
    }
}

module.exports = SG;