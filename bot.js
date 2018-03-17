var Discord = require('discord.js');
var firebase = require('firebase');
var child_process = require("child_process");
var Jimp = require('jimp');
var urbandict = require("urban-dictionary");

var util = require(__dirname + '/util/util.js');
var instructions = require(__dirname + '/util/instructions.js');
var permission = require(__dirname + '/util/permissions.js');
var config = require(__dirname + '/settings/configuration.json');

var bot = new Discord.Client();
var Embed = Discord.RichEmbed;
var prefix = config.prefix;
var OFFICIAL_GUILD_NAME = "Tilde Dojo";

var botID = 421403753976037376;

var token = process.env.TOKEN || -1;

var games = {};
games["XO"] = {};
games["TwentyOne"] = {};
var playing = [];
var gameIDs = {};

var assets = {};
assets.XO = {};
assets.CoinFlip = {};
assets.DeathBattle = {};
assets.Elementals = {};

var serverdata = {};

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBnKrLqwldnRRryvqUdUH5lidilH3gDTG0",
    authDomain: "tilde-discord.firebaseapp.com",
    databaseURL: "https://tilde-discord.firebaseio.com",
    projectId: "tilde-discord",
    storageBucket: "",
    messagingSenderId: "782339524894"
};

var creatureCommand = "elemental";

