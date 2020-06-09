const ContainsCommand = require("../base/ContainsCommand.js");

class Seemingly extends ContainsCommand {
  constructor(client) {
    super(client, {
      name: "לכאורה",
      description: "אין פה הוצאת דיבה",
      contains: ["לכאורה", "טיפש", "טיפשה", "מטומטם", "מטומטמת", "כלב", "כלבה", "חרא", "קקי", "אידיוט", "אידיוטית", "מפגר"
        , "מפגרת", "סתום", "סתומה", "דביל", "דבילית", "שמן", "שמנה", "מכוער", "מכוערת", "בן זונה", "בת זונה"],
      category: "מילים מוכלות"
    });
  }

  async run(message, args, level) {
    let valid = false;
    let res = "אין פה הוצאת דיבה !";
    let curses = ["טיפש", "טיפשה", "מטומטם", "מטומטמת", "כלב", "כלבה", "חרא", "קקי", "אידיוט", "אידיוטית", "מפגר"
      , "מפגרת", "סתום", "סתומה", "דביל", "דבילית", "שמן", "שמנה", "מכוער", "מכוערת", "בן זונה", "בת זונה"];
    let seemingly = "לכאורה"
    let msg = message.toString();
    let curse = curses.some(substring => msg.includes(substring));
    if (curse) {
      if (msg.includes(seemingly)) {
        valid = true;
        res = "איזה מלך שאמרת לכאורה !"
        message.react("👑");
      } else {
        res = "תגיד לכאורה על זה, אתה חייב להגיד !"
      }
    }

    if (!this.client.settings.has("EitanCurse")) {
      this.client.settings.set("EitanCurse", 0);
    }
    let curseNum = this.client.settings.get("EitanCurse");
    console.log(message.author.id);
    if (message.author.id.toString() == "300332593881153547" && !valid) {
      if (curse) {
        curseNum++;
        this.client.settings.set("EitanCurse", curseNum);
      }
      if (curseNum % 4 == true) {
        this.client.db.collection("Curses").doc("Warnings").get().then(warnings => {
          if (!warnings.exists) {
            warnings = { warnings: [] };
          }
          else {
            warnings = warnings.data().warningsList;
            message.channel.send((warnings[Math.floor(Math.random() * warnings.length - 1)]).toString());
            // message.author.send((warnings[Math.floor(Math.random() * warnings.length - 1)]).toString());
          }
        });
      }
    }
    message.channel.send(res);
  }
}

module.exports = Seemingly;
