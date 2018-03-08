var Discord = require('discord.js');

var util = require(__dirname + '/util/util.js');

var bot = new Discord.Client();
var prefix = "~";

var token = process.env.TOKEN || -1;
bot.login(token);

bot.on('ready', async () =>
{
let icon = bot.user.avatarURL;
    bot.setMaxListeners(15);
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

    bot.user.setStatus('online');

    var store = [];
    var oldf = console.log;
    console.log = function()
    {
       store.push(arguments);
       oldf.apply(console, arguments);
    }

    let users = bot.users.size;

    console.log('Serving ' + users + ' users on ' + guilds + ' servers!');

    bot.user.setActivity(`${bot.guilds.size} Servers | ~help`,
    {
        type: "SERVING"
    })

});

