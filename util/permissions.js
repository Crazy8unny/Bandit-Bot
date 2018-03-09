exports.getPermissionLevel = function(bot, ID)
{
    let officialGuild = process.env.OFFICIAL_GUILD;
    
    if (bot.guilds.get(officialGuild).members)
}