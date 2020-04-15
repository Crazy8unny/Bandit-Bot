const Command = require("../base/Command.js");

/*
  The HELP command is used to display every command's name and description
  to the user, so that he may see what commands are available. The help
  command is also filtered by level, so if a user does not have access to
  a command, it is not shown to them. If a command name is given with the
  help command, its extended help is shown.
*/
class Help extends Command {
  constructor (client) {
    super(client, {
      name: "עזרה",
      description: "מציג את כל הפקודות האפשריות עבורך",
      category: "מערכת",
      usage: "עזרה [פקודה]",
      aliases: ["הצילו"]
    });
  }

  async run (message, args, level) {
    // If no specific command is called, show all filtered commands.
    if (!args[0]) {
      // Load guild settings (for prefixes and eventually per-guild tweaks)
      const settings = message.settings;
      
      // Filter all commands by which are available for the user's level, using the <Collection>.filter() method.
      const myCommands = message.guild ? this.client.commands.filter(cmd => this.client.levelCache[cmd.conf.permLevel] <= level) : this.client.commands.filter(cmd => this.client.levelCache[cmd.conf.permLevel] <= level &&  cmd.conf.guildOnly !== true);
      
      // Here we have to get the command names only, and we use that array to get the longest name.
      // This make the help commands "aligned" in the output.
      const commandNames = myCommands.keyArray();
      const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);
      let currentCategory = "";
      let output = `= רשימת פקודות =\n\n[השתמש בפקודה ${this.client.config.defaultSettings.prefix}עזרה <שםהפקודה> בשביל פרטים נוספים]\n`;
      const sorted = myCommands.array().sort((p, c) => p.help.category > c.help.category ? 1 :  p.help.name > c.help.name && p.help.category === c.help.category ? 1 : -1 );
      sorted.forEach( c => {
        const cat = c.help.category.toProperCase();
        if (currentCategory !== cat) {
          output += `\u200b\n== ${cat} ==\n`;
          currentCategory = cat;
        }
        output += `${c.help.description} :: ${" ".repeat(longest - c.help.name.length)}${c.help.name}\n`;
      });
      if (level > 5) {
        message.author.send("סליחה אחי אתה מסווג טיפה...")
        message.author.send(output, {code:"asciidoc", split: { char: "\u200b" }});
        message.react("📧");
      }
      else {
        message.channel.send(output, {code:"asciidoc", split: { char: "\u200b" }});
      }
    } else {
      // Show individual command's help.
      let command = args[0];
      if (this.client.commands.has(command)) {
        command = this.client.commands.get(command);
        if (level < this.client.levelCache[command.conf.permLevel]) return;
        message.channel.send(`= ${command.help.name} = \n${command.help.description}\nשימוש:: ${command.help.usage}\nקיצורים:: ${command.conf.aliases.join(", ")}`, {code:"asciidoc"});
      }
    }
  }
}

module.exports = Help;
