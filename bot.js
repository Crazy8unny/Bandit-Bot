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

app.get("/", function (request, response) 
{
    let datetime = new Date();
    console.log("Ping recieved [" + util.formatShortDate(datetime) + ", " + util.formatShortTime(datetime) + "]");
});

app.get("/ping", function (request, response) 
{
    let pcode = Math.floor(Math.random() * 10239571);
    response.send(pcode);
});

var listener = app.listen(port, function()
{
    console.log(process.env.PROJECT_DOMAIN.toUpperCase() + ' is online! [Port: ' + listener.address().port + ']');
});

// Keep server online
setInterval(() =>
{
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
    console.log("Pinged Master Server!");
}, 2800);
 