bot.on('ready', async function()
{
    console.log("_____________________");
    console.log("Connected to Discord!");
    console.log("---------------------");
    console.log('Bot is online - ' + bot.user.tag);
    try
    {
        let link = await bot.generateInvite(["MANAGE_MESSAGES", "SEND_MESSAGES", "READ_MESSAGES", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "EMBED_LINKS", "CREATE_INSTANT_INVITE", "ATTACH_FILES", "MANAGE_WEBHOOKS"])
        console.log("Invite: " + link);
    }
    catch (e)
    {
        console.log(e);
    }

    if (!firebase.apps.length) firebase.initializeApp(config);

    botID = bot.user.id;

    let guilds = bot.guilds.array()
        .length;

    bot.user.setStatus('idle');

    bot.user.setActivity(`${bot.guilds.size} Servers | ~help`,
    {
        type: "WATCHING"
    });

    let x = "https://cdn.glitch.com/7cb13e4a-c822-4516-a784-952f82478aa0%2FX.png";
    let o = "https://cdn.glitch.com/7cb13e4a-c822-4516-a784-952f82478aa0%2FO.png";
    let board = "https://cdn.glitch.com/7cb13e4a-c822-4516-a784-952f82478aa0%2FNoughtsAndCrossesBoard.png";

    let headCoin = "https://cdn.glitch.com/7cb13e4a-c822-4516-a784-952f82478aa0%2FHeads.png";
    let tailCoin = "https://cdn.glitch.com/7cb13e4a-c822-4516-a784-952f82478aa0%2FTails.png";

    assets.XO.Board = {};
    assets.XO.X = {};
    assets.XO.O = {};

    assets.CoinFlip.Heads = {};
    assets.CoinFlip.Tails = {};

    assets.Elementals.Characters = {};
    assets.Elementals.Characters.Fire = {};
    assets.Elementals.Characters.Water = {};
    assets.Elementals.Characters.Nature = {};

    assets.Elementals.Characters.Fire.Fizzball = {};
    assets.Elementals.Characters.Fire.Flizard = {};

    assets.Elementals.Characters.Water.Zrog = {};
    assets.Elementals.Characters.Water.Tristisk = {};

    assets.Elementals.Characters.Nature.Marsoak = {};
    assets.Elementals.Characters.Nature.Shrumarsh = {};

    loadAsset(board, assets.XO.Board);
    loadAsset(x, assets.XO.X);
    loadAsset(o, assets.XO.O);

    loadAsset(headCoin, assets.CoinFlip.Heads);
    loadAsset(tailCoin, assets.CoinFlip.Tails);

    loadData("Serverdata", serverdata);

    loadAsset("https://cdn.glitch.com/eb55e3ce-5de5-4ea2-89a0-eefe4fd28eaf%2FFizzball.png", assets.Elementals.Characters.Fire.Fizzball);
    loadAsset("https://cdn.glitch.com/eb55e3ce-5de5-4ea2-89a0-eefe4fd28eaf%2FFlizard.png", assets.Elementals.Characters.Fire.Flizard);

    loadAsset("https://cdn.glitch.com/eb55e3ce-5de5-4ea2-89a0-eefe4fd28eaf%2FZrog.png", assets.Elementals.Characters.Water.Zrog);
    loadAsset("https://cdn.glitch.com/eb55e3ce-5de5-4ea2-89a0-eefe4fd28eaf%2FTritisk.png", assets.Elementals.Characters.Water.Tristisk);

    loadAsset("https://cdn.glitch.com/eb55e3ce-5de5-4ea2-89a0-eefe4fd28eaf%2FMarsoak.png", assets.Elementals.Characters.Nature.Marsoak);
    loadAsset("https://cdn.glitch.com/eb55e3ce-5de5-4ea2-89a0-eefe4fd28eaf%2FShrumarsh.png", assets.Elementals.Characters.Nature.Shrumarsh);

    games.XO.Playing = [];
    games.TwentyOne.Playing = [];
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

bot.on("message", function(message)
{
    // Game Command
    if (!isNaN(message.content) && parseInt(message.content) > 0 && playing.includes(message.author.id))
    {
        let play = checkGame(message.member);
        if (play == 0xCAFE25151 && parseInt(message.content) < 10) placeXO(message, games, assets.XO.X.i, assets.XO.O.i, toBufferAndSend);
        else if (play == 0xCAFE25152 && parseInt(message.content) < 22) place21(message);
    }


    if (!message.content.startsWith(prefix) && message.content.indexOf(botID) > 5 || !message.content.startsWith(prefix) && message.content.indexOf(botID) <= -1) return;

    let command = message.content.indexOf(botID) != -1 ? message.content.split(">")[1] : message.content.split(" ")[0].substr(prefix.length);

    if (!command) return;

    command = command.toLowerCase().trim();
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
            data["server"] = bot.guilds.get(`421405545426321418`);
            data["developers"] = data.server.roles.get(`421405858736373760`)
                .members.array();

            if (data.permission >= commands[command].permission)
            {
                let error = commands[command].run(message, message.content.split(" ")
                    .splice(1), data);
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

            data["server"] = bot.guilds.get(`421405545426321418`);
            data["developers"] = data.server.roles.get(`421405858736373760`)
                .members.array();
            data["permission"] = 1;

            DMCommands[command].run(message, message.content.split(" ")
                .splice(1, 1), data);
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
            message.channel.send(`:ping_pong: Pong! \`${(new Date().getTime() - message.createdTimestamp)}ms\``)
                .then(msg =>
                {
                    msg.delete(3000)
                });
        }
    },
    help:
    {
        name: "Help",
        description: "Displays a help message. If a command is specified, it will give information on the command.",
        category: "General",
        arguments: ["-o command"],
        permission: 1,
        usage: `${prefix}help\` or \`${prefix}help <command>`,
        exampleusage: `${prefix}help ping`,
        run: function(message, args, data)
        {

            let embed = new Embed();
            if (DMCommands[args[0]])
            {
                let spec = DMCommands[args[0].toLowerCase()];
                embed.setTitle("__" + spec.name + " - DM Command Information" + "__");
                embed.addField("Category", spec.category);
                embed.addField("Description", spec.description);
                embed.addField("Permission Level", ">> " + spec.permission);

                let command_args = "";

                for (let i = 0; i < spec.arguments.length; i++)
                {
                    let tempArg = spec.arguments[i];

                    if (tempArg.startsWith("-o "))
                    {
                        tempArg = tempArg.substr(3);
                        command_args += `(__Optional__) \`<${tempArg}>\`\n`;
                    }
                    else if (tempArg.startsWith("-r "))
                    {
                        tempArg = tempArg.substr(3);
                        command_args += `(__Required__) \`<${tempArg}>\`\n`;
                    }
                    else if (tempArg.startsWith("-e "))
                    {
                        tempArg = tempArg.substr(3);
                        let option1 = tempArg.split("||")[0];
                        let option2 = tempArg.split("||")[1];
                        command_args += `(__Choose__) \`<${option1}>\` or \`<${option2}>\`\n`;
                    }
                    else
                    {
                        command_args += `(**Uncategorised**) \`${tempArg}\`\n`;
                    }
                }

                embed.addField("Arguments", command_args.trim()
                    .length < 1 ? "None" : command_args.trim());
                embed.addField("Usage", `\`${spec.usage}\``);
                embed.addField("Example Usage", `\`\`\`${spec.exampleusage}\`\`\``);
                embed.setFooter("Requested by " + message.author.tag);
                message.channel.send(embed);
            }
            else
            {
                embed.setTitle("__" + bot.user.tag + " - DM Help__");
                embed.setThumbnail(bot.user.avatarURL);

                embed.setDescription("**Hello! I am " + bot.user.username + "!** I am a bot designed for fun and games!");
                embed.addField("Getting Started", "Type `" + prefix + "commands` to see my commands\nType `" + prefix + "stats` to see some of my statistics");
                embed.addField("Support", "Visit our Official Website: [https://tilde.glitch.me/](https://tilde.glitch.me/)\nJoin our Discord Dojo: [https://tilde.glitch.me/join](https://tilde.glitch.me/join) \n");

                embed.setFooter("Requested by " + message.author.tag, message.author.avatarURL);
                message.channel.send(embed);
            }

        }
    },
    commands:
    {
        name: "Commands",
        description: "Lists all avaliable commands to your DM channel.",
        category: "General",
        arguments: ["-o category"],
        permission: 1,
        usage: `${prefix}commands\` or  \`${prefix}commands <category>`,
        exampleusage: `${prefix}commands General`,
        run: function(message, args, data)
        {
            let permission_level = 1;

            let categories = {};

            for (let command in DMCommands)
            {
                if (DMCommands[command].permission <= permission_level)
                {
                    if (!categories[DMCommands[command].category])
                    {
                        categories[DMCommands[command].category] = [];
                    }
                    categories[DMCommands[command].category].push(DMCommands[command]);
                }
            }

            if (args[0] && categories[util.ucfirst(args[0])])
            {
                let category = util.ucfirst(args[0]);
                let embed = new Embed();

                embed.setTitle("__" + bot.user.tag + " - " + category + " DM Commands__");
                embed.setColor("#9C39FF");
                for (let i = 0; i < categories[category].length; i++)
                {
                    embed.addField(categories[category][i].name, categories[category][i].description);
                }

                embed.setFooter("Type " + prefix + "help `<command>` to get more information about a command (usage, arguments, etc.)");

                message.author.send(embed);
            }
            else
            {
                for (let category in categories)
                {
                    let embed = new Embed();

                    embed.setTitle("__" + bot.user.username + " - " + category + " DM Commands__");
                    embed.setColor("#9C39FF");
                    for (let i = 0; i < categories[category].length; i++)
                    {
                        embed.addField("_" + categories[category][i].name + " DM Command_", categories[category][i].description);
                    }

                    message.author.send(embed);
                    embed.setFooter("Type " + prefix + "help `<command>` to get more information about a command (usage, arguments, etc.)");
                }
            }

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
    }, //Talk via Discord
    slap:
    {
        name: "Slap",
        description: "Slap a user!",
        category: "Fun & Games",
        arguments: ["-r @user"],
        permission: 1,
        usage: `${prefix}slap`,
        exampleusage: `${prefix}slap @Furvux#2414`,
        run: function(message, args, data)
        {
            let slappedUser = (message.mentions.members.first());
            if (!slappedUser) return message.channel.send("You must mention a user!");
            if (slappedUser.user.id == message.member.user.id) return "Self Harm is not permitted!";

            let slaps = ["https://media1.giphy.com/media/uG3lKkAuh53wc/giphy.gif", "https://media.giphy.com/media/vxvNnIYFcYqEE/giphy.gif", "https://media.giphy.com/media/xULW8nNDLNVlBY77dm/giphy.gif", "https://media.giphy.com/media/gSIz6gGLhguOY/giphy.gif", "https://media.giphy.com/media/10KJUgvMoiSVSo/giphy.gif", "https://media.giphy.com/media/8cD5U8FgIcOQ/giphy.gif", "https://media.giphy.com/media/3vDS40HZxJwFGTbXoI/giphy.gif", "https://media.giphy.com/media/3oEdvdHf6n0US87Tri/giphy.gif", "https://media.giphy.com/media/1J8vRWb8xUByw/giphy.gif"];

            let slappedEmbed = new Embed()
                .setTitle(message.member.displayName.split("_")
                    .join("\_") + " slaps " + slappedUser.displayName.split("_")
                    .join("\_") + "!")
                .setColor(data.display_colour.hex)
                .setDescription(message.author + ' slapped ' + slappedUser + '!')
                .setImage(util.randomItem(slaps));

            message.channel.send(slappedEmbed);
            return;

        }
    },
    hug:
    {
        name: "Hug",
        description: "Hug a member!",
        category: "Fun & Games",
        arguments: ["-r @user"],
        permission: 1,
        usage: `${prefix}hug`,
        exampleusage: `${prefix}hug @Furvux#2414`,
        run: function(message, args, data)
        {
            let hugged = (message.mentions.members.first());
            if (!hugged) return ("You must mention a user to hug!");
            if (hugged.user.id == message.member.user.id) return "Please do not be that lonely!";

            let hugs = ["https://i.imgur.com/6rxDiFS.gif", "https://i.imgur.com/c3WzMZu.gif", "https://i.imgur.com/V5G9LMz.mp4", "https://media.giphy.com/media/2FayVoBQ0oxVel3aM/giphy.gif", "https://media.giphy.com/media/IuCSOHcDlooPm/giphy.gif", "https://media.giphy.com/media/EvYHHSntaIl5m/giphy.gif", "https://media.giphy.com/media/3M4NpbLCTxBqU/giphy.gif", "https://media.giphy.com/media/lXiRKBj0SAA0EWvbG/giphy.gif", "https://media.giphy.com/media/llmZp6fCVb4ju/giphy.gif", "https://media.giphy.com/media/16bJmyPvRbCDu/giphy.gif", "https://media.giphy.com/media/3oEjI72YdcYarva98I/giphy.gif", "https://media.giphy.com/media/Bj9k1U69GZ8Iw/giphy.gif"];

            let embed = new Embed()
                .setTitle(message.member.displayName.split("_")
                    .join("\_") + " hugs " + hugged.displayName.split("_")
                    .join("\_") + "!")
                .setColor(data.display_colour.hex)
                .setDescription(":heart_decoration:" + message.author + ' hugged ' + hugged + '! :heart_decoration:')
                .setImage(util.randomItem(hugs));

            message.channel.send(embed);
            return;

        }
    },
    punch:
    {
        name: "Punch",
        description: "Punch someone who is being annoying or stupid!",
        category: "Fun & Games",
        arguments: ["-r @user"],
        permission: 1,
        usage: `${prefix}punch`,
        exampleusage: `${prefix}punch @Furvux#2414`,
        run: function(message, args, data)
        {
            let victum = (message.mentions.members.first());
            if (!victum) return message.channel.send("You must mention a user!");
            if (victum.user.id == message.member.user.id) return "Self Harm is not permitted!";

            let punches = ["https://media.giphy.com/media/3o7WTBPWWzcjDyTlGU/giphy.gif", "https://media.giphy.com/media/EYD7OzuuTfRVC/giphy.gif", "https://media.giphy.com/media/GoN89WuFFqb2U/giphy.gif", "https://media.giphy.com/media/3oEhn4mIrTuCf0bn1u/giphy.gif", "https://media.giphy.com/media/DViGV8rfVjw6Q/giphy.gif", "https://media.giphy.com/media/pLnxbpVosgjE4/giphy.gif", "https://media.giphy.com/media/zPfWFc6ZUWGQM/giphy.gif"];

            let embed = new Embed()
                .setTitle(message.member.displayName.split("_")
                    .join("\_") + " punches " + victum.displayName.split("_")
                    .join("\_") + "!")
                .setColor(data.display_colour.hex)
                .setDescription(message.author + ' punched ' + victum + '!')
                .setImage(util.randomItem(punches));

            message.channel.send(embed);
            return;

        }
    },
    shoot:
    {
        name: "Shoot",
        description: "Shoot someone (because why not?)!",
        category: "Fun & Games",
        arguments: ["-r @user"],
        permission: 1,
        usage: `${prefix}shoot`,
        exampleusage: `${prefix}shoot @Furvux#2414`,
        run: function(message, args, data)
        {
            let victum = (message.mentions.members.first());
            if (!victum) return message.channel.send("You must mention a user!");
            if (victum.user.id == message.member.user.id) return "Stop trying to do a blighty (look it up) and get back up there, Soldier!";

            let shots = ["https://media.giphy.com/media/M4hHth10WJ2Fi/giphy.gif", "https://media.giphy.com/media/2uvG5Dn1K7pEA/giphy.gif", "https://media.giphy.com/media/EizPK3InQbrNK/giphy.gif", "https://media.giphy.com/media/7qeOvQC1pRFJK/giphy.gif", "https://media.giphy.com/media/14wfa45kICmaBO/giphy.gif", "https://media.giphy.com/media/l0HlOJcFhgwoQP1GE/giphy.gif", "https://media.giphy.com/media/PUY972zpherGE/giphy.gif", "https://media.giphy.com/media/3o6Zt1gBcG3dn3b4WI/giphy.gif"];

            let embed = new Embed()
                .setTitle(message.member.displayName.split("_")
                    .join("\_") + " shoots " + victum.displayName.split("_")
                    .join("\_") + "!")
                .setColor(data.display_colour.hex)
                .setDescription(message.author + ' shot ' + victum + '!')
                .setImage(util.randomItem(shots));

            message.channel.send(embed);
            return;

        }
    },
    coinflip:
    {
        name: "Coin Flip",
        description: "Flip a coin!",
        category: "Fun & Games",
        arguments: [],
        permission: 1,
        usage: `${prefix}coinflip`,
        exampleusage: `${prefix}coinflip`,
        run: function(message, args, data)
        {
            let coins = ["Heads", "Tails"];

            let finalCoin = Math.floor((Math.random() * coins.length))

            let coinEmbed = new Discord.RichEmbed()
                .setColor(data.display_colour.hex)
                .setTitle("__Flipped Coin: " + coins[finalCoin] + "__")
                .setImage(finalCoin == 0 ? assets.CoinFlip.Heads.u : assets.CoinFlip.Tails.u);

            message.channel.send(coinEmbed);
        }
    },
    invite:
    {
        name: "Invite",
        description: "Sends the bot's invite link to your DM channel!",
        category: "General",
        arguments: [],
        permission: 1,
        usage: `${prefix}invite`,
        exampleusage: `${prefix}invite`,
        run: function(message, args, data)
        {
            message.delete(15000);
            message.author.send(`Visit my Website: https://${process.env.PROJECT_DOMAIN}.glitch.me/ \nInvite me to a server: <https://${process.env.PROJECT_DOMAIN}.glitch.me/invite>\nJoin my Discord Dojo: <https://${process.env.PROJECT_DOMAIN}.glitch.me/join>\n\nWhen inviting me, please ensure you allow all the permissions I request for otherwise I will not work correctly!`);
            message.channel.send(`✅ A Message containing my invite link has been sent to your DMs!`)
                .then(msg => msg.delete(15000));
        }
    },
    server:
    {
        name: "Server",
        description: `An invitation link to the ${OFFICIAL_GUILD_NAME} will be sent to your DMs!`,
        category: "General",
        arguments: [],
        permission: 1,
        usage: `${prefix}server`,
        exampleusage: `${prefix}server`,
        run: function(message, args, data)
        {
            message.delete(15000);
            message.author.send(`Visit my Website: https://${process.env.PROJECT_DOMAIN}.glitch.me/ \nJoin my Discord Dojo: <https://${process.env.PROJECT_DOMAIN}.glitch.me/join>\nInvite me to a server: <https://${process.env.PROJECT_DOMAIN}.glitch.me/invite>\n\nWhen inviting me, please ensure you allow all the permissions I request for otherwise I will not work correctly!`);
            message.channel.send(`✅ A Message containing my server link has been sent to your DMs!`)
                .then(msg => msg.delete(15000));
        }
    },
    help:
    {
        name: "Help",
        description: "Displays a simple help message! If a command is specified, it will give information on the command.",
        category: "General",
        arguments: ["-o command"],
        permission: 1,
        usage: `${prefix}help\` or \`${prefix}help <command>`,
        exampleusage: `${prefix}help ping`,
        run: function(message, args, data)
        {
            let embed = new Embed();
            if (args[0] && !commands[args[0]])
            {
                return "Sorry, but there is not command with that name!";
            }
            if (commands[args[0]])
            {
                let spec = commands[args[0].toLowerCase()];
                embed.setTitle("__" + spec.name + " - Command Information" + "__");
                embed.setColor(data.display_colour.hex);
                embed.addField("Category", spec.category);
                embed.addField("Description", spec.description);
                embed.addField("Permission Level", ">> " + spec.permission);

                let command_args = "";

                for (let i = 0; i < spec.arguments.length; i++)
                {
                    let tempArg = spec.arguments[i];

                    if (tempArg.startsWith("-o "))
                    {
                        tempArg = tempArg.substr(3);
                        command_args += `(__Optional__) \`<${tempArg}>\`\n`;
                    }
                    else if (tempArg.startsWith("-r "))
                    {
                        tempArg = tempArg.substr(3);
                        command_args += `(__Required__) \`<${tempArg}>\`\n`;
                    }
                    else if (tempArg.startsWith("-e "))
                    {
                        tempArg = tempArg.substr(3);
                        let option1 = tempArg.split("||")[0];
                        let option2 = tempArg.split("||")[1];
                        command_args += `(__Choose__) \`<${option1}>\` or \`<${option2}>\`\n`;
                    }
                    else
                    {
                        command_args += `(**Uncategorised**) \`${tempArg}\`\n`;
                    }
                }

                embed.addField("Arguments", command_args.trim()
                    .length < 1 ? "None" : command_args.trim());
                embed.addField("Usage", `\`${spec.usage}\``);
                embed.addField("Example Usage", `\`\`\`${spec.exampleusage}\`\`\``);
                embed.setFooter("Requested by " + message.member.displayName);
                message.channel.send(embed);
            }
            else
            {
                embed.setTitle("__" + data.display_name + "__");
                embed.setColor(data.display_colour.hex);
                embed.setThumbnail(bot.user.avatarURL);

                embed.setDescription("**Hello! I am " + bot.user.username + "!** I am a bot designed for fun and games!");
                embed.addField("Getting Started", "Type `" + prefix + "commands` to see my commands\nType `" + prefix + "stats` to see some of my statistics");
                embed.addField("Support", "Visit our Official Website: [https://tilde.glitch.me/](https://tilde.glitch.me/)\nJoin our Discord Dojo: [https://tilde.glitch.me/join](https://tilde.glitch.me/join) \nInvite me to your server: [https://tilde.glitch.me/invite](https://tilde.glitch.me/invite) \n");
                embed.addField("__Help us Out__", "Help us out by [upvoting Tilde](https://discordbots.org/bot/421403753976037376/vote)!");

                embed.setFooter("Requested by " + message.member.displayName, message.author.avatarURL);
                message.channel.send(embed);
            }
        }
    },
    stats:
    {
        name: "Stats",
        description: "Sends some statistics of the bot in a fancy Discord Embed.",
        category: "General",
        arguments: [],
        permission: 1,
        usage: `${prefix}stats`,
        exampleusage: `${prefix}stats`,
        run: function(message, args, data)
        {
            let embed = new Embed();

            let developers = [];
            for (let i = 0; i < data.developers.length; i++)
            {
                let developer = data.developers[i];

                developers.push(">> " + developer.user.tag);
            }

            let bd = bot.user.createdAt;
            let birthdate = bd.toString()
                .split(' ');
            let birthday = birthdate[1] + " " + birthdate[2] + ", " + birthdate[3] + "  [" + birthdate[4] + "]";
            let users = bot.users.size;
            let guilds = bot.guilds.array();
            let botBirthday = new Date(bd);
            let botBirthdate = botBirthday.getDate() + "/" + (botBirthday.getMonth() + 1) + "/" + botBirthday.getFullYear() + " [" + botBirthday.getHours() + ":" + util.formatMinutes(botBirthday.getMinutes()) + "]";

            let totalChannels = 0;
            let totalUsers = 0;

            for (let x = 0; x < guilds.length; x++)
            {
                let guild = guilds[x];
                let channels = guild.channels.size;
                let members = guild.members.size;

                totalChannels += channels;
                totalUsers += members;
            }

            embed.setTitle("__" + bot.user.tag + " Statistics__");
            embed.setColor(data.display_colour.hex);
            embed.setThumbnail(bot.user.avatarURL);

            embed.addField("🎂 __Birthday__ 🎂", ">> " + botBirthdate);
            embed.addField("🛡️ __Guilds__ 🛡️", ">> **" + guilds.length + "** Guilds");
            embed.addField(":hash: __Channels__ :hash:", ">> **" + totalChannels + "** Channels");
            embed.addField("👥 __Users__ 👥", ">> **" + totalUsers + "** Unique Discord Users");
            embed.addField("✳️ __Commands__ ✳️", ">> **" + (Object.keys(commands)
                .length + Object.keys(DMCommands)
                .length) + "** Different Commands");

            embed.addBlankField();

            embed.addField("🔨 Bot Developers 🔧", developers.join(",\n"));
            embed.addField("📮 Official Server 📮", ">> **[Tilde Dojo](<https://discord.gg/D7REjnU>)**");
            embed.addBlankField();
            embed.addField("__Help us Out__", "Help us out by [upvoting Tilde](https://discordbots.org/bot/421403753976037376/vote)!");

            embed.setFooter("Requested by " + message.member.displayName, message.author.avatarURL);

            message.channel.send(embed);
        }
    },
    commands:
    {
        name: "Commands",
        description: "Lists all avaliable commands to your DM channel.",
        category: "General",
        arguments: ["-o category"],
        permission: 1,
        usage: `${prefix}commands\` or  \`${prefix}commands <category>`,
        exampleusage: `${prefix}commands General`,
        run: function(message, args, data)
        {
            let permission_level = data["permission"];

            let categories = {};

            for (let command in commands)
            {
                if (commands[command].permission <= permission_level)
                {
                    if (!categories[commands[command].category])
                    {
                        categories[commands[command].category] = [];
                    }
                    categories[commands[command].category].push(commands[command]);
                }
            }

            if (args[0] && categories[util.ucfirst(args[0])])
            {
                let category = util.ucfirst(args[0]);
                let embed = new Embed();

                embed.setTitle("__" + bot.user.tag + " - " + category + " Commands__");
                embed.setColor("#9C39FF");
                for (let i = 0; i < categories[category].length; i++)
                {
                    embed.addField(categories[category][i].name, categories[category][i].description);
                }

                embed.setFooter("Type " + prefix + "help `<command>` to get more information about a command (usage, arguments, etc.)");

                message.author.send(embed);
                message.channel.send(`✅ A Message containing the commands avaliable to you from the specified category (**${category}**) has been sent to your DMs!\n\n_Note: If you haven't recieved anything yet, you need to enable messages from server members!_`);
            }
            else
            {
                for (let category in categories)
                {
                    let embed = new Embed();

                    embed.setTitle("__" + bot.user.username + " - " + category + " Commands__");
                    embed.setColor("#9C39FF");
                    for (let i = 0; i < categories[category].length; i++)
                    {
                        embed.addField("_" + categories[category][i].name + " Command_", categories[category][i].description);
                    }

                    message.author.send(embed);
                    embed.setFooter("Type " + prefix + "help `<command>` to get more information about a command (usage, arguments, etc.)");
                }
                message.channel.send(`✅ Messages containing the commands avaliable to you have been sent to your DMs!\n\n_Note: If you haven't recieved anything yet, you need to enable messages from server members!_`);
            }

        }
    },
    eval:
    {
        name: "Eval",
        description: "Runs the code specified.",
        category: "Development",
        arguments: ["-r code"],
        permission: 12,
        usage: `${prefix}eval <code>`,
        exampleusage: `${prefix}eval message.reply(103 * 513);`,
        run: function(message, args, data)
        {
            let code = args.join(" ")
                .split("env")
                .join("BANNED_WORD")
                .split("process")
                .join("PROCESS_IS_NOT_ALLOWED_LOL")
                .split("token")
                .join("STOP_TRYING_TO_HACK_LOL");
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
        description: "Restarts the bot. Timeout can be in seconds (if s is suffixed at end of timeout) or milliseconds if no timeframe is specified.\n\n**__WARNING: BOT WILL NOT WORK UNTIL RESTART IS COMPLETE!__**",
        category: "Development",
        arguments: ["-o timeout"],
        permission: 10,
        usage: `${prefix}restart <timeout>`,
        exampleusage: `${prefix}restart 60s`,
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

                let messageTo = [message.channel];
                if (args[1])
                {
                    if (args[1] == "all")
                    {
                        messageTo = bot.guilds.array();
                    }
                    else if (!isNaN(args[1]))
                    {
                        if (parseInt(args[1]) > 10000)
                        {
                            messageTo.push(bot.guilds.get(args[1]));
                        }
                    }
                    /*
                                        else if (args[1].split(",").length > 1 && !arrayIsNaN(args[1].split(",")))
                                        {
                                            for (let i = 0; i < bot.guilds.array().length; i++)
                                            {
                                                console.log(args[1].split(","));
                                                if (args[1].split(",").indexOf(bot.guilds.array()[i].id) != -1)
                                                {
                                                    messageTo.push(bot.guilds.array()[i].channels.find(c => c.type == "text"));
                                                }
                                            }
                                        }*/
                }

                for (let x = 0; x < messageTo.length; x++)
                {
                    let channel = messageTo[x];
                    channel.send(`✅ Tilder will restart in __${(total / 1000)} second${(total / 1000) > 1 ? "s" : ""}__!`);

                    console.log("\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                    console.log(`Bot will restart in ${(total / 1000)} second${(total / 1000) == 1 ? "s" : ""}.`);
                    console.log("===============================================\n\n");

                }

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
    clear:
    {
        name: "Clear",
        description: "Deletes the last specified amount of messages from the channel the command is called from. If a user is mentioned, it will delete the amount from the messages that user had sent.",
        category: "General",
        arguments: ["-r amount", "-o @user"],
        permission: 4,
        usage: `${prefix}clear <@user> <amount>`,
        exampleusage: `${prefix}clear @Furvux#2414 10`,
        run: function(message, args, data)
        {
            let amount = args[0];
            let user = message.mentions.members.first();

            if (isNaN(amount))
            {
                amount = args[1];
                if (!user)
                {
                    user = message.guild.members.find(m => m.displayName.toLowerCase() == args[0].toLowerCase() || m.user.username.toLowerCase() == args[0].toLowerCase());
                }
            }
            if (isNaN(amount)) return "You need to specify an amount (as a number)!";

            if (amount > 1000) return `You can only delete up to 1000 messages!`;

            if (user)
            {
                let messages = message.channel.fetchMessages()
                    .then(messages =>
                    {
                        messages = messages.array();
                        for (let i = 0; i < Math.min(amount, messages.length); i++)
                        {
                            let msg = messages[i];
                            if (msg.author.id == user.id) msg.delete();
                        }
                        message.channel.send("✅ Cleared [**" + (amount) + "**] messages from <@" + user.id + ">! (__Command requested by _" + message.member.displayName + "___)")
                            .then(msg => msg.delete(6000));
                    });
            }
            else
            {
                amount++;
                for (let i = 0; i < Math.round(amount / 99); i++)
                {
                    message.channel.bulkDelete(99);
                }
                message.channel.bulkDelete(amount % 99);
                message.channel.send("✅ Cleared [**" + (amount - 1) + "**] messages! (__Requested by _" + message.member.displayName + "___)")
                    .then(msg => msg.delete(3000));
            }
        }
    },
    categories:
    {
        name: "Categories",
        description: "Displays a list of command categories.",
        category: "General",
        arguments: [],
        permission: 1,
        usage: `${prefix}catagories`,
        exampleusage: `${prefix}catagories`,
        run: function(message, args, data)
        {
            let categories = {};

            for (let command in commands)
            {
                if (commands[command].permission <= data.permission)
                {
                    if (!categories[commands[command].category]) categories[commands[command].category] = 0;
                    categories[commands[command].category] += 1;
                }
            }

            let embed = new Embed();
            embed.setTitle(`__Tilde - Command Categories__`);
            embed.setColor(data.display_colour.hex);

            for (let category in categories)
            {
                embed.addField(category, `>> **${categories[category]}** command${categories[category] > 1 ? "s" : ""}`);
            }

            embed.setFooter(`Requested by ${message.member.displayName} | Permission Level: ${data.permission}`);
            message.channel.send(embed);
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
    xo:
    {
        name: "XO",
        description: "Initiate a game of noughts and crosses (tic tac toe) with the mentioned opponent!",
        category: "Fun & Games",
        arguments: ["-r @opponent"],
        permission: 1,
        usage: `${prefix}xo <@opponent>`,
        exampleusage: `${prefix}xo @Furvux#2414`,
        run: function(message, args, data)
        {
            let opponent = message.mentions.members.first();

            if (!opponent)
            {
                message.channel.send("Woops! You forgot to mention someone to play against, " + message.author + "!");
                return;
            }
            else if (opponent == message.member)
            {
                message.channel.send("You cannot play against yourself, " + message.author + "!");
                return;
            }

            if (playing.includes(message.author.id))
            {
                message.channel.send("You are already in a game, " + message.author + "! Finish the game you are in before you start a new one!");
                return;
            }

            if (playing.includes(opponent.user.id))
            {
                message.channel.send("The opponent, " + opponent.user + " is already playing a game! Wait untill they finish or choose a different opponent!");
                return;
            }
            try
            {

                let gameID = util.generateUID(16, true);

                let gameData = {
                    players: [message.author.id, opponent.user.id],
                    board: [
                        "-", "-", "-",
                        "-", "-", "-",
                        "-", "-", "-"
                    ],
                    turn: 1
                };

                games.XO[gameID] = gameData;
                playing.push(message.author.id, opponent.id);
                games.XO.Playing.push(message.author.id, opponent.id);

                gameIDs[gameID] = "XO";

                let board = assets.XO.Board.i.clone();

                games.XO[gameID].boardImage = board;

                message.channel.send(message.author + " **(__X__)** vs. " + opponent.user + " **(__O__)**",
                {
                    file: assets.XO.Board.b
                });
            }
            catch (e)
            {
                if (e.message.includes("DiscordAPIError: Missing Permissions"))
                {
                    message.channel.send("```diff\n- Sorry, but I do not have enough permission to carry out that command!```");
                }
            }
        }
    },
    define:
    {
        name: "Define",
        description: "Defines a specified word using Urban Dictionary",
        category: "Fun & Games",
        arguments: ["-r word"],
        permission: 1,
        usage: `${prefix}define`,
        exampleusage: `${prefix}define peak`,
        run: function(message, args, data)
        {
            let definition = args.join(" ");
            if (!definition) return "You need to specify a word to look up!";

            else
            {
                urbandict.term(definition, function(error, entries, tags, sounds)
                {
                    if (error)
                    {
                        if (definition.trim().toLowerCase() != 'furvux' && definition.trim().toLowerCase() != 'sheikh1365' && definition.trim().toLowerCase() != 'glassykiller' && definition.trim().toLowerCase() != 'realkeengames')
                        {
                            console.error(error);
                            message.channel.send(`Couldn't find **${definition}** on Urban Dictionary.`);
                            return;
                        }
                    }

                    if (definition.trim().toLowerCase() === 'furvux')
                    {
                        entries = [
                        {}];
                        entries[0].definition = (`The Best Developer in the World`);
                        entries[0].example = (`He is almost as good as Furvux!`);
                        entries[0].thumbs_up = "Infinity";
                        entries[0].thumbs_down = "None";
                    }
                    else if (definition.trim().toLowerCase() === 'sheikh1365')
                    {
                        entries = [
                        {}];
                        entries[0].definition = (`Kindhearted, amazing`);
                        entries[0].example = (`Wow! You are such a Sheikh1365 person!`);
                        entries[0].thumbs_up = "Infinity";
                        entries[0].thumbs_down = "None";
                    }
                    else if (definition.trim().toLowerCase() === 'itsjustkeen')
                    {
                        entries = [
                        {}];
                        entries[0].definition = (`Simply cool and really clever!`);
                        entries[0].example = (`I wish I was like **RealKeenGames**!`);
                        entries[0].thumbs_up = "Infinity";
                        entries[0].thumbs_down = "None";
                    }
                    else if (definition.trim().toLowerCase() === 'glassykiller')
                    {
                        entries = [
                        {}];
                        entries[0].definition = (`Your Father.`);
                        entries[0].example = (`Hello, GlassyKiller!`);
                        entries[0].thumbs_up = "Infinity";
                        entries[0].thumbs_down = "None";
                    }
                    let embed = new Embed();

                    embed.setTitle("__" + definition + " - Urban Definition__");
                    embed.setColor(data.display_colour.hex);
                    embed.setThumbnail("https://cdn.glitch.com/7cb13e4a-c822-4516-a784-952f82478aa0%2Fimage.png?1520797098652");
                    embed.addField("Word", ">> **" + util.ucfirst(definition) + "**");
                    embed.addField("Definition", ">> " + entries[0].definition);
                    embed.addField("Example Usage", ">> " + (entries[0].example ? entries[0].example : "None provided..."));

                    embed.addField("Upvotes", ">> **" + (entries[0].thumbs_up > 0 ? entries[0].thumbs_up : "None") + "**", true);
                    embed.addField("Downvotes", ">> **" + (entries[0].thumbs_down > 0 ? entries[0].thumbs_down : "None") + "**", true);

                    embed.setFooter("Source: https://www.urbandictionary.com/define.php?term=" + definition + "");

                    message.channel.send(embed);

                });
            }
        }
    },
    "21":
    {
        name: "21",
        description: "Starts a game of **21**! For others to join, they need to type `" + prefix + "join <gameID>`. If you do not specify a gameID, one will be created for you! \n__Note: Game ID must be 7 characters in length!__",
        category: "Fun & Games",
        arguments: ["-o gameID"],
        permission: 1,
        usage: `${prefix}21`,
        exampleusage: `${prefix}21 F51X632`,
        run: function(message, args, data)
        {
            let gameID = util.generateUID(7, true);
            if (args[0])
            {
                if (args[0].length == 7)
                {
                    gameID = args[0];
                }
                else if (args[0].length < 7)
                {
                    gameID = args[0] + util.generateUID(7 - args[0].length, true);
                }
                else if (args[0].length > 7)
                {
                    gameID = args[0].substr(0, 7);
                }
            }

            let gameData = {
                players: [message.author.id],
                current: 0,
                accepting: true,
                turn: 1
            };
            games.TwentyOne[gameID] = gameData;

            gameIDs[gameID] = "TwentyOne";

            playing.push(message.author.id);
            games.TwentyOne.Playing.push(message.author.id);

            message.channel.send(message.author + " has started a game of **21**! Type `" + prefix + "join " + gameID + "` to join the game!");
        }
    },
    join:
    {
        name: "Join",
        description: "Joins the game with the specified ID.",
        category: "Fun & Games",
        arguments: ["-r ID"],
        permission: 1,
        usage: `${prefix}join`,
        exampleusage: `${prefix}join F51X632`,
        run: function(message, args, data)
        {
            if (!args[0]) return "You need to specify the ID of the game you want to join!";
            if (gameIDs[args[0]])
            {
                if (gameIDs[args[0]] == "TwentyOne")
                {
                    if (games.TwentyOne[args[0]] && games.TwentyOne[args[0]].accepting != false)
                    {
                        playing.push(message.author.id);
                        games.TwentyOne.Playing.push(message.author.id);
                        games.TwentyOne[args[0]].players.push(message.author.id);

                        message.channel.send("✅ You have successfully joined the game of **21**, " + message.author + "!");
                    }
                }
            }
            else
            {
                message.channel.send("Oh dear! I cannot find a game with that ID, " + message.author + "! Make sure you have the ID correct (capital letters are capitalized, etc.)!");
            }
        }
    },
    suggest:
    {
        name: "Suggest",
        description: "Suggest a new feature for the bot!",
        category: "General",
        arguments: ["-r suggestion"],
        permission: 1,
        usage: `${prefix}suggest`,
        exampleusage: `${prefix}suggest Add a coinflip command!`,
        run: function(message, args, data)
        {
            message.channel.createInvite(
            {
                maxAge: 0,
                reason: "Advertisement and Suggestion"
            }).then(function(invite)
            {
                let embed = new Embed();

                embed.setTitle("__New Suggestion__");
                embed.setColor("#00AA00");
                embed.addField("Suggestion", ">> " + args.join(" "));
                embed.addField("Suggester", ">> **" + message.author.tag + "**");
                embed.addField("Suggestion Point", ">> **#" + message.channel.name + "** in **[" + message.guild.name + "](" + invite + ")**");
                embed.setFooter("Suggested at: " + util.formatShortDate(new Date()) + " [" + util.formatShortTime(new Date) + "]", message.author.avatarURL);

                const filter = (reaction, user) => user.id == message.author.id;

                message.channel.send(embed).then(msg =>
                {
                    msg.react("✅");
                    msg.react("❎");
                    msg.channel.send(message.author + ", react with ✅ to approve and send the suggestion, or react with ❎ to disapprove and delete the suggestion.").then(m => m.delete(15000));
                    const collector = msg.createReactionCollector(filter,
                    {
                        time: 60000
                    });
                    collector.on('collect', r =>
                    {
                        if (r.emoji.name == "✅")
                        {
                            msg.delete();
                            bot.guilds.get(`421405545426321418`).channels.get(`421441403751759875`).send(embed).then(m =>
                            {
                                m.react("✅");
                                m.react("❎");
                            });
                        }
                        else if (r.emoji.name == "❎")
                        {
                            msg.delete();
                        }
                    });
                });
            });
        }
    },
    rembed:
    {
        name: "Rembed",
        description: "Embeds the content in a rich embed. Parameters are speprated by commas for this command.",
        category: "General",
        arguments: ["-r title", "-r colour", "-r body"],
        permission: 4,
        usage: `${prefix}rembed`,
        exampleusage: `${prefix}rembed Hello World, #FF0099, Hello, world! This is a nice Rich Embed!`,
        run: function(message, args, data)
        {
            args = message.content.split("rembed ")[1].split(",");

            if (!args[0]) return "You need a title! (Type `" + prefix + "help rembed` to see hot to use this command!)";
            if (!args[1]) return "You need a colour! (Type `" + prefix + "help rembed` to see hot to use this command!)";
            if (!args[2]) return "You need a body for the embed! (Type `" + prefix + "help rembed` to see how to use this command!)";

            let title = args.shift();
            let colour = args.shift();
            let body = args.join(",").trim();

            let embed = new Embed();
            embed.setTitle(title);
            embed.setColor(colour);
            embed.setDescription(body);
            embed.setFooter("By " + message.author.tag, message.author.avatarURL);

            message.channel.send(embed);
        }
    },
    update:
    {
        name: "Rembed",
        description: "Embeds the content in a rich embed. Parameters are speprated by commas for this command.",
        category: "General",
        arguments: ["-r title", "-r body"],
        permission: 10,
        usage: `${prefix}update`,
        exampleusage: `${prefix}update Music Commands, Guess what! Music Commands have now been added! Go to any bot-command channel on any server with Tilde on it and type \`${prefix}play <song>\` to play the song from YouTube!`,
        run: function(message, args, data)
        {
            args = message.content.split("update ")[1].split(",");

            if (!args[0]) return "You need a title! (Type `" + prefix + "help update` to see hot to use this command!)";
            if (!args[1]) return "You need a body for the update! (Type `" + prefix + "help update` to see how to use this command!)";

            let title = args.shift();
            let colour = "#00AA00";
            let body = args.join(",").trim();

            let embed = new Embed();
            embed.setTitle("__" + title + "__");
            embed.setColor(colour);
            embed.setDescription(body);
            embed.setFooter("By " + message.author.tag, message.author.avatarURL);

            message.channel.send(embed);
        }
    },
    "8ball":
    {
        name: "8Ball",
        description: "The Magic 8Ball command!",
        category: "Fun & Games",
        arguments: ["-r question"],
        permission: 1,
        usage: `${prefix}8ball`,
        exampleusage: `${prefix}8ball am I cool?`,
        run: function(message, args, data)
        {
            let q = args.join(" ");
            if (!q)
            {
                message.channel.send("You need to specify a question, " + message.author + "!");
                return;
            }

            let options = ["No way!", "Sorry, but no. Just no.", "Unfortunately not...", "Hmmm.... maybe.", "I am not too sure about that one!", "Quite possibly, actually!", "Almost yess..... but no.", "Of course!", "Yea man!", "Yes.", "Definately yes!", "It seems that the fortunes have decided...... yes."];

            let ascii = 0;

            for (let i = 0; i < q.length; i++)
            {
                ascii += q[i].charCodeAt(0);
            }

            ascii *= (ascii + 3.1415926535897923 * message.author.id) * Math.random();
            ascii = Math.floor(ascii);

            let option = options[ascii % options.length];

            message.channel.send(message.author + ", in answer to your query: **" + q + "**, \n" + option);
        }
    },
    setchannel:
    {
        name: "Set Channel",
        description: "Sets the default channel for the bot. The bot must have all its permissions on this channel.",
        category: "Setup",
        arguments: ["-r #channel"],
        permission: 4,
        usage: `${prefix}setchannel`,
        exampleusage: `${prefix}setchannel #general`,
        run: function(message, args, data)
        {
            let channel = message.mentions.channels.first();
            if (!args[0])
            {
                channel = message.channel;
            }
            if (!channel)
            {
                channel = message.guild.channels.find(c => c.name.toLowerCase().startsWith(args[0].toLowerCase())) || message.guild.channels.get(args[0]);
            }

            let updates = {
                channel: channel.id
            };

            let ref = firebase.database().ref().child("Serverdata").child(message.guild.id.toString()).child("Configuration");
            ref.update(updates);

            message.channel.send("✅ Bot Channel has been set to <#" + channel.id + ">!");
            channel.send("✅ Bot Channel has been set to this channel!");
        }
    },
    instructions:
    {
        name: "Instructions",
        description: "Sends instructions on a game of the bot.",
        category: "Fun & Games",
        arguments: ["-r game"],
        permission: 1,
        usage: `${prefix}instructions`,
        exampleusage: `${prefix}instructions xo`,
        run: function(message, args, data)
        {
            if (args[0])
            {
                let game = args.join(" ").toLowerCase();
                if (game == "xo" || game == "tic tac toe" || game == "noughts and crosses")
                {
                    let embed = new Embed();
                    embed.setTitle("__Noughts and Crosses - Game Instructions__");
                    embed.setColor("#00AA00");
                    embed.setDescription(instructions.XO)
                    embed.setFooter("Requested by " + message.member.displayName, message.author.avatarURL);
                    message.channel.send(embed);
                }
                if (game == "21" || game == "twentyone" || game == "2one")
                {
                    let embed = new Embed();
                    embed.setTitle("__Tewnty One - Game Instructions__");
                    embed.setColor("#00AA00");
                    embed.setDescription(instructions.TwentyOne)
                    embed.setFooter("Requested by " + message.member.displayName, message.author.avatarURL);
                    message.channel.send(embed);
                }
                if (game == "heads or tails" || game == "coinflip" || game == "heads" || game == "tails")
                {
                    let embed = new Embed();
                    embed.setTitle("__Coinflip - Game Instructions__");
                    embed.setColor("#00AA00");
                    embed.setDescription(instructions.Coinflip)
                    embed.setFooter("Requested by " + message.member.displayName, message.author.avatarURL);
                    message.channel.send(embed);
                }
            }
        }
    },
    hook:
    {
        name: "Hook",
        description: "Creates a Webhook",
        category: "General",
        arguments: ["-r title", "-r message", "-o colour", "-o thumbnail"],
        permission: 10,
        usage: `${prefix}hook`,
        exampleusage: `${prefix}hook test hook,, test body,, #FF0000,, https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FBalls.jpg`,
        run: function(message, args, data)
        {
            let hookArgs = message.content.slice(prefix.length + 4).split(",,");

            hook(message.channel, hookArgs[0], hookArgs[1], hookArgs[2], hookArgs[3]);
        }
    },
    leavegame:
    {
        name: "Leave Game",
        description: "Leaves the current game the user is playing.",
        category: "Fun & Games",
        arguments: [],
        permission: 1,
        usage: `${prefix}leavegame`,
        exampleusage: `${prefix}leavegame`,
        run: function(message, args, data)
        {
            if (playing.indexOf(message.author.id) == -1)
            {
                return "You are not even playing a game!";
            }

            let checker = new Embed();
            checker.setTitle("__Just Checking...__");
            checker.setColor("#AA0000");
            checker.setDescription("Are you sure you want to leave the game you are currently playing?");
            checker.addField("Confirm", ">> React with ✅", true);
            checker.addField("Cancel ", ">> React with ❎", true);

            const filter = (reaction, user) => user.id == message.author.id;

            message.channel.send(checker).then(msg =>
            {
                msg.react("✅");
                msg.react("❎");
                const collector = msg.createReactionCollector(filter,
                {
                    time: 60000
                });
                collector.on('collect', r =>
                {
                    if (r.emoji.name == "✅")
                    {
                        msg.delete();

                        if (playing.indexOf(message.author.id) == -1)
                        {
                            return "You are not even playing a game!";
                        }

                        let game = checkGame(message.member);

                        if (!game) return;

                        playing.splice(playing.indexOf(message.author.id), 1);

                        switch (game)
                        {
                            case 0xCAFE25151:
                                for (let gameID in games.XO)
                                {
                                    if (gameID == "Playing") continue;

                                    let game = games.XO[gameID];
                                    if (game.players && game.players.indexOf(message.author.id) != -1)
                                    {
                                        let winner = game.players.indexOf(message.author.id) == 0 ? "X" : "O";

                                        if (winner != "-")
                                        {
                                            if (winner == "X")
                                            {
                                                message.channel.send(":tada: Because the opponent left, <@" + game.players[0] + ">, you have won! Well Done! :tada:");
                                                message.channel.send("You left the game, <@" + game.players[1] + ">. Wow.");
                                            }
                                            else if (winner == "O")
                                            {
                                                message.channel.send(":tada: Because the opponent left, <@" + game.players[1] + ">, you have won! Well Done! :tada:");
                                                message.channel.send("You left the game, <@" + game.players[0] + ">. Wow.");
                                            }

                                            var index = playing.indexOf(game.players[0]);
                                            if (index > -1)
                                            {
                                                playing.splice(index, 1);
                                            }
                                            index = playing.indexOf(game.players[1]);
                                            if (index > -1)
                                            {
                                                playing.splice(index, 1);
                                            }
                                            delete games.XO[gameID];
                                        }
                                    }
                                }
                                break;
                            case 0xCAFE25152:
                                break;
                            default:
                                break;
                        }

                    }
                    else if (r.emoji.name == "❎")
                    {
                        msg.delete();
                    }
                });
            });
        }
    },
    roll:
    {
        name: "Roll",
        description: "Rolls a dice for you.",
        category: "Fun & Games",
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
    },
    deathbattle:
    {
        name: "Death Battle",
        description: "Fight a fast-paced battle to the death with the user who is mentioned!",
        category: "Fun & Games",
        arguments: ["-r @user"],
        permission: 10,
        usage: `${prefix}deathbattle`,
        exampleusage: `${prefix}deathbattle @Furvux#2414`,
        run: function(message, args, data)
        {
            let verbs = ["slaps", "punches", "spits upon", "hits", "shoots", "kicks", "bodyslams", "tries out jujitsu on"];
            let avecs = ["a cod fish", "a gun", "John Doe", "their leg", "a brass cup", "a plastic chair", "an aeroplane"];
            let endings = ["Phew! You beat up {DEAD} really badly!", "My word! Someone get the ambulance for {DEAD}!", "Crap! {DEAD} got beaten so badly!", "Wow - {DEAD} just couldn't keep up with {ALIVE}'s sick skills!"];

            if (!args[0]) return "You need to fight with someone!";

            let player1 = message.member;
            let player2 = message.mentions.members.first() || message.guild.members(m => m.displayName.startsWith(args[0]));

            if (!player2) return "Please mention someone to fight against!";
            if (player2 == player1) return "You can't fight yourself, you silly billy!";

            let health1 = 100;
            let health2 = 100;

            let turn = 1;

            let oembed = new Embed();
            oembed.setColor(data.display_colour.hex);

            oembed.setTitle("__" + player1.displayName + " vs " + player2.displayName + "__");

            oembed.addField("__" + player1.displayName + "'s Health__", health1, true);
            oembed.addField("__" + player2.displayName + "'s Health__", health2, true);

            message.channel.send(oembed).then(function(msg)
            {
                setInterval(function()
                {
                    let action = util.randomItem(verbs);
                    let aid = util.randomItem(avecs);

                    let damage = Math.floor(Math.random() * 15);

                    let embed = new Embed();
                    embed.setColor(data.display_colour.hex);

                    embed.setTitle("__" + player1.displayName + " vs " + player2.displayName + "__");

                    if (damage == 0)
                    {
                        embed.setDescription("**" + (turn == 1 ? player1.displayName : player2.displayName) + "** " + action + " **" + (turn == 1 ? player2.displayName : player1.displayName) + "** with " + aid + ", but THEY MISSED!!!\n**" + damage + "** damage was delt.");
                    }
                    else
                    {
                        embed.setDescription("**" + (turn == 1 ? player1.displayName : player2.displayName) + "** " + action + " **" + (turn == 1 ? player2.displayName : player1.displayName) + "** with " + aid + "!\n**" + damage + "** damage was delt.");
                    }

                    if (turn == 1)
                    {
                        health2 -= damage;
                    }
                    else
                    {
                        health1 -= damage;
                    }

                    if (health1 < 0)
                    {
                        let ending = util.randomItem(endings).split("{DEAD}").join(player1.displayName).split("{ALIVE}").join(player2.displayName);

                        let wEmbed = new Embed();
                        wEmbed.setColor("#FFBB00");
                        wEmbed.setTitle("🏆 __" + player2.displayName + " has won!__ 🏆");
                        wEmbed.setDescription("Well done, " + player2.displayName + "! " + ending + " " + (health2 < 10 ? "It was a close match though!" : "There was no way you were going to be beaten!"));

                        msg.edit(wEmbed);
                        clearInterval(this);
                    }
                    else if (health2 < 0)
                    {
                        let ending = util.randomItem(endings).split("{DEAD}").join(player2.displayName).split("{ALIVE}").join(player1.displayName);

                        let wEmbed = new Embed();
                        wEmbed.setColor("#FFBB00");
                        wEmbed.setTitle("🏆 __" + player1.displayName + " has won!__ 🏆");
                        wEmbed.setDescription("Well done, " + player1.displayName + "! " + ending + " " + (health1 < 10 ? "It was a close match though!" : "There was no way you were going to be beaten!"));

                        msg.edit(wEmbed);
                        clearInterval(this);
                    }
                    else
                    {
                        embed.addField("__" + player1.displayName + "'s Health__", health1, true);
                        embed.addField("__" + player2.displayName + "'s Health__", health2, true);

                        msg.edit(embed);
                        turn = 3 - turn;
                    }

                }, 1200);
            });


        }
    },
    elemental:
    {
        name: "Elemental",
        description: "The Elemental type commands fall under this category. To use an elemental command, type `" + prefix + "elemental <command> <arguments>`",
        category: "Fun & Games",
        arguments: ["-r command", "-o arguments"],
        permission: 1,
        usage: `${prefix}elemental`,
        exampleusage: `${prefix}elemental start`,
        run: function(message, args, data)
        {
            if (!args[0])
            {
                return "You need to specify a command to run in the sub-category of `elemental`! Type `" + prefix + "elemental help` to see help for the commands under the sub-category of Elemental.";
            }

            try
            {
                let comm = args.shift().toLowerCase();
                if (!elemental[comm]) return "Sorry, but that command does not exist!";
                if (data.permission >= elemental[comm].permission)
                {
                    let error = elemental[comm].run(message, args, data);
                    if (error) return error;
                }
                else
                {
                    return "Sorry, but your permission level is too low to access that command! \nType `" + prefix + "elemental help` to recieve help on the Elemental sub-category.";
                }
            }
            catch (e)
            {
                if (e.message.includes("TypeError: Cannot read property 'run' of undefined"))
                {
                    return "No such command found under the sub-category of `elemental`! Ensure correct spelling and make sure the command is avaliable to your level!";
                }
                return e.message;
            }
        }
    },
    pfp:
    {
        name: "Profile Picture",
        description: "**The command for this is `" + prefix + "pfp`**, and you can optionally mention a user to see their profile picture.",
        category: "Fun & Games",
        arguments: ["-o @user"],
        permission: 1,
        usage: `${prefix}pfp`,
        exampleusage: `${prefix}pfp @Furvux#2414`,
        run: function(message, args, data)
        {
            if (!args[0])
            {

                const embed = new Embed()
                    .setTitle('Profile Picture')
                    .setURL(message.author.avatarURL)
                    .setColor(message.member.colorRole.color)
                    .setImage(message.author.avatarURL)
                message.channel.send(embed)
            }
            else
            {
                let person = message.mentions.members.first() || message.guild.members.find(m => m.user.username.toLowerCase().trim().startsWith(args[0].toLowerCase().trim())) || message.member;
                const embed = new Embed()
                    .setTitle('Profile Picture')
                    .setURL(person.user.avatarURL)
                    .setColor(message.member.colorRole.color)
                    .setImage(person.user.avatarURL)
                message.channel.send(embed)
            }
        }
    }

};

var elemental = {
    "start":
    {
        name: "Start",
        description: "Starts your profile on the game!",
        category: "Starting",
        arguments: [],
        permission: 1,
        usage: `${prefix} ${creatureCommand} start`,
        exampleusage: `${prefix} ${creatureCommand}start`,
        run: function(message, args, settings)
        {
            let author = message.author;

            let ref = firebase.database().ref("Userdata/" + author.id + "/Elementals");
            ref.once("value", function(snapshot)
            {
                let data = snapshot.val();

                if (!data)
                {
                    let embed = new Embed();
                    embed.setTitle("__Choose your Starter Elemental Type__");
                    embed.setColor(settings.display_colour.hex);
                    embed.setDescription("You need to choose your starter Elemental type. The types are listed below with all their weaknesses and strengths. \n\nReact with 🔥 to choose a fire Elemental.\nReact with 💧 to choose a water Elemental.\nReact with 🍃 to choose a nature Elemental!");

                    embed.addField("🔥 __Fire Type__ 🔥", "Fire Type Elementals unlock **fire-type** attacks and moves when leveled up!\n__Strong Against:__ **Nature**\n__Weak Against:__ **Water**");
                    embed.addBlankField();
                    embed.addField("💧 __Water Type__ 💧", "Water Type Elementals unlock **water-type** attacks and moves when leveled up!\n__Strong Against:__ **Fire**\n__Weak Against:__ **Nature**");
                    embed.addBlankField();
                    embed.addField("🍃 __Nature Type__ 🍃", "Nature Type Elementals unlock **nature-type** attacks and moves when leveled up!\n__Strong Against:__ **Water**\n__Weak Against:__ **Fire**");
                    //embed.addField("💨 Air Type 💨", "", true);

                    embed.setFooter("You have 60 seconds to choose your elemental type!", author.avatarURL);



                    const filter = (reaction, user) => user.id == message.author.id;

                    message.channel.send(embed).then(msg =>
                    {
                        msg.react("🔥");
                        msg.react("💧");
                        msg.react("🍃");
                        const collector = msg.createReactionCollector(filter,
                        {
                            time: 60000
                        });
                        collector.on('collect', r =>
                        {
                            if (r.emoji.name == "🔥")
                            {
                                // They chose Fire
                                msg.delete();

                                let cName = util.randomItem(Object.keys(assets.Elementals.Characters.Fire));
                                let character = assets.Elementals.Characters.Fire[cName];

                                let basicattacks = ["Scratch", "Claw"];
                                let elemattacks = ["Kindle", "Ember"];

                                let chosenAttack = "**" + util.randomItem(basicattacks) + "** (Basic)";
                                chosenAttack += "\n**_" + util.randomItem(elemattacks) + "_** (Elemental)";

                                let health = Math.floor(Math.random() * 10) + 19;
                                let basicdmg = Math.floor(Math.random() * 2) + 8;
                                let elemdmg = Math.floor(Math.random() * 3) + 10;

                                let chosenEmbed = new Embed();
                                chosenEmbed.setColor("#FF8800");
                                chosenEmbed.setDescription("You recieved a __**" + cName + "**__!\nType `" + prefix + "elemental rename " + cName + " <name>` to rename your elemental!");
                                chosenEmbed.setThumbnail(character.u);
                                chosenEmbed.addField("__Stats__", `>> __Type:__ **Fire**\n>> __Health:__ **${health}**\n>> __Basic Damage:__ **${basicdmg}**\n>> __Elemental Damage:__ **${elemdmg}**\n`);
                                chosenEmbed.addField("__Attacks__", chosenAttack);
                                chosenEmbed.setFooter("Fire Type Elemental", "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FFire.png");

                                message.channel.send(chosenEmbed);

                                let updateData = {};

                                updateData["Name"] = cName;
                                updateData["Level"] = 1;
                                updateData["XP"] = 0;
                                updateData["Born"] = new Date();
                                updateData["Type"] = "Fire";
                                updateData["Health"] = health;
                                updateData["BasicDamage"] = basicdmg;
                                updateData["ElementalDamage"] = elemdmg;
                                updateData["Attacks"] = [chosenAttack.split("\n")[0].split("**")[1], chosenAttack.split("\n")[1].split("_")[1]];

                                updateFirebaseData(updateData, "Userdata/" + author.id + "/Elementals/Characters/" + cName, "u");
                            }
                            else if (r.emoji.name == "💧")
                            {
                                // They chose Water
                                msg.delete();

                                let cName = util.randomItem(Object.keys(assets.Elementals.Characters.Water));
                                let character = assets.Elementals.Characters.Water[cName];

                                let basicattacks = ["Slap", "Jump"];
                                let elemattacks = ["Splash", "Spout"];

                                let chosenAttack = "**" + util.randomItem(basicattacks) + "** (Basic)";
                                chosenAttack += "\n**_" + util.randomItem(elemattacks) + "_** (Elemental)";

                                let health = Math.floor(Math.random() * 10) + 22;
                                let basicdmg = Math.floor(Math.random() * 2) + 7;
                                let elemdmg = Math.floor(Math.random() * 3) + 8;

                                let chosenEmbed = new Embed();
                                chosenEmbed.setColor("#00AAFF");
                                chosenEmbed.setDescription("You recieved a __**" + cName + "**__!\nType `" + prefix + "elemental rename " + cName + " <name>` to rename your elemental!");
                                chosenEmbed.setThumbnail(character.u);
                                chosenEmbed.addField("__Stats__", `>> __Type:__ **Water**\n>> __Health:__ **${health}**\n>> __Basic Damage:__ **${basicdmg}**\n>> __Elemental Damage:__ **${elemdmg}**\n`);
                                chosenEmbed.addField("__Attacks__", chosenAttack);
                                chosenEmbed.setFooter("Water Type Elemental", "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FWater.png");

                                message.channel.send(chosenEmbed);

                                let updateData = {};

                                updateData["Name"] = cName;
                                updateData["Level"] = 1;
                                updateData["XP"] = 0;
                                updateData["Born"] = new Date();
                                updateData["Type"] = "Water";
                                updateData["Health"] = health;
                                updateData["BasicDamage"] = basicdmg;
                                updateData["ElementalDamage"] = elemdmg;
                                updateData["Attacks"] = [chosenAttack.split("\n")[0].split("**")[1], chosenAttack.split("\n")[1].split("_")[1]];

                                updateFirebaseData(updateData, "Userdata/" + author.id + "/Elementals/Characters/" + cName, "u");
                            }
                            else if (r.emoji.name == "🍃")
                            {
                                // They chose Nature
                                msg.delete();

                                let cName = util.randomItem(Object.keys(assets.Elementals.Characters.Nature));
                                let character = assets.Elementals.Characters.Nature[cName];

                                let basicattacks = ["Whip", "Hit"];
                                let elemattacks = ["Vinewhip", "Thornprick"];

                                let chosenAttack = "**" + util.randomItem(basicattacks) + "** (Basic)";
                                chosenAttack += "\n**_" + util.randomItem(elemattacks) + "_** (Elemental)";

                                let health = Math.floor(Math.random() * 10) + 18;
                                let basicdmg = Math.floor(Math.random() * 2) + 9;
                                let elemdmg = Math.floor(Math.random() * 3) + 10;

                                let chosenEmbed = new Embed();
                                chosenEmbed.setColor("#00AA00");
                                chosenEmbed.setDescription("You recieved a __**" + cName + "**__!\nType `" + prefix + "elemental rename " + cName + " <name>` to rename your elemental!");
                                chosenEmbed.setThumbnail(character.u);
                                chosenEmbed.addField("__Stats__", `>> __Type:__ **Nature**\n>> __Health:__ **${health}**\n>> __Basic Damage:__ **${basicdmg}**\n>> __Elemental Damage:__ **${elemdmg}**\n`);
                                chosenEmbed.addField("__Attacks__", chosenAttack);
                                chosenEmbed.setFooter("Nature Type Elemental", "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FNature.png");

                                message.channel.send(chosenEmbed);

                                let updateData = {};

                                updateData["Name"] = cName;
                                updateData["Level"] = 1;
                                updateData["XP"] = 0;
                                updateData["Born"] = new Date();
                                updateData["Type"] = "Nature";
                                updateData["Health"] = health;
                                updateData["BasicDamage"] = basicdmg;
                                updateData["ElementalDamage"] = elemdmg;
                                updateData["Attacks"] = [chosenAttack.split("\n")[0].split("**")[1], chosenAttack.split("\n")[1].split("_")[1]];

                                updateFirebaseData(updateData, "Userdata/" + author.id + "/Elementals/Characters/" + cName, "u");
                            }
                            else
                            {
                                r.remove();
                            }
                        });
                    });


                }
                else
                {
                    let embed = new Embed();
                    embed.setTitle("__Oops!__");
                    embed.setColor("#FF0000");
                    embed.setDescription("It looks like you already have an Elemental!");
                    message.channel.send(embed);
                }
            });

        }

    },
    "rename":
    {
        name: "Rename",
        description: "Rename the specified elemental to a new name!\n__Note: The new name cannot contain whitespaces!__",
        category: "General",
        arguments: ["-r old name", "-r new name"],
        permission: 1,
        usage: `${prefix} ${creatureCommand} rename`,
        exampleusage: `${prefix} ${creatureCommand} rename Fizzball MyPet`,
        run: function(message, args, settings) 
        {
            if (!args[0])
            {
                return "You need to specify which elemental you want to rename!";
            }
            if (!args[1])
            {
                return "You need to specify a new name for your Elemental!";
            }
            
            let ref = firebase.database().ref("Userdata/" + message.author.id + "/Elementals/Characters");
            ref.once("value", function(snapshot)
            {
                let data = snapshot.val();

                if (!data) {message.channel.send("You do not have any Elementals! Type `" + prefix + "elemental start` to start your Elemental career!"); return;}
              
                if (!data[args[0]])
                {
                    message.channel.send("You do not have any Elementals by that name! Type `" + prefix + "elementals mine` too see all your Elementals!"); 
                    return;
                }
                else
                {
                    data[args[1]] = data[args[0]];
                    delete data[args[0]];
                    ref.set(data);
                    message.channel.send("✅ Your Elemental **" + args[0] + "** has been renamed to __**" + args[1] + "**__!");
                }
            });
        }
    },
    "mine":
    {
        name: "Mine",
        description: "Sends a list of your Elementals!",
        category: "General",
        arguments: [],
        permission: 1,
        usage: `${prefix} ${creatureCommand} mine`,
        exampleusage: `${prefix} ${creatureCommand} mine`,
        run: function(message, args, settings) 
        {            
            let ref = firebase.database().ref("Userdata/" + message.author.id + "/Elementals/Characters");
            ref.once("value", function(snapshot)
            {
                let data = snapshot.val();

                if (!data) {message.channel.send("You do not have any Elementals! Type `" + prefix + "elemental start` to start your Elemental career!"); return;}
              
                let embed = new Embed();
                embed.setTitle("__" + message.member.displayName + "'s Elementals__");
                embed.setColor(settings.display_colour.hex);
                embed.setDescription(">> " + Object.keys(data).join("\n>> ") + "\n");
                embed.setFooter(message.member.displayName + "'s Elementals");
            });
        }
    }
};

bot.login(token);


function toBufferAndSend(image, message, text)
{
    image.getBuffer(Jimp.MIME_PNG, function(e, buffer)
    {
        if (e)
        {
            console.error(e);
        }
        message.channel.send(text,
        {
            file: (buffer)
        });
    });
}

function placeXO(message, games, i_X, i_O, basFunc)
{
    for (let gameID in games.XO)
    {
        if (gameID == "Playing") continue;

        let game = games.XO[gameID];
        if (game.players && game.players.includes(message.author.id))
        {
            let input = message.content;
            if (game.turn == game.players.indexOf(message.author.id) + 1)
            {
                if (game.board[input - 1] == "-")
                {
                    let marker = game.turn == 1 ? i_X : i_O;

                    let xCoord = ((input - 1) % 3) * 64 + ((input > 3 ? input - 3 > 3 ? input - 6 : input - 3 : input)) * 3;
                    let yCoord = Math.floor((input - 1) / 3) * 64 + Math.ceil(input / 3) * 3;

                    let player1 = message.guild.members.find(m => m.id == game.players[0]);
                    let player2 = message.guild.members.find(m => m.id == game.players[1]);

                    game.boardImage.composite(marker, xCoord, yCoord);

                    basFunc(game.boardImage, message, player1.displayName + " vs. " + player2.displayName);

                    game.board[input - 1] = game.players.indexOf(message.author.id) == 0 ? "X" : "O";

                    let winner = checkXOBoard(game.board);

                    if (winner != "-")
                    {
                        if (winner == "X")
                        {
                            message.channel.send("Well Done, <@" + game.players[0] + ">! You have won!");
                            message.channel.send("Unfortunately you have lost, <@" + game.players[1] + ">... better luck next time!");
                        }
                        else if (winner == "O")
                        {
                            message.channel.send("Congrats, <@" + game.players[1] + ">! You have won!");
                            message.channel.send("Wow. You lost. <@" + game.players[0] + ">... try harder next time!");
                        }
                        else if (winner == "D")
                        {
                            message.channel.send("Well played, <@" + game.players[1] + "> and <@" + game.players[0] + ">! It was a tie! GG guys!");
                        }
                        var index = playing.indexOf(game.players[0]);
                        if (index > -1)
                        {
                            playing.splice(index, 1);
                        }
                        index = playing.indexOf(game.players[1]);
                        if (index > -1)
                        {
                            playing.splice(index, 1);
                        }
                        delete games.XO[gameID];
                    }

                    game.turn = 3 - game.turn;
                }
                else
                {
                    message.channel.send("That space is taken up already, " + message.author + "!");
                }
            }
            else
            {
                message.channel.send("It is not your turn, " + message.author + "!");
            }
        }
    }
}

function checkXOBoard(board)
{
    let marks = ["X", "O"];
    for (let i = 0; i < marks.length; i++)
    {
        let mark = marks[i];
        if (board[0] == mark && board[1] == mark && board[2] == mark)
        {
            return mark;
        }
        if (board[3] == mark && board[4] == mark && board[5] == mark)
        {
            return mark;
        }
        if (board[6] == mark && board[7] == mark && board[8] == mark)
        {
            return mark;
        }
        if (board[0] == mark && board[3] == mark && board[6] == mark)
        {
            return mark;
        }
        if (board[1] == mark && board[4] == mark && board[7] == mark)
        {
            return mark;
        }
        if (board[2] == mark && board[5] == mark && board[8] == mark)
        {
            return mark;
        }
        if (board[0] == mark && board[4] == mark && board[8] == mark)
        {
            return mark;
        }
        if (board[2] == mark && board[4] == mark && board[6] == mark)
        {
            return mark;
        }
    }
    if (board.indexOf("-") == -1)
    {
        return "D";
    }
    return "-";
}

async function loadAsset(src, dest)
{
    let before = new Date();
    Jimp.read(src, function(err, img)
    {
        if (err) console.error(err);

        if (!dest) dest = {};

        dest.i = img;
        dest.u = src;

        img.getBuffer(Jimp.MIME_PNG, function(e, buffer)
        {
            if (e)
            {
                console.error(e);
            }
            dest.b = buffer
        });

        let now = new Date();
        console.log("-- Asset \"" + util.ucfirst(src.split("%2F")[1]) + "\" loaded [" + (now - before) + "ms]");
    });
}

function arrayIsNaN(array)
{
    for (let i = 0; i < array.length; i++)
    {
        if (!isNaN(array[i]))
        {
            return false;
        }
    }
    return true;
}

process.on('unhandledRejection', (reason, p) =>
{
    console.error('Unhandled Rejection at: ' + p + '\nReason: ' + reason);

});

process.on('exit', () =>
{

});

function checkGame(user)
{
    if (games.XO.Playing.indexOf(user.user.id) != -1)
    {
        return 0xCAFE25151;
    }
    if (games.TwentyOne.Playing.indexOf(user.user.id) != -1)
    {
        return 0xCAFE25152;
    }
}

function sendTONumber(number, message, gameID)
{
    var image = new Jimp(128, 64, function(err, image)
    {
        if (err) throw err;
        Jimp.loadFont(Jimp.FONT_SANS_64_WHITE).then(function(font)
        {
            image.print(font, 0, 0, number.toString());
            toBufferAndSend(image, message, "Game [**" + gameID + "**] Number: " + number + "\n**Turn**: " + message.guild.members.find(m => m.user.id == games.TwentyOne[gameID].players[games.TwentyOne[gameID].turn - 1]).displayName)
        });
    });
}

function place21(message)
{
    for (let gameID in games.TwentyOne)
    {
        let game = games.TwentyOne[gameID];
        if (game.players && game.players.includes(message.author.id))
        {
            if (game.players.length < 2)
            {
                message.channel.send("```diff\n- You need someone else to join the game!\n```");
                return;
            }

            let input = parseInt(message.content);
            if (game.turn == game.players.indexOf(message.author.id) + 1)
            {
                if (game.accepting != false) game.accepting = false;
                if (input > game.current)
                {
                    if (input - game.current < 4)
                    {
                        if (input > 21)
                        {
                            message.channel.send("```diff\n- You can only go up to 21!\n```");
                            return;
                        }

                        game.current = input;

                        if (game.current == 21)
                        {
                            message.channel.send(message.author + " has lost! Everyone else has won!!! GG Everyone (except for **" + message.member.displayName + "** XD)! :tada:");
                            sendTONumber(21, message, gameID);

                            for (let i = 0; i < game.players.length; i++)
                            {
                                var index = playing.indexOf(game.players[i]);
                                if (index > -1)
                                {
                                    playing.splice(index, 1);
                                }
                            }
                            delete games.TwentyOne[gameID];
                            return;
                        }

                        game.turn++;
                        if (game.turn > game.players.length)
                        {
                            game.turn = 1;
                        }

                        sendTONumber(game.current, message, gameID);
                    }
                    else
                    {
                        message.channel.send("```diff\n- You can only go up by a maximum of 3!\n```");
                        return;
                    }
                }
                else
                {
                    message.channel.send("```diff\n- You have to count up, not down! Duh!\n```");
                    return;
                }
            }
            else
            {
                message.channel.send("```diff\n- It is not your turn! It is " + message.guild.members.find(m => m.user.id == game.players[game.turn - 1]).displayName + "\n```");
                return;
            }
        }
    }
}

async function loadData(src, dest)
{
    let before = new Date();
    if (!dest) dest = {};
    if (!src) src = "/";

    let ref = firebase.database().ref(src);
    await ref.once("value", function(snapshot)
    {
        let data = snapshot.val();
        dest = data;
        let after = new Date();
        console.log("-- Data loaded from database reference \"" + src + "\" [" + (after - before) + "ms]");
    });
}

function updateFirebaseData(src, dest, type)
{
    let before = new Date();
    if (!src)
    {
        console.error("No data provided to update in the database!");
        return;
    }
    if (!dest) dest = "/";
    if (!type) type = "u";

    let ref = firebase.database().ref(dest);
    if (type == "u") ref.update(src);
    if (type == "s") ref.set(src);
    else
    {
        console.error("TypeError: No type provided to update data!");
        return;
    }
}

function hook(channel, title, message, color, avatar)
{

    if (!channel) return ('Channel not specified.');
    if (!title) return ('Title not specified.');
    if (!message) return ('Message not specified.');
    if (!color) color = '843B80';
    if (!avatar) avatar = 'https://cdn4.iconfinder.com/data/icons/technology-devices-1/500/speech-bubble-128.png'

    color = color.replace(/\s/g, '');
    avatar = avatar.replace(/\s/g, '');

    if (color.startsWith("#")) color = color.substr(1);

    channel.fetchWebhooks()
        .then(webhook =>
        {

            let foundHook = webhook.find('name', 'Webhook');

            if (!foundHook)
            {
                channel.createWebhook('Webhook', 'https://cdn4.iconfinder.com/data/icons/technology-devices-1/500/speech-bubble-128.png')
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
