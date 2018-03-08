var express = require('express');
var http = require("http");
var app = express();

var Discord = require('discord.js');

var util = require(__dirname + '/util/util.js');

var bot = new Discord.Client();
var prefix = "~";

var pingCode = -1;

var port = process.env.PORT || 3000;
var token = process.env.TOKEN || -1;

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
