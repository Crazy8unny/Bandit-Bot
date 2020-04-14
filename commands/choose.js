const Command = require("../base/Command.js");

class Choose extends Command {
  constructor (client) {
    super(client, {
      name: "בחר",
      description: "בוחר דברים",
      usage: "בחר",
      category: "שימושי",
      aliases: []
    });
  }

  async run (message, args, level) { 
    let optionsString = msg.substring(3, msg.length);
    let options = optionsString.split(' או ');
    if (options.length > 1) {
        res = options[Math.floor(Math.random() * options.length)];
    }
    else {
        res = "אתה צריך לשלוח מספר אפשרויות עם `או` מפריד ביניהם אחינו"
    }
    message.channel.send(res.toString());
  }
}

module.exports = Choose;
