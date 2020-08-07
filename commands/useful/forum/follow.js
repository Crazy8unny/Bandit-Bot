const request = require('request');
const JSDOM = require('jsdom').JSDOM;
const iconv = require('iconv-lite');

const Command = require("../../../base/Command.js");

class Follow extends Command {
    constructor(client) {
        super(client, {
            name: "עקוב",
            description: "מעקב אחר נושאים בהתראות של הפורום",
            usage: "עקוב <לינק של נושא> - הוספת נושא למעקב \n הסר מעקב <לינק של נושא> - הוספת נושא למעקב \n רשימת מעקב - מדפיס את כל הנושאים שאתה עוקב אחריהם",
            category: "שימושי",
            aliases: ["הסר", "רשימת"]
        });
    }

    async run(message, args, level) {
        let msg = message.toString();
        console.log(msg);
        let res;
        if (args[0] == null || args[1] != null) {
            message.channel.send("שימוש שגוי בפקודה, שלח `!עזרה עקוב` על מנת לקבל מידע מלא על הפקודה");
        }
        else if (msg.startsWith("!רשימת מעקב")) {
            message.channel.send("אחי אתה עוקב אחרי כל השיט הבא");
        }
        else if (msg.startsWith("!הסר")) {
            message.channel.send("הלינק הוסר בהצלחה משהו");
        }
        else if (msg.startsWith("!עקוב")) {
            if (!args[0].startsWith("https://lf2.co.il/forum/viewtopic.php?t=") || !args[0].startsWith("https://lf2.co.il/forum/viewtopic.php?t=")) {
                message.channel.send("לא יודע מה כתבת פה אחי...");
            }
            else {
                let settings = {
                    "url": args[0],
                    "method": "GET",
                    "encoding": null
                };
                this.client.db.collection("lastThread").doc("RegisteredSubjects").get().then(servers => {
                    // request.get(settings, function (error, response, data) {
                    const jsdom = new JSDOM(iconv.decode(data, 'iso-8859-8'));
                    // const subjectName = jsdom.window.document.getElementsByTagName("tbody")[6].getElementsByTagName("a")[0].textContent
                    const guild = message.guild.id;
                    const author = message.author.id;
                    // console.log("subjectName: " + subjectName);
                    console.log("guild: " + guild);
                    console.log("author: " + author);
                    let res = `הנושא נוסף בהצלחה !!111`
                    if (!servers.exists) {
                        servers = { guild: { author: { args[0]: "subjectname" } } };
                    }
                    else {
                        let server = servers.data()[guild];
                        if (server != undefined) {
                            let userSubjects = server[author];
                            if (userSubjects != undefined) {
                                if (JSON.stringify(userSubjects).includes(args[0])) {
                                    res = "אתה כבר עוקב אחרי הנושא הזה אחינו";
                                }
                            }
                            else {
                                server[author] = {};
                            }
                            servers[author][args[0]] = "subjectname";
                        }
                        else {
                            servers[guild][author][args[0]] = "subjectname";
                        }
                    }
                    message.channel.send(res);
                    // });
                    this.client.db.collection("lastThread").doc("RegisteredSubjects").set(servers);
                });
            }
        }
        else {
            message.channel.send("שימוש שגוי בפקודה, שלח `!עזרה עקוב` על מנת לקבל מידע מלא על הפקודה");
        }
    }
}

module.exports = Follow;
