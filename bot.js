var express = require('express');
var http = require("http");
var app = express();

var Discord = require('discord.js');

var util = require(__dirname + '/util/util.js');

var bot = new Discord.Client();
var prefix = "~";

var port = process.env.PORT || 3000;
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


app.use(express.static('public'));

app.get("/", function(request, response)
{
    let datetime = new Date();
    console.log("Ping recieved [" + util.formatShortDate(datetime) + ", " + util.formatShortTime(datetime) + "]");
});

app.get("/ping", function(request, response)
{
    let datetime = new Date();
    let pcode = Math.floor(Math.random() * 10239571);
    response.send(`Code: ${pcode}`);
    console.log("Ping recieved [" + util.formatShortDate(datetime) + ", " + util.formatShortTime(datetime) + "]");
});

var listener = app.listen(port, function()
{
    console.log(process.env.PROJECT_DOMAIN.toUpperCase() + ' is online! [Port: ' + listener.address().port + ']');
});

// Keep server online
setInterval(() =>
{
    var options = {
        host: process.env.PROJECT_DOMAIN + ".glitch.me",
        port: 80,
        path: '/ping'
    };

    http.get(options, function(res) {}).on('error', function(e)
    {
        console.error("Got error: " + e.message);
    });
}, 280000);
