const Command = require("../base/Command.js");

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
    let msg = message.toString();
    let numberString = msg.substring(6, msg.length);
    let numbers = numberString.split('-');
    if (numbers.length == 2) {
        res = Math.floor(Math.random() * parseInt(numbers[1]) + parseInt(numbers[0]));
        if (res.toString() == 'NaN') {
            res = "אורי מה זה השטויות האלה ששמת פה"
        }
    }
    else {
        res = "אתה צריך לשלוח  שתי מספרים עם - מפריד ביניהם אורי"
    }
        message.channel.send("אתה צריך לשלוח מספר אפשרויות עם `או` מפריד ביניהם אורי");
  }
}

module.exports = Random;
