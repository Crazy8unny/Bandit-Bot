const Command = require("../base/Command.js");

class Count extends Command {
  constructor (client) {
    super(client, {
      name: "ספור",
      description: "סופר לאחור",
      usage: "ספור",
      category: "שימושי",
      aliases: []
    });
  }

  async run (message, args, level) { 
    let countdown = args[0];
    let printLion = false;
    if (!args[0] || countdown == 5) {
      countdown = 5;
      printLion = true;
    }
    if (countdown.toString() == 'NaN' || countdown > 100 || countdown < 0) {
        countdown = 0;
        message.channel.send('עליך לציין מספר שניות לאחר הפקודה (עד 100 שניות)');
    }
    while (countdown > 0) {
      message.channel.send(countdown.toString());
      await this.client.wait(1000);
      countdown--;
    }
    if (printLion) {
      message.channel.send(':lion_face:');
    }
  }
}

module.exports = Count;
