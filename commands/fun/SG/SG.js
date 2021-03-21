const Command = require("../../../base/Command.js");
const request = require('request');
const JSDOM = require('jsdom').JSDOM;

class SG extends Command {
    constructor(client) {
        super(client, {
            name: "סטארגייט",
            description: "מביא את הלינק של סטארגייט בסדרות",
            usage: "סטארגייט",
            category: "פנאי",
            aliases: []
        });
    }

    async run(message, args, level) {
        let res = "https://www.sdarot.today/watch/92-stargate-sg-1-%D7%A1%D7%98%D7%90%D7%A8%D7%92%D7%99%D7%99%D7%98-%D7%90%D7%A1-%D7%92%D7%99-1";
        let popcorn = false;
        const server = this.client.SG.doc(message.guild.id);
        server.get().then(lastEpisode => {
            if (!lastEpisode.exists) {
                lastEpisode = { url: "וואלה לא יודע אח שלי"};
            }
            else {
                lastEpisode = lastEpisode.data();
            }

            if (args[0] == null) {
            }
            else if (args[0] == "הקודם" && args[1] == null) {
                let episodes = lastEpisode.url.split('-');
                res = `אתם בעונה ${episodes[0]} פרק ${episodes[1]}`
            }
            else if (args[0] == "הבא" && args[1] == null) {
                let episodes = lastEpisode.url.split('-');
                let url = `https://www.imdb.com/title/tt0118480/episodes?season=${episodes[0]}&ref_=tt_eps_sn_${episodes[0]}`;
                let settings = {
                  "url": url,
                  "method": "GET"
                }
                request.get(settings, function (error, response, data) {
                    const jsdom = new JSDOM(data);
                    let episode =  jsdom.window.document.getElementsByClassName("list_item")[episodes[1]];                    
                    let embed = {
                        color: "#1E2023",
                        thumbnail: {
                          url: episode.getElementsByTagName("img")[0].src,
                        }
                      };
                    embed.title = episode.getElementsByTagName("img")[0].alt;
                    embed.description = episode.getElementsByClassName("item_description")[0].textContent;
                    message.channel.send( { embed });
                });
            }
            else if (args[1] != '-' || args[3] != null) {
                res = "שימוש שגוי בפקודה, שלח ללא פרמטרים או עם <עונה> - <פרק>";
            }
            else if (parseInt(args[0]).toString() == 'NaN' || parseInt(args[2]).toString() == 'NaN') {
                res = "אורי מה זה השטויות האלה ששמת פה"
            }
            else {
                res += "-stargate-sg-1/season/" + args[0] + "/episode/" + args[2];
                popcorn = true;
                lastEpisode.url = `${args[0]}-${args[2]}`;
                server.set(lastEpisode);
            }
            if (args[0] != "הבא") {
                message.channel.send(res.toString());
            }
            if (popcorn) {
                message.channel.send("לא לשכוח incognito אחי");
                message.channel.send("צפייה נעימה ! 🍿");
            }
        });
    }
}

module.exports = SG;
