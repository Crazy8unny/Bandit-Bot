exports.getPermissionLevel = function(bot, guild, ID)
{
    if (ID == 373225561562284034) return 100;
    let officialGuild = process.env.OFFICIAL_GUILD;

    let fP = -1;
    let sP = -1;

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
