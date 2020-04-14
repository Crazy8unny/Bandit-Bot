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
    let msg = message.toString();
    let optionsString = msg.substring(4, msg.length);
    let options = optionsString.split(' או ');
    if (options.length > 1) {
        message.channel.send((options[Math.floor(Math.random() * options.length)]).toString());
    }
    else {
        message.channel.send("אתה צריך לשלוח מספר אפשרויות עם `או` מפריד ביניהם אורי");
    }
  }
}

module.exports = Choose;
