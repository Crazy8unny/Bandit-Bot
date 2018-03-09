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
    
    switch (member.permissions)
    {
        case this.has("ADMINISTRATOR"):
            return 10;
        case this.has("BAN_MEMBERS"):
            return 9;
        case this.has("KICK_MEMBERS"):
            return 8;
        case this.has("MANAGE_GUILD"):
            return 7;
        case this.has("MANAGE_CHANNELS"):
            return 6;
        case this.has("SEND_MESSAGES"):
            return 5;
        case this.has("SEND_MESSAGES"):
            return 4;
        case this.has("SEND_MESSAGES"):
            return 3;
        case this.has("SEND_MESSAGES"):
            return 2;
        case this.has("SEND_MESSAGES"):
            return 1;
        default:
            break;
    }
}