const Command = require("../../base/Command.js");
const request = require('request');

class iSearch extends Command {
    constructor(client) {
        super(client, {
            name: "תמונה",
            description: "מחפש לך תמונה בגוגלה",
            usage: "תמונה",
            category: "שימושי",
            aliases: ["pic"]
        });
    }

    async run(message, args, level) {
        let msg = message.toString();
        let lastword = args[args.length - 1]
        if ((lastword[0] == '(' || lastword[0] == ')') && (lastword[lastword.length - 1] == '(' || lastword[lastword.length - 1] == ')')) {
            msg = msg.substring(0, msg.length - lastword.length - 1);
            lastword = lastword.substring(1, lastword.length - 1);
        }
        let position = msg.search("תמונה");
        let searchString = msg.substring(position + 6, msg.length);
        if (searchString == "") {
            message.channel.send("תחפש את זה אתה אחי");
        }
        else {
            let url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyAOC4ag2OfYOoybYzjozLYXlcWIcSKTCDM&cx=a25b129b4b9adff27&searchType=image&q=" + encodeURI(searchString);
            let settings = {
                "url": url,
                "method": "GET",
                "encoding": null
            }
            request.get(settings, function (error, response, data) {
                let result = JSON.parse(data);
                if (result.items != undefined) {
                    if (lastword >= "0" && lastword <= "9") {
                        for (let index = 0; (index < Number.parseInt(lastword) && index < result.items.length); index++) {
                            message.channel.send(result.items[index].link);
                        }
                    }
                    else {
                        message.channel.send(result.items[0].link);
                        // searchString = searchString.replace(/ /g, "+");
                        // message.channel.send(`לעוד תוצאות אתה יכול להיכנס ל: https://www.google.co.il/search?tbm=isch&q=${searchString}`);
                    }

                }
                else {
                    searchString = searchString.replace(/ /g, "+");
                    message.channel.send(`וואלה לא הצלחתי למצוא כלום, נסה לבדוק פה: https://www.google.co.il/search?tbm=isch&q=${searchString}`);
                }
            });
        }
    }
}

module.exports = iSearch;
