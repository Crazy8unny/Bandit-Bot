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
    let countSec;
    let editMsg;
    if (!args[0]) {
      countdown = 5;
      printLion = true;
    }
    else if (countdown.toString() == "חלאס") {
      this.client.count = false;
    }
    if (args[1] == "דקות") {
      if (countdown.toString() == 'NaN' || countdown > 10 || countdown < 0) {
        countdown = 0;
        message.channel.send('עליך לציין מספר דקות לאחר הפקודה (עד 10 דקות)');
      }
      countdown *= 60;
      if (countdown > 0 && this.client.count) {
        editMsg = await message.channel.send("0️⃣0️⃣:0️⃣0️⃣"); 
      }
      while (countdown > 0 && this.client.count) {
        countMin = Math.floor(countdown / 60);
        countSec = (countdown - (countMin * 60));
        if (countSec < 10) {
          minString = minString[0] + minString[1] + "0" + minString[2];
        }
        minString = countMin + ":" + countSec;
        minString = minString.replace(/0/g, "0️⃣");
        minString = minString.replace(/1/g, "1️⃣");
        minString = minString.replace(/2/g, "2️⃣");
        minString = minString.replace(/3/g, "3️⃣");
        minString = minString.replace(/4/g, "4️⃣");
        minString = minString.replace(/5/g, "5️⃣");
        minString = minString.replace(/6/g, "6️⃣");
        minString = minString.replace(/7/g, "7️⃣");
        minString = minString.replace(/8/g, "8️⃣");
        minString = minString.replace(/9/g, "9️⃣");
        minString = "0️⃣" + minString;
        editMsg.edit(minString);
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
