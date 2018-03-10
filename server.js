var express = require('express');
var http = require("http");
var app = express();
var util = require(__dirname + '/util/util.js');
var child_process = require("child_process");

child_process.fork(__dirname + "/bot.js");

var port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get("/", function(request, response)
{
    let datetime = new Date();
    console.log("Ping recieved [" + util.formatShortDate(datetime) + ", " + util.formatShortTime(datetime) + "]");
});

app.get("/join", function(request, response)
{
    console.log("A user visited the [Join] page!");
    response.redirect("https://discord.gg/E3DPDk4");
});

app.get("/invite", function(request, response)
{
    console.log("A user visited the [Invite] page!");
    response.redirect("https://discordapp.com/oauth2/authorize?client_id=421403753976037376&permissions=27713&scope=bot");
});

app.get("/ping", function(request, response)
{
    let datetime = new Date();
    let pcode = Math.floor(Math.random() * 10239571);
    response.send(`Ping Code: ${pcode}`);
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
