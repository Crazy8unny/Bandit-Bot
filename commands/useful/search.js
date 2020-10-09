const Command = require("../../base/Command.js");
const request = require('request');

class Search extends Command {
    constructor(client) {
        super(client, {
            name: "חפש",
            description: "מחפש לך דברים בגוגלה",
            usage: "חפש",
            category: "שימושי",
            aliases: []
        });
    }

    async run(message, args, level) {
        let msg = message.toString();
        let position = msg.search("חפש");
        let searchString = msg.substring(position + 4, msg.length);
        if (searchString == "") {
            message.channel.send("תחפש את זה אתה אחי");
        }
        else {
            let url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyAOC4ag2OfYOoybYzjozLYXlcWIcSKTCDM&cx=ff93fdfe771eb4a7e&q=" + encodeURI(searchString);
            let settings = {
                "url": url,
                "method": "GET",
                "encoding": null
            }
            request.get(settings, function (error, response, data) {
                let result = JSON.parse(data);
                if (result.items != undefined) {
                    message.channel.send(result.items[0].link);
                    searchString = searchString.replace(/ /g, "+");
                    message.channel.send(`לעוד תוצאות אתה יכול להיכנס ל: https://www.google.com/search?q=${searchString}`);
                }
                else {
                    searchString = searchString.replace(/ /g, "+");
                    message.channel.send(`וואלה לא הצלחתי למצוא כלום, נסה לבדוק פה: https://www.google.com/search?q=${searchString}`);
                }
            });
        }
    }
}

module.exports = Search;
