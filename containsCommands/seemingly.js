const ContainsCommand = require("../base/ContainsCommand.js");

class Seemingly extends ContainsCommand {
  constructor (client) {
    super(client, {
      name: "לכאדורה",
      description: "אין פה הוצאת דיבה",
      contains: ["לכאורה"]
    });
  }

  async run (message, args, level) {
    let responses =  [];
    responses.push("אין פה הוצאת דיבה !"); 
    message.channel.send(responses[0]);
  }
}

module.exports = Seemingly;
