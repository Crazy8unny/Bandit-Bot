const Command = require("../base/Command.js");

class SG extends Command {
  constructor (client) {
    super(client, {
      name: "סטארגייט",
      description: "מביא את הלינק של סטארגייט בסדרות, ניתן לקבל גם מספר פרק על ידי כתיבת <עונה> - <פרק>",
      usage: "סטארגייט",
      category: "פנאי",
      aliases: []
    });
  }

  async run (message, args, level) { 
    let res = "https://www.sdarot.today/watch/92-stargate-sg-1-%D7%A1%D7%98%D7%90%D7%A8%D7%92%D7%99%D7%99%D7%98-%D7%90%D7%A1-%D7%92%D7%99-1";
    if ((args[1] != '-' || args[3] != null) && args[0] != null) {
        res = "שימוש שגוי בפקודה, גש לעזרה למידע נוסף"        
    }
    else {
        if (args[0] == null) {}
        else if (parseInt(args[0]).toString() == 'NaN' || parseInt(args[2]).toString() == 'NaN') {
            res = "אורי מה זה השטויות האלה ששמת פה"
        }
        else {
            res += "-stargate-sg-1/season/" + args[0] + "/episode/" + args[3];
        }
        message.channel.send(res.toString());
        message.channel.send("לא לשכוח incognito אחי");
        message.channel.send("צפייה נעימה ! 🍿");
    }
  }
}

module.exports = SG;
