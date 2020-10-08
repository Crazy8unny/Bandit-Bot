const Command = require("../../base/Command.js");
const request = require('request');
const GSR = require('google-search-results-nodejs');
const client = new GSR.GoogleSearchResults("secret_api_key");

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
        let searchString = msg.substring(position + 3, msg.length);
        if (searchString == "") {
            message.channel.send("תחפש את זה אתה אחי");
        }
        else {
            url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyAOC4ag2OfYOoybYzjozLYXlcWIcSKTCDM&cx=ff93fdfe771eb4a7e&q=" + searchString;
            let settings = {
                "url": url,
                "method": "GET",
                "encoding": null
            }
            request.get(settings, function (error, response, data) {
                let result = JSON.parse(data);
                message.channel.send(result.items[0].formattedUrl);
                message.channel.send(`לעוד תוצאות אתה יכול להיכנס ל: https://www.google.com/search?q=${searchString}`);
            });
        }
}

module.exports = Search;
