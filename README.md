Discord Bot Template
===================
A simple boilerplate template for a discord bot!

Instructions
------------
1) [Remix this project on Glitch](https://glitch.com/edit/#!/remix/discordbot-template)
2) Put your bot token in _.env_ where it says **TOKEN**
3) Put the prefix of the bot in _settings/configuration.json_
4) Put the ID of the official Support Guild for the bot in _.env_ where it says **OFFICIAL_GUILD**
5) Configure _util/permissions.js_ with the role IDs of the server if you want. Otherwise, simply delete that section.
6) In _bot.js_, fill the _commands_ object with commands for your bot. The template command is the `ping` command, which has already been done.
_________________________________________________________

Run Function
------------
The run function of a command takes three parameters: `message`, `args` and `data` (or `settings`). The `message` is the [discord.js](https://discord.js.org/#/) [message object](https://discord.js.org/#/docs/main/stable/class/Message). You can find the contents of the message by using `message.content`. `args`, on the other hand, is an array of all the arguments of the command (the words after the command word seperated by spaces). For example, if someone wrote the command `shoot gun car`, the command would be `shoot`, `args[0]` would be _gun_ and `args[1]` would be _car_. The final parameter, `data` or `settings`, is an array of some miscellaneous data about the message, bot or anything else!
_________________________________________________________

Arguments
---------
The `arguments` property of a command is an array of all the commands arguments, displayed as strings.
If the argument name begins with `-o `, the argument is optional. If the argument name starts with `-r ` then the argument is required. For example, here is a clear command:
```
clear: 
{
    arguments: ["-o user", "-r amount"],
    run: function(message, args, data) {...}
}
```
As you can see, the user argument is optional - the command can still work correctly without the user parameter, whereas the amount is mandatory - the command cannot and will not work without an amount to clear!
_________________________________________________________

Command Name & Description
--------------------------
The command name should match the key for the command, but with a capital letter to begin with (this is just common convention). 
Here is an example: 
```
help:
{
    name: "Help"
}
```

The command Description should describe clearly the function of the command and, if the command has any arguments (required _or_ optional), the description should clarify what these are for. Here is an example description:
```
description: "The **Ping** command is a simple command that responds with the latency of the bot in milliseconds."
```
_________________________________________________________

Permission Level
----------------
Certain commands should only be accessed by users with certain permisions. For example, if the bot had a clear command, we would only want that available to users who have access to the `MANAGE_MESSAGES` permission (which is configured to be permission level 4 by default. See `util/permissions.js` to change or review the permission level setup). To make a command permission-level restricted, add the `permission` attribute to the command. E.g.:
```
clear
{
    permission: 4,
    run: function(message, args, data) {...}
}
```
_________________________________________________________

Aliases
-------
For convention, the template has a few aliases. This is so that when a library updates, you only need to edit 1 line, rather than many, _many_ more!
An example alias is for the Discord Rich Embed: in upcoming versions of discord.js, the RichEmbed will be known as a `MessageEmbed`, so rather than changing every single place where it says `RichEmbed` in your bot code, you
_________________________________________________________

Overview
--------
In conclusion, this is a simple bot template which allows you to make amazing discord bots! The possibilities are endless with this template and I hope you make some amazing things with this!

Here is a complete command example: 
```
help:
{
    name: "Help",
    description: "Displays a simple help message! If a command is specified, it will give information on the command.",
    category: "General",
    arguments: ["-o command"],
    permission: 1,
    usage: `${prefix}help <command>`,
    exampleusage: `${prefix}help ping`,
    run: function(message, args, data)
    {
        let embed = new Embed();
        embed.setTitle("__" + data.display_name + "__");
        embed.setColor(data.display_colour.hex);
        embed.setThumbnail(bot.user.avatarURL);

        embed.setDescription("Hello! I am **" + bot.user.username + "**!");
        embed.addField("Getting Started", "Type `" + prefix + "commands` to see my commands\nType `" + prefix + "stats` to see some of my statistics");


        embed.setFooter("Requested by " + message.member.displayName.split("_").join("\\_"), message.author.avatarURL);
        message.channel.send(embed);
    }
}
```