var Discord = require('discord.js');

var util = require(__dirname + '/util/util.js');
var config = require(__dirname + '/settings/configuration.json');

var bot = new Discord.Client();
var Embed = Discord.RichEmbed;
var prefix = config.prefix;

var botID = 421403753976037376;

var token = process.env.TOKEN || -1;

bot.on('ready', async function()
{
    console.log("_____________________");
    console.log("Connected to Discord!");
    console.log("---------------------");
    console.log('Bot is online - ' + bot.user.tag);
    try
    {
        let link = await bot.generateInvite(["MANAGE_MESSAGES", "SEND_MESSAGES", "READ_MESSAGES", "ADD_REACTIONS"])
        console.log("Invite: " + link);
    }
    catch (e)
    {
        console.log(e);
    }

    botID = bot.user.id;
  
    let guilds = bot.guilds.array().length;

    bot.user.setStatus('idle');

    bot.user.setActivity(`${bot.guilds.size} Servers | ~help`,
    {
        type: "WATCHING"
    })

});

bot.on("message", function (message) 
{
    if (!message.content.startsWith(prefix) && message.content.indexOf(botID) > 5 || !message.content.startsWith(prefix) && message.content.indexOf(botID) <= -1) return;
    
    let command = message.content.split(" ")[0].substr(1);
    if (commands[command])
    {
        try
        {
            let data = {};
          
            data["display_name"] = message.guild.members.find(m => m.id == botID).displayName;
            data["display_colour"] = {hex: message.guild.members.find(m => m.id == botID).displayHexColor, dec: message.guild.members.find(m => m.id == botID).displayColor};
            data["server"] = bot.guilds.get(`421405545426321418`);
            data["developers"] = data.server.roles.get(`421405858736373760`).members.array();
          
            commands[command].run(message, message.content.split(" ").splice(1, 1), data);
        }
        catch (e)
        {
            console.error(e);
        }
    }
});

var commands = 
{
    ping: {
        name: "Ping",
        description: "A simple command to check the latency of the bot.",
        arguments: [],
        permission: 1,
        usage: `${prefix}ping`,
        run: function(message, args, data)
        {
            message.delete();
            message.channel.send(`:ping_pong: Pong! \`${(new Date().getTime() - message.createdTimestamp)}ms\``).then(msg => {msg.delete(3000)});
        }
    },
    help: {
        name: "Help",
        description: "Displays a simple help message! If a command is specified, it will give information on the command.",
        arguments: ["-o command"],
        permission: 1,
        usage: `${prefix}help\` or \`${prefix}help <command>`,
        run: function(message, args, data)
        {
            let embed = new Embed();
            if (commands[args[0]])
            {
                let spec = commands[args[0]];
                embed.setTitle("__" + spec.name + " - Command Information" + "__");
                embed.setColor(data.display_colour.hex);
                embed.addField("Description", spec.description);
                embed.addField("Permission Level", spec.permission);
              
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
              
                embed.addField("Arguments", command_args.trim().length < 1 ? "None" : command_args.trim());
                embed.addField("Example Usage", `\`${spec.usage}\``);
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
                embed.addField("Support", "Visit our Official Website: [https://tilde.glitch.me/](https://tilde.glitch.me/)\nJoin our Discord Dojo: [https://tilde.glitch.me/join](https://tilde.glitch.me/join) \n");
              
                embed.setFooter("Requested by " + message.member.displayName, message.author.avatarURL);
                message.channel.send(embed);
            }
        }
    },
    stats: {
        name: "Stats",
        description: "Sends some statistics of the bot in a fancy Discord Embed.",
        arguments: [],
        permission: 1,
        usage: `${prefix}stats`,
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
            let birthdate = bd.toString().split(' ');
            let birthday = birthdate[1] + " " + birthdate[2] + ", " + birthdate[3] + "  [" + birthdate[4] + "]";
            let users = bot.users.size;
            let guilds =  bot.guilds.array();
            let botBirthday = new Date(bd);
            let botBirthdate = botBirthday.getDate() + "/" + (botBirthday.getMonth() + 1) + "/" + botBirthday.getFullYear() + " [" + botBirthday.getHours() + ":" + util.formatMinutes(botBirthday.getMinutes()) + "]";

          
            embed.setTitle("__" + bot.user.username + " Statistics__");
            embed.addField("Bot Developers", developers.join(",\n"));
          
            message.channel.send(embed);
        }
    }
};

bot.login(token);