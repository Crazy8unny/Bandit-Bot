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
    client.logger.log(message.toString());
    client.logger.log(args.toString());
    client.logger.log(level.toString());
  }
}

module.exports = Count;
