const Command = require("../../base/Command.js");

class Random extends Command {
  constructor (client) {
    super(client, {
      name: "הגרל",
      description: "מגריל מספרים בטווח מסוים",
      usage: "הגרל",
      category: "שימושי",
      aliases: []
    });
  }

  async run (message, args, level) { 
    let res;
    if (args[1] != '-' || args[3] != null) {
        res = "אתה צריך לשלוח  שתי מספרים עם `-` מפריד ביניהם אורי";
    }
    else {
        res = Math.floor(Math.random() * parseInt(args[2]) + parseInt(args[0]));
        if (res.toString() == 'NaN') {
            res = "אורי מה זה השטויות האלה ששמת פה"
        }
    }
    message.channel.send(res.toString());
  }
}

module.exports = Random;
