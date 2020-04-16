// The MESSAGE event runs anytime a message is received
// Note that due to the binding of client to every event, every event
// goes `client, other, args` when this function is run.

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(message) {

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    //  and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    // Cancel any attempt to execute commands if the bot cannot respond to the user.
    if (message.guild && !message.channel.permissionsFor(message.guild.me).missing("SEND_MESSAGES")) return;

    if (message.channel.type == "dm") return message.reply('אל דבר איתי פה אחי');

    // Grab the settings for this server from the Enmap
    // If there is no guild, get default conf (DMs)
    const settings = this.client.getSettings(message.guild);

    // For ease of use in commands and functions, we'll attach the settings
    // to the message object, so `message.settings` is accessible.
    message.settings = settings;

    // Checks if the bot was mentioned, with no message after it, returns the prefix.
    const prefixMention = new RegExp(`^<@!?${this.client.user.id}> ?$`);
    if (message.content.match(prefixMention)) {
      return message.reply(`דבר אליי עם \`${settings.prefix}\` אחי`);
    }

    // Get the user or member's permission level from the elevation
    const level = this.client.permlevel(message);

    // Also good practice to ignore any message that does not start with our prefix,
    // which is set in the configuration file.
    if (message.content.indexOf(settings.prefix) == 0) {

      // Here we separate our "command" name, and our "arguments" for the command.
      // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
      // command = say
      // args = ["Is", "this", "the", "real", "life?"]
      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
      const command = args.shift().toLowerCase();

      // If the member on a guild is invisible or not cached, fetch them.
      if (message.guild && !message.member) await message.guild.fetchMember(message.author);

      // Get the user or member's permission level from the elevation
      const level = this.client.permlevel(message);

      // Check whether the command, or alias, exist in the collections defined
      // in app.js.
      const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
      // using this const varName = thing OR otherthign; is a pretty efficient
      // and clean way to grab one of 2 values!
      if (!cmd) return;

      // Some commands may not be useable in DMs. This check prevents those commands from running
      // and return a friendly error message.
      if (cmd && !message.guild && cmd.conf.guildOnly)
        return message.channel.send("This command is unavailable via private message. Please run this command in a guild.");

      if (level < this.client.levelCache[cmd.conf.permLevel]) {
        if (settings.systemNotice === "true") {
          return message.channel.send(`חחח מצחיק אורי`);
        } else {
          return;
        }
      }

      // To simplify message arguments, the author's level is now put on level (not member, so it is supported in DMs)
      // The "level" command module argument will be deprecated in the future.
      message.author.permLevel = level;

      message.flags = [];
      while (args[0] && args[0][0] === "-") {
        message.flags.push(args.shift().slice(1));
      }

      // If the command exists, **AND** the user has permission, run it.
      this.client.logger.log(`${this.client.config.permLevels.find(l => l.level === level).name} ${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`, "cmd");
      cmd.run(message, args, level);
    }

    // Check if the message contains one of our special words
    else {
      let cmd;
      let msg = message.content.toString();
      const args = msg.split(' ');
      for (let word = 0; word < args.length; word++) {
        cmd = this.client.containsCommands.get(args[word]);
        if (cmd) {
          cmd.run(message, args, level);
          break;
        }
      }
    }
  }
};
