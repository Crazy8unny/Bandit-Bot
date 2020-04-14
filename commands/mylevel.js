const Command = require("../base/Command.js");

class MyLevel extends Command {
  constructor (client) {
    super(client, {
      name: "הרמה שלי",
      description: "הצג את רמת ההרשאות שלך על הבוט",
      usage: "mylevel",
      guildOnly: true,
      Category: "מידע"
    });
  }

  async run (message, args, level) {
    const friendly = this.client.config.permLevels.find(l => l.level === level).name;
    message.reply(`${level} - ${friendly}רמת ההרשאות שלך היא: `);
  }
}

module.exports = MyLevel;
