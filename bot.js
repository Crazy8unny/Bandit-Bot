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
  apiKey: "AIzaSyC58QexScqzbFifg5xBg0vgv6KIi8BOYQ0",
  authDomain: "heads-discord.firebaseapp.com",
  databaseURL: "https://heads-discord.firebaseio.com",
  projectId: "heads-discord",
  storageBucket: "heads-discord.appspot.com",
  messagingSenderId: "949986113980"
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
