const Command = require("../../base/Command.js");
const request = require('request');

class ySearch extends Command {
    constructor(client) {
        super(client, {
            name: "יוטיוב",
            description: "מחפש לך סרטון ביוטיוב",
            usage: "יוטיוב",
            category: "שימושי",
            aliases: []
        });
    }

    async run(message, args, level) {
        let msg = message.toString();
        let position = msg.search("יוטיוב");
        let searchString = msg.substring(position + 7, msg.length);
        if (searchString == "") {
            message.channel.send("תחפש את זה אתה אחי");
        }
        else {
            let url = "https://www.googleapis.com/youtube/v3/search?key=AIzaSyAOC4ag2OfYOoybYzjozLYXlcWIcSKTCDM&q=" + encodeURI(searchString);
            let settings = {
                "url": url,
                "method": "GET",
                "encoding": null
            }
            request.get(settings, function (error, response, data) {
                let result = JSON.parse(data);
                searchString = searchString.replace(/ /g, "+");
                if (result.items != undefined && result.items.length > 0) {
                    let count = 0;
                    while (result.items[count].id.kind != "youtube#video" && count < result.items.length) {
                        count++;
                    }
                    if (count > result.items.length) {
                        message.channel.send(`וואלה לא הצלחתי למצוא כלום, נסה לבדוק פה: https://www.youtube.com/results?search_query=${searchString}`);
                    }
                    else {
                        message.channel.send("https://www.youtube.com/watch?v=" + result.items[count].id.videoId);
                        message.channel.send(`לעוד תוצאות אתה יכול להיכנס ל: https://www.youtube.com/results?search_query=${searchString}`);
                    }
                }
                else {
                    message.channel.send(`וואלה לא הצלחתי למצוא כלום, נסה לבדוק פה: https://www.youtube.com/results?search_query=${searchString}`);
                }
            });
        }
    }
}

module.exports = ySearch;
