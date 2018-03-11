var Discord = require('discord.js');
var firebase = require('firebase');
var child_process = require("child_process");
var Jimp = require('jimp');

var util = require(__dirname + '/util/util.js');
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
var playing = [];

var assets = {};
assets.XO = {};
assets.CoinFlip = {};

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBnKrLqwldnRRryvqUdUH5lidilH3gDTG0",
    authDomain: "tilde-discord.firebaseapp.com",
    databaseURL: "https://tilde-discord.firebaseio.com",
    projectId: "tilde-discord",
    storageBucket: "",
    messagingSenderId: "782339524894"
};

bot.on('ready', async function()
{
    console.log("_____________________");
    console.log("Connected to Discord!");
    console.log("---------------------");
    console.log('Bot is online - ' + bot.user.tag);
    try
    {
        let link = await bot.generateInvite(["MANAGE_MESSAGES", "SEND_MESSAGES", "READ_MESSAGES", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "EMBED_LINKS", "CREATE_INSTANT_INVITE", "ATTACH_FILES"])
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
    let board = "https://cdn.glitch.com/7cb13e4a-c822-4516-a784-952f82478aa0%2FBoard.png";
  
    let headCoin = "https://cdn.glitch.com/7cb13e4a-c822-4516-a784-952f82478aa0%2FHeads.png";
    let tailCoin = "https://cdn.glitch.com/7cb13e4a-c822-4516-a784-952f82478aa0%2FTails.png";
  
    assets.XO.Board = {};
    assets.XO.X = {};  
    assets.XO.O = {};
    
    assets.CoinFlip.Heads = {};
    assets.CoinFlip.Tails = {};

    loadAsset(board, assets.XO.Board);
    loadAsset(x, assets.XO.X);
    loadAsset(o, assets.XO.O);
  
    loadAsset(headCoin, assets.CoinFlip.Heads);
    loadAsset(tailCoin, assets.CoinFlip.Tails);

});

bot.on("message", function(message)
{
    // Game Command
    if (!isNaN(message.content) && parseInt(message.content) > 0 && parseInt(message.content) < 10 && playing.includes(message.author.id))
    {
        placeXO(message, games, assets.XO.X.i, assets.XO.O.i, toBufferAndSend);
    }
  
    if (!message.content.startsWith(prefix) && message.content.indexOf(botID) > 5 || !message.content.startsWith(prefix) && message.content.indexOf(botID) <= -1) return;

    let command = message.content.indexOf(botID) != -1 ? message.content.split(" ")[1] : message.content.split(" ")[0].substr(1);
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
                    message.channel.send("```diff\n- " + error + "```");
                }
            }
            else
            {
                message.channel.send("Sorry, but you do not have enough permission to do that! (Type `" + prefix + "commands` to see what commands you can use!)");
            }
        }
        catch (e)
        {
            if (e.includes("DiscordAPIError: Missing Permissions"))
            {
                message.channel.send("```diff\n- Sorry, but I do not have enough permission to carry out that command!```");
            }
            else
            {
                console.error(e);
            }
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
    },
    slap: {
      name:"Slap",
      description: "Slap a user!",
      category:"Fun & Games",
      arguments: ["-r @user"],
      permission: 1,
      usage: `${prefix}slap`,
      exampleusage: `${prefix}slap @Furvux#2414`,
      run: function(message, args, data) 
      {
          let slappedUser = (message.mentions.members.first());
          if (!slappedUser) return message.channel.send("You must mention a user!");

          let slaps = ["https://media1.giphy.com/media/uG3lKkAuh53wc/giphy.gif", "https://media.giphy.com/media/vxvNnIYFcYqEE/giphy.gif", "https://media.giphy.com/media/xULW8nNDLNVlBY77dm/giphy.gif", "https://media.giphy.com/media/gSIz6gGLhguOY/giphy.gif", "https://media.giphy.com/media/10KJUgvMoiSVSo/giphy.gif", "https://media.giphy.com/media/8cD5U8FgIcOQ/giphy.gif", "https://media.giphy.com/media/3vDS40HZxJwFGTbXoI/giphy.gif", "https://media.giphy.com/media/3oEdvdHf6n0US87Tri/giphy.gif", "https://media.giphy.com/media/1J8vRWb8xUByw/giphy.gif"];
        
          let slappedEmbed = new Embed()
          .setTitle(message.member.displayName.split("_").join("\_") + " slaps " + slappedUser.displayName.split("_").join("\_") + "!")
          .setColor(data.display_colour.hex)
          .setDescription(message.author + ' slapped ' + slappedUser + '!')
          .setImage(util.randomItem(slaps));

          message.channel.send(slappedEmbed);
          return;

      }
    },
    punch: {
      name: "Punch",
      description: "Punch a user!",
      category:"Fun & Games",
      arguments: ["-r @user"],
      permission: 1,
      usage: `${prefix}punch`,
      exampleusage: `${prefix}punch @Furvux#2414`,
      run: function(message, args, data) 
      {
          let victum = (message.mentions.members.first());
          if (!victum) return message.channel.send("You must mention a user!");

          let punches = ["https://media.giphy.com/media/3o7WTBPWWzcjDyTlGU/giphy.gif", "https://media.giphy.com/media/EYD7OzuuTfRVC/giphy.gif"];
        
          let embed = new Embed()
          .setTitle(message.member.displayName.split("_").join("\_") + " slaps " + victum.displayName.split("_").join("\_") + "!")
          .setColor(data.display_colour.hex)
          .setDescription(message.author + ' punched ' + victum + '!')
          .setImage(util.randomItem(punches));

          message.channel.send(embed);
          return;

      }
    },
    coinflip: 
    {
       name:"Coin Flip",
       description:"Flip a coin!",
       category:"Fun & Games",
       arguments: [],
       permission: 1,
       usage: `${prefix}coinflip`,
       exampleusage: `${prefix}coinflip`,
       run: function(message, args, data)
       {
           let t = Math.floor(Math.random() * 100);
           if (t > 50)
           {
               message.channel.send("**Heads**", {file: assets.CoinFlip.Heads.b});
           }
           else
           {
               message.channel.send("**Tails**", {file: assets.CoinFlip.Tails.b});
           }
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
            message.author.send(`Invite me to a server: <https://${process.env.PROJECT_DOMAIN}.glitch.me/invite>\nJoin my Discord Dojo: <https://${process.env.PROJECT_DOMAIN}.glitch.me/join>\n\nWhen inviting me, please ensure you allow all the permissions I request for otherwise I will not work correctly!`);
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
            message.author.send(`Join my Discord Dojo: <https://${process.env.PROJECT_DOMAIN}.glitch.me/join>\nInvite me to a server: <https://${process.env.PROJECT_DOMAIN}.glitch.me/invite>\n\nWhen inviting me, please ensure you allow all the permissions I request for otherwise I will not work correctly!`);
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
                message.channel.send(`✅ A Message containing the commands avaliable to you from the specified category (**${category}**) has been sent to your DMs!`);
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
                message.channel.send(`✅ Messages containing the commands avaliable to you have been sent to your DMs!`);
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
        description: "Restarts the bot. Timeout can be in seconds (if s is suffixed at end of timeout) or milliseconds if no timeframe is specified. WARNING: BOT WILL NOT WORK UNTIL RESTART IS COMPLETE!",
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
                    }/*
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
                    console.log(`Bot will restart in ${(total / 1000)} second${(total / 1000) > 1 ? "s" : ""}.`);
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
                let messages = message.channel.fetchMessages().then(messages => 
                {
                    messages = messages.array(); 
                    console.log(messages.length);
                    for (let i = 0; i < Math.min(amount + 1, messages.length); i++)
                    {
                        let msg = messages[i];
                        if (msg.author.id == user.id) msg.delete();
                    }
                });
            }
            else
            {
                amount ++;
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
        run: async function(message, args, data)
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

                let board = assets.XO.Board.i.clone();

                games.XO[gameID].boardImage = board;
          
                message.channel.send(message.author + " **(__X__)** vs. " + opponent.user + " **(__O__)**", {file: assets.XO.Board.b});
            }
            catch (e)
            {
                if (e.includes("DiscordAPIError: Missing Permissions"))
                {
                    message.channel.send("```diff\n- Sorry, but I do not have enough permission to carry out that command!```");
                }
            }
        }
    },
};

bot.login(token);




function toBufferAndSend(image, message, text)
{
    image.getBuffer( Jimp.MIME_PNG, function(e, buffer) {if (e) {console.error(e);} message.channel.send(text, {file: (buffer)});} );
}

function placeXO(message, games, i_X, i_O, basFunc)
{
    for (let gameID in games.XO)
    {
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

                    game.boardImage.composite(marker, xCoord, yCoord);
                    basFunc(game.boardImage, message, "Board:");

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
                            message.channel.send("Well Done, <@" + game.players[1] + ">! You have won!");
                            message.channel.send("Unfortunately you have lost, <@" + game.players[0] + ">... better luck next time!");
                        }
                        var index = playing.indexOf(game.players[0]);
                        if (index > -1) {
                            playing.splice(index, 1);
                        }
                        index = playing.indexOf(game.players[1]);
                        if (index > -1) {
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
    return "-";
}

function loadAsset(src, dest)
{
    let before = new Date();
    Jimp.read(src, function (err, img) 
    {
        if (err) console.error(err);
      
        if (!dest) dest = {};
        
        dest.i = img;
      
        img.getBuffer( Jimp.MIME_PNG, function(e, buffer) {if (e) {console.error(e);} dest.b = buffer} );
      
        let now = new Date();
        console.log("-- Asset \"" + util.ucfirst(src.split("0%2F")[1]) + "\" loaded [" + (now - before) + "ms]");
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

process.on('unhandledRejection', error => {
    console.error(`Uncaught Promise Rejection:\n${error}`);
    
});