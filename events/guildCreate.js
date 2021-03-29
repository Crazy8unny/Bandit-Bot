// This event executes when a new guild (server) is joined.

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (guild) {

    this.client.user.setActivity(`LF2 | עזרה${(await this.client.settings.doc("default").get()).data().prefix}`);
    this.client.logger.log(`New guild has been joined: ${guild.name} (${guild.id}) with ${guild.memberCount - 1} members`);
  }
};
