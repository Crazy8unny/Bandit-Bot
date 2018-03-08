var Discord = require('discord.js');

var util = require(__dirname + '/util/util.js');

var bot = new Discord.Client();
var Embed = Discord.RichEmbed;
var prefix = "~";

var botID = 421403753976037376;

var token = process.env.TOKEN || -1;

bot.on('ready', async function()
{
    console.log("Connected to Discord!");
    console.log("_____________________");
    console.log('Bot is online - ' + bot.user.tag);
    try
    {
        let link = await bot.generateInvite(["MANAGE_MESSAGES", "SEND_MESSAGES", "READ_MESSAGES", "ADD_REACTIONS"])
        console.log("Invite: " + link);
    }
    catch (e)
    {
        console.log(e)
    }

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
            commands[command].run(message, message.content.split(" ").splice(1, 0));
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
        usage: `${prefix}ping`,
        run: function(message, args)
        {
            message.delete();
            message.channel.send(`:ping_pong: Pong! \`${(new Date().getTime() - message.createdTimestamp)}ms\``).then(msg => {msg.delete(3000)});
        }
    },
    help: {
        name: "Help",
        description: "Displays a simple help message! If a command is specified, it will give information on the command.",
        arguments: ["-o command"],
        usage: `${prefix}help\` or \`${prefix}help <command>`,
        run: function(message, args)
        {
            console.log("Running");
            let embed = new Embed();
            if (commands[args[0]])
            {
                let spec = commands[args[0]];
                embed.setTitle("__" + spec.name + " - Command Information" + "__");
                embed.setColor(message.guild.members.get(`${botID}`).displayHexColor);
                embed.addField("Description", spec.description);
              
                let command_args = "";
              
                for (let i = 0; i < spec.arguments.length; i++)
                { 
                    let tempArg = spec.arguments[i];
                  
                    if (tempArg.startsWith("-o "))
                    {
                        tempArg = tempArg.substr(3);
                        command_args += `(__Optional__) \`${tempArg}\`\n`;
                    }
                    else if (tempArg.startsWith("-r "))
                    {
                        tempArg = tempArg.substr(3);
                        command_args += `(__Required__) \`${tempArg}\`\n`;
                    }
                    else if (tempArg.startsWith("-e "))
                    {
                        tempArg = tempArg.substr(3);
                        let option1 = tempArg.split("||")[0];
                        let option2 = tempArg.split("||")[1];
                        command_args += `(__Choose__) \`${option1}\` or \`${option2}\`\n`;
                    }
                    else
                    {
                        command_args += `(**Uncategorised**) \`${tempArg}\`\n`;
                    }
                }
              
                embed.addField("Arguments", command_args.trim().length < 1 ? "None" : command_args.trim());
                embed.addField("Example Usage", spec.usage);
                embed.setFooter(message.member.displayName);
                message.channel.send(embed);
            }
        }
    }
};

bot.login(token);