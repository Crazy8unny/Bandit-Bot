var express = require('express');
var http = require("http");
var app = express();
var util = require(__dirname + '/util/util.js');
var child_process = require("child_process")

var port = process.env.PORT || 3000;

var sassMiddleware = require("node-sass-middleware");

app.use(sassMiddleware({
  src: __dirname + '/public',
  dest: '/tmp',
  //debug: true,
  //outputStyle: 'compressed',
}));


var pingoptions = {
    host: process.env.PROJECT_DOMAIN + ".glitch.me",
    port: 80,
    path: '/ping'
};

app.use(express.static('/tmp'));
app.use(express.static('public'));

app.get("/", function(request, response)
{
    let datetime = new Date();

    http.get(pingoptions, function(res) {}).on('error', function(e)
    {
        console.error("Got error: " + e.message);
    });
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
    child_process.fork(__dirname + "/bot.js");
});

// Keep server online
setInterval(() =>
{
    var options = {
        host: process.env.PROJECT_DOMAIN + ".glitch.me",
        port: 80,
        path: '/ping'
    };

    http.get(pingoptions, function(res) {}).on('error', function(e)
    {
        console.error("Got error: " + e.message);
    });
}, 280000);
