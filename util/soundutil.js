const youtube = require('ytdl-core');

exports.playFromYoutubeURL = (bot, details, link) =>
{
    var url = link;
    if (!link.includes("://"))
    {
        url = "https://www.youtube.com/watch?v=" + link;
    }

    let voiceChannel = details["VoiceChannel"];
    
    if (!voiceChannel)
    {
        if (!details.Guild) return;
        voiceChannel = details.Guild.members.find(m =>m.id == bot.user.id).voiceChannel;
        if (!voiceChannel) return;
      
        details["VoiceChannel"] = voiceChannel;
    }
  
    let connection = voiceChannel.connection;

    let options = {
        seek: 0,
        passes: 2,
        volume: 0.5
    };
    let dispatcher = connection.playStream(youtube(url,
    {
        audioonly: true
    }), options);

    details["Playing"] = true;

    dispatcher.on('end', (reason) =>
    {
        details["Playing"] = false;
      
        if (details["Loop"] == true)
        {
            let lLink = details[4][0][0];

            details = exports.playFromYoutubeURL(details, lLink);
            return;
        }
      

        if (details["Queue"].length <= 1)
        {
            details["Queue"] = [];
            return;
        }

        details["Queue"].shift();
        let newLink = details["Queue"][0][0];

        details = exports.playFromYoutubeURL(details, newLink);
    });

    dispatcher.on('error', e =>
    {
        console.error(e);
    });

    return details;
}