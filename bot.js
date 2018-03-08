var Discord = require('discord.js');

var util = require(__dirname + '/util/util.js');

var bot = new Discord.Client();
var prefix = "~";

var botID = 421403753976037376;

var token = process.env.TOKEN || -1;

bot.on('ready', async function()
{
    console.log("Connected to Discord!");
    console.log("_____________________");
    console.log('Bot is online - ' + bot.user.tag);
    try
    {
        let link = await bot.generateInvite(["MANAGE_MESSAGES", "SEND_MESSAGES", "READ_MESSAGES", "ADD_REACTIONS"])
        console.log("Invite: " + link);
    }
    catch (e)
    {
        console.log(e)
    }

    let guilds = bot.guilds.array().length;

    bot.user.setStatus('idle');

    bot.user.setActivity(`${bot.guilds.size} Servers | ~help`,
    {
        type: "WATCHING"
    })

});

bot.on("message", function (message) 
{
    if (!message.content.startsWith(prefix) && message.content.indexOf(botID) > 5 || !message.content.startsWith(prefix) && message.content.indexOf(botID) <= -1) return;
    
    let command = message.content.split(" ")[0].substr(1);
    if (commands[command])
    {
        try
        {
            commands[command].run(message, message.content.split(" ").splice(1, 0));
        }
        catch (e)
        {
            console.error(e);
        }
    }
});

var commands = 
{
    ping: {
        name: "Ping",
        description: "A simple command to check the latency of the bot.",
        usage: `${prefix}ping`,
        run: function(message, args)
        {
            message.delete();
            message.channel.send(`:ping_pong: Pong! \`${(new Date().getTime() - message.createdTimestamp)}ms\``).then(msg => {msg.delete(3000)});
        }
    },
    help: {
        name: "Help",
        description: "Displays a simple help message! If a command is specified, it will give information on the command.",
        usage: `${prefix}help || ${prefix}help <command>`,
        run: function()
      {
      }
    }
};

bot.login(token);