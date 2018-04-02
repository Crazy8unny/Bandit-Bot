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

var botID = 430356528093069330;

var token = process.env.TOKEN || -1;

var serverdata = {};

// Initialize Firebase
var config = {
};
bot.on('ready', async function()
{
    let before = new Date();
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

    let guilds = bot.guilds.array()
        .length;

    bot.user.setStatus('idle');

    bot.user.setActivity(`${bot.guilds.size} Servers | ${prefix}help`,
    {
        type: "WATCHING"
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
    let ref = firebase.database().ref().child("Serverdata").child(guild.id.toString());
    ref.set({});
});

bot.on("message", function(message)
{
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
            data["server"] = bot.guilds.get(`430326116805246976`);

            if (data.permission >= commands[command].permission)
            {
                let error = commands[command].run(message, message.content.split(" ").splice(1), data);
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

            DMCommands[command].run(message, message.content.split(" ")
                .splice(1, 1), data);
        }
        catch (e)
        {

            console.error(e);
        }
    }
});

var DMCommands = {};

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
    help:
    {
        name: "Help",
        description: "Displays a simple help message! If a command is specified, it will give information on the command.",
        category: "General",
        arguments: ["-o command"],
        permission: 1,
        usage: `${prefix}help <command>`,
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

            embed.setTitle("__" + bot.user.username + " Statistics__");
            embed.setColor(data.display_colour.hex);
            embed.setThumbnail(bot.user.avatarURL);

            embed.addField("🎂 __Birthday__ 🎂", ">> " + botBirthdate);
            embed.addField(":hash: __Channels__ :hash:", ">> **" + totalChannels + "** Channels");
            embed.addField("👥 __Users__ 👥", ">> **" + totalUsers + "** Unique Discord Users");
            embed.addField("✳️ __Commands__ ✳️", ">> **" + (Object.keys(commands).length) + "** Different Commands");

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
        usage: `${prefix}commands <category>`,
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
        permission: 10,
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

                let messageTo = [message.channel];

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
    suggest:
    {
        name: "Suggest",
        description: "Suggest a new feature for the server or the armed forces!",
        category: "General",
        arguments: ["-r suggestion"],
        permission: 1,
        usage: `${prefix}suggest <suggestion>`,
        exampleusage: `${prefix}suggest Add JF-17 Thunder jets to the airfield!`,
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
                            bot.guilds.get(process.env.OFFICIAL_GUILD).channels.get(`430326116805246976`).send(embed).then(m =>
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
    elementals:
    {
        name: "Elementals",
        description: "The Elemental type commands fall under this category. To use an elemental command, type `" + prefix + "elemental <command> <arguments>`",
        category: "Fun & Games",
        arguments: ["-r command", "-o arguments"],
        permission: 1,
        usage: `${prefix}elementals <command> <arguments>`,
        exampleusage: `${prefix}elementals start`,
        run: function(message, args, settings)
        {
            let user = message.mentions.members.first();
            if (user && !args[1])
            {
                let ref = firebase.database().ref("Userdata/" + user.user.id + "/Elementals/Characters");
                ref.once("value", function(snapshot)
                {
                    let data = snapshot.val();

                    if (!data) {message.channel.send(user.displayName + " does not have any Elementals! They need to type `" + prefix + "elementals start` to start their Elemental career!"); return;}

                    let msg = ``;
                    let tFire = 0;
                    let tWater = 0;
                    let tNature = 0;
                    let tWind = 0;
                    for (let name in data)
                    {
                        let character = data[name];  
                      
                        msg += `>> **${name}** __[${character.Type} Elemental, Level **${character.Level}**]__\n`;
                        
                        if (character.Type == "Fire")
                        {
                            tFire++;
                        }
                        if (character.Type == "Water")
                        {
                            tWater++;
                        }
                        if (character.Type == "Nature")
                        {
                            tNature++;
                        }
                        if (character.Type == "Wind")
                        {
                            tWind++;
                        }
                    }
                  
                    let img = "";
                    if (tFire > tWater && tFire > tNature && tFire > tWind)
                    {
                        img = "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FFire.png";
                    }
                    else if (tWater > tFire && tWater > tNature && tWater > tWind)
                    {
                        img = "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FWater.png";
                    }
                    else if (tNature > tWater && tNature > tFire && tNature > tWind)
                    {
                        img = "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FNature.png";
                    }
                    else if (tWind > tWater && tWind > tNature && tWind > tFire)
                    {
                        img = "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FWind.png";
                    }
                    else
                    {
                        img = "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FCoverimg.png";
                    }
                  
                    let embed = new Embed();
                    embed.setTitle("__" + user.displayName + "'s Elementals__");
                    embed.setThumbnail(img);
                    embed.setColor(settings.display_colour.hex);
                    embed.setDescription(msg);
                    embed.setFooter(user.displayName + "'s Elementals", user.user.avatarURL);

                    message.channel.send(embed);
                });
                return;
            }
          
            if (!args[0])
            {
                return "You need to specify a command to run in the sub-category of `elemental`! Type `" + prefix + "elementals help` to see help for the commands under the sub-category of Elemental.";
            }

            try
            {
                let comm = args.shift().toLowerCase();
                if (!elemental[comm]) return "Sorry, but that command does not exist!";
                if (settings.permission >= elemental[comm].permission)
                {
                    let error = elemental[comm].run(message, args, settings);
                    if (error) return error;
                }
                else
                {
                    return "Sorry, but your permission level is too low to access that command! \nType `" + prefix + "elementals help` to recieve help on the Elemental sub-category.";
                }
            }
            catch (e)
            {
                if (e.message.includes("TypeError: Cannot read property 'run' of undefined"))
                {
                    return "No such command found under the sub-category of `elementals`! Ensure correct spelling and make sure the command is avaliable to your level!";
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
        usage: `${prefix}pfp <@user>`,
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
    },
    enable:
    {
        name: "Enable",
        description: "Enables something.",
        category: "Setup",
        arguments: ["-r thing"],
        permission: 10,
        usage: `${prefix}enbale <thing>`,
        exampleusage: `${prefix}enable elementalspawns`,
        run: function(message, args, data)
        {
            if (!args[0])
            {

            }
            
        }
    },
    test:
    {
        name: "Test",
        description: "Test Command",
        category: "Development",
        arguments: [],
        permission: 10,
        usage: `${prefix}test`,
        exampleusage: `${prefix}test`,
        run: function(message, args, data)
        {         
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
                                updateFirebaseData({Carrots: 5}, "Userdata/" + author.id + "/Elementals/Inventory", "u");
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
        usage: `${prefix} ${creatureCommand} rename <old name> <new name>`,
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

                if (!data) {message.channel.send("You do not have any Elementals! Type `" + prefix + "elementals start` to start your Elemental career!"); return;}
              
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

                if (!data) {message.channel.send("You do not have any Elementals! Type `" + prefix + "elementals start` to start your Elemental career!"); return;}
              
                let msg = ``;
                    let tFire = 0;
                    let tWater = 0;
                    let tNature = 0;
                    let tWind = 0;
                    for (let name in data)
                    {
                        let character = data[name];  
                      
                        msg += `>> **${name}** __[${character.Type} Elemental, Level **${character.Level}**]__\n`;
                        
                        if (character.Type == "Fire")
                        {
                            tFire++;
                        }
                        if (character.Type == "Water")
                        {
                            tWater++;
                        }
                        if (character.Type == "Nature")
                        {
                            tNature++;
                        }
                        if (character.Type == "Wind")
                        {
                            tWind++;
                        }
                    }
                  
                    let img = "";
                    if (tFire > tWater && tFire > tNature && tFire > tWind)
                    {
                        img = "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FFire.png";
                    }
                    else if (tWater > tFire && tWater > tNature && tWater > tWind)
                    {
                        img = "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FWater.png";
                    }
                    else if (tNature > tWater && tNature > tFire && tNature > tWind)
                    {
                        img = "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FNature.png";
                    }
                    else if (tWind > tWater && tWind > tNature && tWind > tFire)
                    {
                        img = "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FWind.png";
                    }
                    else
                    {
                        img = "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FCoverimg.png";
                    }
                  
                    let embed = new Embed();
                    embed.setTitle("__" + message.member.displayName + "'s Elementals__");
                    embed.setThumbnail(img);
                    embed.setColor(settings.display_colour.hex);
                    embed.setDescription(msg);
                embed.setFooter(message.member.displayName + "'s Elementals", message.author.avatarURL);
              
                message.channel.send(embed);
            });
        }
    },
    "inventory":
    {
        name: "Inventory",
        description: "Check your inventory!",
        category: "General",
        arguments: [],
        permission: 10,
        usage: `${prefix} ${creatureCommand} inventory`,
        exampleusage: `${prefix} ${creatureCommand} inventory`,
        run: function(message, args, settings) 
        {
            let ref = firebase.database().ref("Userdata/" + message.author.id + "/Elementals/Inventory");
            ref.once("value", function(snapshot)
            {
                let data = snapshot.val();
                fillInventory(data, message, args[0] || 1);   
            });
        }
    },
    "info":
    {
        name: "Info",
        description: "Gives information about an elemental.",
        category: "General",
        arguments: ["-r @user", "-r elemental"],
        permission: 10,
        usage: `${prefix} ${creatureCommand} info <@user> <elemental>`,
        exampleusage: `${prefix} ${creatureCommand} info @Furvux#2414 Marsoak`,
        run: function(message, args, settings) 
        {
            let user = message.mentions.members.first();
            if (!user)
            {
                return "You need to mention the owner of the elemental!";
            }
            if (!args[1])
            {
                return "You need to provide both the elemental name and the owner of the elemental to get info on it! Type `" + prefix + "elementals help info` to see more info about the command.";
            }
            
            let elemental = args[0].includes("<@") ? args[1] : args[0];
          
            let ref = firebase.database().ref("Userdata/" + user.user.id + "/Elementals/Characters");
            ref.once("value", function(snapshot)
            {
                let data = snapshot.val();
              
                if (!data) {message.channel.send(user.displayName + " does not have any Elementals! They need to type `" + prefix + "elementals start` to start their Elemental life!"); return;}
              
                data = data[elemental];
                if (!data) {message.channel.send(user.displayName + " does not have any Elementals by that name! Type `" + prefix + "elementals @" + user.displayName + "` to see which elementals they have!"); return;}
              
                let embed = new Embed();
                embed.setColor("#00AA00");
                embed.setDescription("Here is some information about __" + user.displayName + "__'s elemental **" + elemental + "**!");
                embed.setThumbnail(assets.Elementals.Characters[data.Type][data.Name].u);
                embed.addField("__Stats__", `>> __Type:__ **${data.Type}**\n>> __Health:__ **${data.Health}**\n>> __Basic Damage:__ **${data.BasicDamage}**\n>> __Elemental Damage:__ **${data.ElementalDamage}**\n`);
                embed.addField("__Attacks__", data.Attacks.join("\n"));
                embed.setFooter(data.Type + " Type Elemental", "https://cdn.glitch.com/b4a9f84f-f609-4b97-897f-66f24c1d3d7e%2FNature.png");

                message.channel.send(embed);
            });
        }
    },
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
        console.log("-- Asset \"" + util.ucfirst(src.split("%2F")[1].split("?")[0]) + "\" loaded [" + (now - before) + "ms]");
    });
}

async function loadFont(src, dest)
{
    let before = new Date();
    Jimp.loadFont(src).then(function(font)
    {
        let now = new Date();
        dest = font;
        console.log("-- Font \"" + (src.includes("//") ? util.ucfirst(src.split("%2F")[1].split("?")[0]) : util.ucfirst(src.split("/")[src.split("/").length - 1].split(".")[0])) + "\" loaded [" + (now - before) + "ms]");
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

function fillInventory(data, message, place)
{
    const padding = 9;
    const border = 1;
    const boxPadding = 4;
  
    let inventory = assets.Elementals.Inventory.i.clone();
    let dict = {"Carrots" : assets.Elementals.Inventory.Objects.Carrot};
  
    Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(function (font) {
        for (let object in data)
        {
            let amount = data[object];
            let icon = "";

            if (dict[object])
            {
                icon = dict[object];
            }

            let n = ((place - 1) % 5);

            let xCoord = (n * 128) + (padding * (n + 1)) + border + boxPadding;//287 //(Math.ceil(place / 5) * 128) + (padding * place) + border;
            let yCoord = Math.floor(place / 5) * 128 + (padding * (Math.floor(place / 5) + 1)) + boxPadding;
            yCoord = place % 5 == 0 ? yCoord - (128 + padding) : yCoord;

            console.log();

            let obj = icon.i.clone();
            inventory.composite(obj, xCoord, yCoord);
            inventory.print(font, xCoord + 100, yCoord + 87, amount.toString());
        }
  
        toBufferAndSend(inventory, message, "");
    });
}