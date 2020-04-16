class ContainsCommand {

    constructor (client, {
      name = null,
      description = "No description provided.",
      contains = new Array(),
      permLevel = "User"
    }) {
      this.client = client;
      this.conf = { permLevel };
      this.help = { name, description };
    }
  }
  module.exports = ContainsCommand;
  