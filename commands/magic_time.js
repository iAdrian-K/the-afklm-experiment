"use strict"
const configUtils = require('../helper_services/config_helper');
const utils = require('../helper_services/utils')


module.exports = {
    name: "magic_time",
    description: "Update the entire config database",
    async execute(message) {
        let guildId = message.guild.id;
        let guildData = await configUtils.loadGuildConfigs(guildId)
        message.channel.send("Hold your breath for a few seconds. I have to search this huge route database. This takes a while!");
        await utils.updateDatabase(guildData['afklm_special'], message, guildData, guildId);
        message.channel.send("Tada!! All done");
    }
}