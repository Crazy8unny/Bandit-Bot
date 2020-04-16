const ContainsCommand = require("../base/ContainsCommand.js");

class Seemingly extends ContainsCommand {
  constructor (client) {
    super(client, {
      name: "לכאורה",
      description: "אין פה הוצאת דיבה",
      contains: ["לכאורה"]
    });
  }

  async run (message, args, level) {
    let responses =  [];
    responses.push("אין פה הוצאת דיבה !"); 
    message.channel.send(responses.random());
  }
}

module.exports = Seemingly;
