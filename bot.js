var Discord = require('discord.js');

var util = require(__dirname + '/util/util.js');

var bot = new Discord.Client();
var prefix = "~";

var token = process.env.TOKEN || -1;

bot.on('ready', async () =>
{
    console.log("Connected to Discord!");
    console.log("_____________________");
    console.log('Bot is online - ' + bot.user.tag);
    try
    {
        let link = await bot.generateInvite(["MANAGE_CHANNELS", "SEND_MESSAGES", "READ_MESSAGES"])
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

var commands = 
{
    ping: {
        name: "Ping",
        description: "A simple command to check the latency of the bot.",
        run: function()
        {
            
        }
    }
};

bot.login(token);