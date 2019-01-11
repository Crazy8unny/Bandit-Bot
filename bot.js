var Discord = require('discord.js');
var firebase = require('firebase');
var child_process = require("child_process");

var util = require(__dirname + '/util/util.js');
var permission = require(__dirname + '/util/permissions.js');
var config = require(__dirname + '/settings/configuration.json');

var bot = new Discord.Client();
var Embed = Discord.RichEmbed;
var prefix = config.prefix;

var botID = 430794193808523267;

var token = process.env.TOKEN || -1;

var serverdata = {};

// Initialize Firebase
var config = {

};

bot.on('ready', async function()
{
    console.log("_____________________");
    console.log("Connected to Discord!");
    console.log("---------------------");
    console.log('Bot is online - ' + bot.user.tag);
    try
    {
        let link = await bot.generateInvite(["ADMINISTRATOR"])
        console.log("Invite: " + link);
    }
    catch (e)
    {
        console.log(e);
    }

    if (!firebase.apps.length) firebase.initializeApp(config);

    botID = bot.user.id;

    let guilds = bot.guilds.size;

    bot.user.setStatus('idle');

    bot.user.setActivity(`${guilds} Servers | ${prefix}help`,
    {
        type: "WATCHING"
    });
  

    let ref = firebase.database().ref("Serverdata");
    await ref.on("value", function(snapshot)
    {
        let data = snapshot.val();
        serverdata = data;
    });

});

bot.on("guildCreate", function(guild)
{
    console.log("Joined Guild: " + guild.name + "!");
    let data = {};
    data.Name = guild.name;
    data.Configuration = {
        prefix: prefix
    };
    data.Date = new Date();

    let ref = firebase.database().ref().child("Serverdata").child(guild.id.toString());
    ref.update(data);
});

bot.on("guildDelete", function(guild)
{
    console.log("Left Guild: " + guild.name + "!");
});

bot.on("guildMemberAdd", function(member)
{
    if (!serverdata[member.guild.id.toString()]) return;
    if (serverdata[member.guild.id.toString()].Configuration.autorole)
    {
        let role = serverdata[member.guild.id.toString()].Configuration.autorole;
        member.addRole(serverdata[member.guild.id.toString()].Configuration.autorole);
    }
});

bot.on("message", function(message)
{
    if (message.guild && serverdata && serverdata[message.guild.id.toString()] && serverdata[message.guild.id.toString()].Configuration.prefix) prefix = serverdata[message.guild.id.toString()].Configuration.prefix;
    if (!message.content.startsWith(prefix) && message.content.indexOf(botID) > 5 || !message.content.startsWith(prefix) && message.content.indexOf(botID) <= -1) return;

    let command = message.content.indexOf(botID) != -1 ? message.content.split(">")[1] : message.content.split(prefix)[1].split(" ")[0];

    if (!command) return;

    command = command.toLowerCase().trim().split(" ")[0];
    let args = [];
    if (message.content.split(command)[1]) 
    {
        let cbits = message.content.split(command);
        cbits.shift();
        args = cbits.join(command).trim().split(" ");
        
    }
    if (message.channel.type == "text" && commands[command])
    {
        try
        {
            let data = {};

            data["permission"] = permission.getPermissionLevel(bot, message.guild, message.author.id);

            data["display_name"] = message.guild.members.find(m => m.id == botID)
                .displayName;
            data["display_colour"] = {
                hex: message.guild.members.find(m => m.id == botID)
                    .displayHexColor,
                dec: message.guild.members.find(m => m.id == botID)
                    .displayColor
            };

            if (!commands[command].permission) commands[command].permission = 1;
          
            if (data.permission >= commands[command].permission)
            {
                let error = commands[command].run(message, args, data);
                if (error)
                {
                    let embed = new Embed()
                        .setColor(`#FF0000`)
                        .setDescription(error);

                    message.channel.send(embed);
                }
            }
            else
            {
                message.channel.send("Sorry, but you do not have enough permission to do that! (Type `" + prefix + "commands` to see what commands you can use!)");
            }
        }
        catch (e)
        {
            if (e.message.includes("DiscordAPIError: Missing Permissions"))
            {
                let embed = new Embed()
                    .setTitle("__Not Enough Permission__")
                    .setColor(`#FF0000`)
                    .setDescription(`Sorry, but I do not have enough permission to carry out that command!`);

                message.channel.send(embed);
            }
            console.error(e);
        }
    }
    else if ((message.channel.type == "dm" || message.channel.type == "group") && DMCommands[command])
    {

        try
        {
            let data = {};
            data["permission"] = 1;

            DMCommands[command].run(message, args, data);
        }
        catch (e)
        {

            console.error(e);
        }
    }
});

