const ContainsCommand = require("../base/ContainsCommand.js");

class Seemingly extends ContainsCommand {
  constructor (client) {
    super(client, {
      name: "לכאורה",
      description: "אין פה הוצאת דיבה",
      contains: ["לכאורה", "טיפש", "טיפשה", "מטומטם", "מטומטמת", "כלב", "כלבה", "חרא", "קקי", "אידיוט", "אידיוטית", "מפגר"
                , "מפגרת", "סתום", "סתומה", "דביל", "דבילית", "שמן", "שמנה", "מכוער", "מכוערת", "בן זונה", "בת זונה"],
      category: "מילים מוכלות"
    });
  }

  async run (message, args, level) {
    let res = "אין פה הוצאת דיבה !";
    let curses = ["טיפש", "טיפשה", "מטומטם", "מטומטמת", "כלב", "כלבה", "חרא", "קקי", "אידיוט", "אידיוטית", "מפגר"
    , "מפגרת", "סתום", "סתומה", "דביל", "דבילית", "שמן", "שמנה", "מכוער", "מכוערת", "בן זונה", "בת זונה"];
    let seemingly = "לכאורה"
    let msg = message.toString();
    let curse = curses.some(substring=>msg.includes(substring));
    if (curse) {
        if (msg.includes(seemingly)) {
            res = "איזה מלך שאמרת לכאורה !"
            message.react("👑");
        } else {
            res = "תגיד לכאורה על זה, אתה חייב להגיד !"
        }
    }

    if (!this.client.settings.has("EitanCurse")) {
      this.client.lastThread.set("EitanCurse", 0);
    }
    let curseNum = this.client.settings.get("EitanCurse");
    if (message.author.id == "300324644932681728") {
      this.client.lastThread.set("EitanCurse", curseNum++);
    }
    if (this.client.settings.has("EitanCurse") % 4 == true) {
      let PM = "";
      let num = Math.floor(Math.random() * 4 + 1);
      if (num == 4) {
        PM = "איתן כדאי לך להיזהר ממני י'חצוף, למה אני שמתי את העין שלי עליך";
      }
      else if (num == 3) {
        PM = "לא יודע מי חינך אותך איתן, אבל כדאי שתשמור על הפה שלך";
      }
      else if (num == 2) {
        PM = "פעם הבאה אני לא אעבור על זה בשתיקה.";
      }
      else {
        PM = "אני מקווה לטובתך שהיה לך סיבה טובה להגיד את זה";
      }
      message.author.send(PM);
    }
    message.channel.send(res);
  }
}

module.exports = Seemingly;
