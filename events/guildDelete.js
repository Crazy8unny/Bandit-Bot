// This event executes when a new guild (server) is left.

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {
    // Well they're gone. Let's remove them from the settings and log it!
    this.client.settings.doc(guild.id).delete().then(() => {
      this.client.logger.log(`Left guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
    }).catch((error) => {
      this.client.logger.log(`Error removing guild: ${guild.name} - ${error}`);
    });
  }
};
