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
    message.channel.send(res);
  }
}

module.exports = Seemingly;
