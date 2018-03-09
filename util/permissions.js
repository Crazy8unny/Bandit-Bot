exports.getPermissionLevel = function(bot, guild, ID)
{
    let officialGuild = process.env.OFFICIAL_GUILD;
    
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
              case "421440291086532638":
                  return 11;
              case "421440073934831628":
                  return 10;
              case "421406584833441803":
                  return 5;
              case "421406447696609281":
                  return 4;
              case "421405926671646730":
                  return 3;
              default:
                  break;
            }
        }
    }
  
    let member = guild.members.get(ID);
    
}