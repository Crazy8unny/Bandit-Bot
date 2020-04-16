class ContainsCommand {

    constructor (client, {
      name = null,
      description = "No description provided.",
      contains = new Array(),
      permLevel = "User"
    }) {
      this.client = client;
      this.conf = { permLevel, contains };
      this.help = { name, description };
    }
  }
  module.exports = ContainsCommand;
  