var DMCommands = {
    ping:
    {
        name: "Ping",
        description: "A simple command to check the latency of the bot.",
        category: "General",
        arguments: [],
        permission: 1,
        usage: `${prefix}ping`,
        exampleusage: `${prefix}ping`,
        run: function(message, args, data)
        {
            message.delete();
            message.channel.send(`:ping_pong: Pong! \`${(new Date().getTime() - message.createdTimestamp)}ms\``)
                .then(msg =>
                {
                    msg.delete(3000)
                });
        }
    }
};

var commands = {
    ping:
    {
        name: "Ping",
        description: "A simple command to check the latency of the bot.",
        category: "General",
        arguments: [],
        permission: 1,
        usage: `${prefix}ping`,
        exampleusage: `${prefix}ping`,
        run: function(message, args, data)
        {
            message.delete();
            message.channel.send(`:ping_pong: Pong! \`${(new Date().getTime() - message.createdTimestamp)}ms\``)
                .then(msg =>
                {
                    msg.delete(3000)
                });
        }
    },
    eval:
    {
        name: "Eval",
        description: "Runs the code specified. Should only be accessed by a developer.",
        category: "Development",
        arguments: ["-r code"],
        permission: 8,
        usage: `${prefix}eval <code>`,
        exampleusage: `${prefix}eval message.reply(103 * 513);`,
        run: function(message, args, data)
        {
            let code = args.join(" ")
                .split("env")
                .join("BANNED_WORD")
                .split("process")
                .join("PROCESS_IS_NOT_ALLOWED")
                .split("token")
                .join("INVALID");
            try
            {
                console.log(code);
                eval(code);
            }
            catch (e)
            {
                let embed = new Embed();
                embed.setTitle("__Evaluation Error__");
                embed.setColor("#FF0000");
                embed.addField("Your Code", "```js\n" + code + "```");
                embed.addField("Error", e.message);
                embed.setFooter("Response to Evaluation Command by " + message.member.displayName);

                message.channel.send(embed)
                    .then(msg => msg.delete(60000));
            }
        }
    },
    restart:
    {
        name: "Restart",
        description: "Restarts the bot. Timeout can be in seconds (if s is suffixed at end of timeout), minutes (if m is suffixed at the end of the timeout), hours (if h is suffixed at the end of the timeout) or milliseconds if no timeframe is specified. If no timeout is specified, the bot will restart immediately.\n\n**__WARNING: BOT WILL NOT WORK UNTIL RESTART IS COMPLETE!__**",
        category: "Development",
        arguments: ["-o timeout"],
        permission: 8,
        usage: `${prefix}restart <timeout>`,
        exampleusage: `${prefix}restart 30s`,
        run: function(message, args, data)
        {
            // Timeout exists
            if (args[0])
            {
                let timeout = args[0].substr(0, args[0].length - 1);
                let timeframe = args[0].substr(args[0].length - 1);
                if (isNaN(timeout))
                {
                    return "Timeout must be a number! (Only one letter suffix at end!)";
                }

                if (!isNaN(timeframe))
                {
                    timeout = timeout.toString() + timeframe;
                    timeframe = "k";
                }

                timeout = parseInt(timeout);
                let timeframes = {
                    "r": 1,
                    "k": 10,
                    "m": 100,
                    "s": 1000,
                    "m": 60000,
                    "h": 3600000,
                    "d": 86400000
                };

                let total = (timeout * timeframes[timeframe]);

                let channel = message.channel;
                channel.send(`✅ ${bot.user.tag} will restart in __${(total / 1000)} second${(total / 1000) > 1 ? "s" : ""}__!`);

                console.log("\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                console.log(`Bot will restart in ${(total / 1000)} second${(total / 1000) == 1 ? "s" : ""}.`);
                console.log("===============================================\n\n");

                setTimeout(function()
                {
                    message.channel.send("⚠️ _Bot restarting..._");
                    console.log("\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                    console.log(`⚠️ Bot restarting... ⚠️`);
                    console.log("===============================================\n\n");
                    bot.destroy();
                    child_process.fork(__dirname + "/bot.js");
                    console.log(`Bot Successfully Restarted`);
                }, total);

            }
            else
            {
                message.channel.send("⚠️ _Bot restarting..._");
                console.log("\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                console.log(`⚠️ Bot restarting... ⚠️`);
                console.log("===============================================\n\n");
                bot.destroy();
                child_process.fork(__dirname + "/bot.js");
                console.log(`Bot Successfully Restarted`);
            }
        }
    },
    permission:
    {
        name: "Permission",
        description: "Shows you your permission level!",
        category: "General",
        arguments: ["-o @user"],
        permission: 1,
        usage: `${prefix}permission`,
        exampleusage: `${prefix}permission @Furvux#2414`,
        run: function(message, args, data)
        {
            let user = message.mentions.members.first() || message.guild.members.find(m => m.displayName.toLowerCase() == args[0] ? args[0].toLowerCase() : args[0] || m.user.username.toLowerCase() == args[0] ? args[0].toLowerCase() : args[0]) || message.member;

            let perm = permission.getPermissionLevel(bot, message.guild, user.user.id);

            message.channel.send(user.displayName + "'s permission level is **" + perm + "**");
        }
    },
    roll:
    {
        name: "Roll",
        description: "Rolls a dice for you.",
        category: "Miscellaneous",
        arguments: [],
        permission: 1,
        usage: `${prefix}roll`,
        exampleusage: `${prefix}roll`,
        run: function(message, args, data)
        {
            let number = Math.floor(Math.random() * 5) + 1;

            if (number == 6)
            {
                let number2 = Math.floor(Math.random() * 5) + 1;
                number += number2;
            }

            message.channel.send("You rolled a **" + number + "**!");
        }
    }

};

bot.login(token);

process.on('unhandledRejection', (reason, p) =>
{
    console.error('Unhandled Rejection at: ' + p + '\nReason: ' + reason);

});

process.on('exit', () =>
{

});

// Function for making a webhook. Bot must have MANAGE_WEBHOOKS or ADMINISTRATOR permission for this
function hook(channel, title, message, color, avatar)
{

    if (!channel) return ('Channel not specified.');
    if (!title) return ('Title not specified.');
    if (!message) return ('Message not specified.');
    if (!color) color = '843B80';
    if (!avatar) avatar = 'https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FCoverimg.png?1521142277136'

    color = color.replace(/\s/g, '');
    avatar = avatar.replace(/\s/g, '');

    if (color.startsWith("#")) color = color.substr(1);

    channel.fetchWebhooks()
        .then(webhook =>
        {

            let foundHook = webhook.find('name', 'Webhook');

            if (!foundHook)
            {
                channel.createWebhook('Webhook', avatar)
                    .then(webhook =>
                    {

                        webhook.send('',
                            {
                                "username": title,
                                "avatarURL": avatar,
                                "embeds": [
                                {
                                    "color": parseInt(`0x${color}`),
                                    "description": message,
                                    thumbnail:
                                    {
                                        url: avatar
                                    }
                                }]
                            })
                            .catch(error =>
                            {
                                console.log(error);
                                return channel.send('**Something went wrong when sending the webhook. Please check console.**');
                            })
                    })
            }
            else
            {
                foundHook.send('',
                    {
                        "username": title,
                        "avatarURL": avatar,
                        "embeds": [
                        {
                            "color": parseInt(`0x${color}`),
                            "description": message,
                            thumbnail:
                            {
                                url: avatar
                            }
                        }]
                    })
                    .catch(error =>
                    {
                        console.log(error);
                        return channel.send('**Something went wrong when sending the webhook. Please check console.**');
                    })
            }

        })

}
