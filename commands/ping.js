const Command = require("../base/Command.js");

class Ping extends Command {
  constructor (client) {
    super(client, {
      name: "פינג",
      description: "מציג את כמות הזמן לתגובה לפקודה",
      usage: "פינג",
      aliases: ["pong", "פונג", "ping"],
      category: "מידע"
    });
  }

  async run (message, args, level) { // eslint-disable-line no-unused-vars
    try {
      const msg = await message.channel.send("🏓 פינג !");
      msg.edit(`פונג ! :ping_pong: \n (זמן תגובה:  ${msg.createdTimestamp - message.createdTimestamp}ms)`)
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Ping;
