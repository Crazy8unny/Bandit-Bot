var express = require('express');
var http = require("http");
var app = express();

var port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get("/", function (request, response) 
{
    response.sendFile(__dirname + '/views/index.html');
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
 