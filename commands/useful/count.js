const Command = require("../../base/Command.js");

class Count extends Command {
  constructor(client) {
    super(client, {
      name: "ספור",
      description: "סופר לאחור (חלאס כדי לעצור, דקות בשביל טיימר)",
      usage: "ספור",
      category: "שימושי",
      aliases: []
    });
  }

  async run(message, args, level) {
    this.client.count = true;
    let countdown = args[0];
    let printLion = false;
    let minString;
    let countMin;
    if (!args[0]) {
      countdown = 5;
      printLion = true;
    }
    else if (countdown.toString() == "חלאס") {
      this.client.count = false;
    }
    if (args[0] == "דקות") {
      if (countdown.toString() == 'NaN' || countdown > 10 || countdown < 0) {
        countdown = 0;
        message.channel.send('עליך לציין מספר דקות לאחר הפקודה (עד 10 דקות)');
      }
      countdown *= 60;
      while (countdown > 0 && this.client.count) {
        countMin = Math.floor(countdown / 60);
        minString = countMin + ":" + (countdown - (countMin * 60));
        minString.replace("0", "0️⃣");
        minString.replace("1", "1️⃣");
        minString.replace("2", "2️⃣");
        minString.replace("3", "3️⃣");
        minString.replace("4", "4️⃣");
        minString.replace("5", "5️⃣");
        minString.replace("6", "6️⃣");
        minString.replace("7", "7️⃣");
        minString.replace("8", "8️⃣");
        minString.replace("9", "9️⃣");
        if (minString.length < 4) {
          minString = minString[0] + minString[1] + "0️⃣" + minString[2];
        }
        minString = "0️⃣" + minString;
        message.channel.send(minString);
        await this.client.wait(1000);
        countdown--;
      }
    }
    else {
      if (countdown.toString() == 'NaN' || countdown > 100 || countdown < 0) {
        countdown = 0;
        message.channel.send('עליך לציין מספר שניות לאחר הפקודה (עד 100 שניות)');
      }
      while (countdown > 0 && this.client.count) {
        message.channel.send(countdown.toString());
        await this.client.wait(1000);
        countdown--;
      }
      if (printLion) {
        message.channel.send(':lion_face:');
      }
    }
  }
}

module.exports = Count;
