Discordbot Template
===================
A simple boilerplate template for a discord bot!

Instructions
------------
1) Put your bot token in _.env_ where it says **TOKEN**
2) Put the prefix of the bot in _settings/configuration.json_
3) Put the ID of the official Support Guild for the bot in _.env_ where it says **OFFICIAL_GUILD**
4) Configure _util/permissions.js_ with the role IDs of the server if you want. Otherwise, simply delete that section.
5) In _bot.js_, fill the _commands_ object with commands for your bot. The template command is the `ping` command, which has already been done.

- The run function of a command takes three parameters: `message`, `args` and `data` (or `settings`). The `message` is the [discord.js](https://discord.js.org/#/) [message object](https://discord.js.org/#/docs/main/stable/class/Message). You can find the contents of the message by using `message.content`. `args`, on the other hand, is an array of all the arguments of the command (the words after the command word seperated by spaces).