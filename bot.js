var express = require('express');
var http = require("http");
var app = express();

var Discord = require('discord.js');

var util = require(__dirname + '/util/util.js');

var bot = new Discord.Client();
var prefix = "~";

var port = process.env.PORT || 3000;
var token = process.env.TOKEN || -1;

app.use(express.static('public'));

app.get("/", function (request, response) 
{
    response.sendFile(__dirname + '/views/index.html');
    console.log("Ping recieved [" + util.formatShortDate(new Date()) + ", " + u"]");
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
}, 280000);
 