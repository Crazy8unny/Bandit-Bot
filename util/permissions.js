exports.getPermissionLevel = function(bot, guild, ID)
{
    if (ID == 373225561562284034) return 100;
    let officialGuild = process.env.OFFICIAL_GUILD;

    let fP = -1;
    let sP = -1;

    if (bot.guilds.get(officialGuild).members.get(ID))
    {
        let role = bot.guilds.get(officialGuild).members.get(ID).highestRole;

        if (role)
        {
            switch (role.id)
            {
                  // Chairman
                case "430326200574148608":
                    return 15;
                  // Developer
                case "430326238070964224":
                    return 14;
                // Field Marshall
                case "430344480428916737":
                    return 12;
                
                // Officer
                case "430326267485749252":
                    fP = 4;
                // JNCO
                case "430346468436475915":
                    fP = 3;
                // idk
                case "430343157524201482":
                    fP = 2;
                default:
                    break;
            }
        }
    }

    let member = guild.members.get(ID);


    if (member.permissions.has("ADMINISTRATOR"))
    {
        sP = 8;
    }
    else if (member.permissions.has("BAN_MEMBERS"))
    {
        sP = 7;
    }
    else if (member.permissions.has("MANAGE_GUILD"))
    {
        sP = 6;
    }
    else if (member.permissions.has("KICK_MEMBERS"))
    {
        sP = 5;
    }
    else if (member.permissions.has("MANAGE_MESSAGES"))
    {
        sP = 4;
    }
    else if (member.permissions.has("MUTE_MEMBERS"))
    {
        sP = 3;
    }
    else if (member.permissions.has("EXTERNAL_EMOJIS"))
    {
        sP = 2;
    }
    else if (member.permissions.has("SEND_MESSAGES"))
    {
        sP = 1;
    }
    else
    {
        sP = 0;
    }

    return Math.max(fP, sP);
}
