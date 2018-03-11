exports.getPermissionLevel = function(bot, guild, ID)
{
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
                case "421405858736373760":
                    return 15;
                case "421406682678165506":
                    return 12;
                case "422308425834168321":
                    return 11;
                case "421440073934831628":
                    return 10;
                case "421406584833441803":
                    fP = 3;
                case "421406447696609281":
                    fP = 2;
                case "421405926671646730":
                    fP = 1;
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
