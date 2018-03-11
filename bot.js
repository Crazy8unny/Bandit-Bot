var Discord = require('discord.js');
var firebase = require('firebase');
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

var i_Board;
var i_X;
var i_O;

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
        let link = await bot.generateInvite(["MANAGE_MESSAGES", "SEND_MESSAGES", "READ_MESSAGES", "ADD_REACTIONS", "EMBED_LINKS", "CREATE_INSTANT_INVITE"])
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
    Jimp.read(board, function (err, image) 
    {
        if (err) console.error(err);

        i_Board = image;
        console.log("-- Asset \"Board.png\" loaded!");
    });
    Jimp.read(x, function (err, x) 
    {
        if (err) console.error(err);
      
        i_X = x;
        console.log("-- Asset \"Cross.png\" loaded!");
    });
    Jimp.read(o, function (err, o) 
    {
        if (err) console.error(err);
      
        i_O = o;
        console.log("-- Asset \"Nought.png\" loaded!");
    });

});

bot.on("message", function(message)
{
    if (!isNaN(message.content) && parseInt(message.content) > 0 && parseInt(message.content) < 10 && playing.includes(message.author.id))
    {
        placeXO(message, games, i_X, i_O, toBufferAndSend);
    }
  
    if (!message.content.startsWith(prefix) && message.content.indexOf(botID) > 5 || !message.content.startsWith(prefix) && message.content.indexOf(botID) <= -1) return;

    let command = message.content.indexOf(botID) != -1 ? message.content.split(" ")[1] : message.content.split(" ")[0].substr(1);
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
        name: "Help (DM)",
        description: "Displays a help message. If a command is specified, it will give information on the command.",
        category: "General",
        arguments: ["-o command"],
        permission: 1,
        usage: `${prefix}help\`\`\` or \`\`\`${prefix}help ping`,
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

            let messages = message.channel.messages.array();
            if (user)
            {
                for (let i = 0; i < Math.min(amount, messages.length); i++)
                {
                    let msg = messages[i];
                    msg.delete();
                }
            }
            else
            {
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
            let user = message.mentions.members.first() || message.guild.members.find(m => m.displayName.toLowerCase() == args[0].toLowerCase() || m.user.username.toLowerCase() == args[0].toLowerCase()) || message.member;

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
          
            let board = i_Board.clone();
            
            games.XO[gameID].boardImage = board;
          
            toBufferAndSend(board, message, message.author + "(**X**) vs. " + opponent + "(**O**)");
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