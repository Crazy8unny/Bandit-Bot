const Command = require("../../base/Command.js");
const request = require('request');

class Speak extends Command {
    constructor(client) {
        super(client, {
            name: "דבר",
            description: "מדברררררררררררר",
            usage: "דבר",
            category: "שימושי",
            aliases: []
        });
    }

    async run(message, args, level) {
        let msg = message.toString();
        let position = msg.search("דבר");
        let tranlateString = msg.substring(position + 3, msg.length);
        if (tranlateString == "") {
            message.channel.send("מה זה אחי לא כתבת כלום");
        }
        else {
            let settings = {
                "url": "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=" + encodeURI(tranlateString),
                "method": "GET",
                "encoding": null
            }
            request.get(settings, function (error, response, data) {
                let result = JSON.parse(data);
                message.channel.send(result[0][0][0], {tts: true});
            });
        }
    }
}

module.exports = Speak;
