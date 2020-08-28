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
            this.client.db.collection("lastThread").doc("Servers").get().then(translatedServers => {
                translatedServers = translatedServers.data().test;
                const guild = translatedServers[message.guild.id];
                this.client.db.collection("lastThread").doc("RegisteredSubjects").get().then(servers => {
                    // const guild = message.guild.id;
                    const author = message.author.id;
                    let res = "אתה לא עוקב אחרי כלום פה גבר";
                    if (servers.exists) {
                        let userSubjects = servers.data()[guild][author];
                        if (userSubjects != undefined) {
                            res = "```asciidoc\n= רשימת מעקב = \n"
                            for (let link in userSubjects) {
                                if (link != "random") {
                                    res += `${userSubjects[link]}:: ${link}\n`
                                }
                            }
                            res += "```";
                        }
                    }
                    message.channel.send(res);
                });

            });
        }
        else if (msg.startsWith("!הסר")) {
            this.client.db.collection("lastThread").doc("Servers").get().then(translatedServers => {
                translatedServers = translatedServers.data().test;
                const guild = translatedServers[message.guild.id];
                this.client.db.collection("lastThread").doc("RegisteredSubjects").get().then(servers => {
                    if (args[0].startsWith("http://")) {
                        args[0] = "https://" + args[0].substring(7, msg.length);
                    }
                    else {
                        const author = message.author.id;
                        let res = "אתה לא עוקב אחרי הנושא הזה";
                        if (servers.exists) {
                            servers = servers.data();
                            let userSubjects = servers[guild][author];
                            if (userSubjects != undefined) {
                                for (let link in userSubjects) {
                                    if (link != "random") {
                                        if (link == args[0] || userSubjects[link] == args[0]) {
                                            res = "הנושא  `" + userSubjects[link] + "` נמחק בהצלחה לא נחפור לך יותר";
                                            this.client.db.collection("lastThread").doc("RegisteredSubjects").set(servers);
                                            delete servers[guild][author][link];
                                        }
                                    }
                                }
                            }
                        }
                        message.channel.send(res);
                    }
                });
            });
        }
        else if (msg.startsWith("!עקוב")) {
            if (args[0].startsWith("http://")) {
                args[0] = "https://" + args[0].substring(7, msg.length);
            }
            if (!args[0].startsWith("https://lf2.co.il/forum/viewtopic.php?t=")) {
                message.channel.send("לא יודע מה כתבת פה אחי...");
            }
            else {
                let settings = {
                    "url": args[0],
                    "method": "GET",
                    "encoding": null
                };
                this.client.db.collection("lastThread").doc("Servers").get().then(translatedServers => {
                    translatedServers = translatedServers.data().test;
                    const guild = translatedServers[message.guild.id];
                    this.client.db.collection("lastThread").doc("RegisteredSubjects").get().then(servers => {
                        return new Promise(resolve => {
                            request.get(settings, function (error, response, data) {
                                let res = `הנושא נוסף בהצלחה !!111`
                                const jsdom = new JSDOM(iconv.decode(data, 'iso-8859-8'));
                                const subjectName = jsdom.window.document.getElementsByTagName("tbody")[6].getElementsByTagName("a")[0].textContent
                                if (subjectName == "לחזרה לפורום לחצו כאן.") {
                                    message.channel.send("מה זה הנושא הזה");
                                    if (!servers.exists) {
                                        servers = { [guild]: { [author]: {} } };
                                    }
                                    else {
                                        servers = servers.data();
                                    }
                                    resolve(servers);
                                }
                                else {
                                    const author = message.author.id;
                                    console.log("subjectName: " + subjectName);
                                    const link = args[0];
                                    console.log("guild: " + guild);
                                    console.log("author: " + author);
                                    if (!servers.exists) {
                                        servers = { [guild]: { [author]: { [link]: [subjectName] } } };
                                    }
                                    else {
                                        servers = servers.data();
                                        let server = servers[guild];
                                        if (server != undefined) {
                                            let userSubjects = server[author];
                                            if (userSubjects != undefined) {
                                                if (JSON.stringify(userSubjects).includes(link)) {
                                                    res = "אתה כבר עוקב אחרי הנושא הזה אחינו";
                                                }
                                            }
                                            else {
                                                servers[guild][author] = {};
                                            }
                                            servers[guild][author][link] = subjectName;
                                        }
                                        else {
                                            servers[guild] = {};
                                            servers[guild][author] = {};
                                            servers[guild][author][link] = subjectName;
                                        }
                                    }
                                    message.channel.send(res);
                                    resolve(servers);
                                }
                            })
                        }).then(servers => {
                            this.client.db.collection("lastThread").doc("RegisteredSubjects").set(servers);
                        });
                    });
                });
            }
        }
        else {
            message.channel.send("שימוש שגוי בפקודה, שלח `!עזרה עקוב` על מנת לקבל מידע מלא על הפקודה");
        }
    }
}

module.exports = Follow;
